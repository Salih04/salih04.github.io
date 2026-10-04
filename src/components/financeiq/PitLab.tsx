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
  syntheticScores,
  type Decision,
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
const fmtMonth = (iso: string) => {
  const [y, m] = iso.split("-");
  return `${MONTHS[Number(m) - 1]} ${y}`;
};

const TICKS = ["2019-07-01", "2019-10-01", "2020-01-01", "2020-04-01", "2020-07-01", "2020-10-01"];
const REVEAL_MS = 650;
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
  return { main: `${o.entity} · ${o.period}`, sub: o.kind === "restatement" ? "EPS · corrected" : "EPS" };
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
      return { naiveText, availText, line: `${c.naive!.value.toFixed(2)} was published on ${fmtDate(c.naive!.knownAt)}, after ${fmtDate(asOf)}.`, verdict: "Look-ahead leakage", tone: "leak" };
    case "survivorship":
      return { naiveText, availText, line: `Built from today's list of companies, the naive dataset drops a company that later left the universe.`, verdict: "Survivorship bias", tone: "leak" };
    case "not-yet-available":
      return { naiveText, availText, line: `Nothing about this period had been published by ${fmtDate(asOf)}.`, verdict: "No leakage", tone: "ok" };
    default:
      return { naiveText, availText, line: `Both datasets agree on ${fmtDate(asOf)}.`, verdict: "No leakage", tone: "ok" };
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

  const startReveal = () => {
    if (revealed !== null && revealed < decisions.length) return; // already running; the button stays focusable
    stopReveal();
    setPlaying(false);
    setView("pit");
    if (prefersReducedMotion()) {
      setRevealed(decisions.length);
      return;
    }
    setRevealed(0);
    let i = 0;
    timer.current = window.setInterval(() => {
      i += 1;
      setRevealed(i);
      if (i >= decisions.length) stopReveal();
    }, REVEAL_MS);
  };

  useEffect(() => {
    if (revealed === null || revealed === 0) return;
    const d = decisions[revealed - 1];
    if (revealed >= decisions.length) cue("complete");
    else cue(d?.verdict === "accepted" ? "tick" : "warn");
  }, [revealed, decisions, cue]);

  const reconstructing = revealed !== null && revealed < decisions.length;
  const ready = revealed !== null && revealed >= decisions.length;
  const shown: Decision[] = revealed === null ? [] : decisions.slice(0, revealed);
  const currentId = reconstructing && revealed ? decisions[revealed - 1]?.observation.id : null;

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
      <div className="pit__premise">
        <p className="pit__thesis">A backtest must only use information that had actually been published by the date it is simulating.</p>
        <p className="pit__context">
          Companies report their results weeks after a quarter ends, and sometimes correct them later. Drag the as-of cursor through time and
          compare what a careless dataset contains with what anyone could actually have known.
        </p>
      </div>

      <div className="pit__bench">
        <figure className="plate plate--paper pit__plate" aria-labelledby="pit-caption">
          <FigureLabel fig="01" kind="synthetic" className="plate__label" />

          <div className="pit__toolbar">
            <div className="pit__asof" aria-live="off">
              <span className="pit__asof-k">As of</span>
              <span className="pit__asof-v">{fmtDate(asOf)}</span>
            </div>
            <div className="segmented" role="radiogroup" aria-label="Dataset">
              {(["naive", "pit"] as const).map((v) => (
                <button key={v} type="button" role="radio" aria-checked={view === v} onClick={() => setView(v)}>
                  {v === "naive" ? "Naive dataset" : "Point-in-time"}
                </button>
              ))}
            </div>
            <button type="button" className="btn btn--research btn--sm pit__play" onClick={togglePlay} aria-pressed={playing}>
              {playing ? "❚❚ Pause" : "▶ Play through time"}
            </button>
          </div>

          <p className={`pit__verdict${view === "naive" && issues.length ? " is-leak" : " is-ok"}`} role="status">
            {view === "naive" ? (
              issues.length ? (
                <>
                  <strong>Look-ahead leakage</strong> {issues.length} {issues.length === 1 ? "fact" : "facts"} in the naive dataset could not have been
                  known on {fmtDate(asOf)}.
                </>
              ) : (
                <>
                  <strong>No leakage on this date.</strong> Move the cursor later.
                </>
              )
            ) : (
              <>
                <strong>Point-in-time.</strong> Only the {pitSet.size} facts published by {fmtDate(asOf)} are used.
              </>
            )}
          </p>

          <div className="tl" onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp}>
            <div className="tl__row tl__row--axis">
              <span className="tl__label tl__label--axis">Known on →</span>
              <div className="tl__track" data-track ref={axisRef}>
                {TICKS.map((t, i) => (
                  <span
                    key={t}
                    className={`tl__tick${i % 2 ? " tl__tick--minor" : ""}`}
                    style={{ left: `${pct(t)}%` }}
                    data-hidden={Math.abs(pct(t) - asOfPct) < 9 || undefined}
                    aria-hidden="true"
                  >
                    {fmtMonth(t)}
                  </span>
                ))}
              </div>
              <span />
            </div>

            {rows.map((o) => {
              const state = rowState(o);
              const isMember = o.kind === "membership";
              const key = factKey(o);
              return (
                <div key={o.id} className="tl__row" data-state={state} data-selected={selected === key || undefined} data-current={currentId === o.id || undefined}>
                  <button type="button" className="tl__label" aria-pressed={selected === key} aria-label={rowLabel(o)} onClick={() => setSelected(key)}>
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
                    <span className={`tl__known${isMember ? " tl__known--member" : ""}`} style={{ left: `${pct(o.knownAt)}%` }} />
                    <span className="tl__value" style={{ left: `${pct(o.knownAt)}%` }}>
                      {valueText(o)}
                    </span>
                  </div>
                  <span className="tl__state">{STATE_TEXT[state]}</span>
                </div>
              );
            })}

            <div className="tl__cursorLayer" aria-hidden="false">
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
                  as of
                </div>
              </div>
            </div>
          </div>

          <figcaption id="pit-caption" className="pit__legend">
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
              <i className="lg lg--asof" /> as-of cursor · the future is hatched
            </span>
            <span className="pit__legend-note">Companies A–C and all values are invented.</span>
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
            <p className="compare__k">Selected record · as of {fmtDate(asOf)}</p>
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
              <div data-tone={reading.tone === "leak" ? "leak" : undefined}>
                <dt>Naive historical record</dt>
                <dd data-text={/[a-z]/i.test(reading.naiveText) || undefined}>{reading.naiveText}</dd>
              </div>
              <div>
                <dt>Actually available then</dt>
                <dd data-text={/[a-z]/i.test(reading.availText) || undefined}>{reading.availText}</dd>
              </div>
            </dl>
            <p className="compare__line">{reading.line}</p>
            <p className="compare__verdict">{reading.verdict}</p>
            {selected.includes("|EPS|") ? <p className="compare__def">EPS — earnings per share: a company&apos;s profit divided by its number of shares.</p> : null}
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
                  ["Naive data", scores.naive, "naive"],
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
              {issues.length
                ? "The apparent signal weakens when future information is removed."
                : "No fact leaks on this date, so both datasets give the same score."}
            </p>
            <p className="consequence__fine">Toy score: a fixed baseline plus a fixed lift for every leaked fact. Not a FinanceIQ research result.</p>
            <button type="button" className="linkish" onClick={onOpenResults}>
              A documented instance of this effect →
            </button>
          </section>
        </aside>
      </div>

      <section className="reconstruct" aria-labelledby="reconstruct-title">
        <div className="reconstruct__head">
          <div>
            <h3 id="reconstruct-title">Reconstruct history</h3>
            <p>Rebuild the dataset exactly as it was knowable on {fmtDate(asOf)}. Every rejection is explained.</p>
          </div>
          <button type="button" className="btn btn--research" onClick={startReveal} aria-disabled={reconstructing || undefined}>
            {reconstructing ? "Reconstructing…" : ready ? "Reconstruct again" : "Reconstruct history"}
          </button>
        </div>
        {revealed !== null ? (
          <ol className="reconstruct__log" aria-live="polite">
            {shown.map((d) => (
              <li key={d.observation.id} data-verdict={d.verdict}>
                <span className={`tag ${d.verdict === "accepted" ? "tag--success" : d.verdict === "superseded" ? "tag--warning" : "tag--failure"}`}>
                  {d.verdict === "accepted" ? "Accepted" : d.verdict === "superseded" ? "Superseded" : "Rejected"}
                </span>
                <span className="reconstruct__what">{rowLabel(d.observation)}</span>
                <span className="reconstruct__why">{d.reason.replace(/(\d{4}-\d{2}-\d{2})/g, (m) => fmtDate(m))}</span>
              </li>
            ))}
          </ol>
        ) : null}
        {ready ? (
          <div className="reconstruct__ready">
            <p>
              Point-in-time dataset ready · {decisions.filter((d) => d.verdict === "accepted").length} accepted ·{" "}
              {decisions.filter((d) => d.verdict !== "accepted").length} rejected
            </p>
            <button type="button" className="btn" onClick={onRunExperiment}>
              Run it on the experiment bench
            </button>
          </div>
        ) : null}
      </section>
    </div>
  );
}
