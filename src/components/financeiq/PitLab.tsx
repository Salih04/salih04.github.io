"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useLab } from "@/components/shell/LabProvider";
import { pitObservations, pitRange } from "@/content/financeiq";
import { detectLeakage, naive, pointInTime, reconstruct, type Decision, type Observation } from "@/lib/pit";
import { prefersReducedMotion } from "@/lib/useReducedMotion";

const DAY = 86_400_000;
const t0 = Date.parse(pitRange.start);
const t1 = Date.parse(pitRange.end);
const span = t1 - t0;
const totalDays = Math.round(span / DAY);

const pct = (iso: string) => Math.min(100, Math.max(0, ((Date.parse(iso) - t0) / span) * 100));
const toIso = (days: number) => new Date(t0 + days * DAY).toISOString().slice(0, 10);
const toDays = (iso: string) => Math.round((Date.parse(iso) - t0) / DAY);

const TICKS = ["2019-07-01", "2020-01-01", "2020-07-01"];
const REVEAL_MS = 700;

type View = "naive" | "pit";

const rows = [...pitObservations].sort((a, b) => (a.entity === b.entity ? (a.knownAt < b.knownAt ? -1 : 1) : a.entity < b.entity ? -1 : 1));

function rowLabel(o: Observation) {
  if (o.kind === "membership") return `${o.entity} · ${o.value ? "joins universe" : "removed from universe"}`;
  return `${o.entity} · ${o.field} ${o.period}${o.kind === "restatement" ? " (restated)" : ""}`;
}

export function PitLab({ onRunExperiment, autoStart }: { onRunExperiment: () => void; autoStart: number }) {
  const { cue } = useLab();
  const [asOf, setAsOf] = useState(pitRange.defaultAsOf);
  const [view, setView] = useState<View>("naive");
  const [revealed, setRevealed] = useState<number | null>(null);
  const timer = useRef<number | null>(null);

  const decisions = useMemo(() => reconstruct(pitObservations, asOf), [asOf]);
  const issues = useMemo(() => detectLeakage(pitObservations, asOf), [asOf]);
  const pitSet = useMemo(() => new Set([...pointInTime(pitObservations, asOf).values()].map((o) => o.id)), [asOf]);
  const naiveSet = useMemo(() => new Set([...naive(pitObservations, asOf).values()].map((o) => o.id)), [asOf]);

  const reconstructing = revealed !== null && revealed < decisions.length;
  const ready = revealed !== null && revealed >= decisions.length;

  const stop = () => {
    if (timer.current) window.clearInterval(timer.current);
    timer.current = null;
  };

  const start = () => {
    stop();
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
      if (i >= decisions.length) stop();
    }, REVEAL_MS);
  };

  useEffect(() => stop, []);

  // The page header's "Reconstruct history" button starts the sequence here.
  useEffect(() => {
    if (autoStart > 0) start();
  }, [autoStart]);

  useEffect(() => {
    if (revealed === null || revealed === 0) return;
    const d = decisions[revealed - 1];
    if (revealed >= decisions.length) cue("complete");
    else cue(d?.verdict === "accepted" ? "tick" : "warn");
  }, [revealed, decisions, cue]);

  const changeAsOf = (iso: string) => {
    stop();
    setRevealed(null);
    setAsOf(iso);
  };

  const shown: Decision[] = revealed === null ? [] : decisions.slice(0, revealed);
  const currentId = reconstructing && revealed ? decisions[revealed - 1]?.observation.id : null;
  const leaking = view === "naive" && issues.length > 0;

  const rowState = (o: Observation) => {
    if (view === "pit") return pitSet.has(o.id) ? "used" : "excluded";
    if (!naiveSet.has(o.id)) return "excluded";
    return pitSet.has(o.id) ? "used" : "leak";
  };

  return (
    <div className="pit">
      <div className="pit__controls">
        <div className="segmented" role="radiogroup" aria-label="Dataset">
          {(["naive", "pit"] as const).map((v) => (
            <button key={v} type="button" role="radio" aria-checked={view === v} onClick={() => setView(v)}>
              {v === "naive" ? "Naive dataset" : "Point-in-time dataset"}
            </button>
          ))}
        </div>
        <label className="pit__asof">
          <span className="eyebrow">As-of date</span>
          <span className="pit__asof-value mono">{asOf}</span>
          <input
            type="range"
            min={0}
            max={totalDays}
            value={toDays(asOf)}
            onChange={(e) => changeAsOf(toIso(Number(e.target.value)))}
            aria-valuetext={asOf}
          />
        </label>
      </div>

      <div className={`pit__banner ${leaking ? "pit__banner--leak" : "pit__banner--ok"}`} role="status">
        {view === "naive" ? (
          issues.length ? (
            <>
              <strong className="mono">Look-ahead leakage detected</strong>
              <ul>
                {issues.map((i) => (
                  <li key={i.key + i.kind}>
                    <span className="tag tag--failure">{i.kind}</span> {i.message}
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <strong className="mono">No leakage at this date — move the as-of date later.</strong>
          )
        ) : (
          <>
            <strong className="mono">Historical information state preserved</strong>
            <p>
              {pitSet.size} facts known on {asOf}. Nothing published after this date is used.
            </p>
          </>
        )}
      </div>

      <figure className="timeline" aria-labelledby="timeline-caption">
        <div className="timeline__row timeline__row--axis" aria-hidden="true">
          <span />
          <div className="timeline__track">
            {TICKS.map((t) => (
              <span key={t} className="timeline__tick mono" style={{ left: `${pct(t)}%` }}>
                {t.slice(0, 7)}
              </span>
            ))}
            <span className="timeline__asof-label mono" style={{ left: `${pct(asOf)}%` }}>
              as-of
            </span>
          </div>
        </div>
        {rows.map((o) => {
          const state = rowState(o);
          const isMember = o.kind === "membership";
          return (
            <div key={o.id} className="timeline__row" data-state={state} data-current={currentId === o.id || undefined}>
              <span className="timeline__label">{rowLabel(o)}</span>
              <div className="timeline__track">
                <span className="timeline__future" style={{ left: `${pct(asOf)}%` }} aria-hidden="true" />
                {!isMember ? (
                  <>
                    <span
                      className="timeline__lag"
                      style={{ left: `${pct(o.periodEnd)}%`, width: `${pct(o.knownAt) - pct(o.periodEnd)}%` }}
                      aria-hidden="true"
                    />
                    <span className="timeline__period" style={{ left: `${pct(o.periodEnd)}%` }} title={`Period end ${o.periodEnd}`} aria-hidden="true" />
                  </>
                ) : null}
                <span
                  className={`timeline__known${isMember ? " timeline__known--member" : ""}`}
                  style={{ left: `${pct(o.knownAt)}%` }}
                  title={`Known ${o.knownAt}`}
                  aria-hidden="true"
                />
                <span className="timeline__asof" style={{ left: `${pct(asOf)}%` }} aria-hidden="true" />
              </div>
              <span className="timeline__state mono">{state === "leak" ? "LEAK" : state === "used" ? "used" : "—"}</span>
            </div>
          );
        })}
        <figcaption id="timeline-caption" className="timeline__legend">
          <span>
            <i className="lg lg--period" /> period end
          </span>
          <span>
            <i className="lg lg--lag" /> publication delay
          </span>
          <span>
            <i className="lg lg--known" /> information becomes available
          </span>
          <span>
            <i className="lg lg--asof" /> as-of date · model can use data to the left
          </span>
          <span className="demo-note">Fictional companies, invented values</span>
        </figcaption>
        <details className="text-alt">
          <summary>Timeline as a table</summary>
          <table className="data-table">
            <thead>
              <tr>
                <th scope="col">Observation</th>
                <th scope="col">Describes</th>
                <th scope="col">Known</th>
                <th scope="col">Value</th>
                <th scope="col">{view === "naive" ? "Naive" : "PIT"} status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((o) => (
                <tr key={o.id}>
                  <td>{rowLabel(o)}</td>
                  <td>{o.kind === "membership" ? "—" : o.periodEnd}</td>
                  <td>{o.knownAt}</td>
                  <td>{o.value}</td>
                  <td>{rowState(o)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </details>
      </figure>

      <section className="reconstruct panel" aria-labelledby="reconstruct-title">
        <div className="reconstruct__head">
          <div>
            <h3 id="reconstruct-title">Reconstruct history</h3>
            <p>Rebuild the dataset exactly as it was knowable on {asOf}. Every rejection is explained.</p>
          </div>
          <button type="button" className="btn btn--research" onClick={start} disabled={reconstructing}>
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
                <span className="reconstruct__why">{d.reason}</span>
              </li>
            ))}
          </ol>
        ) : null}
        {ready ? (
          <div className="reconstruct__ready">
            <p className="mono">
              <span className="status-dot status-dot--research" aria-hidden="true" /> Point-in-time dataset ready ·{" "}
              {decisions.filter((d) => d.verdict === "accepted").length} accepted ·{" "}
              {decisions.filter((d) => d.verdict !== "accepted").length} rejected
            </p>
            <button type="button" className="btn" onClick={onRunExperiment}>
              Run experiment
            </button>
          </div>
        ) : null}
      </section>
    </div>
  );
}
