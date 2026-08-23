import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ArrowUpRight } from "lucide-react";
import { useLang } from "@/i18n";

const LINKS = [
  { id: "services", key: "services" },
  { id: "results", key: "results" },
  { id: "clients", key: "clients" },
  { id: "contact", key: "contact" },
];

export const Navbar = () => {
  const { lang, toggle, t } = useLang();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const go = (id) => {
    setOpen(false);
    setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" }), 380);
  };

  return (
    <header
      data-testid="navbar"
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-500 ${
        scrolled ? "bg-black/70 backdrop-blur-xl border-b border-white/10" : "bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-[1240px] px-6 sm:px-8">
        <div className="flex h-[74px] items-center justify-between gap-6">
          <button
            data-testid="brand-logo"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="group flex items-center gap-3"
          >
            <span className="relative flex h-10 w-10 items-center justify-center">
              <span className="absolute inset-0 rounded-xl bg-blue-500/20 blur-lg transition-opacity duration-500 group-hover:opacity-100 opacity-60" />
              <img src="/logo.png" alt="SocialGrowth" className="relative h-10 w-10 object-contain" />
            </span>
            <span className="font-display text-[19px] font-extrabold leading-none tracking-tight">
              Social<span className="text-[#60d6ff]">Growth</span>
            </span>
          </button>

          <nav className="hidden items-center gap-1 lg:flex">
            {LINKS.map((l) => (
              <button
                key={l.id}
                data-testid={`nav-${l.id}`}
                onClick={() => go(l.id)}
                className="rounded-full px-4 py-2 text-sm font-medium text-white/60 transition-colors duration-300 hover:bg-white/5 hover:text-white"
              >
                {t.nav[l.key]}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              data-testid="lang-switcher"
              onClick={toggle}
              className="flex items-center rounded-full border border-white/12 bg-white/[0.04] p-[3px] text-[11px] font-bold tracking-wider"
            >
              <span className={`rounded-full px-2.5 py-1 transition-colors ${lang === "el" ? "bg-white text-black" : "text-white/50"}`}>EL</span>
              <span className={`rounded-full px-2.5 py-1 transition-colors ${lang === "en" ? "bg-white text-black" : "text-white/50"}`}>EN</span>
            </button>

            <button
              data-testid="nav-cta"
              onClick={() => go("contact")}
              className="hidden items-center gap-1.5 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-black transition-transform duration-300 hover:-translate-y-0.5 lg:flex"
            >
              {t.nav.cta}
              <ArrowUpRight className="h-4 w-4" strokeWidth={2.4} />
            </button>

            <button
              data-testid="mobile-menu-toggle"
              onClick={() => setOpen((o) => !o)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/12 lg:hidden"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            data-testid="mobile-menu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-b border-white/10 bg-black/90 backdrop-blur-xl lg:hidden"
          >
            <div className="flex flex-col gap-1 px-5 py-5">
              {LINKS.map((l) => (
                <button
                  key={l.id}
                  data-testid={`mobile-nav-${l.id}`}
                  onClick={() => go(l.id)}
                  className="rounded-xl px-4 py-3 text-left text-base font-semibold text-white/75 transition-colors hover:bg-white/5 hover:text-white"
                >
                  {t.nav[l.key]}
                </button>
              ))}
              <button
                data-testid="mobile-nav-cta"
                onClick={() => go("contact")}
                className="mt-2 flex items-center justify-center gap-1.5 rounded-full bg-white px-5 py-3.5 text-sm font-bold text-black"
              >
                {t.nav.cta}
                <ArrowUpRight className="h-4 w-4" strokeWidth={2.4} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
