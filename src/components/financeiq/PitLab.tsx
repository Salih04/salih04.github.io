"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { FigureLabel } from "@/components/records/FigureLabel";
import { useLab } from "@/components/shell/LabProvider";
import { pitDefaultFact, pitObservations, pitRange } from "@/content/financeiq";
import {
  compareFact,
  detectLeakage,
  factKey,
  naive,
  pointInTime,
  reconstruct,
  reconstructRecord,
  syntheticScores,
  type FactComparison,
  type Observation,
} from "@/lib/pit";
import { prefersReducedMotion, useReducedMotion } from "@/lib/useReducedMotion";

const DAY = 86_400_000;
const t0 = Date.parse(pitRange.start);
const t1 = Date.parse(pitRange.end);
const span = t1 - t0;
const totalDays = Math.round(span / DAY);

const pct = (iso: string) => Math.min(100, Math.max(0, ((Date.parse(iso) - t0) / span) * 100));
const toIso = (days: number) => new Date(t0 + Math.min(totalDays, Math.max(0, days)) * DAY).toISOString().slice(0, 10);
const toDays = (iso: string) => Math.round((Date.parse(iso) - t0) / DAY);

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export const fmtDate = (iso: string) => {
  const [y, m, d] = iso.split("-");
  return `${Number(d)} ${MONTHS[Number(m) - 1]} ${y}`;
};
/** Axis labels: the year appears on the first tick and on each January. */
const fmtTick = (iso: string, first: boolean) => {
  const [y, m] = iso.split("-");
  return first || m === "01" ? `${MONTHS[Number(m) - 1]} ’${y!.slice(2)}` : MONTHS[Number(m) - 1]!;
};

/** Every month start on the axis; quarters carry a label. */
const MONTH_TICKS = (() => {
  const out: { iso: string; major: boolean; half: boolean }[] = [];
  const [y0, m0] = pitRange.start.split("-").map(Number) as [number, number];
  for (let i = 0; ; i++) {
    const m = ((m0 - 1 + i) % 12) + 1;
    const y = y0 + Math.floor((m0 - 1 + i) / 12);
    const iso = `${y}-${String(m).padStart(2, "0")}-01`;
    if (iso > pitRange.end) break;
    out.push({ iso, major: (m - 1) % 3 === 0, half: (m - 1) % 6 === 0 });
  }
  return out;
})();

const STEP_MS = 560;
/** The procedure, named before it runs; each check gets its specific outcome as it completes. */
const PROCEDURE = ["Period identified", "Filing located", "Availability checked", "Revisions checked", "Point-in-time record accepted"];
const PLAY_MS = 60;
const PLAY_STEP_DAYS = 5;

type View = "naive" | "pit";

const rows = [...pitObservations].sort((a, b) => (a.entity === b.entity ? (a.knownAt < b.knownAt ? -1 : 1) : a.entity < b.entity ? -1 : 1));

function rowLabel(o: Observation) {
  if (o.kind === "membership") return `${o.entity} · ${o.value ? "joins universe" : "leaves universe"}`;
  return `${o.entity} · ${o.period} EPS${o.kind === "restatement" ? " (corrected)" : ""}`;
}

/** Shorter label for the timeline rows; the full label is the accessible name. */
function shortLabel(o: Observation) {
  if (o.kind === "membership") return { main: o.entity, sub: o.value ? "joins universe" : "leaves universe" };
  return { main: `${o.entity} · ${o.period}`, sub: o.kind === "restatement" ? "EPS · correction" : "EPS" };
}

const valueText = (o: Observation) => (o.kind === "membership" ? (o.value ? "in" : "out") : o.value.toFixed(2));

function factTitle(key: string) {
  const [entity, field, period] = key.split("|");
  return field === "Universe" ? `${entity} · universe membership` : `${entity} · ${period}`;
}

/** Plain-language reading of one fact comparison. */
function explain(c: FactComparison, asOf: string) {
  const isMember = c.key.includes("|Universe|");
  const show = (o: Observation | undefined) => (o ? (isMember ? (o.value ? "In the universe" : "Not in the universe") : o.value.toFixed(2)) : isMember ? "Absent" : "Not yet published");
  const naiveText = show(c.naive);
  const availText = show(c.available);
  switch (c.verdict) {
    case "revision-leak":
      return { naiveText, availText, line: `${c.naive!.value.toFixed(2)} was published later, on ${fmtDate(c.naive!.knownAt)}.`, verdict: "Look-ahead leakage", tone: "leak" };
    case "look-ahead":
      return { naiveText, availText, line: `${c.naive!.value.toFixed(2)} was published on ${fmtDate(c.naive!.knownAt)}, after the simulated date.`, verdict: "Look-ahead leakage", tone: "leak" };
    case "survivorship":
      return { naiveText, availText, line: `Built from today's list of companies, the naive history drops a company that later left the universe.`, verdict: "Survivorship bias", tone: "leak" };
    case "not-yet-available":
      return { naiveText, availText, line: `Nothing about this period had been published by ${fmtDate(asOf)}.`, verdict: "No leakage", tone: "ok" };
    default:
      return { naiveText, availText, line: `Both histories agree on ${fmtDate(asOf)}.`, verdict: "No leakage", tone: "ok" };
  }
}

interface Props {
  onRunExperiment: () => void;
  onOpenResults: () => void;
}

export function PitLab({ onRunExperiment, onOpenResults }: Props) {
  const { cue } = useLab();
  const reduce = useReducedMotion();
  const [asOf, setAsOf] = useState(pitRange.defaultAsOf);
  const [view, setView] = useState<View>("naive");
  const [selected, setSelected] = useState(pitDefaultFact);
  const [playing, setPlaying] = useState(false);
  const [revealed, setRevealed] = useState<number | null>(null);
  const timer = useRef<number | null>(null);
  const axisRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const decisions = useMemo(() => reconstruct(pitObservations, asOf), [asOf]);
  const issues = useMemo(() => detectLeakage(pitObservations, asOf), [asOf]);
  const pitSet = useMemo(() => new Set([...pointInTime(pitObservations, asOf).values()].map((o) => o.id)), [asOf]);
  const naiveSet = useMemo(() => new Set([...naive(pitObservations, asOf).values()].map((o) => o.id)), [asOf]);
  const comparison = useMemo(() => compareFact(pitObservations, selected, asOf), [selected, asOf]);
  const record = useMemo(() => reconstructRecord(pitObservations, selected, asOf), [selected, asOf]);
  const scores = syntheticScores(issues.length);
  const reading = explain(comparison, asOf);

  const stopReveal = () => {
    if (timer.current) window.clearInterval(timer.current);
    timer.current = null;
  };
  useEffect(() => stopReveal, []);

  const moveTo = useCallback((iso: string) => {
    stopReveal();
    setRevealed(null);
    setAsOf(iso);
  }, []);

  const select = (key: string) => {
    stopReveal();
    setRevealed(null);
    setSelected(key);
  };

  // Play through time: the cursor walks forward; stops at the end of the range.
  useEffect(() => {
    if (!playing) return;
    const stepDays = reduce ? 30 : PLAY_STEP_DAYS;
    const t = window.setInterval(
      () => {
        setAsOf((cur) => {
          const next = toDays(cur) + stepDays;
          if (next >= totalDays) {
            setPlaying(false);
            return pitRange.end;
          }
          return toIso(next);
        });
        setRevealed(null);
      },
      reduce ? 600 : PLAY_MS,
    );
    return () => window.clearInterval(t);
  }, [playing, reduce]);

  const togglePlay = () => {
    if (playing) return setPlaying(false);
    if (toDays(asOf) >= totalDays - 1) setAsOf(pitRange.start);
    stopReveal();
    setPlaying(true);
  };

  // Dragging anywhere on the tracks moves the cursor there.
  const dateAt = (clientX: number) => {
    const r = axisRef.current?.getBoundingClientRect();
    if (!r) return asOf;
    return toIso(Math.round(((clientX - r.left) / r.width) * totalDays));
  };
  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 || !(e.target as HTMLElement).closest("[data-track]")) return;
    dragging.current = true;
    setPlaying(false);
    e.currentTarget.setPointerCapture(e.pointerId);
    moveTo(dateAt(e.clientX));
  };
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (dragging.current) moveTo(dateAt(e.clientX));
  };
  const onPointerUp = () => {
    dragging.current = false;
  };

  const onSliderKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const d = toDays(asOf);
    const map: Record<string, number> = { ArrowRight: 7, ArrowUp: 7, ArrowLeft: -7, ArrowDown: -7, PageUp: 30, PageDown: -30 };
    let next: number | null = null;
    if (e.key in map) next = d + map[e.key]!;
    if (e.key === "Home") next = 0;
    if (e.key === "End") next = totalDays;
    if (next === null) return;
    e.preventDefault();
    setPlaying(false);
    moveTo(toIso(next));
  };

  const steps = record.steps;
  const startReveal = () => {
    if (revealed !== null && revealed < steps.length) return; // already running; the button stays focusable
    stopReveal();
    setPlaying(false);
    if (prefersReducedMotion()) {
      setRevealed(steps.length);
      return;
    }
    setRevealed(0);
    let i = 0;
    timer.current = window.setInterval(() => {
      i += 1;
      setRevealed(i);
      if (i >= steps.length) stopReveal();
    }, STEP_MS);
  };

  useEffect(() => {
    if (revealed === null || revealed === 0) return;
    const s = steps[revealed - 1];
    if (revealed >= steps.length) cue("complete");
    else cue(s?.outcome === "ok" ? "tick" : "warn");
  }, [revealed, steps, cue]);

  const reconstructing = revealed !== null && revealed < steps.length;
  const ready = revealed !== null && revealed >= steps.length;
  const acceptedCount = decisions.filter((d) => d.verdict === "accepted").length;

  const rowState = (o: Observation) => {
    if (o.knownAt > asOf && view === "pit") return "future";
    if (view === "pit") return pitSet.has(o.id) ? "used" : "excluded";
    if (!naiveSet.has(o.id)) return o.knownAt > asOf ? "future" : "excluded";
    return pitSet.has(o.id) ? "used" : "leak";
  };
  const STATE_TEXT: Record<string, string> = { used: "used", leak: "leak", excluded: "—", future: "later" };

  const asOfPct = pct(asOf);

  return (
    <div className="pit">
      <div className="pit__bench">
        <figure className="plate plate--paper pit__plate" aria-labelledby="pit-title">
          <header className="pit__head">
            <FigureLabel fig="01" kind="synthetic" />
            <h2 id="pit-title" className="pit__q">
              What was known on <span className="pit__asof-v">{fmtDate(asOf)}</span>?
            </h2>
            <div className="pit__controls">
              <div className="segmented" role="radiogroup" aria-label="Dataset">
                {(["naive", "pit"] as const).map((v) => (
                  <button key={v} type="button" role="radio" aria-checked={view === v} onClick={() => setView(v)}>
                    {v === "naive" ? "Naive history" : "Point-in-time"}
                  </button>
                ))}
              </div>
              <button type="button" className="pit__play" onClick={togglePlay} aria-pressed={playing}>
                {playing ? "Pause" : "Play through time"}
              </button>
            </div>
          </header>

          <p className={`pit__verdict${view === "naive" && issues.length ? " is-leak" : ""}`} role="status">
            {view === "naive" ? (
              issues.length ? (
                <>
                  <b aria-hidden="true">†</b> {issues.length} {issues.length === 1 ? "fact" : "facts"} in the naive history could not have been known on {fmtDate(asOf)}.
                </>
              ) : (
                <>No leakage on this date. Move the cursor later.</>
              )
            ) : (
              <>Point-in-time: only the {pitSet.size} facts published by {fmtDate(asOf)} are used.</>
            )}
          </p>

          <div className="tl" data-view={view} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp}>
            <div className="tl__row tl__row--axis">
              <span className="tl__label tl__label--axis">Published on →</span>
              <div className="tl__track" data-track ref={axisRef}>
                {MONTH_TICKS.map((t) => (
                  <span key={t.iso} className={`tl__tick${t.major ? "" : " tl__tick--minor"}`} data-half={t.half || undefined} style={{ left: `${pct(t.iso)}%` }} aria-hidden="true">
                    {t.major ? fmtTick(t.iso, t.iso === MONTH_TICKS[0]!.iso) : null}
                  </span>
                ))}
                {asOfPct > 24 ? (
                  <span className="tl__region tl__region--past" style={{ right: `${100 - asOfPct}%` }} aria-hidden="true">
                    ← published
                  </span>
                ) : null}
                {asOfPct < 74 ? (
                  <span className="tl__region tl__region--future" style={{ left: `${asOfPct}%` }} aria-hidden="true">
                    not yet published →
                  </span>
                ) : null}
              </div>
              <span />
            </div>

            {rows.map((o) => {
              const state = rowState(o);
              const isMember = o.kind === "membership";
              const key = factKey(o);
              const pulled = view === "naive" && state === "leak" && o.knownAt > asOf;
              return (
                <div
                  key={o.id}
                  className="tl__row"
                  data-state={state}
                  data-kind={o.kind}
                  data-selected={selected === key || undefined}
                  data-current={reconstructing && selected === key ? "" : undefined}
                >
                  <button type="button" className="tl__label" aria-pressed={selected === key} aria-label={rowLabel(o)} onClick={() => select(key)}>
                    <span className="tl__label-main">{shortLabel(o).main}</span>
                    <span className="tl__label-sub">{shortLabel(o).sub}</span>
                  </button>
                  <div className="tl__track" data-track aria-hidden="true">
                    <span className="tl__future" style={{ left: `${asOfPct}%` }} />
                    {!isMember ? (
                      <>
                        <span className="tl__lag" style={{ left: `${pct(o.periodEnd)}%`, width: `${pct(o.knownAt) - pct(o.periodEnd)}%` }} />
                        <span className="tl__period" style={{ left: `${pct(o.periodEnd)}%` }} />
                      </>
                    ) : null}
                    {pulled ? <span className="tl__pull" style={{ left: `${asOfPct}%`, width: `${pct(o.knownAt) - asOfPct}%` }} /> : null}
                    <span className={`tl__known${isMember ? " tl__known--member" : ""}`} style={{ left: `${pct(o.knownAt)}%` }} />
                    <span className="tl__value" style={{ left: `${pct(o.knownAt)}%` }}>
                      {valueText(o)}
                    </span>
                  </div>
                  <span className="tl__state">{STATE_TEXT[state]}</span>
                </div>
              );
            })}

            <div className="tl__cursorLayer">
              <div className="tl__cursor" style={{ left: `${asOfPct}%` }}>
                <div
                  className="tl__handle"
                  data-track
                  role="slider"
                  tabIndex={0}
                  aria-label="As-of date"
                  aria-valuemin={0}
                  aria-valuemax={totalDays}
                  aria-valuenow={toDays(asOf)}
                  aria-valuetext={fmtDate(asOf)}
                  onKeyDown={onSliderKey}
                >
                  <span className="tl__handle-k">As of</span>
                  <span className="tl__handle-v">{fmtDate(asOf)}</span>
                </div>
              </div>
            </div>
          </div>

          <figcaption className="pit__caption">
            <p className="pit__thesis">A backtest must only use information that had actually been published by the date it is simulating.</p>
            <p className="pit__legend">
              <span>
                <i className="lg lg--period" /> period ends
              </span>
              <span>
                <i className="lg lg--lag" /> publication delay
              </span>
              <span>
                <i className="lg lg--known" /> published
              </span>
              <span>
                <i className="lg lg--fix" /> correction
              </span>
              <span>
                <i className="lg lg--asof" /> as-of cursor · the future is hatched
              </span>
            </p>
            <p className="pit__legend-note">
              Drag the cursor, or focus it and use the arrow keys. Companies A–C and all values are invented.
            </p>
          </figcaption>

          <details className="text-alt">
            <summary>Timeline as a table</summary>
            <table className="data-table">
              <thead>
                <tr>
                  <th scope="col">Observation</th>
                  <th scope="col">Describes</th>
                  <th scope="col">Published</th>
                  <th scope="col">Value</th>
                  <th scope="col">{view === "naive" ? "Naive" : "Point-in-time"} status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((o) => (
                  <tr key={o.id}>
                    <td>{rowLabel(o)}</td>
                    <td>{o.kind === "membership" ? "—" : fmtDate(o.periodEnd)}</td>
                    <td>{fmtDate(o.knownAt)}</td>
                    <td>{o.kind === "membership" ? (o.value ? "joins" : "leaves") : o.value.toFixed(2)}</td>
                    <td>{STATE_TEXT[rowState(o)]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </details>
        </figure>

        <aside className="pit__side" aria-label="Selected record and consequence">
          <section className="compare" data-tone={reading.tone} aria-live="polite">
            <p className="compare__k">Evidence · selected record</p>
            <h3 className="compare__title">
              {factTitle(selected)}
              {selected.includes("|EPS|") ? (
                <>
                  {" "}
                  <abbr title="earnings per share">EPS</abbr>
                </>
              ) : null}
            </h3>
            <dl className="compare__rows">
              <div data-k="date">
                <dt>Simulated date</dt>
                <dd>{fmtDate(asOf)}</dd>
              </div>
              <div data-tone={reading.tone === "leak" ? "leak" : undefined} data-k="naive">
                <dt>Naive history</dt>
                <dd data-text={/[a-z]/i.test(reading.naiveText) || undefined}>{reading.naiveText}</dd>
              </div>
              <div data-k="known">
                <dt>What was actually known</dt>
                <dd data-text={/[a-z]/i.test(reading.availText) || undefined}>{reading.availText}</dd>
              </div>
            </dl>
            <p className="compare__line">
              {reading.tone === "leak" ? <b aria-hidden="true">† </b> : null}
              {reading.line}
            </p>
            <p className="compare__verdict">{reading.verdict}</p>
            {selected.includes("|EPS|") ? <p className="compare__def">EPS: earnings per share, a company&apos;s profit divided by its number of shares.</p> : null}
            <p className="compare__hint">Select any row on the timeline to inspect it.</p>
          </section>

          <section className="consequence" aria-labelledby="consequence-title">
            <FigureLabel fig="02" kind="synthetic" />
            <h3 id="consequence-title" className="consequence__title">
              What a model would conclude
            </h3>
            <dl className="consequence__bars">
              {(
                [
                  ["Naive history", scores.naive, "naive"],
                  ["Point-in-time", scores.pit, "pit"],
                ] as const
              ).map(([label, v, k]) => (
                <div key={k} data-k={k}>
                  <dt>{label}</dt>
                  <dd>
                    <span className="consequence__score">
                      signal score <b>+{v.toFixed(2)}</b>
                    </span>
                    <span className="consequence__bar" style={{ width: `${Math.min(100, (v / 0.07) * 100)}%` }} />
                  </dd>
                </div>
              ))}
            </dl>
            <p className="consequence__line">
              {issues.length ? "The apparent signal weakens when future information is removed." : "No fact leaks on this date, so both histories give the same score."}
            </p>
            <p className="consequence__fine">Toy score: a fixed baseline plus a fixed lift for every leaked fact. Not a FinanceIQ research result.</p>
            <button type="button" className="linkish" onClick={onOpenResults}>
              A documented instance of this effect →
            </button>
          </section>
        </aside>
      </div>

      <section className="recon" aria-labelledby="recon-title" data-state={ready ? "done" : reconstructing ? "running" : "idle"}>
        <div className="recon__head">
          <div>
            <h3 id="recon-title">Reconstruct history</h3>
            <p>
              Rebuild <b>{factTitle(selected)}{selected.includes("|EPS|") ? " EPS" : ""}</b> exactly as it was knowable on {fmtDate(asOf)}, check by check.
            </p>
          </div>
          <button type="button" className="btn btn--research" onClick={startReveal} aria-disabled={reconstructing || undefined}>
            {reconstructing ? "Reconstructing…" : ready ? "Reconstruct again" : "Reconstruct history"}
          </button>
        </div>

        <ol className="recon__steps" aria-live="polite">
          {steps.map((s, i) => {
            const shown = revealed !== null && i < revealed;
            return (
              <li key={s.n} data-shown={shown || undefined} data-outcome={shown ? s.outcome : undefined} data-current={reconstructing && i === (revealed ?? 0) - 1 ? "" : undefined}>
                <span className="recon__n mono">{s.n}</span>
                <span className="recon__label">{shown ? s.label : PROCEDURE[i]}</span>
                <span className="recon__detail">{shown ? s.detail : ""}</span>
              </li>
            );
          })}
        </ol>

        {ready ? (
          <div className="recon__done">
            <p className="recon__done-k mono">Historical state reconstructed</p>
            <p className="recon__done-t">
              On {fmtDate(asOf)} the point-in-time dataset holds {acceptedCount} records; {decisions.length - acceptedCount} are excluded as unpublished or superseded.
            </p>
            <button type="button" className="btn" onClick={onRunExperiment}>
              Open experiment bench
            </button>
          </div>
        ) : null}

        {ready ? (
          <table className="ledger" aria-label={`Dataset ledger as of ${fmtDate(asOf)}`}>
            <thead>
              <tr>
                <th scope="col">Record</th>
                <th scope="col">Verdict</th>
                <th scope="col">Reason</th>
              </tr>
            </thead>
            <tbody>
              {decisions.map((d) => (
                <tr key={d.observation.id} data-verdict={d.verdict}>
                  <td>{rowLabel(d.observation)}</td>
                  <td className="mono">{d.verdict === "accepted" ? "accepted" : d.verdict === "superseded" ? "superseded" : "excluded"}</td>
                  <td>{d.reason.replace(/(\d{4}-\d{2}-\d{2})/g, (m) => fmtDate(m))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : null}
      </section>
    </div>
  );
}
