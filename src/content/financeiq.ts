import type { CaseStudy, DecisionRecord } from "./types";
import type { Observation } from "@/lib/pit";

/*
 * FinanceIQ — Point-in-Time Market Data Lab (MSc capstone).
 *
 * Every dataset and number rendered by the interactive lab is synthetic and
 * labelled as such. The interactions demonstrate the method; they do not
 * report research results.
 */

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

export interface PipelineStage {
  id: string;
  label: string;
  question: string;
  detail: string;
}

export const pipeline: PipelineStage[] = [
  { id: "ingest", label: "Ingestion", question: "When did we learn this?", detail: "Raw records are stored with the time they became available, not only the period they describe. Without that timestamp, history cannot be reconstructed later." },
  { id: "normalize", label: "Normalization", question: "Is this the same thing?", detail: "Identifiers, units and fiscal calendars are aligned so that a value means the same thing across sources and time." },
  { id: "store", label: "PIT store", question: "What did we know, and when?", detail: "Observations are bitemporal: the period they describe and the moment they were known. Revisions are added, never overwritten." },
  { id: "asof", label: "As-of query", question: "What was knowable on date D?", detail: "For any date, the store returns the latest version of each fact that had been published by then — and nothing published after." },
  { id: "features", label: "Features", question: "What can the model use?", detail: "Features are computed from as-of snapshots, so a feature on date D only depends on information available on date D." },
  { id: "validation", label: "Walk-forward validation", question: "Would this have worked then?", detail: "Models are trained on the past and tested on the following window, repeatedly, with a gap between train and test to stop overlap leaking." },
  { id: "evaluation", label: "Statistical evaluation", question: "Is this more than noise?", detail: "Results are tested for significance across folds, with correction for the number of hypotheses tried." },
  { id: "archive", label: "Archive", question: "What did we learn?", detail: "Every run — including the ones that failed — is stored with its configuration and fingerprint." },
];

export const consoleOptions = {
  universe: ["Synthetic universe · 120 assets", "Synthetic universe · 400 assets"],
  dateRange: ["2012 – 2020", "2015 – 2023"],
  signal: ["Earnings revision", "Value composite", "Momentum 12-1"],
  modelFamily: ["Linear (ridge)", "Gradient-boosted trees"],
  strategy: ["Long-short quintiles", "Long-only top decile"],
  validation: ["Walk-forward · expanding", "Walk-forward · rolling", "K-fold · shuffled"],
} as const;

export interface FailedExperiment {
  id: string;
  hypothesis: string;
  result: string;
  status: "Archived" | "Replaced";
  why: string;
}

export const failedExperiments: FailedExperiment[] = [
  {
    id: "021",
    hypothesis: "Signal improves forward returns.",
    result: "Not statistically significant.",
    status: "Archived",
    why: "Negative evidence prevents repeated mistakes.",
  },
  {
    id: "027",
    hypothesis: "Shuffled k-fold cross-validation is a fair estimate of out-of-sample performance.",
    result: "Apparent performance disappeared under walk-forward validation.",
    status: "Replaced",
    why: "Shuffling lets the model train on the future. The gap between the two estimates measured the leakage.",
  },
  {
    id: "031",
    hypothesis: "A fixed publication lag approximates when reports became available.",
    result: "Late filers leaked; early filers were needlessly delayed.",
    status: "Replaced",
    why: "Approximating availability is the problem PIT data exists to remove. Actual publication timestamps replaced the lag.",
  },
];

export const financeDecisions: DecisionRecord[] = [
  {
    id: "003",
    title: "Bitemporal storage over snapshots",
    problem: "Research needs the dataset exactly as it looked on any past date, including values that were later revised.",
    options: [
      { key: "A", label: "Bitemporal observations", detail: "Store the period a value describes and the time it became known; revisions append." },
      { key: "B", label: "Daily snapshots", detail: "Simple to query; storage grows with every day and gaps are unrecoverable." },
      { key: "C", label: "Latest values only", detail: "Smallest and fastest; history is overwritten and leakage is invisible." },
    ],
    selected: "A",
    reason: "It is the only option where any historical state can be reconstructed from first principles rather than from whatever happened to be saved.",
    tradeoff: "As-of queries are more complex and slower than reading a flat table.",
    evidence: "Reconstruction tests: for fixed as-of dates, the query returns exactly the hand-checked set of facts and nothing published afterwards.",
  },
  {
    id: "011",
    title: "Walk-forward validation, never shuffled folds",
    problem: "Standard k-fold cross-validation mixes past and future, so a model can be validated on periods older than those it was trained on.",
    options: [
      { key: "A", label: "Walk-forward with an embargo gap", detail: "Train on the past, test on the next window, leave a gap between them." },
      { key: "B", label: "Shuffled k-fold", detail: "More data per fold; leaks temporal information." },
      { key: "C", label: "Single train/test split", detail: "No leakage; one split is a single noisy estimate." },
    ],
    selected: "A",
    reason: "It matches how a model would actually have been used: trained on what was known and judged on what came next.",
    tradeoff: "Fewer effective training samples, especially in early folds.",
    evidence: "Experiment #027 — the same signal evaluated both ways. The gap between the two estimates is the leakage.",
  },
  {
    id: "015",
    title: "Universe membership is point-in-time too",
    problem: "Building the universe from today's constituents silently drops companies that were later delisted — survivorship bias.",
    options: [
      { key: "A", label: "As-of membership", detail: "Membership is an observation with its own availability date." },
      { key: "B", label: "Current constituents", detail: "Easy to obtain; biased toward survivors." },
    ],
    selected: "A",
    reason: "Leakage is not only about values; it is also about which entities exist in the dataset.",
    tradeoff: "Requires historical membership data, which is harder to source than prices.",
    evidence: "The reconstruction view keeps Company C in the universe before its removal date.",
  },
  {
    id: "019",
    title: "Every run has a fingerprint",
    problem: "Re-running an experiment months later produced different numbers and nobody could say which input had changed.",
    options: [
      { key: "A", label: "Hash configuration, data version and seed", detail: "The fingerprint identifies the run; identical inputs give identical results." },
      { key: "B", label: "Log parameters in notes", detail: "Better than nothing; incomplete by construction." },
    ],
    selected: "A",
    reason: "Reproducibility should be checkable by comparing two strings, not by reading notes.",
    tradeoff: "Strict determinism constrains parallel execution and some library choices.",
    evidence: "Determinism tests that run the same configuration twice and compare fingerprints and outputs.",
  },
];

export const financeCaseStudy: CaseStudy = {
  slug: "financeiq",
  name: "FinanceIQ",
  fullName: "Point-in-Time Market Data Lab",
  lab: "Market Data Research Lab",
  oneLiner: "A research pipeline that reconstructs what was actually knowable on any historical date, so financial experiments cannot quietly use the future.",
  overview: [
    "FinanceIQ is an MSc Data Science capstone about one question: when a backtest says a signal works, was every input really available at the time?",
    "The project builds point-in-time reconstruction, leakage-free validation and reproducible experiment tracking — and keeps the negative results.",
  ],
  problem: {
    existed: "Typical research datasets store the latest value of each fact. Revisions overwrite originals, reports appear on the date they describe rather than the date they were published, and delisted companies disappear.",
    difficulty: [
      "Look-ahead leakage is invisible in the data itself; it only shows up as results that are too good.",
      "Publication delays vary by company and by report.",
      "Revisions and restatements mean one period can have several true values over time.",
      "Survivorship bias hides in the universe, not in the values.",
    ],
  },
  constraints: {
    technical: ["As-of queries must be exact, not approximate", "Every run must be reproducible from its fingerprint"],
    research: ["Validation must respect time order", "Multiple hypotheses must be corrected for", "Negative results must be recorded with the same care as positive ones"],
    operational: ["Capstone timeline and a single researcher", "Data licensing: raw vendor data is never published"],
  },
  role: {
    owned: [
      "Research question, methodology and evaluation design",
      "Point-in-time data model and as-of reconstruction",
      "Validation framework and leakage audits",
      "Experiment tracking, reproducibility and reporting",
    ],
    context: "Sole author of the capstone. Raw data is licensed and not reproduced here; all interactive data on this site is synthetic.",
  },
  architectureSummary:
    "Raw records are ingested with their availability time, normalized, and stored as bitemporal observations. As-of queries produce historical snapshots, features are built only from those snapshots, and models are evaluated with walk-forward validation and statistical testing. Every run is fingerprinted and archived.",
  hardProblems: [
    { title: "Defining \"available\"", body: "Period end, filing date and the moment a dataset vendor recorded the value are different dates. The project had to pick the one a trader could actually have acted on and carry it through every stage." },
    { title: "Revisions without overwrites", body: "A restated quarter must not replace the original in history. Appending versions and resolving them at query time keeps both truths: what was reported, and what was known when." },
    { title: "Leakage through validation", body: "Even with clean data, shuffled cross-validation leaks the future. Walk-forward folds with an embargo gap closed that path." },
    { title: "Telling signal from noise", body: "Many hypotheses tested on the same history will produce some that look significant by chance. Correction for multiple testing turned several apparent wins into honest negatives." },
  ],
  decisions: financeDecisions,
  implementation: [
    { title: "Observation model", body: "Each fact carries an entity, a field, the period it describes, the time it became known and its value. Membership in the universe is modelled the same way." },
    { title: "As-of resolution", body: "For a given date, keep observations known by that date and resolve each fact to its latest known version." },
    { title: "Feature isolation", body: "Feature builders receive an as-of snapshot, never the full table, so leakage is prevented structurally." },
    { title: "Run registry", body: "Configuration, data version and seed are hashed into a fingerprint stored alongside results." },
  ],
  evidence: [
    { kind: "Tests", items: ["As-of reconstruction against hand-checked fixtures", "Determinism checks on repeated runs"] },
    { kind: "Experiments", items: ["Naive vs point-in-time datasets on the same signal", "Shuffled k-fold vs walk-forward on the same signal"] },
    { kind: "Methodology", items: ["Walk-forward validation with embargo", "Significance testing with multiple-testing correction", "Negative results archived with their fingerprints"] },
  ],
  didntWork: [
    { title: "Fixed publication lag", body: "Assuming every report becomes available a fixed number of days after period end was simple and wrong in both directions.", lesson: "If availability matters, store it — do not estimate it." },
    { title: "Shuffled cross-validation", body: "It produced the most flattering numbers in the project, and they disappeared under walk-forward validation.", lesson: "The most flattering estimate is the first one to distrust." },
  ],
  result: [
    "A pipeline that reconstructs the dataset as it was knowable on any date.",
    "Validation and auditing that make look-ahead leakage measurable.",
    "An archive in which negative results are first-class records.",
  ],
  next: ["Intraday availability timestamps", "Broader universes and asset classes", "A public, fully synthetic benchmark for leakage detection"],
};
