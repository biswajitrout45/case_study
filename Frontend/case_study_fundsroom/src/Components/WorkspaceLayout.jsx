export default function WorkspaceLayout({ user, page, onNavigate, onLogout, notice, error, loading, children }) {
  const navigation = [
    ["Overview", "⌂"],
    ["Enquiries", "▤"],
    ["Products", "▦"],
    ["Inventory", "◫"],
    ["Sales orders", "⇢"],
  ];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand brand-light"><span className="brand-mark">N</span> Northstar <span className="brand-tag">ERP</span></div>
        <p className="nav-caption">WORKSPACE</p>
        <nav className="side-nav" aria-label="Main navigation">
          {navigation.map(([label, icon]) => (
            <button key={label} className={`nav-item ${page === label ? "active" : ""}`} onClick={() => onNavigate(label)}>
              <span className="nav-icon">{icon}</span>{label}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="workspace-card">
            <span className="workspace-indicator" />
            <div><strong>Workspace</strong><small>Sales & inventory</small></div>
          </div>
          <button className="user-card" onClick={onLogout}>
            <span className="avatar">{user.name?.slice(0, 1).toUpperCase()}</span>
            <span className="user-copy"><strong>{user.name}</strong><small>{user.role === "admin" ? "Administrator" : "Sales user"}</small></span>
            <span className="logout-icon" title="Sign out">↪</span>
          </button>
        </div>
      </aside>
      <main className="main-area">
        <header className="topbar">
          <div className="breadcrumb">Northstar <span>/</span> {page}</div>
          <div className="topbar-right">
            <span className="today-label">{new Date().toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}</span>
            <span className="role-pill">{user.role === "admin" ? "ADMIN" : "SALES"}</span>
          </div>
        </header>
        <div className="page-content">
          {notice && <div className="notice notice-success" role="status">{notice}</div>}
          {error && <div className="notice notice-error" role="alert">{error}</div>}
          {loading ? <div className="loading-state">Loading your workspace…</div> : children}
        </div>
      </main>
    </div>
  );
}
