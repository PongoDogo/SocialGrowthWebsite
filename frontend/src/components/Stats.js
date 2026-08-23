import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { useLang } from "@/i18n";

const ACCENTS = ["#60d6ff", "#facc15", "#4ade80", "#f87171"];

const Counter = ({ value, suffix, duration = 2200 }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let raf;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(value * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value, duration]);

  return (
    <span ref={ref} className="tabular-nums">
      {n.toLocaleString("en-US")}
      {suffix}
    </span>
  );
};

export const Stats = () => {
  const { t } = useLang();

  return (
    <section data-testid="results" id="results" className="relative overflow-hidden border-y border-white/[0.07] py-24 sm:py-32">
      <div className="pointer-events-none absolute left-1/2 top-0 h-[400px] w-[900px] -translate-x-1/2 glow-blue opacity-60" />

      <div className="relative mx-auto max-w-[1240px] px-5 sm:px-8">
        <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#60d6ff]">{t.stats.overline}</p>
        <h2 className="mt-4 max-w-2xl font-display text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">{t.stats.title}</h2>

        <div className="mt-16 grid gap-px overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.06] sm:grid-cols-2 lg:grid-cols-4">
          {t.stats.items.map((s, i) => (
            <motion.div
              key={s.label}
              data-testid={`stat-card-${i}`}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="card-sheen bg-[#08080a] px-7 py-12"
            >
              <div className="font-display text-5xl font-extrabold leading-none tracking-tighter sm:text-6xl" style={{ color: ACCENTS[i % 4] }}>
                <Counter value={s.value} suffix={s.suffix} />
              </div>
              <p className="mt-5 text-sm font-medium text-white/45">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
