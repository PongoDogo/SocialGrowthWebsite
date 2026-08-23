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
  const [content, setContent] = useState(DEFAULTS);
  const [source, setSource] = useState("defaults");
  const preview = useMemo(isPreview, []);

  // Live preview: the Studio pushes the draft tree into this iframe as the owner types.
  useEffect(() => {
    if (!preview) return undefined;
    const onMsg = (e) => {
      if (e?.data?.type === "sg-preview-content" && e.data.content) {
        setContent(e.data.content);
        setSource("preview");
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

  // Public visitors always read the published tree.
  useEffect(() => {
    if (preview) return undefined;
    let alive = true;
    (async () => {
      try {
        const r = await fetch(`${API}/api/content`, { cache: "no-store" });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const j = await r.json();
        if (alive && j?.data) {
          setContent(j.data);
          setSource("api");
        }
      } catch {
        // keep the bundled defaults - the site must never render empty
      }
    })();
    return () => {
      alive = false;
    };
  }, [preview]);

  const value = useMemo(() => ({ content, setContent, source, preview }), [content, source, preview]);
  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
};

export const useContent = () => {
  const ctx = useContext(ContentContext);
  return ctx || { content: DEFAULTS, source: "defaults", preview: false };
};

/** Convenience hook: content + a language-aware text getter. */
export const useSite = (lang) => {
  const { content, preview, source } = useContent();
  const L = useCallback((field) => pick(field, lang), [lang]);
  return { c: content, L, preview, source };
};

export { DEFAULTS };
