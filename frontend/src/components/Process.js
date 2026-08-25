import React from "react";
import { motion } from "framer-motion";
import { useLang } from "@/i18n";
import { useSite } from "@/content/ContentContext";
import { visibleItems } from "@/content/SectionShell";
import { container, pad, headBox } from "@/content/style";

const FALLBACK = ["#60d6ff", "#facc15", "#4ade80", "#f87171"];

export const Process = () => {
  const { lang } = useLang();
  const { c, L } = useSite(lang);
  const pr = c.process || {};
  const theme = c.theme || {};
  const accent = theme.accent || "#60d6ff";
  const items = visibleItems(pr.items);
  const centered = pr.align === "center";

  return (
    <section
      data-testid="process"
      id="process"
      data-sg="section:process"
      data-sg-kind="section"
      data-sg-label="Ενότητα: Πώς δουλεύουμε"
      className={`relative overflow-hidden border-y border-white/[0.07] ${pad(pr.padding)}`}
    >
      {theme.glows !== false && <div className="pointer-events-none absolute left-1/4 top-0 h-[320px] w-[620px] glow-blue opacity-40" />}

      <div className="relative mx-auto px-6 sm:px-8" style={container(theme)}>
        <div className={`max-w-2xl ${headBox(pr.align)}`}>
          <p data-sg="process.overline" data-sg-kind="text" data-sg-label="Μικρός τίτλος" className="text-[10px] font-bold uppercase tracking-[0.26em] sm:text-[11px]" style={{ color: accent }}>{L(pr.overline)}</p>
          <h2 data-sg="process.title" data-sg-kind="text" data-sg-label="Τίτλος ενότητας" className="mt-4 font-display text-[26px] font-extrabold leading-[1.12] tracking-tight sm:text-4xl lg:text-5xl">{L(pr.title)}</h2>
        </div>

        <div className="relative mt-12 grid gap-8 sm:mt-16 sm:grid-cols-2 sm:gap-10 lg:grid-cols-4">
          {items.map((p, i) => {
            const a = p.accent || FALLBACK[i % FALLBACK.length];
            return (
              <motion.div
                key={p.id || i}
                data-testid={`process-step-${i}`}
                data-sg={`process.items.${p._i}`}
                data-sg-kind="card"
                data-sg-label={`Βήμα ${i + 1}`}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.7, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                className={`group relative ${centered ? "text-center" : ""}`}
              >
                <div className="mb-6 h-px w-full overflow-hidden bg-white/[0.08]">
                  <motion.span
                    aria-hidden
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.1, delay: 0.2 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                    className="block h-full w-full origin-left"
                    style={{ background: `linear-gradient(90deg, ${a}, transparent)` }}
                  />
                </div>
                <span className="font-display text-[13px] font-extrabold tracking-[0.2em]" style={{ color: `${a}99` }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 data-sg={`process.items.${p._i}.title`} data-sg-kind="text" data-sg-label="Τίτλος βήματος" className="mt-3 font-display text-[18px] font-bold tracking-tight sm:text-xl">{L(p.title)}</h3>
                <p data-sg={`process.items.${p._i}.desc`} data-sg-kind="text" data-sg-label="Περιγραφή βήματος" className="mt-3 text-[13.5px] leading-relaxed text-white/45 sm:text-sm">{L(p.desc)}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
