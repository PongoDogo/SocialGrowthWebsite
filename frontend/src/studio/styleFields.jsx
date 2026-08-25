import React, { useEffect, useState } from "react";
import * as Icons from "lucide-react";
import { Row, Grid, Select, Slider, ColorInput, NumberInput, Toggle, Tip, ImagePicker } from "@/studio/fields";
import { FONTS } from "@/content/style";
import { countStyleValues } from "@/studio/util";

/* Desktop is the base; tablet applies under 1024px, mobile under 768px. */
const DEVICES = [
  { k: "d", label: "Desktop", icon: "Monitor", tip: "Η βάση. Ισχύει παντού, εκτός αν βάλεις κάτι διαφορετικό σε tablet ή κινητό." },
  { k: "t", label: "Tablet", icon: "Tablet", tip: "Ισχύει σε οθόνες κάτω από 1024px. Αν το αφήσεις κενό, κληρονομεί το desktop." },
  { k: "m", label: "Κινητό", icon: "Smartphone", tip: "Ισχύει σε οθόνες κάτω από 768px και υπερισχύει του tablet." },
];

const AUTO = { value: "", label: "Αυτόματο" };

const WEIGHTS = [
  AUTO,
  { value: "300", label: "300 — λεπτό" },
  { value: "400", label: "400 — κανονικό" },
  { value: "500", label: "500 — μέτριο" },
  { value: "600", label: "600 — ημι-έντονο" },
  { value: "700", label: "700 — έντονο" },
  { value: "800", label: "800 — πολύ έντονο" },
  { value: "900", label: "900 — μαύρο" },
];

const ALIGNS = [AUTO, { value: "left", label: "Αριστερά" }, { value: "center", label: "Κέντρο" }, { value: "right", label: "Δεξιά" }, { value: "justify", label: "Πλήρης στοίχιση" }];

const TRANSFORMS = [
  AUTO,
  { value: "none", label: "Κανονικά" },
  { value: "uppercase", label: "ΚΕΦΑΛΑΙΑ" },
  { value: "lowercase", label: "πεζά" },
  { value: "capitalize", label: "Αρχικά Κεφαλαία" },
];

const DECORATIONS = [
  AUTO,
  { value: "none", label: "Χωρίς" },
  { value: "underline", label: "Υπογράμμιση" },
  { value: "line-through", label: "Διαγραφή" },
];

const SHADOWS = [
  AUTO,
  { value: "none", label: "Καμία" },
  { value: "soft", label: "Απαλή" },
  { value: "strong", label: "Δυνατή" },
  { value: "glow", label: "Λάμψη" },
  { value: "ring", label: "Δαχτυλίδι" },
  { value: "inner", label: "Εσωτερική" },
  { value: "custom", label: "Δική μου..." },
];

const TEXT_SHADOWS = [AUTO, { value: "none", label: "Καμία" }, { value: "soft", label: "Απαλή" }, { value: "strong", label: "Δυνατή" }, { value: "glow", label: "Λάμψη" }];

const W_MODES = [
  AUTO,
  { value: "px", label: "Σταθερό (px)" },
  { value: "pct", label: "Ποσοστό (%)" },
  { value: "full", label: "Γεμάτο (100%)" },
  { value: "fit", label: "Όσο χρειάζεται" },
];

const DISPLAYS = [
  AUTO,
  { value: "block", label: "Μπλοκ (block)" },
  { value: "inline-block", label: "Ενσωματωμένο μπλοκ" },
  { value: "flex", label: "Ευέλικτο (flex)" },
  { value: "inline-flex", label: "Ενσωματωμένο flex" },
  { value: "grid", label: "Πλέγμα (grid)" },
];

const FLEX_DIRS = [
  AUTO,
  { value: "row", label: "Σε σειρά →" },
  { value: "row-reverse", label: "Σε σειρά ←" },
  { value: "column", label: "Σε στήλη ↓" },
  { value: "column-reverse", label: "Σε στήλη ↑" },
];

const JUSTIFY = [
  AUTO,
  { value: "flex-start", label: "Στην αρχή" },
  { value: "center", label: "Στο κέντρο" },
  { value: "flex-end", label: "Στο τέλος" },
  { value: "space-between", label: "Ίσα κενά ανάμεσα" },
  { value: "space-around", label: "Ίσα κενά γύρω" },
  { value: "space-evenly", label: "Απόλυτα ίσα κενά" },
];

const ALIGN_ITEMS = [
  AUTO,
  { value: "flex-start", label: "Πάνω" },
  { value: "center", label: "Κέντρο" },
  { value: "flex-end", label: "Κάτω" },
  { value: "stretch", label: "Τέντωμα" },
  { value: "baseline", label: "Βάση κειμένου" },
];

const WRAPS = [AUTO, { value: "wrap", label: "Να αλλάζει γραμμή" }, { value: "nowrap", label: "Όλα σε μία γραμμή" }];

const POSITIONS = [
  AUTO,
  { value: "relative", label: "Κανονική" },
  { value: "absolute", label: "Ελεύθερη (absolute)" },
  { value: "sticky", label: "Κολλητή (sticky)" },
  { value: "fixed", label: "Σταθερή στην οθόνη" },
];

const BORDER_STYLES = [
  AUTO,
  { value: "solid", label: "Συνεχής" },
  { value: "dashed", label: "Διακεκομμένη" },
  { value: "dotted", label: "Με τελείες" },
  { value: "double", label: "Διπλή" },
];

const WHITESPACE = [
  AUTO,
  { value: "normal", label: "Κανονικά" },
  { value: "nowrap", label: "Ποτέ αλλαγή γραμμής" },
  { value: "pre-line", label: "Κρατά τις αλλαγές γραμμής" },
];

const OVERFLOWS = [AUTO, { value: "visible", label: "Να φαίνεται" }, { value: "hidden", label: "Να κόβεται" }, { value: "auto", label: "Με μπάρα κύλισης" }];

const CURSORS = [
  AUTO,
  { value: "pointer", label: "Δάχτυλο (κλικ)" },
  { value: "default", label: "Κανονικό βέλος" },
  { value: "not-allowed", label: "Απαγορευμένο" },
  { value: "grab", label: "Χεράκι" },
];

const BG_SIZES = [
  AUTO,
  { value: "cover", label: "Καλύπτει" },
  { value: "contain", label: "Χωράει ολόκληρη" },
  { value: "auto", label: "Κανονικό μέγεθος" },
  { value: "100% 100%", label: "Τέντωμα" },
];

const BG_POS = [
  AUTO,
  { value: "center", label: "Κέντρο" },
  { value: "top", label: "Πάνω" },
  { value: "bottom", label: "Κάτω" },
  { value: "left", label: "Αριστερά" },
  { value: "right", label: "Δεξιά" },
];

/** Numeric field that can be "auto" (unset). */
const OptNum = ({ label, hint, tip, tid, value, onChange, min, max, step = 1, suffix = "", preset = 0 }) => {
  const on = value !== undefined && value !== null && value !== "";
  return (
    <Row label={label} hint={hint} tip={tip} testId={tid}>
      {on ? (
        <div className="flex items-center gap-2">
          <div className="min-w-0 flex-1">
            <Slider value={Number(value)} onChange={onChange} min={min} max={max} step={step} suffix={suffix} />
          </div>
          <button
            type="button"
            title="Επαναφορά σε αυτόματο"
            data-testid={tid ? `${tid}-auto` : undefined}
            onClick={() => onChange(undefined)}
            className="shrink-0 rounded-lg border border-white/12 p-1.5 text-white/40 transition-colors hover:border-white/30 hover:text-white"
          >
            <Icons.RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          data-testid={tid ? `${tid}-set` : undefined}
          onClick={() => onChange(preset)}
          className="w-full rounded-xl border border-dashed border-white/15 py-2 text-[12px] font-semibold text-white/40 transition-colors hover:border-[#60d6ff]/50 hover:text-white/80"
        >
          Αυτόματο — πάτα για ρύθμιση
        </button>
      )}
    </Row>
  );
};

const Group = ({ title, icon, tip, tid, count = 0, children, open: initial = false }) => {
  const [open, setOpen] = useState(initial);
  const I = Icons[icon] || Icons.Settings2;
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02]">
      <button type="button" data-testid={tid} aria-expanded={open} onClick={() => setOpen((o) => !o)} className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left">
        <I className="h-3.5 w-3.5 shrink-0 text-[#60d6ff]" />
        <span className="flex min-w-0 flex-1 items-center text-[12.5px] font-bold text-white/80">
          <span className="truncate">{title}</span>
          <Tip text={tip} />
        </span>
        {count > 0 && (
          <span className="shrink-0 rounded-full bg-[#60d6ff]/15 px-2 py-0.5 text-[10px] font-extrabold text-[#60d6ff]">{count}</span>
        )}
        <Icons.ChevronDown className={`h-4 w-4 shrink-0 text-white/35 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="space-y-4 border-t border-white/[0.07] px-3.5 py-4">{children}</div>}
    </div>
  );
};

/** How many of the given keys are actually set (for the little group badges). */
const countKeys = (s, keys) => keys.filter((k) => s[k] !== undefined && s[k] !== null && s[k] !== "" && s[k] !== false).length;

export const StyleEditor = ({ path, styles, kind = "box", onSet, onReset, onCopyDevice, deviceKey = "d" }) => {
  const [dev, setDev] = useState(deviceKey);

  /* follow the device chosen in the top bar, so preview and editor never disagree */
  useEffect(() => {
    if (deviceKey) setDev(deviceKey);
  }, [deviceKey]);

  const entry = styles?.[path] || {};
  const s = entry[dev] || {};
  const hv = s.hover || {};

  const set = (k) => (v) => onSet(path, dev, k, v);
  const setH = (k) => (v) => onSet(path, dev, ["hover", k], v);

  const textish = ["text", "button", "number"].includes(kind);
  const fontOptions = [{ value: "", label: "Αυτόματη" }, ...FONTS.map((f) => ({ value: f.name, label: f.name }))];
  const touched = countStyleValues(entry.d) + countStyleValues(entry.t) + countStyleValues(entry.m);
  const hoverCount = countStyleValues(hv);
  const positioned = ["absolute", "fixed", "sticky"].includes(s.position);

  return (
    <div className="space-y-3" data-testid="style-editor">
      {/* ---------------------------------------------------- device switcher */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center rounded-full border border-white/12 p-[3px] text-[11px] font-bold">
          {DEVICES.map((d) => {
            const I = Icons[d.icon];
            const n = countStyleValues(entry[d.k]);
            return (
              <button
                key={d.k}
                type="button"
                title={d.tip}
                data-testid={`style-device-${d.k}`}
                onClick={() => setDev(d.k)}
                className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 transition-colors ${dev === d.k ? "bg-white text-black" : "text-white/50 hover:text-white/80"}`}
              >
                <I className="h-3 w-3" />
                {d.label}
                {n > 0 && <span className={`h-1.5 w-1.5 rounded-full ${dev === d.k ? "bg-black/50" : "bg-[#60d6ff]"}`} />}
              </button>
            );
          })}
        </div>

        {dev !== "d" && (
          <button
            type="button"
            data-testid="style-copy-desktop"
            onClick={() => onCopyDevice(path, "d", dev)}
            title="Φέρνει όλες τις ρυθμίσεις του desktop σε αυτή τη συσκευή"
            className="rounded-full border border-white/12 px-2.5 py-1 text-[11px] font-semibold text-white/55 transition-colors hover:border-white/30 hover:text-white"
          >
            Αντιγραφή από desktop
          </button>
        )}
        {dev === "m" && countStyleValues(entry.t) > 0 && (
          <button
            type="button"
            onClick={() => onCopyDevice(path, "t", "m")}
            className="rounded-full border border-white/12 px-2.5 py-1 text-[11px] font-semibold text-white/55 transition-colors hover:border-white/30 hover:text-white"
          >
            Αντιγραφή από tablet
          </button>
        )}

        {touched > 0 && (
          <button
            type="button"
            data-testid="style-reset"
            onClick={() => onReset(path)}
            title="Σβήνει όλες τις χειροκίνητες ρυθμίσεις αυτού του στοιχείου, σε όλες τις συσκευές"
            className="ml-auto rounded-full border border-red-500/30 px-2.5 py-1 text-[11px] font-semibold text-red-300/80 transition-colors hover:border-red-500/60 hover:text-red-200"
          >
            Καθάρισε στυλ ({touched})
          </button>
        )}
      </div>

      <p className="flex items-start gap-2 rounded-lg bg-white/[0.03] px-3 py-2 text-[11px] leading-relaxed text-white/40">
        <Icons.Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#60d6ff]/70" />
        Ρυθμίζεις τη συσκευή <strong className="font-bold text-white/70">{DEVICES.find((d) => d.k === dev)?.label}</strong>. Ό,τι αφήνεις «Αυτόματο» κληρονομείται από
        το desktop, οπότε αλλάζεις μόνο ό,τι θέλεις διαφορετικό.
      </p>

      {/* ------------------------------------------------------ position/size */}
      <Group
        title="Θέση & μέγεθος"
        tid="style-group-position"
        icon="Move"
        open
        tip="Πού κάθεται το στοιχείο και πόσο χώρο πιάνει. Μπορείς και να το σύρεις με το ποντίκι μέσα στο preview."
        count={countKeys(s, ["x", "y", "rotate", "scale", "wMode", "w", "wPct", "minWidth", "maxWidth", "h", "minHeight", "maxHeight", "position", "top", "right", "bottom", "left", "hidden", "order", "zIndex"])}
      >
        <Grid>
          <Row label="Οριζόντια (X)" testId="opt-x" tip="Μετακινεί το στοιχείο δεξιά (θετικό) ή αριστερά (αρνητικό), χωρίς να πειράξει τα υπόλοιπα.">
            <Slider value={Number(s.x) || 0} onChange={set("x")} min={-400} max={400} suffix="px" />
          </Row>
          <Row label="Κάθετα (Y)" testId="opt-y" tip="Μετακινεί το στοιχείο κάτω (θετικό) ή πάνω (αρνητικό), χωρίς να πειράξει τα υπόλοιπα.">
            <Slider value={Number(s.y) || 0} onChange={set("y")} min={-400} max={400} suffix="px" />
          </Row>
        </Grid>
        <Grid>
          <Row label="Περιστροφή" tip="Γέρνει το στοιχείο. Λίγες μοίρες αρκούν για διακοσμητικό αποτέλεσμα.">
            <Slider value={Number(s.rotate) || 0} onChange={set("rotate")} min={-180} max={180} suffix="°" />
          </Row>
          <Row label="Μεγέθυνση" tip="Μεγαλώνει ή μικραίνει ολόκληρο το στοιχείο μαζί με το περιεχόμενό του. 100% = κανονικό.">
            <Slider value={Number(s.scale) || 100} onChange={set("scale")} min={20} max={300} suffix="%" />
          </Row>
        </Grid>

        <Row label="Τρόπος πλάτους" tip="Αυτόματο = όπως το έχει το site. Σταθερό/Ποσοστό δίνει ακριβές πλάτος. «Όσο χρειάζεται» μαζεύει το πλάτος στο περιεχόμενο.">
          <Select value={s.wMode || ""} onChange={(v) => set("wMode")(v || undefined)} options={W_MODES} />
        </Row>
        {s.wMode === "px" && (
          <OptNum label="Πλάτος" tip="Ακριβές πλάτος σε pixel." value={s.w} onChange={set("w")} min={20} max={1600} step={5} suffix="px" preset={320} />
        )}
        {s.wMode === "pct" && (
          <OptNum label="Πλάτος" tip="Πλάτος ως ποσοστό του χώρου που έχει διαθέσιμο." value={s.wPct} onChange={set("wPct")} min={5} max={100} suffix="%" preset={100} />
        )}

        <Grid>
          <OptNum label="Ελάχιστο πλάτος" tip="Δεν επιτρέπει στο στοιχείο να στενέψει κάτω από αυτό. Χρήσιμο για κουμπιά που «μαζεύουν»." value={s.minWidth} onChange={set("minWidth")} min={0} max={1200} step={10} suffix="px" preset={120} />
          <OptNum label="Μέγιστο πλάτος" tip="Κόφτης πλάτους. Ιδανικό για κείμενα, ώστε οι γραμμές να μη γίνονται υπερβολικά μακριές." value={s.maxWidth} onChange={set("maxWidth")} min={80} max={1600} step={10} suffix="px" preset={600} />
        </Grid>
        <Grid>
          <OptNum label="Ύψος" tip="Σταθερό ύψος. Πρόσεχε: αν το περιεχόμενο είναι μεγαλύτερο, μπορεί να ξεφύγει." value={s.h} onChange={set("h")} min={10} max={1200} step={5} suffix="px" preset={200} />
          <OptNum label="Ελάχιστο ύψος" tip="Εγγυημένο ύψος. Ο σωστός τρόπος για να ισιώσεις κάρτες διαφορετικού μεγέθους." value={s.minHeight} onChange={set("minHeight")} min={0} max={1200} step={5} suffix="px" preset={160} />
        </Grid>
        <OptNum label="Μέγιστο ύψος" tip="Κόφτης ύψους. Συνδύασέ το με «Υπερχείλιση: με μπάρα κύλισης» για να μη κρύβεται περιεχόμενο." value={s.maxHeight} onChange={set("maxHeight")} min={20} max={1600} step={10} suffix="px" preset={400} />

        <Row label="Τρόπος τοποθέτησης" tip="Κανονική = μένει στη ροή της σελίδας. Ελεύθερη = βγαίνει από τη ροή και τοποθετείται με τις αποστάσεις παρακάτω. Κολλητή = «κολλάει» καθώς κατεβαίνεις.">
          <Select value={s.position || ""} onChange={(v) => set("position")(v || undefined)} options={POSITIONS} />
        </Row>
        {positioned && (
          <>
            <Grid>
              <OptNum label="Απόσταση από πάνω" value={s.top} onChange={set("top")} min={-400} max={800} suffix="px" preset={0} tip="Μετράει από την κορυφή του γονικού στοιχείου." />
              <OptNum label="Απόσταση από κάτω" value={s.bottom} onChange={set("bottom")} min={-400} max={800} suffix="px" preset={0} tip="Μετράει από τη βάση του γονικού στοιχείου." />
            </Grid>
            <Grid>
              <OptNum label="Απόσταση από αριστερά" value={s.left} onChange={set("left")} min={-400} max={800} suffix="px" preset={0} tip="Μετράει από την αριστερή άκρη του γονικού στοιχείου." />
              <OptNum label="Απόσταση από δεξιά" value={s.right} onChange={set("right")} min={-400} max={800} suffix="px" preset={0} tip="Μετράει από τη δεξιά άκρη του γονικού στοιχείου." />
            </Grid>
          </>
        )}

        <Grid>
          <OptNum label="Σειρά εμφάνισης" tip="Αλλάζει τη σειρά μέσα σε μια ομάδα χωρίς να μετακινήσεις τίποτα. Μικρότερος αριθμός = πιο μπροστά." value={s.order} onChange={set("order")} min={-10} max={20} preset={0} />
          <Row label="Επικάλυψη (z-index)" testId="opt-zindex" tip="Ποιο στοιχείο περνάει μπροστά όταν δύο πέφτουν το ένα πάνω στο άλλο. Μεγαλύτερος αριθμός = πιο μπροστά. Το 0 επιτρέπεται.">
            <NumberInput value={s.zIndex ?? ""} onChange={(v) => set("zIndex")(v === "" ? undefined : v)} min={0} max={90} />
          </Row>
        </Grid>

        <Toggle
          value={!!s.hidden}
          onChange={set("hidden")}
          label="Κρύψε το στοιχείο"
          tip="Το εξαφανίζει ΜΟΝΟ στη συσκευή που ρυθμίζεις τώρα. Ιδανικό για να κρύψεις κάτι μόνο στο κινητό."
          hint={`Εξαφανίζεται μόνο σε: ${DEVICES.find((d) => d.k === dev)?.label}`}
        />
      </Group>

      {/* -------------------------------------------------------- typography */}
      <Group
        title="Τυπογραφία"
        tid="style-group-typography"
        icon="Type"
        open={textish}
        tip="Όλα για τα γράμματα: μέγεθος, βάρος, στοίχιση, αποστάσεις και γραμματοσειρά."
        count={countKeys(s, ["fontSize", "fontWeight", "textAlign", "letterSpacing", "wordSpacing", "lineHeight", "textTransform", "font", "fontStyle", "textDecoration", "textShadow"])}
      >
        <OptNum tid="opt-fontsize" label="Μέγεθος γραμμάτων" tip="Σε pixel. Θυμήσου να το μικρύνεις και στο κινητό αν βάλεις μεγάλο μέγεθος στο desktop." value={s.fontSize} onChange={set("fontSize")} min={8} max={200} suffix="px" preset={28} />
        <Grid>
          <Row label="Βάρος" tip="Πόσο έντονα είναι τα γράμματα. Δεν υποστηρίζουν όλες οι γραμματοσειρές όλα τα βάρη.">
            <Select value={s.fontWeight ? String(s.fontWeight) : ""} onChange={(v) => set("fontWeight")(v ? Number(v) : undefined)} options={WEIGHTS} />
          </Row>
          <Row label="Στοίχιση" tip="Πού «ακουμπάει» το κείμενο μέσα στον χώρο του.">
            <Select value={s.textAlign || ""} onChange={(v) => set("textAlign")(v || undefined)} options={ALIGNS} />
          </Row>
        </Grid>
        <Grid>
          <OptNum label="Απόσταση γραμμάτων" tip="Αραιώνει ή σφίγγει τα γράμματα. Λίγο αρνητικό δίνει πιο «premium» look στους μεγάλους τίτλους." value={s.letterSpacing} onChange={set("letterSpacing")} min={-6} max={20} step={0.5} suffix="px" preset={0} />
          <OptNum label="Απόσταση λέξεων" tip="Αραιώνει τα κενά ανάμεσα στις λέξεις." value={s.wordSpacing} onChange={set("wordSpacing")} min={-6} max={30} step={0.5} suffix="px" preset={0} />
        </Grid>
        <Grid>
          <OptNum label="Ύψος γραμμής" tip="Το κενό ανάμεσα στις γραμμές. Κάτω από 1 οι γραμμές κολλάνε, γύρω στο 1.5 διαβάζεται άνετα." value={s.lineHeight} onChange={set("lineHeight")} min={0.7} max={3} step={0.05} preset={1.2} />
          <Row label="Πεζά / κεφαλαία" tip="Αλλάζει την εμφάνιση χωρίς να πειράξει το κείμενο που έγραψες.">
            <Select value={s.textTransform || ""} onChange={(v) => set("textTransform")(v || undefined)} options={TRANSFORMS} />
          </Row>
        </Grid>
        <Grid>
          <Row label="Γραμματοσειρά" tip="Μόνο για αυτό το στοιχείο. Οι γενικές γραμματοσειρές του site αλλάζουν από «Γραμματοσειρές & κουμπιά».">
            <Select value={s.font || ""} onChange={(v) => set("font")(v || undefined)} options={fontOptions} />
          </Row>
          <Row label="Διακόσμηση" tip="Υπογράμμιση ή διαγραφή του κειμένου.">
            <Select value={s.textDecoration || ""} onChange={(v) => set("textDecoration")(v || undefined)} options={DECORATIONS} />
          </Row>
        </Grid>
        <Row label="Σκιά κειμένου" tip="Βοηθάει να διαβάζεται ένα κείμενο που κάθεται πάνω σε εικόνα.">
          <Select value={s.textShadow || ""} onChange={(v) => set("textShadow")(v || undefined)} options={TEXT_SHADOWS} />
        </Row>
        <Toggle value={s.fontStyle === "italic"} onChange={(v) => set("fontStyle")(v ? "italic" : undefined)} label="Πλάγια γράμματα" tip="Κάνει το κείμενο italic." />
      </Group>

      {/* ------------------------------------------------- long / broken text */}
      <Group
        title="Μεγάλα κείμενα & υπερχείλιση"
        tid="style-group-text"
        icon="WrapText"
        tip="Εδώ λύνεις τα κείμενα που ξεφεύγουν από την κάρτα τους, σπάνε άσχημα ή χαλάνε τη στοίχιση."
        count={countKeys(s, ["clamp", "ellipsis", "breakWord", "whiteSpace", "overflow"])}
      >
        <OptNum
          tid="opt-clamp"
          label="Μέγιστες γραμμές"
          tip="Κρατά το κείμενο σε τόσες γραμμές και βάζει «...» στο τέλος. Ο πιο ασφαλής τρόπος να ισιώσεις κάρτες με κείμενα διαφορετικού μήκους."
          value={s.clamp}
          onChange={set("clamp")}
          min={1}
          max={12}
          preset={3}
        />
        <Toggle
          value={!!s.ellipsis}
          onChange={set("ellipsis")}
          label="Μία γραμμή με «...»"
          tip="Αναγκάζει το κείμενο σε μία μόνο γραμμή και κόβει το υπόλοιπο με αποσιωπητικά. Αν έχεις βάλει «Μέγιστες γραμμές», εκείνο υπερισχύει."
        />
        <Toggle
          value={!!s.breakWord}
          onChange={set("breakWord")}
          label="Σπάσε τις μεγάλες λέξεις"
          tip="Για πολύ μεγάλες λέξεις, links ή emails που ξεφεύγουν από το πλαίσιο. Τα σπάει ώστε να χωρέσουν."
        />
        <Grid>
          <Row label="Αλλαγή γραμμής" tip="«Ποτέ αλλαγή γραμμής» κρατά τα πάντα σε μια σειρά — προσοχή, μπορεί να ξεφύγει στο κινητό.">
            <Select value={s.whiteSpace || ""} onChange={(v) => set("whiteSpace")(v || undefined)} options={WHITESPACE} />
          </Row>
          <Row label="Υπερχείλιση" tip="Τι γίνεται με ό,τι δεν χωράει: να φαίνεται, να κόβεται, ή να μπει μπάρα κύλισης.">
            <Select value={s.overflow || ""} onChange={(v) => set("overflow")(v || undefined)} options={OVERFLOWS} />
          </Row>
        </Grid>
      </Group>

      {/* --------------------------------------------------- colours / background */}
      <Group
        title="Χρώματα, φόντο & εφέ"
        tid="style-group-colors"
        icon="Palette"
        tip="Χρώμα κειμένου, φόντο (χρώμα, ντεγκραντέ ή εικόνα), διαφάνεια και φίλτρα."
        count={countKeys(s, ["color", "bg", "opacity", "bgGradFrom", "bgGradTo", "bgGradAngle", "bgImg", "bgSize", "bgPos", "textGradFrom", "textGradTo", "blur", "backdropBlur", "grayscale", "brightness", "saturate"])}
      >
        <Row label="Χρώμα κειμένου" tip="Άφησέ το κενό για να ακολουθεί το χρώμα του θέματος." >
          <ColorInput value={s.color || ""} onChange={(v) => set("color")(v || undefined)} />
        </Row>
        <Row label="Χρώμα φόντου" tip="Το φόντο του ίδιου του στοιχείου. Χρήσιμο για να ξεχωρίσει μια κάρτα ή ένα κουμπί.">
          <ColorInput value={s.bg || ""} onChange={(v) => set("bg")(v || undefined)} />
        </Row>
        <OptNum label="Διαφάνεια" tip="100% = εντελώς ορατό. Χαμηλές τιμές το κάνουν να ξεθωριάζει." value={s.opacity} onChange={set("opacity")} min={0} max={100} suffix="%" preset={100} />

        <div className="rounded-lg border border-white/[0.07] p-3">
          <p className="mb-3 flex items-center text-[11px] font-bold uppercase tracking-[0.14em] text-white/40">
            Ντεγκραντέ φόντου
            <Tip text="Βάλε ΚΑΙ τα δύο χρώματα για να ενεργοποιηθεί το ντεγκραντέ. Αν βάλεις και εικόνα φόντου, η εικόνα υπερισχύει." />
          </p>
          <Grid>
            <Row label="Από" testId="opt-bggrad-from">
              <ColorInput value={s.bgGradFrom || ""} onChange={(v) => set("bgGradFrom")(v || undefined)} />
            </Row>
            <Row label="Έως" testId="opt-bggrad-to">
              <ColorInput value={s.bgGradTo || ""} onChange={(v) => set("bgGradTo")(v || undefined)} />
            </Row>
          </Grid>
          <div className="mt-3">
            <OptNum label="Γωνία" tip="0° = από κάτω προς πάνω, 90° = από αριστερά προς δεξιά." value={s.bgGradAngle} onChange={set("bgGradAngle")} min={0} max={360} step={5} suffix="°" preset={135} />
          </div>
        </div>

        {textish && (
          <div className="rounded-lg border border-white/[0.07] p-3">
            <p className="mb-3 flex items-center text-[11px] font-bold uppercase tracking-[0.14em] text-white/40">
              Ντεγκραντέ στα γράμματα
              <Tip text="Βάφει τα ίδια τα γράμματα με ντεγκραντέ. Θέλει και τα δύο χρώματα. Αν το ενεργοποιήσεις, αγνοεί το «Χρώμα κειμένου»." />
            </p>
            <Grid>
              <Row label="Από">
                <ColorInput value={s.textGradFrom || ""} onChange={(v) => set("textGradFrom")(v || undefined)} />
              </Row>
              <Row label="Έως">
                <ColorInput value={s.textGradTo || ""} onChange={(v) => set("textGradTo")(v || undefined)} />
              </Row>
            </Grid>
            <div className="mt-3">
              <OptNum label="Γωνία" value={s.textGradAngle} onChange={set("textGradAngle")} min={0} max={360} step={5} suffix="°" preset={90} tip="Η κατεύθυνση του ντεγκραντέ στα γράμματα." />
            </div>
          </div>
        )}

        <ImagePicker
          label="Εικόνα φόντου"
          hint="Ανέβασε ή διάλεξε εικόνα για φόντο αυτού του στοιχείου."
          value={s.bgImg || ""}
          onChange={(v) => set("bgImg")(v || undefined)}
        />
        {s.bgImg && (
          <Grid>
            <Row label="Κάλυψη" tip="«Καλύπτει» γεμίζει τον χώρο (μπορεί να κόψει άκρες). «Χωράει ολόκληρη» τη δείχνει πλήρη.">
              <Select value={s.bgSize || ""} onChange={(v) => set("bgSize")(v || undefined)} options={BG_SIZES} />
            </Row>
            <Row label="Θέση εικόνας" tip="Ποιο σημείο της εικόνας μένει ορατό όταν κόβεται.">
              <Select value={s.bgPos || ""} onChange={(v) => set("bgPos")(v || undefined)} options={BG_POS} />
            </Row>
          </Grid>
        )}

        <Grid>
          <OptNum label="Θόλωμα στοιχείου" tip="Θολώνει το ΙΔΙΟ το στοιχείο (και το κείμενό του). Καλό για διακοσμητικά σχήματα." value={s.blur} onChange={set("blur")} min={0} max={40} step={0.5} suffix="px" preset={4} />
          <OptNum label="Θόλωμα από πίσω" tip="Θολώνει ό,τι βρίσκεται ΠΙΣΩ από το στοιχείο (frosted glass). Θέλει ημιδιάφανο φόντο για να φαίνεται." value={s.backdropBlur} onChange={set("backdropBlur")} min={0} max={40} suffix="px" preset={10} />
        </Grid>
        <Grid>
          <OptNum label="Ασπρόμαυρο" tip="100% το κάνει εντελώς ασπρόμαυρο. Χρήσιμο για λογότυπα πελατών." value={s.grayscale} onChange={set("grayscale")} min={0} max={100} suffix="%" preset={100} />
          <OptNum label="Φωτεινότητα" tip="Κάτω από 100% σκουραίνει, πάνω από 100% φωτίζει." value={s.brightness} onChange={set("brightness")} min={0} max={250} suffix="%" preset={100} />
        </Grid>
        <OptNum label="Κορεσμός χρωμάτων" tip="0% = ξεπλυμένο, 100% = κανονικό, πάνω από 100% = πιο ζωηρά χρώματα." value={s.saturate} onChange={set("saturate")} min={0} max={300} suffix="%" preset={100} />
      </Group>

      {/* ------------------------------------------------------- inner layout */}
      <Group
        title="Διάταξη περιεχομένου"
        tid="style-group-layout"
        icon="LayoutGrid"
        tip="Πώς στοιχίζονται τα ΠΑΙΔΙΑ αυτού του στοιχείου. Εδώ φτιάχνεις ασυμμετρίες και άδεια κενά μέσα σε κάρτες και ομάδες."
        count={countKeys(s, ["display", "flexDir", "justify", "alignItems", "flexWrap", "gap", "gridCols"])}
      >
        <Row label="Τύπος διάταξης" tip="Διάλεξε «Ευέλικτο (flex)» για να ενεργοποιηθούν οι στοιχίσεις παρακάτω. Το «Πλέγμα (grid)» δουλεύει με τις στήλες.">
          <Select value={s.display || ""} onChange={(v) => set("display")(v || undefined)} options={DISPLAYS} />
        </Row>
        <Grid>
          <Row label="Κατεύθυνση" tip="Αν τα παιδιά μπαίνουν σε σειρά (δίπλα-δίπλα) ή σε στήλη (ένα κάτω από το άλλο).">
            <Select value={s.flexDir || ""} onChange={(v) => set("flexDir")(v || undefined)} options={FLEX_DIRS} />
          </Row>
          <Row label="Αλλαγή γραμμής" tip="Αν τα παιδιά επιτρέπεται να «πέσουν» σε επόμενη γραμμή όταν δεν χωρούν.">
            <Select value={s.flexWrap || ""} onChange={(v) => set("flexWrap")(v || undefined)} options={WRAPS} />
          </Row>
        </Grid>
        <Grid>
          <Row label="Στοίχιση κατά μήκος" tip="Η στοίχιση προς την κατεύθυνση της διάταξης. Το «Ίσα κενά ανάμεσα» εξαφανίζει τα άσχημα κενά.">
            <Select value={s.justify || ""} onChange={(v) => set("justify")(v || undefined)} options={JUSTIFY} />
          </Row>
          <Row label="Στοίχιση κατά πλάτος" tip="Η στοίχιση στην κάθετη κατεύθυνση. Το «Τέντωμα» ισιώνει παιδιά με διαφορετικά ύψη.">
            <Select value={s.alignItems || ""} onChange={(v) => set("alignItems")(v || undefined)} options={ALIGN_ITEMS} />
          </Row>
        </Grid>
        <OptNum label="Κενό ανάμεσα" tip="Η απόσταση ανάμεσα στα παιδιά. Ο καθαρός τρόπος να δώσεις αέρα χωρίς margins." value={s.gap} onChange={set("gap")} min={0} max={120} suffix="px" preset={16} />
        <OptNum label="Στήλες πλέγματος" tip="Σπάει το περιεχόμενο σε τόσες ίσες στήλες. Βάζει αυτόματα διάταξη πλέγματος." value={s.gridCols} onChange={set("gridCols")} min={1} max={8} preset={2} />
      </Group>

      {/* ----------------------------------------------------------- spacing */}
      <Group
        title="Αποστάσεις"
        tid="style-group-spacing"
        icon="Frame"
        tip="Εξωτερικό κενό = αέρας ΓΥΡΩ από το στοιχείο (διώχνει τα γειτονικά). Εσωτερικό κενό = αέρας ΜΕΣΑ, ανάμεσα στο πλαίσιο και το περιεχόμενο."
        count={countKeys(s, ["mt", "mb", "ml", "mr", "pt", "pb", "pl", "pr"])}
      >
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/35">Εξωτερικό κενό (γύρω)</p>
        <Grid>
          <OptNum tid="opt-mt" label="Πάνω" tip="Αρνητική τιμή τραβάει το στοιχείο πάνω και κλείνει άδειο κενό." value={s.mt} onChange={set("mt")} min={-200} max={300} suffix="px" preset={0} />
          <OptNum tid="opt-mb" label="Κάτω" tip="Αρνητική τιμή τραβάει το επόμενο στοιχείο πιο κοντά." value={s.mb} onChange={set("mb")} min={-200} max={300} suffix="px" preset={0} />
        </Grid>
        <Grid>
          <OptNum tid="opt-ml" label="Αριστερά" value={s.ml} onChange={set("ml")} min={-200} max={300} suffix="px" preset={0} tip="Σπρώχνει το στοιχείο δεξιά. Αρνητική τιμή το βγάζει προς τα αριστερά." />
          <OptNum tid="opt-mr" label="Δεξιά" value={s.mr} onChange={set("mr")} min={-200} max={300} suffix="px" preset={0} tip="Σπρώχνει το στοιχείο αριστερά. Αρνητική τιμή το βγάζει προς τα δεξιά." />
        </Grid>

        <p className="pt-1 text-[11px] font-bold uppercase tracking-[0.14em] text-white/35">Εσωτερικό κενό (μέσα)</p>
        <Grid>
          <OptNum tid="opt-pt" label="Πάνω" value={s.pt} onChange={set("pt")} min={0} max={300} suffix="px" preset={16} tip="Αέρας ανάμεσα στην κορυφή του πλαισίου και το περιεχόμενο." />
          <OptNum tid="opt-pb" label="Κάτω" value={s.pb} onChange={set("pb")} min={0} max={300} suffix="px" preset={16} tip="Αέρας ανάμεσα στη βάση του πλαισίου και το περιεχόμενο." />
        </Grid>
        <Grid>
          <OptNum tid="opt-pl" label="Αριστερά" value={s.pl} onChange={set("pl")} min={0} max={300} suffix="px" preset={16} tip="Αέρας στην αριστερή εσωτερική πλευρά." />
          <OptNum tid="opt-pr" label="Δεξιά" value={s.pr} onChange={set("pr")} min={0} max={300} suffix="px" preset={16} tip="Αέρας στη δεξιά εσωτερική πλευρά. Βάλε το ίδιο με τα αριστερά για συμμετρία." />
        </Grid>
      </Group>

      {/* --------------------------------------------------- border & shadow */}
      <Group
        title="Πλαίσιο, γωνίες & σκιά"
        tid="style-group-border"
        icon="Square"
        tip="Περίγραμμα (και ανά πλευρά), στρογγύλεμα γωνιών και σκιά."
        count={countKeys(s, ["radius", "rTL", "rTR", "rBR", "rBL", "borderStyle", "borderW", "borderC", "bwT", "bwR", "bwB", "bwL", "shadow"])}
      >
        <OptNum label="Στρογγύλεμα γωνιών" tip="Σε pixel. Μεγάλες τιμές δίνουν σχήμα «χαπάκι»." value={s.radius} onChange={set("radius")} min={0} max={120} suffix="px" preset={16} />
        <div className="rounded-lg border border-white/[0.07] p-3">
          <p className="mb-3 flex items-center text-[11px] font-bold uppercase tracking-[0.14em] text-white/40">
            Γωνίες χωριστά
            <Tip text="Για ασύμμετρα σχήματα, π.χ. στρογγυλό μόνο πάνω-αριστερά. Ό,τι ορίσεις εδώ υπερισχύει του γενικού στρογγυλέματος." />
          </p>
          <Grid>
            <OptNum label="Πάνω αριστερά" value={s.rTL} onChange={set("rTL")} min={0} max={120} suffix="px" preset={16} />
            <OptNum label="Πάνω δεξιά" value={s.rTR} onChange={set("rTR")} min={0} max={120} suffix="px" preset={16} />
          </Grid>
          <div className="mt-4">
            <Grid>
              <OptNum label="Κάτω αριστερά" value={s.rBL} onChange={set("rBL")} min={0} max={120} suffix="px" preset={16} />
              <OptNum label="Κάτω δεξιά" value={s.rBR} onChange={set("rBR")} min={0} max={120} suffix="px" preset={16} />
            </Grid>
          </div>
        </div>

        <Grid>
          <Row label="Στυλ περιγράμματος" tip="Ισχύει για όλες τις πλευρές που έχουν πάχος.">
            <Select value={s.borderStyle || ""} onChange={(v) => set("borderStyle")(v || undefined)} options={BORDER_STYLES} />
          </Row>
          <OptNum label="Πάχος (όλες οι πλευρές)" tip="Βάλε 0 για να εξαφανίσεις ένα περίγραμμα που υπάρχει από το θέμα." value={s.borderW} onChange={set("borderW")} min={0} max={16} suffix="px" preset={1} />
        </Grid>
        <Row label="Χρώμα περιγράμματος" tip="Αν το αφήσεις κενό μπαίνει ένα διακριτικό λευκό ημιδιάφανο.">
          <ColorInput value={s.borderC || ""} onChange={(v) => set("borderC")(v || undefined)} />
        </Row>

        <div className="rounded-lg border border-white/[0.07] p-3">
          <p className="mb-3 flex items-center text-[11px] font-bold uppercase tracking-[0.14em] text-white/40">
            Πλευρές χωριστά
            <Tip text="Για γραμμές σε μία μόνο πλευρά, π.χ. μια λεπτή γραμμή μόνο κάτω σαν διαχωριστικό. Υπερισχύει του γενικού πάχους." />
          </p>
          <Grid>
            <OptNum label="Πάνω" value={s.bwT} onChange={set("bwT")} min={0} max={16} suffix="px" preset={1} />
            <OptNum label="Κάτω" value={s.bwB} onChange={set("bwB")} min={0} max={16} suffix="px" preset={1} />
          </Grid>
          <div className="mt-4">
            <Grid>
              <OptNum label="Αριστερά" value={s.bwL} onChange={set("bwL")} min={0} max={16} suffix="px" preset={1} />
              <OptNum label="Δεξιά" value={s.bwR} onChange={set("bwR")} min={0} max={16} suffix="px" preset={1} />
            </Grid>
          </div>
        </div>

        <Row label="Σκιά" tip="Έτοιμες σκιές, ή «Δική μου...» για πλήρη έλεγχο σε θέση, θόλωμα και χρώμα.">
          <Select value={s.shadow || ""} onChange={(v) => set("shadow")(v || undefined)} options={SHADOWS} />
        </Row>
        {s.shadow === "custom" && (
          <div className="rounded-lg border border-white/[0.07] p-3">
            <Grid>
              <OptNum label="Μετατόπιση X" value={s.shX} onChange={set("shX")} min={-80} max={80} suffix="px" preset={0} tip="Πόσο δεξιά/αριστερά πέφτει η σκιά." />
              <OptNum label="Μετατόπιση Y" value={s.shY} onChange={set("shY")} min={-80} max={120} suffix="px" preset={18} tip="Πόσο πάνω/κάτω πέφτει η σκιά." />
            </Grid>
            <div className="mt-4">
              <Grid>
                <OptNum label="Θόλωμα" value={s.shBlur} onChange={set("shBlur")} min={0} max={160} suffix="px" preset={40} tip="Μεγάλο θόλωμα = απαλή, διάχυτη σκιά." />
                <OptNum label="Άπλωμα" value={s.shSpread} onChange={set("shSpread")} min={-40} max={60} suffix="px" preset={0} tip="Μεγαλώνει ή μικραίνει τη σκιά ομοιόμορφα." />
              </Grid>
            </div>
            <div className="mt-4">
              <Row label="Χρώμα σκιάς" tip="Δέχεται και rgba() για διαφάνεια, π.χ. rgba(0,0,0,.6)">
                <ColorInput value={s.shColor || ""} onChange={(v) => set("shColor")(v || undefined)} />
              </Row>
            </div>
          </div>
        )}
      </Group>

      {/* -------------------------------------------------------------- hover */}
      <Group
        title="Όταν περνάς το ποντίκι (hover)"
        tid="style-group-hover"
        icon="MousePointer2"
        tip="Πώς αντιδρά το στοιχείο στο ποντίκι. Ισχύει μόνο σε desktop — στα κινητά δεν υπάρχει hover."
        count={hoverCount}
      >
        <p className="flex items-start gap-2 rounded-lg bg-white/[0.03] px-3 py-2 text-[11px] leading-relaxed text-white/40">
          <Icons.Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#60d6ff]/70" />
          Ό,τι αφήνεις κενό μένει όπως είναι. Η κίνηση γίνεται πάντα ομαλά — τη ταχύτητα τη ρυθμίζεις στο τέλος.
        </p>

        <Grid>
          <Row label="Χρώμα κειμένου" tip="Το χρώμα των γραμμάτων όταν περνάς το ποντίκι.">
            <ColorInput value={hv.color || ""} onChange={(v) => setH("color")(v || undefined)} />
          </Row>
          <Row label="Χρώμα φόντου" tip="Το φόντο του στοιχείου όταν περνάς το ποντίκι.">
            <ColorInput value={hv.bg || ""} onChange={(v) => setH("bg")(v || undefined)} />
          </Row>
        </Grid>

        <Grid>
          <OptNum tid="opt-hv-lift" label="Ανασήκωμα" tip="Σηκώνει το στοιχείο λίγα pixel προς τα πάνω. 4-8px δίνει το κλασικό «ζωντανό» αποτέλεσμα σε κάρτες." value={hv.lift} onChange={setH("lift")} min={0} max={40} suffix="px" preset={6} />
          <OptNum tid="opt-hv-scale" label="Μεγέθυνση" tip="Μεγαλώνει ελαφρώς το στοιχείο. 103-105% είναι διακριτικό, πάνω από 115% γίνεται υπερβολικό." value={hv.scale} onChange={setH("scale")} min={50} max={200} suffix="%" preset={104} />
        </Grid>
        <Grid>
          <OptNum tid="opt-hv-glow" label="Λάμψη" tip="Φωτεινό γλόου γύρω από το στοιχείο. Το χρώμα το ορίζεις παρακάτω." value={hv.glow} onChange={setH("glow")} min={0} max={90} suffix="px" preset={30} />
          <Row label="Χρώμα λάμψης" testId="opt-hv-glowc" tip="Αν το αφήσεις κενό, χρησιμοποιεί το γαλάζιο του Studio.">
            <ColorInput value={hv.glowC || ""} onChange={(v) => setH("glowC")(v || undefined)} />
          </Row>
        </Grid>
        <Grid>
          <OptNum label="Περιστροφή" tip="Γέρνει το στοιχείο στο hover. Λίγες μοίρες φτάνουν." value={hv.rotate} onChange={setH("rotate")} min={-45} max={45} suffix="°" preset={2} />
          <OptNum label="Διαφάνεια" tip="Χρήσιμο για λογότυπα που «ανάβουν» από ξεθωριασμένα σε πλήρη." value={hv.opacity} onChange={setH("opacity")} min={0} max={100} suffix="%" preset={100} />
        </Grid>

        <Grid>
          <OptNum label="Πάχος περιγράμματος" tip="Το πάχος του περιγράμματος στο hover." value={hv.borderW} onChange={setH("borderW")} min={0} max={12} suffix="px" preset={1} />
          <Row label="Χρώμα περιγράμματος" tip="Το πιο διακριτικό hover: μόνο το περίγραμμα φωτίζει.">
            <ColorInput value={hv.borderC || ""} onChange={(v) => setH("borderC")(v || undefined)} />
          </Row>
        </Grid>
        <Grid>
          <OptNum label="Στρογγύλεμα" tip="Αλλάζει τις γωνίες στο hover." value={hv.radius} onChange={setH("radius")} min={0} max={120} suffix="px" preset={16} />
          <OptNum label="Ασπρόμαυρο" tip="Βάλε 0% ώστε ένα ασπρόμαυρο λογότυπο να παίρνει τα χρώματά του στο hover." value={hv.grayscale} onChange={setH("grayscale")} min={0} max={100} suffix="%" preset={0} />
        </Grid>

        <Grid>
          <Row label="Σκιά" tip="Έτοιμη σκιά στο hover. Αν έχεις βάλει «Λάμψη», η λάμψη υπερισχύει.">
            <Select value={hv.shadow || ""} onChange={(v) => setH("shadow")(v || undefined)} options={SHADOWS.filter((o) => o.value !== "custom")} />
          </Row>
          <Row label="Δείκτης ποντικιού" tip="Το «δάχτυλο» δηλώνει στον επισκέπτη ότι το στοιχείο πατιέται.">
            <Select value={hv.cursor || ""} onChange={(v) => setH("cursor")(v || undefined)} options={CURSORS} />
          </Row>
        </Grid>

        <OptNum label="Ταχύτητα κίνησης" tip="Πόσο γρήγορα γίνεται η αλλαγή. 150-250ms είναι το γλυκό σημείο· πάνω από 500ms μοιάζει νωθρό." value={hv.speed} onChange={setH("speed")} min={0} max={900} step={10} suffix="ms" preset={220} />

        {hoverCount > 0 && (
          <button
            type="button"
            data-testid="hover-reset"
            onClick={() => onSet(path, dev, "hover", undefined)}
            className="w-full rounded-xl border border-red-500/25 py-2 text-[11.5px] font-semibold text-red-300/75 transition-colors hover:border-red-500/60 hover:text-red-200"
          >
            Καθάρισε τα hover εφέ
          </button>
        )}
      </Group>
    </div>
  );
};

export default StyleEditor;
