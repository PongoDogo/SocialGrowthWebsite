import { motion } from "framer-motion";
import * as Icons from "lucide-react";
import { CLIENTS } from "@/data/clients";
import { useLang } from "@/i18n";

const ACCENTS = ["#60d6ff", "#facc15", "#4ade80", "#f87171", "#a78bfa"];

const ClientCard = ({ c, i, lang }) => {
  const Icon = Icons[c.icon] || Icons.Store;
  const accent = ACCENTS[i % ACCENTS.length];
  const label = lang === "en" && c.nameEn ? c.nameEn : c.name;
  return (
    <div
      data-testid={`client-card-${c.id}`}
      className="group mx-3 flex h-[104px] shrink-0 items-center gap-4 whitespace-nowrap rounded-2xl border border-white/[0.08] bg-[#0a0a0c] pl-6 pr-8 transition-colors duration-500 hover:border-white/22"
    >
      <span
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/10 transition-transform duration-500 group-hover:scale-105"
        style={{ backgroundColor: `${accent}14` }}
      >
        <Icon className="h-[22px] w-[22px]" strokeWidth={1.9} style={{ color: accent }} />
      </span>
      <span>
        <span className="block font-display text-[17px] font-bold leading-tight tracking-tight text-white/90">{label}</span>
        <span className="mt-1 block text-[10px] font-bold uppercase tracking-[0.18em] text-white/35">{c.tag[lang]}</span>
      </span>
    </div>
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
  const half = Math.ceil(CLIENTS.length / 2);
  const rowA = CLIENTS.slice(0, half);
  const rowB = CLIENTS.slice(half);

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
        className="relative mt-16 flex flex-col gap-5"
      >
        <Row items={rowA} duration={58} lang={lang} offset={0} />
        <Row items={rowB} duration={68} reverse lang={lang} offset={2} />
      </motion.div>
    </section>
  );
};
