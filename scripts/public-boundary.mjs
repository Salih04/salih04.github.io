#!/usr/bin/env node
/**
 * Public information boundary scanner.
 *
 * Fails the build when publishable sources (or the exported site) contain
 * anything that must never be public: credentials, connection strings,
 * private endpoints, internal hostnames, private filesystem paths, internal
 * identifiers or unlisted email addresses. See docs/PUBLIC_BOUNDARY.md.
 *
 *   node scripts/public-boundary.mjs src   # source content and components
 *   node scripts/public-boundary.mjs out   # exported HTML after a build
 *
 * The site's own origin, SITE_URL (docs/DEPLOYMENT.md), is the one host added
 * to the allowlist at scan time: canonical links, Open Graph URLs and the
 * sitemap must name it. Nothing else about the rules depends on it.
 *
 * A line may opt out of a single rule with `boundary-allow: <rule-id>` and a
 * reason in a comment. Use sparingly; reviewers should question every one.
 */

import { readdirSync, readFileSync, statSync } from "node:fs";
import { extname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

/** Hosts that may appear in public URLs. w3.org and sitemaps.org appear as XML namespaces. */
export const ALLOWED_HOSTS = ["github.com", "www.w3.org", "w3.org", "www.sitemaps.org"];

/** @typedef {{ id: string, description: string, pattern: RegExp, allow?: (match: string) => boolean }} Rule */

/** The hostname of SITE_URL, if it is set and valid. */
export function siteHost(raw = process.env.SITE_URL) {
  try {
    return raw ? new URL(raw).hostname : null;
  } catch {
    return null;
  }
}

/** @param {string[]} allowedEmails @param {string[]} allowedHosts @returns {Rule[]} */
export function rules(allowedEmails = [], allowedHosts = ALLOWED_HOSTS) {
  return [
    {
      id: "private-key",
      description: "Private key material",
      pattern: /-----BEGIN [A-Z ]*PRIVATE KEY-----/g,
    },
    {
      id: "token",
      description: "Credential-shaped token",
      pattern: /\b(?:sk-[A-Za-z0-9_-]{16,}|AKIA[0-9A-Z]{16}|gh[pousr]_[A-Za-z0-9]{20,}|xox[abpr]-[A-Za-z0-9-]{10,}|AIza[0-9A-Za-z_-]{30,})/g,
    },
    {
      id: "secret-assignment",
      description: "Secret assigned to a literal",
      pattern: /\b(?:password|passwd|secret|api[_-]?key|access[_-]?token|client[_-]?secret)\s*[:=]\s*["'][^"'\s]{4,}["']/gi,
    },
    {
      id: "connection-string",
      description: "Database or broker connection string",
      pattern: /\b(?:postgres(?:ql)?|redis|rediss|mongodb(?:\+srv)?|mysql|amqp|kafka):\/\/\S*/gi,
    },
    {
      id: "url",
      description: "URL to a host that is not on the public allowlist",
      pattern: /\b(?:https?|wss?):\/\/[^\s"'`)<>\\]+/g,
      allow: (match) => {
        try {
          const host = new URL(match).hostname;
          return allowedHosts.includes(host);
        } catch {
          return false;
        }
      },
    },
    {
      id: "localhost",
      description: "Local or loopback endpoint",
      pattern: /\blocalhost:\d+/g,
    },
    {
      id: "ip-address",
      description: "IPv4 address",
      pattern: /\b(?:25[0-5]|2[0-4]\d|1?\d?\d)(?:\.(?:25[0-5]|2[0-4]\d|1?\d?\d)){3}\b/g,
    },
    {
      id: "internal-host",
      description: "Internal hostname",
      pattern: /\b[a-z0-9-]+(?:\.[a-z0-9-]+)*\.(?:internal|corp|intranet|lan)\b/gi,
    },
    {
      id: "private-path",
      description: "Private filesystem path",
      pattern: /(?:\/home\/[a-z_][\w-]*\/|\/Users\/[A-Za-z][\w-]*\/|[A-Z]:\\Users\\)/g,
    },
    {
      id: "uuid",
      description: "Internal identifier (UUID)",
      pattern: /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi,
    },
    {
      id: "email",
      description: "Email address that is not the published contact address",
      pattern: /[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}/g,
      allow: (match) => allowedEmails.includes(match.toLowerCase()),
    },
  ];
}

/**
 * @param {string} text
 * @param {{ allowedEmails?: string[], allowedHosts?: string[] }} [options]
 * @returns {{ rule: string, description: string, line: number, match: string }[]}
 */
export function scanText(text, options = {}) {
  const findings = [];
  const lines = text.split(/\r?\n/);
  const active = rules((options.allowedEmails ?? []).map((e) => e.toLowerCase()), options.allowedHosts ?? ALLOWED_HOSTS);
  lines.forEach((line, i) => {
    for (const rule of active) {
      if (line.includes(`boundary-allow: ${rule.id}`)) continue;
      for (const m of line.matchAll(rule.pattern)) {
        if (rule.allow?.(m[0])) continue;
        findings.push({ rule: rule.id, description: rule.description, line: i + 1, match: m[0] });
      }
    }
  });
  return findings;
}

/** The contact email published in src/content/site.ts, if any. */
export function publishedEmails(root) {
  try {
    const site = readFileSync(join(root, "src/content/site.ts"), "utf8");
    const m = site.match(/email:\s*"([^"]*)"/);
    return m && m[1] ? [m[1]] : [];
  } catch {
    return [];
  }
}

const SOURCE_EXTENSIONS = new Set([".ts", ".tsx", ".js", ".mjs", ".css", ".md", ".json", ".txt"]);
const EXPORT_EXTENSIONS = new Set([".html", ".txt", ".json", ".xml", ".webmanifest"]);

function* walk(dir) {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) {
      // Framework bundles are third-party code, not portfolio content.
      if (entry === "node_modules" || entry === "_next") continue;
      yield* walk(path);
    } else {
      yield path;
    }
  }
}

function main() {
  const root = fileURLToPath(new URL("..", import.meta.url));
  const target = process.argv[2] ?? "src";
  const dir = join(root, target);
  const extensions = target === "out" ? EXPORT_EXTENSIONS : SOURCE_EXTENSIONS;
  const allowedEmails = publishedEmails(root);
  const host = siteHost();
  const allowedHosts = host ? [...ALLOWED_HOSTS, host] : ALLOWED_HOSTS;

  let count = 0;
  let files = 0;
  for (const file of walk(dir)) {
    if (!extensions.has(extname(file))) continue;
    files++;
    for (const f of scanText(readFileSync(file, "utf8"), { allowedEmails, allowedHosts })) {
      count++;
      console.error(`${relative(root, file)}:${f.line}  [${f.rule}] ${f.description}: ${f.match}`);
    }
  }

  if (count > 0) {
    console.error(`\nPublic boundary check failed: ${count} finding(s) in ${target}/. See docs/PUBLIC_BOUNDARY.md.`);
    process.exit(1);
  }
  console.log(`Public boundary check passed: ${files} file(s) in ${target}/${host ? ` (site origin: ${host})` : ""}.`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main();
}
