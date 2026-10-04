import { describe, expect, it } from "vitest";
import { modeForRoute, pairFor } from "@/lib/paths";

describe("route mode", () => {
  it("paired project routes define their own mode", () => {
    expect(modeForRoute("/sams/case-study/")).toBe("case");
    expect(modeForRoute("/financeiq/case-study")).toBe("case");
    expect(modeForRoute("/sams/")).toBe("lab");
  });

  it("unrelated routes never inherit case mode", () => {
    for (const p of ["/", "/lab/", "/resume/", "/vault/", "/about/", "/notes/", "/notes/designing-replayable-event-systems/", "/archive/"]) {
      expect(modeForRoute(p)).toBe("lab");
    }
  });

  it("finds the partner of a paired route", () => {
    expect(pairFor("/sams/case-study/#decisions")?.pair.lab).toBe("/sams/");
  });
});
