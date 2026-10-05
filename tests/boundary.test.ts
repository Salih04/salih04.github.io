import { describe, expect, it } from "vitest";
import { ALLOWED_HOSTS, scanText, siteHost } from "../scripts/public-boundary.mjs";

type Finding = { rule: string };
const rulesFor = (text: string, allowedEmails: string[] = []) =>
  (scanText(text, { allowedEmails }) as Finding[]).map((f) => f.rule);

describe("public boundary scanner", () => {
  it("allows public URLs and ordinary prose", () => {
    expect(rulesFor('github: "https://github.com/salih04"')).toEqual([]);
    expect(rulesFor("Durable orchestration with retry semantics.")).toEqual([]);
  });

  it("rejects material that must never be public", () => {
    expect(rulesFor("postgresql://user:pw@db:5432/app")).toContain("connection-string");
    expect(rulesFor("see https://admin.example.com/panel")).toContain("url");
    expect(rulesFor("host 10.0.4.17")).toContain("ip-address");
    expect(rulesFor("api.sams.internal")).toContain("internal-host");
    expect(rulesFor('const apiKey = "abcd1234efgh"')).toContain("secret-assignment");
    expect(rulesFor("tenant 3f2b8c9e-1d4a-4b6f-9e2a-7c5d1e0f8a9b")).toContain("uuid");
    expect(rulesFor("/home/salih/work/sams")).toContain("private-path");
    expect(rulesFor("ping someone@company.com")).toContain("email");
  });

  it("allows the published contact address only", () => {
    expect(rulesFor("hello@lab.dev", ["hello@lab.dev"])).toEqual([]);
  });

  it("allows the configured site origin and nothing else", () => {
    const allowedHosts = [...ALLOWED_HOSTS, siteHost("https://portfolio.example")!];
    const scan = (text: string) => (scanText(text, { allowedHosts }) as Finding[]).map((f) => f.rule);
    expect(scan('<link rel="canonical" href="https://portfolio.example/sams/"/>')).toEqual([]);
    expect(scan("https://admin.portfolio.example/")).toContain("url");
    expect(rulesFor("https://portfolio.example/")).toContain("url");
    expect(siteHost("")).toBeNull();
    expect(siteHost("not a url")).toBeNull();
  });

  it("honours an explicit per-line allowance", () => {
    expect(rulesFor("10.0.0.1 // boundary-allow: ip-address (documentation)")).toEqual([]);
  });
});
