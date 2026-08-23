import { motion } from "framer-motion";
import { ArrowUpRight, Play } from "lucide-react";
import { useLang } from "@/i18n";
import { SOCIALS } from "@/components/SocialIcons";

const PLATFORMS = SOCIALS;

const rise = (d = 0) => ({
  initial: { opacity: 0, y: 26 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, delay: d, ease: [0.22, 1, 0.36, 1] },
});

export const Hero = () => {
  const { t } = useLang();
  const go = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <section data-testid="hero" className="relative overflow-hidden pt-[110px] pb-16 sm:pt-[150px] sm:pb-24 lg:pt-[168px] lg:pb-28">
      <div className="pointer-events-none absolute -left-40 -top-40 h-[560px] w-[560px] glow-blue" />
      <div className="pointer-events-none absolute -right-32 top-24 h-[480px] w-[480px] glow-cyan" />
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

      <div className="relative mx-auto grid max-w-[1240px] items-center gap-14 px-6 sm:px-8 lg:grid-cols-[1.12fr_0.88fr] lg:gap-16">
        <div>
          <motion.div {...rise(0)} data-testid="hero-badge" className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-white/12 bg-white/[0.04] px-4 py-2 sm:mb-7">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#4ade80]" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#4ade80]" />
            </span>
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/70 sm:text-[11px] sm:tracking-[0.2em]">{t.hero.badge}</span>
          </motion.div>

          <motion.h1 {...rise(0.08)} className="font-display text-[40px] font-extrabold leading-[0.98] tracking-tighter sm:text-6xl lg:text-7xl">
            {t.hero.titleA}
            <br />
            <span className="bg-gradient-to-r from-[#2563eb] via-[#60d6ff] to-[#a8ecff] bg-clip-text text-transparent">{t.hero.titleB}</span>
          </motion.h1>

          <motion.p {...rise(0.16)} className="mt-6 max-w-xl text-[14.5px] leading-relaxed text-white/55 sm:mt-7 sm:text-base lg:text-lg">
            {t.hero.sub}
          </motion.p>

          <motion.div {...rise(0.24)} className="mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:flex-wrap sm:items-center">
            <button
              data-testid="hero-cta-primary"
              onClick={() => go("contact")}
              className="group flex w-full items-center justify-center gap-2 rounded-full bg-white px-7 py-4 text-sm font-bold text-black transition-transform duration-300 hover:-translate-y-0.5 sm:w-auto sm:py-3.5"
            >
              {t.hero.primary}
              <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" strokeWidth={2.5} />
            </button>
            <button
              data-testid="hero-cta-secondary"
              onClick={() => go("clients")}
              className="flex w-full items-center justify-center gap-2 rounded-full border border-white/15 px-7 py-4 text-sm font-semibold text-white/80 transition-colors duration-300 hover:border-white/35 hover:text-white sm:w-auto sm:py-3.5"
            >
              <Play className="h-3.5 w-3.5" strokeWidth={2.5} />
              {t.hero.secondary}
            </button>
          </motion.div>

          <motion.div {...rise(0.32)} className="mt-12 sm:mt-14">
            <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.26em] text-white/35">{t.hero.platforms}</p>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 sm:gap-x-7">
              {PLATFORMS.map(({ name, Icon }) => (
                <span key={name} data-testid={`platform-${name.toLowerCase()}`} className="group flex items-center gap-2.5">
                  <Icon className="h-[18px] w-[18px] text-white/40 transition-colors duration-300 group-hover:text-white" />
                  <span className="text-[13px] font-semibold text-white/40 transition-colors duration-300 group-hover:text-white sm:text-sm">{name}</span>
                </span>
              ))}
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="relative hidden lg:block"
        >
          <div className="absolute inset-8 glow-blue blur-2xl" />
          <motion.img
            src="/logo.png"
            alt="SocialGrowth"
            animate={{ y: [0, -16, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            className="relative mx-auto w-full max-w-[360px] object-contain drop-shadow-[0_0_60px_rgba(37,99,235,0.45)]"
          />
        </motion.div>
      </div>
    </section>
  );
};
