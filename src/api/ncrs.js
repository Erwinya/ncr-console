const API_BASE = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  const text = await response.text();
  let body = null;
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
  }

  if (!response.ok) {
    const message =
      (body && typeof body === "object" && (body.message || body.statusMessage || body.data)) ||
      (typeof body === "string" && body) ||
      `Request failed (${response.status})`;
    throw new Error(typeof message === "string" ? message : JSON.stringify(message));
  }

  // qms-ncr-service wraps payloads as { data, statusCode, statusMessage }
  if (body && typeof body === "object" && "data" in body) {
    return body.data;
  }
  return body;
}

export function listNcrs(status) {
  const query = status ? `?status=${encodeURIComponent(status)}` : "";
  return request(`/api/v1/ncrs${query}`);
}

export function createNcr(payload) {
  return request("/api/v1/ncrs", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateNcrStatus(id, payload) {
  return request(`/api/v1/ncrs/${id}/status`, {
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
