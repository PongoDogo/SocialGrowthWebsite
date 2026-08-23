import React, { useEffect, useState } from "react";
import * as Icons from "lucide-react";
import { toast } from "sonner";
import { api, mediaSrc } from "@/studio/api";
import { Panel, Row, TextInput, Grid } from "@/studio/fields";
import { fmtDate } from "@/studio/util";

/* ================================================================= Overview */
export const OverviewPanel = ({ onGo }) => {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.overview().then(setData).catch((e) => toast.error(e.message));
  }, []);

  const cards = [
    { k: "clients", label: "Μαγαζιά", icon: Icons.Store, go: "clients" },
    { k: "contacts", label: "Μηνύματα", icon: Icons.Inbox, go: "inbox" },
    { k: "media", label: "Εικόνες", icon: Icons.Image, go: "media" },
    { k: "revisions", label: "Εκδόσεις", icon: Icons.History, go: "history" },
  ];

  return (
    <div className="space-y-5">
      <Panel title="Σύνοψη" hint="Μια γρήγορη ματιά στο site σου.">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {cards.map((c) => (
            <button
              key={c.k}
              type="button"
              onClick={() => onGo(c.go)}
              className="rounded-xl border border-white/10 bg-white/[0.02] p-4 text-left transition-colors hover:border-[#60d6ff]/50"
            >
              <c.icon className="h-4 w-4 text-[#60d6ff]" />
              <p className="mt-3 font-display text-2xl font-extrabold tabular-nums">{data ? data[c.k] : "—"}</p>
              <p className="mt-0.5 text-[11.5px] text-white/40">{c.label}</p>
            </button>
          ))}
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-white/10 p-4">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.16em] text-white/40">Τελευταία δημοσίευση</p>
            <p className="mt-1.5 text-[13px] font-semibold text-white/80">{fmtDate(data?.published_at)}</p>
          </div>
          <div className="rounded-xl border border-white/10 p-4">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.16em] text-white/40">Τελευταία αλλαγή (draft)</p>
            <p className="mt-1.5 text-[13px] font-semibold text-white/80">{fmtDate(data?.draft_updated_at)}</p>
          </div>
        </div>
      </Panel>

      <Panel title="Πρόσφατη δραστηριότητα" hint="Καταγράφονται συνδέσεις και δημοσιεύσεις για ασφάλεια.">
        <div className="space-y-1.5">
          {(data?.audit || []).map((a) => (
            <div key={a.id} className="flex items-center justify-between gap-3 rounded-lg bg-white/[0.02] px-3 py-2">
              <span className="text-[12.5px] font-medium text-white/70">{a.action}</span>
              <span className="text-[11px] text-white/35">
                {a.ip} · {fmtDate(a.at)}
              </span>
            </div>
          ))}
          {!data?.audit?.length && <p className="py-4 text-center text-[12.5px] text-white/35">Καμία δραστηριότητα ακόμα</p>}
        </div>
      </Panel>
    </div>
  );
};

/* ================================================================= Inbox */
export const InboxPanel = () => {
  const [items, setItems] = useState(null);

  const load = () =>
    api
      .contacts()
      .then((r) => setItems(r.items || []))
      .catch((e) => toast.error(e.message));

  useEffect(() => {
    load();
  }, []);

  const del = async (id) => {
    if (!window.confirm("Να διαγραφεί το μήνυμα;")) return;
    try {
      await api.deleteContact(id);
      setItems((l) => l.filter((x) => x.id !== id));
      toast.success("Διαγράφηκε");
    } catch (e) {
      toast.error(e.message);
    }
  };

  return (
    <Panel
      title="Μηνύματα από τη φόρμα"
      hint="Ό,τι στέλνουν οι επισκέπτες αποθηκεύεται εδώ, ακόμα κι αν χαθεί το email."
      right={
        <button type="button" onClick={load} className="rounded-lg border border-white/15 px-3 py-1.5 text-[12px] font-semibold text-white/70 hover:border-white/35">
          Ανανέωση
        </button>
      }
    >
      <div className="space-y-2.5">
        {(items || []).map((m) => (
          <div key={m.id} className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-[13.5px] font-bold text-white/90">
                  {m.name} {m.business ? <span className="font-medium text-white/40">· {m.business}</span> : null}
                </p>
                <a href={`mailto:${m.email}`} className="text-[12px] text-[#60d6ff] hover:underline">
                  {m.email}
                </a>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span
                  title={m.email_delivered ? "Το email στάλθηκε" : "Το email δεν στάλθηκε"}
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    m.email_delivered ? "bg-emerald-500/15 text-emerald-300" : "bg-amber-500/15 text-amber-300"
                  }`}
                >
                  {m.email_delivered ? "στάλθηκε" : "μόνο αποθήκευση"}
                </span>
                <button type="button" onClick={() => del(m.id)} className="rounded-lg p-1.5 text-white/35 hover:bg-red-500/15 hover:text-red-300">
                  <Icons.Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            <p className="mt-2.5 whitespace-pre-wrap text-[13px] leading-relaxed text-white/60">{m.message}</p>
            <p className="mt-2 text-[11px] text-white/30">{fmtDate(m.created_at)}</p>
          </div>
        ))}
        {items && !items.length && <p className="py-8 text-center text-[13px] text-white/35">Κανένα μήνυμα ακόμα</p>}
        {!items && <p className="py-8 text-center text-[13px] text-white/35">Φόρτωση...</p>}
      </div>
    </Panel>
  );
};

/* ================================================================= Media */
export const MediaPanel = () => {
  const [items, setItems] = useState(null);

  const load = () =>
    api
      .media()
      .then((r) => setItems(r.items || []))
      .catch((e) => toast.error(e.message));

  useEffect(() => {
    load();
  }, []);

  const del = async (id) => {
    if (!window.confirm("Να διαγραφεί η εικόνα; Αν χρησιμοποιείται κάπου, θα εξαφανιστεί από το site.")) return;
    try {
      await api.deleteMedia(id);
      setItems((l) => l.filter((x) => x.id !== id));
    } catch (e) {
      toast.error(e.message);
    }
  };

  return (
    <Panel title="Βιβλιοθήκη εικόνων" hint="Όλα τα λογότυπα και οι εικόνες που έχεις ανεβάσει.">
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
        {(items || []).map((m) => (
          <div key={m.id} className="group relative">
            <div className="flex h-24 items-center justify-center rounded-xl border border-white/10 bg-black/40 p-2">
              <img src={mediaSrc(m.url)} alt="" className="max-h-20 max-w-full object-contain" />
            </div>
            <p className="mt-1.5 truncate text-[10.5px] text-white/35">{m.label}</p>
            <button
              type="button"
              onClick={() => del(m.id)}
              className="absolute -right-1.5 -top-1.5 hidden rounded-full bg-red-500 p-1 text-white group-hover:block"
            >
              <Icons.Trash2 className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>
      {items && !items.length && <p className="py-8 text-center text-[13px] text-white/35">Άδεια βιβλιοθήκη</p>}
    </Panel>
  );
};

/* ================================================================= History */
export const HistoryPanel = ({ onRestored }) => {
  const [items, setItems] = useState(null);

  const load = () =>
    api
      .revisions()
      .then((r) => setItems(r.items || []))
      .catch((e) => toast.error(e.message));

  useEffect(() => {
    load();
  }, []);

  const restore = async (id) => {
    if (!window.confirm("Να φορτωθεί αυτή η έκδοση στο draft; Οι τρέχουσες μη-δημοσιευμένες αλλαγές θα χαθούν.")) return;
    try {
      await api.restoreRevision(id);
      toast.success("Φορτώθηκε — δες το preview και δημοσίευσε");
      onRestored?.();
    } catch (e) {
      toast.error(e.message);
    }
  };

  return (
    <Panel title="Ιστορικό εκδόσεων" hint="Κάθε δημοσίευση κρατά αντίγραφο της προηγούμενης κατάστασης (τελευταίες 30).">
      <div className="space-y-2">
        {(items || []).map((r) => (
          <div key={r.id} className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3">
            <div>
              <p className="text-[13px] font-semibold text-white/80">{fmtDate(r.created_at)}</p>
              <p className="text-[11px] text-white/35">{r.note}</p>
            </div>
            <button
              type="button"
              onClick={() => restore(r.id)}
              className="rounded-lg border border-white/15 px-3 py-1.5 text-[12px] font-semibold text-white/75 hover:border-[#60d6ff]/60"
            >
              Επαναφορά
            </button>
          </div>
        ))}
        {items && !items.length && <p className="py-8 text-center text-[13px] text-white/35">Καμία έκδοση ακόμα</p>}
      </div>
    </Panel>
  );
};

/* ================================================================= Settings */
export const SettingsPanel = ({ onReset, onLogout }) => {
  const [cur, setCur] = useState("");
  const [next, setNext] = useState("");
  const [again, setAgain] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (next.length < 8) return toast.error("Ο νέος κωδικός θέλει τουλάχιστον 8 χαρακτήρες");
    if (next !== again) return toast.error("Οι δύο νέοι κωδικοί δεν ταιριάζουν");
    setBusy(true);
    try {
      await api.changePassword(cur, next);
      toast.success("Ο κωδικός άλλαξε");
      setCur("");
      setNext("");
      setAgain("");
    } catch (e2) {
      toast.error(e2.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-5">
      <Panel title="Αλλαγή κωδικού" hint="Ο κωδικός αποθηκεύεται κρυπτογραφημένος (bcrypt) — κανείς δεν μπορεί να τον διαβάσει.">
        <form onSubmit={submit} className="space-y-4">
          <Row label="Τρέχων κωδικός">
            <TextInput type="password" value={cur} onChange={setCur} autoComplete="current-password" />
          </Row>
          <Grid>
            <Row label="Νέος κωδικός">
              <TextInput type="password" value={next} onChange={setNext} autoComplete="new-password" />
            </Row>
            <Row label="Επανάληψη">
              <TextInput type="password" value={again} onChange={setAgain} autoComplete="new-password" />
            </Row>
          </Grid>
          <button type="submit" disabled={busy} className="rounded-xl bg-white px-4 py-2.5 text-[12.5px] font-bold text-black disabled:opacity-50">
            {busy ? "Αλλαγή..." : "Αλλαγή κωδικού"}
          </button>
        </form>
      </Panel>

      <Panel title="Επικίνδυνη ζώνη" hint="Επηρεάζει μόνο το draft — τίποτα δεν βγαίνει live μέχρι να πατήσεις Δημοσίευση.">
        <button
          type="button"
          onClick={onReset}
          className="w-full rounded-xl border border-amber-500/30 px-4 py-2.5 text-[12.5px] font-bold text-amber-300 hover:border-amber-500/60"
        >
          Επαναφορά όλου του περιεχομένου στα αρχικά
        </button>
        <button
          type="button"
          onClick={onLogout}
          className="w-full rounded-xl border border-white/15 px-4 py-2.5 text-[12.5px] font-bold text-white/70 hover:border-white/35"
        >
          Αποσύνδεση
        </button>
      </Panel>
    </div>
  );
};
