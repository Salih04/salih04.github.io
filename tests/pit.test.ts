import { describe, expect, it } from "vitest";
import { pitObservations } from "@/content/financeiq";
import { detectLeakage, naive, pointInTime, reconstruct } from "@/lib/pit";

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
