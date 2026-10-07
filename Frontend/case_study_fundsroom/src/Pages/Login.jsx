import { useState } from "react";
import { apiRequest } from "../Services/api";

function Login({ onAuthenticated }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const action = mode === "register" ? "register" : "login";
      const result = await apiRequest(`/auth/${action}`, {
        method: "POST",
        body: JSON.stringify(form),
      });
      localStorage.setItem("token", result.token);
      onAuthenticated(result.user);
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="auth-layout">
      <section className="auth-showcase">
        <div className="brand brand-light"><span className="brand-mark">N</span> Northstar ERP</div>
        <div className="showcase-copy">
          <p className="eyebrow">INDUSTRIAL SALES, IN CONTROL</p>
          <h1>From first enquiry to inventory-ready orders.</h1>
          <p>One clear view of your customers, product catalogue, enquiries and available stock.</p>
          <div className="showcase-points">
            <span><b>01</b> Capture customer enquiries</span>
            <span><b>02</b> Keep stock availability accurate</span>
            <span><b>03</b> Confirm orders with confidence</span>
          </div>
        </div>
        <span className="showcase-foot">A simpler way to run your sales desk</span>
      </section>
      <section className="auth-panel">
        <div className="auth-card">
          <div className="brand brand-dark"><span className="brand-mark">N</span> Northstar ERP</div>
          <p className="eyebrow auth-eyebrow">{mode === "login" ? "WELCOME BACK" : "GET STARTED"}</p>
          <h2>{mode === "login" ? "Sign in to your workspace" : "Create your account"}</h2>
          <p className="muted">
            {mode === "login"
              ? "Enter your details to access the sales dashboard."
              : "The first account becomes the workspace administrator."}
          </p>
          <form className="form-stack" onSubmit={submit}>
            {mode === "register" && (
              <label>Full name
                <input autoComplete="name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
              </label>
            )}
            <label>Email address
              <input type="email" autoComplete="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required />
            </label>
            <label>Password
              <input type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} minLength="6" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required />
            </label>
            {error && <div className="notice notice-error" role="alert">{error}</div>}
            <button className="button button-primary button-full" disabled={busy}>
              {busy ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
              {!busy && <span aria-hidden="true">→</span>}
            </button>
          </form>
          <p className="auth-switch">
            {mode === "login" ? "New to Northstar?" : "Already have an account?"}{" "}
            <button className="text-button" onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}>
              {mode === "login" ? "Create an account" : "Sign in"}
            </button>
          </p>
        </div>
      </section>
    </main>
  );
}
export default Login;