import { useState } from "react";

export default function AuthPanel({ onSignup, onLogin }) {
  const [tab, setTab] = useState("login");
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [signupForm, setSignupForm] = useState({ fullName: "", email: "", password: "" });
  const [status, setStatus] = useState({ login: "", signup: "" });

  async function submitLogin(event) {
    event.preventDefault();
    setStatus((prev) => ({ ...prev, login: "Logging in..." }));

    try {
      await onLogin(loginForm);
      setStatus((prev) => ({ ...prev, login: "Login successful." }));
      setLoginForm({ email: "", password: "" });
    } catch (error) {
      setStatus((prev) => ({ ...prev, login: error.message || "Login failed." }));
    }
  }

  async function submitSignup(event) {
    event.preventDefault();
    setStatus((prev) => ({ ...prev, signup: "Creating account..." }));

    try {
      await onSignup(signupForm);
      setStatus((prev) => ({
        ...prev,
        signup: "Signup successful. Confirm your email first if confirmation is enabled."
      }));
      setSignupForm({ fullName: "", email: "", password: "" });
      setTab("login");
    } catch (error) {
      setStatus((prev) => ({ ...prev, signup: error.message || "Signup failed." }));
    }
  }

  return (
    <section className="panel auth-panel">
      <div className="tabs">
        <button
          className={`tab ${tab === "login" ? "active" : ""}`}
          type="button"
          onClick={() => setTab("login")}
        >
          Login
        </button>
        <button
          className={`tab ${tab === "signup" ? "active" : ""}`}
          type="button"
          onClick={() => setTab("signup")}
        >
          Sign Up
        </button>
      </div>

      {tab === "login" ? (
        <form className="stack" onSubmit={submitLogin}>
          <h2>Login</h2>
          <input
            type="email"
            placeholder="Email"
            value={loginForm.email}
            onChange={(e) => setLoginForm((prev) => ({ ...prev, email: e.target.value }))}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={loginForm.password}
            onChange={(e) => setLoginForm((prev) => ({ ...prev, password: e.target.value }))}
            required
          />
          <button type="submit">Login</button>
          <div className="status">{status.login}</div>
        </form>
      ) : (
        <form className="stack" onSubmit={submitSignup}>
          <h2>Create Account</h2>
          <input
            type="text"
            placeholder="Full name"
            value={signupForm.fullName}
            onChange={(e) => setSignupForm((prev) => ({ ...prev, fullName: e.target.value }))}
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={signupForm.email}
            onChange={(e) => setSignupForm((prev) => ({ ...prev, email: e.target.value }))}
            required
          />
          <input
            type="password"
            placeholder="Password (min 6 chars)"
            minLength={6}
            value={signupForm.password}
            onChange={(e) => setSignupForm((prev) => ({ ...prev, password: e.target.value }))}
            required
          />
          <button type="submit">Sign Up</button>
          <div className="status">{status.signup}</div>
        </form>
      )}
    </section>
  );
}
