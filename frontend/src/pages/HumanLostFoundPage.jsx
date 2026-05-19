import React, { useState } from "react";
import { incrementUserPostCount } from "../services/userPostStats";

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
  const HUMAN_VIEWS = {
    SEARCH: "search",
    REPORT: "report"
  };

  const [query, setQuery] = useState("");
  const [area, setArea] = useState("All areas");
  const [reportType, setReportType] = useState("missing");
  const [submittedReport, setSubmittedReport] = useState(null);
  const [activeView, setActiveView] = useState(HUMAN_VIEWS.SEARCH);

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
    incrementUserPostCount("human");
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
              <button className="btn btn-primary link-button" type="button" onClick={() => setActiveView(HUMAN_VIEWS.SEARCH)}>
                Search Person
              </button>
              <button className="btn btn-outline-light link-button" type="button" onClick={() => setActiveView(HUMAN_VIEWS.REPORT)}>
                Post Report
              </button>
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

      <section className="section human-workspace">
        <div className="container">
          <div className="section-option-switcher">
            <button
              className={`section-option-btn ${activeView === HUMAN_VIEWS.SEARCH ? "active" : ""}`}
              type="button"
              onClick={() => setActiveView(HUMAN_VIEWS.SEARCH)}
            >
              Search Person
            </button>
            <button
              className={`section-option-btn ${activeView === HUMAN_VIEWS.REPORT ? "active" : ""}`}
              type="button"
              onClick={() => setActiveView(HUMAN_VIEWS.REPORT)}
            >
              Post Report
            </button>
          </div>

          {activeView === HUMAN_VIEWS.SEARCH ? (
            <div className="human-workspace-grid">
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
          ) : null}

          {activeView === HUMAN_VIEWS.REPORT ? (
            <div className="human-report-grid">
              <form className="human-report-form" onSubmit={handleSubmit}>
                <div className="human-panel-heading">
                  <div>
                    <p className="mini">Post report</p>
                    <h2>Create a human lost/found post</h2>
                  </div>
                </div>

                <div className="report-type-toggle" role="group" aria-label="Report type">
                  <button className={reportType === "missing" ? "active" : ""} type="button" onClick={() => setReportType("missing")}>
                    Missing Person
                  </button>
                  <button className={reportType === "found" ? "active" : ""} type="button" onClick={() => setReportType("found")}>
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
          ) : null}
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

export default HumanLostFoundPage;
