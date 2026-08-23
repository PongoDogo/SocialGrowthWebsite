import { motion } from "framer-motion";
import { Video, CalendarCheck, Target, Camera, Users, Palette } from "lucide-react";
import { useLang } from "@/i18n";

const ICONS = [Video, CalendarCheck, Target, Camera, Users, Palette];
const ACCENTS = ["#60d6ff", "#facc15", "#4ade80", "#f87171", "#a78bfa", "#fb923c"];

export const Services = () => {
  const { t } = useLang();

  return (
    <section data-testid="services" id="services" className="relative py-20 sm:py-28 lg:py-32">
      <div className="pointer-events-none absolute right-0 top-1/4 h-[420px] w-[420px] glow-cyan opacity-50" />

      <div className="relative mx-auto max-w-[1240px] px-6 sm:px-8">
        <div className="max-w-2xl">
          <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-[#60d6ff] sm:text-[11px]">{t.services.overline}</p>
          <h2 className="mt-4 font-display text-[26px] font-extrabold leading-[1.12] tracking-tight sm:text-4xl lg:text-5xl">{t.services.title}</h2>
          <p className="mt-4 text-[13.5px] leading-relaxed text-white/50 sm:mt-5 sm:text-base lg:text-lg">{t.services.sub}</p>
        </div>

        <div className="mt-10 grid gap-4 sm:mt-16 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
          {t.services.items.map((s, i) => {
            const Icon = ICONS[i];
            const accent = ACCENTS[i];
            return (
              <motion.article
                key={s.title}
                data-testid={`service-card-${i}`}
                initial={{ opacity: 0, y: 26 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.7, delay: (i % 3) * 0.08, ease: [0.22, 1, 0.36, 1] }}
                className="group relative overflow-hidden rounded-3xl bg-[#0a0a0c] p-7 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.075)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.18)] sm:p-8"
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full opacity-[0.07] blur-3xl transition-opacity duration-700 group-hover:opacity-[0.2]"
                  style={{ backgroundColor: accent }}
                />
                <div className="relative flex items-start justify-between">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-2xl transition-transform duration-500 group-hover:-translate-y-1"
                    style={{ backgroundColor: `${accent}16`, boxShadow: `inset 0 0 0 1px ${accent}30` }}
                  >
                    <Icon className="h-5 w-5" strokeWidth={2} style={{ color: accent }} />
                  </div>
                  <span className="font-display text-[11px] font-extrabold tracking-[0.22em] text-white/15">0{i + 1}</span>
                </div>
                <h3 className="relative mt-6 font-display text-[18px] font-bold tracking-tight sm:text-xl">{s.title}</h3>
                <p className="relative mt-3 text-[13.5px] leading-relaxed text-white/45 sm:text-sm">{s.desc}</p>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
};
