export default function Sidebar({
  isLoggedIn,
  profileLabel,
  onRefresh,
  onToggleCompose,
  onLogout
}) {
  return (
    <aside className="sidebar">
      <h1>Mini Gmail</h1>
      <p className="muted">React + Netlify</p>

      {isLoggedIn ? (
        <div className="nav-group">
          <div className="badge">{profileLabel || "Logged in"}</div>
          <button onClick={onRefresh}>Refresh Inbox</button>
          <button className="secondary" onClick={onToggleCompose}>Show / Hide Compose</button>
          <button className="danger" onClick={onLogout}>Logout</button>
        </div>
      ) : (
        <div className="nav-group">
          <p className="muted">Login or create an account to continue.</p>
        </div>
      )}
    </aside>
  );
}
