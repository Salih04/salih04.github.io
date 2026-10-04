import { about } from "@/content/about";
import { notes } from "@/content/notes";
import { site } from "@/content/site";
import { vault } from "@/content/vault";

/**
 * Terminal command interpreter. Pure: it returns output lines and an
 * optional action, and the Terminal component performs the action. The
 * terminal is an alternative navigation layer — every destination here is
 * also reachable through ordinary links.
 */

export type TerminalAction =
  | { type: "navigate"; href: string }
  | { type: "clear" }
  | { type: "close" }
  | { type: "mode"; mode: "lab" | "case" };

export interface TerminalResult {
  lines: string[];
  action?: TerminalAction;
}

export interface TerminalContext {
  history: string[];
  mode: "lab" | "case";
}

const destinations: Record<string, { href: string; label: string }> = {
  lab: { href: "/lab/", label: "Control Room" },
  sams: { href: "/sams/", label: "SAMS — Agent Systems Lab" },
  financeiq: { href: "/financeiq/", label: "FinanceIQ — Market Data Research Lab" },
  archive: { href: "/archive/", label: "Engineering Archive" },
  vault: { href: "/vault/", label: "Experiment Vault" },
  notes: { href: "/notes/", label: "Lab Notes" },
  about: { href: "/about/", label: "About" },
  resume: { href: "/resume/", label: "Resume" },
  contact: { href: "/contact/", label: "Contact" },
  "case-studies": { href: "/case-studies/", label: "Case Studies" },
};

export const HELP: [string, string][] = [
  ["help", "List commands"],
  ["about", "Who runs this lab"],
  ["projects", "List labs and projects"],
  ["open <name>", "Open sams, financeiq, archive, vault, notes …"],
  ["case <name>", "Open a case study: sams, financeiq"],
  ["archive", "Engineering Archive"],
  ["vault", "Experiment Vault"],
  ["notes", "Lab Notes"],
  ["resume", "Resume"],
  ["contact", "Contact channels"],
  ["mode lab|case", "Switch between Lab and Case Study mode"],
  ["status", "Lab status"],
  ["whoami", "Identify the researcher"],
  ["history", "Commands run this session"],
  ["clear", "Clear the screen"],
  ["exit", "Close the terminal"],
];

const pad = (s: string, n: number) => s + " ".repeat(Math.max(1, n - s.length));

function go(key: string): TerminalResult {
  const dest = destinations[key];
  if (!dest) {
    return { lines: [`open: unknown destination '${key}'`, `try: ${Object.keys(destinations).join(", ")}`] };
  }
  return { lines: [`opening ${dest.label} …`], action: { type: "navigate", href: dest.href } };
}

export function execute(raw: string, ctx: TerminalContext): TerminalResult {
  const input = raw.trim();
  if (!input) return { lines: [] };
  const [cmd = "", ...args] = input.toLowerCase().split(/\s+/);
  const arg = args.join(" ");

  switch (cmd) {
    case "help":
    case "?":
      return { lines: ["Available commands:", ...HELP.map(([c, d]) => `  ${pad(c, 16)}${d}`), "", "Tip: every destination is also in the navigation. The terminal is optional."] };
    case "about":
      return { lines: [about.title.toUpperCase(), ...about.summary.map((s) => `  ${s}`), "", about.intro[0] ?? "", "", "run 'open about' for the full page"] };
    case "whoami":
      return { lines: [site.name, ...site.roles, "Building reliable intelligent systems."] };
    case "projects":
      return {
        lines: [
          "LABS",
          "  sams        SAMS — Spatial Agentic Management System",
          "  financeiq   FinanceIQ — Point-in-Time Market Data Lab",
          "  archive     Engineering Archive",
          `  vault       Experiment Vault · ${vault.length} samples`,
          `  notes       Lab Notes · ${notes.length} records`,
          "",
          "run 'open <name>' or 'case <name>'",
        ],
      };
    case "open":
    case "cd":
      if (!arg) return { lines: ["usage: open <name>"] };
      return go(arg.replace(/^\/+|\/+$/g, ""));
    case "case": {
      if (arg !== "sams" && arg !== "financeiq") return { lines: ["usage: case sams | case financeiq"] };
      return { lines: [`opening ${arg} case study …`], action: { type: "navigate", href: `/${arg}/case-study/` } };
    }
    case "archive":
    case "vault":
    case "notes":
    case "resume":
    case "lab":
      return go(cmd);
    case "contact": {
      const lines = ["CONTACT"];
      if (site.contact.email) lines.push(`  email    ${site.contact.email}`);
      lines.push(`  github   ${site.contact.github}`);
      lines.push("", "run 'open contact' for the page");
      return { lines };
    }
    case "mode": {
      if (arg !== "lab" && arg !== "case") return { lines: [`mode: currently '${ctx.mode}'. usage: mode lab | mode case`] };
      return { lines: [`switching to ${arg === "case" ? "Case Study" : "Lab"} mode …`], action: { type: "mode", mode: arg } };
    }
    case "status":
      return {
        lines: [
          "SYSTEM STATUS (interface state, not production telemetry)",
          "  SAMS                 ONLINE     scripted demonstration ready",
          "  Market Data Lab      ACTIVE     PIT reconstruction ready",
          "  Engineering Archive  AVAILABLE",
          `  Experiment Vault     ${vault.length} samples`,
          `  Lab Notes            ${notes.length} records`,
          `  Mode                 ${ctx.mode === "case" ? "CASE STUDY" : "LAB"}`,
        ],
      };
    case "history":
      return { lines: ctx.history.length ? ctx.history.map((h, i) => `  ${String(i + 1).padStart(3)}  ${h}`) : ["(no history)"] };
    case "clear":
    case "cls":
      return { lines: [], action: { type: "clear" } };
    case "exit":
    case "quit":
    case "close":
      return { lines: [], action: { type: "close" } };
    case "sudo":
      return { lines: ["Permission denied. This lab runs with least privilege."] };
    case "ls":
      return { lines: [Object.keys(destinations).join("  ")] };
    default:
      return { lines: [`command not found: ${cmd}`, "type 'help' for available commands"] };
  }
}
