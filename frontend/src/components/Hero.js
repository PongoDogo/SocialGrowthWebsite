import React from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, Play } from "lucide-react";
import { useLang } from "@/i18n";
import { useSite, mediaUrl } from "@/content/ContentContext";
import { visibleItems } from "@/content/SectionShell";
import { NETWORK_ICONS } from "@/components/SocialIcons";
import { container, primaryBtn, secondaryBtn, btnIcons } from "@/content/style";

const HERO_PB = {
  compact: "pb-10 sm:pb-14",
  normal: "pb-16 sm:pb-24 lg:pb-28",
  roomy: "pb-24 sm:pb-32 lg:pb-40",
  huge: "pb-32 sm:pb-44 lg:pb-52",
};

const rise = (d = 0) => ({
  initial: { opacity: 0, y: 26 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, delay: d, ease: [0.22, 1, 0.36, 1] },
});

export const Hero = () => {
  const { lang } = useLang();
  const { c, L } = useSite(lang);
  const h = c.hero || {};
  const theme = c.theme || {};
  const accent = theme.accent || "#60d6ff";
  const accentDeep = theme.accentDeep || "#2563eb";
  const accentSoft = theme.accentSoft || "#a8ecff";
  const platforms = visibleItems(h.platforms);
  const centered = h.align === "center";
  const imageLeft = h.imageSide === "left";
  const btnsCentered = h.buttonsAlign === "center" || centered;
  const pb = primaryBtn(theme);
  const sb = secondaryBtn(theme);
  const showImage = h.showImage !== false;

  const go = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <section
      data-testid="hero"
      id="hero"
      data-sg="section:hero"
      data-sg-kind="section"
      data-sg-label="Ενότητα: Αρχή (Hero)"
      className={`relative overflow-hidden pt-[110px] sm:pt-[150px] lg:pt-[168px] ${HERO_PB[h.padding] || HERO_PB.normal}`}
    >
      {h.bgImage && (
        <>
          <img src={mediaUrl(h.bgImage)} alt="" className="pointer-events-none absolute inset-0 h-full w-full object-cover" />
          <span className="pointer-events-none absolute inset-0" style={{ backgroundColor: `rgba(0,0,0,${(h.bgOverlay ?? 60) / 100})` }} />
        </>
      )}
      {theme.glows !== false && (
        <>
          <div className="pointer-events-none absolute -left-40 -top-40 h-[560px] w-[560px] glow-blue" />
          <div className="pointer-events-none absolute -right-32 top-24 h-[480px] w-[480px] glow-cyan" />
        </>
      )}
      {theme.gridLines !== false && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.14]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.06) 1px, transparent 1px)",
            backgroundSize: "72px 72px",
            maskImage: "radial-gradient(ellipse 80% 60% at 50% 0%, #000, transparent)",
            WebkitMaskImage: "radial-gradient(ellipse 80% 60% at 50% 0%, #000, transparent)",
          }}
        />
      )}

      <div
        className={`relative mx-auto grid items-center gap-14 px-6 sm:px-8 lg:gap-16 ${
          showImage && !centered ? (imageLeft ? "lg:grid-cols-[0.88fr_1.12fr]" : "lg:grid-cols-[1.12fr_0.88fr]") : ""
        }`}
        style={container(theme)}
      >
        <div data-sg="hero.textBlock" data-sg-kind="box" data-sg-label="Στήλη κειμένων" className={`${centered ? "mx-auto max-w-3xl text-center" : ""} ${imageLeft && showImage && !centered ? "lg:order-2" : ""}`}>
          {h.showBadge !== false && (
            <motion.div {...rise(0)} data-testid="hero-badge" data-sg="hero.badge" data-sg-kind="text" data-sg-label="Ετικέτα" className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-white/12 bg-white/[0.04] px-4 py-2 sm:mb-7">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#4ade80]" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#4ade80]" />
              </span>
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/70 sm:text-[11px] sm:tracking-[0.2em]">{L(h.badge)}</span>
            </motion.div>
          )}

          <motion.h1 {...rise(0.08)} className="font-display text-[40px] font-extrabold leading-[0.98] tracking-tighter sm:text-6xl lg:text-7xl">
            <span data-sg="hero.titleA" data-sg-kind="text" data-sg-label="Τίτλος — 1η γραμμή">{L(h.titleA)}</span>
            <br />
            <span
              data-sg="hero.titleB"
              data-sg-kind="text"
              data-sg-label="Τίτλος — 2η γραμμή"
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: `linear-gradient(90deg, ${accentDeep}, ${accent}, ${accentSoft})` }}
            >
              {L(h.titleB)}
            </span>
          </motion.h1>

          <motion.p {...rise(0.16)} data-sg="hero.sub" data-sg-kind="text" data-sg-label="Υπότιτλος" className={`mt-6 max-w-xl text-[14.5px] leading-relaxed text-white/55 sm:mt-7 sm:text-base lg:text-lg ${centered ? "mx-auto" : ""}`}>
            {L(h.sub)}
          </motion.p>

          <motion.div
            {...rise(0.24)}
            data-sg="hero.buttonsRow"
            data-sg-kind="box"
            data-sg-label="Ομάδα κουμπιών"
            className={`mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:flex-wrap sm:items-center ${btnsCentered ? "sm:justify-center" : ""}`}
          >
            {L(h.primary) && (
              <button data-testid="hero-cta-primary" data-sg="hero.primary" data-sg-kind="button" data-sg-label="Κύριο κουμπί" onClick={() => go(h.primaryTarget || "contact")} className={`w-full sm:w-auto ${pb.className}`} style={pb.style}>
                {L(h.primary)}
                {btnIcons(theme) && (
                  <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" strokeWidth={2.5} />
                )}
              </button>
            )}
            {L(h.secondary) && (
              <button data-testid="hero-cta-secondary" data-sg="hero.secondary" data-sg-kind="button" data-sg-label="Δεύτερο κουμπί" onClick={() => go(h.secondaryTarget || "clients")} className={`w-full sm:w-auto ${sb.className}`} style={sb.style}>
                {btnIcons(theme) && <Play className="h-3.5 w-3.5" strokeWidth={2.5} />}
                {L(h.secondary)}
              </button>
            )}
          </motion.div>

          {platforms.length > 0 && (
            <motion.div {...rise(0.32)} data-sg="hero.platformsBlock" data-sg-kind="box" data-sg-label="Σειρά πλατφορμών" className="mt-12 sm:mt-14">
              <p data-sg="hero.platformsLabel" data-sg-kind="text" data-sg-label="Τίτλος πλατφορμών" className="mb-4 text-[10px] font-bold uppercase tracking-[0.26em] text-white/35">{L(h.platformsLabel)}</p>
              <div className={`flex flex-wrap items-center gap-x-6 gap-y-3 sm:gap-x-7 ${centered ? "justify-center" : ""}`}>
                {platforms.map((p) => {
                  const Icon = NETWORK_ICONS[p.network] || NETWORK_ICONS.Instagram;
                  return (
                    <span key={p.id} data-testid={`platform-${(p.network || p.label || "").toLowerCase()}`} className="group flex items-center gap-2.5">
                      <Icon className="h-[18px] w-[18px] text-white/40 transition-colors duration-300 group-hover:text-white" />
                      <span className="text-[13px] font-semibold text-white/40 transition-colors duration-300 group-hover:text-white sm:text-sm">{p.label}</span>
                    </span>
                  );
                })}
              </div>
            </motion.div>
          )}
        </div>

        {showImage && !centered && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className={`relative hidden lg:block ${imageLeft ? "lg:order-1" : ""}`}
          >
            <div className="absolute inset-8 glow-blue blur-2xl" />
            <motion.img
              data-sg="brand.heroImage"
              data-sg-kind="image"
              data-sg-label="Εικόνα Hero"
              src={mediaUrl(c.brand?.heroImage || c.brand?.logo)}
              alt=""
              animate={h.floatImage === false ? undefined : { y: [0, -16, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
              className="relative mx-auto w-full max-w-[360px] object-contain drop-shadow-[0_0_60px_rgba(37,99,235,0.45)]"
            />
          </motion.div>
        )}
      </div>
    </section>
  );
};
