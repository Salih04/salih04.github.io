"use client";

import { useEffect, useRef, useState } from "react";
import { useLab } from "@/components/shell/LabProvider";
import { consoleOptions } from "@/content/financeiq";
import { runLog, simulate, type ExperimentConfig, type ExperimentResult } from "@/lib/experiment";
import { prefersReducedMotion } from "@/lib/useReducedMotion";

const LINE_MS = 520;
const FIRST_EXPERIMENT = 38;

const DEFAULT: ExperimentConfig = {
  universe: consoleOptions.universe[0],
  dateRange: consoleOptions.dateRange[0],
  signal: consoleOptions.signal[0],
  modelFamily: consoleOptions.modelFamily[0],
  strategy: consoleOptions.strategy[0],
  validation: consoleOptions.validation[0],
  seed: 38,
  pit: true,
};

type SelectKey = Exclude<keyof ExperimentConfig, "seed" | "pit">;

const LABELS: Record<SelectKey, string> = {
  universe: "Universe",
  dateRange: "Date range",
  signal: "Signal",
  modelFamily: "Model family",
  strategy: "Strategy",
  validation: "Validation",
};

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
      <figcaption className="eyebrow">Information coefficient per validation fold</figcaption>
      <div className="fold-chart__plot">
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Bar chart of ${result.folds.length} fold scores; mean ${result.meanIC.toFixed(3)}.`}>
          {[max, max / 2, 0, -max / 2, -max].map((v) => (
            <g key={v}>
              <line x1={pad.l} x2={W - pad.r} y1={y(v)} y2={y(v)} className={v === 0 ? "fold-chart__zero" : "fold-chart__grid"} />
              <text x={pad.l - 6} y={y(v) + 3} textAnchor="end" className="fold-chart__tick">
                {v.toFixed(2)}
              </text>
            </g>
          ))}
          {result.folds.map((f, i) => {
            const x = pad.l + band * i + (band - bw) / 2;
            const top = Math.min(y(f), zero);
            const h = Math.max(1, Math.abs(y(f) - zero));
            const r = Math.min(4, h);
            // Round only the data end; the baseline end stays square.
            const d =
              f >= 0
                ? `M${x} ${zero} V${top + r} Q${x} ${top} ${x + r} ${top} H${x + bw - r} Q${x + bw} ${top} ${x + bw} ${top + r} V${zero} Z`
                : `M${x} ${zero} V${zero + h - r} Q${x} ${zero + h} ${x + r} ${zero + h} H${x + bw - r} Q${x + bw} ${zero + h} ${x + bw} ${zero + h - r} V${zero} Z`;
            return (
              <g key={i} onPointerEnter={() => setHover(i)} onPointerLeave={() => setHover(null)}>
                <rect x={pad.l + band * i} y={pad.t} width={band} height={H - pad.t - pad.b} fill="transparent" />
                <path d={d} className={`fold-chart__bar${leaky ? " fold-chart__bar--leak" : ""}`} data-dim={hover !== null && hover !== i ? "" : undefined} style={{ animationDelay: `${i * 40}ms` }} />
                <text x={x + bw / 2} y={H - 8} textAnchor="middle" className="fold-chart__tick">
                  {i + 1}
                </text>
              </g>
            );
          })}
          <line x1={pad.l} x2={W - pad.r} y1={y(result.meanIC)} y2={y(result.meanIC)} className="fold-chart__mean" />
          <text x={W - pad.r + 6} y={y(result.meanIC) + 3} className="fold-chart__mean-label">
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

export function ExperimentConsole({ runToken }: { runToken: number }) {
  const { cue } = useLab();
  const [config, setConfig] = useState<ExperimentConfig>(DEFAULT);
  const [log, setLog] = useState<string[]>([]);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<ExperimentResult | null>(null);
  const [runs, setRuns] = useState(0);
  const timer = useRef<number | null>(null);

  const set = <K extends keyof ExperimentConfig>(key: K, value: ExperimentConfig[K]) => setConfig((c) => ({ ...c, [key]: value }));

  const run = (cfg: ExperimentConfig) => {
    if (timer.current) window.clearInterval(timer.current);
    const lines = runLog(cfg);
    const outcome = simulate(cfg);
    setResult(null);
    setRunning(true);
    setRuns((r) => r + 1);
    const finish = () => {
      setLog([...lines, "COMPLETE"]);
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

  useEffect(() => () => {
    if (timer.current) window.clearInterval(timer.current);
  }, []);

  // Arriving from "Reconstruct history": run with the PIT dataset.
  useEffect(() => {
    if (runToken === 0) return;
    const cfg = { ...config, pit: true };
    setConfig(cfg);
    run(cfg);
  }, [runToken]);

  const experimentNo = FIRST_EXPERIMENT + Math.max(0, runs - 1);

  const select = (k: SelectKey) => (
    <label className="field" key={k}>
      <span className="field__label">{LABELS[k]}</span>
      <select value={config[k]} onChange={(e) => set(k, e.target.value)} disabled={running}>
        {consoleOptions[k].map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </label>
  );

  return (
    <div className="console">
      <fieldset className="console__col panel">
        <legend className="eyebrow">Dataset</legend>
        {select("universe")}
        {select("dateRange")}
        {select("signal")}
        {select("modelFamily")}
      </fieldset>

      <fieldset className="console__col panel">
        <legend className="eyebrow">Experiment configuration</legend>
        {select("strategy")}
        {select("validation")}
        <label className="field">
          <span className="field__label">Seed</span>
          <input type="number" min={0} max={9999} value={config.seed} disabled={running} onChange={(e) => set("seed", Math.max(0, Math.min(9999, Number(e.target.value) || 0)))} />
        </label>
        <label className="field field--switch">
          <input type="checkbox" checked={config.pit} disabled={running} onChange={(e) => set("pit", e.target.checked)} />
          <span className="field__label">PIT mode</span>
          <span className="field__hint">{config.pit ? "As-of data only" : "Latest values — leaks the future"}</span>
        </label>
        <button type="button" className="btn btn--research console__run" onClick={() => run(config)} disabled={running}>
          {running ? "Running…" : "Run experiment"}
        </button>
      </fieldset>

      <section className="console__col console__results panel" aria-labelledby="results-title">
        <div className="console__results-head">
          <h3 id="results-title" className="eyebrow">
            {runs ? `Experiment #${String(experimentNo).padStart(3, "0")}` : "Results"}
          </h3>
          {result ? <span className="mono console__fp">fp {result.fingerprint}</span> : null}
        </div>
        {log.length === 0 && !result ? <p className="console__empty">Configure the experiment and run it. The run is deterministic: the same configuration always gives the same fingerprint and output.</p> : null}
        {log.length ? (
          <ol className="console__log mono" aria-live="polite">
            {log.map((l, i) => (
              <li key={i} data-complete={l === "COMPLETE" || undefined}>
                {l === "COMPLETE" ? l : `${l}…`}
              </li>
            ))}
          </ol>
        ) : null}
        {result ? (
          <div className="console__outcome">
            <FoldChart result={result} />
            <dl className="console__stats mono">
              <div>
                <dt>Mean IC</dt>
                <dd>{result.meanIC.toFixed(4)}</dd>
              </div>
              <div>
                <dt>t-statistic</dt>
                <dd>{result.tStat.toFixed(2)}</dd>
              </div>
              <div>
                <dt>Leakage audit</dt>
                <dd className={result.leakage.length ? "is-fail" : "is-pass"}>{result.leakage.length ? "✕ Failed" : "✓ Passed"}</dd>
              </div>
            </dl>
            {result.leakage.length ? (
              <ul className="console__leaks">
                {result.leakage.map((l) => (
                  <li key={l}>{l}</li>
                ))}
              </ul>
            ) : null}
            <p className="console__verdict">{result.verdict}</p>
          </div>
        ) : null}
        <p className="demo-note">Synthetic demonstration · illustrates the method; these are not research results</p>
      </section>
    </div>
  );
}
