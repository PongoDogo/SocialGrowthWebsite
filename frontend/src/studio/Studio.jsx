import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as Icons from "lucide-react";
import { toast } from "sonner";
import { api, getToken, setToken, clearToken } from "@/studio/api";
import { setIn } from "@/studio/util";
import { EditLangContext } from "@/studio/fields";
import { Inspector } from "@/studio/Inspector";
import {
  GeneralEditor,
  ThemeEditor,
  NavEditor,
  HeroEditor,
  StatsEditor,
  ServicesEditor,
  ClientsEditor,
  ProcessEditor,
  ContactEditor,
  FooterEditor,
  LayoutEditor,
  TemplatesEditor,
  DesignEditor,
} from "@/studio/Editors";
import { OverviewPanel, InboxPanel, MediaPanel, HistoryPanel, SettingsPanel } from "@/studio/Panels";

const NAV = [
  { id: "overview", label: "Σύνοψη", icon: "LayoutDashboard", group: "start" },
  { id: "layout", label: "Ενότητες & blocks", icon: "Layers", group: "start" },
  { id: "general", label: "Ταυτότητα & SEO", icon: "Building2", group: "content" },
  { id: "nav", label: "Μενού πλοήγησης", icon: "Menu", group: "content" },
  { id: "hero", label: "Αρχή (Hero)", icon: "Sparkles", group: "content" },
  { id: "clients", label: "Μαγαζιά & λογότυπα", icon: "Store", group: "content" },
  { id: "stats", label: "Νούμερα", icon: "TrendingUp", group: "content" },
  { id: "services", label: "Υπηρεσίες", icon: "LayoutGrid", group: "content" },
  { id: "process", label: "Πώς δουλεύουμε", icon: "ListOrdered", group: "content" },
  { id: "contact", label: "Επικοινωνία", icon: "Mail", group: "content" },
  { id: "footer", label: "Footer", icon: "PanelBottom", group: "content" },
  { id: "templates", label: "Έτοιμα looks", icon: "Wand2", group: "design" },
  { id: "theme", label: "Χρώματα & φόντο", icon: "Palette", group: "design" },
  { id: "design", label: "Γραμματοσειρές & κουμπιά", icon: "Type", group: "design" },
  { id: "inbox", label: "Μηνύματα", icon: "Inbox", group: "manage" },
  { id: "media", label: "Εικόνες", icon: "Image", group: "manage" },
  { id: "history", label: "Ιστορικό", icon: "History", group: "manage" },
  { id: "settings", label: "Ρυθμίσεις", icon: "Settings", group: "manage" },
];

const GROUPS = [
  { id: "start", label: "" },
  { id: "content", label: "Περιεχόμενο" },
  { id: "design", label: "Εμφάνιση" },
  { id: "manage", label: "Διαχείριση" },
];

const DEVICES = {
  desktop: { w: "100%", label: "Desktop", icon: "Monitor" },
  tablet: { w: "820px", label: "Tablet", icon: "Tablet" },
  mobile: { w: "390px", label: "Κινητό", icon: "Smartphone" },
};

/* preview device  <->  the key styles are stored under (d / t / m) */
const DEV_KEY = { desktop: "d", tablet: "t", mobile: "m" };
const DEV_OF = { d: "desktop", t: "tablet", m: "mobile" };

/* ================================================================= Login */
const Login = ({ onDone }) => {
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErr("");
    try {
      const r = await api.login(pw, true);
      setToken(r.token);
      onDone();
    } catch (e2) {
      setErr(e2.message || "Λάθος κωδικός");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#050506] px-5">
      <form onSubmit={submit} className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#0a0a0e] p-7">
        <div className="mb-6 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#60d6ff]/12">
            <Icons.Lock className="h-4.5 w-4.5 text-[#60d6ff]" />
          </span>
          <div>
            <p className="font-display text-[17px] font-extrabold leading-none tracking-tight">SocialGrowth Studio</p>
            <p className="mt-1 text-[11.5px] text-white/40">Ιδιωτική περιοχή διαχείρισης</p>
          </div>
        </div>

        <label className="mb-2 block text-[10.5px] font-bold uppercase tracking-[0.16em] text-white/45">Κωδικός</label>
        <input
          type="password"
          autoFocus
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          data-testid="studio-password"
          className="w-full rounded-xl border border-white/12 bg-white/[0.03] px-4 py-3 text-[14px] text-white outline-none transition-colors focus:border-[#60d6ff]/70"
        />

        {err && (
          <p data-testid="studio-login-error" className="mt-3 rounded-lg bg-red-500/10 px-3 py-2 text-[12.5px] font-medium text-red-300">
            {err}
          </p>
        )}

        <button
          type="submit"
          disabled={busy || !pw}
          data-testid="studio-login-submit"
          className="mt-5 w-full rounded-xl bg-white py-3 text-[13px] font-bold text-black transition-opacity disabled:opacity-40"
        >
          {busy ? "Έλεγχος..." : "Σύνδεση"}
        </button>

        <p className="mt-5 text-center text-[11px] leading-relaxed text-white/25">
          Μετά από 5 λάθος προσπάθειες η πρόσβαση κλειδώνει για 15 λεπτά.
        </p>
      </form>
    </div>
  );
};

/* ================================================================= Preview */
const Preview = ({ draft, lang, device, editMode, selected, onSelect, onMove, scrollTo }) => {
  const ref = useRef(null);
  const state = useRef({});
  state.current = { draft, lang, device, editMode, selected };

  const post = useCallback((msg) => {
    try {
      ref.current?.contentWindow?.postMessage(msg, "*");
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    const onMsg = (e) => {
      const m = e?.data;
      if (!m || typeof m !== "object") return;
      if (m.type === "sg-preview-ready") {
        const s = state.current;
        post({ type: "sg-preview-content", content: s.draft });
        post({ type: "sg-preview-lang", lang: s.lang });
        post({ type: "sg-edit-mode", edit: s.editMode });
        post({ type: "sg-device", device: s.device });
        post({ type: "sg-selected", path: s.selected });
      }
      if (m.type === "sg-select") onSelect({ path: m.path, kind: m.kind, label: m.label });
      if (m.type === "sg-move") onMove(m);
    };
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, [post, onSelect, onMove]);

  useEffect(() => {
    const t = setTimeout(() => post({ type: "sg-preview-content", content: draft }), 130);
    return () => clearTimeout(t);
  }, [draft, post]);

  useEffect(() => post({ type: "sg-preview-lang", lang }), [lang, post]);
  useEffect(() => post({ type: "sg-edit-mode", edit: editMode }), [editMode, post]);
  useEffect(() => post({ type: "sg-device", device }), [device, post]);
  useEffect(() => post({ type: "sg-selected", path: selected }), [selected, post]);
  useEffect(() => {
    if (scrollTo?.path) post({ type: "sg-scroll-to", path: scrollTo.path });
  }, [scrollTo, post]);

  return (
    <div className="flex h-full w-full items-start justify-center overflow-hidden bg-[#08080a] p-4">
      <div
        className="h-full overflow-hidden rounded-2xl border border-white/10 bg-black shadow-2xl transition-all duration-300"
        style={{ width: DEVICES[device].w, maxWidth: "100%" }}
      >
        <iframe
          ref={ref}
          title="preview"
          data-testid="studio-preview"
          src={`${window.location.origin}/?__sgpreview=1`}
          className="h-full w-full border-0"
        />
      </div>
    </div>
  );
};

const NavIcon = ({ name }) => {
  const I = Icons[name] || Icons.Circle;
  return <I className="h-4 w-4" />;
};

/* ================================================================= Shell */
const Shell = ({ onLogout }) => {
  const [draft, setDraft] = useState(null);
  const [tab, setTab] = useState("overview");
  const [editLang, setEditLang] = useState("el");
  const [previewLang, setPreviewLang] = useState("el");
  const [device, setDevice] = useState("desktop");
  const [saving, setSaving] = useState("idle"); // idle | saving | saved
  const [dirty, setDirty] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [editMode, setEditMode] = useState(true);
  const [sel, setSel] = useState(null);
  const [snapshot, setSnapshot] = useState(null);
  const [scrollTo, setScrollTo] = useState(null);
  const skipSave = useRef(true);

  const load = useCallback(async () => {
    try {
      const r = await api.content("draft");
      skipSave.current = true;
      setDraft(r.data);
      setDirty(!!r.dirty);
    } catch (e) {
      if (e.status === 401) return onLogout();
      toast.error(e.message);
    }
  }, [onLogout]);

  useEffect(() => {
    load();
  }, [load]);

  // autosave the draft
  useEffect(() => {
    if (!draft) return undefined;
    if (skipSave.current) {
      skipSave.current = false;
      return undefined;
    }
    setSaving("saving");
    const t = setTimeout(async () => {
      try {
        await api.saveDraft(draft);
        setSaving("saved");
        setDirty(true);
      } catch (e) {
        setSaving("idle");
        if (e.status === 401) return onLogout();
        toast.error(`Η αποθήκευση απέτυχε: ${e.message}`);
      }
    }, 900);
    return () => clearTimeout(t);
  }, [draft, onLogout]);

  const set = useCallback((path, value) => {
    setDraft((d) => setIn(d, path, value));
  }, []);

  const setStyle = useCallback((path, dev, key, value) => {
    const keys = Array.isArray(key) ? key : [key];
    setDraft((d) => setIn(d, ["styles", path, dev, ...keys], value));
  }, []);

  const resetStyle = useCallback((path) => {
    setDraft((d) => {
      const next = { ...(d.styles || {}) };
      delete next[path];
      return { ...d, styles: next };
    });
  }, []);

  const copyDevice = useCallback((path, from = "d", to = "m") => {
    setDraft((d) => {
      const src = (d.styles || {})[path]?.[from] || {};
      return setIn(d, ["styles", path, to], JSON.parse(JSON.stringify(src)));
    });
    toast.success(`Αντιγράφηκε στο ${DEVICES[DEV_OF[to]]?.label || to}`);
  }, []);

  const onMove = useCallback(({ path, device: dev, x, y }) => {
    setDraft((d) => setIn(setIn(d, ["styles", path, dev, "x"], x), ["styles", path, dev, "y"], y));
  }, []);

  const onSelect = useCallback((s) => {
    setSel(s);
    setScrollTo(null);
  }, []);

  const applyTemplate = useCallback(
    (tpl) => {
      setSnapshot(draft);
      setDraft((d) => Object.entries(tpl.patch).reduce((acc, [k, v]) => setIn(acc, k, v), d));
      toast.success(`Εφαρμόστηκε: ${tpl.name}`);
    },
    [draft]
  );

  const undoTemplate = useCallback(() => {
    if (!snapshot) return;
    setDraft(snapshot);
    setSnapshot(null);
    toast.success("Η εμφάνιση επανήλθε");
  }, [snapshot]);

  const publish = async () => {
    setPublishing(true);
    try {
      await api.saveDraft(draft);
      await api.publish();
      setDirty(false);
      toast.success("Δημοσιεύτηκε — είναι live στο site");
    } catch (e) {
      toast.error(e.message);
    } finally {
      setPublishing(false);
    }
  };

  const discard = async () => {
    if (!window.confirm("Να ακυρωθούν όλες οι μη-δημοσιευμένες αλλαγές;")) return;
    try {
      await api.discard();
      await load();
      toast.success("Οι αλλαγές ακυρώθηκαν");
    } catch (e) {
      toast.error(e.message);
    }
  };

  const resetAll = async () => {
    if (!window.confirm("Να επανέλθει ΟΛΟ το περιεχόμενο στα αρχικά κείμενα και μαγαζιά;")) return;
    try {
      await api.reset();
      await load();
      toast.success("Έγινε επαναφορά στα αρχικά (draft)");
    } catch (e) {
      toast.error(e.message);
    }
  };

  // Cmd/Ctrl + S, Esc
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        if (draft) api.saveDraft(draft).then(() => setSaving("saved")).catch(() => {});
      }
      if (e.key === "Escape") setSel(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [draft]);

  const body = useMemo(() => {
    if (!draft) return null;
    const p = { d: draft, set };
    switch (tab) {
      case "overview":
        return <OverviewPanel onGo={setTab} />;
      case "general":
        return <GeneralEditor {...p} />;
      case "nav":
        return <NavEditor {...p} />;
      case "hero":
        return <HeroEditor {...p} />;
      case "clients":
        return <ClientsEditor {...p} />;
      case "stats":
        return <StatsEditor {...p} />;
      case "services":
        return <ServicesEditor {...p} />;
      case "process":
        return <ProcessEditor {...p} />;
      case "contact":
        return <ContactEditor {...p} />;
      case "footer":
        return <FooterEditor {...p} />;
      case "layout":
        return <LayoutEditor {...p} />;
      case "templates":
        return (
          <TemplatesEditor
            d={draft}
            onApply={applyTemplate}
            onUndo={undoTemplate}
            canUndo={!!snapshot}
            onResetStyle={resetStyle}
            onClearStyles={() => setDraft((x) => ({ ...x, styles: {} }))}
          />
        );
      case "theme":
        return <ThemeEditor {...p} />;
      case "design":
        return <DesignEditor {...p} />;
      case "inbox":
        return <InboxPanel />;
      case "media":
        return <MediaPanel />;
      case "history":
        return <HistoryPanel onRestored={load} />;
      case "settings":
        return <SettingsPanel onReset={resetAll} onLogout={onLogout} />;
      default:
        return null;
    }
  }, [tab, draft, set, load, onLogout, resetAll, applyTemplate, undoTemplate, snapshot, resetStyle]);

  if (!draft) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050506] text-white/50">
        <Icons.Loader2 className="mr-2 h-5 w-5 animate-spin" /> Φόρτωση Studio...
      </div>
    );
  }

  return (
    <EditLangContext.Provider value={{ editLang, setEditLang }}>
      <div className="min-h-screen bg-[#050506] text-white" data-testid="studio-root">
        {/* top bar */}
        <header className="sticky top-0 z-40 border-b border-white/10 bg-[#08080b]/95 backdrop-blur-xl">
          <div className="flex h-14 items-center gap-3 px-4">
            <span className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#60d6ff]/12">
                <Icons.Wand2 className="h-3.5 w-3.5 text-[#60d6ff]" />
              </span>
              <span className="hidden font-display text-[14px] font-extrabold tracking-tight sm:block">Studio</span>
            </span>

            <span
              data-testid="studio-save-state"
              className={`ml-1 hidden rounded-full px-2.5 py-1 text-[10.5px] font-bold sm:block ${
                saving === "saving"
                  ? "bg-white/10 text-white/60"
                  : dirty
                  ? "bg-amber-500/15 text-amber-300"
                  : "bg-emerald-500/15 text-emerald-300"
              }`}
            >
              {saving === "saving" ? "Αποθήκευση..." : dirty ? "Μη δημοσιευμένες αλλαγές" : "Όλα δημοσιευμένα"}
            </span>

            <div className="ml-auto flex items-center gap-2">
              {/* click-to-edit mode */}
              <div className="hidden items-center rounded-full border border-white/12 p-[3px] text-[10.5px] font-bold lg:flex">
                {[
                  { k: true, label: "Επιλογή", icon: "MousePointerClick", tip: "Πάτα στοιχεία στο preview για να τα αλλάξεις" },
                  { k: false, label: "Περιήγηση", icon: "Hand", tip: "Κάνε κλικ κανονικά μέσα στο site" },
                ].map((m) => {
                  const I = Icons[m.icon];
                  return (
                    <button
                      key={String(m.k)}
                      type="button"
                      title={m.tip}
                      data-testid={`studio-mode-${m.k ? "edit" : "browse"}`}
                      onClick={() => setEditMode(m.k)}
                      className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 transition-colors ${editMode === m.k ? "bg-white text-black" : "text-white/50"}`}
                    >
                      <I className="h-3 w-3" />
                      {m.label}
                    </button>
                  );
                })}
              </div>

              {/* editing language */}
              <div className="flex items-center rounded-full border border-white/12 p-[3px] text-[10.5px] font-bold">
                {["el", "en", "both"].map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => {
                      setEditLang(l);
                      if (l !== "both") setPreviewLang(l);
                    }}
                    className={`rounded-full px-2.5 py-1 transition-colors ${editLang === l ? "bg-white text-black" : "text-white/50"}`}
                  >
                    {l === "both" ? "EL+EN" : l.toUpperCase()}
                  </button>
                ))}
              </div>

              {/* device */}
              <div className="hidden items-center rounded-full border border-white/12 p-[3px] lg:flex">
                {Object.entries(DEVICES).map(([k, v]) => {
                  const I = Icons[v.icon];
                  return (
                    <button
                      key={k}
                      type="button"
                      title={v.label}
                      data-testid={`studio-device-${k}`}
                      onClick={() => setDevice(k)}
                      className={`rounded-full px-2.5 py-1.5 transition-colors ${device === k ? "bg-white text-black" : "text-white/45"}`}
                    >
                      <I className="h-3.5 w-3.5" />
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => setShowPreview((s) => !s)}
                className="hidden rounded-full border border-white/12 px-3 py-1.5 text-[11.5px] font-semibold text-white/60 hover:border-white/30 lg:block"
              >
                {showPreview ? "Κρύψε preview" : "Δείξε preview"}
              </button>

              <button
                type="button"
                onClick={publish}
                disabled={publishing}
                data-testid="studio-publish"
                className="flex items-center gap-1.5 rounded-full bg-[#60d6ff] px-4 py-2 text-[12.5px] font-extrabold text-black transition-transform hover:-translate-y-0.5 disabled:opacity-50"
              >
                <Icons.Rocket className="h-3.5 w-3.5" />
                {publishing ? "..." : "Δημοσίευση"}
              </button>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setMenuOpen((o) => !o)}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-white/12 text-white/60 hover:border-white/30"
                >
                  <Icons.MoreVertical className="h-4 w-4" />
                </button>
                {menuOpen && (
                  <div className="absolute right-0 top-10 w-56 overflow-hidden rounded-xl border border-white/12 bg-[#0b0b10] py-1.5 shadow-2xl">
                    {[
                      { label: "Άνοιγμα site σε νέα καρτέλα", icon: "ExternalLink", fn: () => window.open("/", "_blank") },
                      { label: "Ακύρωση αλλαγών (draft)", icon: "Undo2", fn: discard },
                      { label: "Αποσύνδεση", icon: "LogOut", fn: onLogout },
                    ].map((m) => {
                      const I = Icons[m.icon];
                      return (
                        <button
                          key={m.label}
                          type="button"
                          onClick={() => {
                            setMenuOpen(false);
                            m.fn();
                          }}
                          className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-[12.5px] font-medium text-white/70 hover:bg-white/5 hover:text-white"
                        >
                          <I className="h-3.5 w-3.5" />
                          {m.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <div className="flex">
          {/* sidebar */}
          <aside
            className="hidden w-[228px] shrink-0 border-r border-white/[0.07] px-3 py-4 md:block"
            style={{ height: "calc(100vh - 56px)", overflowY: "auto", position: "sticky", top: 56 }}
          >
            {GROUPS.map((g) => (
              <div key={g.id} className="mb-4">
                {g.label && <p className="mb-1.5 px-3 text-[9.5px] font-extrabold uppercase tracking-[0.18em] text-white/25">{g.label}</p>}
                <div className="space-y-0.5">
                  {NAV.filter((n) => n.group === g.id).map((n) => (
                    <button
                      key={n.id}
                      type="button"
                      data-testid={`studio-nav-${n.id}`}
                      onClick={() => setTab(n.id)}
                      className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[12.5px] font-semibold transition-colors ${
                        tab === n.id ? "bg-white/[0.08] text-white" : "text-white/50 hover:bg-white/[0.04] hover:text-white/80"
                      }`}
                    >
                      <NavIcon name={n.icon} />
                      {n.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </aside>

          {/* editor column */}
          <main className="min-w-0 flex-1 md:flex">
            <div className="w-full shrink-0 space-y-5 px-4 py-5 md:max-w-[560px] md:px-5" style={{ minWidth: 0 }}>
              {/* mobile tabs */}
              <div className="mb-4 flex gap-1.5 overflow-x-auto pb-1 md:hidden">
                {NAV.map((n) => (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => setTab(n.id)}
                    className={`shrink-0 rounded-full px-3 py-1.5 text-[11.5px] font-bold ${
                      tab === n.id ? "bg-white text-black" : "border border-white/12 text-white/55"
                    }`}
                  >
                    {n.label}
                  </button>
                ))}
              </div>

              {sel ? (
                <Inspector
                  sel={sel}
                  draft={draft}
                  set={set}
                  onSet={setStyle}
                  onReset={resetStyle}
                  onCopyDevice={copyDevice}
                  deviceKey={DEV_KEY[device] || "d"}
                  onClose={() => setSel(null)}
                  onGoTab={(t) => setTab(t)}
                  onScrollTo={(path) => setScrollTo({ path, at: Date.now() })}
                />
              ) : (
                editMode && (
                  <div className="flex items-start gap-2.5 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 text-[12px] leading-relaxed text-white/45">
                    <Icons.MousePointerClick className="mt-0.5 h-4 w-4 shrink-0 text-[#60d6ff]" />
                    Πάτα οποιοδήποτε κείμενο, κουμπί, κάρτα ή εικόνα μέσα στο preview για να το αλλάξεις — ή σύρε το για να το μετακινήσεις.
                  </div>
                )
              )}

              {body}
              <div className="h-16" />
            </div>

            {showPreview && (
              <div className="hidden flex-1 border-l border-white/[0.07] lg:block" style={{ height: "calc(100vh - 56px)", position: "sticky", top: 56 }}>
                <Preview
                  draft={draft}
                  lang={editLang === "both" ? previewLang : editLang}
                  device={device}
                  editMode={editMode}
                  selected={sel?.path || null}
                  onSelect={onSelect}
                  onMove={onMove}
                  scrollTo={scrollTo}
                />
              </div>
            )}
          </main>
        </div>
      </div>
    </EditLangContext.Provider>
  );
};

/* ================================================================= Root */
export default function Studio() {
  const [state, setState] = useState("checking"); // checking | login | ready

  useEffect(() => {
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex, nofollow, noarchive";
    document.head.appendChild(meta);
    document.title = "Studio";
    return () => {
      try {
        document.head.removeChild(meta);
      } catch {
        /* ignore */
      }
    };
  }, []);

  const check = useCallback(async () => {
    if (!getToken()) return setState("login");
    try {
      await api.session();
      setState("ready");
    } catch {
      clearToken();
      setState("login");
    }
  }, []);

  useEffect(() => {
    check();
  }, [check]);

  const logout = useCallback(() => {
    clearToken();
    setState("login");
  }, []);

  if (state === "checking") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050506] text-white/40">
        <Icons.Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }
  if (state === "login") return <Login onDone={() => setState("ready")} />;
  return <Shell onLogout={logout} />;
}
