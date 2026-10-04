import { describe, expect, it } from "vitest";
import { engineeringRecords } from "@/content/archive";
import { about, resume } from "@/content/about";
import { financeCaseStudy, financeDecisions, negativeResults } from "@/content/financeiq";
import { notes } from "@/content/notes";
import { samsCaseStudy, samsDecisions } from "@/content/sams";
import { site } from "@/content/site";
import { vault } from "@/content/vault";

/** Every human-readable string in a value, skipping link targets. */
function strings(value: unknown, out: string[] = []): string[] {
  if (typeof value === "string") out.push(value);
  else if (Array.isArray(value)) value.forEach((v) => strings(v, out));
  else if (value && typeof value === "object") {
    for (const [k, v] of Object.entries(value)) if (k !== "href") strings(v, out);
  }
  return out;
}

const all = strings({ site, about, resume, engineeringRecords, vault, notes, samsCaseStudy, financeCaseStudy, negativeResults });

describe("content guards against invented history", () => {
  it("has no numbered experiments, decision IDs or note numbers", () => {
    for (const s of all) {
      expect(s, s).not.toMatch(/(Experiment|Run|Decision|Note)\s*#?\s*0\d\d\b/i);
      expect(s, s).not.toMatch(/#0\d\d\b/);
    }
    for (const d of [...samsDecisions, ...financeDecisions]) expect(d.key).toMatch(/^[A-Z]$/);
  });

  it("publishes notes as drafts with no number or date", () => {
    for (const n of notes) {
      expect(n.status).toBe("Draft");
      expect(n).not.toHaveProperty("date");
      expect(n).not.toHaveProperty("number");
    }
  });

  it("does not claim a WebGL experiment that never happened", () => {
    expect(all.join(" ")).not.toMatch(/WebGL/i);
  });

  it("never presents a system as online or live", () => {
    for (const s of all) expect(s, s).not.toMatch(/\b(online|live system)\b/i);
  });

  it("presents the MSc as in progress and FinanceIQ as an in-progress project, not a finished capstone", () => {
    expect(site.study.status).toBe("student");
    expect(financeCaseStudy.glance.status).toMatch(/in progress/i);
    for (const s of strings(financeCaseStudy)) expect(s, s).not.toMatch(/capstone/i);
    expect(resume.education[0]?.period).toMatch(/in progress/i);
  });

  it("labels SAMS test numbers as historical and denies production use", () => {
    const sams = strings(samsCaseStudy).join(" ");
    expect(sams).toMatch(/historical/i);
    expect(sams).toMatch(/not deployed to production|No production traffic/i);
    for (const s of strings(samsCaseStudy)) if (/543/.test(s)) expect(s).toMatch(/historical|prior private snapshot/i);
  });

  it("marks negative results as documented (with a source) or synthetic", () => {
    for (const r of negativeResults) {
      if (r.provenance === "documented") expect(r.source?.href).toMatch(/^https:\/\/github\.com\//);
    }
    expect(negativeResults.some((r) => r.provenance === "synthetic")).toBe(true);
  });
});
