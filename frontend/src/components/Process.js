import { motion } from "framer-motion";
import { useLang } from "@/i18n";

export const Process = () => {
  const { t } = useLang();

  return (
    <section data-testid="process" className="relative border-y border-white/[0.07] py-24 sm:py-32">
      <div className="mx-auto max-w-[1240px] px-5 sm:px-8">
        <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#60d6ff]">{t.process.overline}</p>
        <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">{t.process.title}</h2>

        <div className="mt-16 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {t.process.items.map((p, i) => (
            <motion.div
              key={p.t}
              data-testid={`process-step-${i}`}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="relative"
            >
              <div className="mb-6 h-px w-full hairline" />
              <span className="font-display text-sm font-extrabold tracking-widest text-white/25">0{i + 1}</span>
              <h3 className="mt-4 font-display text-xl font-bold tracking-tight">{p.t}</h3>
              <p className="mt-3 text-sm leading-relaxed text-white/45">{p.d}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
