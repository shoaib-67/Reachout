import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool, { ensureDatabase } from "./db.js";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 4000);
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";
const JWT_SECRET = process.env.JWT_SECRET || "reachout_dev_secret";
const DAY_OPTIONS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const allowedOrigins = new Set(
  CLIENT_ORIGIN.split(",")
    .map((item) => item.trim())
    .filter(Boolean)
);
allowedOrigins.add("http://localhost:5173");
allowedOrigins.add("http://127.0.0.1:5173");

app.use(
  cors({
    origin(origin, callback) {
      const isLoopbackOrigin = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin || "");
      const isPrivateLanOrigin =
        /^https?:\/\/(192\.168\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3})(:\d+)?$/i.test(
          origin || ""
        );

      if (!origin || origin === "null" || allowedOrigins.has(origin) || isLoopbackOrigin || isPrivateLanOrigin) {
        return callback(null, true);
      }
      return callback(new Error(`CORS blocked for origin: ${origin}`));
    }
  })
);
app.use(express.json());

async function ensureAuthSchema() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(120) NOT NULL,
      email VARCHAR(190) NOT NULL UNIQUE,
      phone VARCHAR(40) NULL,
      password_hash VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  const [columns] = await pool.query("SHOW COLUMNS FROM users");
  const hasEmail = columns.some((column) => column.Field === "email");
  const hasPhone = columns.some((column) => column.Field === "phone");

  if (!hasEmail) {
    await pool.query("ALTER TABLE users ADD COLUMN email VARCHAR(190) NULL AFTER name");
    await pool.query("ALTER TABLE users ADD UNIQUE INDEX uq_users_email (email)");
  }

  if (!hasPhone) {
    await pool.query("ALTER TABLE users ADD COLUMN phone VARCHAR(40) NULL AFTER email");
  }

  if (hasPhone) {
    const [phoneRow] = await pool.query("SHOW COLUMNS FROM users LIKE 'phone'");
    if (phoneRow[0]?.Null === "NO") {
      await pool.query("ALTER TABLE users MODIFY phone VARCHAR(40) NULL");
    }
  }
}

async function ensureBloodSchema() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS blood_donors (
      id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      donor_code VARCHAR(30) NOT NULL UNIQUE,
      account_email VARCHAR(190) NULL,
      name VARCHAR(120) NOT NULL,
      phone VARCHAR(40) NULL,
      blood_group VARCHAR(10) NOT NULL,
      area VARCHAR(120) NOT NULL,
      schedule_days JSON NOT NULL,
      available_from VARCHAR(5) NOT NULL,
      available_to VARCHAR(5) NOT NULL,
      donation_history JSON NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  const [donorColumns] = await pool.query("SHOW COLUMNS FROM blood_donors");
  const hasAccountEmail = donorColumns.some((column) => column.Field === "account_email");
  const hasDonorPhone = donorColumns.some((column) => column.Field === "phone");
  if (!hasAccountEmail) {
    await pool.query("ALTER TABLE blood_donors ADD COLUMN account_email VARCHAR(190) NULL AFTER donor_code");
  }
  if (!hasDonorPhone) {
    await pool.query("ALTER TABLE blood_donors ADD COLUMN phone VARCHAR(40) NULL AFTER name");
  }

  await pool.query(`
    CREATE TABLE IF NOT EXISTS blood_requests (
      id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      request_code VARCHAR(30) NOT NULL UNIQUE,
      posted_by_name VARCHAR(120) NULL,
      posted_by_email VARCHAR(190) NULL,
      posted_by_phone VARCHAR(40) NULL,
      patient VARCHAR(120) NOT NULL,
      contact_phone VARCHAR(40) NULL,
      blood_group VARCHAR(10) NOT NULL,
      hospital VARCHAR(190) NOT NULL,
      urgency VARCHAR(20) NOT NULL,
      location VARCHAR(120) NOT NULL,
      status VARCHAR(20) NOT NULL,
      donor_response VARCHAR(20) NOT NULL,
      created_at DATETIME NOT NULL,
      expires_at DATETIME NOT NULL,
      accepted_by VARCHAR(120) NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  const [requestColumns] = await pool.query("SHOW COLUMNS FROM blood_requests");
  const hasPostedByName = requestColumns.some((column) => column.Field === "posted_by_name");
  const hasPostedByEmail = requestColumns.some((column) => column.Field === "posted_by_email");
  const hasPostedByPhone = requestColumns.some((column) => column.Field === "posted_by_phone");
  const hasContactPhone = requestColumns.some((column) => column.Field === "contact_phone");
  if (!hasPostedByName) {
    await pool.query("ALTER TABLE blood_requests ADD COLUMN posted_by_name VARCHAR(120) NULL AFTER request_code");
  }
  if (!hasPostedByEmail) {
    await pool.query("ALTER TABLE blood_requests ADD COLUMN posted_by_email VARCHAR(190) NULL AFTER posted_by_name");
  }
  if (!hasPostedByPhone) {
    await pool.query("ALTER TABLE blood_requests ADD COLUMN posted_by_phone VARCHAR(40) NULL AFTER posted_by_email");
  }
  if (!hasContactPhone) {
    await pool.query("ALTER TABLE blood_requests ADD COLUMN contact_phone VARCHAR(40) NULL AFTER patient");
  }
}

function parseJsonArray(rawValue, fallback = []) {
  try {
    const value = typeof rawValue === "string" ? JSON.parse(rawValue) : rawValue;
    return Array.isArray(value) ? value : fallback;
  } catch {
    return fallback;
  }
}

function toDonorDto(row) {
  return {
    id: row.donor_code,
    accountEmail: row.account_email,
    name: row.name,
    phone: row.phone,
    bloodGroup: row.blood_group,
    area: row.area,
    scheduleDays: parseJsonArray(row.schedule_days, ["Sun"]),
    availableFrom: row.available_from,
    availableTo: row.available_to,
    donationHistory: parseJsonArray(row.donation_history, [])
  };
}

function toRequestDto(row) {
  return {
    id: row.request_code,
    postedByName: row.posted_by_name,
    postedByEmail: row.posted_by_email,
    postedByPhone: row.posted_by_phone,
    patient: row.patient,
    contactPhone: row.contact_phone,
    bloodGroup: row.blood_group,
    hospital: row.hospital,
    urgency: row.urgency,
    location: row.location,
    status: row.status,
    donorResponse: row.donor_response,
    createdAt: new Date(row.created_at).toISOString(),
    expiresAt: new Date(row.expires_at).toISOString(),
    acceptedBy: row.accepted_by
  };
}

async function refreshExpiredRequests() {
  await pool.query(
    `UPDATE blood_requests
     SET status = 'Expired'
     WHERE status = 'Open' AND donor_response = 'Pending' AND expires_at < NOW()`
  );
}

app.get("/api/health", (req, res) => {
  res.json({ ok: true, service: "reachout-backend" });
});

app.get("/api/auth/me", async (req, res) => {
  const authorization = req.headers.authorization || "";
  const token = authorization.startsWith("Bearer ") ? authorization.slice(7).trim() : "";

  if (!token) {
    return res.status(401).json({ message: "Authentication token is required." });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const [rows] = await pool.query("SELECT id, name, email, phone, created_at FROM users WHERE id = ? LIMIT 1", [payload.userId]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found." });
    }
    return res.json({ user: rows[0] });
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
});

app.post("/api/auth/register", async (req, res) => {
  const { name, email, phone, password } = req.body || {};

  if (!name || !email || !phone || !password) {
    return res.status(400).json({ message: "Name, email, phone, and password are required." });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters." });
  }

  const cleanEmail = String(email).trim().toLowerCase();

  try {
    const [rows] = await pool.query("SELECT id FROM users WHERE email = ? LIMIT 1", [cleanEmail]);
    if (rows.length > 0) {
      return res.status(409).json({ message: "Email is already registered." });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const [result] = await pool.query("INSERT INTO users (name, email, phone, password_hash) VALUES (?, ?, ?, ?)", [
      String(name).trim(),
      cleanEmail,
      String(phone).trim(),
      passwordHash
    ]);

    return res.status(201).json({
      message: "Registration successful.",
      user: {
        id: result.insertId,
        name: String(name).trim(),
        email: cleanEmail,
        phone: String(phone).trim()
      }
    });
  } catch (error) {
    console.error("Register error", error);
    return res.status(500).json({ message: "Server error while registering user." });
  }
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  const cleanEmail = String(email).trim().toLowerCase();

  try {
    const [rows] = await pool.query("SELECT id, name, email, phone, password_hash FROM users WHERE email = ? LIMIT 1", [cleanEmail]);
    if (rows.length === 0) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const user = rows[0];
    const passwordValid = await bcrypt.compare(password, user.password_hash);
    if (!passwordValid) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });

    return res.json({
      message: "Login successful.",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone
      }
    });
  } catch (error) {
    console.error("Login error", error);
    return res.status(500).json({ message: "Server error while logging in." });
  }
});

app.get("/api/blood/donors", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT donor_code, account_email, name, phone, blood_group, area, schedule_days, available_from, available_to, donation_history FROM blood_donors ORDER BY id DESC"
    );
    return res.json({ donors: rows.map(toDonorDto) });
  } catch (error) {
    console.error("List donors error", error);
    return res.status(500).json({ message: "Server error while loading donors." });
  }
});

app.post("/api/blood/donors", async (req, res) => {
  const { name, phone, bloodGroup, area, scheduleDays, availableFrom, availableTo, accountEmail } = req.body || {};
  if (!name || !bloodGroup || !area || !availableFrom || !availableTo) {
    return res.status(400).json({ message: "Name, blood group, area, and availability are required." });
  }

  const cleanDays = Array.isArray(scheduleDays) ? scheduleDays.filter((day) => DAY_OPTIONS.includes(day)) : [];
  const safeDays = cleanDays.length > 0 ? cleanDays : ["Sun"];

  try {
    const cleanAccountEmail = accountEmail ? String(accountEmail).trim().toLowerCase() : null;
    if (cleanAccountEmail) {
      const [accountDupe] = await pool.query(
        "SELECT donor_code FROM blood_donors WHERE account_email = ? LIMIT 1",
        [cleanAccountEmail]
      );
      if (accountDupe.length > 0) {
        return res.status(409).json({ message: "This account is already registered as a donor." });
      }
    }

    const [dupe] = await pool.query(
      "SELECT donor_code FROM blood_donors WHERE LOWER(name) = LOWER(?) AND blood_group = ? AND LOWER(area) = LOWER(?) LIMIT 1",
      [String(name).trim(), String(bloodGroup).trim(), String(area).trim()]
    );
    if (dupe.length > 0) {
      return res.status(409).json({ message: "Duplicate donor detected (same name, blood group, and area)." });
    }

    const [maxRows] = await pool.query("SELECT COALESCE(MAX(id), 0) AS maxId FROM blood_donors");
    const donorCode = `BD-${200 + Number(maxRows[0]?.maxId || 0) + 1}`;

    await pool.query(
      `INSERT INTO blood_donors
       (donor_code, account_email, name, phone, blood_group, area, schedule_days, available_from, available_to, donation_history)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        donorCode,
        cleanAccountEmail,
        String(name).trim(),
        phone ? String(phone).trim() : null,
        String(bloodGroup).trim(),
        String(area).trim(),
        JSON.stringify(safeDays),
        String(availableFrom).trim(),
        String(availableTo).trim(),
        JSON.stringify([])
      ]
    );

    const [rows] = await pool.query(
      "SELECT donor_code, account_email, name, phone, blood_group, area, schedule_days, available_from, available_to, donation_history FROM blood_donors WHERE donor_code = ? LIMIT 1",
      [donorCode]
    );
    return res.status(201).json({ donor: toDonorDto(rows[0]) });
  } catch (error) {
    console.error("Create donor error", error);
    return res.status(500).json({ message: "Server error while saving donor." });
  }
});

app.get("/api/blood/requests", async (req, res) => {
  try {
    await refreshExpiredRequests();
    const [rows] = await pool.query(
      `SELECT request_code, patient, contact_phone, blood_group, hospital, urgency, location, status, donor_response, created_at, expires_at, accepted_by
       , posted_by_name, posted_by_email, posted_by_phone
       FROM blood_requests ORDER BY id DESC`
    );
    return res.json({ requests: rows.map(toRequestDto) });
  } catch (error) {
    console.error("List requests error", error);
    return res.status(500).json({ message: "Server error while loading requests." });
  }
});

app.post("/api/blood/requests", async (req, res) => {
  const { patient, contactPhone, bloodGroup, hospital, urgency, location, postedByName, postedByEmail, postedByPhone } = req.body || {};
  if (!patient || !bloodGroup || !hospital || !urgency || !location) {
    return res.status(400).json({ message: "Patient, blood group, hospital, urgency, and location are required." });
  }

  try {
    const [maxRows] = await pool.query("SELECT COALESCE(MAX(id), 0) AS maxId FROM blood_requests");
    const requestCode = `REQ-${700 + Number(maxRows[0]?.maxId || 0) + 1}`;
    const createdAt = new Date();
    const expiresAt = new Date(createdAt.getTime() + 48 * 60 * 60 * 1000);

    await pool.query(
      `INSERT INTO blood_requests
       (request_code, posted_by_name, posted_by_email, posted_by_phone, patient, contact_phone, blood_group, hospital, urgency, location, status, donor_response, created_at, expires_at, accepted_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Open', 'Pending', ?, ?, NULL)`,
      [
        requestCode,
        postedByName ? String(postedByName).trim() : null,
        postedByEmail ? String(postedByEmail).trim().toLowerCase() : null,
        postedByPhone ? String(postedByPhone).trim() : null,
        String(patient).trim(),
        contactPhone ? String(contactPhone).trim() : null,
        String(bloodGroup).trim(),
        String(hospital).trim(),
        String(urgency).trim(),
        String(location).trim(),
        createdAt,
        expiresAt
      ]
    );

    const [rows] = await pool.query(
      `SELECT request_code, patient, contact_phone, blood_group, hospital, urgency, location, status, donor_response, created_at, expires_at, accepted_by
       , posted_by_name, posted_by_email, posted_by_phone
       FROM blood_requests WHERE request_code = ? LIMIT 1`,
      [requestCode]
    );
    return res.status(201).json({ request: toRequestDto(rows[0]) });
  } catch (error) {
    console.error("Create request error", error);
    return res.status(500).json({ message: "Server error while creating request." });
  }
});

app.patch("/api/blood/requests/:requestId/donor-response", async (req, res) => {
  const { requestId } = req.params;
  const { action, donorId, donorName } = req.body || {};
  if (!requestId || !action || !donorId || !donorName) {
    return res.status(400).json({ message: "Request id, action, donor id, and donor name are required." });
  }
  if (!["accept", "decline"].includes(action)) {
    return res.status(400).json({ message: "Invalid donor action." });
  }

  try {
    const [reqRows] = await pool.query(
      "SELECT id, status, donor_response FROM blood_requests WHERE request_code = ? LIMIT 1",
      [requestId]
    );
    if (reqRows.length === 0) {
      return res.status(404).json({ message: "Request not found." });
    }
    const current = reqRows[0];
    if (current.status !== "Open") {
      return res.status(400).json({ message: "Only open requests can be updated by donor action." });
    }

    if (action === "accept") {
      await pool.query(
        "UPDATE blood_requests SET donor_response = 'Accepted', accepted_by = ?, status = 'Accepted' WHERE request_code = ?",
        [String(donorName).trim(), requestId]
      );
      const donatedOn = new Date().toISOString().slice(0, 10);
      const [donorRows] = await pool.query("SELECT donation_history FROM blood_donors WHERE donor_code = ? LIMIT 1", [donorId]);
      if (donorRows.length > 0) {
        const history = parseJsonArray(donorRows[0].donation_history, []);
        await pool.query("UPDATE blood_donors SET donation_history = ? WHERE donor_code = ?", [
          JSON.stringify([donatedOn, ...history]),
          donorId
        ]);
      }
    } else {
      await pool.query(
        "UPDATE blood_requests SET donor_response = 'Declined', accepted_by = NULL, status = 'Open' WHERE request_code = ?",
        [requestId]
      );
    }

    const [rows] = await pool.query(
      `SELECT request_code, patient, contact_phone, blood_group, hospital, urgency, location, status, donor_response, created_at, expires_at, accepted_by, posted_by_name, posted_by_email, posted_by_phone
       FROM blood_requests WHERE request_code = ? LIMIT 1`,
      [requestId]
    );
    return res.json({ request: toRequestDto(rows[0]) });
  } catch (error) {
    console.error("Donor response error", error);
    return res.status(500).json({ message: "Server error while updating donor response." });
  }
});

app.patch("/api/blood/requests/:requestId/status", async (req, res) => {
  const { requestId } = req.params;
  const { status } = req.body || {};
  if (!requestId || !status) {
    return res.status(400).json({ message: "Request id and status are required." });
  }
  if (!["Completed", "Cancelled"].includes(status)) {
    return res.status(400).json({ message: "Invalid status transition." });
  }

  try {
    const [result] = await pool.query(
      "UPDATE blood_requests SET status = ? WHERE request_code = ? AND (status = 'Open' OR status = 'Accepted')",
      [status, requestId]
    );
    if (result.affectedRows === 0) {
      return res.status(400).json({ message: "Request cannot be updated from current status." });
    }

    const [rows] = await pool.query(
      `SELECT request_code, patient, contact_phone, blood_group, hospital, urgency, location, status, donor_response, created_at, expires_at, accepted_by, posted_by_name, posted_by_email, posted_by_phone
       FROM blood_requests WHERE request_code = ? LIMIT 1`,
      [requestId]
    );
    return res.json({ request: toRequestDto(rows[0]) });
  } catch (error) {
    console.error("Request status update error", error);
    return res.status(500).json({ message: "Server error while updating request status." });
  }
});

app.use((req, res) => {
  res.status(404).json({ message: "Route not found." });
});

async function start() {
  try {
    await ensureDatabase();
    await ensureAuthSchema();
    await ensureBloodSchema();
    app.listen(PORT, () => {
      console.log(`ReachOut backend running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start backend:", error);
    process.exit(1);
  }
}

start();
