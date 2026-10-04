import { modePairs } from "@/content/site";

/** Normalise a pathname to always end in a slash (matches trailingSlash export). */
export function normalizePath(path: string): string {
  const clean = path.split(/[?#]/)[0] ?? "/";
  return clean.endsWith("/") ? clean : `${clean}/`;
}

/** If `path` is one half of a lab/case-study pair, return the pair and which side it is. */
export function pairFor(path: string) {
  const p = normalizePath(path);
  for (const pair of modePairs) {
    if (p === pair.lab) return { pair, side: "lab" as const };
    if (p === pair.caseStudy) return { pair, side: "case" as const };
  }
  return null;
}

export function isActive(current: string, href: string): boolean {
  const c = normalizePath(current);
  const h = normalizePath(href);
  return h === "/" ? c === "/" : c === h || c.startsWith(h);
}
