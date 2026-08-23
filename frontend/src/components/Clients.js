import { useState } from "react";
import { motion } from "framer-motion";
import * as Icons from "lucide-react";
import { CLIENTS } from "@/data/clients";
import { useLang } from "@/i18n";
import { TikTokIcon, InstagramIcon, FacebookIcon } from "@/components/SocialIcons";

const ACCENTS = ["#60d6ff", "#facc15", "#4ade80", "#f87171", "#a78bfa"];

const NETS = [
  { key: "ig", Icon: InstagramIcon, url: (h) => `https://www.instagram.com/${h}/`, label: "Instagram" },
  { key: "tt", Icon: TikTokIcon, url: (h) => `https://www.tiktok.com/@${h}`, label: "TikTok" },
  { key: "fb", Icon: FacebookIcon, url: (h) => `https://www.facebook.com/${h}`, label: "Facebook" },
];

const SocialRow = ({ c, accent }) => {
  const links = NETS.filter((n) => c.social?.[n.key]);
  if (!links.length) return <span className="h-[18px]" />;
  return (
    <span className="flex items-center gap-2.5">
      {links.map(({ key, Icon, url, label }) => (
        <a
          key={key}
          href={url(c.social[key])}
          target="_blank"
          rel="noreferrer"
          onClick={(e) => e.stopPropagation()}
          aria-label={`${c.name} ${label}`}
          data-testid={`client-${c.id}-${key}`}
          className="-m-1.5 p-1.5 text-white/40 transition-colors duration-300 hover:!text-[color:var(--a)]"
          style={{ "--a": accent }}
        >
          <Icon className="h-[15px] w-[15px]" />
        </a>
      ))}
    </span>
  );
};

const ClientCard = ({ c, i, lang }) => {
  const [broken, setBroken] = useState(false);
  const Icon = Icons[c.icon] || Icons.Store;
  const accent = ACCENTS[i % ACCENTS.length];
  const label = lang === "en" && c.nameEn ? c.nameEn : c.name;
  const showLogo = c.logo && !broken;

  return (
    <div
      data-testid={`client-card-${c.id}`}
      title={label}
      className="group relative mx-2 flex h-[158px] w-[200px] shrink-0 flex-col items-center justify-center gap-2.5 overflow-hidden rounded-[20px] border border-white/[0.07] bg-[#0b0b0e] px-5 transition-all duration-500 hover:-translate-y-1.5 hover:border-white/20 sm:mx-2.5 sm:h-[172px] sm:w-[224px]"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -top-16 left-1/2 h-32 w-32 -translate-x-1/2 rounded-full opacity-0 blur-2xl transition-opacity duration-700 group-hover:opacity-40"
        style={{ backgroundColor: accent }}
      />

      {showLogo ? (
        <span className="relative flex h-[54px] items-center justify-center sm:h-[62px]">
          <img
            src={c.logo}
            alt={label}
            loading="lazy"
            onError={() => setBroken(true)}
            className={
              c.tile
                ? "h-[54px] w-[54px] object-contain transition-transform duration-500 group-hover:scale-[1.08] sm:h-[62px] sm:w-[62px]"
                : "max-h-[54px] max-w-[146px] object-contain opacity-90 transition-all duration-500 group-hover:scale-[1.06] group-hover:opacity-100 sm:max-h-[62px] sm:max-w-[162px]"
            }
          />
        </span>
      ) : (
        <span
          className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 transition-transform duration-500 group-hover:scale-110"
          style={{ backgroundColor: `${accent}14` }}
        >
          <Icon className="h-[20px] w-[20px]" strokeWidth={1.9} style={{ color: accent }} />
        </span>
      )}

      {c.site ? (
        <a
          href={c.site}
          target="_blank"
          rel="noreferrer"
          className="relative text-center font-display text-[12.5px] font-semibold leading-tight tracking-tight text-white/55 transition-colors duration-500 hover:text-white group-hover:text-white/85 sm:text-[13.5px]"
        >
          {label}
        </a>
      ) : (
        <span className="relative text-center font-display text-[12.5px] font-semibold leading-tight tracking-tight text-white/55 transition-colors duration-500 group-hover:text-white/85 sm:text-[13.5px]">
          {label}
        </span>
      )}

      <SocialRow c={c} accent={accent} />
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

/** Deal the clients across 3 rows so logos stay evenly mixed. */
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
