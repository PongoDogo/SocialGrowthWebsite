import React, { useState } from "react";
import * as Icons from "lucide-react";
import { Row, Grid, Select, Slider, ColorInput, NumberInput, Toggle } from "@/studio/fields";
import { FONTS } from "@/content/style";

const DEVICES = [
  { k: "d", label: "Desktop", icon: "Monitor" },
  { k: "m", label: "Κινητό", icon: "Smartphone" },
];

const WEIGHTS = [
  { value: "", label: "Αυτόματο" },
  { value: "300", label: "300 — λεπτό" },
  { value: "400", label: "400 — κανονικό" },
  { value: "500", label: "500 — μέτριο" },
  { value: "600", label: "600 — ημι-έντονο" },
  { value: "700", label: "700 — έντονο" },
  { value: "800", label: "800 — πολύ έντονο" },
];

const ALIGNS = [
  { value: "", label: "Αυτόματο" },
  { value: "left", label: "Αριστερά" },
  { value: "center", label: "Κέντρο" },
  { value: "right", label: "Δεξιά" },
];

const TRANSFORMS = [
  { value: "", label: "Αυτόματο" },
  { value: "none", label: "Κανονικά" },
  { value: "uppercase", label: "ΚΕΦΑΛΑΙΑ" },
  { value: "lowercase", label: "πεζά" },
  { value: "capitalize", label: "Αρχικά Κεφαλαία" },
];

const SHADOWS = [
  { value: "", label: "Αυτόματη" },
  { value: "none", label: "Καμία" },
  { value: "soft", label: "Απαλή" },
  { value: "strong", label: "Δυνατή" },
];

/** Numeric field that can be "auto" (unset). */
const OptNum = ({ label, hint, value, onChange, min, max, step = 1, suffix = "", preset = 0 }) => {
  const on = value !== undefined && value !== null && value !== "";
  return (
    <Row label={label} hint={hint}>
      {on ? (
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <Slider value={Number(value)} onChange={onChange} min={min} max={max} step={step} suffix={suffix} />
          </div>
          <button type="button" title="Αυτόματο" onClick={() => onChange(undefined)} className="shrink-0 rounded-lg border border-white/12 p-1.5 text-white/40 hover:text-white">
            <Icons.RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => onChange(preset)}
          className="w-full rounded-xl border border-dashed border-white/15 py-2 text-[12px] font-semibold text-white/40 hover:border-[#60d6ff]/50 hover:text-white/80"
        >
          Αυτόματο — πάτα για ρύθμιση
        </button>
      )}
    </Row>
  );
};

const Group = ({ title, icon, children, open: initial = false }) => {
  const [open, setOpen] = useState(initial);
  const I = Icons[icon] || Icons.Settings2;
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02]">
      <button type="button" onClick={() => setOpen((o) => !o)} className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left">
        <I className="h-3.5 w-3.5 text-[#60d6ff]" />
        <span className="flex-1 text-[12.5px] font-bold text-white/80">{title}</span>
        <Icons.ChevronDown className={`h-4 w-4 text-white/35 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="space-y-4 border-t border-white/[0.07] px-3.5 py-4">{children}</div>}
    </div>
  );
};

export const StyleEditor = ({ path, styles, kind = "box", onSet, onReset, onCopyDevice }) => {
  const [dev, setDev] = useState("d");
  const s = (styles?.[path] && styles[path][dev]) || {};
  const set = (k) => (v) => onSet(path, dev, k, v);
  const textish = ["text", "button", "number"].includes(kind);
  const fontOptions = [{ value: "", label: "Αυτόματη" }, ...FONTS.map((f) => ({ value: f.name, label: f.name }))];
  const touched = Object.keys((styles?.[path]?.d) || {}).length + Object.keys((styles?.[path]?.m) || {}).length;

  return (
    <div className="space-y-3" data-testid="style-editor">
      <div className="flex items-center gap-2">
        <div className="flex items-center rounded-full border border-white/12 p-[3px] text-[11px] font-bold">
          {DEVICES.map((d) => {
            const I = Icons[d.icon];
            return (
              <button
                key={d.k}
                type="button"
                data-testid={`style-device-${d.k}`}
                onClick={() => setDev(d.k)}
                className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 transition-colors ${dev === d.k ? "bg-white text-black" : "text-white/50"}`}
              >
                <I className="h-3 w-3" />
                {d.label}
              </button>
            );
          })}
        </div>
        {dev === "m" && (
          <button type="button" onClick={() => onCopyDevice(path)} className="rounded-full border border-white/12 px-2.5 py-1 text-[11px] font-semibold text-white/55 hover:border-white/30">
            Αντιγραφή από desktop
          </button>
        )}
        {touched > 0 && (
          <button
            type="button"
            data-testid="style-reset"
            onClick={() => onReset(path)}
            className="ml-auto rounded-full border border-red-500/30 px-2.5 py-1 text-[11px] font-semibold text-red-300/80 hover:border-red-500/60"
          >
            Καθάρισε στυλ
          </button>
        )}
      </div>

      <Group title="Θέση & μέγεθος" icon="Move" open>
        <p className="text-[11px] leading-relaxed text-white/35">Μπορείς και να σύρεις το στοιχείο με το ποντίκι μέσα στο preview.</p>
        <Grid>
          <Row label="Οριζόντια (X)">
            <Slider value={Number(s.x) || 0} onChange={set("x")} min={-400} max={400} suffix="px" />
          </Row>
          <Row label="Κάθετα (Y)">
            <Slider value={Number(s.y) || 0} onChange={set("y")} min={-400} max={400} suffix="px" />
          </Row>
        </Grid>
        <Grid>
          <Row label="Περιστροφή">
            <Slider value={Number(s.rotate) || 0} onChange={set("rotate")} min={-45} max={45} suffix="°" />
          </Row>
          <Row label="Μεγέθυνση">
            <Slider value={Number(s.scale) || 100} onChange={set("scale")} min={40} max={200} suffix="%" />
          </Row>
        </Grid>
        <OptNum label="Μέγιστο πλάτος" value={s.maxWidth} onChange={set("maxWidth")} min={80} max={1400} step={10} suffix="px" preset={600} />
        <Toggle value={!!s.hidden} onChange={set("hidden")} label="Κρύψε το στοιχείο" hint="Εξαφανίζεται μόνο σε αυτή τη συσκευή" />
      </Group>

      {textish && (
        <Group title="Τυπογραφία" icon="Type" open>
          <OptNum label="Μέγεθος γραμμάτων" value={s.fontSize} onChange={set("fontSize")} min={8} max={140} suffix="px" preset={28} />
          <Grid>
            <Row label="Βάρος">
              <Select value={s.fontWeight ? String(s.fontWeight) : ""} onChange={(v) => set("fontWeight")(v ? Number(v) : undefined)} options={WEIGHTS} />
            </Row>
            <Row label="Στοίχιση">
              <Select value={s.textAlign || ""} onChange={(v) => set("textAlign")(v || undefined)} options={ALIGNS} />
            </Row>
          </Grid>
          <Grid>
            <OptNum label="Απόσταση γραμμάτων" value={s.letterSpacing} onChange={set("letterSpacing")} min={-4} max={16} step={0.5} suffix="px" preset={0} />
            <OptNum label="Ύψος γραμμής" value={s.lineHeight} onChange={set("lineHeight")} min={0.8} max={2.4} step={0.05} preset={1.2} />
          </Grid>
          <Grid>
            <Row label="Πεζά / κεφαλαία">
              <Select value={s.textTransform || ""} onChange={(v) => set("textTransform")(v || undefined)} options={TRANSFORMS} />
            </Row>
            <Row label="Γραμματοσειρά">
              <Select value={s.font || ""} onChange={(v) => set("font")(v || undefined)} options={fontOptions} />
            </Row>
          </Grid>
        </Group>
      )}

      <Group title="Χρώματα" icon="Palette">
        <Row label="Χρώμα κειμένου" hint="Άφησέ το κενό για το χρώμα του θέματος.">
          <ColorInput value={s.color || ""} onChange={(v) => set("color")(v || undefined)} />
        </Row>
        <Row label="Χρώμα φόντου">
          <ColorInput value={s.bg || ""} onChange={(v) => set("bg")(v || undefined)} />
        </Row>
        <OptNum label="Διαφάνεια" value={s.opacity} onChange={set("opacity")} min={5} max={100} suffix="%" preset={100} />
      </Group>

      <Group title="Αποστάσεις" icon="Frame">
        <Grid>
          <OptNum label="Κενό πάνω" value={s.mt} onChange={set("mt")} min={-120} max={240} suffix="px" preset={0} />
          <OptNum label="Κενό κάτω" value={s.mb} onChange={set("mb")} min={-120} max={240} suffix="px" preset={0} />
        </Grid>
        <Grid>
          <OptNum label="Κενό αριστερά" value={s.ml} onChange={set("ml")} min={-120} max={240} suffix="px" preset={0} />
          <OptNum label="Κενό δεξιά" value={s.mr} onChange={set("mr")} min={-120} max={240} suffix="px" preset={0} />
        </Grid>
        <Grid>
          <OptNum label="Εσωτερικό πάνω/κάτω" value={s.pt} onChange={set("pt")} min={0} max={200} suffix="px" preset={16} />
          <OptNum label="Εσωτερικό αριστερά/δεξιά" value={s.pl} onChange={set("pl")} min={0} max={200} suffix="px" preset={16} />
        </Grid>
      </Group>

      <Group title="Πλαίσιο & σκιά" icon="Square">
        <OptNum label="Στρογγύλεμα" value={s.radius} onChange={set("radius")} min={0} max={60} suffix="px" preset={16} />
        <OptNum label="Πάχος περιγράμματος" value={s.borderW} onChange={set("borderW")} min={0} max={8} suffix="px" preset={1} />
        {s.borderW ? (
          <Row label="Χρώμα περιγράμματος">
            <ColorInput value={s.borderC || ""} onChange={(v) => set("borderC")(v || undefined)} />
          </Row>
        ) : null}
        <Row label="Σκιά">
          <Select value={s.shadow || ""} onChange={(v) => set("shadow")(v || undefined)} options={SHADOWS} />
        </Row>
        <Row label="Σειρά επικάλυψης (z-index)">
          <NumberInput value={s.zIndex ?? ""} onChange={(v) => set("zIndex")(v === "" ? undefined : v)} min={0} max={90} />
        </Row>
      </Group>
    </div>
  );
};

export default StyleEditor;
