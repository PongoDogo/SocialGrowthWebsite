import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import DEFAULTS from "@/content/defaults.json";

const API = process.env.REACT_APP_BACKEND_URL;

const ContentContext = createContext(null);

/** Read a bilingual field: {el, en} -> string. Also tolerates plain strings. */
export const pick = (field, lang) => {
  if (field === null || field === undefined) return "";
  if (typeof field === "string" || typeof field === "number") return String(field);
  return field[lang] ?? field.el ?? field.en ?? "";
};

/** Media stored in Mongo is served through the API; local files stay as-is. */
export const mediaUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http") || url.startsWith("data:")) return url;
  if (url.startsWith("/api/")) return `${API}${url}`;
  return url;
};

const isPreview = () => {
  try {
    return new URLSearchParams(window.location.search).get("__sgpreview") === "1";
  } catch {
    return false;
  }
};

export const ContentProvider = ({ children }) => {
  const preview = useMemo(isPreview, []);
  const [content, setContent] = useState(DEFAULTS);
  const [source, setSource] = useState(preview ? "defaults" : "loading");
  const [status, setStatus] = useState(preview ? "ready" : "loading");
  const [retryKey, setRetryKey] = useState(0);

  // Live preview: the Studio pushes the draft tree into this iframe as the owner types.
  // Preview must mount immediately so it can announce readiness to the parent Studio.
  useEffect(() => {
    if (!preview) return undefined;
    const onMsg = (e) => {
      if (e?.data?.type === "sg-preview-content" && e.data.content) {
        setContent(e.data.content);
        setSource("preview");
        setStatus("ready");
      }
    };
    window.addEventListener("message", onMsg);
    try {
      window.parent?.postMessage({ type: "sg-preview-ready" }, "*");
    } catch {
      /* ignore */
    }
    return () => window.removeEventListener("message", onMsg);
  }, [preview]);

  // Public visitors must not render bundled defaults first. The published tree is
  // the source of truth, so wait for it before mounting the real site UI.
  useEffect(() => {
    if (preview) return undefined;
    let alive = true;
    setStatus("loading");
    setSource("loading");

    (async () => {
      try {
        const r = await fetch(`${API}/api/content`, { cache: "no-store" });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const j = await r.json();
        if (!j?.data) throw new Error("Published content missing");
        if (!alive) return;
        setContent(j.data);
        setSource("api");
        setStatus("ready");
      } catch {
        if (!alive) return;
        setSource("error");
        setStatus("error");
      }
    })();

    return () => {
      alive = false;
    };
  }, [preview, retryKey]);

  const value = useMemo(() => ({ content, setContent, source, preview, status }), [content, source, preview, status]);

  return (
    <ContentContext.Provider value={value}>
      {preview || status === "ready" ? (
        children
      ) : status === "error" ? (
        <div
          style={{
            minHeight: "100vh",
            display: "grid",
            placeItems: "center",
            padding: "24px",
            background: "#050505",
            color: "#fff",
            fontFamily: "Manrope, system-ui, sans-serif",
            textAlign: "center",
          }}
        >
          <div>
            <div style={{ fontSize: "18px", fontWeight: 700, marginBottom: "8px" }}>Unable to load the site</div>
            <div style={{ fontSize: "14px", opacity: 0.65, marginBottom: "18px" }}>Please try again.</div>
            <button
              type="button"
              onClick={() => setRetryKey((value) => value + 1)}
              style={{
                border: "1px solid rgba(255,255,255,.18)",
                borderRadius: "10px",
                padding: "10px 16px",
                background: "rgba(255,255,255,.06)",
                color: "#fff",
                cursor: "pointer",
              }}
            >
              Retry
            </button>
          </div>
        </div>
      ) : (
        <div
          aria-hidden="true"
          style={{ minHeight: "100vh", background: "#050505" }}
        />
      )}
    </ContentContext.Provider>
  );
};

export const useContent = () => {
  const ctx = useContext(ContentContext);
  return ctx || { content: DEFAULTS, source: "defaults", preview: false, status: "ready" };
};

/** Convenience hook: content + a language-aware text getter. */
export const useSite = (lang) => {
  const { content, preview, source, status } = useContent();
  const L = useCallback((field) => pick(field, lang), [lang]);
  return { c: content, L, preview, source, status };
};

export { DEFAULTS };
