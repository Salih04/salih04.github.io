import { describe, expect, it } from "vitest";
import { fingerprint, simulate, type ExperimentConfig } from "@/lib/experiment";

const base: ExperimentConfig = {
  dataset: "pit",
  validation: "walk-forward",
  model: "ridge",
  signal: "a",
  universe: "120",
  seed: 42,
};

describe("experiment simulator", () => {
  it("is deterministic for a configuration", () => {
    expect(simulate(base)).toEqual(simulate(base));
    expect(fingerprint(base)).toMatch(/^[0-9a-f]{8}$/);
  });

  it("changes fingerprint when any input changes", () => {
    expect(fingerprint({ ...base, seed: 43 })).not.toBe(fingerprint(base));
    expect(fingerprint({ ...base, dataset: "naive" })).not.toBe(fingerprint(base));
  });

  it("flags leakage when PIT is off or folds are shuffled", () => {
    expect(simulate(base).leakage).toEqual([]);
    expect(simulate({ ...base, dataset: "naive" }).leakage.length).toBeGreaterThan(0);
    expect(simulate({ ...base, validation: "shuffled" }).leakage.length).toBeGreaterThan(0);
  });

  it("leaky configurations look better on average than clean ones", () => {
    const mean = (dataset: ExperimentConfig["dataset"]) =>
      Array.from({ length: 40 }, (_, seed) => simulate({ ...base, dataset, seed }).meanIC).reduce((s, x) => s + x, 0) / 40;
    expect(mean("naive")).toBeGreaterThan(mean("pit"));
  });
});
