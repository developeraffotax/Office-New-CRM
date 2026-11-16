// src/pages/aiApi.js — shared API helpers for AgentChat.jsx and KnowledgeBase.jsx.
// Your server reads the raw JWT from the Authorization header (no "Bearer " prefix, no cookies).
import axios from "axios";

export const API = `${process.env.REACT_APP_API_URL || ""}/api/v2/ai`;

// ⚠ ADAPT: return the JWT the way your app stores it after login.
export function getToken() {
  try {
    const raw = localStorage.getItem("auth"); // e.g. { user, token }
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.token) return parsed.token;
    }
  } catch {
    /* fall through */
  }
  return localStorage.getItem("token") || "";
}

export const authHeaders = () => {
  const t = getToken();
  return t ? { Authorization: t } : {};
};

const withAuth = (instance) => {
  instance.interceptors.request.use((config) => {
    const t = getToken();
    if (t) config.headers.Authorization = t;
    return config;
  });
  return instance;
};

export const http = withAuth(axios.create({ baseURL: API })); // /api/v2/ai
export const kbHttp = withAuth(axios.create({ baseURL: `${API}/kb` })); // /api/v2/ai/kb

export const errMsg = (e) => e?.response?.data?.message || e?.message || "Something went wrong";
