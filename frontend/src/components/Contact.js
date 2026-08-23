import React, { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Mail, Send, Check } from "lucide-react";
import { toast } from "sonner";
import { useLang } from "@/i18n";
import { useSite } from "@/content/ContentContext";
import { container, pad, headBox, cardStyle, primaryBtn, btnIcons } from "@/content/style";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Field = ({ label, testId, accent, ...rest }) => {
  const base =
    "w-full rounded-2xl bg-white/[0.03] px-5 py-4 text-sm text-white placeholder-white/20 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)] transition-shadow duration-300 focus:shadow-[inset_0_0_0_1px_rgba(96,214,255,0.6)]";
  return (
    <label className="block">
      <span className="mb-2.5 block text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">{label}</span>
      {rest.rows ? (
        <textarea data-testid={testId} {...rest} className={`${base} resize-none`} />
      ) : (
        <input data-testid={testId} {...rest} className={base} />
      )}
    </label>
  );
};

export const Contact = () => {
  const { lang } = useLang();
  const { c, L, preview } = useSite(lang);
  const ct = c.contact || {};
  const lb = ct.labels || {};
  const theme = c.theme || {};
  const accent = theme.accent || "#60d6ff";
  const email = c.brand?.email || "";
  const formLeft = ct.formSide === "left";
  const pb = primaryBtn(theme);

  const [form, setForm] = useState({ name: "", email: "", business: "", message: "" });
  const [busy, setBusy] = useState(false);
  const [state, setState] = useState(null);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (preview) {
      toast.info(lang === "el" ? "Preview \u2014 \u03c4\u03bf \u03bc\u03ae\u03bd\u03c5\u03bc\u03b1 \u03b4\u03b5\u03bd \u03c3\u03c4\u03ad\u03bb\u03bd\u03b5\u03c4\u03b1\u03b9" : "Preview mode \u2014 message not sent");
      return;
    }
    setBusy(true);
    try {
      await axios.post(`${API}/contact`, form);
      setState("ok");
      setForm({ name: "", email: "", business: "", message: "" });
      toast.success(L(lb.ok));
    } catch {
      setState("err");
      toast.error(L(lb.err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <section data-testid="contact" id="contact" className={`relative overflow-hidden ${pad(ct.padding)}`}>
      {theme.glows !== false && <div className="pointer-events-none absolute -right-24 top-10 h-[480px] w-[480px] glow-blue opacity-70" />}

      <div
        className={`relative mx-auto grid gap-10 px-6 sm:px-8 lg:gap-16 ${formLeft ? "lg:grid-cols-[1.1fr_0.9fr]" : "lg:grid-cols-[0.9fr_1.1fr]"}`}
        style={container(theme)}
      >
        <div className={`${formLeft ? "lg:order-2" : ""} ${headBox(ct.align)}`}>
          <p className="text-[10px] font-bold uppercase tracking-[0.26em] sm:text-[11px]" style={{ color: accent }}>{L(ct.overline)}</p>
          <h2 className="mt-4 font-display text-[26px] font-extrabold leading-[1.12] tracking-tight sm:text-4xl lg:text-5xl">{L(ct.title)}</h2>
          <p className="mt-4 text-[13.5px] leading-relaxed text-white/50 sm:mt-5 sm:text-base lg:text-lg">{L(ct.sub)}</p>

          {ct.showEmail !== false && email && (
            <a
              data-testid="contact-email-link"
              href={`mailto:${email}`}
              className="group mt-8 inline-flex max-w-full items-center gap-3 rounded-2xl bg-white/[0.03] px-5 py-4 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)] transition-shadow duration-300 hover:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.28)] sm:mt-10 sm:gap-3.5 sm:px-6"
            >
              <Mail className="h-5 w-5 shrink-0" strokeWidth={2} style={{ color: accent }} />
              <span className="truncate text-[13px] font-semibold text-white/80 group-hover:text-white sm:text-sm">{email}</span>
            </a>
          )}

          <ul className={`mt-8 space-y-3.5 sm:mt-10 ${ct.align === "center" ? "inline-block text-left" : ""}`}>
            {(Array.isArray(ct.points) ? ct.points : []).map((p, i) => (
              <li key={i} data-testid={`contact-point-${i}`} className="flex items-center gap-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: `${accent}1f` }}>
                  <Check className="h-3 w-3" strokeWidth={3} style={{ color: accent }} />
                </span>
                <span className="text-[13px] font-medium text-white/55 sm:text-sm">{L(p)}</span>
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
          className={`p-6 sm:p-9 ${formLeft ? "lg:order-1" : ""}`}
          style={cardStyle(theme)}
        >
          <div className="grid gap-4 sm:grid-cols-2 sm:gap-5">
            <Field label={L(lb.name)} testId="contact-name" value={form.name} onChange={set("name")} required placeholder="—" />
            <Field label={L(lb.email)} testId="contact-email" type="email" value={form.email} onChange={set("email")} required placeholder="—" />
          </div>
          <div className="mt-4 sm:mt-5">
            <Field label={L(lb.business)} testId="contact-business" value={form.business} onChange={set("business")} placeholder="—" />
          </div>
          <div className="mt-4 sm:mt-5">
            <Field label={L(lb.message)} testId="contact-message" rows={5} value={form.message} onChange={set("message")} required placeholder="—" />
          </div>

          {state === "err" && (
            <p data-testid="contact-error" className="mt-5 rounded-xl bg-red-500/10 px-4 py-3 text-[13px] font-medium text-red-300">
              {L(lb.err)}
            </p>
          )}

          <button data-testid="contact-submit" type="submit" disabled={busy} className={`mt-7 w-full sm:mt-8 ${pb.className} disabled:opacity-50`} style={pb.style}>
            {btnIcons(theme) && (state === "ok" && !busy ? <Check className="h-4 w-4" strokeWidth={3} /> : <Send className="h-4 w-4" strokeWidth={2.4} />)}
            {busy ? L(lb.sending) : state === "ok" ? L(lb.ok) : L(lb.send)}
          </button>
        </motion.form>
      </div>
    </section>
  );
};
