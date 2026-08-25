/** Runs INSIDE the preview iframe: hover highlight, click-to-select, drag-to-move. */
import { useEffect, useRef } from "react";
import { useContent } from "@/content/ContentContext";
import { getIn } from "@/studio/util";

const OUTLINE = "2px solid #60d6ff";
const post = (msg) => {
  try {
    window.parent?.postMessage(msg, "*");
  } catch {
    /* ignore */
  }
};

const makeLayer = () => {
  const box = document.createElement("div");
  box.style.cssText =
    "position:fixed;pointer-events:none;z-index:2147483000;border-radius:8px;transition:opacity .12s ease;opacity:0;box-sizing:border-box";
  const tag = document.createElement("div");
  tag.style.cssText =
    "position:fixed;pointer-events:none;z-index:2147483001;background:#60d6ff;color:#04121a;font:700 11px/1.5 ui-sans-serif,system-ui,sans-serif;padding:2px 7px;border-radius:6px;white-space:nowrap;opacity:0;transition:opacity .12s ease";
  document.body.appendChild(box);
  document.body.appendChild(tag);
  return { box, tag };
};

export const PreviewBridge = () => {
  const { content } = useContent();
  const contentRef = useRef(content);
  contentRef.current = content;

  const state = useRef({ edit: true, device: "desktop", selected: null, hover: null, drag: null });

  useEffect(() => {
    const hoverL = makeLayer();
    const selL = makeLayer();
    selL.box.style.border = OUTLINE;
    selL.box.style.boxShadow = "0 0 0 4px rgba(96,214,255,.16)";
    hoverL.box.style.border = "1.5px dashed rgba(96,214,255,.75)";
    selL.tag.style.background = "#60d6ff";
    hoverL.tag.style.background = "rgba(96,214,255,.85)";

    /* geometry signatures, so we only touch the DOM when something really moved */
    const lastGeom = { sel: "", hov: "" };

    const place = (layer, el, label, key = "sel") => {
      if (!el || !el.isConnected) {
        if (lastGeom[key] !== "off") {
          layer.box.style.opacity = "0";
          layer.tag.style.opacity = "0";
          lastGeom[key] = "off";
        }
        return;
      }
      const r = el.getBoundingClientRect();
      const sig = `${Math.round(r.left)}|${Math.round(r.top)}|${Math.round(r.width)}|${Math.round(r.height)}|${label || ""}`;
      if (sig === lastGeom[key]) return;
      lastGeom[key] = sig;
      layer.box.style.left = `${r.left - 3}px`;
      layer.box.style.top = `${r.top - 3}px`;
      layer.box.style.width = `${r.width + 6}px`;
      layer.box.style.height = `${r.height + 6}px`;
      layer.box.style.opacity = "1";
      layer.tag.textContent = label || "";
      layer.tag.style.left = `${Math.max(4, r.left - 3)}px`;
      layer.tag.style.top = `${Math.max(4, r.top - 24)}px`;
      layer.tag.style.opacity = label ? "1" : "0";
    };

    const find = (target) => (target instanceof Element ? target.closest("[data-sg]") : null);
    const info = (el) => ({
      path: el.getAttribute("data-sg"),
      kind: el.getAttribute("data-sg-kind") || "box",
      label: el.getAttribute("data-sg-label") || el.getAttribute("data-sg"),
    });

    /* cached element lookups — querySelector on every animation frame was the jank */
    const slots = { sel: { path: null, el: null }, hov: { path: null, el: null } };
    const resolve = (slot, path) => {
      if (!path) {
        slot.path = null;
        slot.el = null;
        return null;
      }
      if (slot.path === path && slot.el && slot.el.isConnected) return slot.el;
      slot.path = path;
      slot.el = document.querySelector(`[data-sg="${path}"]`);
      return slot.el;
    };

    const refresh = () => {
      const s = state.current;
      const selEl = resolve(slots.sel, s.selected);
      place(selL, selEl, selEl ? selEl.getAttribute("data-sg-label") : "", "sel");

      const hovPath = s.hover && s.hover !== s.selected ? s.hover : null;
      const hovEl = resolve(slots.hov, hovPath);
      place(hoverL, hovEl, hovEl ? hovEl.getAttribute("data-sg-label") : "", "hov");
    };

    const onMove = (e) => {
      if (!state.current.edit || state.current.drag) return;
      const el = find(e.target);
      const path = el ? el.getAttribute("data-sg") : null;
      if (path !== state.current.hover) {
        state.current.hover = path;
        refresh();
      } else if (path) {
        refresh();
      }
      document.body.style.cursor = path ? "pointer" : "";
    };

    const onLeave = () => {
      state.current.hover = null;
      refresh();
    };

    const onClick = (e) => {
      if (!state.current.edit) return;
      const el = find(e.target);
      if (!el) return;
      e.preventDefault();
      e.stopPropagation();
      const i = info(el);
      state.current.selected = i.path;
      refresh();
      post({ type: "sg-select", ...i });
    };

    /* ------------------------------------------------------------- drag to move */
    const onDown = (e) => {
      if (!state.current.edit || e.button !== 0) return;
      const el = find(e.target);
      if (!el) return;
      const path = el.getAttribute("data-sg");
      if (el.getAttribute("data-sg-kind") === "section") return;
      const device = state.current.device === "mobile" ? "m" : state.current.device === "tablet" ? "t" : "d";
      const base = getIn(contentRef.current, ["styles", path, device]) || {};
      state.current.drag = {
        el,
        path,
        device,
        startX: e.clientX,
        startY: e.clientY,
        baseX: Number(base.x) || 0,
        baseY: Number(base.y) || 0,
        moved: false,
        lastSent: 0,
      };
    };

    const onDrag = (e) => {
      const d = state.current.drag;
      if (!d) return;
      const dx = e.clientX - d.startX;
      const dy = e.clientY - d.startY;
      if (!d.moved && Math.abs(dx) + Math.abs(dy) < 5) return;
      d.moved = true;
      e.preventDefault();
      document.body.style.cursor = "grabbing";
      const x = Math.round(d.baseX + dx);
      const y = Math.round(d.baseY + dy);
      d.el.style.setProperty("transform", `translate(${x}px,${y}px)`, "important");
      place(selL, d.el, d.el.getAttribute("data-sg-label"));
      const now = performance.now();
      if (now - d.lastSent > 90) {
        d.lastSent = now;
        post({ type: "sg-move", path: d.path, device: d.device, x, y, live: true });
      }
    };

    const onUp = (e) => {
      const d = state.current.drag;
      state.current.drag = null;
      document.body.style.cursor = "";
      if (!d) return;
      if (!d.moved) return;
      const x = Math.round(d.baseX + (e.clientX - d.startX));
      const y = Math.round(d.baseY + (e.clientY - d.startY));
      d.el.style.removeProperty("transform");
      state.current.selected = d.path;
      post({ type: "sg-move", path: d.path, device: d.device, x, y, live: false });
      post({ type: "sg-select", path: d.path, kind: d.el.getAttribute("data-sg-kind") || "box", label: d.el.getAttribute("data-sg-label") || d.path });
      refresh();
    };

    const onMsg = (e) => {
      const m = e?.data;
      if (!m || typeof m !== "object") return;
      if (m.type === "sg-edit-mode") {
        state.current.edit = !!m.edit;
        /* lets the carousel (and anything else) know not to steal mousedown */
        try {
          if (m.edit) document.documentElement.dataset.sgEdit = "1";
          else delete document.documentElement.dataset.sgEdit;
        } catch {
          /* ignore */
        }
        if (!m.edit) {
          state.current.hover = null;
          document.body.style.cursor = "";
        }
        refresh();
      }
      if (m.type === "sg-device") state.current.device = m.device || "desktop";
      if (m.type === "sg-selected") {
        state.current.selected = m.path || null;
        refresh();
      }
      if (m.type === "sg-scroll-to" && m.path) {
        const el = document.querySelector(`[data-sg="${m.path}"]`);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
        state.current.selected = m.path;
        setTimeout(refresh, 420);
      }
    };

    const raf = () => {
      refresh();
      tick = requestAnimationFrame(raf);
    };
    let tick = requestAnimationFrame(raf);

    document.addEventListener("mousemove", onMove, true);
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("click", onClick, true);
    document.addEventListener("mousedown", onDown, true);
    document.addEventListener("mousemove", onDrag, true);
    document.addEventListener("mouseup", onUp, true);
    window.addEventListener("message", onMsg);

    return () => {
      cancelAnimationFrame(tick);
      document.removeEventListener("mousemove", onMove, true);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("mousedown", onDown, true);
      document.removeEventListener("mousemove", onDrag, true);
      document.removeEventListener("mouseup", onUp, true);
      window.removeEventListener("message", onMsg);
      [hoverL, selL].forEach((l) => {
        l.box.remove();
        l.tag.remove();
      });
      document.body.style.cursor = "";
    };
  }, []);

  return null;
};

export default PreviewBridge;
