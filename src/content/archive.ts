import type { SourceLink } from "./types";

/*
 * Engineering Archive — professional work.
 *
 * Public boundary: describe the role and the kind of work, at a high level.
 * Never internal systems, code, ticket IDs, feature names, private APIs,
 * telemetry schemas, data or anything an employer would consider
 * confidential. Each record states the basis for its fields. A record with
 * nothing more established stays minimal: no invented responsibilities.
 */

export interface EngineeringRecord {
  id: string;
  organisation: string;
  role: string;
  period: string;
  summary?: string;
  /** Kind of work, as high-level areas approved for publication. */
  area?: string[];
  tech?: string[];
  context?: string;
  /** What the fields rest on: a public source and/or Salih's confirmation. */
  basis: { text: string; link?: SourceLink };
  boundary: string;
  /** What the record deliberately leaves out. */
  omitted: string[];
}

const PROFILE: SourceLink = { label: "Public GitHub profile", href: "https://github.com/Salih04" };

const OMITTED = ["Internal systems", "Implementation details", "Proprietary code", "Internal tools and tickets", "Internal data"];

/** Numbered in order of time; listed newest first. */
export const engineeringRecords: EngineeringRecord[] = [
  {
    id: "ER-02",
    organisation: "Crytek",
    role: "Backend Engineering Intern",
    period: "May–Jul 2026",
    summary: "Backend engineering internship: Go services, telemetry and automated testing for the live game backend of Hunt: Showdown.",
    area: ["Backend services", "Telemetry", "Automated testing"],
    tech: ["Go"],
    context: "Live game backend · Hunt: Showdown",
    basis: { text: "Role, period, Go and context from the public profile; areas confirmed by Salih for publication", link: PROFILE },
    boundary: "Internal systems, implementation details, proprietary code and telemetry schemas are intentionally omitted.",
    omitted: OMITTED,
  },
  {
    id: "ER-01",
    organisation: "Crytek",
    role: "QA Intern",
    period: "Feb–Apr 2026",
    basis: { text: "Role and period confirmed by Salih. No further detail is published for this record." },
    boundary: "Internal systems, implementation details and proprietary code are intentionally omitted.",
    omitted: OMITTED,
  },
];

/** Other records in the facility: the two project reports, cross-referenced from the archive. */
export const crossReferences: { id: string; title: string; kind: string; href: string }[] = [
  { id: "02", title: "SAMS", kind: "Independent engineering project · engineering report", href: "/sams/case-study/" },
  { id: "03", title: "FinanceIQ", kind: "MSc research project · in progress · research report", href: "/financeiq/case-study/" },
];
