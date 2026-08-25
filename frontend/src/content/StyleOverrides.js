/** Turns the editable `styles` map into real CSS (3 breakpoints + hover), plus optional light-mode ink. */
import React, { useEffect, useMemo } from "react";

const num = (v) => (v === "" || v === null || v === undefined || Number.isNaN(Number(v)) ? null : Number(v));
const has = (v) => v !== undefined && v !== null && v !== "";

const hexToTriple = (hex, fallback = "255 255 255") => {
  const h = String(hex || "").replace("#", "").trim();
  if (h.length !== 6) return fallback;
  const n = parseInt(h, 16);
  if (Number.isNaN(n)) return fallback;
  return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`;
};

/* ------------------------------------------------------------------ presets */
export const BOX_SHADOWS = {
  none: "none",
  soft: "0 18px 50px -24px rgba(0,0,0,.75)",
  strong: "0 30px 80px -30px rgba(0,0,0,.95)",
  glow: "0 0 40px -6px rgba(96,214,255,.45)",
  ring: "0 0 0 3px rgba(96,214,255,.28)",
  inner: "inset 0 2px 14px rgba(0,0,0,.55)",
};

export const TEXT_SHADOWS = {
  none: "none",
  soft: "0 2px 10px rgba(0,0,0,.45)",
  strong: "0 4px 22px rgba(0,0,0,.8)",
  glow: "0 0 18px rgba(96,214,255,.75)",
};

/* --------------------------------------------------------------- transforms */
/** Builds the transform list from x / y / rotate / scale (plus an extra Y offset for hover lift). */
const transformList = (s, extraY = 0) => {
  const tr = [];
  const x = num(s.x) || 0;
  const y = (num(s.y) || 0) + extraY;
  const rot = num(s.rotate) || 0;
  const sc = num(s.scale);
  if (x) tr.push(`translateX(${x}px)`);
  if (y) tr.push(`translateY(${y}px)`);
  if (rot) tr.push(`rotate(${rot}deg)`);
  if (sc !== null && sc !== 100) tr.push(`scale(${sc / 100})`);
  return tr;
};

/* -------------------------------------------------------------------- rules */
/** One style object -> css declarations (all !important so Tailwind never wins). */
export const declarations = (s, opts = {}) => {
  if (!s || typeof s !== "object") return "";
  const out = [];
  const push = (prop, value) => out.push(`${prop}:${value} !important`);

  /* ---- display / visibility (clamp + grid may override further down) */
  if (s.hidden) push("display", "none");
  else if (s.display) push("display", s.display);

  /* ---- typography */
  if (num(s.fontSize)) push("font-size", `${num(s.fontSize)}px`);
  if (num(s.fontWeight)) push("font-weight", String(num(s.fontWeight)));
  if (num(s.letterSpacing) !== null) push("letter-spacing", `${num(s.letterSpacing)}px`);
  if (num(s.wordSpacing) !== null) push("word-spacing", `${num(s.wordSpacing)}px`);
  if (num(s.lineHeight)) push("line-height", String(num(s.lineHeight)));
  if (s.textAlign) push("text-align", s.textAlign);
  if (s.textTransform) push("text-transform", s.textTransform);
  if (s.fontStyle) push("font-style", s.fontStyle);
  if (s.textDecoration) push("text-decoration", s.textDecoration);
  if (s.font) push("font-family", `"${s.font}"`);
  if (s.whiteSpace) push("white-space", s.whiteSpace);
  if (s.breakWord) {
    push("overflow-wrap", "anywhere");
    push("word-break", "break-word");
  }
  if (s.textShadow && TEXT_SHADOWS[s.textShadow]) push("text-shadow", TEXT_SHADOWS[s.textShadow]);

  /* ---- colour */
  if (s.color) {
    push("color", s.color);
    push("-webkit-text-fill-color", s.color);
    if (s.clearGradient) push("background-image", "none");
  }
  if (!opts.animated && num(s.opacity) !== null && num(s.opacity) !== 100) push("opacity", String(num(s.opacity) / 100));

  /* ---- background: colour, then gradient, then image (last one wins on purpose) */
  if (s.bg) push("background-color", s.bg);
  if (s.bgGradFrom && s.bgGradTo) {
    const angle = num(s.bgGradAngle);
    push("background-image", `linear-gradient(${angle === null ? 135 : angle}deg, ${s.bgGradFrom}, ${s.bgGradTo})`);
  }
  if (s.bgImg) {
    push("background-image", `url("${String(s.bgImg).replace(/["\\)]/g, "")}")`);
    push("background-size", s.bgSize || "cover");
    push("background-position", s.bgPos || "center");
    push("background-repeat", s.bgRepeat || "no-repeat");
  }
  /* gradient TEXT has to come after the background rules to win */
  if (s.textGradFrom && s.textGradTo) {
    const angle = num(s.textGradAngle);
    push("background-image", `linear-gradient(${angle === null ? 90 : angle}deg, ${s.textGradFrom}, ${s.textGradTo})`);
    push("-webkit-background-clip", "text");
    push("background-clip", "text");
    push("-webkit-text-fill-color", "transparent");
    push("color", "transparent");
  }

  /* ---- filters */
  const filters = [];
  if (num(s.blur)) filters.push(`blur(${num(s.blur)}px)`);
  if (num(s.grayscale)) filters.push(`grayscale(${num(s.grayscale)}%)`);
  if (num(s.brightness) !== null && num(s.brightness) !== 100) filters.push(`brightness(${num(s.brightness)}%)`);
  if (num(s.saturate) !== null && num(s.saturate) !== 100) filters.push(`saturate(${num(s.saturate)}%)`);
  if (filters.length && !opts.animated) push("filter", filters.join(" "));
  if (num(s.backdropBlur)) {
    push("backdrop-filter", `blur(${num(s.backdropBlur)}px)`);
    push("-webkit-backdrop-filter", `blur(${num(s.backdropBlur)}px)`);
  }

  /* ---- spacing (all four sides, independently) */
  [
    ["mt", "margin-top"],
    ["mb", "margin-bottom"],
    ["ml", "margin-left"],
    ["mr", "margin-right"],
    ["pt", "padding-top"],
    ["pb", "padding-bottom"],
    ["pl", "padding-left"],
    ["pr", "padding-right"],
  ].forEach(([k, prop]) => {
    if (num(s[k]) !== null) push(prop, `${num(s[k])}px`);
  });

  /* ---- size */
  if (s.wMode === "full" || s.widthMode === "full") push("width", "100%");
  else if (s.wMode === "fit") push("width", "fit-content");
  else if (s.wMode === "px" && num(s.w) !== null) push("width", `${num(s.w)}px`);
  else if (s.wMode === "pct" && num(s.wPct) !== null) push("width", `${num(s.wPct)}%`);
  if (num(s.minWidth) !== null) push("min-width", `${num(s.minWidth)}px`);
  if (num(s.maxWidth)) push("max-width", `${num(s.maxWidth)}px`);
  if (num(s.h) !== null) push("height", `${num(s.h)}px`);
  if (num(s.minHeight) !== null) push("min-height", `${num(s.minHeight)}px`);
  if (num(s.maxHeight) !== null) push("max-height", `${num(s.maxHeight)}px`);

  /* ---- inner layout */
  if (s.flexDir) push("flex-direction", s.flexDir);
  if (s.justify) push("justify-content", s.justify);
  if (s.alignItems) push("align-items", s.alignItems);
  if (s.flexWrap) push("flex-wrap", s.flexWrap);
  if (num(s.gap) !== null) push("gap", `${num(s.gap)}px`);
  if (num(s.gridCols) && !s.hidden) {
    push("display", "grid");
    push("grid-template-columns", `repeat(${num(s.gridCols)}, minmax(0,1fr))`);
  }
  if (num(s.order) !== null) push("order", String(num(s.order)));

  /* ---- position */
  if (s.position) push("position", s.position);
  ["top", "right", "bottom", "left"].forEach((k) => {
    if (num(s[k]) !== null) push(k, `${num(s[k])}px`);
  });

  /* ---- radius */
  if (num(s.radius) !== null) push("border-radius", `${num(s.radius)}px`);
  [
    ["rTL", "border-top-left-radius"],
    ["rTR", "border-top-right-radius"],
    ["rBR", "border-bottom-right-radius"],
    ["rBL", "border-bottom-left-radius"],
  ].forEach(([k, prop]) => {
    if (num(s[k]) !== null) push(prop, `${num(s[k])}px`);
  });

  /* ---- border: all sides, then per-side overrides */
  const bStyle = s.borderStyle || "solid";
  const allW = num(s.borderW);
  if (allW !== null) {
    push("border-style", bStyle);
    push("border-width", `${allW}px`);
    push("border-color", s.borderC || "rgba(255,255,255,0.18)");
  }
  const sides = [
    ["bwT", "border-top-width"],
    ["bwR", "border-right-width"],
    ["bwB", "border-bottom-width"],
    ["bwL", "border-left-width"],
  ];
  const perSide = sides.filter(([k]) => num(s[k]) !== null);
  if (perSide.length) {
    perSide.forEach(([k, prop]) => push(prop, `${num(s[k])}px`));
    push("border-style", bStyle);
    push("border-color", s.borderC || "rgba(255,255,255,0.18)");
    /* a bare border-style would give the untouched sides the 'medium' default width */
    if (allW === null) sides.filter(([k]) => num(s[k]) === null).forEach(([, prop]) => push(prop, "0px"));
  }

  /* ---- shadow */
  if (has(s.shadow)) {
    if (s.shadow === "custom") {
      const y = num(s.shY);
      const blur = num(s.shBlur);
      push(
        "box-shadow",
        `${num(s.shX) || 0}px ${y === null ? 18 : y}px ${blur === null ? 40 : blur}px ${num(s.shSpread) || 0}px ${s.shColor || "rgba(0,0,0,.6)"}`
      );
    } else if (BOX_SHADOWS[s.shadow]) {
      push("box-shadow", BOX_SHADOWS[s.shadow]);
    }
  }

  /* ---- misc */
  if (num(s.zIndex) !== null) push("z-index", String(num(s.zIndex)));
  if (s.overflow) push("overflow", s.overflow);
  if (s.cursor) push("cursor", s.cursor);

  /* ---- long-text handling: has to beat `display` / `overflow` above */
  if (!s.hidden && num(s.clamp)) {
    push("display", "-webkit-box");
    push("-webkit-line-clamp", String(num(s.clamp)));
    push("-webkit-box-orient", "vertical");
    push("overflow", "hidden");
  } else if (!s.hidden && s.ellipsis) {
    push("white-space", "nowrap");
    push("overflow", "hidden");
    push("text-overflow", "ellipsis");
  }

  /* ---- transform (skipped for hover, which merges with the base first) */
  if (!opts.skipTransform && !opts.animated) {
    const tr = transformList(s);
    if (tr.length) push("transform", tr.join(" "));
  }

  return out.join(";");
};

/* -------------------------------------------------------------------- hover */
const HOVER_OWN = new Set(["x", "y", "rotate", "scale", "lift", "glow", "glowC", "speed"]);

/** Is there anything real inside a hover config? */
export const hasHover = (hv) =>
  !!hv && typeof hv === "object" && Object.values(hv).some((v) => has(v) && v !== false);

/**
 * Hover rules. The transform is merged with the base one so hovering never
 * throws away a element's x/y/rotate/scale offset.
 */
export const hoverDeclarations = (base, hv) => {
  if (!hasHover(hv)) return "";
  const rest = {};
  Object.entries(hv).forEach(([k, v]) => {
    if (!HOVER_OWN.has(k)) rest[k] = v;
  });

  const parts = [];
  const d = declarations(rest, { skipTransform: true });
  if (d) parts.push(d);

  const merged = {
    x: has(hv.x) ? hv.x : base?.x,
    y: has(hv.y) ? hv.y : base?.y,
    rotate: has(hv.rotate) ? hv.rotate : base?.rotate,
    scale: has(hv.scale) ? hv.scale : base?.scale,
  };
  const tr = transformList(merged, -(num(hv.lift) || 0));
  if (tr.length) parts.push(`transform:${tr.join(" ")} !important`);

  if (num(hv.glow)) parts.push(`box-shadow:0 0 ${num(hv.glow)}px ${hv.glowC || "rgba(96,214,255,.55)"} !important`);

  return parts.join(";");
};

const rgbaOf = (hex, alpha) => {
  const t = hexToTriple(hex, "255 255 255");
  return `rgb(${t} / ${alpha})`;
};

/* ------------------------------------------------------- global text colours
 * The site paints text with Tailwind's white/alpha utilities, so recolouring
 * "every text" means remapping those utilities — in ANY theme mode. Emitted
 * before the per-element rules so a single element can still override it.
 */
const ALPHAS = [5, 8, 10, 12, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90];

const textCss = (theme) => {
  const t = theme?.text || {};
  const { body, heading, muted } = t;
  const lh = num(t.lineHeight);
  const tr = num(t.headingTracking);
  if (!body && !heading && !muted && lh === null && tr === null) return "";

  const lines = [];
  if (body) {
    lines.push(`body, .text-white{color:${body} !important}`);
    lines.push(`.text-white{-webkit-text-fill-color:${body} !important}`);
  }
  /* low alphas are the "faded" texts, high alphas follow the main colour */
  ALPHAS.forEach((a) => {
    const src = a <= 65 ? muted || body : body || muted;
    if (src) lines.push(`.${esc(`text-white/${a}`)}{color:${rgbaOf(src, a / 100)} !important}`);
  });
  if (heading) {
    lines.push(`h1,h2,h3,h4,.font-display{color:${heading} !important}`);
    lines.push(`h1,h2,h3,h4{-webkit-text-fill-color:${heading} !important}`);
  }
  if (lh !== null) lines.push(`body,p,li{line-height:${lh} !important}`);
  if (tr !== null) lines.push(`h1,h2,h3{letter-spacing:${tr}px !important}`);
  return lines.join("\n");
};

/* ---------------------------------------------------------------- animations
 * A plain CSS `animation` on `transform` would fight the x/y/rotate/scale
 * overrides, so we generate a DEDICATED keyframe set per element with that
 * element's own base transform baked into every step. Hover keeps winning
 * because `!important` declarations beat animations.
 */
export const ANIMS = {
  fade: { label: "Απαλή εμφάνιση", from: {} },
  up: { label: "Ανεβαίνει", from: { ty: 1 } },
  down: { label: "Κατεβαίνει", from: { ty: -1 } },
  left: { label: "Από αριστερά", from: { tx: -1 } },
  right: { label: "Από δεξιά", from: { tx: 1 } },
  zoomIn: { label: "Μεγαλώνει", from: { sc: -0.18 } },
  zoomOut: { label: "Μικραίνει", from: { sc: 0.18 } },
  blurIn: { label: "Ξεθολώνει", from: { blur: 1 } },
  flip: { label: "Γυρίζει (flip)", from: { ry: 1 } },
  rotateIn: { label: "Στριφογυρίζει", from: { rot: 1 } },
  pop: { label: "Πετάγεται (pop)", pop: true },
  riseBlur: { label: "Ανεβαίνει & ξεθολώνει", from: { ty: 1, blur: 1 } },
  float: { label: "Αιωρείται (συνεχές)", loop: "float" },
  pulse: { label: "Παλμός (συνεχές)", loop: "pulse" },
  sway: { label: "Λικνίζεται (συνεχές)", loop: "sway" },
  breathe: { label: "Ανασαίνει (συνεχές)", loop: "breathe" },
  glowLoop: { label: "Λάμπει (συνεχές)", loop: "glow" },
  spin: { label: "Περιστρέφεται (συνεχές)", loop: "spin" },
};

const EASES = {
  smooth: "cubic-bezier(.2,.7,.2,1)",
  linear: "linear",
  in: "cubic-bezier(.4,0,1,1)",
  out: "cubic-bezier(0,0,.2,1)",
  spring: "cubic-bezier(.34,1.56,.64,1)",
};

const hashName = (s) => {
  let h = 5381;
  for (let i = 0; i < s.length; i += 1) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  return `sg-a-${h.toString(36)}`;
};

/** The element's resting visuals, so every keyframe can end exactly there. */
const restOf = (s) => {
  const tr = transformList(s).join(" ");
  const op = num(s.opacity);
  const filters = [];
  if (num(s.blur)) filters.push(`blur(${num(s.blur)}px)`);
  if (num(s.grayscale)) filters.push(`grayscale(${num(s.grayscale)}%)`);
  if (num(s.brightness) !== null && num(s.brightness) !== 100) filters.push(`brightness(${num(s.brightness)}%)`);
  if (num(s.saturate) !== null && num(s.saturate) !== 100) filters.push(`saturate(${num(s.saturate)}%)`);
  return {
    transform: tr || "none",
    opacity: op === null || op === 100 ? "1" : String(op / 100),
    filter: filters.length ? filters.join(" ") : "none",
  };
};

const withBase = (base, extra) => [base === "none" ? "" : base, extra].filter(Boolean).join(" ") || "none";

/** Returns { name, css } for one element/device, or null when no animation. */
export const animationFor = (path, dev, s) => {
  const def = ANIMS[s?.anim];
  if (!def) return null;
  const name = hashName(`${path}|${dev}|${s.anim}|${s.animDist}|${s.animOpacity}`);
  const rest = restOf(s);
  const dist = num(s.animDist) === null ? 26 : num(s.animDist);
  const startOp = s.animOpacity === false ? rest.opacity : "0";
  let css = "";

  if (def.loop) {
    const half = {
      float: `transform:${withBase(rest.transform, `translateY(${-dist}px)`)}`,
      pulse: `transform:${withBase(rest.transform, `scale(${1 + Math.abs(dist) / 100})`)}`,
      sway: `transform:${withBase(rest.transform, `rotate(${Math.max(1, Math.abs(dist) / 6)}deg)`)}`,
      breathe: `opacity:${Math.max(0.15, 1 - Math.abs(dist) / 60)}`,
      glow: `box-shadow:0 0 ${Math.max(8, Math.abs(dist))}px ${s.animColor || "rgba(96,214,255,.6)"}`,
    }[def.loop];
    if (def.loop === "spin") {
      css = `@keyframes ${name}{from{transform:${rest.transform}}to{transform:${withBase(rest.transform, "rotate(360deg)")}}}`;
    } else {
      const at0 = def.loop === "breathe" ? `opacity:${rest.opacity}` : def.loop === "glow" ? "box-shadow:0 0 0 rgba(0,0,0,0)" : `transform:${rest.transform}`;
      css = `@keyframes ${name}{0%,100%{${at0}}50%{${half}}}`;
    }
  } else if (def.pop) {
    css =
      `@keyframes ${name}{` +
      `0%{opacity:${startOp};transform:${withBase(rest.transform, "scale(.62)")}}` +
      `62%{opacity:${rest.opacity};transform:${withBase(rest.transform, "scale(1.07)")}}` +
      `100%{opacity:${rest.opacity};transform:${rest.transform}}}`;
  } else {
    const f = def.from || {};
    const extra = [];
    if (f.tx) extra.push(`translateX(${f.tx * dist}px)`);
    if (f.ty) extra.push(`translateY(${f.ty * dist}px)`);
    if (f.sc) extra.push(`scale(${1 + f.sc})`);
    if (f.ry) extra.push(`rotateY(${Math.max(30, Math.abs(dist) * 2)}deg)`);
    if (f.rot) extra.push(`rotate(${-Math.max(4, Math.abs(dist) / 3)}deg)`);
    const fromFilter = f.blur ? `filter:blur(${Math.max(3, Math.abs(dist) / 2)}px);` : "";
    const persp = f.ry ? "perspective(900px) " : "";
    css =
      `@keyframes ${name}{` +
      `from{opacity:${startOp};${fromFilter}transform:${withBase(rest.transform, persp + extra.join(" "))}}` +
      `to{opacity:${rest.opacity};filter:${rest.filter};transform:${rest.transform}}}`;
  }

  const dur = num(s.animDur) === null ? 700 : num(s.animDur);
  const delay = num(s.animDelay) || 0;
  const ease = EASES[s.animEase] || EASES.smooth;
  const loop = def.loop ? "infinite" : "1";
  const paused = s.animTrigger === "load" ? "" : " paused";
  const decl = `animation:${name} ${dur}ms ${ease} ${delay}ms ${loop} both${paused} !important`;

  return { name, keyframes: css, decl, viewTriggered: s.animTrigger !== "load" };
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

/* ----------------------------------------------------------------- breakpoints
 * desktop  = no media query (the base)
 * tablet   = max-width 1023px  (Studio previews it at 820px)
 * mobile   = max-width  767px  (emitted last so it wins over tablet)
 */
export const DEVICE_KEYS = ["d", "t", "m"];
const MEDIA = { t: "@media (max-width:1023px)", m: "@media (max-width:767px)" };

export const StyleOverrides = ({ styles, theme }) => {
  const built = useMemo(() => {
    const buckets = { d: [], t: [], m: [] };
    const keyframes = [];
    const watch = [];

    Object.entries(styles || {}).forEach(([path, cfg]) => {
      if (!cfg || typeof cfg !== "object") return;
      const clean = String(path).replace(/["\\]/g, "");
      const sel = `[data-sg="${clean}"]`;

      DEVICE_KEYS.forEach((dev) => {
        const conf = cfg[dev];
        if (!conf || typeof conf !== "object") return;

        const anim = animationFor(clean, dev, conf);
        const base = declarations(conf, { animated: !!anim });
        const hv = conf.hover;
        const withHover = hasHover(hv);

        const rules = [base];
        if (withHover) {
          const speed = num(hv.speed);
          rules.push(`transition:all ${speed === null ? 220 : speed}ms cubic-bezier(.2,.7,.2,1) !important`);
        }
        if (anim) {
          rules.push(anim.decl);
          keyframes.push(anim.keyframes);
          if (anim.viewTriggered) {
            buckets[dev].push(`${sel}.sg-in{animation-play-state:running !important}`);
            if (!watch.includes(clean)) watch.push(clean);
          }
        }

        const decl = rules.filter(Boolean).join(";");
        if (decl) buckets[dev].push(`${sel}{${decl}}`);

        if (withHover) {
          const hd = hoverDeclarations(conf, hv);
          if (hd) buckets[dev].push(`${sel}:hover{${hd}}`);
        }
      });
    });

    const parts = [];
    if (theme?.mode === "light") parts.push(lightCss(theme));
    const tcss = textCss(theme);
    if (tcss) parts.push(tcss);
    if (keyframes.length) parts.push(keyframes.join("\n"));
    if (buckets.d.length) parts.push(buckets.d.join("\n"));
    if (buckets.t.length) parts.push(`${MEDIA.t}{${buckets.t.join("")}}`);
    if (buckets.m.length) parts.push(`${MEDIA.m}{${buckets.m.join("")}}`);
    return { css: parts.join("\n"), watch };
  }, [styles, theme]);

  /* "μόλις μπει στην οθόνη" trigger: add .sg-in when the element scrolls in */
  useEffect(() => {
    const paths = built.watch;
    if (!paths.length || typeof IntersectionObserver === "undefined") return undefined;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("sg-in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );

    const attach = () => {
      paths.forEach((p) => {
        document.querySelectorAll(`[data-sg="${p}"]`).forEach((el) => {
          el.classList.remove("sg-in"); // replay while editing in the Studio
          io.observe(el);
        });
      });
    };
    attach();
    const late = setTimeout(attach, 350);

    return () => {
      clearTimeout(late);
      io.disconnect();
    };
  }, [built.watch]);

  if (!built.css) return null;
  return <style data-sg-styles="1">{built.css}</style>;
};

export default StyleOverrides;
