import React, { useEffect, useMemo, useState } from "react";
import * as Icons from "lucide-react";
import { useLang } from "@/i18n";
import { useSite, mediaUrl } from "@/content/ContentContext";
import { visibleItems } from "@/content/SectionShell";
import { NETWORKS } from "@/components/SocialIcons";
import { Marquee } from "@/components/Marquee";
import { container, pad, headBox, surfaceBg, ring, iconBox, iconScale, hexToRgba } from "@/content/style";

const FALLBACK = ["#60d6ff", "#facc15", "#4ade80", "#f87171", "#a78bfa"];
/* row speed variety is now driven by clients.rowVariety (see Clients below) */
const CARD_SIZES = {
  sm: { h: 132, w: 166, hSm: 148, wSm: 190 },
  md: { h: 158, w: 196, hSm: 176, wSm: 226 },
  lg: { h: 186, w: 236, hSm: 206, wSm: 268 },
};

/** Warm the browser cache once, so no logo ever pops in while scrolling. */
const usePreload = (urls) => {
  const key = urls.join("|");
  useEffect(() => {
    urls.forEach((u) => {
      if (!u) return;
      const img = new Image();
      img.decoding = "async";
      img.src = mediaUrl(u);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
};

const SocialRow = ({ c, accent, base }) => {
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
          className="rounded-md p-[3px] transition-all duration-300 hover:scale-110 hover:bg-white/[0.08]"
          style={{ color: base }}
          onMouseEnter={(e) => (e.currentTarget.style.color = accent)}
          onMouseLeave={(e) => (e.currentTarget.style.color = base)}
        >
          <Icon className="h-[15px] w-[15px]" />
        </a>
      ))}
    </span>
  );
};

const ClientCard = ({ c, i, lang, cl, theme, size, gap, darkTiles }) => {
  const [broken, setBroken] = useState(false);
  const [hot, setHot] = useState(false);
  const Icon = Icons[c.icon] || Icons.Store;
  const accent = c.accent || FALLBACK[i % FALLBACK.length];
  const label = lang === "en" && c.nameEn ? c.nameEn : c.name;
  const showLogo = c.logo && !broken;
  const k = Math.max(0.5, Math.min(1.6, (cl.logoMax || 100) / 100));
  const socialsFirst = cl.socialsPosition === "above";
  const radius = `${cl.cardRadius ?? 22}px`;
  const light = theme.mode === "light" && !darkTiles;
  const ink = theme.ink || "#12121a";
  const nameColor = hot ? (light ? ink : "#ffffff") : light ? hexToRgba(ink, 0.72) : "rgba(255,255,255,0.72)";
  const iconBase = light ? hexToRgba(ink, 0.42) : "rgba(255,255,255,0.42)";

  const social =
    cl.showSocials !== false ? (
      <span className="relative z-20">
        <SocialRow c={c} accent={accent} base={iconBase} />
      </span>
    ) : null;

  /* ---- editable card hover reaction (all opt-in, defaults keep the old look) */
  const hv = cl.cardHover || {};
  const lift = Number(hv.lift ?? 6);
  const hScale = Number(hv.scale ?? 100) / 100;
  const tilt = Number(hv.tilt ?? 0);
  const glow = Number(hv.glow ?? 0);
  const dur = Math.max(0, Math.min(2000, Number(hv.speed ?? 500)));
  const grayRest = Number(hv.grayscale ?? 0);
  const grayHot = Number(hv.grayscaleHover ?? 0);

  const cardTransform = hot
    ? [
        tilt ? `perspective(760px) rotateX(${tilt}deg)` : "",
        lift ? `translateY(${-lift}px)` : "",
        hScale !== 1 ? `scale(${hScale})` : "",
      ]
        .filter(Boolean)
        .join(" ") || "none"
    : "none";

  const glowShadow = glow ? `, 0 0 ${glow}px ${hv.glowColor || accent}` : "";
  const logoFilter = `grayscale(${(hot ? grayHot : grayRest) / 100})`;

  return (
    <div
      data-testid={`client-card-${c.id}`}
      data-sg={`clients.items.${c._i}`}
      data-sg-kind="card"
      data-sg-label={`Κάρτα: ${c.name || "μαγαζί"}`}
      title={label}
      onMouseEnter={() => setHot(true)}
      onMouseLeave={() => setHot(false)}
      className="group relative flex shrink-0 flex-col items-center justify-center gap-3 overflow-hidden px-5"
      style={{
        height: size.h,
        width: size.w,
        marginLeft: gap / 2,
        marginRight: gap / 2,
        backgroundColor: darkTiles ? theme.tileColor || "#101218" : surfaceBg(theme),
        borderRadius: radius,
        transform: cardTransform,
        boxShadow: hot
          ? `inset 0 0 0 1px ${hv.borderColor || `${accent}80`}, 0 18px 46px -22px ${accent}80${glowShadow}`
          : darkTiles
          ? "inset 0 0 0 1px rgba(255,255,255,0.08)"
          : ring(theme),
        transition: `box-shadow ${dur}ms cubic-bezier(.2,.7,.2,1), transform ${dur}ms cubic-bezier(.2,.7,.2,1)`,
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
            loading="eager"
            decoding="async"
            draggable={false}
            onError={() => setBroken(true)}
            data-testid="client-logo"
            className={
              c.tile
                ? "object-contain transition-transform duration-500 group-hover:scale-[1.09]"
                : "object-contain opacity-90 transition-all duration-500 group-hover:scale-[1.07] group-hover:opacity-100"
            }
            style={
              c.tile
                ? { height: 76 * k, width: 76 * k, maxWidth: "80%", filter: logoFilter, transitionDuration: `${dur}ms` }
                : { maxHeight: 76 * k, maxWidth: `min(${176 * k}px, 88%)`, filter: logoFilter, transitionDuration: `${dur}ms` }
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
        <span
          className="relative text-center font-display text-[12.5px] font-semibold leading-tight tracking-tight transition-colors duration-500 sm:text-[13.5px]"
          style={{ color: nameColor }}
        >
          {label}
        </span>
      )}

      {!socialsFirst && social}
    </div>
  );
};

export const Clients = () => {
  const { lang } = useLang();
  const { c, L } = useSite(lang);
  const cl = c.clients || {};
  const theme = c.theme || {};
  const accent = theme.accent || "#60d6ff";

  const rowCount = Math.max(1, Math.min(4, Number(cl.rows) || 3));
  const seconds = Math.max(10, Math.min(200, Number(cl.speed) || 54));
  const basePx = Math.max(6, Math.min(320, 2200 / seconds));
  const gap = Math.max(0, Math.min(60, cl.gap ?? 20));
  const fade = Math.max(0, Math.min(22, cl.fadeEdges ?? 7));
  const [narrow, setNarrow] = useState(typeof window !== "undefined" ? window.innerWidth < 640 : false);

  /* direction: all one way, alternating, or hand-picked per row */
  const dirMode = cl.direction || "alternate";
  const rowDirs = Array.isArray(cl.rowDirs) ? cl.rowDirs : [];
  const isReverse = (i) => {
    if (dirMode === "left") return false;
    if (dirMode === "right") return true;
    if (dirMode === "manual") return !!rowDirs[i];
    return i % 2 === 1;
  };

  /* speed variety between rows — 0 makes every row identical */
  const variety = Math.max(0, Math.min(80, cl.rowVariety ?? 18)) / 100;
  const SEQ = [1, -0.6, 0.35, -0.85];
  const rowSpeed = (i) => Math.max(0.2, 1 + SEQ[i % SEQ.length] * variety);

  useEffect(() => {
    const onR = () => setNarrow(window.innerWidth < 640);
    window.addEventListener("resize", onR);
    return () => window.removeEventListener("resize", onR);
  }, []);

  const preset = CARD_SIZES[cl.cardSize] || CARD_SIZES.md;
  const size = narrow ? { h: preset.h, w: preset.w } : { h: preset.hSm, w: preset.wSm };
  const darkTiles = cl.logoTiles === "on" ? true : cl.logoTiles === "off" ? false : theme.mode === "light";

  const items = useMemo(() => visibleItems(cl.items), [cl.items]);
  usePreload(useMemo(() => items.map((i) => i.logo).filter(Boolean), [items]));

  const rows = useMemo(() => {
    const out = Array.from({ length: rowCount }, () => []);
    items.forEach((it, i) => out[i % rowCount].push(it));
    return out.filter((r) => r.length > 0);
  }, [items, rowCount]);

  return (
    <section
      data-testid="clients"
      id="clients"
      data-sg="section:clients"
      data-sg-kind="section"
      data-sg-label="Ενότητα: Συνεργασίες"
      className={`relative overflow-hidden ${pad(cl.padding)}`}
    >
      {theme.glows !== false && (
        <>
          <div className="pointer-events-none absolute left-[6%] top-1/4 h-[380px] w-[380px] rounded-full opacity-[0.10] blur-[120px]" style={{ backgroundColor: accent }} />
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-[340px] w-[340px] -translate-x-1/2 rounded-full bg-[#a78bfa] opacity-[0.08] blur-[120px]" />
          <div className="pointer-events-none absolute bottom-1/5 right-[5%] h-[360px] w-[360px] rounded-full bg-[#facc15] opacity-[0.07] blur-[120px]" />
        </>
      )}

      <div className="relative mx-auto px-6 sm:px-8" style={container(theme)}>
        <div className={`max-w-2xl ${headBox(cl.align)}`}>
          <p
            data-sg="clients.overline"
            data-sg-kind="text"
            data-sg-label="Μικρός τίτλος"
            className="text-[10px] font-bold uppercase tracking-[0.26em] sm:text-[11px]"
            style={{ color: accent }}
          >
            {L(cl.overline)}
          </p>
          <h2
            data-sg="clients.title"
            data-sg-kind="text"
            data-sg-label="Τίτλος ενότητας"
            className="mt-4 font-display text-[26px] font-extrabold leading-[1.12] tracking-tight sm:text-4xl lg:text-5xl"
          >
            {L(cl.title)}
          </h2>
          <p
            data-sg="clients.sub"
            data-sg-kind="text"
            data-sg-label="Υπότιτλος"
            className="mt-4 text-[13.5px] leading-relaxed text-white/50 sm:mt-5 sm:text-base lg:text-lg"
          >
            {L(cl.sub)}
          </p>
        </div>
      </div>

      <div className="relative mt-10 flex flex-col gap-3 sm:mt-16 sm:gap-4">
        {rows.map((rowItems, i) => (
          <Marquee
            key={i}
            pxPerSecond={basePx * rowSpeed(i)}
            reverse={isReverse(i)}
            pauseOnHover={cl.pauseOnHover !== false}
            hoverSpeed={cl.hoverSpeed ?? 0}
            brake={cl.brake ?? 7}
            draggable={cl.drag === true}
            fade={fade}
          >
            {rowItems.map((it, j) => (
              <ClientCard key={it.id || j} c={it} i={j + i * 2} lang={lang} cl={cl} theme={theme} size={size} gap={gap} darkTiles={darkTiles} />
            ))}
          </Marquee>
        ))}
      </div>
    </section>
  );
};
