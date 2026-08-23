/** Design-system helpers: everything the owner can restyle from the Studio. */
import { useEffect } from "react";

/* ----------------------------------------------------------------- fonts */
export const FONTS = [
  { name: "Bricolage Grotesque", weights: "300;400;500;600;700;800" },
  { name: "Manrope", weights: "300;400;500;600;700;800" },
  { name: "Inter", weights: "300;400;500;600;700;800" },
  { name: "Poppins", weights: "300;400;500;600;700;800" },
  { name: "Montserrat", weights: "300;400;500;600;700;800" },
  { name: "Sora", weights: "300;400;500;600;700;800" },
  { name: "Outfit", weights: "300;400;500;600;700;800" },
  { name: "DM Sans", weights: "300;400;500;600;700;800" },
  { name: "Figtree", weights: "300;400;500;600;700;800" },
  { name: "Plus Jakarta Sans", weights: "300;400;500;600;700;800" },
  { name: "Archivo", weights: "300;400;500;600;700;800" },
  { name: "Raleway", weights: "300;400;500;600;700;800" },
  { name: "Playfair Display", weights: "400;500;600;700;800" },
  { name: "Space Grotesk", weights: "300;400;500;600;700" },
  { name: "Oswald", weights: "300;400;500;600;700" },
  { name: "Lora", weights: "400;500;600;700" },
];

const fontMeta = (name) => FONTS.find((f) => f.name === name) || FONTS[0];

const fontUrl = (names) => {
  const uniq = [...new Set(names.filter(Boolean))];
  if (!uniq.length) return "";
  const parts = uniq.map((n) => `family=${encodeURIComponent(fontMeta(n).name).replace(/%20/g, "+")}:wght@${fontMeta(n).weights}`);
  return `https://fonts.googleapis.com/css2?${parts.join("&")}&display=swap`;
};

/* ----------------------------------------------------------------- colours */
export const hexToRgba = (hex, alpha = 1) => {
  const h = String(hex || "").replace("#", "");
  if (h.length !== 6) return `rgba(255,255,255,${alpha})`;
  const n = parseInt(h, 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
};

/* ----------------------------------------------------------------- layout */
export const PADDING = {
  compact: "py-12 sm:py-16",
  normal: "py-20 sm:py-28 lg:py-32",
  roomy: "py-28 sm:py-36 lg:py-44",
  huge: "py-36 sm:py-48 lg:py-56",
};
export const pad = (v) => PADDING[v] || PADDING.normal;

export const headBox = (align) => (align === "center" ? "mx-auto text-center" : "");
export const rowAlign = (align) => (align === "center" ? "items-center justify-center text-center" : "");

export const container = (theme) => ({ maxWidth: `${theme?.containerWidth || 1240}px` });

/* ----------------------------------------------------------------- surfaces */
export const surfaceBg = (theme) => theme?.surface || "#0a0a0c";
export const cardRadius = (theme, fallback) => `${theme?.cardRadius ?? fallback ?? 24}px`;
export const ring = (theme, mult = 1) =>
  `inset 0 0 0 1px ${hexToRgba(theme?.borderColor || "#ffffff", Math.min(1, ((theme?.borderOpacity ?? 8) / 100) * mult))}`;

export const cardStyle = (theme, radiusFallback) => ({
  backgroundColor: surfaceBg(theme),
  borderRadius: cardRadius(theme, radiusFallback),
  boxShadow: ring(theme),
});

/* ----------------------------------------------------------------- buttons */
const SHAPES = { pill: "rounded-full", rounded: "rounded-2xl", square: "rounded-lg" };
const SIZES = {
  sm: "px-5 py-3 text-[13px]",
  md: "px-7 py-4 text-sm sm:py-3.5",
  lg: "px-9 py-5 text-[15px] sm:py-4",
};

export const btnShape = (theme) => SHAPES[theme?.buttons?.shape] || SHAPES.pill;
export const btnSize = (theme) => SIZES[theme?.buttons?.size] || SIZES.md;
export const btnIcons = (theme) => theme?.buttons?.showIcons !== false;

export const primaryBtn = (theme) => ({
  className: `group flex items-center justify-center gap-2 font-bold transition-transform duration-300 hover:-translate-y-0.5 ${btnShape(theme)} ${btnSize(theme)}`,
  style: { backgroundColor: theme?.buttons?.primaryBg || "#ffffff", color: theme?.buttons?.primaryText || "#000000" },
});

export const secondaryBtn = (theme) => {
  const s = theme?.buttons?.secondaryStyle || "outline";
  const base = `flex items-center justify-center gap-2 font-semibold transition-colors duration-300 ${btnShape(theme)} ${btnSize(theme)}`;
  if (s === "solid") {
    return { className: `${base} bg-white/[0.08] text-white hover:bg-white/[0.14]`, style: {} };
  }
  if (s === "ghost") {
    return { className: `${base} text-white/70 hover:text-white`, style: {} };
  }
  return { className: `${base} border border-white/15 text-white/80 hover:border-white/35 hover:text-white`, style: {} };
};

/* ----------------------------------------------------------------- icons */
export const iconBox = (theme, accent) => {
  const style = theme?.icons?.style || "soft";
  if (style === "plain") return { backgroundColor: "transparent", boxShadow: "none" };
  if (style === "outline") return { backgroundColor: "transparent", boxShadow: `inset 0 0 0 1px ${accent}55` };
  return { backgroundColor: `${accent}16`, boxShadow: `inset 0 0 0 1px ${accent}30` };
};
export const iconScale = (theme) => Math.max(0.6, Math.min(1.6, (theme?.icons?.size || 100) / 100));

/* ----------------------------------------------------------------- root vars */
export const useThemeSetup = (theme) => {
  const display = theme?.fonts?.display || "Bricolage Grotesque";
  const body = theme?.fonts?.body || "Manrope";
  const scale = theme?.fonts?.scale || 100;
  const weight = theme?.fonts?.headingWeight || 800;
  const bg = theme?.bg || "#050505";
  const accent = theme?.accent || "#60d6ff";
  const accentDeep = theme?.accentDeep || "#2563eb";

  useEffect(() => {
    const url = fontUrl([display, body]);
    if (!url) return undefined;
    const id = "sg-fonts";
    let link = document.getElementById(id);
    if (!link) {
      link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      document.head.appendChild(link);
    }
    if (link.href !== url) link.href = url;
    return undefined;
  }, [display, body]);

  useEffect(() => {
    const r = document.documentElement;
    r.style.setProperty("--font-display", `"${display}"`);
    r.style.setProperty("--font-body", `"${body}"`);
    r.style.setProperty("--font-scale", String(scale / 100));
    r.style.setProperty("--heading-weight", String(weight));
    r.style.setProperty("--void", bg);
    r.style.setProperty("--sg-accent", accent);
    r.style.setProperty("--sg-accent-deep", accentDeep);
  }, [display, body, scale, weight, bg, accent, accentDeep]);
};
