import React from "react";
import * as Icons from "lucide-react";
import { Bi, TextInput, NumberInput, ImagePicker, Row } from "@/studio/fields";
import { StyleEditor } from "@/studio/styleFields";
import { getIn } from "@/studio/util";

const TAB_FOR = {
  brand: "general",
  seo: "general",
  nav: "nav",
  hero: "hero",
  clients: "clients",
  stats: "stats",
  services: "services",
  process: "process",
  contact: "contact",
  footer: "footer",
  theme: "theme",
  blocks: "layout",
};

export const tabForPath = (path = "") => {
  const clean = String(path).replace(/^section:/, "");
  if (clean.startsWith("block:") || clean.startsWith("blocks.")) return "layout";
  return TAB_FOR[clean.split(".")[0]] || "overview";
};

const KIND_LABEL = {
  text: "Κείμενο",
  button: "Κουμπί",
  image: "Εικόνα",
  card: "Κάρτα",
  section: "Ενότητα",
  number: "Αριθμός",
  box: "Ομάδα στοιχείων",
};

const isItemPath = (p) => /\.items\.\d+$/.test(String(p || ""));

export const Inspector = ({ sel, draft, set, onSet, onReset, onCopyDevice, onClose, onGoTab, onScrollTo }) => {
  if (!sel?.path) return null;
  const { path, kind, label } = sel;
  const styles = draft.styles || {};
  const contentPath = path.replace(/^section:/, "");
  const value = path.startsWith("section:") ? undefined : getIn(draft, contentPath);
  const isSection = kind === "section" || path.startsWith("section:");

  const itemBase = isItemPath(contentPath) ? contentPath : null;
  const itemArrPath = itemBase ? itemBase.replace(/\.\d+$/, "") : null;
  const itemIndex = itemBase ? Number(itemBase.split(".").pop()) : -1;
  const itemArr = itemArrPath ? getIn(draft, itemArrPath) : null;
  const item = itemBase ? getIn(draft, itemBase) : null;

  const removeItem = () => {
    if (!Array.isArray(itemArr)) return;
    if (!window.confirm("Να διαγραφεί αυτό το στοιχείο από το site;")) return;
    set(itemArrPath, itemArr.filter((_, i) => i !== itemIndex));
    onClose();
  };

  const duplicateItem = () => {
    if (!Array.isArray(itemArr)) return;
    const copy = JSON.parse(JSON.stringify(itemArr[itemIndex] || {}));
    delete copy._i;
    if (copy.id) copy.id = `${copy.id}-copy${Math.random().toString(36).slice(2, 5)}`;
    set(itemArrPath, [...itemArr.slice(0, itemIndex + 1), copy, ...itemArr.slice(itemIndex + 1)]);
  };

  return (
    <section className="rounded-2xl border border-[#60d6ff]/35 bg-[#081016]" data-testid="inspector">
      <header className="flex items-start justify-between gap-3 border-b border-white/[0.07] px-5 py-3.5">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#60d6ff]">
            <Icons.MousePointerClick className="h-3.5 w-3.5" />
            {KIND_LABEL[kind] || "Στοιχείο"}
          </p>
          <h3 className="mt-1 truncate font-display text-[15px] font-bold tracking-tight text-white">{label || path}</h3>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <button type="button" title="Δείξε το στο preview" onClick={() => onScrollTo(path)} className="rounded-lg p-1.5 text-white/45 hover:bg-white/10 hover:text-white">
            <Icons.Crosshair className="h-4 w-4" />
          </button>
          <button type="button" data-testid="inspector-close" title="Κλείσε" onClick={onClose} className="rounded-lg p-1.5 text-white/45 hover:bg-white/10 hover:text-white">
            <Icons.X className="h-4 w-4" />
          </button>
        </div>
      </header>

      <div className="space-y-4 px-5 py-4">
        {!isSection && (kind === "text" || kind === "button") && (
          typeof value === "string" ? (
            <Row label="Κείμενο">
              <TextInput value={value} onChange={(v) => set(contentPath, v)} />
            </Row>
          ) : (
            <Bi label="Κείμενο" rows={String(value?.el || "").length > 70 ? 3 : undefined} value={value} onChange={(v) => set(contentPath, v)} />
          )
        )}

        {!isSection && kind === "image" && <ImagePicker label="Εικόνα" value={typeof value === "string" ? value : ""} onChange={(v) => set(contentPath, v)} />}

        {!isSection && kind === "number" && (
          <Row label="Αριθμός">
            <NumberInput value={value ?? 0} onChange={(v) => set(contentPath, v)} min={0} />
          </Row>
        )}

        {itemBase && item && (
          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] p-3">
            <button
              type="button"
              onClick={() => set(`${itemBase}.visible`, item.visible === false)}
              className="flex items-center gap-1.5 rounded-lg border border-white/12 px-2.5 py-1.5 text-[11.5px] font-semibold text-white/70 hover:border-white/30"
            >
              {item.visible === false ? <Icons.Eye className="h-3.5 w-3.5" /> : <Icons.EyeOff className="h-3.5 w-3.5" />}
              {item.visible === false ? "Εμφάνιση" : "Κρύψιμο"}
            </button>
            <button
              type="button"
              onClick={duplicateItem}
              className="flex items-center gap-1.5 rounded-lg border border-white/12 px-2.5 py-1.5 text-[11.5px] font-semibold text-white/70 hover:border-white/30"
            >
              <Icons.Copy className="h-3.5 w-3.5" /> Αντίγραφο
            </button>
            <button
              type="button"
              onClick={removeItem}
              className="flex items-center gap-1.5 rounded-lg border border-red-500/30 px-2.5 py-1.5 text-[11.5px] font-semibold text-red-300/80 hover:border-red-500/60"
            >
              <Icons.Trash2 className="h-3.5 w-3.5" /> Διαγραφή
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={() => onGoTab(tabForPath(path))}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/12 py-2.5 text-[12px] font-bold text-white/70 hover:border-[#60d6ff]/60 hover:text-white"
        >
          <Icons.SlidersHorizontal className="h-3.5 w-3.5" />
          Όλες οι ρυθμίσεις αυτής της ενότητας
        </button>

        <StyleEditor path={path} styles={styles} kind={kind} onSet={onSet} onReset={onReset} onCopyDevice={onCopyDevice} />
      </div>
    </section>
  );
};

export default Inspector;
