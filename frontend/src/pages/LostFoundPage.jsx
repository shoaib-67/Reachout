import React, { useMemo, useState } from "react";
import { incrementUserPostCount } from "../services/userPostStats";

const initialGoodsPosts = [
  {
    id: "GF-2048",
    type: "Lost",
    item: "Black leather wallet",
    category: "Wallet",
    area: "Dhanmondi",
    place: "Dhanmondi 27 bus stop",
    date: "May 12, 2026",
    status: "Open",
    contact: "+880 1712 554 880",
    details: "Contains ID card, two bank cards, and a university library card."
  },
  {
    id: "GF-2041",
    type: "Found",
    item: "Samsung phone",
    category: "Phone",
    area: "Mirpur",
    place: "Mirpur 10 metro station",
    date: "May 11, 2026",
    status: "Verification",
    contact: "+880 1819 440 223",
    details: "Blue case, cracked screen protector. Owner must describe lock screen."
  },
  {
    id: "GF-2037",
    type: "Lost",
    item: "Laptop backpack",
    category: "Bag",
    area: "Uttara",
    place: "Sector 7 rickshaw stand",
    date: "May 9, 2026",
    status: "Open",
    contact: "+880 1795 766 338",
    details: "Grey backpack with laptop charger, notebook, and CSE lab files."
  },
  {
    id: "GF-2032",
    type: "Found",
    item: "Set of keys",
    category: "Keys",
    area: "Chattogram",
    place: "GEC Circle",
    date: "May 8, 2026",
    status: "Open",
    contact: "+880 1614 203 778",
    details: "Four keys with a red plastic tag. Claim requires matching keychain detail."
  }
];

const categories = ["All categories", "Bag", "Document", "Keys", "Laptop", "Phone", "Wallet"];
const areas = ["All areas", "Mirpur", "Uttara", "Dhanmondi", "Chattogram"];
const types = ["All types", "Lost", "Found"];

function LostFoundPage() {
  const [posts, setPosts] = useState(initialGoodsPosts);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All categories");
  const [area, setArea] = useState("All areas");
  const [type, setType] = useState("All types");
  const [reportType, setReportType] = useState("Lost");
  const [submittedPost, setSubmittedPost] = useState(null);
  const [notice, setNotice] = useState("");

  const filteredPosts = useMemo(
    () =>
      posts.filter((post) => {
        const searchable = `${post.item} ${post.category} ${post.area} ${post.place} ${post.details}`.toLowerCase();
        const matchesQuery = searchable.includes(query.toLowerCase());
        const matchesCategory = category === "All categories" || post.category === category;
        const matchesArea = area === "All areas" || post.area === area;
        const matchesType = type === "All types" || post.type === type;
        return matchesQuery && matchesCategory && matchesArea && matchesType;
      }),
    [area, category, posts, query, type]
  );

  const openCount = posts.filter((post) => post.status !== "Resolved").length;
  const foundCount = posts.filter((post) => post.type === "Found").length;

  function handleSubmit(event) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const newPost = {
      id: `GF-${2050 + posts.length}`,
      type: reportType,
      item: data.get("item") || "Unnamed item",
      category: data.get("category") || "Document",
      area: data.get("area") || "Area not provided",
      place: data.get("place") || "Location not provided",
      date: data.get("date") || new Date().toISOString().slice(0, 10),
      status: "Open",
      contact: data.get("contact") || "Contact not provided",
      details: data.get("details") || "No extra details provided."
    };
    setPosts((current) => [newPost, ...current]);
    incrementUserPostCount("goods");
    setSubmittedPost(newPost);
    setNotice(`${newPost.type} report preview created for ${newPost.item}.`);
    event.currentTarget.reset();
    setReportType("Lost");
  }

  function markResolved(postId) {
    setPosts((current) => current.map((post) => (post.id === postId ? { ...post, status: "Resolved" } : post)));
    setNotice(`Case ${postId} marked as resolved.`);
  }

  function reportPost(postId) {
    setNotice(`Report submitted for ${postId}. A moderator would review this post.`);
  }

  return (
    <main className="goods-page">
      <section className="goods-hero">
        <div className="container goods-hero-grid">
          <div>
            <p className="mini">Goods Lost &amp; Found</p>
            <h1>Report lost items, search found goods, and recover them safely.</h1>
            <p>
              Frontend flow for creating goods posts, filtering by item type and area, contacting reporters, and
              closing resolved cases.
            </p>
            <div className="human-hero-actions">
              <a className="btn btn-primary" href="#goods-search">
                Search Goods
              </a>
              <a className="btn btn-outline-light" href="#goods-report">
                Post Report
              </a>
            </div>
          </div>

          <div className="goods-kpi" aria-label="Goods Lost and Found quick stats">
            <article>
              <strong>{posts.length}</strong>
              <span>Total goods posts</span>
            </article>
            <article>
              <strong>{openCount}</strong>
              <span>Active cases</span>
            </article>
            <article>
              <strong>{foundCount}</strong>
              <span>Found item leads</span>
            </article>
          </div>
        </div>
      </section>

      <section className="section goods-workspace" id="goods-search">
        <div className="container goods-workspace-grid">
          <div className="goods-panel">
            <div className="human-panel-heading">
              <div>
                <p className="mini">Search posts</p>
                <h2>Find matching goods</h2>
              </div>
              <span>{filteredPosts.length} results</span>
            </div>

            <div className="goods-search-controls">
              <label>
                <span>Search item, place, or detail</span>
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Example: wallet, Mirpur, keys" />
              </label>
              <label>
                <span>Type</span>
                <select value={type} onChange={(event) => setType(event.target.value)}>
                  {types.map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
              </label>
              <label>
                <span>Category</span>
                <select value={category} onChange={(event) => setCategory(event.target.value)}>
                  {categories.map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
              </label>
              <label>
                <span>Area</span>
                <select value={area} onChange={(event) => setArea(event.target.value)}>
                  {areas.map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
              </label>
            </div>

            <div className="goods-list">
              {filteredPosts.length === 0 ? (
                <p className="empty-state">No goods posts match these filters. Try another item, category, or area.</p>
              ) : (
                filteredPosts.map((post) => (
                  <GoodsPostCard post={post} onResolve={markResolved} onReport={reportPost} key={post.id} />
                ))
              )}
            </div>
          </div>

          <aside className="goods-side-column">
            <div className="goods-panel">
              <p className="mini">Safe claiming</p>
              <h3>Verify before handover</h3>
              <ul className="goods-checklist">
                <li>Ask for hidden item details</li>
                <li>Meet in a public place</li>
                <li>Keep contact info private when possible</li>
                <li>Mark the post resolved after recovery</li>
              </ul>
            </div>
            <div className="goods-panel">
              <p className="mini">Moderation</p>
              <h3>Report suspicious posts</h3>
              <p className="goods-note">
                Scam, duplicate, or abusive posts can be flagged for admin review as described in the SRS safety
                requirements.
              </p>
            </div>
            {notice ? <div className="goods-notice">{notice}</div> : null}
          </aside>
        </div>
      </section>

      <section className="section goods-report-section" id="goods-report">
        <div className="container goods-report-grid">
          <form className="goods-report-form" onSubmit={handleSubmit}>
            <div className="human-panel-heading">
              <div>
                <p className="mini">Post report</p>
                <h2>Create a goods lost/found post</h2>
              </div>
            </div>

            <div className="report-type-toggle" role="group" aria-label="Goods report type">
              <button className={reportType === "Lost" ? "active" : ""} type="button" onClick={() => setReportType("Lost")}>
                Lost Item
              </button>
              <button className={reportType === "Found" ? "active" : ""} type="button" onClick={() => setReportType("Found")}>
                Found Item
              </button>
            </div>

            <div className="goods-form-grid">
              <label>
                <span>Item name</span>
                <input name="item" placeholder="Wallet, phone, bag, document" required />
              </label>
              <label>
                <span>Category</span>
                <select name="category" required>
                  {categories.slice(1).map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
              </label>
              <label>
                <span>Area</span>
                <input name="area" placeholder="Mirpur, Uttara, Dhanmondi" required />
              </label>
              <label>
                <span>Lost/found date</span>
                <input name="date" type="date" required />
              </label>
              <label className="wide-field">
                <span>Exact place</span>
                <input name="place" placeholder="Station, bus stop, campus, hospital, market" required />
              </label>
              <label className="wide-field">
                <span>Description</span>
                <textarea name="details" rows="4" placeholder="Color, brand, contents, marks, or proof needed to claim" required></textarea>
              </label>
              <label>
                <span>Reporter contact</span>
                <input name="contact" placeholder="Phone number or email" required />
              </label>
              <label>
                <span>Upload image</span>
                <input name="photo" type="file" accept="image/*" />
              </label>
            </div>

            <button className="btn btn-primary" type="submit">
              Preview Goods Post
            </button>
          </form>

          <div className="goods-preview-panel">
            <p className="mini">Preview</p>
            {submittedPost ? (
              <article className="preview-card">
                <span>{submittedPost.type} Goods Report</span>
                <h3>{submittedPost.item}</h3>
                <p>Category: {submittedPost.category}</p>
                <p>Area: {submittedPost.area}</p>
                <p>Place: {submittedPost.place}</p>
                <p>Contact: {submittedPost.contact}</p>
              </article>
            ) : (
              <div className="preview-empty">
                <h3>No goods preview yet</h3>
                <p>Fill the form and submit to see the item recovery card before it joins the board.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

function GoodsPostCard({ post, onResolve, onReport }) {
  const statusClass = post.status.toLowerCase();

  return (
    <article className={`goods-post-card ${post.status === "Resolved" ? "resolved" : ""}`}>
      <div className="goods-post-icon" aria-hidden="true">
        {post.category.slice(0, 2).toUpperCase()}
      </div>
      <div className="goods-post-body">
        <div className="person-case-top">
          <div>
            <span className={`status-chip ${statusClass}`}>{post.status}</span>
            <h3>{post.item}</h3>
          </div>
          <strong>{post.id}</strong>
        </div>
        <div className="person-meta">
          <span>{post.type}</span>
          <span>{post.category}</span>
          <span>{post.area}</span>
          <span>{post.date}</span>
        </div>
        <p>{post.details}</p>
        <div className="goods-post-footer">
          <span>{post.place}</span>
          <div>
            <a href={`tel:${post.contact.replaceAll(" ", "")}`}>Contact</a>
            <button type="button" onClick={() => onReport(post.id)}>
              Report
            </button>
            <button type="button" onClick={() => onResolve(post.id)} disabled={post.status === "Resolved"}>
              Resolve
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

export default LostFoundPage;
