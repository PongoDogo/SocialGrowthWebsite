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
      className="group mx-2.5 flex h-[138px] w-[236px] shrink-0 flex-col items-center justify-center gap-3 rounded-2xl border border-white/[0.08] bg-[#0a0a0c] px-6 transition-all duration-500 hover:-translate-y-1 hover:border-white/25"
    >
      {showLogo ? (
        <span className="flex h-[66px] w-full items-center justify-center">
          <img
            src={c.logo}
            alt={label}
            loading="lazy"
            onError={() => setBroken(true)}
            className="max-h-[66px] max-w-[172px] object-contain opacity-90 transition-opacity duration-500 group-hover:opacity-100"
          />
        </span>
      ) : (
        <>
          <span
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 transition-transform duration-500 group-hover:scale-110"
            style={{ backgroundColor: `${accent}14` }}
          >
            <Icon className="h-[21px] w-[21px]" strokeWidth={1.9} style={{ color: accent }} />
          </span>
          <span className="text-center font-display text-[15px] font-bold leading-tight tracking-tight text-white/90">{label}</span>
        </>
      )}
      <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/30">{c.tag[lang]}</span>
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

export const Clients = () => {
  const { lang, t } = useLang();
  const withLogo = CLIENTS.filter((c) => c.logo);
  const rest = CLIENTS.filter((c) => !c.logo);
  const rowA = [...withLogo.slice(0, 7), ...rest.slice(0, 7)];
  const rowB = [...withLogo.slice(7), ...rest.slice(7)];

  return (
    <section data-testid="clients" id="clients" className="relative overflow-hidden py-24 sm:py-32">
      <div className="pointer-events-none absolute -left-20 top-1/3 h-[460px] w-[460px] glow-cyan opacity-70" />

      <div className="relative mx-auto max-w-[1240px] px-5 sm:px-8">
        <div className="max-w-2xl">
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#60d6ff]">{t.clients.overline}</p>
          <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">{t.clients.title}</h2>
          <p className="mt-5 text-base leading-relaxed text-white/50 lg:text-lg">{t.clients.sub}</p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.9 }}
        className="relative mt-16 flex flex-col gap-4"
      >
        <Row items={rowA} duration={62} lang={lang} offset={0} />
        <Row items={rowB} duration={74} reverse lang={lang} offset={2} />
      </motion.div>
    </section>
  );
};
