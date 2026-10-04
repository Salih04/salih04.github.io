import { gaussian, hash32, mulberry32 } from "./prng";

/**
 * Deterministic experiment simulator for the FinanceIQ console.
 *
 * It does not run machine learning. It generates synthetic per-fold
 * information coefficients whose structure demonstrates the method: a weak
 * genuine signal, plus inflation that appears only when the configuration
 * leaks the future (naive data or shuffled folds).
 */

export interface ExperimentConfig {
  dataset: "pit" | "naive";
  validation: "walk-forward" | "shuffled";
  model: string;
  signal: string;
  universe: string;
  seed: number;
}

export interface ExperimentResult {
  fingerprint: string;
  folds: number[];
  meanIC: number;
  tStat: number;
  significant: boolean;
  leakage: string[];
  verdict: string;
}

/** Log lines for a run; the wording reflects the configuration. */
export function runLog(config: ExperimentConfig): string[] {
  const pit = config.dataset === "pit";
  return [
    pit ? "Universe from as-of membership" : "Universe from current constituents",
    pit ? "Loading values published by each date" : "Loading latest values (no availability filter)",
    "Building features",
    config.validation === "shuffled" ? "Shuffled k-fold validation" : "Walk-forward validation",
    "Comparing with a null distribution",
  ];
}

/** Same inputs, same fingerprint: the identity of a run. */
export function fingerprint(config: ExperimentConfig): string {
  const canonical = JSON.stringify([config.dataset, config.validation, config.model, config.signal, config.universe, config.seed]);
  return hash32(canonical).toString(16).padStart(8, "0");
}

const SIGNAL_EDGE: Record<string, number> = { a: 0.012, b: 0.006, c: 0.009 };

export function simulate(config: ExperimentConfig, foldCount = 10): ExperimentResult {
  const fp = fingerprint(config);
  const rand = mulberry32(hash32(fp));
  const shuffled = config.validation === "shuffled";

  const leakage: string[] = [];
  let inflation = 0;
  if (config.dataset === "naive") {
    inflation += 0.035;
    leakage.push("Look-ahead: features use values before their publication date");
    leakage.push("Survivorship: universe built from current constituents");
  }
  if (shuffled) {
    inflation += 0.02;
    leakage.push("Temporal: shuffled folds train on periods after the test window");
  }

  const edge = SIGNAL_EDGE[config.signal] ?? 0.008;
  const noise = config.universe === "400" ? 0.02 : 0.03;
  const folds = Array.from({ length: foldCount }, () => edge + inflation + noise * gaussian(rand));

  const mean = folds.reduce((s, x) => s + x, 0) / folds.length;
  const variance = folds.reduce((s, x) => s + (x - mean) ** 2, 0) / (folds.length - 1);
  const tStat = mean / Math.sqrt(variance / folds.length);
  // Two-sided, roughly p < 0.05 for 9 degrees of freedom.
  const significant = Math.abs(tStat) > 2.262;

  let verdict: string;
  if (leakage.length > 0) {
    verdict = significant
      ? "Looks significant — but the leakage audit failed, so the result is invalid."
      : "Leakage audit failed; result is invalid regardless of significance.";
  } else {
    verdict = significant
      ? "Significant under leakage-free validation. Candidate for replication."
      : "Not statistically significant. Kept as a negative result.";
  }

  return { fingerprint: fp, folds, meanIC: mean, tStat, significant, leakage, verdict };
}
