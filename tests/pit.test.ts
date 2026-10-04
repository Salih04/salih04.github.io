import { describe, expect, it } from "vitest";
import { pitObservations } from "@/content/financeiq";
import { compareFact, detectLeakage, naive, pointInTime, reconstruct, syntheticScores } from "@/lib/pit";

const ids = (m: Map<string, { id: string }>) => [...m.values()].map((o) => o.id).sort();

describe("point-in-time reconstruction", () => {
  it("keeps only what was published by the as-of date", () => {
    expect(ids(pointInTime(pitObservations, "2020-03-31"))).toEqual(["a-q3-19", "a-q4-19", "b-q4-19", "c-member"]);
  });

  it("resolves revisions to the latest version known at the time", () => {
    const later = pointInTime(pitObservations, "2020-06-01");
    expect(later.get("Company A|EPS|Q4 2019")?.id).toBe("a-q4-19r");
    const earlier = pointInTime(pitObservations, "2020-03-01");
    expect(earlier.get("Company A|EPS|Q4 2019")?.id).toBe("a-q4-19");
  });

  it("naive data uses periods before publication and drops removed entities", () => {
    const nv = naive(pitObservations, "2020-03-31");
    expect(nv.get("Company A|EPS|Q1 2020")?.id).toBe("a-q1-20");
    expect(nv.get("Company A|EPS|Q4 2019")?.id).toBe("a-q4-19r");
    expect(nv.has("Company C|Universe|Membership")).toBe(false);
  });

  it("explains every rejection", () => {
    const decisions = reconstruct(pitObservations, "2020-03-31");
    const byId = Object.fromEntries(decisions.map((d) => [d.observation.id, d.verdict]));
    expect(byId["a-q1-20"]).toBe("unpublished");
    expect(byId["a-q4-19r"]).toBe("unpublished");
    expect(byId["a-q4-19"]).toBe("accepted");
    expect(reconstruct(pitObservations, "2020-06-01").find((d) => d.observation.id === "a-q4-19")?.verdict).toBe("superseded");
  });

  it("detects look-ahead, revision and survivorship leakage", () => {
    const kinds = detectLeakage(pitObservations, "2020-03-31").map((i) => i.kind).sort();
    expect(kinds).toEqual(["look-ahead", "look-ahead", "revision", "survivorship"]);
  });

  it("finds nothing to leak before any data exists", () => {
    expect(detectLeakage(pitObservations, "2019-07-01").filter((i) => i.kind !== "survivorship")).toEqual([]);
  });
});

describe("fact comparison and consequence", () => {
  it("shows the later correction as leakage on 31 March 2020", () => {
    const c = compareFact(pitObservations, "Company A|EPS|Q4 2019", "2020-03-31");
    expect(c.naive?.value).toBe(1.18);
    expect(c.available?.value).toBe(1.31);
    expect(c.verdict).toBe("revision-leak");
  });

  it("agrees once the correction has been published", () => {
    const c = compareFact(pitObservations, "Company A|EPS|Q4 2019", "2020-06-01");
    expect(c.verdict).toBe("match");
    expect(c.available?.value).toBe(1.18);
  });

  it("flags a value used before it was published, and a value nobody could know yet", () => {
    expect(compareFact(pitObservations, "Company A|EPS|Q1 2020", "2020-04-15").verdict).toBe("look-ahead");
    expect(compareFact(pitObservations, "Company A|EPS|Q1 2020", "2020-02-01").verdict).toBe("not-yet-available");
  });

  it("toy scores only diverge when facts leak", () => {
    const leaks = detectLeakage(pitObservations, "2020-03-31").length;
    const s = syntheticScores(leaks);
    expect(s.naive).toBeCloseTo(0.06);
    expect(s.pit).toBeCloseTo(0.01);
    expect(syntheticScores(0).naive).toBe(syntheticScores(0).pit);
  });
});

describe("survivorship in the comparison", () => {
  it("reports an entity missing from today's constituents", () => {
    const c = compareFact(pitObservations, "Company C|Universe|Membership", "2020-03-31");
    expect(c.verdict).toBe("survivorship");
    expect(c.naive).toBeUndefined();
    expect(c.available?.value).toBe(1);
  });
});

describe("membership after removal", () => {
  it("agrees once the entity has actually left the universe", () => {
    expect(compareFact(pitObservations, "Company C|Universe|Membership", "2020-10-01").verdict).toBe("match");
  });
});
