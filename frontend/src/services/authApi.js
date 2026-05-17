const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";

async function request(path, { method = "POST", payload, token } = {}) {
  const headers = {
    "Content-Type": "application/json"
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: payload ? JSON.stringify(payload) : undefined
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
}

export function registerUser(payload) {
  return request("/auth/register", { payload });
}

export function loginUser(payload) {
  return request("/auth/login", { payload });
}

export function getMyProfile(token) {
  return request("/auth/me", { method: "GET", token });
}
