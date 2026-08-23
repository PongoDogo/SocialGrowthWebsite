import { useState } from "react";
import { motion } from "framer-motion";
import * as Icons from "lucide-react";
import { CLIENTS } from "@/data/clients";
import LOGO_COLORS from "@/data/logoColors.json";
import { useLang } from "@/i18n";
import { TikTokIcon, InstagramIcon, FacebookIcon } from "@/components/SocialIcons";

const FALLBACK = ["#60d6ff", "#facc15", "#4ade80", "#f87171", "#a78bfa"];

const NETS = [
  { key: "ig", Icon: InstagramIcon, url: (h) => `https://www.instagram.com/${h}/`, label: "Instagram" },
  { key: "tt", Icon: TikTokIcon, url: (h) => `https://www.tiktok.com/@${h}`, label: "TikTok" },
  { key: "fb", Icon: FacebookIcon, url: (h) => `https://www.facebook.com/${h}`, label: "Facebook" },
];

const SocialRow = ({ c, accent }) => {
  const links = NETS.filter((n) => c.social?.[n.key]);
  if (!links.length) return <span className="block h-[22px]" />;
  return (
    <span className="flex h-[22px] items-center justify-center gap-1.5">
      {links.map(({ key, Icon, url, label }) => (
        <a
          key={key}
          href={url(c.social[key])}
          target="_blank"
          rel="noreferrer"
          aria-label={`${c.name} ${label}`}
          data-testid={`client-${c.id}-${key}`}
          className="rounded-md p-[3px] text-white/40 transition-all duration-300 hover:scale-110 hover:bg-white/[0.08]"
          onMouseEnter={(e) => (e.currentTarget.style.color = accent)}
          onMouseLeave={(e) => (e.currentTarget.style.color = "")}
        >
          <Icon className="h-[15px] w-[15px]" />
        </a>
      ))}
    </span>
  );
};

const ClientCard = ({ c, i, lang }) => {
  const [broken, setBroken] = useState(false);
  const [hot, setHot] = useState(false);
  const Icon = Icons[c.icon] || Icons.Store;
  const accent = LOGO_COLORS[c.id] || FALLBACK[i % FALLBACK.length];
  const label = lang === "en" && c.nameEn ? c.nameEn : c.name;
  const showLogo = c.logo && !broken;

  return (
    <div
      data-testid={`client-card-${c.id}`}
      title={label}
      onMouseEnter={() => setHot(true)}
      onMouseLeave={() => setHot(false)}
      className="group relative mx-2 flex h-[158px] w-[196px] shrink-0 flex-col items-center justify-center gap-3 overflow-hidden rounded-[22px] bg-[#0b0b0e] px-5 transition-transform duration-500 hover:-translate-y-1.5 sm:mx-2.5 sm:h-[176px] sm:w-[226px]"
      style={{
        boxShadow: hot
          ? `inset 0 0 0 1px ${accent}80, 0 18px 46px -22px ${accent}80`
          : "inset 0 0 0 1px rgba(255,255,255,0.075)",
        transition: "box-shadow .5s ease, transform .5s ease",
      }}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 transition-opacity duration-700"
        style={{ background: `radial-gradient(130% 90% at 50% -10%, ${accent}, transparent 62%)`, opacity: hot ? 0.2 : 0.075 }}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute -bottom-16 left-1/2 h-32 w-32 -translate-x-1/2 rounded-full blur-2xl transition-opacity duration-700"
        style={{ backgroundColor: accent, opacity: hot ? 0.32 : 0 }}
      />

      {c.site && (
        <a
          href={c.site}
          target="_blank"
          rel="noreferrer"
          aria-label={label}
          data-testid={`client-link-${c.id}`}
          className="absolute inset-x-0 top-0 bottom-9 z-10"
        />
      )}

      {showLogo ? (
        <span className="relative flex h-[64px] items-center justify-center sm:h-[76px]">
          <img
            src={c.logo}
            alt={label}
            loading="lazy"
            onError={() => setBroken(true)}
            className={
              c.tile
                ? "h-[64px] w-[64px] object-contain transition-transform duration-500 group-hover:scale-[1.09] sm:h-[76px] sm:w-[76px]"
                : "max-h-[64px] max-w-[152px] object-contain opacity-90 transition-all duration-500 group-hover:scale-[1.07] group-hover:opacity-100 sm:max-h-[76px] sm:max-w-[176px]"
            }
          />
        </span>
      ) : (
        <span
          className="relative flex h-12 w-12 items-center justify-center rounded-2xl transition-transform duration-500 group-hover:scale-110"
          style={{ backgroundColor: `${accent}1f`, boxShadow: `inset 0 0 0 1px ${accent}33` }}
        >
          <Icon className="h-[21px] w-[21px]" strokeWidth={1.9} style={{ color: accent }} />
        </span>
      )}

      <span className="relative text-center font-display text-[12.5px] font-semibold leading-tight tracking-tight text-white/70 transition-colors duration-500 group-hover:text-white sm:text-[13.5px]">
        {label}
      </span>

      <span className="relative z-20">
        <SocialRow c={c} accent={accent} />
      </span>
    </div>
  );
};

const Row = ({ items, duration, reverse, lang, offset }) => (
  <div className="marquee-wrap edge-fade overflow-hidden py-2.5">
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
      <div className="pointer-events-none absolute left-[6%] top-1/4 h-[380px] w-[380px] rounded-full bg-[#60d6ff] opacity-[0.10] blur-[120px]" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[340px] w-[340px] -translate-x-1/2 rounded-full bg-[#a78bfa] opacity-[0.08] blur-[120px]" />
      <div className="pointer-events-none absolute bottom-1/5 right-[5%] h-[360px] w-[360px] rounded-full bg-[#facc15] opacity-[0.07] blur-[120px]" />

      <div className="relative mx-auto max-w-[1240px] px-6 sm:px-8">
        <div className="max-w-2xl">
          <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-[#60d6ff] sm:text-[11px]">{t.clients.overline}</p>
          <h2 className="mt-4 font-display text-[26px] font-extrabold leading-[1.12] tracking-tight sm:text-4xl lg:text-5xl">{t.clients.title}</h2>
          <p className="mt-4 text-[13.5px] leading-relaxed text-white/50 sm:mt-5 sm:text-base lg:text-lg">{t.clients.sub}</p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="relative mt-10 flex flex-col gap-2 sm:mt-16 sm:gap-3"
      >
        <Row items={rows[0]} duration={54} lang={lang} offset={0} />
        <Row items={rows[1]} duration={68} reverse lang={lang} offset={2} />
        <Row items={rows[2]} duration={60} lang={lang} offset={4} />
      </motion.div>
    </section>
  );
};
