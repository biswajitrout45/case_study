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
    <main className="grid min-h-screen grid-cols-[minmax(370px,.88fr)_1.12fr] bg-white max-md:grid-cols-1">
      <section className="relative flex min-h-screen flex-col justify-between overflow-hidden bg-[radial-gradient(ellipse_at_15%_92%,rgba(72,127,204,.3),transparent_50%),linear-gradient(145deg,#1b3454_5%,#12223b_100%)] px-[clamp(36px,6vw,88px)] py-10 text-white max-md:hidden">
        <div className="flex items-center gap-2.5 text-base font-extrabold tracking-tight"><span className="grid size-[31px] place-items-center rounded-lg bg-blue-500 font-extrabold text-white">N</span> Northstar ERP</div>
        <div className="relative z-10 my-12 max-w-xl">
          <p className="mb-3 text-[10px] font-bold tracking-[0.14em] text-blue-200">INDUSTRIAL SALES, IN CONTROL</p>
          <h1 className="max-w-xl text-[clamp(36px,4.1vw,56px)] font-bold leading-[1.12] tracking-tight">From first enquiry to inventory-ready orders.</h1>
          <p className="mt-5 max-w-md text-[15px] leading-7 text-slate-300">One clear view of your customers, product catalogue, enquiries and available stock.</p>
          <div className="mt-11 grid gap-4 text-[13px] text-slate-200">
            <span className="flex items-center gap-3.5"><b className="text-[10px] tracking-wider text-blue-300">01</b> Capture customer enquiries</span>
            <span className="flex items-center gap-3.5"><b className="text-[10px] tracking-wider text-blue-300">02</b> Keep stock availability accurate</span>
            <span className="flex items-center gap-3.5"><b className="text-[10px] tracking-wider text-blue-300">03</b> Confirm orders with confidence</span>
          </div>
        </div>
        <span className="relative z-10 text-[11px] text-slate-400">A simpler way to run your sales desk</span>
      </section>
      <section className="grid min-h-screen place-items-center p-10 max-sm:p-6">
        <div className="w-full max-w-[410px]">
          <div className="mb-14 flex items-center gap-2.5 text-base font-extrabold tracking-tight text-slate-800"><span className="grid size-[31px] place-items-center rounded-lg bg-blue-600 font-extrabold text-white">N</span> Northstar ERP</div>
          <p className="mb-3 text-[10px] font-bold tracking-[0.14em] text-blue-600">{mode === "login" ? "WELCOME BACK" : "GET STARTED"}</p>
          <h2 className="mb-2 text-[27px] font-bold leading-snug tracking-tight text-slate-800">{mode === "login" ? "Sign in to your workspace" : "Create your account"}</h2>
          <p className="mb-7 text-[13px] leading-relaxed text-slate-500">
            {mode === "login"
              ? "Enter your details to access the sales dashboard."
              : "The first account becomes the workspace administrator."}
          </p>
          <form className="grid gap-5" onSubmit={submit}>
            {mode === "register" && (
              <label className="grid gap-2 text-xs font-semibold text-slate-700">Full name
                <input className="min-h-11 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-normal text-slate-800 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100" autoComplete="name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
              </label>
            )}
            <label className="grid gap-2 text-xs font-semibold text-slate-700">Email address
              <input className="min-h-11 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-normal text-slate-800 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100" type="email" autoComplete="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required />
            </label>
            <label className="grid gap-2 text-xs font-semibold text-slate-700">Password
              <input className="min-h-11 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-normal text-slate-800 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100" type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} minLength="6" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required />
            </label>
            {error && <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-xs leading-relaxed text-red-700" role="alert">{error}</div>}
            <button className="mt-1 inline-flex min-h-11 w-full items-center justify-center gap-3 rounded-lg bg-blue-600 px-4 text-xs font-bold text-white transition hover:bg-blue-700 active:translate-y-px disabled:cursor-wait disabled:opacity-60" disabled={busy}>
              {busy ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
              {!busy && <span aria-hidden="true">→</span>}
            </button>
          </form>
          <p className="mt-6 text-center text-xs text-slate-500">
            {mode === "login" ? "New to Northstar?" : "Already have an account?"}{" "}
            <button className="font-bold text-blue-600 hover:text-blue-800 hover:underline" onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}>
              {mode === "login" ? "Create an account" : "Sign in"}
            </button>
          </p>
        </div>
      </section>
    </main>
  );
}
export default Login;