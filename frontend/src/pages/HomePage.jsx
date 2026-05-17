import React, { useEffect, useMemo, useState } from "react";

const testimonials = [
  {
    quote:
      "Before using ReachOut, losing my mobile felt like a total disaster. This platform made the process instant and simple.",
    name: "Tahmidur Rahman",
    role: "HR Executive"
  },
  {
    quote: "I uploaded my lost wallet and got it back quickly because someone reported it through ReachOut.",
    name: "Shoaib",
    role: "Project Co-ordinator"
  },
  {
    quote: "We needed urgent blood at night. ReachOut connected us with nearby donors within an hour.",
    name: "Raihanul Hasan",
    role: "Accounts Manager"
  }
];

function HomePage({ navigate }) {
  const [lostMenuOpen, setLostMenuOpen] = useState(false);
  const [testimonialIndex, setTestimonialIndex] = useState(0);

  useEffect(() => {
    if (!lostMenuOpen) return undefined;
    function closeOnEscape(event) {
      if (event.key === "Escape") setLostMenuOpen(false);
    }
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [lostMenuOpen]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setTestimonialIndex((current) => (current + 1) % testimonials.length);
    }, 4200);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <main>
      <section className="hero" id="hero">
        <div className="hero-overlay"></div>
        <div className="container hero-content">
          <h1>
            <span>Choose</span>
            <br />
            Your Support Service
          </h1>

          <div className="home-options" id="home-options">
            <div className={`home-option-card option-lost option-toggle-card ${lostMenuOpen ? "open" : ""}`}>
              <button
                className="lost-toggle-btn"
                type="button"
                aria-expanded={lostMenuOpen}
                aria-controls="lostOptionMenu"
                onClick={() => setLostMenuOpen((open) => !open)}
              >
                <h3>Lost &amp; Found</h3>
                <p>Report or search lost/found items and missing person cases.</p>
                <span className="lost-toggle-chip">Choose Type</span>
              </button>
              {!lostMenuOpen ? null : (
                <div className="lost-suboptions" id="lostOptionMenu">
                  <button className="lost-suboption link-button" type="button" onClick={() => navigate("human-lost-found")}>
                    Human Lost &amp; Found
                  </button>
                  <button className="lost-suboption link-button" type="button" onClick={() => navigate("lost-found")}>
                    Goods Lost &amp; Found
                  </button>
                </div>
              )}
            </div>

            <button className="home-option-card option-blood link-button" type="button" onClick={() => navigate("blood-donation")}>
              <h3>Blood Donation</h3>
              <p>Post urgent blood requests and connect with nearby donors.</p>
              <span>Open Service</span>
            </button>
          </div>
        </div>
      </section>

      <ExploreSection />
      <HowItWorks />
      <ImpactSection />
      <Testimonials activeIndex={testimonialIndex} setActiveIndex={setTestimonialIndex} />
      <AboutSection />
      <Supporters />
      <HomeBottomSupport navigate={navigate} />
    </main>
  );
}

function AboutSection() {
  return (
    <section className="section about-section" id="about">
      <div className="container about-wrap">
        <div className="section-heading">
          <p className="mini">About</p>
          <h2>What ReachOut Does</h2>
        </div>
        <p className="about-text">
          ReachOut is a community support platform that helps people report and recover lost items, share missing person alerts, and
          connect urgent blood donation requests with nearby donors.
        </p>
      </div>
    </section>
  );
}

function ExploreSection() {
  const categories = [
    { name: "Bags", className: "bag", icon: <BagIcon /> },
    { name: "Document", className: "docs", icon: <DocumentIcon /> },
    { name: "Keys", className: "keys", icon: <KeysIcon /> },
    { name: "Laptop", className: "laptop", icon: <LaptopIcon /> },
    { name: "People", className: "people", icon: <PeopleIcon /> },
    { name: "Pets", className: "pets", icon: <PetsIcon /> },
    { name: "Phones", className: "phone", icon: <PhoneIcon /> }
  ];
  return (
    <section className="section explore">
      <div className="container">
        <div className="section-heading">
          <p className="mini">Explore Now</p>
          <h2>Find What's Lost and Found</h2>
        </div>
        <div className="category-grid">
          {categories.map((category) => (
            <a className="category-card" href="#" key={category.name}>
              <div className={`cat-image ${category.className}`} aria-hidden="true">
                {category.icon}
              </div>
              <span>{category.name}</span>
            </a>
          ))}
          <a className="category-card view-all" href="#">
            <strong>Explore All Ads</strong>
            <small>View all</small>
          </a>
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    ["Report Now", "Report a missing person, lost goods, or blood request."],
    ["Next Step", "Provide photo and key details for faster identification."],
    ["Help Community", "Nearby people respond and help complete safe recovery."]
  ];
  return (
    <section className="section how" id="how">
      <div className="container">
        <div className="section-heading">
          <h2>How It Works?</h2>
        </div>
        <div className="how-grid">
          {steps.map(([title, description], index) => (
            <article className="how-card" key={title}>
              <div className="how-icon">{index + 1}</div>
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function ImpactSection() {
  const [hasAnimated, setHasAnimated] = useState(false);
  const [counts, setCounts] = useState([0, 0, 0]);
  const targets = useMemo(() => [2, 3, 1], []);
  useEffect(() => {
    const node = document.getElementById("impact-card");
    if (!node) return undefined;
    const start = () => setHasAnimated(true);
    if (!("IntersectionObserver" in window)) {
      start();
      return undefined;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          start();
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!hasAnimated) return undefined;
    const timer = window.setInterval(() => {
      setCounts((current) => {
        const next = current.map((value, index) => Math.min(value + 1, targets[index]));
        if (next.every((value, index) => value === targets[index])) window.clearInterval(timer);
        return next;
      });
    }, 35);
    return () => window.clearInterval(timer);
  }, [hasAnimated, targets]);

  return (
    <section className="section impact">
      <div className="impact-bg"></div>
      <div className="container">
        <div className="impact-card" id="impact-card">
          <p className="mini">Find everything</p>
          <h2>Impacting the entire lost &amp; found process in Bangladesh.</h2>
          <p className="impact-text">
            We are connecting lost items, missing people, and urgent blood requests by reuniting communities quickly.
          </p>
          <div className="stats-row">
            {["Person Lost Reported", "Goods Lost Reported", "Blood Requests"].map((label, index) => (
              <article key={label}>
                <h3>
                  <span className="counter">{counts[index]}</span>K
                </h3>
                <p>{label}</p>
              </article>
            ))}
          </div>
          <a className="btn btn-primary" href="#">
            Explore listings
          </a>
        </div>
      </div>
    </section>
  );
}

function Testimonials({ activeIndex, setActiveIndex }) {
  function move(direction) {
    setActiveIndex((current) => (current + direction + testimonials.length) % testimonials.length);
  }
  return (
    <section className="section testimonials" id="stories">
      <div className="container testimonials-wrap">
        <div className="testi-left">
          <p className="mini">What our users say</p>
          <h2>User Experience</h2>
          <p>We are on a mission to help people find what they have lost and report what they have found.</p>
          <div className="testi-controls">
            <button type="button" aria-label="Previous testimonial" onClick={() => move(-1)}>
              &larr;
            </button>
            <button type="button" aria-label="Next testimonial" onClick={() => move(1)}>
              &rarr;
            </button>
          </div>
        </div>

        <div className="testi-right" id="testiTrack">
          {testimonials.map((testimonial, index) => (
            <article className={`testi-card ${index === activeIndex ? "active" : ""}`} key={testimonial.name}>
              <p>{testimonial.quote}</p>
              <h4>{testimonial.name}</h4>
              <span>{testimonial.role}</span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Supporters() {
  return (
    <section className="section supporters" id="contact">
      <div className="container">
        <div className="section-heading">
          <h2>Our Supporters</h2>
        </div>
        <div className="supporter-grid">
          <span>ICT Bangladesh</span>
          <span>City Blood Net</span>
          <span>Safety Board</span>
          <span>Volunteer Cyber Team</span>
        </div>
      </div>
    </section>
  );
}

function HomeBottomSupport({ navigate }) {
  return (
    <section className="top-strip" aria-label="Support contact">
      <div className="container top-strip-inner">
        <button className="pill-btn link-button" type="button" onClick={() => navigate("home", "#home-options")}>
          Choose Service
        </button>
        <div className="top-info">
          <span>Call Support: +880 1795 766 338</span>
          <span>Email: hi@reachout.org</span>
        </div>
      </div>
    </section>
  );
}

function BagIcon() {
  return (
    <svg className="cat-icon" viewBox="0 0 64 64" fill="none">
      <rect x="14" y="24" width="36" height="28" rx="8"></rect>
      <path d="M22 24v-4c0-5.5 4.5-10 10-10s10 4.5 10 10v4"></path>
      <path d="M28 32h8"></path>
    </svg>
  );
}
function DocumentIcon() {
  return (
    <svg className="cat-icon" viewBox="0 0 64 64" fill="none">
      <path d="M20 10h18l10 10v34H20z"></path>
      <path d="M38 10v10h10"></path>
      <path d="M26 34h16M26 42h12"></path>
    </svg>
  );
}
function KeysIcon() {
  return (
    <svg className="cat-icon" viewBox="0 0 64 64" fill="none">
      <circle cx="24" cy="24" r="10"></circle>
      <path d="M32 24h18"></path>
      <path d="M44 24v8M50 24v6"></path>
    </svg>
  );
}
function LaptopIcon() {
  return (
    <svg className="cat-icon" viewBox="0 0 64 64" fill="none">
      <rect x="18" y="16" width="28" height="20" rx="3"></rect>
      <path d="M12 42h40l-4 8H16z"></path>
    </svg>
  );
}
function PeopleIcon() {
  return (
    <svg className="cat-icon" viewBox="0 0 64 64" fill="none">
      <circle cx="32" cy="22" r="8"></circle>
      <path d="M18 48c2.5-8 9-12 14-12s11.5 4 14 12"></path>
    </svg>
  );
}
function PetsIcon() {
  return (
    <svg className="cat-icon" viewBox="0 0 64 64" fill="none">
      <ellipse cx="32" cy="38" rx="10" ry="8"></ellipse>
      <circle cx="22" cy="24" r="4"></circle>
      <circle cx="30" cy="20" r="4"></circle>
      <circle cx="38" cy="20" r="4"></circle>
      <circle cx="46" cy="24" r="4"></circle>
    </svg>
  );
}
function PhoneIcon() {
  return (
    <svg className="cat-icon" viewBox="0 0 64 64" fill="none">
      <rect x="22" y="10" width="20" height="44" rx="4"></rect>
      <path d="M29 16h6M30 48h4"></path>
    </svg>
  );
}

export default HomePage;
