# S//LAB V2 — Pass 1 report

Base: V1 (`fd8380c`) plus the V1 audit (`6689f2a`). Binding inputs: [`V2_VISUAL_AUDIT.md`](V2_VISUAL_AUDIT.md),
[`CONTENT_VERIFICATION.md`](CONTENT_VERIFICATION.md) and the approved facts in the Pass 1 brief.
Screenshots: [`docs/audit/screenshots/v2-pass1/`](audit/screenshots/v2-pass1/) (V1 set: `…/v1/`).
Capture and verification script: [`docs/audit/capture-v2.mjs`](audit/capture-v2.mjs); its recorded output is
[`docs/audit/v2-pass1-checks.json`](audit/v2-pass1-checks.json).

No PR was opened. Nothing was merged.

## Sources used for grounding

Besides the approved facts, three of Salih's **public** repositories were read to check claims. The private
SAMS repository was deliberately not opened.

| Source | Used for |
| --- | --- |
| `Salih04/sams-reliability-core` (public SAMS evidence package) | SAMS architecture boundaries, the reliability guarantees, historical test results, limitations, ownership wording |
| `Salih04/capstone-financeIQ` (public FinanceIQ repository) | The documented look-ahead audit (IC +0.150 → +0.031), methods actually applied, open problems (survivorship) |
| `Salih04/Salih04` (public profile README) | Crytek role and dates; ownership wording |

Two findings changed the content materially, beyond removing unverified claims:

- **V1's SAMS architecture was partly wrong, not only unverified.** V1 said the event log lives in PostgreSQL and
  that resume falls back to a snapshot. The evidence package says PostgreSQL holds durable task, ownership and
  decision state, Redis carries event delivery, and a resume that cannot prove completeness returns an
  **explicit gap**. The site now says that.
- **V1 overstated the Crytek role.** V1 said "Backend Engineer". The public profile says "Backend Engineering
  Intern, May–Jul 2026". The site now says that.

---

## Major changes: V1 → V2

### 1. Fabricated history and status language (P0-1, P0-2, P0-4, P0-5)

- **V1 problem.** Experiment #038, decision IDs 004–021 and 003–019, failed experiments #021/#027/#031, note
  numbers 015–018 with 2026 dates, a WebGL experiment that never happened (also claimed in the README), invented
  incidents behind every SAMS decision, "SAMS · ONLINE", "Market Data Lab · ACTIVE", "Live system", and an MSc
  that read as completed.
- **V2 solution.** Every identifier is non-historical: "Engineering decision A–E", "Research decision A–E",
  "Demo run 01", "Negative result · Documented / Synthetic example", "Lab note — draft". Incidents are gone;
  each decision states the need, the design alternatives, and evidence that is either cited to a public source
  and labelled historical, or marked "design direction" or "open problem". Status vocabulary: "Simulation
  ready", "In progress", "Open". The MSc is "MSc Data Science student · University of Basel" everywhere.
  FinanceIQ is "MSc Data Science research / semester project · in progress". SAMS is "independent engineering
  project · private codebase · not deployed to production". A new `tests/content.test.ts` fails the build if
  any of this comes back.
- **Why it matters.** The audit's biggest risk was an interviewer asking about a history that did not exist.
  Every remaining claim now either cites a public source or says plainly that it is a plan or an illustration.
- **Remaining weakness.** Lab Notes are still drafts in Salih's voice; SAMS team size is unknown; whether the
  resume shows a surname is undecided (see *Unresolved verification items*).

### 2. One figure-label system (P0-3)

- **V1 problem.** Four different phrasings, at the end of figures, sometimes hidden on completion; the
  architecture, pipeline and walk-forward diagrams carried no label at all.
- **V2 solution.** `<FigureLabel kind fig />` renders `FIG. 01 · SIMULATION` in the top-left corner of every
  figure frame, in calm mono with a hairline and no warning colour. It stays visible in every state. The footer
  defines all three classes. Used on: the SAMS failure demo (SIMULATION) and its topology lane (SCHEMATIC),
  SAMS architecture (SCHEMATIC), the PIT plate and consequence readout (SYNTHETIC DATA), bench specification
  (SIMULATION) and output (SYNTHETIC DATA), pipeline and walk-forward (SCHEMATIC). The old `.demo-note`
  captions are deleted.
- **Why it matters.** A visitor can tell real, conceptual and synthetic apart at a glance. Verified facts carry
  no label, so the absence of a label means something.
- **Remaining weakness.** The hover explanation is a `title` attribute (plus screen-reader text); a proper
  focusable tooltip would be better.

### 3. Entry screen (P1-1)

- **V1 problem.** "SALIH / RESEARCH LAB": the brand outranked the person; roles were 13px metadata; no project
  was named; the plexus background was generic and meaningless.
- **V2 solution.** Person → discipline → positioning → evidence. "SALIH" (display), "Software Engineer",
  "MSc Data Science student · University of Basel", the approved one-line positioning, then two project
  instruments (SAMS: *Agent systems · event replay · reliable workflows*; FinanceIQ: *Point-in-time data ·
  reproducible research*), each with a status line, a line-art preview and a call to action. The plexus canvas is
  deleted. The **shared instrument trace** runs across the bottom: an upper band of SAMS sequence numbers
  (`seq 041 → 044`, one appended every ~3.6s) and a lower band of the FinanceIQ timeline (`reported →
  published → available → as-of`, with a hatched future). It is plain DOM and static under reduced motion.
  The duplicated mobile navigation list is gone.
- **Why it matters.** Who, what and the two strongest pieces of work are all visible in the first viewport
  (`01-entry.png`, `14-mobile-entry.png`), and the background previews the site's real concepts: ordering,
  time, availability.
- **Remaining weakness.** At 1600×1000 the hero is vertically centred, leaving some empty space above the name.

### 4. Control Room: a 2.5D floor plan (P2-3, P3-3, P3-5, P3-6)

- **V1 problem.** Tilted rounded cards on a 3×3 grid with three empty cells, a React re-render on every
  pointer move, ~220px of dead space, and a map cut by the fold at 1280×720.
- **V2 solution.** An SVG floor plan (outer walls, a corridor, room walls, doorways with door swings, a fading
  floor grid) on a `rotateX(40°)` CSS-perspective plane sized with container-query units. Labels are upright
  DOM links positioned by a JS projection that mirrors the CSS transform (`project()` in `FacilityMap.tsx`), so
  they never rotate with the floor. Each room has a floor preview: SAMS nodes plus an event stream, a FinanceIQ
  as-of timeline, archive records, vault specimen slots, research sheets. Hover or focus lights the room
  outline, draws the wire from "You are here" to the room, and starts its preview. A click runs a 560ms camera
  move (scale and translate toward the room), then navigates; reduced motion navigates at once. There is no
  pointer parallax and no WebGL. The intro became a band above the map, which is sized to the viewport height.
  Below 1024px the plan becomes a building directory with the same previews.
- **Why it matters.** It now reads as a facility you enter rather than a card grid (`02`, `03`, `03b`).
- **Remaining weakness.** At 1024px the map is hidden in favour of the directory, because 1024 is the shell's
  pocket-interface breakpoint. The floor previews are decorative; they do not show live state.

### 5. SAMS: the failure demo as a running machine (P2-1, P0-2)

- **V1 problem.** A generic agent graph with wall-clock timestamps, and "Observe System", a modal stepper that
  narrated. Event log, sequence numbers and replay were never shown, and the demo never failed.
- **V2 solution.** A two-lane instrument, open by default and auto-starting (except under reduced motion):
  - **Lane A, agent topology (SCHEMATIC):** API → Workflow → Planner, Research, Analysis, Approval (human),
    Execution, drawn as a spine with branches. Each node shows the last sequence number it produced; the
    workflow carries a worker badge. Tapping or clicking a node shows its role.
  - **Lane B, event stream:** `SEQ · EVENT · LOG appended · CLIENT live/replayed/pending`, with the sequence
    number dominant, `server` and `client` cursors, and empty slots for events still to come. No wall-clock
    time anywhere.
  - **Readout:** SERVER and CLIENT positions in large numerals, sync state, connection, worker.
  - **Disconnect client:** the client cursor stops while the server keeps appending (`SERVER 047 · CLIENT 041 ·
    Client behind by 6`). **Reconnect** sends `resume last_seq = 041`, replays 042→047 one event at a time,
    then hands off to live delivery. The completed log shows 042–047 *replayed* and 048–050 *live*, and the
    readout ends at `SERVER 050 · CLIENT 050 · State converged ✓`.
  - **Stop worker:** appends stop; after three ticks a replacement worker appends `WORKFLOW_RESUMED` at the
    current step, and completed steps are not re-run.
  - The engine is pure and tested (`src/lib/replay.ts`, `tests/replay.test.ts`): ordering, exactly-once
    delivery, gap-free handoff while the server keeps appending, worker recovery, determinism.
  - The worker scenario mirrors a published historical test ("worker stopped and replaced during approval
    wait"). The caption states the real explicit-gap contract.
- **Why it matters.** A visitor *causes* the failure and *watches* replay and convergence in about 20 seconds,
  which explains durability and resumability better than prose (`04`–`07c`).
- **Remaining weakness.** The explicit-gap path is described in the caption but not demonstrable (there is no
  "trim history" intervention yet). The Architecture tab is restyled and relabelled but is still a layered box
  view, not the audit's request-path schematic (P2-4).

### 6. SAMS content and visual identity (P1-3, P1-6)

- **V1 problem.** Decisions built on invented incidents; architecture contradicted the evidence; SAMS and
  FinanceIQ differed only in accent colour.
- **V2 solution.** Five decisions, each matching a published guarantee: durable workflows, resume-or-name-the-gap,
  gap-free handoff, durable state decides, ownership fails closed. The "What didn't work" section uses the
  evidence package's negative controls (read-then-write approval, trusting the signal payload, late live
  capture, ignoring history resets), presented as deliberate test variants, not incidents. Visually: a dotted
  machine-room grid, square instrument frames, rails, event slots, cursors, mono readouts, cyan for signal,
  green for convergence, amber for faults.
- **Why it matters.** The hardest technical claims are now the best-sourced ones.
- **Remaining weakness.** "Spatial" in the project name is still unexplained, because nothing public says what
  it refers to.

### 7. FinanceIQ: point-in-time first, with consequence (P1-7, P2-2, P0-9)

- **V1 problem.** The lab opened on a settings form; values were hidden; there was no plain-English setup; the
  as-of control was a small slider; the consequence needed a tab switch; axis labels collided on mobile.
- **V2 solution.** The default tab is **Point-in-time reconstruction**. It opens with the thesis in serif type:
  *"A backtest must only use information that had actually been published by the date it is simulating."* On
  the plate (SYNTHETIC DATA):
  - Reporting periods, publication delays, a later correction, the as-of cursor and a hatched future.
  - The **cursor itself is draggable** on any track, and it is a keyboard slider (arrow keys ±7 days, Page keys
    ±30, Home/End).
  - **▶ Play through time** moves it slowly, and steps by month under reduced motion.
  - Every row shows its value; selecting a row inspects it.

  Beside the plate, the selected record reads *"As of 31 Mar 2020 · Naive historical record **1.18** (struck
  through) · Actually available then **1.31** · 1.18 was published later, on 8 May 2020 · LOOK-AHEAD LEAKAGE"*,
  with a visible EPS definition (plus an `<abbr>` tooltip). The consequence readout (SYNTHETIC DATA) shows
  *naive signal score +0.06 vs point-in-time +0.01*: a toy score defined as a fixed baseline plus a fixed lift per
  leaked fact, so it varies with the cursor. A link leads to the documented real instance. Comparison logic is
  pure and tested (`compareFact`, `syntheticScores`). On mobile the comparison stacks under the timeline;
  ticks near the cursor hide, and minor ticks drop out (0 collisions measured).
- **Why it matters.** A non-quant understands the problem and its consequence on one screen (`09`–`11`).
- **Remaining weakness.** On phones the value labels can sit under the cursor line when it crosses them.

### 8. FinanceIQ visual identity, bench and negative results (P1-3, P2-5)

- **V1 problem.** FinanceIQ looked like SAMS in violet; the console was six `<select>`s; failed experiments
  used invented numbers and first-person research history.
- **V2 solution.**
  - **Material:** a ruled "paper" plate, Source Serif 4 (self-hosted) for titles and numerals, figure plates,
    measurement ticks and restrained violet.
  - **Experiment bench (demoted to tab 2):** an experiment specification (`DATASET Point-in-time snapshot ·
    VALIDATION Walk-forward · MODEL Ridge · SIGNAL Synthetic signal A · UNIVERSE Synthetic · 120 assets ·
    SEED 42`), set as serif lines with presets ("Clean run", "Leaky data", "Shuffled folds") and a RUN DEMO
    button. Output shows "Demo run 01", a fingerprint compared with the previous run, the fold chart and the
    leakage audit.
  - **Negative results:** hypothesis, observation, why it matters and status, as two **documented** records
    quoted from the public repository and one **synthetic example**.
  - **Research decisions:** each carries a status (applied / design direction / open problem). The embargo gap
    (unverified) is removed from the walk-forward schematic.
- **Why it matters.** The two labs now feel like a machine room and a research notebook. FinanceIQ's strongest
  real evidence, an audited negative result, is now on the site and cited.
- **Remaining weakness.** The case-study stack line (Python, scikit-learn, FastAPI, PostgreSQL) comes from the
  public repository; whether it describes the in-progress MSc project needs confirmation.

### 9. Case Study Mode (P1-4)

- **V1 problem.** Role at ~2,500px, result at ~8,000px, no scope, a thesis-style order.
- **V2 solution.** An **At a glance** spec plate directly under the title: role, project, status, problem,
  approach (three concepts), stack and evidence (with links), all inside the first viewport (`08`, `13`).
  Sections reordered: Problem → My role → Result / current status (including "What this does not show") →
  Architecture (with hard problems) → Key decisions → Evidence (with sources) → What didn't work → Technical
  details. Contents are a `<details>` element that is open on desktop and collapsible on mobile.
- **Remaining weakness.** No "paper" article surface or report masthead yet (the rest of P1-4).

### 10. Mobile (P0-8, P3-4)

- Tabs: edge fade plus chevrons when they overflow; the active tab is scrolled fully into view, including on
  deep links (checked).
- SAMS topology: DOM nodes at 15px; tap to inspect (checked). It is not a scaled-down diagram.
- PIT: labels sit above full-width tracks; collision-free axis; record and consequence stack below.
- Top bar: sound and terminal moved into the menu; the mode switch is compact ("Case").
- **Remaining weakness.** The Observe-style "full-screen stepper" idea from the audit was not pursued; the
  instrument scrolls instead.

### 11. Focus and keyboard (P0-6)

- Busy controls (Reconstruct, Run demo, Stop worker) use `aria-disabled`, never `disabled`; focus stays on the
  initiating control. Checked by keyboard: SAMS connect/disconnect, reconstruct and Run demo.
- Live regions announce interventions and outcomes, not every tick. The skip link is the first Tab stop, and
  arrow keys move between tabs.

### 12. Case Study Mode persistence (P0-7)

- **V1 problem.** Visiting a case-study URL wrote `slab:mode=case` to storage, and unrelated pages inherited it.
- **V2 solution.** Mode is a property of the route (`modeForRoute`). Paired case routes open in case mode and
  keep it between each other; every other route opens in lab mode; a toggle on an unpaired page applies to that
  page only; nothing is read from or written to storage. The pre-paint script and the provider's initial state
  use the same rule, so there is no flash. Unit-tested, and checked in the browser for /resume/, /vault/,
  /about/ and /notes/.

### 13. Typography (P1-5)

- **V1 problem.** 15–80 text elements below 12px per page; uppercase mono with 0.12–0.3em tracking everywhere.
- **V2 solution.** Type tokens (`--fs-meta: 12px`, `--fs-label: 13px`, tracking 0.06em). Uppercase mono is kept
  only for instrument metadata (figure labels, readout keys, status lines). Navigation, tabs, buttons, field and
  record labels are sentence case. Measured: **0 elements below 12px on every captured page** at all five sizes.

### 14. Motion and performance (P3-1, P3-2)

- The rail heartbeat pulse and the entry rAF loop are gone; page transitions are opacity and translate only
  (no blur), at 160–240ms.
- JS per route (gzip): `/` 177 KB (V1 182), `/lab` 179 (182), `/sams` 189 (191), `/financeiq` 192 (194), case
  study 183 (188). CSS 15 KB gzip (V1 12.2). One added font family (Source Serif 4), self-hosted.

---

## Final report

### 1. Tests and build status

| Check | Result |
| --- | --- |
| `npm run typecheck` | pass |
| `npm test` | **42 tests pass** (7 files: replay 6 new, content 7 new, paths 3 new, pit 12 incl. 6 new, experiment 4, terminal 6 incl. 1 new, boundary 4) |
| Public boundary scan (`src/`, before the build) | pass (62 files) |
| Production static build | pass; all 19 routes prerendered |
| Public boundary scan (`out/`, after the build) | pass (87 files) |
| Browser verification (`capture-v2.mjs`) | **31 / 31 checks pass**; page overflow 0 at every size; 0 elements below 12px; 0 console errors |

The browser checks cover:

- reconnect convergence and exactly-once delivery;
- worker recovery;
- focus retention in SAMS, PIT and the bench;
- keyboard slider and pointer drag;
- the 1.18 / 1.31 comparison;
- the case-mode route model;
- the skip link and arrow-key tabs;
- mobile tab overflow;
- mobile topology label size and tap-to-inspect;
- mobile axis collisions;
- reduced motion: no auto-start, reconstruction jumps to its end, the entry trace stays still.

Sizes tested: 1600×1000, 1280×720, 1024×768, 390×844, plus a reduced-motion context at 1600×1000.

### 2. Files changed

**New**

- `src/components/records/FigureLabel.tsx`
- `src/components/shell/TabBar.tsx`
- `src/components/sams/FailureDemo.tsx`
- `src/components/entry/InstrumentTrace.tsx`
- `src/components/lab/Glyphs.tsx`
- `src/components/financeiq/ExperimentBench.tsx`
- `src/components/financeiq/NegativeResults.tsx`
- `src/lib/replay.ts`
- `tests/replay.test.ts`, `tests/content.test.ts`, `tests/paths.test.ts`
- `docs/audit/capture-v2.mjs`, `docs/audit/v2-pass1-checks.json`, `docs/V2_PASS1_REPORT.md`
- `docs/audit/screenshots/v2-pass1/*`

**Rewritten**

- `src/content/{sams,financeiq,about,archive}.ts`, `src/content/types.ts`
- `src/components/lab/FacilityMap.tsx`
- `src/components/sams/SamsLab.tsx`
- `src/components/financeiq/{FinanceLab,PitLab,WalkForward}.tsx`
- `src/components/casestudy/CaseStudy.tsx`
- `src/components/records/{DecisionRecord,DecisionBrowser}.tsx`
- `src/app/page.tsx`, `src/app/lab/page.tsx`
- `src/styles/{base,lab}.css`

**Edited**

- `src/content/{site,notes,vault}.ts`
- `src/lib/{pit,experiment,paths,terminal,useHashTab}.ts`
- `src/components/shell/{AppShell,LabProvider}.tsx`
- `src/components/sams/ArchitectureView.tsx`
- `src/components/financeiq/PipelineView.tsx`
- `src/components/editorial/NotesIndex.tsx`
- `src/app/{layout,about/page,archive/page,resume/page,vault/page,case-studies/page,notes/page,notes/[slug]/page,sams/case-study/page,financeiq/case-study/page}.tsx`
- `src/styles/{shell,editorial}.css`
- `tests/{pit,experiment,terminal}.test.ts`
- `README.md`, `docs/CONTENT_VERIFICATION.md` (resolution log), `package.json`, `package-lock.json`
  (`@fontsource-variable/source-serif-4`)

**Deleted**

- `src/components/entry/SystemField.tsx` (plexus)
- `src/components/sams/{AgentTopology,ObserveSystem}.tsx`
- `src/components/financeiq/{ExperimentConsole,FailedExperiments}.tsx`

### 3. Screenshot paths (`docs/audit/screenshots/v2-pass1/`)

| # | Required state | File |
| --- | --- | --- |
| 1 | Entry | `01-entry.png` |
| 2 | Control Room | `02-control-room.png` |
| 3 | Control Room, selected room | `03-control-room-selected.png` (+ camera move `03b-control-room-camera.png`) |
| 4 | SAMS default | `04-sams-default.png` |
| 5 | SAMS disconnected client | `05-sams-disconnected.png` |
| 6 | SAMS replay | `06-sams-replay.png` |
| 7 | SAMS completed state | `07-sams-completed.png` (+ worker fault `07b-sams-worker-stopped.png`, `07c-sams-worker-resumed.png`) |
| 8 | SAMS case study, first viewport | `08-sams-case-study.png` |
| 9 | FinanceIQ PIT default | `09-fiq-pit-default.png` |
| 10 | FinanceIQ naive leakage | `10-fiq-naive-leakage.png` |
| 11 | FinanceIQ PIT corrected state | `11-fiq-pit-corrected.png` |
| 12 | FinanceIQ reconstruction | `12-fiq-reconstruction.png` (+ bench `12b-fiq-bench.png`) |
| 13 | FinanceIQ case study, first viewport | `13-fiq-case-study.png` |
| 14 | Mobile entry | `14-mobile-entry.png`, `14b-mobile-entry-full.png` |
| 15 | Mobile Control Room | `15-mobile-control-room.png` |
| 16 | Mobile SAMS | `16-mobile-sams.png`, `16b-mobile-sams-full.png` |
| 17 | Mobile FinanceIQ PIT | `17-mobile-fiq-pit.png`, `17b-mobile-fiq-pit-full.png` |
| — | Extras | `18-mobile-sams-case-study.png`, `19-mobile-menu.png`, `20-reduced-motion-sams.png`, `laptop1280-*`, `laptop1024-*` (entry, control room, SAMS, FinanceIQ) |

### 4. Resolved P0 items

| Item | Status |
| --- | --- |
| P0-1 Unverified first-person claims | Resolved for the highest-risk rows (A-4, A-20, A-24, the F-series, the C-series): rewritten from approved facts and public sources, or removed. Guarded by `tests/content.test.ts`. Remaining open rows below. |
| P0-2 Status language | Resolved |
| P0-3 Figure labels | Resolved |
| P0-4 Fabricated identifiers and history (incl. WebGL / EXP-003, README) | Resolved |
| P0-5 Dates, institution, nature of SAMS | Resolved where facts exist (Crytek dates, Basel, independent project, MSc in progress); no dates invented for SAMS or the undergraduate degree |
| P0-6 Focus loss | Resolved |
| P0-7 Mode leak | Resolved |
| P0-8 Mobile tab overflow | Resolved |
| P0-9 PIT axis collisions on mobile | Resolved |

### 5. Unresolved verification items

1. **Surname.** The hero says "Salih" as briefed; the public profile says "Salih Camcı". Should the resume and
   metadata use it?
2. **SAMS team size and period.** Unknown, so not shown.
3. **FinanceIQ ↔ public repository.** The site cites `capstone-financeIQ` as "the public FinanceIQ repository"
   for the documented audit, applied methods and stack, and does not call it a capstone or attach it to a
   degree. Please confirm that citing it from the in-progress MSc project's page is right, and whether the stack
   line describes the MSc project.
4. **Crytek game title.** "Hunt: Showdown" is taken from the public profile; confirm it may appear on the
   portfolio as well.
5. **Lab Notes (N-3).** Three draft articles in Salih's voice; approve, rewrite or unpublish.
6. **Working principles (E-5)** and the About intro: confirm the voice.
7. **Experiment Vault (M-4).** Only this site's own experiments. Public side projects exist (for example YOLOv8
   parking-lot detection, highway RL) but were not added unread.
8. **Contact email.** The public profile lists one; `site.contact.email` is still empty by design.

### 6. Visual improvements

- An entry that leads with the person and two real project instruments, over a meaningful trace instead of a
  plexus.
- A Control Room that is a floor plan (walls, corridor, doorways, room previews, a camera move) instead of
  tilted cards.
- A SAMS instrument in which failure, replay and convergence are visible, with sequence numbers and cursors as
  the visual language.
- A FinanceIQ plate that teaches look-ahead leakage in one screen, with a draggable cursor, values,
  comparison and consequence.
- Two distinct materials: a machine room for SAMS, a research notebook for FinanceIQ.
- Square-cornered plates, ruled records and readouts instead of one rounded panel everywhere.
- Compact lab headers that put the instrument above the fold at 1600×1000.
- Readable type: no text below 12px, little uppercase, low tracking.

### 7. Known issues

- The FinanceIQ panels all stay mounted (to hand reconstruction over to the bench); the PIT engine and bench
  render on first load whatever the tab.
- The SAMS demo auto-starts on arrival. On a slow reader this means it may already have finished; the
  "Restart task" control and hints cover that.
- The SAMS Architecture tab is still a layered component view (P2-4 not done).
- `AppShell` and `LabProvider` remain client components (P3-9 not done).
- Mobile PIT: value labels can sit under the cursor line.
- The figure-label explanation is a `title` attribute, which is hover-only for sighted users (screen readers
  get the text).
- Playwright's full-page captures stitch the sticky top bar in the middle of some long images; this is a
  capture artefact, not a rendering bug.

### 8. Would WebGL materially improve anything now?

**Not yet, and probably not for the site as a whole.** Every Pass 1 goal (facility depth, a running machine, a
time instrument) was reached in SVG, CSS perspective and DOM, keeping text crisp, selectable and accessible,
JS per route slightly *below* V1, and full reduced-motion support.

The one place depth could carry meaning is still the audit's P4-1 candidate: a 3D event-stream column in the
SAMS demo, where height is sequence and the client cursor visibly drops out and climbs back through replayed
events. But the 2D event lane now shows exactly that, and is verified by tests. A WebGL version would add a
"wow" moment, not understanding.

I would only consider it after watching real visitors use the 2D demo. It should be lazy-loaded behind an
explicit action, cost ≤ 60 KB gzip, and keep the 2D lane as the accessible version. The Control Room should
stay 2.5D.
