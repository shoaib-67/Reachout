import React, { useEffect, useState } from "react";
import { getMyProfile } from "../services/authApi";
import { getUserPostCounts } from "../services/userPostStats";

function DashboardPage({ navigate, currentUser, onLogout }) {
  const [profile, setProfile] = useState(currentUser || null);
  const [counts, setCounts] = useState(() => getUserPostCounts());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("reachout_token");
    if (!token) {
      setLoading(false);
      setError("Please log in to continue.");
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
        setError(err.message || "Could not load your account.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    function refreshCounts() {
      setCounts(getUserPostCounts());
    }
    refreshCounts();
    window.addEventListener("focus", refreshCounts);
    window.addEventListener("reachout:post-stats-updated", refreshCounts);
    return () => {
      window.removeEventListener("focus", refreshCounts);
      window.removeEventListener("reachout:post-stats-updated", refreshCounts);
    };
  }, []);

  const totalPosts = counts.goodsPosts + counts.humanPosts + counts.bloodPosts;

  return (
    <main className="auth-page">
      <section className="container dashboard-wrap">
        <article className="auth-card profile-card">
          <p className="mini">Welcome</p>
          <h1>User Dashboard</h1>
          <p className="auth-subtext">
            Post overview for <strong>{profile?.name || "User"}</strong>.
          </p>

          {loading ? <p className="auth-subtext">Loading account...</p> : null}
          {!loading && error ? <p className="auth-message error">{error}</p> : null}

          {!loading && profile ? (
            <div className="user-overview">
              <article>
                <small>Goods Lost &amp; Found Posts</small>
                <p>{counts.goodsPosts}</p>
              </article>
              <article>
                <small>Human Lost &amp; Found Posts</small>
                <p>{counts.humanPosts}</p>
              </article>
              <article>
                <small>Blood Donation Posts</small>
                <p>{counts.bloodPosts}</p>
              </article>
              <article>
                <small>Total Posts</small>
                <p>{totalPosts}</p>
              </article>
            </div>
          ) : null}

          <div className="profile-actions">
            <button className="btn btn-primary" type="button" onClick={onLogout}>
              Log Out
            </button>
          </div>
        </article>
      </section>
    </main>
  );
}

export default DashboardPage;
