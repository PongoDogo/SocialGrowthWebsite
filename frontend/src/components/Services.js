import React from "react";
import { motion } from "framer-motion";
import * as Icons from "lucide-react";
import { useLang } from "@/i18n";
import { useSite } from "@/content/ContentContext";
import { visibleItems } from "@/content/SectionShell";
import { container, pad, headBox, cardStyle, iconBox, iconScale } from "@/content/style";

const FALLBACK = ["#60d6ff", "#facc15", "#4ade80", "#f87171", "#a78bfa", "#fb923c"];
const COLS = { 2: "sm:grid-cols-2", 3: "sm:grid-cols-2 lg:grid-cols-3", 4: "sm:grid-cols-2 lg:grid-cols-4" };

export const Services = () => {
  const { lang } = useLang();
  const { c, L } = useSite(lang);
  const sv = c.services || {};
  const theme = c.theme || {};
  const accent = theme.accent || "#60d6ff";
  const items = visibleItems(sv.items);
  const cols = COLS[Number(sv.columns)] || COLS[3];
  const centered = sv.align === "center";

  return (
    <section data-testid="services" id="services" className={`relative ${pad(sv.padding)}`}>
      {theme.glows !== false && <div className="pointer-events-none absolute right-0 top-1/4 h-[420px] w-[420px] glow-cyan opacity-50" />}

      <div className="relative mx-auto px-6 sm:px-8" style={container(theme)}>
        <div className={`max-w-2xl ${headBox(sv.align)}`}>
          <p className="text-[10px] font-bold uppercase tracking-[0.26em] sm:text-[11px]" style={{ color: accent }}>{L(sv.overline)}</p>
          <h2 className="mt-4 font-display text-[26px] font-extrabold leading-[1.12] tracking-tight sm:text-4xl lg:text-5xl">{L(sv.title)}</h2>
          <p className="mt-4 text-[13.5px] leading-relaxed text-white/50 sm:mt-5 sm:text-base lg:text-lg">{L(sv.sub)}</p>
        </div>

        <div className={`mt-10 grid gap-4 sm:mt-16 sm:gap-5 ${cols}`}>
          {items.map((s, i) => {
            const Icon = Icons[s.icon] || Icons.Sparkles;
            const a = s.accent || FALLBACK[i % FALLBACK.length];
            return (
              <motion.article
                key={s.id || i}
                data-testid={`service-card-${i}`}
                initial={{ opacity: 0, y: 26 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.7, delay: (i % 3) * 0.08, ease: [0.22, 1, 0.36, 1] }}
                className={`group relative overflow-hidden p-7 transition-all duration-500 hover:-translate-y-1 sm:p-8 ${centered ? "text-center" : ""}`}
                style={cardStyle(theme)}
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full opacity-[0.07] blur-3xl transition-opacity duration-700 group-hover:opacity-[0.2]"
                  style={{ backgroundColor: a }}
                />
                <div className={`relative flex items-start justify-between ${centered ? "flex-col items-center gap-3" : ""}`}>
                  <div
                    className="flex items-center justify-center rounded-2xl transition-transform duration-500 group-hover:-translate-y-1"
                    style={{ ...iconBox(theme, a), height: 48 * iconScale(theme), width: 48 * iconScale(theme) }}
                  >
                    <Icon className="h-5 w-5" strokeWidth={2} style={{ color: a }} />
                  </div>
                  <span className="font-display text-[11px] font-extrabold tracking-[0.22em] text-white/15">{String(i + 1).padStart(2, "0")}</span>
                </div>
                <h3 className="relative mt-6 font-display text-[18px] font-bold tracking-tight sm:text-xl">{L(s.title)}</h3>
                <p className="relative mt-3 text-[13.5px] leading-relaxed text-white/45 sm:text-sm">{L(s.desc)}</p>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
};
