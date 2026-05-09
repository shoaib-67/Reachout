import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import "../styles.css";

const logoPath = "/assets/lost-found-logo.png";

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
  if (path === "lost-found" || path === "lost-found.html") {
    return "lost-found";
  }
  if (path === "human-lost-found" || path === "human-lost-found.html") {
    return "human-lost-found";
  }
  if (path === "blood-donation" || path === "blood-donation.html") {
    return "blood-donation";
  }
  return "home";
}

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
          <button
            className="brand link-button"
            type="button"
            aria-label="ReachOut home"
            onClick={() => navigate("home")}
          >
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
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => navigate("home", "#home-options")}
              >
                Choose Option
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

function HomePage({ navigate }) {
  const [lostMenuOpen, setLostMenuOpen] = useState(false);
  const [testimonialIndex, setTestimonialIndex] = useState(0);

  useEffect(() => {
    if (!lostMenuOpen) {
      return undefined;
    }

    function closeOnEscape(event) {
      if (event.key === "Escape") {
        setLostMenuOpen(false);
      }
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
          <img src={logoPath} alt="ReachOut" className="hero-logo" />
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
                  <button
                    className="lost-suboption link-button"
                    type="button"
                    onClick={() => navigate("human-lost-found")}
                  >
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
      <Testimonials
        activeIndex={testimonialIndex}
        setActiveIndex={setTestimonialIndex}
      />
      <Supporters />
    </main>
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
    if (!node) {
      return undefined;
    }

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
    if (!hasAnimated) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setCounts((current) => {
        const next = current.map((value, index) => Math.min(value + 1, targets[index]));
        if (next.every((value, index) => value === targets[index])) {
          window.clearInterval(timer);
        }
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

const missingPersonCases = [
  {
    id: "HLF-1042",
    name: "Arif Hossain",
    age: 12,
    gender: "Male",
    area: "Mirpur, Dhaka",
    lastSeen: "Mirpur 10 bus stand",
    date: "May 7, 2026",
    status: "Urgent",
    contact: "+880 1795 766 338",
    details: "Wearing a blue school shirt, black pants, and carrying a small backpack."
  },
  {
    id: "HLF-1038",
    name: "Nusrat Jahan",
    age: 67,
    gender: "Female",
    area: "Uttara, Dhaka",
    lastSeen: "Sector 7 mosque road",
    date: "May 6, 2026",
    status: "Open",
    contact: "+880 1812 456 901",
    details: "Has memory issues. Wearing a light green saree and black sandals."
  },
  {
    id: "HLF-1031",
    name: "Rafi Ahmed",
    age: 8,
    gender: "Male",
    area: "Chattogram",
    lastSeen: "GEC Circle",
    date: "May 4, 2026",
    status: "Open",
    contact: "+880 1711 220 441",
    details: "Last seen near a grocery shop. Wearing a red t-shirt and jeans."
  }
];

function HumanLostFoundPage() {
  const [query, setQuery] = useState("");
  const [area, setArea] = useState("All areas");
  const [reportType, setReportType] = useState("missing");
  const [submittedReport, setSubmittedReport] = useState(null);

  const filteredCases = missingPersonCases.filter((person) => {
    const searchable = `${person.name} ${person.area} ${person.lastSeen} ${person.details}`.toLowerCase();
    const matchesQuery = searchable.includes(query.toLowerCase());
    const matchesArea = area === "All areas" || person.area.includes(area);
    return matchesQuery && matchesArea;
  });

  function handleSubmit(event) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setSubmittedReport({
      name: data.get("personName") || "Unnamed person",
      age: data.get("age") || "Unknown",
      area: data.get("area") || "Area not provided",
      lastSeen: data.get("lastSeen") || "Location not provided",
      contact: data.get("contact") || "Contact not provided",
      type: reportType === "missing" ? "Missing Person Report" : "Found Person Report"
    });
    event.currentTarget.reset();
    setReportType("missing");
  }

  return (
    <main className="human-page">
      <section className="human-hero">
        <div className="container human-hero-grid">
          <div>
            <p className="mini">Human Lost &amp; Found</p>
            <h1>Search, report, and help reunite missing people safely.</h1>
            <p>
              Use this frontend screen to search active missing-person posts or create a new report with identity,
              location, and contact details.
            </p>
            <div className="human-hero-actions">
              <a className="btn btn-primary" href="#human-search">
                Search Person
              </a>
              <a className="btn btn-outline-light" href="#human-report">
                Post Report
              </a>
            </div>
          </div>

          <div className="human-alert-panel" aria-label="Human Lost and Found quick stats">
            <div>
              <strong>24/7</strong>
              <span>Community visibility</span>
            </div>
            <div>
              <strong>3</strong>
              <span>Active demo cases</span>
            </div>
            <div>
              <strong>Safe</strong>
              <span>Contact-first recovery</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section human-workspace" id="human-search">
        <div className="container human-workspace-grid">
          <div className="human-main-column">
            <div className="human-panel">
              <div className="human-panel-heading">
                <div>
                  <p className="mini">Search cases</p>
                  <h2>Find a missing person</h2>
                </div>
                <span>{filteredCases.length} results</span>
              </div>

              <div className="human-search-controls">
                <label>
                  <span>Search by name, location, or detail</span>
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Example: Arif, Mirpur, blue shirt"
                  />
                </label>
                <label>
                  <span>Area</span>
                  <select value={area} onChange={(event) => setArea(event.target.value)}>
                    <option>All areas</option>
                    <option>Mirpur</option>
                    <option>Uttara</option>
                    <option>Chattogram</option>
                  </select>
                </label>
              </div>

              <div className="person-list">
                {filteredCases.length === 0 ? (
                  <p className="empty-state">No matching cases found. Try another name, area, or last seen detail.</p>
                ) : (
                  filteredCases.map((person) => <PersonCaseCard person={person} key={person.id} />)
                )}
              </div>
            </div>
          </div>

          <aside className="human-side-column">
            <div className="human-panel safety-panel">
              <p className="mini">Before posting</p>
              <h3>Helpful details</h3>
              <ul>
                <li>Clear recent photo</li>
                <li>Last seen place and time</li>
                <li>Clothing and visible marks</li>
                <li>Guardian or reporter contact</li>
              </ul>
            </div>
            <div className="human-panel hotline-panel">
              <p className="mini">Emergency note</p>
              <h3>Also contact local police</h3>
              <p>
                This page helps community discovery. For real emergencies, the family should also contact the nearest
                police station immediately.
              </p>
            </div>
          </aside>
        </div>
      </section>

      <section className="section human-report-section" id="human-report">
        <div className="container human-report-grid">
          <form className="human-report-form" onSubmit={handleSubmit}>
            <div className="human-panel-heading">
              <div>
                <p className="mini">Post report</p>
                <h2>Create a human lost/found post</h2>
              </div>
            </div>

            <div className="report-type-toggle" role="group" aria-label="Report type">
              <button
                className={reportType === "missing" ? "active" : ""}
                type="button"
                onClick={() => setReportType("missing")}
              >
                Missing Person
              </button>
              <button
                className={reportType === "found" ? "active" : ""}
                type="button"
                onClick={() => setReportType("found")}
              >
                Found Person
              </button>
            </div>

            <div className="form-grid">
              <label>
                <span>Person name</span>
                <input name="personName" placeholder="Full name if known" />
              </label>
              <label>
                <span>Age</span>
                <input name="age" type="number" min="0" placeholder="Age" />
              </label>
              <label>
                <span>Area</span>
                <input name="area" placeholder="Area, district" />
              </label>
              <label>
                <span>Last seen / found location</span>
                <input name="lastSeen" placeholder="Street, landmark, hospital, station" />
              </label>
              <label className="wide-field">
                <span>Description</span>
                <textarea name="description" rows="4" placeholder="Clothing, height, health condition, identifying details"></textarea>
              </label>
              <label>
                <span>Reporter contact</span>
                <input name="contact" placeholder="Phone number or email" />
              </label>
              <label>
                <span>Upload photo</span>
                <input name="photo" type="file" accept="image/*" />
              </label>
            </div>

            <button className="btn btn-primary" type="submit">
              Preview Report
            </button>
          </form>

          <div className="human-preview-panel">
            <p className="mini">Preview</p>
            {submittedReport ? (
              <article className="preview-card">
                <span>{submittedReport.type}</span>
                <h3>{submittedReport.name}</h3>
                <p>Age: {submittedReport.age}</p>
                <p>Area: {submittedReport.area}</p>
                <p>Last seen/found: {submittedReport.lastSeen}</p>
                <p>Contact: {submittedReport.contact}</p>
              </article>
            ) : (
              <div className="preview-empty">
                <h3>No report preview yet</h3>
                <p>Fill the form and submit to see how the frontend report card will look.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

function PersonCaseCard({ person }) {
  return (
    <article className="person-case-card">
      <div className="person-avatar" aria-hidden="true">
        {person.name
          .split(" ")
          .map((part) => part[0])
          .join("")
          .slice(0, 2)}
      </div>
      <div className="person-case-body">
        <div className="person-case-top">
          <div>
            <span className={`status-chip ${person.status.toLowerCase()}`}>{person.status}</span>
            <h3>{person.name}</h3>
          </div>
          <strong>{person.id}</strong>
        </div>
        <div className="person-meta">
          <span>Age {person.age}</span>
          <span>{person.gender}</span>
          <span>{person.area}</span>
          <span>{person.date}</span>
        </div>
        <p>{person.details}</p>
        <div className="person-case-footer">
          <span>Last seen: {person.lastSeen}</span>
          <a href={`tel:${person.contact.replaceAll(" ", "")}`}>Contact reporter</a>
        </div>
      </div>
    </article>
  );
}

function LostFoundPage() {
  return (
    <Subpage
      type="lost"
      title="Lost & Found Service"
      description="Submit lost item reports, found item reports, and search cases by area."
      actions={["Report Lost Item", "Report Found Item"]}
      cards={[
        ["Create Report", "Add item details, location, and date in a few steps."],
        ["Search Matches", "Filter lost/found reports by category and nearby area."],
        ["Claim Safely", "Verify ownership and close the case securely."]
      ]}
    />
  );
}

function BloodDonationPage() {
  return (
    <Subpage
      type="blood"
      title="Blood Donation Service"
      description="Create urgent blood requests and connect with nearby available donors."
      actions={["Request Blood", "Register as Donor"]}
      cards={[
        ["Create Emergency Request", "Provide blood group, hospital, and urgency details instantly."],
        ["Find Nearby Donors", "Search donors by blood group and location quickly."],
        ["Close Case", "Mark successful donation and keep reports up to date."]
      ]}
    />
  );
}

function Subpage({ type, title, description, actions, cards }) {
  return (
    <main className="subpage-main">
      <section className={`container subpage-hero ${type}`}>
        <h1>{title}</h1>
        <p>{description}</p>

        <div className="subpage-actions">
          <a className="btn btn-primary" href="#">
            {actions[0]}
          </a>
          <a className="btn btn-outline-strong" href="#">
            {actions[1]}
          </a>
        </div>
      </section>

      <section className="container section">
        <div className="subpage-grid">
          {cards.map(([cardTitle, cardText]) => (
            <article className="subpage-card" key={cardTitle}>
              <h3>{cardTitle}</h3>
              <p>{cardText}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <p>Copyright &copy; 2024-{new Date().getFullYear()} ReachOut. All Rights Reserved</p>
      </div>
    </footer>
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

createRoot(document.getElementById("root")).render(<App />);
