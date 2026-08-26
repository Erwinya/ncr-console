import { NEXT_STATUS } from "../api/ncrs.js";

function formatTime(value) {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

export default function NcrTable({
  ncrs,
  busy,
  statusDrafts,
  onDraftChange,
  onTransition,
}) {
  if (!ncrs.length) {
    return (
      <div className="panel empty">
        <h2>NCR queue</h2>
        <p className="muted">No NCRs yet. Create one on the left.</p>
      </div>
    );
  }

  return (
    <section className="panel table-panel">
      <div className="panel-head">
        <h2>NCR queue</h2>
        <p className="muted mono">
          {ncrs.length} record{ncrs.length === 1 ? "" : "s"}
        </p>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>NCR</th>
              <th>Title</th>
              <th>Severity</th>
              <th>Status</th>
              <th>Lot</th>
              <th>Updated</th>
              <th>Transition</th>
            </tr>
          </thead>
          <tbody>
            {ncrs.map((ncr) => {
              const nextOptions = NEXT_STATUS[ncr.status] || [];
              const draft = statusDrafts[ncr.id] || {
                status: nextOptions[0] || "",
                containmentAction: "",
                note: "",
              };
              return (
                <tr key={ncr.id}>
                  <td className="mono">{ncr.ncrNumber}</td>
                  <td>
                    <div>{ncr.title}</div>
                    <div className="muted small">{ncr.reportedBy}</div>
                  </td>
                  <td>
                    <span className={`pill sev-${ncr.severity}`}>{ncr.severity}</span>
                  </td>
                  <td>
                    <span className={`pill st-${ncr.status}`}>{ncr.status}</span>
                  </td>
                  <td className="mono">{ncr.lotNumber || "—"}</td>
                  <td className="muted">{formatTime(ncr.updatedAt)}</td>
                  <td>
                    {nextOptions.length === 0 ? (
                      <span className="muted">Terminal</span>
                    ) : (
                      <div className="transition">
                        <select
                          value={draft.status}
                          disabled={busy}
                          onChange={(e) =>
                            onDraftChange(ncr.id, { ...draft, status: e.target.value })
                          }
                        >
                          {nextOptions.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                        {draft.status === "CONTAINED" ? (
                          <input
                            placeholder="Containment action (required)"
                            value={draft.containmentAction}
                            disabled={busy}
                            onChange={(e) =>
                              onDraftChange(ncr.id, {
                                ...draft,
                                containmentAction: e.target.value,
                              })
                            }
                          />
                        ) : null}
                        <input
                          placeholder="Note (optional)"
                          value={draft.note}
                          disabled={busy}
                          onChange={(e) =>
                            onDraftChange(ncr.id, { ...draft, note: e.target.value })
                          }
                        />
                        <button
                          type="button"
                          className="btn subtle"
                          disabled={busy}
                          onClick={() => onTransition(ncr, draft)}
                        >
                          Apply
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
