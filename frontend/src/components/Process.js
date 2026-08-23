import { motion } from "framer-motion";
import { useLang } from "@/i18n";

const ACCENTS = ["#60d6ff", "#facc15", "#4ade80", "#f87171"];

export const Process = () => {
  const { t } = useLang();

  return (
    <section data-testid="process" className="relative overflow-hidden border-y border-white/[0.07] py-20 sm:py-28 lg:py-32">
      <div className="pointer-events-none absolute left-1/4 top-0 h-[320px] w-[620px] glow-blue opacity-40" />

      <div className="relative mx-auto max-w-[1240px] px-6 sm:px-8">
        <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-[#60d6ff] sm:text-[11px]">{t.process.overline}</p>
        <h2 className="mt-4 font-display text-[26px] font-extrabold leading-[1.12] tracking-tight sm:text-4xl lg:text-5xl">{t.process.title}</h2>

        <div className="relative mt-12 grid gap-8 sm:mt-16 sm:grid-cols-2 sm:gap-10 lg:grid-cols-4">
          {t.process.items.map((p, i) => (
            <motion.div
              key={p.t}
              data-testid={`process-step-${i}`}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.7, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="group relative"
            >
              <div className="mb-6 h-px w-full overflow-hidden bg-white/[0.08]">
                <motion.span
                  aria-hidden
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.1, delay: 0.2 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                  className="block h-full w-full origin-left"
                  style={{ background: `linear-gradient(90deg, ${ACCENTS[i]}, transparent)` }}
                />
              </div>
              <span className="font-display text-[13px] font-extrabold tracking-[0.2em]" style={{ color: `${ACCENTS[i]}99` }}>
                0{i + 1}
              </span>
              <h3 className="mt-3 font-display text-[18px] font-bold tracking-tight sm:text-xl">{p.t}</h3>
              <p className="mt-3 text-[13.5px] leading-relaxed text-white/45 sm:text-sm">{p.d}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
