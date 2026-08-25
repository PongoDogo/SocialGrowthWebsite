import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

/**
 * Seamless marquee.
 * - measures one set of children and clones enough copies to cover any viewport,
 *   so the strip can never "run out" of cards
 * - rAF driven: constant px/second on every row, eased pause/resume on hover
 * - all copies stay mounted, so nothing loads while it scrolls into view
 * - optional drag / swipe with inertia (disabled inside the Studio's edit mode,
 *   where mousedown belongs to the click-to-select bridge)
 */
export const Marquee = ({
  children,
  pxPerSecond = 42,
  reverse = false,
  pauseOnHover = true,
  hoverSpeed = 0,
  brake = 7,
  fade = 7,
  className = "",
  padY = 22,
  draggable = false,
}) => {
  const viewRef = useRef(null);
  const setRef = useRef(null);
  const trackRef = useRef(null);
  const hoverRef = useRef(false);
  const visibleRef = useRef(true);
  const posRef = useRef(0);
  const easeRef = useRef(1);
  const dragRef = useRef(null);
  const inertiaRef = useRef(0);
  const movedRef = useRef(false);
  const [dims, setDims] = useState({ set: 0, view: 0 });

  useLayoutEffect(() => {
    let frame = null;
    const measure = () => {
      frame = null;
      const set = setRef.current?.getBoundingClientRect().width || 0;
      const view = viewRef.current?.getBoundingClientRect().width || 0;
      setDims((p) => (Math.abs(p.set - set) > 0.5 || Math.abs(p.view - view) > 0.5 ? { set, view } : p));
    };
    const schedule = () => {
      if (frame === null) frame = requestAnimationFrame(measure);
    };
    measure();
    const ro = new ResizeObserver(schedule);
    if (setRef.current) ro.observe(setRef.current);
    if (viewRef.current) ro.observe(viewRef.current);
    const late = setTimeout(measure, 400);
    return () => {
      ro.disconnect();
      clearTimeout(late);
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    const el = viewRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return undefined;
    const io = new IntersectionObserver(([e]) => { visibleRef.current = e.isIntersecting; }, { rootMargin: "300px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const setW = dims.set;
    if (!setW) return undefined;
    const dir = reverse ? -1 : 1;
    const idle = Math.max(0, Math.min(1, hoverSpeed / 100));
    const grip = Math.max(1, Math.min(20, brake));
    let raf = 0;
    let last = performance.now();

    const loop = (now) => {
      const dt = Math.min(0.064, Math.max(0, (now - last) / 1000));
      last = now;
      if (visibleRef.current && !document.hidden) {
        let p = posRef.current;
        if (dragRef.current?.active) {
          easeRef.current = 0;
        } else {
          const target = pauseOnHover && hoverRef.current ? idle : 1;
          easeRef.current += (target - easeRef.current) * Math.min(1, dt * grip);
          if (Math.abs(easeRef.current - target) < 0.0015) easeRef.current = target;
          p += dir * pxPerSecond * easeRef.current * dt;
          if (Math.abs(inertiaRef.current) > 2) {
            p += inertiaRef.current * dt;
            inertiaRef.current *= Math.pow(0.93, dt * 60);
          } else {
            inertiaRef.current = 0;
          }
        }
        p = ((p % setW) + setW) % setW;
        posRef.current = p;
        if (trackRef.current) trackRef.current.style.transform = `translate3d(${-p.toFixed(2)}px,0,0)`;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [dims.set, pxPerSecond, reverse, pauseOnHover, hoverSpeed, brake]);

  /* ------------------------------------------------------------------ drag */
  const editMode = () => typeof document !== "undefined" && document.documentElement.dataset.sgEdit === "1";

  const onPointerDown = useCallback(
    (e) => {
      if (!draggable || editMode() || (e.pointerType === "mouse" && e.button !== 0)) return;
      movedRef.current = false;
      dragRef.current = { active: true, startX: e.clientX, startPos: posRef.current, lastX: e.clientX, lastT: performance.now(), vel: 0 };
      inertiaRef.current = 0;
    },
    [draggable]
  );

  const onPointerMove = useCallback((e) => {
    const d = dragRef.current;
    if (!d?.active) return;
    const dx = e.clientX - d.startX;
    if (!movedRef.current && Math.abs(dx) < 6) return;
    if (!movedRef.current) {
      movedRef.current = true;
      try {
        e.currentTarget.setPointerCapture?.(e.pointerId);
      } catch {
        /* ignore */
      }
    }
    const now = performance.now();
    const dtl = Math.max(8, now - d.lastT) / 1000;
    d.vel = -((e.clientX - d.lastX) / dtl);
    d.lastX = e.clientX;
    d.lastT = now;
    posRef.current = d.startPos - dx;
  }, []);

  const endDrag = useCallback(() => {
    const d = dragRef.current;
    dragRef.current = null;
    if (!d?.active || !movedRef.current) return;
    inertiaRef.current = Math.max(-2600, Math.min(2600, d.vel));
  }, []);

  /* a drag must never fire the card's link */
  const onClickCapture = useCallback((e) => {
    if (!movedRef.current) return;
    movedRef.current = false;
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const copies = dims.set > 0 ? Math.max(2, Math.ceil(dims.view / dims.set) + 2) : 2;
  const mask = fade > 0
    ? `linear-gradient(90deg, transparent 0%, #000 ${fade}%, #000 ${100 - fade}%, transparent 100%)`
    : undefined;

  return (
    <div
      ref={viewRef}
      data-testid="marquee-row"
      className={`relative w-full overflow-hidden ${className}`}
      style={{
        maskImage: mask,
        WebkitMaskImage: mask,
        paddingTop: padY,
        paddingBottom: padY,
        marginTop: -padY,
        marginBottom: -padY,
        cursor: draggable ? "grab" : undefined,
        touchAction: draggable ? "pan-y" : undefined,
      }}
      onMouseEnter={() => { hoverRef.current = true; }}
      onMouseLeave={() => { hoverRef.current = false; }}
      onPointerDown={draggable ? onPointerDown : undefined}
      onPointerMove={draggable ? onPointerMove : undefined}
      onPointerUp={draggable ? endDrag : undefined}
      onPointerCancel={draggable ? endDrag : undefined}
      onClickCapture={draggable ? onClickCapture : undefined}
    >
      <div ref={trackRef} className="flex w-max items-center" style={{ transform: "translate3d(0,0,0)", willChange: "transform" }}>
        {Array.from({ length: copies }).map((_, i) => (
          <div key={i} ref={i === 0 ? setRef : null} className="flex shrink-0 items-center" aria-hidden={i > 0 ? "true" : undefined}>
            {children}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Marquee;
