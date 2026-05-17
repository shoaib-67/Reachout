import React, { useState } from "react";
import { loginUser } from "../services/authApi";

function LoginPage({ navigate, onLogin }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!form.email || !form.password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setSubmitting(true);
      const data = await loginUser(form);
      onLogin?.(data);
      setSuccess("Login successful. Redirecting to dashboard...");
      window.setTimeout(() => {
        navigate("dashboard");
      }, 400);
    } catch (err) {
      setError(err.message || "Login failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="container auth-wrap">
        <article className="auth-card">
          <p className="mini">Welcome Back</p>
          <h1>Log In</h1>
          <p className="auth-subtext">Access your ReachOut account.</p>

          <form className="auth-form" onSubmit={handleSubmit}>
            <label>
              Email
              <input type="email" name="email" value={form.email} onChange={updateField} placeholder="you@example.com" />
            </label>

            <label>
              Password
              <input type="password" name="password" value={form.password} onChange={updateField} placeholder="Enter password" />
            </label>

            {!error ? null : <p className="auth-message error">{error}</p>}
            {!success ? null : <p className="auth-message success">{success}</p>}

            <button className="btn btn-primary" type="submit" disabled={submitting}>
              {submitting ? "Logging in..." : "Log In"}
            </button>
          </form>

          <p className="auth-switch">
            New here?{" "}
            <button type="button" className="text-link link-button" onClick={() => navigate("register")}>
              Create account
            </button>
          </p>
        </article>
      </section>
    </main>
  );
}

export default LoginPage;
