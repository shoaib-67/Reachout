import React from "react";

function LostFoundPage() {
  function goToHuman() {
    window.history.pushState({}, "", "/human-lost-found");
    window.dispatchEvent(new PopStateEvent("popstate"));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <main className="subpage-main">
      <section className="container subpage-hero lost">
        <h1>Lost &amp; Found Service</h1>
        <p>Choose the report type to continue.</p>

        <div className="subpage-actions">
          <button className="btn btn-primary" type="button" onClick={goToHuman}>
            Human Lost &amp; Found
          </button>
          <button className="btn btn-outline-strong" type="button" aria-current="page">
            Goods Lost &amp; Found
          </button>
        </div>
      </section>

      <section className="container section">
        <div className="subpage-grid">
          {[
            ["Create Goods Report", "Add item details, location, and date in a few steps."],
            ["Search Goods Matches", "Filter lost/found goods by category and nearby area."],
            ["Claim Goods Safely", "Verify ownership and close the case securely."]
          ].map(([cardTitle, cardText]) => (
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

export default LostFoundPage;
