/** Shared content shapes. Lab mode and Case Study Mode render the same records. */

export interface DecisionOption {
  key: string;
  label: string;
  detail: string;
}

/** An engineering decision, presented as a lab record. */
export interface DecisionRecord {
  id: string;
  title: string;
  problem: string;
  options: DecisionOption[];
  selected: string;
  reason: string;
  tradeoff: string;
  evidence: string;
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
}

export interface CaseStudy {
  slug: "sams" | "financeiq";
  name: string;
  fullName: string;
  lab: string;
  oneLiner: string;
  overview: string[];
  problem: { existed: string; difficulty: string[] };
  constraints: { technical: string[]; research: string[]; operational: string[] };
  role: { owned: string[]; context: string };
  architectureSummary: string;
  hardProblems: Titled[];
  decisions: DecisionRecord[];
  implementation: Titled[];
  evidence: EvidenceGroup[];
  didntWork: Lesson[];
  result: string[];
  next: string[];
}
