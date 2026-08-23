import React, { createContext, useContext, useState, useCallback, useEffect } from "react";

const LangContext = createContext(null);

const initialLang = () => {
  try {
    const q = new URLSearchParams(window.location.search).get("lang");
    if (q === "el" || q === "en") return q;
    return localStorage.getItem("sg-lang") === "en" ? "en" : "el";
  } catch {
    return "el";
  }
};

export const LangProvider = ({ children }) => {
  const [lang, setLang] = useState(initialLang);

  useEffect(() => {
    try {
      localStorage.setItem("sg-lang", lang);
      document.documentElement.lang = lang;
    } catch {
      /* ignore */
    }
  }, [lang]);

  // The Studio preview can drive the language of the embedded site.
  useEffect(() => {
    const onMsg = (e) => {
      if (e?.data?.type === "sg-preview-lang" && (e.data.lang === "el" || e.data.lang === "en")) {
        setLang(e.data.lang);
      }
    };
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, []);

  const toggle = useCallback(() => setLang((l) => (l === "el" ? "en" : "el")), []);

  return <LangContext.Provider value={{ lang, setLang, toggle }}>{children}</LangContext.Provider>;
};

export const useLang = () => useContext(LangContext) || { lang: "el", setLang: () => {}, toggle: () => {} };
