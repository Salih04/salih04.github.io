import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { notes } from "../src/content/notes";
import { pages } from "../src/content/pages";
import { fullTitle, routeMetadata } from "../src/lib/metadata";
import { parseSiteUrl } from "../src/lib/siteUrl";

/** Static routes from src/app, as trailing-slash paths. */
function appRoutes(dir = "src/app", base = "/"): string[] {
  const found: string[] = [];
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (!statSync(path).isDirectory()) {
      if (entry === "page.tsx") found.push(base);
    } else if (!entry.startsWith("[")) {
      found.push(...appRoutes(path, `${base}${entry}/`));
    }
  }
  return found;
}

describe("site URL", () => {
  it("is absent until configured, and then an https origin only", () => {
    expect(parseSiteUrl(undefined)).toBeNull();
    expect(parseSiteUrl("  ")).toBeNull();
    expect(parseSiteUrl("https://portfolio.example")?.href).toBe("https://portfolio.example/");
    expect(parseSiteUrl("https://portfolio.example/")?.href).toBe("https://portfolio.example/");
    expect(() => parseSiteUrl("http://portfolio.example")).toThrow(/https/);
    expect(() => parseSiteUrl("https://portfolio.example/lab")).toThrow(/origin only/);
    expect(() => parseSiteUrl("portfolio.example")).toThrow(/valid URL/);
  });
});

describe("page metadata", () => {
  it("covers every static route", () => {
    expect(appRoutes().sort()).toEqual(Object.keys(pages).sort());
  });

  it("gives each route a distinct, concise title and a meaningful description", () => {
    const titles = Object.values(pages).map(fullTitle);
    expect(new Set(titles).size).toBe(titles.length);
    for (const [path, p] of Object.entries(pages)) {
      expect(fullTitle(p).length, path).toBeLessThanOrEqual(60);
      expect(p.description.length, path).toBeGreaterThanOrEqual(50);
      expect(p.description.length, path).toBeLessThanOrEqual(180);
    }
    expect(fullTitle(pages["/sams/"])).toBe("SAMS — S//LAB");
    expect(fullTitle(pages["/archive/"])).toBe("Engineering Archive — S//LAB");
    expect(pages["/"].title).toBe("S//LAB — Salih’s Interactive Research Portfolio");
  });

  it("never presents the MSc as completed", () => {
    for (const p of Object.values(pages)) expect(p.description).not.toMatch(/MSc (graduate|degree holder)|holds an MSc|completed/i);
  });

  it("keeps draft Lab Notes out of search indexes", () => {
    expect(notes.every((n) => n.status === "Draft")).toBe(true);
    expect(pages["/notes/"].index).toBe(false);
    expect(routeMetadata("/notes/x/", { title: "x", description: "x", index: false }).robots).toEqual({ index: false, follow: true });
  });

  it("emits no absolute URL or image without SITE_URL", () => {
    const m = routeMetadata("/sams/", pages["/sams/"]);
    expect(m.alternates).toBeUndefined();
    expect(m.openGraph?.url).toBeUndefined();
    expect(m.openGraph?.images).toBeUndefined();
  });
});
