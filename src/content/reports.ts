import type { SourceLink } from "./types";

export type ReportBlock =
  | { kind: "paragraph"; text: string }
  | { kind: "code"; text: string }
  | { kind: "table"; caption: string; columns: string[]; rows: string[][] }
  | { kind: "figure"; src: string; alt: string; caption: string }
  | { kind: "architecture" }
  | { kind: "links"; links: (SourceLink & { download?: boolean })[] };

export interface ProjectReport {
  name: string;
  title: string;
  intro: string;
  accent: "research" | "signal";
  labHref: string;
  role: string;
  project: string;
  status: string;
  checked: string;
  repository: SourceLink;
  sections: { id: string; title: string; blocks: ReportBlock[]; sources?: SourceLink[] }[];
}

const financeSource = (path: string) =>
  `https://github.com/Salih04/capstone-financeIQ/blob/7243c5efa7d00ff45200cfa7589cebd2f3ba0017/${path}`;
const samsSource = (path: string) =>
  `https://github.com/Salih04/sams-reliability-core/blob/04fb61b8b072a798293249b10a2f23ff7d5bfbae/${path}`;

export const financeReport: ProjectReport = {
  name: "FinanceIQ",
  title: "Reproducible ML Benchmarking & Validation",
  intro: "A positive control failed. Later, an apparent financial signal disappeared after a timing audit. This is how I checked the evaluation and kept both results in the record.",
  accent: "research",
  labHref: "/financeiq/",
  role: "MSc student · research and validation",
  project: "FinanceIQ · data research project",
  status: "In progress · no predictive edge established",
  checked: "12 October 2026",
  repository: { label: "Public research repository", href: "https://github.com/Salih04/capstone-financeIQ" },
  sections: [
    {
      id: "question", title: "The question I started with",
      blocks: [
        { kind: "paragraph", text: "Could company information from one year help rank Borsa Istanbul stocks by their next-year returns? The recorded evaluation used 81 companies, 40 features, and three expanding-window test years. Six models—OLS, ridge, lasso, elastic net, random forest, and gradient boosting—were compared with rank baselines." },
        { kind: "paragraph", text: "I measured Spearman information coefficient (IC): the rank correlation of predictions and realised returns within each test year. The pooled statistic was the mean of those yearly correlations. Targets were permuted within years to form a null distribution, and the six ML tests used Bonferroni correction." },
        { kind: "paragraph", text: "I am an MSc Data Science student and a junior developer. My work on FinanceIQ covers research questions, evaluation rules, and checking the resulting artifacts. I use AI coding agents for implementation and review. The code and saved results matter here because a polished explanation alone cannot tell me whether an experiment worked." },
        { kind: "paragraph", text: "The original walk-forward study was exploratory, not preregistered. Later control experiments had written registrations. The corrected financial evaluation was registered before its outcomes, but after the original result and audit were known. Those are different levels of evidence." },
      ],
      sources: [{ label: "Design, results and limitations", href: financeSource("RESULTS.md") }],
    },
    {
      id: "positive-control", title: "The positive control did not pass",
      blocks: [
        { kind: "paragraph", text: "Before interpreting a null result, I wanted to know whether the pipeline could recover a relationship inserted deliberately into its input. The primary control used the equity column as a carrier, injected a synthetic relationship before feature construction, and fitted ridge." },
        { kind: "paragraph", text: "The original gate required recovered IC to increase strictly across the injection grid and the required high-strength levels to reject. The observed draw met neither condition. Its result remains NOT PASSED. Descriptive repetitions detected an injected IC of 0.3 in 123 of 200 trials (61.5%), compared with 186 of 200 (93%) at 0.4." },
        { kind: "paragraph", text: "There is also a registration caveat: file modification times and matching provenance hashes support the Stage 1 chronology, but no pre-run Git commit proves it. I cannot describe that order as independently Git-proven." },
        { kind: "paragraph", text: "Stage 1b was a separate calibration, registered before its run but with the earlier outcomes already known. It added the 0.35 grid point and used 400 fresh repetitions per level. The historical detection rule stayed fixed at min(1, 5 × raw p) < 0.05. There was no scientific pass/fail gate, so calibration could not turn the earlier failure into a pass." },
        {
          kind: "table", caption: "Stage 1b · synthetic injection into one raw feature · ridge",
          columns: ["Injected IC", "Detections", "Rate", "Wilson 95% interval"],
          rows: [
            ["0.00", "0 / 400", "0.00%", "0.00–0.95%"],
            ["0.10", "1 / 400", "0.25%", "0.04–1.40%"],
            ["0.20", "45 / 400", "11.25%", "8.51–14.72%"],
            ["0.30", "243 / 400", "60.75%", "55.88–65.41%"],
            ["0.35", "347 / 400", "86.75%", "83.08–89.73%"],
            ["0.40", "384 / 400", "96.00%", "93.60–97.52%"],
          ],
        },
        { kind: "figure", src: "/case-studies/financeiq/calibration.svg", alt: "Detection rate rises from zero at injected IC 0 to 96 percent at 0.4; all six point estimates and intervals are listed in the preceding table.", caption: "Recorded control results, recounted from saved p-values. Bars are pointwise Wilson 95% intervals. No threshold is interpolated between grid points." },
        { kind: "paragraph", text: "These probabilities describe synthetic injections on one fixed panel. They do not measure how often a real trading signal would succeed. At zero injection, the other real features still remain, so that rung is not a pure no-signal world." },
      ],
      sources: [
        { label: "Stage 1 report", href: financeSource("experiments/results_thesis/positive_control/positive_control_report.md") },
        { label: "Protocol and chronology note", href: financeSource("docs/thesis/PRE_EXPERIMENT_PROTOCOL.md") },
        { label: "Stage 1b calibration", href: financeSource("experiments/results_thesis/positive_control_calibration/positive_control_calibration_report.md") },
      ],
    },
    {
      id: "negative-controls", title: "Checking false positives across six models",
      blocks: [
        { kind: "paragraph", text: "Stage 2 used two negative-control constructions. One replaced features with rank-Gaussian noise and row-permuted missingness patterns. The other permuted targets within feature-year groups across the training and test years. All six models were retrained using the frozen splits." },
        { kind: "paragraph", text: "This registration was prospective but not blind: the calibration, earlier mask diagnostics, and repairs to the significance implementation were already known. Each control used 1,000 complete repetitions. A third 1,000-repetition diagnostic stayed outside the confirmatory family." },
        { kind: "code", text: "Family rejection in one repetition:\nmin(1, 6 × minimum raw two-sided p across the six models) < 0.05" },
        {
          kind: "table", caption: "Stage 2 · one family decision per complete repetition",
          columns: ["Control", "Rejections / repetitions", "Rate", "Wilson 95% interval"],
          rows: [
            ["Noise + permuted missingness", "26 / 1,000", "2.6%", "1.78–3.78%"],
            ["Permuted targets", "28 / 1,000", "2.8%", "1.94–4.02%"],
          ],
        },
        { kind: "paragraph", text: "The denominator is repetitions, not the 6,000 model rows per control. The registered stage failed a complete control at 65 or more family rejections and treated an incomplete denominator as inconclusive. Both controls passed that rule. That supports the test's behaviour under these constructions; it does not show that all timing leakage is absent or that the true false-positive rate is exactly 5%." },
      ],
      sources: [
        { label: "Stage 2 registration", href: financeSource("docs/thesis/STAGE_2_REGISTRATION.md") },
        { label: "Negative-control results", href: financeSource("experiments/results_thesis/negative_control/negative_control_report.md") },
      ],
    },
    {
      id: "timing-audit", title: "The result changed when I checked availability",
      blocks: [
        { kind: "paragraph", text: "The original equal-weight baseline appeared to have a weak signal. The audit found that 31 of 40 features used annual statements before publication. It also found mixed price/share adjustment bases in market values and rows preceding a security's first listing." },
        { kind: "paragraph", text: "The corrected evaluation used an availability registry and guards, a primary cutoff of 31 May in the following year, and entry on the first trading day after it. Exact filing times were available for only six company-years, so the full-universe run used statutory deadlines as proxies. A late filer remains a risk." },
        {
          kind: "table", caption: "Equal-weight baseline · original and corrected designs",
          columns: ["Evaluation", "Pooled IC", "Permutation p"],
          rows: [["Original, preserved", "+0.150", "0.017"], ["Point-in-time correction", "+0.031", "0.63"]],
        },
        { kind: "paragraph", text: "The corrected baseline's 95% interval was −0.100 to +0.162. No ML model was significant after correction. The redesign also changed the return window, source, and evaluated rows, so it is consistent with look-ahead contamination without isolating its causal contribution." },
        { kind: "paragraph", text: "I withdrew the apparent signal rather than keeping it as the headline. The narrower conclusion is that this sample did not establish a large reproducible predictive edge. Effects below about |IC| 0.185 were outside the design's estimated 80%-power detection range. Survivorship and the small number of test years remain unresolved. The separate defect-injection stage is also still INCONCLUSIVE; its original guards did not detect every registered defect." },
      ],
      sources: [
        { label: "Publication-lag audit", href: financeSource("docs/audit/PUBLICATION_LAG_AUDIT.md") },
        { label: "Corrected evaluation", href: financeSource("experiments/results_pit_v2/REPORT.md") },
        { label: "Defect-injection report", href: financeSource("experiments/results_thesis/defect_injection/defect_injection_report.md") },
      ],
    },
    {
      id: "reproduce", title: "Reproduce the 2.6% number",
      blocks: [
        { kind: "paragraph", text: "Clone the public repository at the pinned commit below and run the downloadable recount script against that checkout. It checks the dataset and artifact hashes and reconstructs the six-model decisions from saved raw p-values, giving 26/1,000 = 2.6% and 28/1,000 = 2.8% with matching Wilson intervals." },
        { kind: "links", links: [
          { label: "Download recount script (.py)", href: "/case-studies/financeiq/reproduce_counts.py", download: true },
          { label: "View recomputed output (.json)", href: "/case-studies/financeiq/recount.json" },
          { label: "Per-model experiment data", href: financeSource("experiments/results_thesis/negative_control/repetitions.csv") },
        ] },
        { kind: "code", text: "# Save reproduce_counts.py beside the repository directory.\ngit clone https://github.com/Salih04/capstone-financeIQ.git\ncd capstone-financeIQ\ngit checkout 7243c5efa7d00ff45200cfa7589cebd2f3ba0017\npython3 ../reproduce_counts.py --repo ." },
        { kind: "paragraph", text: "This recount uses Python's standard library. It checks saved experiment data; it does not refit models. To exercise the model pipeline separately, use Python 3.12, install the recorded numerical environment, and run the registered replay probe:" },
        { kind: "code", text: "python3.12 -m venv .venv\nsource .venv/bin/activate\npython -m pip install -r requirements-root.txt\nPYTHONPATH=. python experiments/thesis/negative_control.py --replay-check" },
        { kind: "paragraph", text: "The probe reruns registered repetition 1000 twice with 10,000 permutations and 10,000 bootstraps. It returned identical: true in the 12 October check. That is one repeated cell, not a rerun of the full campaign. Full generation is implemented by make thesis-stage2 and refuses to overwrite a completed namespace; it needs an isolated reproduction checkout with the originals archived outside it. Platform-specific numerical differences are documented." },
      ],
      sources: [{ label: "Runner and overwrite safeguards", href: financeSource("experiments/thesis/negative_control.py") }],
    },
    {
      id: "review", title: "What I checked for this write-up",
      blocks: [
        { kind: "paragraph", text: "On 12 October I recounted both control rates and all six calibration rates from per-repetition p-values, checked their artifact hashes, ran the replay probe, and passed 222 focused control/PIT tests. I did not rerun the full Monte Carlo campaign or the corrected financial evaluation for this article." },
        { kind: "paragraph", text: "The repository's separate 8 October record reports 1,456 root tests and 579 backend tests passing at a dated snapshot. Those are software checks, not evidence of a predictive edge. The original failed control, the corrected null, and the open limitations are more useful results to report than a test-count headline." },
        { kind: "paragraph", text: "What I learned was quite practical: an evaluation needs its own controls, and a date on a financial statement is not necessarily the date a model could have used it. I now keep that distinction in the method and in the explanation of the result." },
      ],
      sources: [{ label: "Dated verification and environment record", href: "https://github.com/Salih04/capstone-financeIQ/blob/47f06a2893cbd89171a6acfcb1debee79e68e331/docs/VERIFICATION_BASELINE.md" }],
    },
  ],
};

export const samsReport: ProjectReport = {
  name: "SAMS",
  title: "Designing a Resumable Multi-Agent Execution System",
  intro: "I worked on what happens when an agent workflow loses its connection or worker. The difficult part was deciding which state to trust, and making incomplete recovery visible.",
  accent: "signal",
  labHref: "/sams/",
  role: "Project maintainer · backend and reliability",
  project: "Independent 2-person project · private codebase",
  status: "In development · no production traffic",
  checked: "12 October 2026",
  repository: { label: "Public technical evidence", href: "https://github.com/Salih04/sams-reliability-core" },
  sections: [
    {
      id: "scope", title: "What this project covers",
      blocks: [
        { kind: "paragraph", text: "SAMS is an independent project for long-running, multi-tenant LLM agent workflows. The backend uses FastAPI, Temporal, PostgreSQL, Redis, and WebSockets. A task can wait for a human decision and outlive a worker process; meanwhile, its browser client may disconnect while events keep arriving." },
        { kind: "paragraph", text: "I worked on the backend architecture, event replay, and reliability checks. I used AI coding agents for implementation and review, and took responsibility for the acceptance criteria and validation. This has been a learning project for me as a junior developer, not a claim that I have operated this architecture at production scale." },
        { kind: "paragraph", text: "The public repository is a curated evidence package. Its current version contains architecture, verification scenarios, limitations, and a historical CI summary. It does not contain the private implementation or a runnable test harness. The distinction matters when assessing the numbers later in this article." },
      ],
      sources: [{ label: "Public package scope and attribution", href: samsSource("README.md") }],
    },
    {
      id: "state", title: "Which state should the workflow trust?",
      blocks: [
        { kind: "paragraph", text: "The architecture gives PostgreSQL durable task, ownership, session, and approval state. Redis carries transient event delivery state. Temporal coordinates the long-running workflow. I found this separation useful when asking what should happen after a notification is lost." },
        { kind: "architecture" },
        { kind: "paragraph", text: "A notification can tell a workflow to check for a decision. The stored decision determines what happened. An event can describe a tenant, but that description is not ownership authority. A connected socket can still have incomplete history. Treating those as separate facts makes recovery easier to explain and test." },
      ],
      sources: [{ label: "Published architecture and failure contracts", href: samsSource("docs/ARCHITECTURE.md") }],
    },
    {
      id: "reconnect", title: "A reconnect is not proof of complete history",
      blocks: [
        { kind: "paragraph", text: "If a client reconnects after stored history has been trimmed or reset, replaying the remaining events can look successful while hiding a gap. The contract therefore asks for one of two observable outcomes: the complete missed interval, or an explicit incomplete-sync result." },
        { kind: "paragraph", text: "The original test campaign used Redis 7 to exercise stream deletion, restart without persistence, and trimmed history. The recorded tests reported an explicit gap when completeness could not be proved. That lets a client know it needs to reconcile with durable state; it does not promise indefinite event retention." },
        { kind: "paragraph", text: "New events arriving during replay create another problem. If live capture starts late, an event may fall between the two paths. If replay and live delivery overlap without a clear boundary, the event may appear twice. The tested requirement was ordered delivery with no silent gap or duplicate at this transition." },
        { kind: "paragraph", text: "The recorded race test used concurrent writes against real Redis. A deliberately broken version with late live capture failed. I wanted that negative control because a test that passes for both the intended implementation and the broken one would tell me very little. These observations concern the tested handoff, not a general exactly-once guarantee." },
      ],
      sources: [{ label: "Redis race scenarios and negative controls", href: samsSource("docs/VERIFICATION.md") }],
    },
    {
      id: "decisions", title: "A saved decision must survive a lost wake-up",
      blocks: [
        { kind: "paragraph", text: "Human approval has more than one race. Two people can submit conflicting decisions, and a decision can arrive while the deadline path is trying to settle the same workflow. The design requires those paths to arbitrate against one durable record, with one accepted outcome and a conflict for the loser." },
        { kind: "paragraph", text: "A different failure happens after a decision is saved: the workflow's wake-up notification may never arrive. In that case the workflow needs to recover the stored decision instead of treating the missing message as a missing approval." },
        { kind: "paragraph", text: "The historical PostgreSQL 16 campaign tested concurrent approve/reject and decision/deadline races. Temporal development-server tests covered a stored decision without its wake-up signal and a worker stopped and replaced during an approval wait. The recorded checks recovered the decision and resumed the waiting workflow." },
        { kind: "paragraph", text: "Those integration tests stubbed LLM, Git, and Docker activities. They tested coordination and failure handling, not whether an agent produced good code or whether every external side effect could be safely repeated." },
      ],
      sources: [
        { label: "Decision and worker-recovery scenarios", href: samsSource("docs/VERIFICATION.md") },
        { label: "Integration-test limits", href: samsSource("docs/LIMITATIONS.md") },
      ],
    },
    {
      id: "boundaries", title: "Tenant boundaries and retention",
      blocks: [
        { kind: "paragraph", text: "Replay must respect the same ownership boundary as current delivery. The public contract treats a tenant claim inside an event as data, resolves ownership from trusted state, and withholds delivery when attribution is unknown or conflicting. The recorded test cases failed closed." },
        { kind: "paragraph", text: "That is a tested contract, not a complete security audit. This article and the public package leave out the production mechanisms, schema, authentication routes, and configuration. I do not publish those internals as an implementation guide." },
        { kind: "paragraph", text: "Retention also limits what a reconnect can recover. At the verified snapshot, the resumable path was off by default and retention was not scheduled. A configured or intended recovery period is therefore not a demonstrated production recovery window. The project still needs operating measurements before making capacity or storage-budget claims." },
      ],
      sources: [
        { label: "Public failure contracts", href: samsSource("docs/ARCHITECTURE.md") },
        { label: "Rollout and operational limitations", href: samsSource("docs/LIMITATIONS.md") },
      ],
    },
    {
      id: "evidence", title: "The evidence, with its limits",
      blocks: [
        { kind: "paragraph", text: "The public CI summary records the earlier extract's campaign on 4 October 2026. These counts belong to that prior implementation snapshot, not to the reduced public package:" },
        {
          kind: "table", caption: "Historical campaign · 4 October 2026",
          columns: ["Job", "Recorded result", "Environment / boundary"],
          rows: [
            ["Unit", "543 passed; 3 deselected", "Deselected cases required the full application"],
            ["Integration", "25 passed", "Redis 7, PostgreSQL 16, Temporal development server"],
          ],
        },
        { kind: "paragraph", text: "The underlying Actions run is in a private archive. The public summary can be inspected, but it is not an independently accessible CI log, and its tests cannot be rerun from the current public repository." },
        { kind: "paragraph", text: "A local review on 12 October ran a focused private replay/retention/consumer suite: 318 tests passed and four failed. A targeted rerun reproduced those failures around sync classification with malformed data near handoff. The cause was not resolved in that review. I keep this separate from the historical campaign and do not describe the current checkout as fully verified." },
        { kind: "paragraph", text: "No production traffic, load test, reconnect-storm measurement, or throughput result has been established. Temporal was tested on a development server; server restart and long-lived workflow versioning were not demonstrated. Those are still open parts of the reliability story." },
      ],
      sources: [
        { label: "Historical CI provenance", href: samsSource("results/CI_2026-10-04.md") },
        { label: "Published limitations", href: samsSource("docs/LIMITATIONS.md") },
      ],
    },
    {
      id: "review", title: "How to inspect this work",
      blocks: [
        { kind: "paragraph", text: "Clone the public evidence package at the pinned commit below and read the architecture, scenario matrix, CI summary, and limitations together. That gives the context behind the claims; it does not reproduce the private test campaign." },
        { kind: "code", text: "git clone https://github.com/Salih04/sams-reliability-core.git\ncd sams-reliability-core\ngit checkout 04fb61b8b072a798293249b10a2f23ff7d5bfbae" },
        { kind: "paragraph", text: "The questions I would use to review the design are specific: what makes a replay complete, which record settles an approval, how was the race triggered, and did the deliberately broken version fail? Those questions were more useful to me than a broad label such as reliable or production-ready." },
        { kind: "paragraph", text: "The main thing I learned was to write down the expected failure outcome before trying to fix the happy path. That exposed differences I had initially grouped together: a missing message versus a missing decision, and a recovered connection versus recovered history. There is more work to do, but the remaining questions are clearer." },
      ],
      sources: [{ label: "Verification matrix", href: samsSource("docs/VERIFICATION.md") }],
    },
  ],
};
