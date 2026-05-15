import React from "react";

const logoPath = "/assets/lost-found-logo.png";

function Header({ page, navigate }) {
  const isHome = page === "home";

  return (
    <header className="header-wrap">
      <div className="top-strip">
        <div className="container top-strip-inner">
          <button
            className="pill-btn link-button"
            type="button"
            onClick={() => (isHome ? navigate("home", "#home-options") : navigate("home"))}
          >
            {isHome ? "Choose Service" : "Back Home"}
          </button>
          <div className="top-info">
            <span>Call Support: +880 1795 766 338</span>
            <span>Email: hi@reachout.org</span>
          </div>
        </div>
      </div>

      <div className="main-nav-wrap">
        <div className="container main-nav">
          <button className="brand link-button" type="button" aria-label="ReachOut home" onClick={() => navigate("home")}>
            <img src={logoPath} alt="ReachOut logo" className="brand-image" />
          </button>

          <nav className="menu" aria-label="Primary navigation">
            <button type="button" onClick={() => navigate("home")}>
              Home
            </button>
            <button type="button" onClick={() => navigate("lost-found")}>
              Lost &amp; Found
            </button>
            <button type="button" onClick={() => navigate("blood-donation")}>
              Blood Donation
            </button>
            {isHome && (
              <button type="button" onClick={() => navigate("home", "#contact")}>
                Contact
              </button>
            )}
          </nav>

          <div className="nav-actions">
            <a href="#" className="text-link">
              Log In
            </a>
            <a href="#" className="text-link">
              Register
            </a>
            {isHome && (
              <button type="button" className="btn btn-primary" onClick={() => navigate("home", "#home-options")}>
                Choose Option
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
