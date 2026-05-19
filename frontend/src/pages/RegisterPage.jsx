import React, { useState } from "react";
import { registerUser } from "../services/authApi";

function RegisterPage({ navigate }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirmPassword: "" });
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

    if (!form.name || !form.email || !form.phone || !form.password || !form.confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setSubmitting(true);
      await registerUser({ name: form.name, email: form.email, phone: form.phone, password: form.password });
      setSuccess("Registration successful. Redirecting to login...");
      window.setTimeout(() => navigate("login"), 700);
    } catch (err) {
      setError(err.message || "Registration failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="container auth-wrap">
        <article className="auth-card">
          <p className="mini">Join ReachOut</p>
          <h1>Register</h1>
          <p className="auth-subtext">Create your account to continue.</p>

          <form className="auth-form" onSubmit={handleSubmit}>
            <label>
              Full Name
              <input type="text" name="name" value={form.name} onChange={updateField} placeholder="Your full name" />
            </label>

            <label>
              Email
              <input type="email" name="email" value={form.email} onChange={updateField} placeholder="you@example.com" />
            </label>

            <label>
              Phone
              <input type="tel" name="phone" value={form.phone} onChange={updateField} placeholder="Your phone number" />
            </label>

            <label>
              Password
              <input type="password" name="password" value={form.password} onChange={updateField} placeholder="Minimum 6 characters" />
            </label>

            <label>
              Confirm Password
              <input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={updateField}
                placeholder="Re-enter password"
              />
            </label>

            {!error ? null : <p className="auth-message error">{error}</p>}
            {!success ? null : <p className="auth-message success">{success}</p>}

            <button className="btn btn-primary" type="submit" disabled={submitting}>
              {submitting ? "Creating account..." : "Register"}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account?{" "}
            <button type="button" className="text-link link-button" onClick={() => navigate("login")}>
              Log in
            </button>
          </p>
        </article>
      </section>
    </main>
  );
}

export default RegisterPage;
