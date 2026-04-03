import { useState } from "react";

export default function ComposePanel({ status, onSend }) {
  const [form, setForm] = useState({
    to: "",
    subject: "",
    message: ""
  });

  async function submit(event) {
    event.preventDefault();
    try {
      await onSend(form);
      setForm({ to: "", subject: "", message: "" });
    } catch (error) {
      console.error("COMPOSE ERROR:", error);
    }
  }

  return (
    <section className="panel compose-panel">
      <div className="panel-head">
        <h2>Compose Email</h2>
      </div>

      <form className="stack" onSubmit={submit}>
        <input
          type="email"
          placeholder="To"
          value={form.to}
          onChange={(e) => setForm((prev) => ({ ...prev, to: e.target.value }))}
          required
        />
        <input
          type="text"
          placeholder="Subject"
          value={form.subject}
          onChange={(e) => setForm((prev) => ({ ...prev, subject: e.target.value }))}
          required
        />
        <textarea
          rows="10"
          placeholder="Write your email..."
          value={form.message}
          onChange={(e) => setForm((prev) => ({ ...prev, message: e.target.value }))}
          required
        />
        <button type="submit">Send Email</button>
        <div className="status">{status}</div>
      </form>
    </section>
  );
}
