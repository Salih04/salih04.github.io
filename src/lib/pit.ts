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

const factKey = (o: Observation) => `${o.entity}|${o.field}|${o.period}`;

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
