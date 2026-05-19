const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";

async function request(path, { method = "GET", payload } = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json"
    },
    body: payload ? JSON.stringify(payload) : undefined
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }
  return data;
}

export function listBloodDonors() {
  return request("/blood/donors");
}

export function createBloodDonor(payload) {
  return request("/blood/donors", { method: "POST", payload });
}

export function listBloodRequests() {
  return request("/blood/requests");
}

export function createBloodRequest(payload) {
  return request("/blood/requests", { method: "POST", payload });
}

export function submitDonorResponse(requestId, payload) {
  return request(`/blood/requests/${encodeURIComponent(requestId)}/donor-response`, {
    method: "PATCH",
    payload
  });
}

export function updateBloodRequestStatus(requestId, payload) {
  return request(`/blood/requests/${encodeURIComponent(requestId)}/status`, {
    method: "PATCH",
    payload
  });
}
