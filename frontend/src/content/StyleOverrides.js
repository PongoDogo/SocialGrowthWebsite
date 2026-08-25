/** Turns the editable `styles` map into real CSS, plus optional light-mode ink. */
import React, { useMemo } from "react";

const num = (v) => (v === "" || v === null || v === undefined || Number.isNaN(Number(v)) ? null : Number(v));

const hexToTriple = (hex, fallback = "255 255 255") => {
  const h = String(hex || "").replace("#", "").trim();
  if (h.length !== 6) return fallback;
  const n = parseInt(h, 16);
  if (Number.isNaN(n)) return fallback;
  return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`;
};

/** One style object -> css declarations (all !important so Tailwind never wins). */
export const declarations = (s) => {
  if (!s || typeof s !== "object") return "";
  const out = [];
  const push = (prop, value) => out.push(`${prop}:${value} !important`);

  if (s.hidden) push("display", "none");
  if (num(s.fontSize)) push("font-size", `${num(s.fontSize)}px`);
  if (num(s.fontWeight)) push("font-weight", String(num(s.fontWeight)));
  if (num(s.letterSpacing) !== null) push("letter-spacing", `${num(s.letterSpacing)}px`);
  if (num(s.lineHeight)) push("line-height", String(num(s.lineHeight)));
  if (s.textAlign) push("text-align", s.textAlign);
  if (s.textTransform) push("text-transform", s.textTransform);
  if (s.font) push("font-family", `"${s.font}"`);
  if (s.color) {
    push("color", s.color);
    push("-webkit-text-fill-color", s.color);
    if (s.clearGradient) push("background-image", "none");
  }
  if (num(s.opacity) !== null && s.opacity !== 100) push("opacity", String(num(s.opacity) / 100));

  ["mt:margin-top", "mb:margin-bottom", "ml:margin-left", "mr:margin-right", "pt:padding-top", "pb:padding-bottom", "pl:padding-left", "pr:padding-right"].forEach(
    (pair) => {
      const [k, prop] = pair.split(":");
      if (num(s[k]) !== null) push(prop, `${num(s[k])}px`);
    }
  );

  if (num(s.maxWidth)) push("max-width", `${num(s.maxWidth)}px`);
  if (s.widthMode === "full") push("width", "100%");
  if (s.bg) push("background-color", s.bg);
  if (num(s.radius) !== null) push("border-radius", `${num(s.radius)}px`);
  if (num(s.borderW) !== null) {
    push("border-style", "solid");
    push("border-width", `${num(s.borderW)}px`);
    push("border-color", s.borderC || "rgba(255,255,255,0.18)");
  }
  if (s.shadow === "soft") push("box-shadow", "0 18px 50px -24px rgba(0,0,0,.75)");
  if (s.shadow === "strong") push("box-shadow", "0 30px 80px -30px rgba(0,0,0,.95)");
  if (s.shadow === "none") push("box-shadow", "none");
  if (num(s.zIndex)) push("z-index", String(num(s.zIndex)));

  const tr = [];
  if (num(s.x)) tr.push(`translateX(${num(s.x)}px)`);
  if (num(s.y)) tr.push(`translateY(${num(s.y)}px)`);
  if (num(s.rotate)) tr.push(`rotate(${num(s.rotate)}deg)`);
  if (num(s.scale) && num(s.scale) !== 100) tr.push(`scale(${num(s.scale) / 100})`);
  if (tr.length) push("transform", tr.join(" "));

  return out.join(";");
};

const esc = (sel) => sel.replace(/[/.[\]]/g, (m) => `\\${m}`);

const INK_ALPHAS = [5, 8, 10, 12, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90];
const INK_ARBITRARY = ["0.02", "0.03", "0.04", "0.05", "0.055", "0.07", "0.08", "0.1", "0.14", "0.18"];

/** Light themes: remap the white-on-dark utilities to the chosen ink colour. */
const lightCss = (theme) => {
  const ink = hexToTriple(theme?.ink || "#12121a", "18 18 26");
  const lines = [
    `.sg-light{--sg-ink:${ink}}`,
    `.sg-light, .sg-light body{color:rgb(${ink}) !important}`,
    `.sg-light *{border-color:rgb(${ink} / 0.14)}`,
    `.sg-light .text-white{color:rgb(${ink}) !important}`,
  ];
  INK_ALPHAS.forEach((a) => {
    lines.push(`.sg-light .${esc(`text-white/${a}`)}{color:rgb(${ink} / ${a / 100}) !important}`);
    lines.push(`.sg-light .${esc(`bg-white/${a}`)}{background-color:rgb(${ink} / ${a / 100}) !important}`);
    lines.push(`.sg-light .${esc(`border-white/${a}`)}{border-color:rgb(${ink} / ${a / 100}) !important}`);
    lines.push(`.sg-light .${esc(`placeholder-white/${a}`)}::placeholder{color:rgb(${ink} / ${a / 100}) !important}`);
  });
  INK_ARBITRARY.forEach((a) => {
    lines.push(`.sg-light .${esc(`bg-white/[${a}]`)}{background-color:rgb(${ink} / ${a}) !important}`);
    lines.push(`.sg-light .${esc(`border-white/[${a}]`)}{border-color:rgb(${ink} / ${a}) !important}`);
    lines.push(`.sg-light .${esc(`from-white/[${a}]`)}{--tw-gradient-from:rgb(${ink} / ${a}) !important}`);
  });
  lines.push(`.sg-light .grain::after{opacity:.02}`);
  lines.push(`.sg-light .${esc("bg-black/70")}{background-color:rgb(255 255 255 / .78) !important}`);
  lines.push(`.sg-light .${esc("bg-black/90")}{background-color:rgb(255 255 255 / .94) !important}`);
  lines.push(`.sg-light .${esc("bg-black/40")}{background-color:rgb(255 255 255 / .6) !important}`);
  return lines.join("\n");
};

export const StyleOverrides = ({ styles, theme }) => {
  const css = useMemo(() => {
    const parts = [];
    const mobile = [];
    Object.entries(styles || {}).forEach(([path, cfg]) => {
      if (!cfg) return;
      const d = declarations(cfg.d);
      const m = declarations(cfg.m);
      if (d) parts.push(`[data-sg="${path}"]{${d}}`);
      if (m) mobile.push(`[data-sg="${path}"]{${m}}`);
    });
    if (mobile.length) parts.push(`@media (max-width:767px){${mobile.join("")}}`);
    if (theme?.mode === "light") parts.unshift(lightCss(theme));
    return parts.join("\n");
  }, [styles, theme]);

  if (!css) return null;
  return <style data-sg-styles="1">{css}</style>;
};

export default StyleOverrides;
