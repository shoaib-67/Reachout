import React from "react";

const logoPath = "/assets/lost-found-logo.png";

function Header({ page, navigate, currentUser, onLogout }) {
  return (
    <header className="header-wrap">
      <div className="main-nav-wrap">
        <div className="container main-nav">
          <button
            className="brand link-button"
            type="button"
            aria-label="ReachOut home"
            onClick={() => navigate(currentUser ? "dashboard" : "home")}
          >
            <img src={logoPath} alt="ReachOut logo" className="brand-image" />
          </button>

          <nav className="menu" aria-label="Primary navigation">
            {currentUser ? (
              <>
                <button type="button" onClick={() => navigate("dashboard")}>
                  Dashboard
                </button>
                <button type="button" onClick={() => navigate("profile")}>
                  Profile
                </button>
                <button type="button" onClick={onLogout}>
                  Log Out
                </button>
              </>
            ) : (
              <>
                <button type="button" onClick={() => navigate("home")}>
                  Home
                </button>
                <button type="button" onClick={() => navigate("home", "#about")}>
                  About
                </button>
                <button type="button" onClick={() => navigate("home", "#contact")}>
                  Contact
                </button>
                <button type="button" onClick={() => navigate("login")}>
                  Log In
                </button>
                <button type="button" onClick={() => navigate("register")}>
                  Register
                </button>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}

export default Header;
