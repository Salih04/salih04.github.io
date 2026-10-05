"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

interface Props<T extends string> {
  tabs: readonly T[];
  labels: Record<T, string>;
  active: T;
  onSelect: (tab: T) => void;
  label: string;
  /** Extra items after the tabs (for example, a link to the case study). */
  trailing?: ReactNode;
}

/**
 * Lab tab bar. When the tabs overflow (pocket interface), the bar shows an
 * edge fade and a chevron on each side that has more content, and keeps the
 * active tab scrolled into view. Arrow keys move between tabs.
 */
export function TabBar<T extends string>({ tabs, labels, active, onSelect, label, trailing }: Props<T>) {
  const scroller = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ left: false, right: false });

  const measure = useCallback(() => {
    const el = scroller.current;
    if (!el) return;
    setEdges({ left: el.scrollLeft > 4, right: el.scrollLeft + el.clientWidth < el.scrollWidth - 4 });
  }, []);

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    measure();
    el.addEventListener("scroll", measure, { passive: true });
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", measure);
      ro.disconnect();
    };
  }, [measure]);

  // Keep the active tab fully visible.
  useEffect(() => {
    const el = scroller.current;
    const tab = document.getElementById(`tab-${active}`);
    if (!el || !tab || el.scrollWidth <= el.clientWidth) return;
    const left = tab.offsetLeft - el.offsetLeft;
    const right = left + tab.offsetWidth;
    if (left < el.scrollLeft + 24) el.scrollLeft = Math.max(0, left - 32);
    else if (right > el.scrollLeft + el.clientWidth - 24) el.scrollLeft = right - el.clientWidth + 32;
    measure();
  }, [active, measure]);

  const nudge = (dir: -1 | 1) => scroller.current?.scrollBy({ left: dir * scroller.current.clientWidth * 0.6, behavior: "smooth" });

  return (
    <div className="tabbar" data-left={edges.left || undefined} data-right={edges.right || undefined}>
      <button type="button" className="tabbar__chev tabbar__chev--left" aria-hidden="true" tabIndex={-1} onClick={() => nudge(-1)}>
        ‹
      </button>
      <div className="tabbar__scroll" ref={scroller}>
        <div className="tabs" role="tablist" aria-label={label}>
          {tabs.map((t) => (
            <button
              key={t}
              type="button"
              role="tab"
              id={`tab-${t}`}
              aria-selected={active === t}
              // The SAMS lab mounts only the active panel; pointing only the active tab at its panel is valid for both labs.
              aria-controls={active === t ? `panel-${t}` : undefined}
              tabIndex={active === t ? 0 : -1}
              className="tabs__tab"
              onClick={() => onSelect(t)}
              onKeyDown={(e) => {
                const i = tabs.indexOf(t);
                const next =
                  e.key === "ArrowRight" ? tabs[(i + 1) % tabs.length] : e.key === "ArrowLeft" ? tabs[(i + tabs.length - 1) % tabs.length] : null;
                if (next) {
                  e.preventDefault();
                  onSelect(next);
                  document.getElementById(`tab-${next}`)?.focus();
                }
              }}
            >
              {labels[t]}
            </button>
          ))}
          {trailing}
        </div>
      </div>
      <button type="button" className="tabbar__chev tabbar__chev--right" aria-hidden="true" tabIndex={-1} onClick={() => nudge(1)}>
        ›
      </button>
    </div>
  );
}
