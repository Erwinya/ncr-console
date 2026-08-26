import { SEVERITIES } from "../api/ncrs.js";

const empty = {
  title: "",
  description: "",
  severity: "MEDIUM",
  lotNumber: "",
  partNumber: "",
  reportedBy: "",
};

export { empty as emptyCreateForm };

export default function NcrCreateForm({ form, onChange, onSubmit, busy }) {
  return (
    <form className="panel form" onSubmit={onSubmit}>
      <div className="panel-head">
        <h2>Create NCR</h2>
        <p className="muted">POST /api/v1/ncrs</p>
      </div>

      <label>
        Title
        <input name="title" value={form.title} onChange={onChange} required maxLength={200} disabled={busy} />
      </label>

      <label>
        Description
        <textarea
          name="description"
          value={form.description}
          onChange={onChange}
          required
          maxLength={4000}
          rows={4}
          disabled={busy}
        />
      </label>

      <label>
        Severity
        <select name="severity" value={form.severity} onChange={onChange} disabled={busy}>
          {SEVERITIES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </label>

      <label>
        Lot number
        <input name="lotNumber" value={form.lotNumber} onChange={onChange} maxLength={100} disabled={busy} />
      </label>

      <label>
        Part number
        <input name="partNumber" value={form.partNumber} onChange={onChange} maxLength={100} disabled={busy} />
      </label>

      <label>
        Reported by
        <input
          name="reportedBy"
          value={form.reportedBy}
          onChange={onChange}
          required
          maxLength={120}
          placeholder="qa.inspector"
          disabled={busy}
        />
      </label>

      <div className="actions">
        <button type="submit" className="btn" disabled={busy}>
          Create NCR
        </button>
      </div>
    </form>
  );
}
