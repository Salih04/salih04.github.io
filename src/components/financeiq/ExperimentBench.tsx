"use client";

import { useEffect, useRef, useState } from "react";
import { FigureLabel } from "@/components/records/FigureLabel";
import { useLab } from "@/components/shell/LabProvider";
import { benchOptions } from "@/content/financeiq";
import { runLog, simulate, type ExperimentConfig, type ExperimentResult } from "@/lib/experiment";
import { prefersReducedMotion } from "@/lib/useReducedMotion";

const LINE_MS = 480;

const DEFAULT: ExperimentConfig = { dataset: "pit", validation: "walk-forward", model: "ridge", signal: "a", universe: "120", seed: 42 };

const PRESETS: { label: string; config: Partial<ExperimentConfig> }[] = [
  { label: "Clean run", config: { dataset: "pit", validation: "walk-forward" } },
  { label: "Leaky data", config: { dataset: "naive", validation: "walk-forward" } },
  { label: "Shuffled folds", config: { dataset: "pit", validation: "shuffled" } },
];

type SpecKey = Exclude<keyof ExperimentConfig, "seed">;
const SPEC: { key: SpecKey; label: string }[] = [
  { key: "dataset", label: "Dataset" },
  { key: "validation", label: "Validation" },
  { key: "model", label: "Model" },
  { key: "signal", label: "Signal" },
  { key: "universe", label: "Universe" },
];

/** Per-fold bar chart. One series, so no legend: the heading names it. */
function FoldChart({ result }: { result: ExperimentResult }) {
  const [hover, setHover] = useState<number | null>(null);
  const W = 440;
  const H = 200;
  const pad = { l: 40, r: 80, t: 12, b: 26 };
  const max = Math.max(0.12, ...result.folds.map((f) => Math.abs(f)));
  const y = (v: number) => pad.t + ((max - v) / (2 * max)) * (H - pad.t - pad.b);
  const band = (W - pad.l - pad.r) / result.folds.length;
  const bw = Math.min(22, band - 6);
  const zero = y(0);
  const leaky = result.leakage.length > 0;

  return (
    <figure className="fold-chart">
      <figcaption className="fold-chart__cap">Information coefficient (IC) per validation fold</figcaption>
      <div className="fold-chart__plot">
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Bar chart of ${result.folds.length} fold scores; mean ${result.meanIC.toFixed(3)}.`}>
          {[max, max / 2, 0, -max / 2, -max].map((v) => (
            <g key={v}>
              <line x1={pad.l} x2={W - pad.r} y1={y(v)} y2={y(v)} className={v === 0 ? "fold-chart__zero" : "fold-chart__grid"} />
              <text x={pad.l - 6} y={y(v) + 4} textAnchor="end" className="fold-chart__tick">
                {v.toFixed(2)}
              </text>
            </g>
          ))}
          {result.folds.map((f, i) => {
            const x = pad.l + band * i + (band - bw) / 2;
            const top = Math.min(y(f), zero);
            const h = Math.max(1, Math.abs(y(f) - zero));
            const r = Math.min(3, h);
            const d =
              f >= 0
                ? `M${x} ${zero} V${top + r} Q${x} ${top} ${x + r} ${top} H${x + bw - r} Q${x + bw} ${top} ${x + bw} ${top + r} V${zero} Z`
                : `M${x} ${zero} V${zero + h - r} Q${x} ${zero + h} ${x + r} ${zero + h} H${x + bw - r} Q${x + bw} ${zero + h} ${x + bw} ${zero + h - r} V${zero} Z`;
            return (
              <g key={i} onPointerEnter={() => setHover(i)} onPointerLeave={() => setHover(null)}>
                <rect x={pad.l + band * i} y={pad.t} width={band} height={H - pad.t - pad.b} fill="transparent" />
                <path d={d} className={`fold-chart__bar${leaky ? " fold-chart__bar--leak" : ""}`} data-dim={hover !== null && hover !== i ? "" : undefined} />
                <text x={x + bw / 2} y={H - 8} textAnchor="middle" className="fold-chart__tick">
                  {i + 1}
                </text>
              </g>
            );
          })}
          <line x1={pad.l} x2={W - pad.r} y1={y(result.meanIC)} y2={y(result.meanIC)} className="fold-chart__mean" />
          <text x={W - pad.r + 6} y={y(result.meanIC) + 4} className="fold-chart__mean-label">
            mean {result.meanIC.toFixed(3)}
          </text>
        </svg>
        {hover !== null ? (
          <div className="fold-chart__tip mono" style={{ left: `${((pad.l + band * (hover + 0.5)) / W) * 100}%` }}>
            Fold {hover + 1} · {result.folds[hover]?.toFixed(3)}
          </div>
        ) : null}
      </div>
      <details className="text-alt">
        <summary>Fold scores as a table</summary>
        <table className="data-table">
          <thead>
            <tr>
              <th scope="col">Fold</th>
              <th scope="col">IC</th>
            </tr>
          </thead>
          <tbody>
            {result.folds.map((f, i) => (
              <tr key={i}>
                <td>{i + 1}</td>
                <td>{f.toFixed(4)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}

/**
 * The experiment bench: a specification on the left, a deterministic run on
 * the right. Synthetic throughout; it shows how leakage inflates a score.
 */
export function ExperimentBench({ runToken }: { runToken: number }) {
  const { cue } = useLab();
  const [config, setConfig] = useState<ExperimentConfig>(DEFAULT);
  const [log, setLog] = useState<string[]>([]);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<ExperimentResult | null>(null);
  const [previous, setPrevious] = useState<ExperimentResult | null>(null);
  const [runs, setRuns] = useState(0);
  const timer = useRef<number | null>(null);
  const outRef = useRef<HTMLElement>(null);

  const set = <K extends keyof ExperimentConfig>(key: K, value: ExperimentConfig[K]) => setConfig((c) => ({ ...c, [key]: value }));

  const run = (cfg: ExperimentConfig) => {
    if (running) return;
    if (timer.current) window.clearInterval(timer.current);
    const lines = runLog(cfg);
    const outcome = simulate(cfg);
    setPrevious(result);
    setResult(null);
    setRunning(true);
    setRuns((r) => r + 1);
    const finish = () => {
      setLog([...lines, "Complete"]);
      setResult(outcome);
      setRunning(false);
      cue(outcome.leakage.length ? "warn" : "complete");
    };
    if (prefersReducedMotion()) {
      finish();
      return;
    }
    setLog([]);
    let i = 0;
    timer.current = window.setInterval(() => {
      i += 1;
      setLog(lines.slice(0, i));
      cue("tick");
      if (i >= lines.length) {
        if (timer.current) window.clearInterval(timer.current);
        timer.current = null;
        window.setTimeout(finish, LINE_MS);
      }
    }, LINE_MS);
  };

  useEffect(
    () => () => {
      if (timer.current) window.clearInterval(timer.current);
    },
    [],
  );

  // Arriving from "Reconstruct history": run with the point-in-time dataset.
  useEffect(() => {
    if (runToken === 0) return;
    const cfg = { ...config, dataset: "pit" as const };
    setConfig(cfg);
    run(cfg);
    outRef.current?.focus();
    // run only when the token changes
  }, [runToken]); // eslint-disable-line react-hooks/exhaustive-deps

  const runName = `Demo run ${String(Math.max(1, runs)).padStart(2, "0")}`;
  const sameAsPrevious = result && previous && result.fingerprint === previous.fingerprint;

  return (
    <div className="bench">
      <div className="bench__spec plate plate--paper">
        <FigureLabel fig="03" kind="simulation" className="plate__label" />
        <h3 className="bench__title">Experiment specification</h3>
        <div className="bench__presets" role="group" aria-label="Presets">
          {PRESETS.map((p) => (
            <button key={p.label} type="button" className="chip" onClick={() => setConfig((c) => ({ ...c, ...p.config }))}>
              {p.label}
            </button>
          ))}
        </div>
        <dl className="spec">
          {SPEC.map(({ key, label }) => (
            <div key={key} className="spec__row" data-flag={(key === "dataset" && config.dataset === "naive") || (key === "validation" && config.validation === "shuffled") || undefined}>
              <dt>
                <label htmlFor={`spec-${key}`}>{label}</label>
              </dt>
              <dd>
                <select id={`spec-${key}`} className="spec__select" value={config[key]} onChange={(e) => set(key, e.target.value as never)}>
                  {benchOptions[key].map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </dd>
            </div>
          ))}
          <div className="spec__row">
            <dt>
              <label htmlFor="spec-seed">Seed</label>
            </dt>
            <dd>
              <input
                id="spec-seed"
                className="spec__select spec__seed"
                type="number"
                min={0}
                max={9999}
                value={config.seed}
                onChange={(e) => set("seed", Math.max(0, Math.min(9999, Number(e.target.value) || 0)))}
              />
            </dd>
          </div>
        </dl>
        <button type="button" className="btn btn--research bench__run" onClick={() => run(config)} aria-disabled={running || undefined}>
          {running ? "Running…" : "Run demo"}
        </button>
      </div>

      <section className="bench__out plate" aria-labelledby="bench-title" ref={outRef} tabIndex={-1}>
        <FigureLabel fig="04" kind="synthetic" className="plate__label" />
        <div className="bench__out-head">
          <h3 id="bench-title" className="bench__title">
            {runs ? runName : "No run yet"}
          </h3>
          {result ? (
            <p className="bench__fp mono">
              fingerprint {result.fingerprint}
              {previous ? <span>{sameAsPrevious ? " · identical to the previous run" : ` · previous ${previous.fingerprint}`}</span> : null}
            </p>
          ) : null}
        </div>
        {log.length === 0 && !result ? (
          <p className="bench__empty">
            Choose a specification and run it. Runs are deterministic: the same inputs always give the same fingerprint and the same output.
          </p>
        ) : null}
        {log.length ? (
          <ol className="bench__log mono" aria-live="polite">
            {log.map((l, i) => (
              <li key={i} data-complete={l === "Complete" || undefined}>
                {l}
              </li>
            ))}
          </ol>
        ) : null}
        {result ? (
          <div className="bench__outcome">
            <FoldChart result={result} />
            <dl className="bench__stats">
              <div>
                <dt>Mean IC</dt>
                <dd>{result.meanIC.toFixed(3)}</dd>
              </div>
              <div>
                <dt>t-statistic</dt>
                <dd>{result.tStat.toFixed(2)}</dd>
              </div>
              <div>
                <dt>Leakage audit</dt>
                <dd className={result.leakage.length ? "is-fail" : "is-pass"}>{result.leakage.length ? "Failed" : "Passed"}</dd>
              </div>
            </dl>
            {result.leakage.length ? (
              <ul className="bench__leaks">
                {result.leakage.map((l) => (
                  <li key={l}>{l}</li>
                ))}
              </ul>
            ) : null}
            <p className="bench__verdict">{result.verdict}</p>
          </div>
        ) : null}
      </section>
    </div>
  );
}
