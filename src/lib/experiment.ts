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
  universe: string;
  dateRange: string;
  signal: string;
  modelFamily: string;
  strategy: string;
  validation: string;
  seed: number;
  pit: boolean;
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

export const PIPELINE_LOG = [
  "Preparing historical universe",
  "Loading valid point-in-time observations",
  "Applying publication lag",
  "Building features",
  "Walk-forward validation",
  "Statistical evaluation",
] as const;

/** Log lines for a run; the wording reflects the configuration. */
export function runLog(config: ExperimentConfig): string[] {
  const shuffled = config.validation.startsWith("K-fold");
  return [
    config.pit ? "Preparing historical universe (as-of membership)" : "Preparing universe from current constituents",
    config.pit ? "Loading valid point-in-time observations" : "Loading latest values (no availability filter)",
    config.pit ? "Applying publication lag from recorded timestamps" : "Skipping publication lag",
    "Building features",
    shuffled ? "K-fold validation (shuffled)" : "Walk-forward validation",
    "Statistical evaluation",
  ];
}

export function fingerprint(config: ExperimentConfig): string {
  const canonical = JSON.stringify([
    config.universe,
    config.dateRange,
    config.signal,
    config.modelFamily,
    config.strategy,
    config.validation,
    config.seed,
    config.pit,
  ]);
  return hash32(canonical).toString(16).padStart(8, "0");
}

const SIGNAL_EDGE: Record<string, number> = {
  "Earnings revision": 0.012,
  "Value composite": 0.006,
  "Momentum 12-1": 0.009,
};

export function simulate(config: ExperimentConfig, foldCount = 10): ExperimentResult {
  const fp = fingerprint(config);
  const rand = mulberry32(hash32(fp));
  const shuffled = config.validation.startsWith("K-fold");

  const leakage: string[] = [];
  let inflation = 0;
  if (!config.pit) {
    inflation += 0.035;
    leakage.push("Look-ahead: features use values before their publication date");
    leakage.push("Survivorship: universe built from current constituents");
  }
  if (shuffled) {
    inflation += 0.02;
    leakage.push("Temporal: shuffled folds train on periods after the test window");
  }

  const edge = SIGNAL_EDGE[config.signal] ?? 0.008;
  const noise = config.universe.includes("400") ? 0.02 : 0.03;
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
      : "Not statistically significant. Archived as negative evidence.";
  }

  return { fingerprint: fp, folds, meanIC: mean, tStat, significant, leakage, verdict };
}
