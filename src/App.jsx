import { useCallback, useEffect, useRef, useState } from "react";
import { createNcr, listNcrs, updateNcrStatus } from "./api/ncrs.js";
import NcrCreateForm, { emptyCreateForm } from "./components/NcrCreateForm.jsx";
import NcrTable from "./components/NcrTable.jsx";
import "./App.css";

export default function App() {
  const [ncrs, setNcrs] = useState([]);
  const [form, setForm] = useState(emptyCreateForm);
  const [statusDrafts, setStatusDrafts] = useState({});
  const [filter, setFilter] = useState("");
  const [listBusy, setListBusy] = useState(false);
  const [mutateBusy, setMutateBusy] = useState(false);
  const [status, setStatus] = useState("Loading NCRs…");
  const [error, setError] = useState("");
  const requestId = useRef(0);
  const abortRef = useRef(null);

  const refresh = useCallback(async () => {
    if (abortRef.current) {
      abortRef.current.abort();
    }
    const controller = new AbortController();
    abortRef.current = controller;
    const id = ++requestId.current;
    setListBusy(true);
    setError("");
    try {
      const data = await listNcrs(filter || undefined, { signal: controller.signal });
      if (id !== requestId.current) return;
      setNcrs(Array.isArray(data) ? data : []);
      setStatus(`Loaded ${Array.isArray(data) ? data.length : 0} NCR(s)`);
    } catch (err) {
      if (err?.name === "AbortError") return;
      if (id !== requestId.current) return;
      setError(err.message || String(err));
      setStatus("API unavailable — start qms-ncr-service on :8082");
    } finally {
      if (id === requestId.current) {
        setListBusy(false);
      }
    }
  }, [filter]);

  useEffect(() => {
    refresh();
    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
  }, [refresh]);

  function onChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function onCreate(event) {
    event.preventDefault();
    setMutateBusy(true);
    setError("");
    try {
      const created = await createNcr({
        title: form.title.trim(),
        description: form.description.trim(),
        severity: form.severity,
        lotNumber: form.lotNumber.trim() || null,
        partNumber: form.partNumber.trim() || null,
        reportedBy: form.reportedBy.trim(),
      });
      setForm(emptyCreateForm);
      setStatus(`Created ${created.ncrNumber}`);
      await refresh();
    } catch (err) {
      setError(err.message || String(err));
    } finally {
      setMutateBusy(false);
    }
  }

  function onDraftChange(id, draft) {
    setStatusDrafts((prev) => ({ ...prev, [id]: draft }));
  }

  async function onTransition(ncr, draft) {
    if (!draft.status) return;
    if (draft.status === "CONTAINED" && !draft.containmentAction.trim() && !ncr.containmentAction) {
      setError("containmentAction is required when moving to CONTAINED");
      return;
    }
    setMutateBusy(true);
    setError("");
    try {
      const payload = {
        status: draft.status,
        note: draft.note.trim() || null,
      };
      if (draft.status === "CONTAINED") {
        payload.containmentAction = draft.containmentAction.trim() || ncr.containmentAction;
      }
      const updated = await updateNcrStatus(ncr.id, payload);
      setStatus(`Updated ${updated.ncrNumber} → ${updated.status}`);
      setStatusDrafts((prev) => {
        const next = { ...prev };
        delete next[ncr.id];
        return next;
      });
      await refresh();
    } catch (err) {
      setError(err.message || String(err));
    } finally {
      setMutateBusy(false);
    }
  }

  const busy = listBusy || mutateBusy;

  return (
    <div className="page">
      <header className="top">
        <div>
          <p className="kicker">NCR Console</p>
          <h1>Drive nonconformance workflow</h1>
          <p className="lede">
            Create NCRs and apply status transitions against{" "}
            <code className="mono">qms-ncr-service</code>. Local proxy targets{" "}
            <code className="mono">http://localhost:8082</code>.
          </p>
        </div>
        <div className="top-actions">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            disabled={listBusy}
            aria-label="Filter by status"
          >
            <option value="">All statuses</option>
            <option value="OPEN">OPEN</option>
            <option value="UNDER_REVIEW">UNDER_REVIEW</option>
            <option value="CONTAINED">CONTAINED</option>
            <option value="CLOSED">CLOSED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
          <button type="button" className="btn subtle" onClick={refresh} disabled={listBusy}>
            Refresh
          </button>
        </div>
      </header>

      <div className="status-row" aria-live="polite">
        <span className="mono muted">{status}</span>
        {error ? <span className="error" role="alert">{error}</span> : null}
      </div>

      <main className="layout">
        <NcrCreateForm form={form} onChange={onChange} onSubmit={onCreate} busy={mutateBusy} />
        <NcrTable
          ncrs={ncrs}
          busy={busy}
          listBusy={listBusy}
          mutateBusy={mutateBusy}
          statusDrafts={statusDrafts}
          onDraftChange={onDraftChange}
          onTransition={onTransition}
          filter={filter}
          apiError={Boolean(error)}
        />
      </main>
    </div>
  );
}
