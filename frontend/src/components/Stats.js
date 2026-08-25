import React, { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { useLang } from "@/i18n";
import { useSite } from "@/content/ContentContext";
import { visibleItems } from "@/content/SectionShell";
import { container, pad, headBox, surfaceBg, ring, cardRadius } from "@/content/style";

const FALLBACK = ["#60d6ff", "#facc15", "#4ade80", "#f87171"];
const COLS = { 2: "grid-cols-2", 3: "grid-cols-2 lg:grid-cols-3", 4: "grid-cols-2 lg:grid-cols-4" };

const Counter = ({ value, suffix, duration = 2100 }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-70px" });
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!inView) return undefined;
    let raf;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      setN(Math.round(value * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value, duration]);

  return (
    <span ref={ref} className="inline-flex items-baseline">
      <span className="tabular-nums">{n.toLocaleString("en-US")}</span>
      {suffix && <span className="ml-0.5 text-[0.52em] font-bold tracking-tight opacity-70">{suffix}</span>}
    </span>
  );
};

const StatCard = ({ value, suffix, label, accent, i, theme, centered, path }) => (
  <motion.div
    data-testid={`stat-card-${i}`}
    data-sg={path}
    data-sg-kind="card"
    data-sg-label={`Κάρτα νούμερου ${i + 1}`}
    initial={{ opacity: 0, y: 28 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-60px" }}
    transition={{ duration: 0.75, delay: i * 0.09, ease: [0.22, 1, 0.36, 1] }}
    className="group relative overflow-hidden border border-white/[0.08] bg-gradient-to-b from-white/[0.055] to-transparent p-px transition-colors duration-500 hover:border-white/[0.18]"
    style={{ borderRadius: cardRadius(theme, 26) }}
  >
    <div
      className={`relative h-full overflow-hidden px-5 pb-6 pt-6 sm:px-7 sm:pb-9 sm:pt-8 ${centered ? "text-center" : ""}`}
      style={{ backgroundColor: surfaceBg(theme), borderRadius: cardRadius(theme, 25), boxShadow: ring(theme, 0.4) }}
    >
      <motion.span
        aria-hidden
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.1, delay: 0.25 + i * 0.09, ease: [0.22, 1, 0.36, 1] }}
        className="absolute left-0 top-0 h-[2px] w-full origin-left"
        style={{ background: `linear-gradient(90deg, ${accent}, ${accent}00)` }}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-14 h-36 w-36 rounded-full opacity-[0.14] blur-3xl transition-opacity duration-700 group-hover:opacity-30"
        style={{ backgroundColor: accent }}
      />

            <span className="relative block font-display text-[10px] font-extrabold tracking-[0.26em] text-white/25">{String(i + 1).padStart(2, "0")}</span>

      <div data-sg={`${path}.value`} data-sg-kind="number" data-sg-label="Αριθμός" className="relative mt-5 font-display text-[42px] font-extrabold leading-none tracking-tighter sm:mt-7 sm:text-[56px] lg:text-[60px]" style={{ color: accent }}>
        <Counter value={value} suffix={suffix} />
      </div>

      <p data-sg={`${path}.label`} data-sg-kind="text" data-sg-label="Ετικέτα νούμερου" className="relative mt-4 text-[13px] font-medium leading-snug text-white/50 sm:mt-5 sm:text-sm">{label}</p>

      <div className="relative mt-6 h-px w-full overflow-hidden bg-white/[0.07] sm:mt-8">
        <motion.span
          aria-hidden
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.4, delay: 0.35 + i * 0.09, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0 origin-left"
          style={{ background: `linear-gradient(90deg, ${accent}, ${accent}22)` }}
        />
      </div>
    </div>
  </motion.div>
);

export const Stats = () => {
  const { lang } = useLang();
  const { c, L } = useSite(lang);
  const st = c.stats || {};
  const theme = c.theme || {};
  const accent = theme.accent || "#60d6ff";
  const clientCount = visibleItems(c.clients?.items).length;
  const items = visibleItems(st.items);
  const cols = COLS[Number(st.columns)] || COLS[4];
  const centered = st.align === "center";

  return (
    <section
      data-testid="results"
      id="results"
      data-sg="section:stats"
      data-sg-kind="section"
      data-sg-label="Ενότητα: Νούμερα"
      className={`relative overflow-hidden border-y border-white/[0.07] ${pad(st.padding)}`}
    >
      {theme.glows !== false && <div className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[1000px] -translate-x-1/2 glow-blue opacity-60" />}
      {theme.gridLines !== false && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.13]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.06) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
            maskImage: "radial-gradient(ellipse 70% 70% at 50% 30%, #000, transparent)",
            WebkitMaskImage: "radial-gradient(ellipse 70% 70% at 50% 30%, #000, transparent)",
          }}
        />
      )}

      <div className="relative mx-auto px-6 sm:px-8" style={container(theme)}>
        <div className={`flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between sm:gap-6 ${centered ? "sm:flex-col sm:items-center" : ""}`}>
          <div className={`max-w-2xl ${headBox(st.align)}`}>
            <p data-sg="stats.overline" data-sg-kind="text" data-sg-label="Μικρός τίτλος" className="text-[10px] font-bold uppercase tracking-[0.26em] sm:text-[11px]" style={{ color: accent }}>{L(st.overline)}</p>
            <h2 data-sg="stats.title" data-sg-kind="text" data-sg-label="Τίτλος ενότητας" className="mt-4 font-display text-[26px] font-extrabold leading-[1.12] tracking-tight sm:text-4xl lg:text-5xl">{L(st.title)}</h2>
          </div>
          <p data-sg="stats.note" data-sg-kind="text" data-sg-label="Σημείωση" className={`max-w-xs text-[12.5px] leading-relaxed text-white/40 sm:text-sm ${centered ? "text-center" : ""}`}>{L(st.note)}</p>
        </div>

        <div className={`mt-10 grid gap-3 sm:mt-16 sm:gap-4 lg:gap-5 ${cols}`}>
          {items.map((s, i) => (
            <StatCard
              key={s.id || i}
              i={i}
              path={`stats.items.${s._i}`}
              theme={theme}
              centered={centered}
              value={s.autoClients ? clientCount : Number(s.value) || 0}
              suffix={s.suffix || ""}
              label={L(s.label)}
              accent={s.accent || FALLBACK[i % FALLBACK.length]}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
