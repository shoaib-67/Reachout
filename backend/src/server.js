import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "./db.js";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 4000);
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";
const JWT_SECRET = process.env.JWT_SECRET || "reachout_dev_secret";

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
  const { name, email, password } = req.body || {};

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Name, email, and password are required." });
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
    const [result] = await pool.query("INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)", [
      String(name).trim(),
      cleanEmail,
      passwordHash
    ]);

    return res.status(201).json({
      message: "Registration successful.",
      user: {
        id: result.insertId,
        name: String(name).trim(),
        email: cleanEmail
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
    const [rows] = await pool.query("SELECT id, name, email, password_hash FROM users WHERE email = ? LIMIT 1", [cleanEmail]);
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
        email: user.email
      }
    });
  } catch (error) {
    console.error("Login error", error);
    return res.status(500).json({ message: "Server error while logging in." });
  }
});

app.use((req, res) => {
  res.status(404).json({ message: "Route not found." });
});

async function start() {
  try {
    await ensureAuthSchema();
    app.listen(PORT, () => {
      console.log(`ReachOut backend running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start backend:", error);
    process.exit(1);
  }
}

start();
