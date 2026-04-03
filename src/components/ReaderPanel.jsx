export default function ReaderPanel({
  email,
  loading,
  canGoPrevious,
  canGoNext,
  onPrevious,
  onNext
}) {
  return (
    <section className="panel reader-panel">
      <div className="panel-head">
        <h2>Email Reader</h2>
        <div className="pager">
          <button onClick={onPrevious} disabled={!canGoPrevious}>
            Previous
          </button>
          <button onClick={onNext} disabled={!canGoNext}>
            Next
          </button>
        </div>
      </div>

      {loading ? (
        <p className="muted">Loading email...</p>
      ) : !email ? (
        <p className="muted">Select an email to read.</p>
      ) : (
        <>
          <div className="email-header">
            <h2>{email.subject || "(No Subject)"}</h2>
            <p><strong>From:</strong> {email.from || "Unknown sender"}</p>
            <p><strong>Date:</strong> {email.date || ""}</p>
          </div>
          <hr />
          {email.html ? (
            <div dangerouslySetInnerHTML={{ __html: email.html }} />
          ) : (
            <pre>{email.text || ""}</pre>
          )}
        </>
      )}
    </section>
  );
}
