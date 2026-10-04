import type { CaseStudy, DecisionRecord, SourceLink } from "./types";
import type { Observation } from "@/lib/pit";

/*
 * FinanceIQ — Point-in-Time Market Data Lab.
 *
 * MSc Data Science research / semester project at the University of Basel,
 * in progress. Its direction is point-in-time market-data and research
 * infrastructure. Planned capabilities are described as plans.
 *
 * Every dataset and number rendered by the interactive lab is synthetic and
 * labelled as such. The only real results quoted here come from the public
 * supporting research repository (public) and are cited to it.
 */

const REPO = "https://github.com/Salih04/capstone-financeIQ";

export const financeSources = {
  repository: { label: "Supporting research repository", href: REPO },
  results: { label: "RESULTS.md", href: `${REPO}/blob/main/RESULTS.md` },
  protocol: { label: "Point-in-time protocol", href: `${REPO}/blob/main/docs/PIT_PROTOCOL.md` },
} satisfies Record<string, SourceLink>;

/**
 * A deliberately small, fictional dataset for the PIT reconstruction
 * interaction. Companies are labelled A–C; values are invented.
 */
export const pitObservations: Observation[] = [
  { id: "a-q3-19", entity: "Company A", field: "EPS", period: "Q3 2019", periodEnd: "2019-09-30", knownAt: "2019-10-29", value: 1.12, kind: "report" },
  { id: "a-q4-19", entity: "Company A", field: "EPS", period: "Q4 2019", periodEnd: "2019-12-31", knownAt: "2020-02-14", value: 1.31, kind: "report" },
  { id: "a-q4-19r", entity: "Company A", field: "EPS", period: "Q4 2019", periodEnd: "2019-12-31", knownAt: "2020-05-08", value: 1.18, kind: "restatement" },
  { id: "a-q1-20", entity: "Company A", field: "EPS", period: "Q1 2020", periodEnd: "2020-03-31", knownAt: "2020-05-08", value: 0.74, kind: "report" },
  { id: "b-q4-19", entity: "Company B", field: "EPS", period: "Q4 2019", periodEnd: "2019-12-31", knownAt: "2020-03-27", value: 0.48, kind: "report" },
  { id: "b-q1-20", entity: "Company B", field: "EPS", period: "Q1 2020", periodEnd: "2020-03-31", knownAt: "2020-06-12", value: 0.21, kind: "report" },
  { id: "c-member", entity: "Company C", field: "Universe", period: "Membership", periodEnd: "2018-01-02", knownAt: "2018-01-02", value: 1, kind: "membership" },
  { id: "c-removed", entity: "Company C", field: "Universe", period: "Membership", periodEnd: "2020-09-15", knownAt: "2020-09-15", value: 0, kind: "membership" },
];

export const pitRange = { start: "2019-07-01", end: "2020-12-31", defaultAsOf: "2020-03-31" };

/** The fact the comparison panel opens on: it has a later correction. */
export const pitDefaultFact = "Company A|EPS|Q4 2019";

export interface PipelineStage {
  id: string;
  label: string;
  question: string;
  detail: string;
}

/** The method as a sequence of questions. Schematic: the target design, not a claim about what is built. */
export const pipeline: PipelineStage[] = [
  { id: "ingest", label: "Ingestion", question: "When did we learn this?", detail: "Records are stored with the time they became available, not only the period they describe. Without that timestamp, history cannot be reconstructed later." },
  { id: "normalize", label: "Normalization", question: "Is this the same thing?", detail: "Identifiers, units and fiscal calendars are aligned so that a value means the same thing across sources and time." },
  { id: "store", label: "PIT store", question: "What did we know, and when?", detail: "Observations carry two times: the period they describe and the moment they became known. Corrections are added, never overwritten." },
  { id: "asof", label: "As-of query", question: "What was knowable on date D?", detail: "For any date, return the latest version of each fact that had been published by then — and nothing published after." },
  { id: "features", label: "Features", question: "What can the model use?", detail: "Features are computed from as-of snapshots, so a feature on date D depends only on information available on date D." },
  { id: "validation", label: "Walk-forward evaluation", question: "Would this have worked then?", detail: "Models are trained on the past and tested on the following window, repeatedly, so no test period is ever older than its training data." },
  { id: "evaluation", label: "Statistical evaluation", question: "Is this more than noise?", detail: "Results are compared with a null distribution, corrected for the number of models tried, and read against the study's detection power." },
  { id: "archive", label: "Evidence archive", question: "What did we learn?", detail: "Every run — including the ones that failed — is kept with its inputs, so a result can be traced and re-run." },
];

/* ---- Experiment bench (simulation, synthetic data) --------------------- */

export const benchOptions = {
  dataset: [
    { value: "pit", label: "Point-in-time snapshot" },
    { value: "naive", label: "Naive · latest values" },
  ],
  validation: [
    { value: "walk-forward", label: "Walk-forward" },
    { value: "shuffled", label: "Shuffled k-fold" },
  ],
  model: [
    { value: "ridge", label: "Ridge" },
    { value: "gbt", label: "Gradient-boosted trees" },
  ],
  signal: [
    { value: "a", label: "Synthetic signal A" },
    { value: "b", label: "Synthetic signal B" },
    { value: "c", label: "Synthetic signal C" },
  ],
  universe: [
    { value: "120", label: "Synthetic · 120 assets" },
    { value: "400", label: "Synthetic · 400 assets" },
  ],
} as const;

/* ---- Negative results ------------------------------------------------- */

export interface NegativeResult {
  id: string;
  /** "documented": quoted from the public repository. "synthetic": an illustration. */
  provenance: "documented" | "synthetic";
  hypothesis: string;
  observation: string;
  interpretation: string;
  /** Why the record stays in the archive. */
  keep: string;
  status: string;
  source?: SourceLink;
}

export const negativeResults: NegativeResult[] = [
  {
    id: "lookahead",
    provenance: "documented",
    hypothesis: "One year of public company data ranks BIST stocks by their next-year return (equal-weight baseline).",
    observation:
      "The baseline looked like a weak signal: IC +0.150 (p = 0.017). An audit found that 31 of 40 features were annual statements used weeks before they were published. Re-evaluated point-in-time, the IC is +0.031 (p = 0.63).",
    interpretation: "The apparent signal came from information that did not exist yet on the simulated date.",
    keep: "Both results are kept, with the audit, so the correction can be checked.",
    status: "Original reading withdrawn · corrected result kept",
    source: financeSources.results,
  },
  {
    id: "guards",
    provenance: "documented",
    hypothesis: "The original dataset guards would catch timing leakage.",
    observation: "In a registered defect-injection check, timing leakage was not detected by the original guards.",
    interpretation: "A guard only protects against what it checks.",
    keep: "It records why the guard was replaced: the point-in-time guard now refuses any value whose availability timestamp is after the prediction time.",
    status: "Guard replaced",
    source: financeSources.results,
  },
  {
    id: "shuffled",
    provenance: "synthetic",
    hypothesis: "Shuffled k-fold cross-validation is a fair estimate on time-ordered data.",
    observation: "On the experiment bench's synthetic data, shuffled folds inflate the score; walk-forward evaluation removes the inflation.",
    interpretation: "Shuffling lets a model train on periods after its test window.",
    keep: "The bench shows the mechanism. It is an illustration, not a research result.",
    status: "Illustration",
  },
];

/* ---- Research decisions ------------------------------------------------ */

export const financeDecisions: DecisionRecord[] = [
  {
    key: "A",
    title: "Every value carries the time it became public",
    problem: "A backtest is only trustworthy if every input was available on the date it simulates. That cannot be checked unless availability is recorded.",
    options: [
      { key: "A", label: "Availability timestamp per value, enforced by a guard", detail: "A registry records when each feature became public; a guard refuses anything later than the prediction time." },
      { key: "B", label: "A fixed publication lag", detail: "Simple; wrong for late filers in one direction and early filers in the other." },
      { key: "C", label: "Period-end dating", detail: "Easiest; attaches results to the quarter they describe, weeks before publication." },
    ],
    selected: "A",
    reason: "If availability matters, store it and enforce it. Do not estimate it.",
    tradeoff: "Exact filing timestamps are expensive to collect, so conservative statutory deadlines stand in where they are missing.",
    evidence: "Applied in the public repository: a feature-availability registry and a guard, with tests that inject future-available features and check that each is rejected.",
    evidenceSource: financeSources.protocol,
    status: "Applied in the public repository",
  },
  {
    key: "B",
    title: "Walk-forward evaluation, never shuffled folds",
    problem: "Standard k-fold cross-validation mixes past and future, so a model can be tested on periods older than the ones it learned from.",
    options: [
      { key: "A", label: "Expanding-window walk-forward", detail: "Train on everything before the test year, then test on that year." },
      { key: "B", label: "Shuffled k-fold", detail: "More data per fold; leaks temporal information." },
      { key: "C", label: "Single train/test split", detail: "No leakage; one split is a single noisy estimate." },
    ],
    selected: "A",
    reason: "It matches how a model would actually have been used: trained on what was known and judged on what came next.",
    tradeoff: "Fewer training samples in early folds, and few test years overall.",
    evidence: "Applied in the public repository: expanding-window walk-forward evaluation with a within-year permutation null and correction across the models tried.",
    evidenceSource: financeSources.results,
    status: "Applied in the public repository",
  },
  {
    key: "C",
    title: "Keep the withdrawn result next to the corrected one",
    problem: "When an audit invalidates a result, deleting it hides how the conclusion changed and why.",
    options: [
      { key: "A", label: "Preserve both, with the audit between them", detail: "The original numbers are kept unedited and marked as withdrawn." },
      { key: "B", label: "Replace the result", detail: "Cleaner; the history of the claim disappears." },
    ],
    selected: "A",
    reason: "A negative result is evidence. It shows the method working, not failing.",
    tradeoff: "The record is longer and less flattering.",
    evidence: "The public repository keeps the original IC +0.150 (p = 0.017) and the point-in-time IC +0.031 (p = 0.63) side by side.",
    evidenceSource: financeSources.results,
    status: "Applied in the public repository",
  },
  {
    key: "D",
    title: "Corrections are appended, not overwritten",
    problem: "A later correction to a quarter must not erase the value that was originally published, or history cannot be reconstructed.",
    options: [
      { key: "A", label: "Bitemporal observations", detail: "Store the period a value describes and the time it became known; corrections append." },
      { key: "B", label: "Daily snapshots", detail: "Simple to query; storage grows with every day and gaps are unrecoverable." },
      { key: "C", label: "Latest values only", detail: "Smallest; history is overwritten and leakage becomes invisible." },
    ],
    selected: "A",
    reason: "It is the only option where any past information state can be rebuilt from first principles.",
    tradeoff: "As-of queries are more complex and slower than reading a flat table.",
    evidence: "Not yet verified: this is the design direction of the in-progress MSc project. The reconstruction view on this site demonstrates the idea on synthetic data.",
    status: "Design direction · in progress",
  },
  {
    key: "E",
    title: "The universe must be point-in-time too",
    problem: "Choosing companies from today's listings silently drops the ones that were later delisted — survivorship bias.",
    options: [
      { key: "A", label: "As-of membership", detail: "Membership is an observation with its own availability date." },
      { key: "B", label: "Current constituents", detail: "Easy to obtain; biased toward survivors." },
    ],
    selected: "A",
    reason: "Leakage is not only about values; it is also about which entities exist in the dataset.",
    tradeoff: "Historical membership data is much harder to source than prices.",
    evidence: "Open problem. Survivorship is documented as unresolved in the public repository; addressing it is part of the in-progress project.",
    evidenceSource: financeSources.results,
    status: "Open problem",
  },
];

/* ---- Case study -------------------------------------------------------- */

export const financeCaseStudy: CaseStudy = {
  slug: "financeiq",
  name: "FinanceIQ",
  fullName: "Point-in-Time Market Data Lab",
  lab: "Market Data Research Lab",
  oneLiner:
    "An MSc Data Science research project in progress: point-in-time market-data and research infrastructure, so that historical experiments only use information that was actually available at the time.",
  glance: {
    role: "Researcher",
    roleDetail: "Research design, methodology and validation.",
    project: "MSc Data Science research / semester project · University of Basel",
    status: "In progress · active development",
    problemLabel: "Research question",
    problem: "How can a historical experiment be restricted to the information that was actually available on each date it simulates?",
    approachLabel: "Method",
    approach: ["Availability-aware data", "Walk-forward evaluation", "Negative results preserved"],
    stack: ["Python", "scikit-learn", "FastAPI", "PostgreSQL"],
    evidence: [
      { text: "Documented look-ahead audit: IC +0.150 (p = 0.017) → +0.031 (p = 0.63) after point-in-time correction", href: financeSources.results.href },
    ],
  },
  problem: {
    summary:
      "Most research datasets store the latest value of each fact. Results are dated by the period they describe rather than the day they were published, corrections overwrite originals, and companies that disappeared are missing. A backtest built on such data can quietly use the future.",
    difficulty: [
      "Look-ahead leakage is invisible in the data itself; it only shows up as results that are too good.",
      "Publication delays vary by company and by report.",
      "Corrections mean one period can have several true values over time.",
      "Survivorship bias hides in which companies exist, not in the values.",
    ],
  },
  role: {
    summary: "Researcher on the project.",
    items: ["Research question, design and methodology", "Point-in-time data model and availability rules", "Evaluation design, statistical validation and leakage audits"],
    context:
      "The public repository states that research design, methodological decisions, acceptance criteria and validation are owned by Salih, with implementation produced by AI coding agents under a specification, review and CI-gate workflow. All interactive data on this site is synthetic.",
  },
  status: {
    summary:
      "In progress. The project's direction is point-in-time market-data and research infrastructure. Planned capabilities are not presented as finished.",
    items: [
      "Documented in the public repository: an availability registry and guard, walk-forward evaluation with permutation tests and power analysis, and an audit whose corrected result replaced an apparent signal.",
      "In progress: bitemporal storage of corrections, as-of reconstruction for any date, and point-in-time universe membership.",
    ],
    limits: [
      "Survivorship is unresolved in the documented study: its companies were chosen from current listings.",
      "Exact filing timestamps were not collected; conservative statutory deadlines were used.",
      "The documented study has three test years and can only detect large effects (|IC| ≈ 0.19 or more).",
    ],
    limitsSource: financeSources.results,
  },
  architectureSummary:
    "Records are ingested with their availability time, normalized, and stored with two times: the period they describe and the moment they became known. As-of queries produce historical snapshots, features are computed only from those snapshots, and models are evaluated walk-forward against a null distribution. Every run is kept with its inputs. The diagram is the target design of the in-progress project.",
  hardProblems: [
    { title: "Defining \"available\"", body: "Period end, filing date and the moment a value was recorded are different dates. The research has to pick the one a decision could actually have used and carry it through every stage." },
    { title: "Corrections without overwrites", body: "A corrected quarter must not replace the original in history. Appending versions and resolving them at query time keeps both truths: what was reported, and what was known when." },
    { title: "Leakage through validation", body: "Even with clean data, shuffled cross-validation leaks the future. Walk-forward evaluation closes that path." },
    { title: "Telling signal from noise", body: "With few test years, only large effects are detectable. A null result means \"no large edge\", not \"no edge\", and has to be reported that way." },
  ],
  decisions: financeDecisions,
  evidence: [
    {
      kind: "Documented in the public repository",
      items: [
        "Original result (preserved): equal-weight baseline IC +0.150, p = 0.017",
        "Audit: 31 of 40 features were annual statements used before publication",
        "Point-in-time re-evaluation: IC +0.031, p = 0.63; no model distinguishable from chance",
        "Power: minimum detectable |IC| ≈ 0.19 at 80 % power",
      ],
      source: financeSources.results,
    },
    {
      kind: "On this site",
      items: ["A tested as-of engine that drives the reconstruction view (synthetic data)", "A deterministic bench that shows how leakage inflates a score (synthetic data)"],
    },
  ],
  didntWork: {
    intro: "Approaches that failed, as documented in the public repository.",
    items: [
      { title: "Dating annual statements from 1 January", body: "Year-T statements were used from the first trading day of the next year, weeks before companies published them. The apparent signal disappeared once they were used after publication.", lesson: "If availability matters, store it — do not assume it." },
      { title: "Guards that did not check time", body: "The original dataset guards caught frozen snapshots and leaking return columns, but not timing leakage.", lesson: "A guard only protects against what it checks." },
      { title: "An end-of-March cutoff", body: "A March cutoff was rejected because it precedes the statutory filing deadline for some years.", lesson: "Check the cutoff against the worst-case publication date, not the typical one." },
    ],
    source: financeSources.results,
  },
  details: {
    constraints: [
      "As-of queries must be exact, not approximate",
      "Validation must respect time order",
      "Negative results are recorded with the same care as positive ones",
      "Raw source data is not reproduced on this site",
    ],
    implementation: [
      { title: "Observation model", body: "Each fact carries an entity, a field, the period it describes, the time it became known and its value. Universe membership is modelled the same way." },
      { title: "As-of resolution", body: "For a given date, keep observations known by that date and resolve each fact to its latest known version." },
      { title: "Feature isolation", body: "Feature builders receive an as-of snapshot, never the full table, so leakage is prevented structurally." },
      { title: "Run records", body: "Each run records its code version, input checksums and package versions." },
    ],
  },
};
