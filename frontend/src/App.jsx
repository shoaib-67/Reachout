import React, { useEffect, useState } from "react";
import HomePage from "./pages/HomePage";
import HumanLostFoundPage from "./pages/HumanLostFoundPage";
import LostFoundPage from "./pages/LostFoundPage";
import BloodDonationPage from "./pages/BloodDonationPage";
import Footer from "./components/Footer";
import Header from "./components/Header";

function App() {
  const [page, setPage] = useState(() => getPageFromPath());

  useEffect(() => {
    const handlePopState = () => setPage(getPageFromPath());
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  function navigate(targetPage, hash) {
    const path = targetPage === "home" ? "/" : `/${targetPage}`;
    window.history.pushState({}, "", `${path}${hash || ""}`);
    setPage(targetPage);
    if (hash) {
      requestAnimationFrame(() => {
        document.querySelector(hash)?.scrollIntoView({ behavior: "smooth" });
      });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  return (
    <>
      <Header page={page} navigate={navigate} />
      {page === "human-lost-found" ? (
        <HumanLostFoundPage />
      ) : page === "lost-found" ? (
        <LostFoundPage />
      ) : page === "blood-donation" ? (
        <BloodDonationPage />
      ) : (
        <HomePage navigate={navigate} />
      )}
      <Footer />
    </>
  );
}

function getPageFromPath() {
  const path = window.location.pathname.replace(/^\/+|\/+$/g, "");
  if (path === "lost-found" || path === "lost-found.html") return "lost-found";
  if (path === "human-lost-found" || path === "human-lost-found.html") return "human-lost-found";
  if (path === "blood-donation" || path === "blood-donation.html") return "blood-donation";
  return "home";
}

export default App;
