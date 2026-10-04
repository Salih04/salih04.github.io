/**
 * Point-in-time reconstruction.
 *
 * An observation describes a period (`periodEnd`) and becomes knowable at
 * `knownAt`. A *naive* dataset keys data by the period it describes and
 * always uses the latest revision. A *point-in-time* dataset only contains
 * what had been published by the as-of date, resolved to the latest version
 * known at that moment. The difference between the two is look-ahead leakage.
 */

export type ObservationKind = "report" | "restatement" | "membership";

export interface Observation {
  id: string;
  entity: string;
  field: string;
  period: string;
  /** ISO date the observation describes. */
  periodEnd: string;
  /** ISO date the observation became available. */
  knownAt: string;
  value: number;
  kind: ObservationKind;
}

export type Verdict = "accepted" | "unpublished" | "superseded";

export interface Decision {
  observation: Observation;
  verdict: Verdict;
  reason: string;
}

export interface LeakIssue {
  key: string;
  kind: "look-ahead" | "revision" | "survivorship";
  message: string;
}

export const factKey = (o: Observation) => `${o.entity}|${o.field}|${o.period}`;

const byKnownAt = (a: Observation, b: Observation) =>
  a.knownAt < b.knownAt ? -1 : a.knownAt > b.knownAt ? 1 : 0;

/** Resolve each fact to its latest version within `pool`. */
function latestByFact(pool: Observation[]): Map<string, Observation> {
  const out = new Map<string, Observation>();
  for (const o of [...pool].sort(byKnownAt)) out.set(factKey(o), o);
  return out;
}

/** What a careful researcher could have known on `asOf`. */
export function pointInTime(observations: Observation[], asOf: string): Map<string, Observation> {
  return latestByFact(observations.filter((o) => o.knownAt <= asOf));
}

/** What a naive dataset puts on `asOf`: anything describing a past period, latest revision. */
export function naive(observations: Observation[], asOf: string): Map<string, Observation> {
  const latest = latestByFact(observations);
  const out = new Map<string, Observation>();
  for (const [key, o] of latest) {
    // Membership in a naive universe is "today's constituents": removed entities vanish.
    if (o.kind === "membership") {
      if (o.value === 1) out.set(key, o);
      continue;
    }
    if (o.periodEnd <= asOf) out.set(key, o);
  }
  return out;
}

/** Explain, observation by observation, how the PIT dataset is reconstructed. */
export function reconstruct(observations: Observation[], asOf: string): Decision[] {
  const pit = pointInTime(observations, asOf);
  return [...observations].sort(byKnownAt).map((o) => {
    if (o.knownAt > asOf) {
      return { observation: o, verdict: "unpublished", reason: `Published ${o.knownAt}, after the as-of date. Not available yet.` };
    }
    const winner = pit.get(factKey(o));
    if (winner && winner.id !== o.id) {
      return {
        observation: o,
        verdict: "superseded",
        reason: `Superseded by a version known on ${winner.knownAt}.`,
      };
    }
    return { observation: o, verdict: "accepted", reason: `Published ${o.knownAt}. Known on the as-of date.` };
  });
}

/** Facts on which the naive dataset disagrees with the point-in-time truth. */
export function detectLeakage(observations: Observation[], asOf: string): LeakIssue[] {
  const pit = pointInTime(observations, asOf);
  const nv = naive(observations, asOf);
  const issues: LeakIssue[] = [];
  for (const [key, o] of nv) {
    const truth = pit.get(key);
    if (o.kind === "membership") continue;
    if (!truth) {
      issues.push({ key, kind: "look-ahead", message: `${o.entity} ${o.period} ${o.field} used before publication on ${o.knownAt}.` });
    } else if (truth.id !== o.id) {
      issues.push({ key, kind: "revision", message: `${o.entity} ${o.period} ${o.field} uses a revision published ${o.knownAt}.` });
    }
  }
  for (const [key, truth] of pit) {
    if (truth.kind === "membership" && truth.value === 1 && !nv.has(key)) {
      issues.push({ key, kind: "survivorship", message: `${truth.entity} was in the universe on this date but is missing from today's constituents.` });
    }
  }
  return issues;
}

export type FactVerdict = "match" | "revision-leak" | "look-ahead" | "survivorship" | "not-yet-available" | "absent";

export interface FactComparison {
  key: string;
  /** What a naive dataset holds for this fact on the as-of date. */
  naive: Observation | undefined;
  /** What had actually been published by the as-of date. */
  available: Observation | undefined;
  verdict: FactVerdict;
}

/** Compare one fact between the naive dataset and the point-in-time truth. */
export function compareFact(observations: Observation[], key: string, asOf: string): FactComparison {
  const nv = naive(observations, asOf).get(key);
  const available = pointInTime(observations, asOf).get(key);
  // A membership observation with value 0 means "not in the universe": nothing to compare.
  const removed = available?.kind === "membership" && available.value === 0;
  let verdict: FactVerdict;
  if (removed && !nv) verdict = "match";
  else if (!nv && !available) verdict = observations.some((o) => factKey(o) === key) ? "not-yet-available" : "absent";
  else if (nv && !available) verdict = "look-ahead";
  else if (!nv && available) verdict = "survivorship";
  else if (nv && available && nv.id !== available.id) verdict = "revision-leak";
  else verdict = "match";
  return { key, naive: nv, available, verdict };
}

/**
 * Toy "signal score" for the consequence readout. It is not a model: the
 * point-in-time score is a fixed weak baseline, and every leaked fact adds a
 * fixed amount of apparent signal. It shows the direction of the effect on
 * synthetic data, nothing more.
 */
export const SYNTHETIC_BASE_SCORE = 0.01;
export const SYNTHETIC_LEAK_LIFT = 0.0125;

export function syntheticScores(leaks: number): { naive: number; pit: number } {
  return { naive: SYNTHETIC_BASE_SCORE + SYNTHETIC_LEAK_LIFT * leaks, pit: SYNTHETIC_BASE_SCORE };
}
