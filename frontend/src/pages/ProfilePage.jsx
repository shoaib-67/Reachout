import React, { useEffect, useState } from "react";
import { getMyProfile } from "../services/authApi";

function ProfilePage({ navigate, currentUser, onLogout }) {
  const [profile, setProfile] = useState(currentUser || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("reachout_token");
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
