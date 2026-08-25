import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import * as Icons from "lucide-react";
import { toast } from "sonner";
import { api, mediaSrc } from "@/studio/api";
import { move } from "@/studio/util";

/* ------------------------------------------------------------------ language */
export const EditLangContext = createContext({ editLang: "el", setEditLang: () => {} });
export const useEditLang = () => useContext(EditLangContext);

/* ------------------------------------------------------------------ tooltip */
/**
 * Small, quiet "?" that explains a setting. Pure CSS hover (no state, no
 * layout shift) so it never gets in the way while editing.
 */
export const Tip = ({ text, align = "left" }) => {
  if (!text) return null;
  return (
    <span className="group relative ml-1.5 inline-flex shrink-0 align-middle">
      <span className="inline-flex h-[15px] w-[15px] cursor-help items-center justify-center rounded-full border border-white/15 text-white/35 transition-colors group-hover:border-[#60d6ff]/70 group-hover:text-[#60d6ff]">
        <Icons.Info className="h-[9px] w-[9px]" />
      </span>
      <span
        role="tooltip"
        className={`pointer-events-none absolute top-[21px] z-[60] w-[236px] rounded-xl border border-[#60d6ff]/25 bg-[#0c1218] px-3 py-2.5 text-[11px] font-medium normal-case leading-relaxed tracking-normal text-white/75 opacity-0 shadow-[0_18px_50px_-18px_rgba(0,0,0,.9)] transition-opacity duration-150 group-hover:opacity-100 ${
          align === "right" ? "right-0" : "left-0"
        }`}
      >
        {text}
      </span>
    </span>
  );
};

/* ------------------------------------------------------------------ shells */
export const Panel = ({ title, hint, tip, children, right }) => (
  <section className="rounded-2xl border border-white/10 bg-[#0b0b0f]">
    <header className="flex items-start justify-between gap-4 border-b border-white/[0.07] px-5 py-4">
      <div>
        <h3 className="flex items-center font-display text-[15px] font-bold tracking-tight text-white">
          {title}
          <Tip text={tip} />
        </h3>
        {hint && <p className="mt-1 text-[11.5px] leading-relaxed text-white/40">{hint}</p>}
      </div>
      {right}
    </header>
    <div className="space-y-5 px-5 py-5">{children}</div>
  </section>
);

export const Row = ({ label, hint, tip, children, htmlFor, testId }) => (
  <div className="min-w-0" data-testid={testId}>
    {label && (
      <div className="mb-2 flex items-center">
        <label htmlFor={htmlFor} className="text-[10.5px] font-bold uppercase tracking-[0.16em] text-white/45">
          {label}
        </label>
        <Tip text={tip} />
      </div>
    )}
    {children}
    {hint && <p className="mt-1.5 text-[11px] leading-relaxed text-white/30">{hint}</p>}
  </div>
);

export const Grid = ({ cols = 2, children }) => (
  <div className={`grid gap-4 ${cols === 3 ? "sm:grid-cols-3" : cols === 2 ? "sm:grid-cols-2" : ""}`}>{children}</div>
);

const inputCls =
  "w-full rounded-xl border border-white/12 bg-white/[0.03] px-3.5 py-2.5 text-[13.5px] text-white outline-none transition-colors placeholder:text-white/25 focus:border-[#60d6ff]/70";

/* ------------------------------------------------------------------ inputs */
export const TextInput = ({ value, onChange, ...rest }) => (
  <input className={inputCls} value={value ?? ""} onChange={(e) => onChange(e.target.value)} {...rest} />
);

export const TextArea = ({ value, onChange, rows = 3, ...rest }) => (
  <textarea className={`${inputCls} resize-y leading-relaxed`} rows={rows} value={value ?? ""} onChange={(e) => onChange(e.target.value)} {...rest} />
);

export const NumberInput = ({ value, onChange, min, max, step = 1, ...rest }) => (
  <input
    type="number"
    className={inputCls}
    value={value ?? 0}
    min={min}
    max={max}
    step={step}
    onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))}
    {...rest}
  />
);

export const Slider = ({ value, onChange, min = 0, max = 100, step = 1, suffix = "" }) => (
  <div className="flex items-center gap-3">
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value ?? min}
      onChange={(e) => onChange(Number(e.target.value))}
      className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/12 accent-[#60d6ff]"
      style={{ accentColor: "#60d6ff" }}
    />
    <span className="w-16 shrink-0 text-right text-[12px] font-semibold tabular-nums text-white/60">
      {value}
      {suffix}
    </span>
  </div>
);

export const Toggle = ({ value, onChange, label, hint, tip }) => (
  <button
    type="button"
    onClick={() => onChange(!value)}
    className="flex w-full items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 text-left transition-colors hover:border-white/20"
  >
    <span className="min-w-0">
      <span className="flex items-center text-[13px] font-semibold text-white/85">
        {label}
        <Tip text={tip} />
      </span>
      {hint && <span className="mt-0.5 block text-[11px] text-white/35">{hint}</span>}
    </span>
    <span className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${value ? "bg-[#60d6ff]" : "bg-white/15"}`}>
      <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${value ? "left-[18px]" : "left-0.5"}`} />
    </span>
  </button>
);

export const Select = ({ value, onChange, options }) => (
  <select className={inputCls} value={value ?? ""} onChange={(e) => onChange(e.target.value)}>
    {options.map((o) => (
      <option key={o.value} value={o.value} className="bg-[#0b0b0f]">
        {o.label}
      </option>
    ))}
  </select>
);

export const ColorInput = ({ value, onChange }) => (
  <div className="flex items-center gap-2.5">
    <input
      type="color"
      value={/^#[0-9a-fA-F]{6}$/.test(value || "") ? value : "#60d6ff"}
      onChange={(e) => onChange(e.target.value)}
      className="h-10 w-12 shrink-0 cursor-pointer rounded-lg border border-white/12 bg-transparent p-1"
    />
    <input type="text" className={inputCls} value={value ?? ""} onChange={(e) => onChange(e.target.value)} placeholder="#60d6ff" />
  </div>
);

/* ------------------------------------------------------------------ bilingual */
const LangTag = ({ children }) => (
  <span className="mr-2 inline-flex h-[18px] w-[26px] shrink-0 items-center justify-center rounded-md bg-white/10 text-[9.5px] font-extrabold tracking-wider text-white/60">
    {children}
  </span>
);

export const Bi = ({ label, hint, value, onChange, rows, placeholder }) => {
  const { editLang } = useEditLang();
  const val = value && typeof value === "object" ? value : { el: value || "", en: "" };
  const set = (lang) => (v) => onChange({ ...val, [lang]: v });
  const Field = rows ? TextArea : TextInput;

  const one = (lang) => (
    <div className="flex items-start gap-0">
      <div className="pt-3">
        <LangTag>{lang.toUpperCase()}</LangTag>
      </div>
      <div className="flex-1">
        <Field value={val[lang]} onChange={set(lang)} rows={rows} placeholder={placeholder} />
      </div>
    </div>
  );

  return (
    <Row label={label} hint={hint}>
      {editLang === "both" ? (
        <div className="space-y-2">
          {one("el")}
          {one("en")}
        </div>
      ) : (
        <Field value={val[editLang]} onChange={set(editLang)} rows={rows} placeholder={placeholder} />
      )}
    </Row>
  );
};

/* ------------------------------------------------------------------ icon picker */
const ICON_SET = [
  "Store", "ShoppingCart", "ShoppingBag", "Coffee", "CupSoda", "Beer", "Wine", "Martini", "IceCream", "IceCreamCone",
  "Pizza", "Sandwich", "Salad", "Soup", "Fish", "Beef", "Drumstick", "EggFried", "Croissant", "Cake", "CakeSlice",
  "Cookie", "Donut", "ChefHat", "Utensils", "UtensilsCrossed", "Flame", "Leaf", "Apple", "Carrot", "Wheat", "Milk",
  "Scissors", "Shirt", "Footprints", "Watch", "Gem", "Glasses", "Sparkles", "Heart", "Star", "Crown", "Palette",
  "Camera", "Video", "Film", "Clapperboard", "Mic", "Music", "Headphones", "Radio", "Tv", "Play", "Image",
  "Car", "CarFront", "Bike", "Bus", "Truck", "Fuel", "Wrench", "Hammer", "Paintbrush", "Ruler", "Home", "Building",
  "Building2", "Hotel", "Umbrella", "Sun", "Waves", "Plane", "Ship", "Luggage", "MapPin", "Map", "Compass",
  "Dumbbell", "Bike as Cycle", "Trophy", "Target", "Rocket", "TrendingUp", "BarChart3", "PieChart", "LineChart",
  "Users", "User", "UserPlus", "Handshake", "MessageCircle", "Mail", "Phone", "Send", "Megaphone", "Bell",
  "CalendarCheck", "Calendar", "Clock", "Timer", "CheckCircle2", "BadgeCheck", "Award", "Gift", "Package",
  "CreditCard", "Wallet", "Coins", "Receipt", "Tag", "Percent", "Printer", "Laptop", "Smartphone", "Monitor",
  "Wifi", "Globe", "Zap", "Lightbulb", "Brush", "PenTool", "Layers", "Grid3x3", "Baby", "PawPrint", "Dog", "Cat",
  "Flower2", "TreePine", "Stethoscope", "Pill", "Syringe", "Bath", "Bed", "Sofa", "Lamp", "Key", "Lock", "Shield",
].filter((n) => Icons[n]);

export const IconPicker = ({ value, onChange, label = "Εικονίδιο" }) => {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const Current = Icons[value] || Icons.Store;
  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return ICON_SET.slice(0, 60);
    return Object.keys(Icons)
      .filter((n) => /^[A-Z]/.test(n) && n.toLowerCase().includes(needle) && typeof Icons[n] === "function")
      .slice(0, 60);
  }, [q]);

  return (
    <Row label={label}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-3 rounded-xl border border-white/12 bg-white/[0.03] px-3.5 py-2.5 text-left transition-colors hover:border-white/25"
      >
        <Current className="h-4 w-4 text-[#60d6ff]" />
        <span className="flex-1 text-[13px] text-white/80">{value || "Store"}</span>
        <Icons.ChevronDown className={`h-4 w-4 text-white/40 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="mt-2 rounded-xl border border-white/12 bg-[#08080b] p-3">
          <input className={inputCls} placeholder="Αναζήτηση εικονιδίου..." value={q} onChange={(e) => setQ(e.target.value)} />
          <div className="mt-3 grid max-h-56 grid-cols-8 gap-1.5 overflow-y-auto">
            {list.map((n) => {
              const I = Icons[n];
              return (
                <button
                  key={n}
                  type="button"
                  title={n}
                  onClick={() => {
                    onChange(n);
                    setOpen(false);
                  }}
                  className={`flex h-9 items-center justify-center rounded-lg border transition-colors ${
                    value === n ? "border-[#60d6ff] bg-[#60d6ff]/10" : "border-white/8 hover:border-white/25"
                  }`}
                >
                  <I className="h-4 w-4 text-white/70" />
                </button>
              );
            })}
          </div>
        </div>
      )}
    </Row>
  );
};

/* ------------------------------------------------------------------ image picker */
const BG_OPTIONS = [
  { value: "none", label: "Καθόλου (όπως είναι)" },
  { value: "auto", label: "Αυτόματο" },
  { value: "white", label: "Αφαίρεση λευκού" },
  { value: "black", label: "Αφαίρεση μαύρου" },
];
const SHAPE_OPTIONS = [
  { value: "none", label: "Ελεύθερο" },
  { value: "rounded", label: "Στρογγυλεμένο πλακίδιο" },
  { value: "circle", label: "Κύκλος" },
];

const defaultOpts = {
  remove_bg: "none",
  tolerance: 28,
  trim: false,
  brightness: 1,
  contrast: 1,
  saturation: 1,
  shape: "none",
  radius_pct: 22,
  pad_pct: 0,
  max_dim: 640,
};

export const ImagePicker = ({ value, onChange, label = "Εικόνα", hint }) => {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [opts, setOpts] = useState(defaultOpts);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [library, setLibrary] = useState(null);
  const inputRef = useRef(null);

  const doUpload = async () => {
    if (!file) return;
    setBusy(true);
    try {
      const r = await api.uploadMedia(file, opts);
      setResult(r);
      toast.success("Έτοιμο — δες το αποτέλεσμα");
    } catch (e) {
      toast.error(e.message || "Η μεταφόρτωση απέτυχε");
    } finally {
      setBusy(false);
    }
  };

  const openLibrary = async () => {
    try {
      const r = await api.media();
      setLibrary(r.items || []);
    } catch (e) {
      toast.error(e.message || "Σφάλμα βιβλιοθήκης");
    }
  };

  return (
    <Row label={label} hint={hint}>
      <div className="flex items-center gap-3">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2216%22 height=%2216%22><rect width=%228%22 height=%228%22 fill=%22%23151519%22/><rect x=%228%22 y=%228%22 width=%228%22 height=%228%22 fill=%22%23151519%22/></svg>')]">
          {value ? (
            <img src={mediaSrc(value)} alt="" className="max-h-14 max-w-14 object-contain" />
          ) : (
            <Icons.ImageOff className="h-5 w-5 text-white/25" />
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setOpen(true)} className="rounded-lg bg-white px-3 py-2 text-[12px] font-bold text-black">
            Ανέβασε
          </button>
          <button
            type="button"
            onClick={() => {
              setOpen(true);
              openLibrary();
            }}
            className="rounded-lg border border-white/15 px-3 py-2 text-[12px] font-semibold text-white/70 hover:border-white/35"
          >
            Βιβλιοθήκη
          </button>
          {value && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="rounded-lg border border-red-500/30 px-3 py-2 text-[12px] font-semibold text-red-300/80 hover:border-red-500/60"
            >
              Αφαίρεση
            </button>
          )}
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-sm sm:p-8">
          <div className="w-full max-w-3xl rounded-2xl border border-white/12 bg-[#0a0a0e] p-5 sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <h4 className="font-display text-base font-bold">Εικόνα / Λογότυπο</h4>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  setResult(null);
                  setFile(null);
                  setLibrary(null);
                }}
                className="rounded-lg p-1.5 text-white/50 hover:bg-white/10 hover:text-white"
              >
                <Icons.X className="h-5 w-5" />
              </button>
            </div>

            {library ? (
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-[12px] text-white/50">{library.length} αρχεία στη βιβλιοθήκη</p>
                  <button type="button" onClick={() => setLibrary(null)} className="text-[12px] font-semibold text-[#60d6ff]">
                    ← Νέο upload
                  </button>
                </div>
                <div className="grid max-h-[60vh] grid-cols-3 gap-3 overflow-y-auto sm:grid-cols-5">
                  {library.map((m) => (
                    <div key={m.id} className="group relative">
                      <button
                        type="button"
                        onClick={() => {
                          onChange(m.url);
                          setOpen(false);
                          setLibrary(null);
                          toast.success("Επιλέχθηκε");
                        }}
                        className="flex h-20 w-full items-center justify-center rounded-xl border border-white/10 bg-black/40 p-2 hover:border-[#60d6ff]/60"
                      >
                        <img src={mediaSrc(m.url)} alt="" className="max-h-16 max-w-full object-contain" />
                      </button>
                      <button
                        type="button"
                        title="Διαγραφή"
                        onClick={async () => {
                          try {
                            await api.deleteMedia(m.id);
                            setLibrary((l) => l.filter((x) => x.id !== m.id));
                          } catch (e) {
                            toast.error(e.message);
                          }
                        }}
                        className="absolute -right-1.5 -top-1.5 hidden rounded-full bg-red-500 p-1 text-white group-hover:block"
                      >
                        <Icons.Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  {!library.length && <p className="col-span-full py-8 text-center text-[13px] text-white/40">Άδεια βιβλιοθήκη</p>}
                </div>
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-[1fr_220px]">
                <div className="space-y-4">
                  <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/20 py-8 text-center transition-colors hover:border-[#60d6ff]/60"
                  >
                    <Icons.UploadCloud className="h-6 w-6 text-white/40" />
                    <span className="text-[13px] font-semibold text-white/70">{file ? file.name : "Διάλεξε αρχείο εικόνας"}</span>
                    <span className="text-[11px] text-white/35">PNG, JPG, WEBP — έως 8MB</span>
                  </button>
                  <input
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      setFile(e.target.files?.[0] || null);
                      setResult(null);
                    }}
                  />

                  <div className="space-y-3.5 rounded-xl border border-white/10 p-4">
                    <p className="text-[10.5px] font-bold uppercase tracking-[0.16em] text-white/45">Προαιρετική επεξεργασία</p>
                    <Row label="Φόντο">
                      <Select value={opts.remove_bg} onChange={(v) => setOpts({ ...opts, remove_bg: v })} options={BG_OPTIONS} />
                    </Row>
                    {opts.remove_bg !== "none" && (
                      <Row label="Ανοχή φόντου">
                        <Slider value={opts.tolerance} onChange={(v) => setOpts({ ...opts, tolerance: v })} min={2} max={90} />
                      </Row>
                    )}
                    <Toggle value={opts.trim} onChange={(v) => setOpts({ ...opts, trim: v })} label="Κόψε τα κενά γύρω-γύρω" />
                    <Row label="Σχήμα">
                      <Select value={opts.shape} onChange={(v) => setOpts({ ...opts, shape: v })} options={SHAPE_OPTIONS} />
                    </Row>
                    {opts.shape === "rounded" && (
                      <Row label="Στρογγύλεμα">
                        <Slider value={opts.radius_pct} onChange={(v) => setOpts({ ...opts, radius_pct: v })} min={0} max={50} suffix="%" />
                      </Row>
                    )}
                    <Row label="Φωτεινότητα">
                      <Slider value={opts.brightness} onChange={(v) => setOpts({ ...opts, brightness: v })} min={0.4} max={2.2} step={0.05} />
                    </Row>
                    <Row label="Αντίθεση">
                      <Slider value={opts.contrast} onChange={(v) => setOpts({ ...opts, contrast: v })} min={0.4} max={2.2} step={0.05} />
                    </Row>
                    <Row label="Κορεσμός χρώματος">
                      <Slider value={opts.saturation} onChange={(v) => setOpts({ ...opts, saturation: v })} min={0} max={2.2} step={0.05} />
                    </Row>
                    <Row label="Περιθώριο">
                      <Slider value={opts.pad_pct} onChange={(v) => setOpts({ ...opts, pad_pct: v })} min={0} max={30} suffix="%" />
                    </Row>
                    <button
                      type="button"
                      onClick={() => setOpts(defaultOpts)}
                      className="text-[11.5px] font-semibold text-white/40 underline hover:text-white/70"
                    >
                      Επαναφορά ρυθμίσεων
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-[10.5px] font-bold uppercase tracking-[0.16em] text-white/45">Αποτέλεσμα</p>
                  <div className="flex h-40 items-center justify-center rounded-xl border border-white/10 bg-black/50 p-3">
                    {result ? (
                      <img src={mediaSrc(result.url)} alt="" className="max-h-full max-w-full object-contain" />
                    ) : (
                      <span className="text-[12px] text-white/30">Πάτα «Δοκίμασε»</span>
                    )}
                  </div>
                  <button
                    type="button"
                    disabled={!file || busy}
                    onClick={doUpload}
                    className="w-full rounded-xl border border-white/15 py-2.5 text-[12.5px] font-bold text-white/85 disabled:opacity-40"
                  >
                    {busy ? "Επεξεργασία..." : "Δοκίμασε"}
                  </button>
                  <button
                    type="button"
                    disabled={!result}
                    onClick={() => {
                      onChange(result.url);
                      setOpen(false);
                      setResult(null);
                      setFile(null);
                      toast.success("Η εικόνα μπήκε");
                    }}
                    className="w-full rounded-xl bg-white py-2.5 text-[12.5px] font-bold text-black disabled:opacity-40"
                  >
                    Χρήση αυτής
                  </button>
                  {result && (
                    <p className="text-center text-[11px] text-white/35">
                      {result.width}×{result.height}px · {Math.round(result.size / 1024)}KB
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </Row>
  );
};

/* ------------------------------------------------------------------ list editor */
export const ListEditor = ({
  items,
  onChange,
  titleOf,
  subtitleOf,
  renderItem,
  newItem,
  addLabel = "Προσθήκη",
  emptyLabel = "Κανένα στοιχείο",
  max = 200,
}) => {
  const list = Array.isArray(items) ? items : [];
  const [openIdx, setOpenIdx] = useState(null);
  const dragIdx = useRef(null);

  const setItem = (i) => (patch) => {
    const next = [...list];
    next[i] = typeof patch === "function" ? patch(next[i]) : patch;
    onChange(next);
  };

  const remove = (i) => {
    if (!window.confirm("Να διαγραφεί;")) return;
    onChange(list.filter((_, x) => x !== i));
    setOpenIdx(null);
  };

  const duplicate = (i) => {
    const copy = JSON.parse(JSON.stringify(list[i]));
    if (copy.id) copy.id = `${copy.id}-copy${Math.random().toString(36).slice(2, 5)}`;
    onChange([...list.slice(0, i + 1), copy, ...list.slice(i + 1)]);
  };

  return (
    <div className="space-y-2.5">
      {list.map((it, i) => {
        const open = openIdx === i;
        const hidden = it?.visible === false;
        return (
          <div
            key={it?.id || i}
            draggable
            onDragStart={() => {
              dragIdx.current = i;
            }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => {
              if (dragIdx.current === null || dragIdx.current === i) return;
              onChange(move(list, dragIdx.current, i));
              dragIdx.current = null;
              setOpenIdx(null);
            }}
            className={`rounded-xl border bg-white/[0.02] transition-colors ${open ? "border-[#60d6ff]/40" : "border-white/10"}`}
          >
            <div className="flex items-center gap-2 px-3 py-2.5">
              <Icons.GripVertical className="h-4 w-4 shrink-0 cursor-grab text-white/25" />
              <button type="button" onClick={() => setOpenIdx(open ? null : i)} className="flex-1 text-left">
                <span className={`block truncate text-[13px] font-semibold ${hidden ? "text-white/30 line-through" : "text-white/85"}`}>
                  {titleOf ? titleOf(it, i) : `#${i + 1}`}
                </span>
                {subtitleOf && <span className="mt-0.5 block truncate text-[11px] text-white/35">{subtitleOf(it, i)}</span>}
              </button>
              {"visible" in (it || {}) && (
                <button
                  type="button"
                  title={hidden ? "Εμφάνιση" : "Κρύψιμο"}
                  onClick={() => setItem(i)({ ...it, visible: hidden })}
                  className="rounded-lg p-1.5 text-white/40 hover:bg-white/10 hover:text-white"
                >
                  {hidden ? <Icons.EyeOff className="h-4 w-4" /> : <Icons.Eye className="h-4 w-4" />}
                </button>
              )}
              <button
                type="button"
                title="Αντίγραφο"
                onClick={() => duplicate(i)}
                className="rounded-lg p-1.5 text-white/40 hover:bg-white/10 hover:text-white"
              >
                <Icons.Copy className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                title="Διαγραφή"
                onClick={() => remove(i)}
                className="rounded-lg p-1.5 text-white/40 hover:bg-red-500/15 hover:text-red-300"
              >
                <Icons.Trash2 className="h-3.5 w-3.5" />
              </button>
              <button type="button" onClick={() => setOpenIdx(open ? null : i)} className="rounded-lg p-1.5 text-white/40 hover:text-white">
                <Icons.ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
              </button>
            </div>
            {open && <div className="space-y-4 border-t border-white/[0.07] px-4 py-4">{renderItem(it, i, setItem(i))}</div>}
          </div>
        );
      })}

      {!list.length && <p className="rounded-xl border border-dashed border-white/12 py-6 text-center text-[12.5px] text-white/35">{emptyLabel}</p>}

      {newItem && list.length < max && (
        <button
          type="button"
          onClick={() => {
            onChange([...list, newItem()]);
            setOpenIdx(list.length);
          }}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-white/20 py-3 text-[12.5px] font-bold text-white/60 transition-colors hover:border-[#60d6ff]/60 hover:text-white"
        >
          <Icons.Plus className="h-4 w-4" />
          {addLabel}
        </button>
      )}
    </div>
  );
};

export const useDebounced = (value, ms = 200) => {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
};
