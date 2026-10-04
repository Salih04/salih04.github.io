"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "@/lib/useReducedMotion";

const WINDOW = 12;
const STEP_MS = 3600;
const START_HEAD = 44;

const pad = (n: number) => String(n).padStart(3, "0");

/** Positions (in %) the as-of cursor visits on the availability band. */
const CURSOR_STOPS = [76, 84, 92, 84];

/**
 * The entry screen's shared instrument trace: one horizontal band per
 * flagship project, on a common time axis. The upper band is SAMS's ordered
 * event sequence; the lower band is FinanceIQ's information timeline. It moves
 * rarely and quietly: one event is appended every few seconds, and the as-of
 * cursor shifts. Static under reduced motion.
 */
export function InstrumentTrace() {
  const reduce = useReducedMotion();
  const [head, setHead] = useState(START_HEAD);
  const [stop, setStop] = useState(0);

  useEffect(() => {
    if (reduce) return;
    const t = window.setInterval(() => {
      if (document.hidden) return;
      setHead((h) => h + 1);
      setStop((s) => (s + 1) % CURSOR_STOPS.length);
    }, STEP_MS);
    return () => window.clearInterval(t);
  }, [reduce]);

  const seqs = Array.from({ length: WINDOW }, (_, i) => head - WINDOW + 1 + i);
  const cursor = CURSOR_STOPS[stop]!;

  return (
    <div className="trace" aria-hidden="true">
      <div className="trace__band trace__band--seq">
        <span className="trace__key">
          <b>SAMS</b> event sequence
        </span>
        <div className="trace__rail">
          <div key={head} className="trace__seqs" data-shift={!reduce || undefined}>
            {seqs.map((s, i) => (
              <span key={s} className="trace__seq" data-head={s === head || undefined} style={{ opacity: 0.25 + (0.75 * (i + 1)) / WINDOW }}>
                <i />
                seq {pad(s)}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="trace__axis" />

      <div className="trace__band trace__band--time">
        <span className="trace__key">
          <b>FinanceIQ</b> information availability
        </span>
        <div className="trace__rail trace__rail--time">
          <span className="trace__future" style={{ left: `${cursor}%` }} />
          <span className="trace__lag" style={{ left: "6%", width: "30%" }} />
          {[
            [6, "reported"],
            [36, "published"],
            [64, "available"],
          ].map(([x, label]) => (
            <span key={label} className="trace__mark" style={{ left: `${x}%` }}>
              <i />
              <span>{label}</span>
            </span>
          ))}
          <span className="trace__asof" style={{ left: `${cursor}%` }}>
            as-of
          </span>
        </div>
      </div>
    </div>
  );
}
