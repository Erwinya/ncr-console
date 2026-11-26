const API_BASE = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

async function request(path, options = {}) {
  const { headers: extraHeaders, body, signal, ...rest } = options;
  const headers = { ...(extraHeaders || {}) };
  if (body !== undefined && body !== null) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...rest,
    headers,
    body,
    signal,
  });

  const text = await response.text();
  let parsed = null;
  if (text) {
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = text;
    }
  }

  if (!response.ok) {
    const message =
      (parsed && typeof parsed === "object" && (parsed.message || parsed.statusMessage || parsed.data)) ||
      (typeof parsed === "string" && parsed) ||
      `Request failed (${response.status})`;
    throw new Error(typeof message === "string" ? message : JSON.stringify(message));
  }

  // qms-ncr-service wraps payloads as { data, statusCode, statusMessage }
  if (parsed && typeof parsed === "object" && "data" in parsed) {
    return parsed.data;
  }
  return parsed;
}

export function listNcrs(status, options = {}) {
  const query = status ? `?status=${encodeURIComponent(status)}` : "";
  return request(`/api/v1/ncrs${query}`, { signal: options.signal });
}

export function createNcr(payload) {
  return request("/api/v1/ncrs", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateNcrStatus(id, payload) {
  return request(`/api/v1/ncrs/${encodeURIComponent(id)}/status`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export const SEVERITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
export const STATUSES = ["OPEN", "UNDER_REVIEW", "CONTAINED", "CLOSED", "CANCELLED"];

export const NEXT_STATUS = {
  OPEN: ["UNDER_REVIEW", "CANCELLED"],
  UNDER_REVIEW: ["CONTAINED", "CLOSED", "CANCELLED"],
  CONTAINED: ["CLOSED", "UNDER_REVIEW"],
  CLOSED: [],
  CANCELLED: [],
};
