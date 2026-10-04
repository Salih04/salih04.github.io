"use client";

import { useEffect, useRef, useState } from "react";
import { FigureLabel } from "@/components/records/FigureLabel";
import { LabLink } from "@/components/shell/LabLink";
import { useReducedMotion } from "@/lib/useReducedMotion";

/** Where "now" sits on the shared axis, in % of the field width. */
const NOW = 72;
/** Distance between consecutive sequence numbers, in %. */
const SLOT = 6.5;
/** Sequence numbers kept on the axis. */
const WINDOW = 12;
/** One event every few seconds; the client applies it a beat later. */
const STEP_MS = 4600;
const CLIENT_LAG_MS = 900;
const START_HEAD = 44;

const pad = (n: number) => String(n).padStart(3, "0");

/* The FinanceIQ record below the axis: one fact's history, in % of the field. */
const PERIOD_END = 12;
const PUBLICATION = 38;
const REVISION = 86;

/**
 * The entry's shared instrument: two traces on one time axis.
 *
 * Above the axis, SAMS: the server appends a numbered event at "now" and the
 * client cursor follows a beat later. Below the axis, FinanceIQ: a quarter
 * ends, its result is published weeks later, the as-of date reads it, and a
 * revision exists only in the future. Both traces ask the same question:
 * what was known, and when?
 *
 * Motion budget: one event every few seconds. Nothing else moves. Static
 * under reduced motion.
 */
export function InstrumentTrace() {
  const reduce = useReducedMotion();
  const [head, setHead] = useState(START_HEAD);
  const [client, setClient] = useState(START_HEAD);
  const headRef = useRef(START_HEAD);

  useEffect(() => {
    if (reduce) return;
    let lag: number | undefined;
    const t = window.setInterval(() => {
      if (document.hidden) return;
      const next = headRef.current + 1;
      headRef.current = next;
      setHead(next);
      lag = window.setTimeout(() => setClient(next), CLIENT_LAG_MS);
    }, STEP_MS);
    return () => {
      window.clearInterval(t);
      window.clearTimeout(lag);
    };
  }, [reduce]);

  const seqs = Array.from({ length: WINDOW }, (_, i) => head - WINDOW + 1 + i);
  const x = (seq: number) => NOW - (head - seq) * SLOT;

  return (
    <figure className="trace" aria-labelledby="trace-caption">
      <div className="trace__grid">
        <LabLink href="/sams/" className="trace__key trace__key--sams">
          <span className="trace__key-k mono">02 · Independent project</span>
          <span className="trace__key-name">SAMS</span>
          <span className="trace__key-desc">Agent systems · replay · reliability</span>
          <span className="trace__key-go">
            Run the failure demo <span aria-hidden="true">→</span>
          </span>
        </LabLink>

        <div className="trace__field" aria-hidden="true">
          <div className="trace__band trace__band--sams">
            <span className="trace__band-k">Event trace</span>
            {seqs.map((s) => (
              <span key={s} className="trace__ev" data-head={s === head || undefined} data-odd={(head - s) % 2 === 1 || undefined} data-seen={s <= client || undefined} style={{ left: `${x(s)}%` }}>
                <span className="trace__ev-n">{pad(s)}</span>
                <i className="trace__ev-stem" />
              </span>
            ))}
            <span className="trace__cur trace__cur--server" style={{ left: `${x(head)}%` }}>
              server
            </span>
            <span className="trace__cur trace__cur--client" data-behind={client < head || undefined} style={{ left: `${x(client)}%` }}>
              client
            </span>
          </div>

          <div className="trace__axis">
            <span className="trace__axis-t mono">t</span>
          </div>

          <div className="trace__band trace__band--fiq">
            <span className="trace__band-k">Historical trace</span>
            <svg className="trace__record" viewBox="0 0 1000 100" preserveAspectRatio="none">
              <path className="trace__drop" d={`M${PERIOD_END * 10} 0 V24`} />
              <path className="trace__lag" d={`M${PERIOD_END * 10} 24 H${PUBLICATION * 10} V62 H${NOW * 10}`} />
              <path className="trace__later" d={`M${NOW * 10} 62 H${REVISION * 10}`} />
            </svg>
            <span className="trace__pt trace__pt--period" style={{ left: `${PERIOD_END}%`, top: "24%" }}>
              <i />
              <span>Period end</span>
            </span>
            <span className="trace__pt trace__pt--pub" style={{ left: `${PUBLICATION}%`, top: "24%" }}>
              <i />
              <span>Publication</span>
            </span>
            <span className="trace__pt trace__pt--asof" style={{ left: `${NOW}%`, top: "62%" }}>
              <i />
              <span>As-of</span>
            </span>
            <span className="trace__pt trace__pt--rev" style={{ left: `${REVISION}%`, top: "62%" }}>
              <i />
              <span>Later revision</span>
            </span>
          </div>

          <span className="trace__future" style={{ left: `${NOW}%` }} />
          <span className="trace__now" style={{ left: `${NOW}%` }} />
        </div>

        <LabLink href="/financeiq/" className="trace__key trace__key--fiq">
          <span className="trace__key-k mono">03 · MSc research · in progress</span>
          <span className="trace__key-name">FinanceIQ</span>
          <span className="trace__key-desc">Point-in-time research · historical truth</span>
          <span className="trace__key-go">
            Reconstruct history <span aria-hidden="true">→</span>
          </span>
        </LabLink>
      </div>

      <figcaption id="trace-caption" className="trace__caption">
        <FigureLabel fig="00" kind="schematic" />
        <span>
          Two records on one time axis. Above, events a server has appended and a client has seen; below, a result, its publication and the
          date it is read. <em>What was known, and when?</em>
        </span>
      </figcaption>
    </figure>
  );
}
