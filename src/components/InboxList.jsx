export default function InboxList({
  emails,
  selectedUid,
  loading,
  status,
  page,
  onOpenEmail,
  onLoadPreviousPage,
  onLoadNextPage
}) {
  return (
    <section className="panel inbox-panel">
      <div className="panel-head">
        <h2>Inbox</h2>
        <span className="badge">Page {page + 1}</span>
      </div>

      <div className="status">{loading ? "Loading..." : status}</div>

      <div className="pager">
        <button onClick={onLoadPreviousPage} disabled={page === 0}>
          Previous Page
        </button>
        <button onClick={onLoadNextPage}>
          Next Page
        </button>
      </div>

      <div className="mail-list">
        {!emails.length ? (
          <p className="muted">No emails loaded.</p>
        ) : (
          emails.map((email) => (
            <div
              key={email.uid}
              className={`mail-item ${String(selectedUid) === String(email.uid) ? "active" : ""}`}
              onClick={() => onOpenEmail(String(email.uid))}
            >
              <div className="mail-subject">{email.subject || "(No Subject)"}</div>
              <div className="mail-meta">From: {email.from || "Unknown sender"}</div>
              <div className="mail-meta">Date: {email.date || ""}</div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
