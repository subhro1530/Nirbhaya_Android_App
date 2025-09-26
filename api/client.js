import { API_BASE } from "../contexts/AuthContext";

export const apiFetch = async (
  rawPath,
  { token, method = "GET", body } = {}
) => {
  // normalize path (allow with or without leading slash)
  const path = rawPath.startsWith("/") ? rawPath : `/${rawPath}`;
  let res,
    data = null,
    text = "";
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token.trim()}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (netErr) {
    throw {
      network: true,
      message: "Network error / server unreachable",
      detail: netErr?.message,
    };
  }

  // attempt json first
  try {
    data = await res.clone().json();
  } catch {
    try {
      text = await res.text();
    } catch {}
  }

  if (!res.ok) {
    const backendMsg =
      data?.message || data?.error || text || `HTTP ${res.status}`;
    throw { status: res.status, message: backendMsg, data };
  }

  return data ?? (text ? { raw: text } : null);
};
