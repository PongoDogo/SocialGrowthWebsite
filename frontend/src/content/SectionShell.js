/** Shared helpers for rendering sections from editable content. */
export const visibleItems = (arr) => (Array.isArray(arr) ? arr.filter((i) => i?.visible !== false) : []);

export const sectionOrder = (layout, fallback) => {
  const order = Array.isArray(layout?.order) && layout.order.length ? layout.order : fallback;
  const hidden = Array.isArray(layout?.hidden) ? layout.hidden : [];
  return order.filter((id) => fallback.includes(id) && !hidden.includes(id));
};
