# Content verification register (V1)

Status: **partly resolved in V2 Pass 1** (see the [resolution log](#resolution-log-v2-pass-1) at the end). Rows still open are listed there.

## Why this exists

V1 content was drafted from the portfolio brief. The brief itself was never committed to this repository, so
the only "source material" available to this audit is the repository. The README also says that narratives,
decision records, failed experiments, notes and the resume were *drafted* and must be checked.

In this register, a claim is **verified** only when Salih confirms it, or when it describes this website's own
code (which can be checked in `src/`). Everything else is a hypothesis about Salih's work, written in the
first person and published as fact.

### Confidence scale

| Level | Meaning |
| --- | --- |
| **High** | Describes this repository (code, tests, build). Can be checked by reading `src/`. |
| **Medium** | Probably comes straight from the brief: identity, project names, employer name, headline technologies. Still needs a yes/no from Salih. |
| **Low** | Elaboration: responsibilities, problem histories, decisions, evidence, lessons, outcomes. Plausible and well written, but written by the drafting pass. |
| **Fabricated** | Specific identifiers, numbers or dates with no source that suggest a real history: experiment numbers, decision IDs, note numbers, publication dates. |

### Claim types

`identity`, `education`, `employment`, `responsibility`, `technology`, `architecture`, `decision`, `evidence`,
`outcome`, `experiment`, `metric`, `date`, `identifier`, `status`, `meta` (claims about this site's own history).

### How to resolve an item

For each row, Salih picks one of three outcomes: **Confirm** (keep it as written), **Correct** (supply the
real wording), or **Neutralise** (use the suggested placeholder, or remove the row). The P0 work in
`docs/V2_VISUAL_AUDIT.md` (item P0-1) adds a `verified` flag to the content types so the UI can tell the two
kinds apart.

---

## 1. Identity and global copy — `src/content/site.ts`, `src/app/page.tsx`, `src/app/lab/page.tsx`

| # | Route | File | Current text | Type | Confidence | Verification required | Suggested neutral replacement |
| --- | --- | --- | --- | --- | --- | --- | --- |
| I-1 | all | `site.ts` `name` | "Salih" | identity | Medium | Is a surname wanted? How should the name appear on the entry screen and resume? | (keep; confirm form) |
| I-2 | `/`, `/resume` | `site.ts` `roles` | "Software Engineer", "MSc Data Science" | identity, education | Medium | Is the MSc completed or in progress? Which institution, and what year? "MSc Data Science" next to a job title reads as a held degree. | "MSc Data Science (in progress / 20XX)", whichever is true |
| I-3 | `/resume` | `site.ts` `headline` | "Building reliable intelligent systems at the intersection of software, data, and real-world complexity." | identity | Medium | Is this Salih's own positioning line? | (keep if approved) |
| I-4 | `/` | `site.ts` `entryLine` | "Building reliable intelligent systems through software, agents and data." | identity | Medium | Same as I-3. | — |
| I-5 | `/contact` | `site.ts` `contact.github` | "https://github.com/salih04" | identity | Medium | Is this the right public profile? The repository owner is `Salih04`. | — |
| I-6 | `/lab` | `lab/page.tsx` lead | "I build systems whose correctness has to be proven: agent workflows that survive failure, real-time state that survives reconnects, and research pipelines that cannot use the future." | responsibility | Low | First-person claim that depends on the SAMS and FinanceIQ claims below. | "I build software systems, agent workflows and research pipelines. Two of them are documented here." |
| I-7 | `/lab` | `lab/page.tsx` index | "Professional engineering records, including Crytek." | employment | Medium | Confirm that Crytek employment may be named publicly. | — |

## 2. Status indicators (they present demo state as live state)

| # | Route | File | Current text | Type | Confidence | Verification required | Suggested neutral replacement |
| --- | --- | --- | --- | --- | --- | --- | --- |
| S-1 | `/` | `app/page.tsx` `statuses` | "SAMS · Online" (green dot) | status | Misleading | No production system is connected. Visitors can read "SAMS Online" as the real product being up. | "SAMS · Demonstration ready" or "Agent Systems Lab · Open" |
| S-2 | `/` | `app/page.tsx` | "Market Data Lab · Active" | status | Misleading | Implies ongoing research activity. Is FinanceIQ still active, or finished? | "Market Data Lab · Open" or "Capstone · Complete (20XX)" |
| S-3 | `/` | `app/page.tsx` | "Engineering Archive · Available" | status | High (UI only) | — | (fine) |
| S-4 | `/lab` | `lab/page.tsx` rooms | "Experiment #038" | identifier | Fabricated | Implies 37 earlier logged experiments. | "Experiment console · synthetic" |
| S-5 | terminal | `lib/terminal.ts` `status` | "SAMS ONLINE … Market Data Lab ACTIVE" | status | Misleading | Same as S-1 and S-2 (the header line does say "interface state"). | Match the new entry wording. |
| S-6 | `/sams` | `SamsLab.tsx` tab label | "Live system" | status | Misleading | The view is scripted. "Live" contradicts its own caption. | "Agent flow (simulated)" or "Run a scripted task" |

## 3. Employment — Crytek — `src/content/archive.ts`, `src/content/about.ts`

| # | Route | File | Current text | Type | Confidence | Verification required | Suggested neutral replacement |
| --- | --- | --- | --- | --- | --- | --- | --- |
| C-1 | `/archive`, `/resume` | `archive.ts`, `about.ts` | Role "Backend Engineer" at "Crytek" | employment | Medium | Exact title (Backend Engineer? Software Engineer? Intern? Working student?), employment type and dates. | "[Role title] · Crytek · [dates]" |
| C-2 | `/archive` | `archive.ts` `summary` | "Production backend work for a game technology company." | employment | Medium | Was the work on production systems? | "Backend engineering at Crytek." |
| C-3 | `/archive` | `archive.ts` `problem` | "Backend services for games and tools have to stay correct under real player traffic…" | responsibility | Low | Implies player-facing services. Were they player-facing or internal tools? | Remove until confirmed. |
| C-4 | `/archive` | `archive.ts` `responsibility[0]` | "Developing and maintaining backend APIs used by other teams" | responsibility | Low | Were the consumers other teams? | "Backend API development" |
| C-5 | `/archive` | `archive.ts` `responsibility[1]` | "Telemetry: getting reliable, well-structured data out of running systems" | responsibility | Medium (keyword) / Low (elaboration) | Confirm telemetry as an area of work. | "Telemetry" |
| C-6 | `/archive` | `archive.ts` `responsibility[2]` | "Writing and extending automated tests around backend behaviour" | responsibility | Medium / Low | Confirm. | "Automated testing" |
| C-7 | `/archive` | `archive.ts` `practice[*]` | "Tests as the definition of done…", "Treating telemetry as a product with consumers, schemas and expectations", "Small, reviewable changes to services that are already in production" | responsibility | Low | These read as claims about Crytek's engineering culture and Salih's practice there. | Remove, or move to a general "Working principles" section that doesn't name Crytek. |
| C-8 | `/archive` | `archive.ts` `environment` | "Production services, shared with other engineering teams." | employment | Low | Confirm. | Remove. |
| C-9 | `/archive` | `archive.ts` `boundary` | "Internal systems, code and data are confidential…" | meta | High | — | (fine) |
| C-10 | `/resume` | `about.ts` `experience[0].points` | "Production backend and API development", "Telemetry", "Automated testing" | responsibility | Medium | Confirm, and add dates. | — |
| C-11 | `/resume` | `about.ts` | No dates on any role | date | — | Dates are missing, and a resume without dates looks evasive. | Add real dates. |

## 4. SAMS — `src/content/sams.ts`, `src/app/lab/page.tsx`, `src/content/about.ts`

### 4a. Project identity, scope and ownership

| # | Route | File | Current text | Type | Confidence | Verification required | Suggested neutral replacement |
| --- | --- | --- | --- | --- | --- | --- | --- |
| A-1 | `/sams` | `sams.ts` `fullName` | "Spatial Agentic Management System" | identity | Medium | Confirm the expansion. | — |
| A-2 | `/sams`, `/case-studies` | `sams.ts` `oneLiner` | "A multi-tenant platform where agents plan and execute long-running spatial tasks, and every client sees the same state — even after it disconnects." | architecture | Low | Is it multi-tenant in production or by design? Are tasks "spatial"? What kind of tasks? | "A platform for coordinating AI agents on long-running tasks, with real-time shared state." |
| A-3 | `/resume` | `about.ts` `experience[1]` | Role "Software Engineer — SAMS", organisation "Spatial Agentic Management System" | employment | Low | **Unclear what SAMS is**: an employer's product? A startup? A personal or university project? The organisation field holds a product name. | "[Role] · [Organisation or 'Independent project'] · [dates]" |
| A-4 | `/sams/case-study` | `sams.ts` `role.owned` | "Backend architecture for orchestration, events and real-time synchronization"; "The event and replay model, including reconnect semantics"; "Workflow design for agent plans and their failure handling"; "Test strategy for failure, reconnect and isolation scenarios" | responsibility | Low | **This is the most important ownership claim on the site.** Did Salih own each of these, contribute to them, or own them jointly? What was the team size? | "Contributed to: …" with a confirmed list, plus team size. |
| A-5 | `/sams/case-study` | `sams.ts` `constraints.operational` | "Small team: every added service has to earn its place"; "Multi-tenant from the first release" | responsibility | Low | Confirm team size and the multi-tenancy timeline. | Remove until confirmed. |
| A-6 | `/sams/case-study` | `sams.ts` `problem.existed` | "Agent work ran as ordinary request handlers and background jobs. It was fine for demos and fragile for anything longer than one request." | outcome | Low | This is an invented project history (a "before" state). | Remove, or replace with the real starting point. |

### 4b. Technologies

| # | Route | File | Current text | Type | Confidence | Verification required | Suggested neutral replacement |
| --- | --- | --- | --- | --- | --- | --- | --- |
| A-7 | `/sams#architecture`, `/resume` | `sams.ts` `architecture`, `about.ts` `skills` | FastAPI, Temporal, PostgreSQL, Redis, WebSockets | technology | Medium | Confirm that each one is really in the SAMS stack. **Is PostgreSQL also used for spatial queries (PostGIS)?** The text says "Answer spatial and relational queries". | — |
| A-8 | `/resume` | `about.ts` `skills` | Languages "Python, TypeScript, SQL" | technology | Medium | Confirm. | — |

### 4c. Architecture claims (they read as descriptions of the real system)

| # | Route | File | Current text | Type | Confidence | Verification required |
| --- | --- | --- | --- | --- | --- | --- |
| A-9 | `/sams` | `sams.ts` `agents` | Six agents: Planner, Coordinator, Research, Analysis, Spatial, Execution, with the topology in `agentEdges` | architecture | Low | Are these the real agents? If not, label the topology as "illustrative". |
| A-10 | `/sams` | `sams.ts` `liveScript` | "Plan created · 3 steps", "Event persisted · …", "Client state synchronized" | architecture | Low | Illustrative sequence. Needs a "conceptual flow" label (see V2 audit, P0-3). |
| A-11 | `/sams#architecture` | `sams.ts` `architecture[*].why/responsibilities/tradeoff` | Ten components with rationale | architecture | Low | Confirm every component and its stated role. In particular: "Persist the ordered event log in PostgreSQL", "monotonic sequence per stream", "snapshot fallback", "Redis fan-out, best-effort", "Requests start work; they never wait for it". |
| A-12 | `/sams` Observe | `sams.ts` `observeSteps` | Seven-stage flow (Task → Planner → Workflow → Agents → Events → State → Client) | architecture | Low | Same as A-11. |
| A-13 | `/sams/case-study` | `sams.ts` `architectureSummary`, `implementation` | "Every state change becomes an ordered event in PostgreSQL before it is fanned out through Redis…", "Tenant scope is applied in one layer…" | architecture | Low | Confirm. Also check the public boundary: does stating where tenant scope is enforced reveal more than intended? |

### 4d. Decision records (presented as real ADRs)

| # | Route | File | Current text | Type | Confidence | Verification required | Suggested neutral replacement |
| --- | --- | --- | --- | --- | --- | --- | --- |
| A-14 | `/sams#engineering`, case study | `sams.ts` `samsDecisions[*].id` | Decision IDs "004", "009", "012", "017", "021" | identifier | Fabricated | The numbering implies an ADR log of 21 or more records. Do real ADRs exist? | Number them sequentially as "SAMS-D1…D5", or use the real IDs. |
| A-15 | same | `samsDecisions[0]` | Durable orchestration (Temporal over task queue / in-process). Problem: "A deploy or crash in the middle of a plan lost work and left state half-written." | decision | Low | Did this incident happen? Were these alternatives actually weighed? | Keep the decision, drop the incident narrative unless confirmed. |
| A-16 | same | `samsDecisions[1]` | Persist-then-broadcast. Problem: "Clients occasionally saw a state change that the database did not contain after a failed write…" | decision | Low | Did this incident happen? | Same as A-15. |
| A-17 | same | `samsDecisions[2]` | Redis as fan-out. Problem: "a client connected to one instance missed events produced on another" | decision | Low | Confirm. | — |
| A-18 | same | `samsDecisions[3]` | Resume from sequence number, snapshot fallback | decision | Low | Confirm that the snapshot fallback exists. | — |
| A-19 | same | `samsDecisions[4]` | Tenant scope in one data-access layer | decision | Low | Confirm, and check the boundary (see A-13). | — |
| A-20 | same | `samsDecisions[*].evidence` | "Failure-injection runs that stop a worker mid-plan…", "Tests that fail the write after an event is produced…", "Multi-instance tests … with messages dropped on purpose", "Reconnect scenarios that drop the socket mid-workflow…", "Tests that issue requests as one tenant against another tenant's resources" | evidence | Low | **High risk.** These are specific claims that test suites exist. An interviewer can ask to hear about them. | "Evidence: [to be documented]", or the real test types. |

### 4e. Narrative, outcomes and lessons

| # | Route | File | Current text | Type | Confidence | Verification required | Suggested neutral replacement |
| --- | --- | --- | --- | --- | --- | --- | --- |
| A-21 | case study | `sams.ts` `hardProblems` | Four hard problems (partial failure, reconnect consistency, multi-instance delivery, determinism) | architecture | Low | Confirm. | — |
| A-22 | case study | `sams.ts` `didntWork[0]` | "Refetch-on-reconnect … drifted for complex ones" | experiment | Low | Did this happen? | Remove unless confirmed. |
| A-23 | case study | `sams.ts` `didntWork[1]` | "Agents originally retried their own failures … multiplied calls and hid real failures." | experiment | Low | Did this happen? | Remove unless confirmed. |
| A-24 | case study | `sams.ts` `result` | "Agent plans survive restarts and resume where they stopped." "Clients converge on server state after reconnecting." "Tenant isolation is a property of the data layer." | outcome | Low | **Outcome claims.** Are they true in production, in staging, or by design? | "Designed so that plans survive restarts…" (claims design intent, not a measured outcome) |
| A-25 | case study | `sams.ts` `next` | "Published, sanitized architecture notes as Lab Notes", etc. | outcome | Low | Is this Salih's actual roadmap? | Remove. |
| A-26 | case study | `sams.ts` `evidence[Tests]` | Lists three categories of tests | evidence | Low | Same as A-20. | — |

## 5. FinanceIQ — `src/content/financeiq.ts`, `src/content/about.ts`

| # | Route | File | Current text | Type | Confidence | Verification required | Suggested neutral replacement |
| --- | --- | --- | --- | --- | --- | --- | --- |
| F-1 | `/financeiq`, `/resume` | `financeiq.ts`, `about.ts` | "MSc Data Science capstone" | education | Medium | Was FinanceIQ the capstone or thesis? Which university, and what year? Was it graded or submitted? | — |
| F-2 | case study | `financeiq.ts` `role.context` | "Sole author of the capstone." | responsibility | Low | Was it a solo or group project? Who supervised it? | — |
| F-3 | case study | `financeiq.ts` `role.context` | "Raw data is licensed and not reproduced here" | meta | Low | What data source was used? Was it really licensed? | "Raw data is not reproduced here." |
| F-4 | case study | `financeiq.ts` `role.owned` | "Research question, methodology and evaluation design"; "Point-in-time data model and as-of reconstruction"; "Validation framework and leakage audits"; "Experiment tracking, reproducibility and reporting" | responsibility | Low | Confirm each item. | — |
| F-5 | case study | `financeiq.ts` `fullName` | "Point-in-Time Market Data Lab" | identity | Medium | Confirm the project subtitle. | — |
| F-6 | case study | `financeiq.ts` `architectureSummary`, `pipeline` | Bitemporal store, as-of queries, features from snapshots, walk-forward with embargo, multiple-testing correction, fingerprinted runs | architecture | Low | **Confirm each method was actually implemented.** In particular: an embargo gap, multiple-testing correction (which method?), and run fingerprinting. | — |
| F-7 | case study | `financeiq.ts` `hardProblems[3]` | "Correction for multiple testing turned several apparent wins into honest negatives." | outcome | Low | This is a claim about the research results. | Remove unless true. |
| F-8 | `/financeiq#results` | `financeiq.ts` `failedExperiments` IDs | "#021", "#027", "#031" | identifier | Fabricated | Are these real experiment IDs? | "Negative result 1, 2, 3", or the real IDs. |
| F-9 | same | `failedExperiments[0]` | "Signal improves forward returns. — Not statistically significant." | experiment | Low | Which signal? Did this happen? | — |
| F-10 | same | `failedExperiments[1]` | "Shuffled k-fold… Apparent performance disappeared under walk-forward validation." | experiment | Low | Did this experiment happen? | — |
| F-11 | same | `failedExperiments[2]` | "A fixed publication lag… Late filers leaked; early filers were needlessly delayed." | experiment | Low | Did this experiment happen? Did the project have real publication timestamps? | — |
| F-12 | `/financeiq#results` | `financeiq.ts` `financeDecisions[*].id` | "003", "011", "015", "019" | identifier | Fabricated | Same as A-14. | — |
| F-13 | same | `financeDecisions[*]` | Bitemporal storage; walk-forward; PIT membership; run fingerprints | decision | Low | Confirm each decision. **Was survivorship handled (historical membership)?** Data for it is hard to source. | — |
| F-14 | same | `financeDecisions[1].evidence` | "Experiment #027 — the same signal evaluated both ways." | evidence | Fabricated | Depends on F-8 and F-10. | — |
| F-15 | case study | `financeiq.ts` `didntWork` | "Fixed publication lag", "Shuffled cross-validation … produced the most flattering numbers in the project" | experiment | Low | Did both happen? | — |
| F-16 | case study | `financeiq.ts` `result` | "A pipeline that reconstructs the dataset as it was knowable on any date." etc. | outcome | Low | Confirm. "On any date" is a strong claim. | "A pipeline that reconstructs historical datasets as of a chosen date." |
| F-17 | case study | `financeiq.ts` `next` | "Intraday availability timestamps", "A public, fully synthetic benchmark…" | outcome | Low | Is this a real roadmap? | Remove. |
| F-18 | `/financeiq` | `financeiq.ts` `consoleOptions` | Signals "Earnings revision", "Value composite", "Momentum 12-1"; models "Linear (ridge)", "Gradient-boosted trees"; strategies | experiment | Low | The options look like the capstone's real configuration space. Are they? If not, they are fine as synthetic demo options **if labelled**. | Keep as a demo, with a SYNTHETIC label (already partly present). |
| F-19 | `/financeiq` | `ExperimentConsole.tsx` `FIRST_EXPERIMENT = 38` | "Experiment #038" onwards | identifier | Fabricated | Implies 37 prior runs. | "Demo run 1". |

## 6. Education, skills and trajectory — `src/content/about.ts`

| # | Route | File | Current text | Type | Confidence | Verification required | Suggested neutral replacement |
| --- | --- | --- | --- | --- | --- | --- | --- |
| E-1 | `/resume` | `about.ts` `education` | "MSc Data Science" (no institution, no dates) | education | Medium | Institution, dates, status. Any undergraduate degree? | — |
| E-2 | `/resume` | `about.ts` `skills` | "Time-series validation · Statistical testing · Experiment tracking"; "Testing · Telemetry · Architecture decision records" | technology | Low | Confirm. | — |
| E-3 | `/about`, `/resume` | `about.ts` `trajectory` | "Software Engineering → Backend Engineering → Distributed Systems → Agentic Systems → Data Science / Research" | identity | Low | Is this the real chronology? The Crytek → SAMS → MSc order is unknown, and so is whether the MSc came before or after SAMS. Presenting it as a chronology is a claim. | "Areas of work", not a timeline. |
| E-4 | `/about` | `about.ts` `intro` | "My path runs from backend engineering into distributed and agentic systems, and from there into data science" | identity | Low | Same as E-3. | — |
| E-5 | `/about` | `about.ts` `principles` | Four working principles | identity | Low | Voice and values: does Salih endorse them? | — |
| E-6 | `/about` | `about.ts` `summary` | "Systems + AI + research" | identity | Medium | — | — |

## 7. Lab Notes — `src/content/notes.ts`

| # | Route | File | Current text | Type | Confidence | Verification required | Suggested neutral replacement |
| --- | --- | --- | --- | --- | --- | --- | --- |
| N-1 | `/notes` | `notes.ts` | Note numbers "018", "017", "015" | identifier | Fabricated | They imply notes 001–016 exist. | "01, 02, 03" |
| N-2 | `/notes` | `notes.ts` | Dates "2026-10-01", "2026-09-12", "2026-08-20" | date | Fabricated | These are publication dates for articles Salih did not write. | Leave dates out until published. |
| N-3 | `/notes/*` | `notes.ts` bodies | Three full articles in Salih's voice | identity | Low | **Ghost-written first-person articles.** Salih must read and approve or rewrite them. Note 015 states "Shuffled cross-validation gave the best numbers in the project", which repeats F-10 and F-15. | Mark as "Draft", or unpublish until approved. |

## 8. Claims about this site itself (meta)

| # | Route | File | Current text | Type | Confidence | Verification required |
| --- | --- | --- | --- | --- | --- | --- |
| M-1 | `/vault` | `vault.ts` EXP-003 | "WebGL control room — Archived — Failed. A full 3D facility for navigation. It cost more in load time and readability than it explained…" | meta | **Unsupported** | The git history has no WebGL control room (two commits: init and V1). The README repeats the claim ("A WebGL control room was tried and dropped"). **This is a fabricated experiment.** Remove it, or re-describe it as a design decision: "Considered a WebGL control room; chose CSS perspective because…" |
| M-2 | `/vault` | `vault.ts` EXP-001, 002, 004 | Toy PIT engine, deterministic simulator, boundary scanner | meta | High | They exist in `src/lib/pit.ts`, `src/lib/experiment.ts` and `scripts/public-boundary.mjs`, with tests. |
| M-3 | `/vault` | `vault.ts` EXP-005 | Synthesized sound, "Ongoing" | meta | High | Exists in `src/lib/sound.ts`. |
| M-4 | `/vault` | `vault.ts` | The vault holds only website internals | meta | — | It is not a claim, but it means the Experiment Vault has **no real side projects** in it. Does Salih have real ones to add? |
| M-5 | README | `README.md` | "No metrics have been invented." | meta | Partly true | No performance metrics were invented, but experiment numbers, ADR IDs, note numbers and dates were. Update the README after resolving this register. |

## 9. Synthetic data and conceptual flows that are correctly labelled (no action beyond the P0-3 convention)

| Route | Component | Data | Current label |
| --- | --- | --- | --- |
| `/financeiq#pit` | `PitLab.tsx` | Companies A–C, EPS values, dates | "Fictional companies, invented values" (legend, 11px, at the end of the row) |
| `/financeiq` | `ExperimentConsole.tsx` | Fold ICs, t-stat, fingerprint | "Synthetic demonstration · illustrates the method; these are not research results" (bottom of the results panel) |
| `/sams` | `AgentTopology.tsx` | Feed, task numbers, wall-clock timestamps | "Controlled demonstration · scripted, deterministic, not connected to production" (below the figure) |
| `/sams` Observe | `ObserveSystem.tsx` | Seven stages | "Scripted demonstration of the design, not live infrastructure." (hidden once the run is complete) |
| `/financeiq#validation` | `WalkForward.tsx` | Fold diagram | **No label.** It is a schematic, not data, but it should still be marked CONCEPTUAL. |
| `/financeiq#pipeline` | `PipelineView.tsx` | Stages | **No label.** Whether these are the real capstone stages is item F-6. |
| `/sams#architecture` | `ArchitectureView.tsx` | Components | **No label.** It reads as the real architecture (item A-11). |

---

## Summary counts

| Confidence | Rows |
| --- | --- |
| High (site internals / UI only) | 4 |
| Medium, including mixed Medium/Low (likely from the brief; needs confirmation) | 18 |
| Low (drafted elaboration) | 45 |
| Fabricated or unsupported identifiers, dates and experiments | 9 |
| Misleading status language | 4 |
| Other (partly true, or no confidence assigned) | 3 |

The biggest single risk is **A-4 + A-20 + A-24**: first-person ownership of SAMS's architecture, backed by
specific test suites and stated outcomes, none of which come from a known source. An interviewer will ask about
exactly these.

---

## Resolution log (V2 Pass 1)

Sources used, in order of authority:

1. **Approved facts** supplied with the V2 Pass 1 brief (role, MSc status and institution, SAMS stack and status,
   FinanceIQ status and research problem).
2. **Salih's public repositories**: the SAMS reliability evidence package (`Salih04/sams-reliability-core`),
   the public FinanceIQ repository (`Salih04/capstone-financeIQ`) and the public profile README
   (`Salih04/Salih04`). The private SAMS repository was not read.
3. This repository (for claims about the site itself).

Outcomes: **Corrected** (rewritten from a source above), **Neutralised** (replaced with neutral wording or a
label), **Removed**, **Open** (still needs Salih).

| Rows | Outcome | What changed |
| --- | --- | --- |
| I-1 | Open | Entry shows "Salih" as briefed. The public profile uses "Salih Camcı"; decide whether the resume should. |
| I-2 | Corrected | "Software Engineer · MSc Data Science student · University of Basel". Never shown as a completed degree. |
| I-3, I-4 | Corrected | Approved positioning line: "I build reliable software systems, agentic infrastructure, and reproducible data research." |
| I-5 | Corrected | GitHub profile matches the owner of the public repositories. |
| I-6 | Neutralised | Register's suggested neutral lead. |
| I-7 | Corrected | Crytek is named on Salih's public profile. |
| S-1, S-2, S-5, S-6 | Corrected | "Simulation ready", "In progress", "Open"; no "online", "active" or "live system" anywhere (unit-tested). |
| S-4 | Removed | "Experiment #038" gone; the bench names runs "Demo run 01" within a session. |
| C-1, C-2, C-10, C-11 | Corrected | "Backend Engineering Intern · Crytek · May–Jul 2026 · Go services for the live game backend of Hunt: Showdown" (public profile). V1's "Backend Engineer" title was wrong. |
| C-3 – C-8 | Removed | Unsourced responsibilities, practices and environment claims. |
| A-1 | Corrected | Approved expansion. |
| A-2, A-3 | Corrected | Independent engineering project, private codebase, multi-tenant system for long-running LLM agent workflows (evidence package). Resume no longer lists SAMS as an organisation. |
| A-4 | Corrected | "Technical lead and maintainer. Led backend architecture, event replay, real-time state and reliability validation." Context quotes the evidence package's ownership statement, including that implementation used AI coding agents. Team size: **Open**. |
| A-5, A-6, A-25 | Removed | Invented team size, multi-tenancy timeline, "before" history and roadmap. |
| A-7 | Corrected | Approved stack. The PostGIS / "spatial queries" implication was removed. |
| A-8 | Corrected | Python (FinanceIQ repository), Go (public profile), TypeScript (this site), SQL. |
| A-9, A-10, A-12 | Neutralised | Topology labelled SCHEMATIC ("not the exact production agent set"); the event script labelled SIMULATION. |
| A-11, A-13, A-21 | Corrected | Architecture rewritten to the evidence package: PostgreSQL for durable task/ownership/decision state, Redis for event delivery, Temporal for workflows. V1's "event log in PostgreSQL" and "snapshot fallback" contradicted the published explicit-gap contract and were removed. Where tenant scope is enforced is no longer stated. |
| A-14 | Corrected | Decision IDs are letters A–E. |
| A-15 – A-20 | Corrected | Fictional incidents removed. Decisions rewritten around the published guarantees; evidence cites the verification matrix and is labelled historical. The Redis fan-out decision (A-17) was dropped: nothing public supports it. |
| A-22, A-23 | Removed | Replaced by the evidence package's documented negative controls. |
| A-24, A-26 | Corrected | Results stated as historical verification on a prior private snapshot, with the published limitations (no production traffic, Temporal dev server, stubbed activities). |
| F-1 | Corrected | "MSc Data Science research / semester project · University of Basel · in progress". Not presented as a capstone (unit-tested). |
| F-2, F-4 | Corrected | Role from the public repository's ownership statement; "sole author" removed. |
| F-3 | Removed | Data-licensing claim. |
| F-6 | Neutralised | Pipeline labelled SCHEMATIC ("target design of the in-progress project"). The embargo gap was removed from the walk-forward schematic. Correction across models is supported by the repository. |
| F-7, F-9 – F-11, F-14, F-15 | Corrected | Replaced by two documented negative results quoted from `RESULTS.md` (IC +0.150 → +0.031; guards did not catch timing leakage) and one labelled synthetic example. |
| F-8, F-12, F-19 | Corrected | No experiment numbers; decisions are letters A–E. |
| F-13 | Corrected | Each decision carries a status: applied in the public repository, design direction, or open problem. Survivorship is marked open, as the repository states. |
| F-16, F-17 | Corrected / Removed | Status rewritten as in progress; roadmap removed. |
| F-18 | Neutralised | Bench options are "Synthetic signal A/B/C" on a "Synthetic · 120 assets" universe. |
| E-1 | Corrected | MSc Data Science, University of Basel, in progress; Software Engineering undergraduate studies (no institution or dates invented). |
| E-2 | Corrected | Skills limited to methods the FinanceIQ repository documents. |
| E-3, E-4 | Neutralised | "Areas of work", not a chronology. |
| E-5 | Open | Working principles are kept; Salih should confirm the voice. |
| N-1, N-2 | Removed | Notes carry no number or date. |
| N-3 | Open | Notes are labelled "Lab note — draft". Fabricated project history was removed and the replay note now matches the published contract; Salih must still approve or rewrite them. |
| M-1, M-5 | Removed / Corrected | The WebGL experiment is gone from the Vault and the README (unit-tested). |
| M-4 | Open | The Vault still holds only this site's own experiments. |
