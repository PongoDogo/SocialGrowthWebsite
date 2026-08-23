const API = process.env.REACT_APP_BACKEND_URL;
const KEY = "sg-studio-token";

export const getToken = () => {
  try {
    return localStorage.getItem(KEY) || "";
  } catch {
    return "";
  }
};
export const setToken = (t) => {
  try {
    localStorage.setItem(KEY, t);
  } catch {
    /* ignore */
  }
};
export const clearToken = () => {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
};

export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

const request = async (path, { method = "GET", body, form, auth = true } = {}) => {
  const headers = {};
  if (auth) headers.Authorization = `Bearer ${getToken()}`;
  let payload;
  if (form) {
    payload = form;
  } else if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }

  const res = await fetch(`${API}${path}`, { method, headers, body: payload });
  if (res.status === 401 && auth) {
    clearToken();
    throw new ApiError(401, "Session expired");
  }
  let data = null;
  const text = await res.text();
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { detail: text };
  }
  if (!res.ok) throw new ApiError(res.status, data?.detail || `HTTP ${res.status}`);
  return data;
};

export const api = {
  login: (password, remember = true) =>
    request("/api/admin/login", { method: "POST", body: { password, remember }, auth: false }),
  session: () => request("/api/admin/session"),
  changePassword: (current, next) => request("/api/admin/password", { method: "POST", body: { current, next } }),

  content: (stage = "draft") => request(`/api/admin/content?stage=${stage}`),
  saveDraft: (data) => request("/api/admin/content", { method: "PUT", body: { data } }),
  publish: () => request("/api/admin/publish", { method: "POST" }),
  discard: () => request("/api/admin/discard", { method: "POST" }),
  reset: () => request("/api/admin/reset", { method: "POST" }),
  revisions: () => request("/api/admin/revisions"),
  restoreRevision: (id) => request(`/api/admin/revisions/${id}/restore`, { method: "POST" }),

  uploadMedia: (file, opts = {}) => {
    const form = new FormData();
    form.append("file", file);
    Object.entries(opts).forEach(([k, v]) => form.append(k, String(v)));
    return request("/api/admin/media", { method: "POST", form });
  },
  media: () => request("/api/admin/media"),
  deleteMedia: (id) => request(`/api/admin/media/${id}`, { method: "DELETE" }),

  contacts: () => request("/api/admin/contacts"),
  deleteContact: (id) => request(`/api/admin/contacts/${id}`, { method: "DELETE" }),
  overview: () => request("/api/admin/overview"),
};

export const mediaSrc = (url) => {
  if (!url) return "";
  if (url.startsWith("http") || url.startsWith("data:")) return url;
  if (url.startsWith("/api/")) return `${API}${url}`;
  return url;
};

export const SITE_ORIGIN = window.location.origin;
