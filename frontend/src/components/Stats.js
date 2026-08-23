import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { CLIENTS } from "@/data/clients";
import { useLang } from "@/i18n";

const ACCENTS = ["#60d6ff", "#facc15", "#4ade80", "#f87171"];

const Counter = ({ value, suffix, duration = 2100 }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-70px" });
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!inView) return;
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

const StatCard = ({ s, i }) => {
  const accent = ACCENTS[i % 4];
  return (
    <motion.div
      data-testid={`stat-card-${i}`}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.75, delay: i * 0.09, ease: [0.22, 1, 0.36, 1] }}
      className="group relative overflow-hidden rounded-[26px] border border-white/[0.08] bg-gradient-to-b from-white/[0.055] to-transparent p-px transition-colors duration-500 hover:border-white/[0.18]"
    >
      <div className="relative h-full overflow-hidden rounded-[25px] bg-[#08080a] px-6 pb-7 pt-7 sm:px-7 sm:pb-9 sm:pt-8">
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

        <span className="relative block font-display text-[10px] font-extrabold tracking-[0.26em] text-white/25">0{i + 1}</span>

        <div
          className="relative mt-5 font-display text-[42px] font-extrabold leading-none tracking-tighter sm:mt-7 sm:text-[56px] lg:text-[60px]"
          style={{ color: accent }}
        >
          <Counter value={s.value} suffix={s.suffix} />
        </div>

        <p className="relative mt-4 text-[13px] font-medium leading-snug text-white/50 sm:mt-5 sm:text-sm">{s.label}</p>

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
};

export const Stats = () => {
  const { t } = useLang();

  return (
    <section data-testid="results" id="results" className="relative overflow-hidden border-y border-white/[0.07] py-20 sm:py-28 lg:py-32">
      <div className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[1000px] -translate-x-1/2 glow-blue opacity-60" />
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

      <div className="relative mx-auto max-w-[1240px] px-5 sm:px-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#60d6ff]">{t.stats.overline}</p>
            <h2 className="mt-4 font-display text-3xl font-extrabold leading-[1.08] tracking-tight sm:text-4xl lg:text-5xl">{t.stats.title}</h2>
          </div>
          <p className="max-w-xs text-[13px] leading-relaxed text-white/40 sm:text-sm">{t.stats.note}</p>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-3 sm:mt-16 sm:gap-4 lg:grid-cols-4 lg:gap-5">
          {t.stats.items.map((s, i) => (
            <StatCard key={s.label} s={i === 1 ? { ...s, value: CLIENTS.length } : s} i={i} />
          ))}
        </div>
      </div>
    </section>
  );
};
