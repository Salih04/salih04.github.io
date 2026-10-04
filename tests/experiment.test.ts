import { describe, expect, it } from "vitest";
import { fingerprint, simulate, type ExperimentConfig } from "@/lib/experiment";

const base: ExperimentConfig = {
  universe: "Synthetic universe · 120 assets",
  dateRange: "2012 – 2020",
  signal: "Earnings revision",
  modelFamily: "Linear (ridge)",
  strategy: "Long-short quintiles",
  validation: "Walk-forward · expanding",
  seed: 38,
  pit: true,
};

describe("experiment simulator", () => {
  it("is deterministic for a configuration", () => {
    expect(simulate(base)).toEqual(simulate(base));
    expect(fingerprint(base)).toMatch(/^[0-9a-f]{8}$/);
  });

  it("changes fingerprint when any input changes", () => {
    expect(fingerprint({ ...base, seed: 39 })).not.toBe(fingerprint(base));
    expect(fingerprint({ ...base, pit: false })).not.toBe(fingerprint(base));
  });

  it("flags leakage when PIT is off or folds are shuffled", () => {
    expect(simulate(base).leakage).toEqual([]);
    expect(simulate({ ...base, pit: false }).leakage.length).toBeGreaterThan(0);
    expect(simulate({ ...base, validation: "K-fold · shuffled" }).leakage.length).toBeGreaterThan(0);
  });

  it("leaky configurations look better on average than clean ones", () => {
    const mean = (pit: boolean) =>
      Array.from({ length: 40 }, (_, seed) => simulate({ ...base, pit, seed }).meanIC).reduce((s, x) => s + x, 0) / 40;
    expect(mean(false)).toBeGreaterThan(mean(true));
  });
});
