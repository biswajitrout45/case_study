export default function WorkspaceLayout({ user, page, onNavigate, onLogout, notice, error, loading, children }) {
  const navigation = [
    ["Overview", "⌂"],
    ["Enquiries", "▤"],
    ["Products", "▦"],
    ["Inventory", "◫"],
    ["Sales orders", "⇢"],
  ];

  return (
    <div className="flex min-h-screen max-md:flex-col">
      <aside className="fixed inset-y-0 left-0 z-30 flex w-[238px] shrink-0 flex-col bg-[#122037] px-[15px] pt-6 pb-3.5 text-slate-200 max-md:static max-md:w-full max-md:px-3 max-md:py-3">
        <div className="flex items-center gap-2.5 px-2 pb-7 text-base font-extrabold tracking-tight text-white"><span className="grid size-[31px] place-items-center rounded-lg bg-blue-600 font-extrabold">N</span> Northstar <span className="-ml-1 text-[10px] tracking-widest text-blue-200">ERP</span></div>
        <p className="mb-3 ml-2.5 mt-2 text-[9px] font-bold tracking-widest text-slate-400 max-md:hidden">WORKSPACE</p>
        <nav className="grid gap-1 max-md:grid-cols-5 max-md:gap-0.5" aria-label="Main navigation">
          {navigation.map(([label, icon]) => (
            <button key={label} className={`flex min-h-10 items-center gap-3 rounded-md px-3 text-left text-xs transition max-md:min-h-12 max-md:flex-col max-md:justify-center max-md:gap-0.5 max-md:px-0.5 max-md:py-1 max-md:text-[9px] ${page === label ? "bg-[#2b4263] font-semibold text-white" : "text-slate-300 hover:bg-white/10 hover:text-white"}`} onClick={() => onNavigate(label)}>
              <span className="w-[18px] text-center text-base text-blue-200 max-md:h-5">{icon}</span>{label}
            </button>
          ))}
        </nav>
        <div className="mt-auto grid gap-3 max-md:hidden">
          <div className="flex items-center gap-2.5 border-t border-white/10 px-2 py-3 text-slate-200">
            <span className="size-2 rounded-full bg-emerald-400 shadow-[0_0_0_4px_rgba(92,187,145,.14)]" />
            <div><strong className="block text-[11px] font-semibold">Workspace</strong><small className="mt-1 block text-[10px] text-slate-400">Sales & inventory</small></div>
          </div>
          <button className="flex items-center gap-2.5 rounded-lg bg-[#20324c] px-2 py-3 text-left text-slate-100 hover:bg-[#293d59]" onClick={onLogout}>
            <span className="grid size-[30px] shrink-0 place-items-center rounded-full bg-blue-100 text-xs font-bold text-blue-900">{user.name?.slice(0, 1).toUpperCase()}</span>
            <span className="min-w-0 flex-1 overflow-hidden"><strong className="block truncate text-[11px] font-semibold">{user.name}</strong><small className="mt-1 block text-[10px] text-slate-400">{user.role === "admin" ? "Administrator" : "Sales user"}</small></span>
            <span className="text-base text-slate-400" title="Sign out">↪</span>
          </button>
        </div>
      </aside>
      <main className="ml-[238px] min-h-screen w-[calc(100%-238px)] max-md:ml-0 max-md:w-full">
        <header className="flex h-[59px] items-center justify-between border-b border-slate-200 bg-white px-9 max-md:h-12 max-md:px-4">
          <div className="text-[11px] text-slate-500">Northstar <span className="px-2 text-slate-300">/</span> {page}</div>
          <div className="flex items-center gap-4">
            <span className="text-[11px] text-slate-500 max-md:hidden">{new Date().toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}</span>
            <span className="rounded bg-blue-50 px-2 py-1 text-[9px] font-bold tracking-wide text-blue-700">{user.role === "admin" ? "ADMIN" : "SALES"}</span>
          </div>
        </header>
        <div className="mx-auto max-w-[1500px] px-9 pt-8 pb-14 max-lg:px-6 max-md:px-3.5 max-md:pt-6 max-md:pb-10">
          {notice && <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800" role="status">{notice}</div>}
          {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{error}</div>}
          {loading ? <div className="grid min-h-[65vh] place-items-center text-sm text-slate-500">Loading your workspace…</div> : children}
        </div>
      </main>
    </div>
  );
}
