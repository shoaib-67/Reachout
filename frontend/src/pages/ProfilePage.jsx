import React, { useEffect, useState } from "react";
import { getMyProfile } from "../services/authApi";
import InfoNote from "../components/blood/InfoNote";
import { areaOptions, bloodGroupOptions, dayOptions, normalizeText, toMinutes } from "./bloodDonationUtils";
import { createBloodDonor, listBloodDonors } from "../services/bloodApi";

function ProfilePage({ navigate, currentUser, onLogout }) {
  const [profile, setProfile] = useState(currentUser || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [donorRegistered, setDonorRegistered] = useState(false);
  const [donorFormError, setDonorFormError] = useState("");
  const [donorFormSuccess, setDonorFormSuccess] = useState("");

  useEffect(() => {
    const token = sessionStorage.getItem("reachout_token") || localStorage.getItem("reachout_token");
    if (!token) {
      setLoading(false);
      setError("You need to log in first.");
      return;
    }

    let active = true;
    getMyProfile(token)
      .then((data) => {
        if (!active) return;
        setProfile(data.user || null);
        setError("");
      })
      .catch((err) => {
        if (!active) return;
        setError(err.message || "Could not load profile.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    async function checkDonorRegistration() {
      const email = profile?.email ? String(profile.email).trim().toLowerCase() : "";
      if (!email) return;
      try {
        const response = await listBloodDonors();
        const donors = response?.donors || [];
        const exists = donors.some((donor) => (donor.accountEmail || "").toLowerCase() === email);
        setDonorRegistered(exists);
      } catch {
        // Keep profile usable even if donor list fails
      }
    }

    checkDonorRegistration();
  }, [profile?.email]);

  async function handleDonorRegistration(event) {
    event.preventDefault();
    const form = event.currentTarget;
    setDonorFormError("");
    setDonorFormSuccess("");

    const data = new FormData(form);
    const areaRaw = (data.get("area") || "").toString();
    const area = areaOptions.find((item) => normalizeText(item) === normalizeText(areaRaw)) || null;
    const availableFrom = (data.get("availableFrom") || "09:00").toString();
    const availableTo = (data.get("availableTo") || "17:00").toString();
    const name = (data.get("name") || "").toString().trim();
    const phone = (data.get("phone") || "").toString().trim();
    const bloodGroup = (data.get("bloodGroup") || "Unknown").toString();
    const email = profile?.email ? String(profile.email).trim().toLowerCase() : "";

    if (!email) {
      setDonorFormError("Profile email not found. Please log in again.");
      return;
    }
    if (!area) {
      setDonorFormError(`Area must be one of: ${areaOptions.join(", ")}.`);
      return;
    }
    if (toMinutes(availableFrom) >= toMinutes(availableTo)) {
      setDonorFormError("Availability time is invalid. 'From' must be earlier than 'To'.");
      return;
    }

    try {
      await createBloodDonor({
        name: name || profile?.name || "Unnamed donor",
        phone: phone || profile?.phone || "",
        bloodGroup,
        area,
        scheduleDays: dayOptions.filter((day) => data.getAll("scheduleDays").includes(day)),
        availableFrom,
        availableTo,
        accountEmail: email
      });
      localStorage.setItem(`reachout_blood_registered_${email}`, "1");
      setDonorRegistered(true);
      setDonorFormSuccess("Donor registration completed successfully.");
      form.reset();
    } catch (err) {
      setDonorFormError(err.message || "Server error while saving donor.");
    }
  }

  const joinedDate = profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : "N/A";

  return (
    <main className="auth-page">
      <section className="container auth-wrap">
        <article className="auth-card profile-card">
          <p className="mini">Account</p>
          <h1>My Profile</h1>

          {loading ? <p className="auth-subtext">Loading profile...</p> : null}
          {!loading && error ? <p className="auth-message error">{error}</p> : null}

          {!loading && profile ? (
            <div className="profile-details">
              <p>
                <strong>Name:</strong> {profile.name || "N/A"}
              </p>
              <p>
                <strong>Email:</strong> {profile.email || "N/A"}
              </p>
              <p>
                <strong>Phone:</strong> {profile.phone || "Not added"}
              </p>
              <p>
                <strong>Joined:</strong> {joinedDate}
              </p>
            </div>
          ) : null}

          {!loading && profile ? (
            <div className="profile-details" style={{ marginTop: 14 }}>
              <p>
                <strong>Blood Donor Registration:</strong> {donorRegistered ? "Completed" : "Not registered"}
              </p>
            </div>
          ) : null}

          {!loading && profile && !donorRegistered ? (
            <form className="blood-panel" onSubmit={handleDonorRegistration} style={{ marginTop: 14 }}>
              <p className="mini">Donor registration</p>
              <h2>Register as blood donor</h2>
              <div className="blood-form-grid">
                <label>
                  <span>Name</span>
                  <input name="name" defaultValue={profile?.name || ""} placeholder="Donor full name" required />
                </label>
                <label>
                  <span>Blood group</span>
                  <select name="bloodGroup" required>
                    {bloodGroupOptions.map((group) => (
                      <option value={group} key={group}>
                        {group}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>Phone</span>
                  <input name="phone" defaultValue={profile?.phone || ""} placeholder="Phone number" required />
                </label>
                <label>
                  <span>Area</span>
                  <input name="area" placeholder="Mirpur / Uttara / Dhanmondi" required />
                </label>
                <label className="wide-field">
                  <span>Available days</span>
                  <div className="day-check-grid">
                    {dayOptions.map((day) => (
                      <label key={day} className="mini-check">
                        <input type="checkbox" name="scheduleDays" value={day} />
                        <span>{day}</span>
                      </label>
                    ))}
                  </div>
                </label>
                <label>
                  <span>From</span>
                  <input name="availableFrom" type="time" defaultValue="09:00" required />
                </label>
                <label>
                  <span>To</span>
                  <input name="availableTo" type="time" defaultValue="17:00" required />
                </label>
              </div>
              <button className="btn btn-primary" type="submit">
                Save Donor
              </button>
              {donorFormError ? <InfoNote variant="error">{donorFormError}</InfoNote> : null}
            </form>
          ) : null}
          {donorFormSuccess ? <InfoNote>{donorFormSuccess}</InfoNote> : null}

          <div className="profile-actions">
            <button className="btn btn-outline-strong" type="button" onClick={() => navigate("home")}>
              Back Home
            </button>
            <button className="btn btn-primary" type="button" onClick={onLogout}>
              Log Out
            </button>
          </div>
        </article>
      </section>
    </main>
  );
}

export default ProfilePage;
