import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import * as Icons from "lucide-react";
import { useLang } from "@/i18n";
import { useSite, mediaUrl } from "@/content/ContentContext";
import { visibleItems } from "@/content/SectionShell";
import { NETWORKS } from "@/components/SocialIcons";
import { container, pad, headBox, surfaceBg, ring, iconBox, iconScale } from "@/content/style";

const FALLBACK = ["#60d6ff", "#facc15", "#4ade80", "#f87171", "#a78bfa"];
const ROW_FACTORS = [1, 1.26, 1.11, 1.35];
const CARD_SIZES = {
  sm: "h-[132px] w-[166px] sm:h-[148px] sm:w-[190px]",
  md: "h-[158px] w-[196px] sm:h-[176px] sm:w-[226px]",
  lg: "h-[186px] w-[236px] sm:h-[206px] sm:w-[268px]",
};

const SocialRow = ({ c, accent }) => {
  const links = NETWORKS.filter((n) => c.social?.[n.key]);
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

const ClientCard = ({ c, i, lang, cl, theme }) => {
  const [broken, setBroken] = useState(false);
  const [hot, setHot] = useState(false);
  const Icon = Icons[c.icon] || Icons.Store;
  const accent = c.accent || FALLBACK[i % FALLBACK.length];
  const label = lang === "en" && c.nameEn ? c.nameEn : c.name;
  const showLogo = c.logo && !broken;
  const k = Math.max(0.5, Math.min(1.6, (cl.logoMax || 100) / 100));
  const socialsFirst = cl.socialsPosition === "above";
  const radius = `${cl.cardRadius ?? 22}px`;

  const social =
    cl.showSocials !== false ? (
      <span className="relative z-20">
        <SocialRow c={c} accent={accent} />
      </span>
    ) : null;

  return (
    <div
      data-testid={`client-card-${c.id}`}
      title={label}
      onMouseEnter={() => setHot(true)}
      onMouseLeave={() => setHot(false)}
      className={`group relative mx-2 flex shrink-0 flex-col items-center justify-center gap-3 overflow-hidden px-5 transition-transform duration-500 hover:-translate-y-1.5 sm:mx-2.5 ${
        CARD_SIZES[cl.cardSize] || CARD_SIZES.md
      }`}
      style={{
        backgroundColor: surfaceBg(theme),
        borderRadius: radius,
        boxShadow: hot ? `inset 0 0 0 1px ${accent}80, 0 18px 46px -22px ${accent}80` : ring(theme),
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

      {socialsFirst && social}

      {showLogo ? (
        <span className="relative flex items-center justify-center" style={{ height: 76 * k }}>
          <img
            src={mediaUrl(c.logo)}
            alt={label}
            loading="lazy"
            onError={() => setBroken(true)}
            className={
              c.tile
                ? "object-contain transition-transform duration-500 group-hover:scale-[1.09]"
                : "object-contain opacity-90 transition-all duration-500 group-hover:scale-[1.07] group-hover:opacity-100"
            }
            style={
              c.tile
                ? { height: 76 * k, width: 76 * k, maxWidth: "80%" }
                : { maxHeight: 76 * k, maxWidth: `min(${176 * k}px, 88%)` }
            }
          />
        </span>
      ) : (
        <span
          className="relative flex items-center justify-center rounded-2xl transition-transform duration-500 group-hover:scale-110"
          style={{ ...iconBox(theme, accent), height: 48 * iconScale(theme), width: 48 * iconScale(theme) }}
        >
          <Icon className="h-[21px] w-[21px]" strokeWidth={1.9} style={{ color: accent }} />
        </span>
      )}

      {cl.showNames !== false && (
        <span className="relative text-center font-display text-[12.5px] font-semibold leading-tight tracking-tight text-white/70 transition-colors duration-500 group-hover:text-white sm:text-[13.5px]">
          {label}
        </span>
      )}

      {!socialsFirst && social}
    </div>
  );
};

const Row = ({ items, duration, reverse, lang, offset, cl, theme }) => (
  <div className={`marquee-wrap edge-fade overflow-hidden py-2.5 ${cl.pauseOnHover === false ? "no-pause" : ""}`}>
    <div className={`marquee ${reverse ? "marquee-reverse" : ""}`} style={{ animationDuration: `${duration}s` }}>
      {[...items, ...items].map((c, i) => (
        <ClientCard key={`${c.id}-${i}`} c={c} i={i + offset} lang={lang} cl={cl} theme={theme} />
      ))}
    </div>
  </div>
);

export const Clients = () => {
  const { lang } = useLang();
  const { c, L } = useSite(lang);
  const cl = c.clients || {};
  const theme = c.theme || {};
  const accent = theme.accent || "#60d6ff";

  const rowCount = Math.max(1, Math.min(4, Number(cl.rows) || 3));
  const speed = Math.max(10, Math.min(200, Number(cl.speed) || 54));

  const rows = useMemo(() => {
    const items = visibleItems(cl.items);
    const out = Array.from({ length: rowCount }, () => []);
    items.forEach((it, i) => out[i % rowCount].push(it));
    return out.filter((r) => r.length > 0);
  }, [cl.items, rowCount]);

  return (
    <section data-testid="clients" id="clients" className={`relative overflow-hidden ${pad(cl.padding)}`}>
      {theme.glows !== false && (
        <>
          <div className="pointer-events-none absolute left-[6%] top-1/4 h-[380px] w-[380px] rounded-full opacity-[0.10] blur-[120px]" style={{ backgroundColor: accent }} />
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-[340px] w-[340px] -translate-x-1/2 rounded-full bg-[#a78bfa] opacity-[0.08] blur-[120px]" />
          <div className="pointer-events-none absolute bottom-1/5 right-[5%] h-[360px] w-[360px] rounded-full bg-[#facc15] opacity-[0.07] blur-[120px]" />
        </>
      )}

      <div className="relative mx-auto px-6 sm:px-8" style={container(theme)}>
        <div className={`max-w-2xl ${headBox(cl.align)}`}>
          <p className="text-[10px] font-bold uppercase tracking-[0.26em] sm:text-[11px]" style={{ color: accent }}>{L(cl.overline)}</p>
          <h2 className="mt-4 font-display text-[26px] font-extrabold leading-[1.12] tracking-tight sm:text-4xl lg:text-5xl">{L(cl.title)}</h2>
          <p className="mt-4 text-[13.5px] leading-relaxed text-white/50 sm:mt-5 sm:text-base lg:text-lg">{L(cl.sub)}</p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="relative mt-10 flex flex-col gap-2 sm:mt-16 sm:gap-3"
      >
        {rows.map((items, i) => (
          <Row
            key={i}
            items={items}
            duration={Math.round(speed * ROW_FACTORS[i % ROW_FACTORS.length])}
            reverse={i % 2 === 1}
            lang={lang}
            offset={i * 2}
            cl={cl}
            theme={theme}
          />
        ))}
      </motion.div>
    </section>
  );
};
