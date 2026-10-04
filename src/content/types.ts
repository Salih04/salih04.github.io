/** Shared content shapes. Lab mode and Case Study Mode render the same records. */

/**
 * The three figure classes. Every interactive or diagrammatic view carries
 * exactly one; verified project facts carry none, so the absence of a label
 * is meaningful.
 */
export type FigureKind = "simulation" | "synthetic" | "schematic";

/** A public source a claim can be checked against. */
export interface SourceLink {
  label: string;
  href: string;
}

export interface DecisionOption {
  key: string;
  label: string;
  detail: string;
}

/**
 * An engineering or research decision, presented as a record. Records are
 * labelled with letters (A, B, C …) inside one project; the letters carry no
 * history and imply no wider log.
 */
export interface DecisionRecord {
  key: string;
  title: string;
  /** The need the decision answers. Describes the problem, never an invented incident. */
  problem: string;
  /** The design space for this class of problem. */
  options: DecisionOption[];
  selected: string;
  reason: string;
  tradeoff: string;
  evidence: string;
  /** Where the evidence can be checked. Absent: design rationale only. */
  evidenceSource?: SourceLink;
  /** Whether the decision is applied or still a design direction. */
  status?: string;
}

export interface Titled {
  title: string;
  body: string;
}

export interface Lesson extends Titled {
  lesson: string;
}

export interface EvidenceGroup {
  kind: string;
  items: string[];
  source?: SourceLink;
}

/** The "At a glance" plate: everything a reader needs in under 30 seconds. */
export interface Glance {
  role: string;
  /** What the role covered, in one line. */
  roleDetail?: string;
  project: string;
  team?: string;
  status: string;
  /** "Core challenge" for engineering, "Research question" for research. */
  problemLabel?: string;
  problem: string;
  approachLabel?: string;
  approach: string[];
  stack: string[];
  evidence: { text: string; href?: string }[];
}

export interface CaseStudy {
  slug: "sams" | "financeiq";
  name: string;
  fullName: string;
  lab: string;
  oneLiner: string;
  glance: Glance;
  problem: { summary: string; difficulty: string[] };
  role: { summary: string; items: string[]; context: string };
  /** Result / current status, including what the evidence does not show. */
  status: { summary: string; items: string[]; limits: string[]; limitsSource?: SourceLink };
  architectureSummary: string;
  hardProblems: Titled[];
  decisions: DecisionRecord[];
  evidence: EvidenceGroup[];
  didntWork: { intro: string; items: Lesson[]; source?: SourceLink };
  details: { constraints: string[]; implementation: Titled[] };
}
