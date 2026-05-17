import React, { useEffect, useState } from "react";
import HomePage from "./pages/HomePage";
import HumanLostFoundPage from "./pages/HumanLostFoundPage";
import LostFoundPage from "./pages/LostFoundPage";
import BloodDonationPage from "./pages/BloodDonationPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProfilePage from "./pages/ProfilePage";
import DashboardPage from "./pages/DashboardPage";
import AuthSidebar from "./components/AuthSidebar";
import Footer from "./components/Footer";
import Header from "./components/Header";

function App() {
  const [page, setPage] = useState(() => getPageFromPath());
  const [currentUser, setCurrentUser] = useState(() => getStoredUser());
  const [authToken, setAuthToken] = useState(() => getStoredToken());
  const isAuthenticated = Boolean(currentUser && authToken);

  useEffect(() => {
    const handlePopState = () => setPage(getPageFromPath());
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    if (isAuthenticated && (page === "home" || page === "login" || page === "register")) {
      setPage("dashboard");
      window.history.replaceState({}, "", "/dashboard");
    }
  }, [isAuthenticated, page]);

  function navigate(targetPage, hash) {
    const normalizedTarget = targetPage === "home" && isAuthenticated ? "dashboard" : targetPage;
    const path = normalizedTarget === "home" ? "/" : `/${normalizedTarget}`;
    window.history.pushState({}, "", `${path}${hash || ""}`);
    setPage(normalizedTarget);
    if (hash) {
      const tryScroll = (attempt = 0) => {
        const target = document.querySelector(hash);
        if (target) {
          target.scrollIntoView({ behavior: "smooth" });
          return;
        }
        if (attempt < 8) {
          window.setTimeout(() => tryScroll(attempt + 1), 40);
        }
      };
      requestAnimationFrame(() => tryScroll());
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function handleLogin(payload) {
    if (payload?.token) {
      localStorage.setItem("reachout_token", payload.token);
      setAuthToken(payload.token);
    }
    if (payload?.user) {
      localStorage.setItem("reachout_user", JSON.stringify(payload.user));
      setCurrentUser(payload.user);
    }
  }

  function handleLogout() {
    localStorage.removeItem("reachout_token");
    localStorage.removeItem("reachout_user");
    setAuthToken(null);
    setCurrentUser(null);
    navigate("home");
  }

  const resolvedPage = isAuthenticated
    ? page === "home" || page === "login" || page === "register"
      ? "dashboard"
      : page
    : page === "dashboard" || page === "profile"
      ? "login"
      : page;

  return (
    <>
      {!isAuthenticated ? <Header page={resolvedPage} navigate={navigate} currentUser={currentUser} onLogout={handleLogout} /> : null}
      {isAuthenticated ? (
        <div className="auth-shell">
          <AuthSidebar currentUser={currentUser} page={resolvedPage} navigate={navigate} onLogout={handleLogout} />
          <div className="auth-shell-main">
            {resolvedPage === "human-lost-found" ? (
              <HumanLostFoundPage />
            ) : resolvedPage === "lost-found" ? (
              <LostFoundPage />
            ) : resolvedPage === "blood-donation" ? (
              <BloodDonationPage />
            ) : resolvedPage === "profile" ? (
              <ProfilePage navigate={navigate} currentUser={currentUser} onLogout={handleLogout} />
            ) : (
              <DashboardPage navigate={navigate} currentUser={currentUser} onLogout={handleLogout} />
            )}
            {resolvedPage === "dashboard" ? null : <Footer />}
          </div>
        </div>
      ) : (
        <>
          {resolvedPage === "login" ? (
            <LoginPage navigate={navigate} onLogin={handleLogin} />
          ) : resolvedPage === "register" ? (
            <RegisterPage navigate={navigate} />
          ) : (
            <HomePage navigate={navigate} />
          )}
          <Footer />
        </>
      )}
    </>
  );
}

function getPageFromPath() {
  const path = window.location.pathname.replace(/^\/+|\/+$/g, "");
  if (path === "lost-found" || path === "lost-found.html") return "lost-found";
  if (path === "human-lost-found" || path === "human-lost-found.html") return "human-lost-found";
  if (path === "blood-donation" || path === "blood-donation.html") return "blood-donation";
  if (path === "login") return "login";
  if (path === "register") return "register";
  if (path === "profile") return "profile";
  if (path === "dashboard") return "dashboard";
  return "home";
}

function getStoredUser() {
  try {
    const raw = localStorage.getItem("reachout_user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function getStoredToken() {
  try {
    return localStorage.getItem("reachout_token");
  } catch {
    return null;
  }
}

export default App;
