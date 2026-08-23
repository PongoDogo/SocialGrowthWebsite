import { motion } from "framer-motion";
import { Video, CalendarCheck, Target, Camera, Users, Palette } from "lucide-react";
import { useLang } from "@/i18n";

const ICONS = [Video, CalendarCheck, Target, Camera, Users, Palette];
const ACCENTS = ["#60d6ff", "#facc15", "#4ade80", "#f87171", "#a78bfa", "#38bdf8"];

export const Services = () => {
  const { t } = useLang();

  return (
    <section data-testid="services" id="services" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-[1240px] px-5 sm:px-8">
        <div className="max-w-2xl">
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#60d6ff]">{t.services.overline}</p>
          <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">{t.services.title}</h2>
          <p className="mt-5 text-base leading-relaxed text-white/50 lg:text-lg">{t.services.sub}</p>
        </div>

        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {t.services.items.map((s, i) => {
            const Icon = ICONS[i];
            const featured = i === 0;
            return (
              <motion.article
                key={s.title}
                data-testid={`service-card-${i}`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.7, delay: (i % 3) * 0.08, ease: [0.22, 1, 0.36, 1] }}
                className={`card-sheen group rounded-3xl border border-white/[0.08] bg-[#0a0a0c] p-8 transition-colors duration-500 hover:border-white/20 ${
                  featured ? "sm:col-span-2 lg:col-span-1" : ""
                }`}
              >
                <div
                  className="mb-7 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 transition-transform duration-500 group-hover:-translate-y-1"
                  style={{ backgroundColor: `${ACCENTS[i]}14` }}
                >
                  <Icon className="h-5 w-5" strokeWidth={2} style={{ color: ACCENTS[i] }} />
                </div>
                <h3 className="font-display text-xl font-bold tracking-tight">{s.title}</h3>
                <p className="mt-3.5 text-sm leading-relaxed text-white/45">{s.desc}</p>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
};
