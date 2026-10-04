import { describe, expect, it } from "vitest";
import { execute } from "@/lib/terminal";

const ctx = { history: [], mode: "lab" as const };

describe("terminal", () => {
  it("navigates with open", () => {
    expect(execute("open sams", ctx).action).toEqual({ type: "navigate", href: "/sams/" });
    expect(execute("OPEN FinanceIQ", ctx).action).toEqual({ type: "navigate", href: "/financeiq/" });
  });

  it("opens case studies", () => {
    expect(execute("case financeiq", ctx).action).toEqual({ type: "navigate", href: "/financeiq/case-study/" });
  });

  it("supports the documented commands", () => {
    for (const cmd of ["help", "about", "projects", "archive", "notes", "resume", "contact", "status", "whoami", "history"]) {
      const r = execute(cmd, ctx);
      expect(r.lines.join("\n")).not.toMatch(/command not found/);
    }
    expect(execute("clear", ctx).action).toEqual({ type: "clear" });
  });

  it("reports unknown commands and destinations", () => {
    expect(execute("rm -rf /", ctx).lines[0]).toMatch(/command not found/);
    expect(execute("open nowhere", ctx).action).toBeUndefined();
  });

  it("switches mode", () => {
    expect(execute("mode case", ctx).action).toEqual({ type: "mode", mode: "case" });
  });
});

describe("terminal status vocabulary", () => {
  it("never reports a live or online system", () => {
    const out = execute("status", ctx).lines.join("\n");
    expect(out).not.toMatch(/ONLINE|ACTIVE\b|LIVE SYSTEM/);
    expect(out).toMatch(/IN PROGRESS/);
  });
});
