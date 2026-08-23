import { useState } from "react";
import { motion } from "framer-motion";
import * as Icons from "lucide-react";
import { CLIENTS } from "@/data/clients";
import { useLang } from "@/i18n";

const ACCENTS = ["#60d6ff", "#facc15", "#4ade80", "#f87171", "#a78bfa"];

const ClientCard = ({ c, i, lang }) => {
  const [broken, setBroken] = useState(false);
  const Icon = Icons[c.icon] || Icons.Store;
  const accent = ACCENTS[i % ACCENTS.length];
  const label = lang === "en" && c.nameEn ? c.nameEn : c.name;
  const showLogo = c.logo && !broken;
  const Shell = c.site ? "a" : "div";

  return (
    <Shell
      {...(c.site ? { href: c.site, target: "_blank", rel: "noreferrer" } : {})}
      data-testid={`client-card-${c.id}`}
      title={label}
      aria-label={label}
      className="group relative mx-2 flex h-[132px] w-[196px] shrink-0 flex-col items-center justify-center gap-3 overflow-hidden rounded-[20px] border border-white/[0.07] bg-[#0b0b0e] px-5 transition-all duration-500 hover:-translate-y-1.5 hover:border-white/20 sm:mx-2.5 sm:h-[146px] sm:w-[220px]"
    >
      <span
        className="pointer-events-none absolute -top-16 left-1/2 h-32 w-32 -translate-x-1/2 rounded-full opacity-0 blur-2xl transition-opacity duration-700 group-hover:opacity-40"
        style={{ backgroundColor: accent }}
      />
      {showLogo ? (
        <>
          <span className="relative flex h-[56px] items-center justify-center sm:h-[64px]">
            {c.tile ? (
              <img
                src={c.logo}
                alt={label}
                loading="lazy"
                onError={() => setBroken(true)}
                className="h-[62px] w-[62px] object-contain transition-transform duration-500 group-hover:scale-[1.08] sm:h-[72px] sm:w-[72px]"
              />
            ) : (
              <img
                src={c.logo}
                alt={label}
                loading="lazy"
                onError={() => setBroken(true)}
                className="max-h-[56px] max-w-[150px] object-contain opacity-90 transition-all duration-500 group-hover:scale-[1.06] group-hover:opacity-100 sm:max-h-[64px] sm:max-w-[166px]"
              />
            )}
          </span>
          <span className="relative text-center font-display text-[12px] font-semibold leading-tight tracking-tight text-white/50 transition-colors duration-500 group-hover:text-white/80 sm:text-[13px]">
            {label}
          </span>
        </>
      ) : (
        <span className="relative flex flex-col items-center gap-3">
          <span
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 transition-transform duration-500 group-hover:scale-110"
            style={{ backgroundColor: `${accent}14` }}
          >
            <Icon className="h-[20px] w-[20px]" strokeWidth={1.9} style={{ color: accent }} />
          </span>
          <span className="text-center font-display text-[14px] font-bold leading-tight tracking-tight text-white/85 sm:text-[15px]">{label}</span>
        </span>
      )}
    </Shell>
  );
};

const Row = ({ items, duration, reverse, lang, offset }) => (
  <div className="marquee-wrap edge-fade overflow-hidden">
    <div className={`marquee ${reverse ? "marquee-reverse" : ""}`} style={{ animationDuration: `${duration}s` }}>
      {[...items, ...items].map((c, i) => (
        <ClientCard key={`${c.id}-${i}`} c={c} i={i + offset} lang={lang} />
      ))}
    </div>
  </div>
);

/** Deal the clients across 3 rows so logos and wordmarks stay evenly mixed. */
const rows = (() => {
  const out = [[], [], []];
  CLIENTS.forEach((c, i) => out[i % 3].push(c));
  return out;
})();

export const Clients = () => {
  const { lang, t } = useLang();

  return (
    <section data-testid="clients" id="clients" className="relative overflow-hidden py-20 sm:py-28">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[520px] w-[1100px] -translate-x-1/2 -translate-y-1/2 glow-cyan opacity-50" />

      <div className="relative mx-auto max-w-[1240px] px-5 sm:px-8">
        <div className="max-w-2xl">
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#60d6ff]">{t.clients.overline}</p>
          <h2 className="mt-4 font-display text-3xl font-extrabold leading-[1.08] tracking-tight sm:text-4xl lg:text-5xl">{t.clients.title}</h2>
          <p className="mt-5 text-sm leading-relaxed text-white/50 sm:text-base lg:text-lg">{t.clients.sub}</p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="relative mt-12 flex flex-col gap-3 sm:mt-16 sm:gap-4"
      >
        <Row items={rows[0]} duration={54} lang={lang} offset={0} />
        <Row items={rows[1]} duration={68} reverse lang={lang} offset={1} />
        <Row items={rows[2]} duration={60} lang={lang} offset={2} />
      </motion.div>
    </section>
  );
};
