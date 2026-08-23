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
        className="w-full resize-none rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 text-sm text-white placeholder-white/20 transition-colors duration-300 focus:border-[#60d6ff]/60"
      />
    ) : (
      <input
        data-testid={testId}
        {...rest}
        className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 text-sm text-white placeholder-white/20 transition-colors duration-300 focus:border-[#60d6ff]/60"
      />
    )}
  </label>
);

export const Contact = () => {
  const { t } = useLang();
  const [form, setForm] = useState({ name: "", email: "", business: "", message: "" });
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await axios.post(`${API}/contact`, form);
      setDone(true);
      setForm({ name: "", email: "", business: "", message: "" });
      toast.success(t.contact.ok);
    } catch (err) {
      toast.error(t.contact.err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section data-testid="contact" id="contact" className="relative overflow-hidden py-24 sm:py-32">
      <div className="pointer-events-none absolute -right-24 top-10 h-[520px] w-[520px] glow-blue opacity-70" />

      <div className="relative mx-auto grid max-w-[1240px] gap-16 px-5 sm:px-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#60d6ff]">{t.contact.overline}</p>
          <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">{t.contact.title}</h2>
          <p className="mt-5 text-base leading-relaxed text-white/50 lg:text-lg">{t.contact.sub}</p>

          <a
            data-testid="contact-email-link"
            href={`mailto:${EMAIL}`}
            className="group mt-10 inline-flex items-center gap-3.5 rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-4 transition-colors duration-300 hover:border-white/25"
          >
            <Mail className="h-5 w-5 text-[#60d6ff]" strokeWidth={2} />
            <span className="text-sm font-semibold text-white/80 group-hover:text-white">{EMAIL}</span>
          </a>
        </div>

        <motion.form
          data-testid="contact-form"
          onSubmit={submit}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-3xl border border-white/[0.08] bg-[#0a0a0c] p-7 sm:p-9"
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label={t.contact.name} testId="contact-name" value={form.name} onChange={set("name")} required placeholder="—" />
            <Field label={t.contact.email} testId="contact-email" type="email" value={form.email} onChange={set("email")} required placeholder="—" />
          </div>
          <div className="mt-5">
            <Field label={t.contact.business} testId="contact-business" value={form.business} onChange={set("business")} placeholder="—" />
          </div>
          <div className="mt-5">
            <Field label={t.contact.message} testId="contact-message" rows={5} value={form.message} onChange={set("message")} required placeholder="—" />
          </div>

          <button
            data-testid="contact-submit"
            type="submit"
            disabled={busy}
            className="group mt-8 flex w-full items-center justify-center gap-2.5 rounded-full bg-white px-7 py-4 text-sm font-bold text-black transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50"
          >
            {done && !busy ? <Check className="h-4 w-4" strokeWidth={3} /> : <Send className="h-4 w-4" strokeWidth={2.4} />}
            <span data-testid={done && !busy ? "contact-success" : "contact-status"}>
              {busy ? t.contact.sending : done ? t.contact.ok : t.contact.send}
            </span>
          </button>
        </motion.form>
      </div>
    </section>
  );
};
