import React, { useEffect, useLayoutEffect, useRef, useState } from "react";

/**
 * Seamless marquee.
 * - measures one set of children and clones enough copies to cover any viewport,
 *   so the strip can never "run out" of cards
 * - rAF driven: constant px/second on every row, eased pause/resume on hover
 * - all copies stay mounted, so nothing loads while it scrolls into view
 */
export const Marquee = ({
  children,
  pxPerSecond = 42,
  reverse = false,
  pauseOnHover = true,
  fade = 7,
  className = "",
  padY = 22,
}) => {
  const viewRef = useRef(null);
  const setRef = useRef(null);
  const trackRef = useRef(null);
  const hoverRef = useRef(false);
  const visibleRef = useRef(true);
  const posRef = useRef(0);
  const easeRef = useRef(1);
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
    let raf = 0;
    let last = performance.now();

    const loop = (now) => {
      const dt = Math.min(0.064, Math.max(0, (now - last) / 1000));
      last = now;
      if (visibleRef.current && !document.hidden) {
        const target = pauseOnHover && hoverRef.current ? 0 : 1;
        easeRef.current += (target - easeRef.current) * Math.min(1, dt * 7);
        if (easeRef.current < 0.0015) easeRef.current = 0;
        let p = posRef.current + dir * pxPerSecond * easeRef.current * dt;
        p = ((p % setW) + setW) % setW;
        posRef.current = p;
        if (trackRef.current) trackRef.current.style.transform = `translate3d(${-p.toFixed(2)}px,0,0)`;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [dims.set, pxPerSecond, reverse, pauseOnHover]);

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
      }}
      onMouseEnter={() => { hoverRef.current = true; }}
      onMouseLeave={() => { hoverRef.current = false; }}
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
