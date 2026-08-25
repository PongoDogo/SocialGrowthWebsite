/** Immutable deep set/get by dot path, used by every Studio editor. */
export const getIn = (obj, path) => {
  const keys = Array.isArray(path) ? path : String(path).split(".");
  let cur = obj;
  for (const k of keys) {
    if (cur === null || cur === undefined) return undefined;
    cur = cur[k];
  }
  return cur;
};

export const setIn = (obj, path, value) => {
  const keys = Array.isArray(path) ? path : String(path).split(".");
  if (!keys.length) return value;
  const [head, ...rest] = keys;
  const isIndex = /^\d+$/.test(head);
  if (isIndex) {
    const arr = Array.isArray(obj) ? [...obj] : [];
    arr[Number(head)] = rest.length ? setIn(arr[Number(head)], rest, value) : value;
    return arr;
  }
  const base = obj && typeof obj === "object" && !Array.isArray(obj) ? { ...obj } : {};
  base[head] = rest.length ? setIn(base[head], rest, value) : value;
  return base;
};

export const uid = (prefix = "i") => `${prefix}${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-3)}`;

export const slugify = (s) =>
  String(s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 24) || uid("c");

export const move = (arr, from, to) => {
  const out = [...arr];
  const [it] = out.splice(from, 1);
  out.splice(to, 0, it);
  return out;
};

/* --------------------------------------------------------------------- styles
 * A style value set back to "Αυτόματο" stays on the object as `undefined`
 * (setIn cannot delete keys), so anything that counts overrides has to skip
 * those or an element looks "τροποποιημένο" for ever.
 */
const isRealValue = (v) =>
  v !== undefined && v !== null && v !== "" && v !== false && !(typeof v === "number" && Number.isNaN(v));

/** How many real overrides live inside one device config (hover included). */
export const countStyleValues = (devCfg) => {
  if (!devCfg || typeof devCfg !== "object") return 0;
  return Object.entries(devCfg).reduce((n, [k, v]) => {
    if (k === "hover") return n + countStyleValues(v);
    return n + (isRealValue(v) ? 1 : 0);
  }, 0);
};

/** How many real overrides one `styles[path]` entry holds across all devices. */
export const countStyleEntry = (cfg) => ["d", "t", "m"].reduce((sum, dev) => sum + countStyleValues(cfg?.[dev]), 0);

export const fmtDate = (iso) => {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("el-GR", { dateStyle: "medium", timeStyle: "short" });
  } catch {
    return iso;
  }
};
