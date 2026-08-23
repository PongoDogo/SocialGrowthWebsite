import { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Mail, Send, Check } from "lucide-react";
import { toast } from "sonner";
import { useLang } from "@/i18n";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const EMAIL = "socialstartupagency@gmail.com";

const Field = ({ label, testId, ...rest }) => (
  <label className="block">
    <span className="mb-2.5 block text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">{label}</span>
    {rest.rows ? (
      <textarea
        data-testid={testId}
        {...rest}
        className="w-full resize-none rounded-2xl bg-white/[0.03] px-5 py-4 text-sm text-white placeholder-white/20 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)] transition-shadow duration-300 focus:shadow-[inset_0_0_0_1px_rgba(96,214,255,0.6)]"
      />
    ) : (
      <input
        data-testid={testId}
        {...rest}
        className="w-full rounded-2xl bg-white/[0.03] px-5 py-4 text-sm text-white placeholder-white/20 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)] transition-shadow duration-300 focus:shadow-[inset_0_0_0_1px_rgba(96,214,255,0.6)]"
      />
    )}
  </label>
);

export const Contact = () => {
  const { t } = useLang();
  const [form, setForm] = useState({ name: "", email: "", business: "", message: "" });
  const [busy, setBusy] = useState(false);
  const [state, setState] = useState(null);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await axios.post(`${API}/contact`, form);
      setState("ok");
      setForm({ name: "", email: "", business: "", message: "" });
      toast.success(t.contact.ok);
    } catch {
      setState("err");
      toast.error(t.contact.err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section data-testid="contact" id="contact" className="relative overflow-hidden py-20 sm:py-28 lg:py-32">
      <div className="pointer-events-none absolute -right-24 top-10 h-[480px] w-[480px] glow-blue opacity-70" />

      <div className="relative mx-auto grid max-w-[1240px] gap-10 px-6 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-[#60d6ff] sm:text-[11px]">{t.contact.overline}</p>
          <h2 className="mt-4 font-display text-[26px] font-extrabold leading-[1.12] tracking-tight sm:text-4xl lg:text-5xl">{t.contact.title}</h2>
          <p className="mt-4 text-[13.5px] leading-relaxed text-white/50 sm:mt-5 sm:text-base lg:text-lg">{t.contact.sub}</p>

          <a
            data-testid="contact-email-link"
            href={`mailto:${EMAIL}`}
            className="group mt-8 inline-flex max-w-full items-center gap-3 rounded-2xl bg-white/[0.03] px-5 py-4 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)] transition-shadow duration-300 hover:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.28)] sm:mt-10 sm:gap-3.5 sm:px-6"
          >
            <Mail className="h-5 w-5 shrink-0 text-[#60d6ff]" strokeWidth={2} />
            <span className="truncate text-[13px] font-semibold text-white/80 group-hover:text-white sm:text-sm">{EMAIL}</span>
          </a>

          <ul className="mt-8 space-y-3.5 sm:mt-10">
            {t.contact.points.map((p, i) => (
              <li key={p} data-testid={`contact-point-${i}`} className="flex items-center gap-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#60d6ff]/12">
                  <Check className="h-3 w-3 text-[#60d6ff]" strokeWidth={3} />
                </span>
                <span className="text-[13px] font-medium text-white/55 sm:text-sm">{p}</span>
              </li>
            ))}
          </ul>
        </div>

        <motion.form
          data-testid="contact-form"
          onSubmit={submit}
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-3xl bg-[#0a0a0c] p-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.075)] sm:p-9"
        >
          <div className="grid gap-4 sm:grid-cols-2 sm:gap-5">
            <Field label={t.contact.name} testId="contact-name" value={form.name} onChange={set("name")} required placeholder="—" />
            <Field label={t.contact.email} testId="contact-email" type="email" value={form.email} onChange={set("email")} required placeholder="—" />
          </div>
          <div className="mt-4 sm:mt-5">
            <Field label={t.contact.business} testId="contact-business" value={form.business} onChange={set("business")} placeholder="—" />
          </div>
          <div className="mt-4 sm:mt-5">
            <Field label={t.contact.message} testId="contact-message" rows={5} value={form.message} onChange={set("message")} required placeholder="—" />
          </div>

          {state === "err" && (
            <p data-testid="contact-error" className="mt-5 rounded-xl bg-red-500/10 px-4 py-3 text-[13px] font-medium text-red-300">
              {t.contact.err}
            </p>
          )}

          <button
            data-testid="contact-submit"
            type="submit"
            disabled={busy}
            className="group mt-7 flex w-full items-center justify-center gap-2.5 rounded-full bg-white px-7 py-4 text-sm font-bold text-black transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50 sm:mt-8"
          >
            {state === "ok" && !busy ? <Check className="h-4 w-4" strokeWidth={3} /> : <Send className="h-4 w-4" strokeWidth={2.4} />}
            {busy ? t.contact.sending : state === "ok" ? t.contact.ok : t.contact.send}
          </button>
        </motion.form>
      </div>
    </section>
  );
};
