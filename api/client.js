import { API_BASE } from "../contexts/AuthContext";

export const apiFetch = async (path, { token, method = "GET", body } = {}) => {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  let data = null;
  try {
    data = await res.json();
  } catch {}
  if (!res.ok) throw { status: res.status, data };
  return data;
};
