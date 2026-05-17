import React from "react";

function AuthSidebar({ currentUser, page, navigate, onLogout }) {
  return (
    <aside className="auth-sidebar" aria-label="Feature navigation">
      <button className="auth-sidebar-brand link-button" type="button" onClick={() => navigate("dashboard")}>
        ReachOut
      </button>

      <p className="auth-sidebar-user">{currentUser?.name || "User"}</p>

      <nav className="auth-sidebar-menu">
        <button
          type="button"
          className={`auth-sidebar-link ${page === "dashboard" ? "active" : ""}`}
          onClick={() => navigate("dashboard")}
        >
          Dashboard
        </button>
        <button
          type="button"
          className={`auth-sidebar-link ${page === "lost-found" ? "active" : ""}`}
          onClick={() => navigate("lost-found")}
        >
          Goods Lost &amp; Found
        </button>
        <button
          type="button"
          className={`auth-sidebar-link ${page === "human-lost-found" ? "active" : ""}`}
          onClick={() => navigate("human-lost-found")}
        >
          Human Lost &amp; Found
        </button>
        <button
          type="button"
          className={`auth-sidebar-link ${page === "blood-donation" ? "active" : ""}`}
          onClick={() => navigate("blood-donation")}
        >
          Blood Donation
        </button>
        <button
          type="button"
          className={`auth-sidebar-link ${page === "profile" ? "active" : ""}`}
          onClick={() => navigate("profile")}
        >
          Profile
        </button>
      </nav>

      <button type="button" className="auth-sidebar-logout link-button" onClick={onLogout}>
        Log Out
      </button>
    </aside>
  );
}

export default AuthSidebar;
