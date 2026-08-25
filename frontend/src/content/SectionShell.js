/** Shared helpers for rendering sections from editable content. */

/** Visible items, each carrying `_i` = its index inside the original array
 *  (needed so the Studio can edit the right item when you click it in the preview). */
export const visibleItems = (arr) =>
  Array.isArray(arr)
    ? arr.map((it, i) => (it && typeof it === "object" ? { ...it, _i: i } : it)).filter((i) => i?.visible !== false)
    : [];

/** Section order, including custom blocks referenced as "block:<id>". */
export const sectionOrder = (layout, fallback, blocks = []) => {
  const blockIds = (Array.isArray(blocks) ? blocks : []).map((b) => `block:${b.id}`);
  const known = [...fallback, ...blockIds];
  const stored = Array.isArray(layout?.order) && layout.order.length ? layout.order : fallback;
  const order = stored.filter((id) => known.includes(id));
  const missing = known.filter((id) => !order.includes(id));
  const hidden = Array.isArray(layout?.hidden) ? layout.hidden : [];
  return [...order, ...missing].filter((id) => !hidden.includes(id));
};
