# S//LAB V2 — Pass 2: art direction and cinematic polish

Base: V2 Pass 1 (`6328d98`). Screenshots: [`docs/audit/screenshots/v2-pass2/`](audit/screenshots/v2-pass2/)
(Pass 1 set: `…/v2-pass1/`). Capture and verification script:
[`docs/audit/capture-v2-pass2.mjs`](audit/capture-v2-pass2.mjs); its recorded output is
[`docs/audit/v2-pass2-checks.json`](audit/v2-pass2-checks.json).

This was not a feature pass. Every change below is either a composition, a material, a motion or a content
decision from the brief. No PR was opened. Nothing was merged. No dependency was added.

---

## 0. Inspection before editing

The Pass 1 build was run and inspected at 1600×1000, 1440×900, 1280×720, 1024×768 and 390×844, together with
the committed Pass 1 screenshots. What stood out, screen by screen, with the placeholder-copy question
("would this still be S//LAB with the text replaced?"):

| Screen | Finding before Pass 2 | S//LAB without the copy? |
| --- | --- | --- |
| Entry | A startup layout: huge name on the left, two bordered project cards on the right, the trace pushed to the bottom edge. The trace was two unrelated bands (a ticker of `seq` labels and a dotted line), not one axis. | No. Cards + hero reads as a landing page. |
| Control Room | The floor plan was the right idea, but every wall had the same weight, room labels were bordered boxes, previews were faint thumbnails, the plan floated in an even grey with no light. At 1024 it was replaced by a list. | Partly. |
| SAMS default | At 1280×720 the header, two button rows, narration and readout used the whole viewport; **zero events visible** without scrolling. Topology was a stack of identical boxes. Duplicate "Case study" links. | Partly (the event log was distinctive, but below the fold). |
| SAMS disconnected | Server/client numbers changed, rows turned amber. The disconnect itself (the connection) was not drawn. | Partly. |
| SAMS replay | Six rows recoloured; replay was legible only through the readout. | No. |
| SAMS completed | "State converged ✓" in green: a celebration, not a verification. | No. |
| FinanceIQ PIT | A large serif thesis and a paragraph sat above the plate; at 1280×720 the timeline did not start until ~560px. A red banner announced leakage. | Partly. |
| FinanceIQ leakage | The comparison was a bordered card with a red boxed tag. Alarmed rather than discovered. | Partly. |
| Case studies | A good "At a glance" table, but drawn as a panel with pill chips; the first viewport at 1280 lacked team size, and FinanceIQ had no research question. | No (a well-made blog page). |
| Mobile entry | Cards stacked under the hero; the trace dropped out of the first screen. | No. |
| Mobile SAMS | First screen was header + controls; no instrument. | No. |
| Mobile FinanceIQ | Toolbar, then timeline labels colliding near the cursor. | Partly. |

Across the site: rounded or boxed containers everywhere (records, archive, vault, principles, case-study
cards), a filled "active row" in the rail, and three accent colours competing on some screens.

---

## 1. Entry

**What changed.** The entry is now an instrument panel opening onto the lab, framed by four registration marks
(not a box). A nameplate — `SALIH` beside a hairline, with *Software Engineer · MSc Data Science student,
University of Basel* and the positioning line — sits above **one shared time axis**. The two projects are the
two traces on that axis, and each trace's key is the way into its lab:

- **Above the axis (SAMS, "Event trace"):** numbered events (`033 … 044`) stand on the axis as stems. The newest
  one sits on the "now" line. A `client ◇` cursor trails it and catches up about a second after each new event.
- **Below the axis (FinanceIQ, "Historical trace"):** one fact's history steps down and to the right —
  *period end → publication → as-of* — and a *later revision* exists only in the hatched future.
- One vertical "now / as-of" cursor runs through both traces. Right of it, nothing is known yet.
- Caption: `FIG. 00 · SCHEMATIC` — *Two records on one time axis … What was known, and when?*
- Then `ENTER S//LAB →` and a quiet *Read the case studies →*.

Hovering one project key quiets the other trace (FOCUS).

**Visual reasoning.** The page's composition *is* the portfolio's thesis: two systems that both care about what
was known, and when. With the copy replaced by placeholders, the stems, the axis, the step-down record, the
cursor and the hatched future would still identify the site. The motion budget is one event every 4.6s.

**Transition.** `ENTER S//LAB` plays a 280ms exit (the nameplate recedes, both traces fold into the axis line),
then routes; the Control Room opens its floor from a line (`rotateX 89° → 40°`, 760ms) and the labels fade in
after it. Navigation itself is not delayed beyond the 280ms fold (measured 344ms click-to-URL including the
capture's own 140ms pause). Under reduced motion the link navigates at once with no floor animation (checked).

**Removed.** The two project cards and their glyph thumbnails; the "Research portfolio" eyebrow; the
"Enter the lab" / "Read case studies" button pair; the old two-band ticker.

**Still weak.** At 1600×1000 the panel is vertically centred, which leaves calm but generous space above it. On
phones the trace keeps its idea but loses its labels for period end and revision; it reads as a figure rather
than as a legend.

**Uniquely S//LAB?** Yes. This is now the clearest statement of the site's visual grammar.

Screenshots: `01-entry`, `02-entry-hover`, `02b-entry-transition`, `03b-control-room-arrival`, `16-mobile-entry`,
`w1440/w1280/w1024-entry`.

## 2. Control Room

**What changed.** The plan is drawn like an architectural sheet:

- poché walls (heavy, dark, thicker outer wall) with dashed door swings;
- a fine and a major floor grid that fade toward the edges;
- a circulation guide down the corridor;
- grid bubbles A–E along the far edge;
- a title block (`S//LAB · Level 01 · Plan — Schematic · not to scale`).

The surroundings stay dark. Light exists only in the two flagship rooms (a faint cyan and violet pool) and
around "You are here"; the far side of the plan fades out through a mask on the plane itself.

Each room shows what it contains, drawn on its floor at a legible size:

| Room | Floor drawing |
| --- | --- |
| Agent Systems Lab | An event rail `041 … 045` with the head filled, an agent hanging off `043`, and a client cursor |
| Market Data Lab | Report → available, a later record in the hatched future, an as-of line |
| Engineering Archive | Stacked engineering sheets |
| Experiment Vault | Two rows of specimen drawers |
| Lab Notes | Two ruled paper sheets |

Ambient motion is limited to two elements: an occasional signal along the SAMS rail (every 7.5s) and a slowly
breathing as-of line.

Room labels lost their boxes: an index, a name and a status against a hairline (the research room's name is
serif). On small plans (≤860px of stage) they become dark plaques so they stay legible over the drawings.

**Camera.** Selecting a room:

1. strengthens that room's boundary;
2. dims the others to 45%;
3. draws the route from the control room to the doorway;
4. enlarges the room's floor drawing by 5%;
5. after 140ms, walks the view 62% of the way toward the room at 1.32× (520ms, no blur);
6. routes.

**Visual reasoning.** "Walking toward an instrument" rather than zooming a diagram. The rooms announce their
contents before their labels are read, and the light hierarchy makes the two flagship rooms the obvious
destinations.

**Also.** The plan now shows at 1024×768 too (Pass 1 replaced it with a list there). Below 1024px it becomes a
**facility directory**: a lobby-board list with `Facility directory · Level 01`, floor numbers, a serif title
for the research room, mono status, and a small drawing per room. There is no pseudo-3D on phones.

**Removed.** Bordered room labels, uniform grey walls, the full-width darkening overlay (it drew a visible
rectangle on the page), and the row-number bubbles (they were clipped at narrow widths).

**Still weak.** The upright DOM labels sit over the floor rather than in it. On the bottom rooms at 1024 the
plaques partly cover the drawings. The arrival animation is satisfying once, and the same every time.

**Uniquely S//LAB?** Yes.

Screenshots: `03-control-room`, `04-control-room-room-active`, `05-control-room-camera`,
`03b-control-room-arrival`, `17-mobile-facility-directory`, `w1024-control-room`.

## 3. SAMS

**What changed.**

- **Header compressed.** The header-level "Run failure demo" / "Case study" buttons are gone; the case study
  stays as the tab-row link. The instrument head is one line: figure label, title and controls.
- **The instrument is a machine in three regions**, read left to right:

  | Region | What it shows |
  | --- | --- |
  | SYSTEM | A role-encoded topology, labelled `SCHEMATIC` |
  | EVENTS | The ordered log, with `SEQ · EVENT · DURABILITY · CLIENT` columns |
  | CLIENT STATE | The detail plane, one surface step lighter |

- **Topology encodes role.** The API is a thin entry port (a chevron). The Workflow is the strong structural
  node: a double border, with its worker state under it. The agents are small circular execution nodes on one
  bus, and the human approval is a diamond. A *Durable state* rail ("tasks · ownership · decisions") sits under
  everything and highlights while a worker is down. Every label comes from the published topology and
  architecture; nothing new was invented.
- **The event stream is the signature.** The sequence column anchors each row (16px mono, bold). The durability
  column reads `● retained`; the client column reads `seen` / `pending` / `replayed`. Colour is used only for
  `pending` (muted amber) and `replayed` (green). A `server ▸` cursor sits in the left gutter at the head row.
  The **client hangs off the log by a cable** at its cursor row, running into the client column.
- **Disconnect.** The cable breaks: two cut ends, the client end amber, the far end grey. The client cursor
  freezes at `041` while the server cursor walks down to `047`, rows `042–047` accumulate as `pending`, and the
  client column's secondary rows dim. The readout shows `SERVER 047 · CLIENT 041 · Client behind by 6`. No
  popup.
- **Replay.** The cable reconnects in green, and *resume from `last_seq=041`* appears. Each missed row lights
  as it passes through the client cursor (460ms per row), and its sequence number lands in the client column
  (`042 043 044 …`). Live delivery takes over after the hand-off.
- **Completion is a verification.** A `VERIFICATION · SIMULATION` block shows four checks:

  | Check | Result |
  | --- | --- |
  | Sequence continuity | PASS |
  | Duplicate delivery | NONE |
  | Client convergence | PASS |
  | Steps re-run after recovery | NONE (only after a worker stop) |

  It is followed by *Checked on this simulated run only.* The checks are computed from the simulated log by a
  new pure, tested `verify()` in `src/lib/replay.ts`.

**Grounding.** The brief's example said `● persisted`. The evidence package says durable task, ownership and
decision state lives in PostgreSQL, while Redis carries event delivery and replay uses *retained history*. So the
column says **retained**, not "persisted". The caption still states the explicit-gap contract. The verification
claims only what the deterministic demo checks.

**Visual reasoning.** SYSTEM → EVENTS → CLIENT is readable before any prose. The narration moved under the log
as a `log ›` line. At 1280×720, ten event rows and both cursors are in the first viewport (checked: the capture
counts the visible rows).

**Mobile.** Client state comes first, then the event sequence, then the topology (checked by the capture).
Controls are full-width, and the durability column is hidden.

**Removed.** The five-cell readout strip, the two header buttons, the boxed topology spine, the
`server`/`client` badge pills inside rows, and the "State converged ✓" green celebration.

**Still weak.**

- The disconnected cable break is clear in motion but small in a still screenshot.
- The Architecture tab is still the Pass 1 layered component view; it is the least "machine-like" view in SAMS.
- The explicit-gap path is described, not demonstrated.

**Uniquely S//LAB?** Yes: it reads as a running machine, not an agent demo.

Screenshots: `06-sams-initial`, `07-sams-disconnected`, `08-sams-replay`, `09-sams-converged`,
`09b-sams-worker-stopped`, `09c-sams-worker-verified`, `18-mobile-sams`, `19-mobile-sams-disconnected`,
`24-reduced-motion-sams`, `w1280-sams`.

## 4. FinanceIQ

**What changed.**

- **The timeline dominates.** The page opens on the plate itself, titled as a question in serif: ***What was
  known on 31 Mar 2020?*** The date updates as the cursor moves. Configuration (*Naive history / Point-in-time*,
  *Play through time*) is small and to the right. The thesis sentence moved under the figure as its caption
  (`Fig. 01 — A backtest must only use …`). At 1600×1000 and 1440×900 the timeline starts within the first
  ~480px (checked: under 600px at 1600).
- **Time reads left to right.**
  - Monthly measurement ticks, with a label each quarter and the year marked at July '19 and January '20.
  - Region annotations either side of the cursor: *← published | not yet published →*.
  - Marks: period end (open circle), publication delay (line), publication (dot), **correction (diamond)**.
  - The future is hatched.
- **The leakage moment is annotated, not alarmed.**
  - The red banner is gone. An italic serif note says *† 4 facts in the naive history could not have been known
    on 31 Mar 2020*.
  - Each leaked row carries a †, muted red marks, and a **dashed pull from its publication point back to the
    cursor**: the future being dragged into the past.
  - The evidence sheet reads *Simulated date 31 Mar 2020 · Naive history ~~1.18~~ · What was actually known
    1.31 · † 1.18 was published later, on 8 May 2020* over a ruled LOOK-AHEAD LEAKAGE annotation.
- **The as-of cursor is a physical control.** The handle carries its own label (`AS OF · 31 MAR 2020`) and has a
  larger invisible hit area, a grab cursor and a visible focus ring. It still works by keyboard: arrows ±7 days,
  Page keys ±30, Home and End (checked). Rows change state with short colour transitions as the cursor passes
  their publication date, so records visibly enter the available region.
- **Reconstruct history is evidence, check by check.** It now reconstructs the *selected* record in five steps,
  shown in advance as a ruled procedure:

  | Step | Check |
  | --- | --- |
  | 01 | Period identified |
  | 02 | Filing located |
  | 03 | Availability checked |
  | 04 | Revision excluded (or *Revision applied* / *Revisions checked*, by date) |
  | 05 | Point-in-time record accepted |

  Each step fills in its specific outcome as it completes (560ms each; at once under reduced motion). It ends in
  `HISTORICAL STATE RECONSTRUCTED` with a dataset ledger and **Open experiment bench**. The logic is a new pure,
  tested `reconstructRecord()` in `src/lib/pit.ts`, which provably agrees with the point-in-time dataset for
  every fact and date in the tests.
- **Negative results are research records.** Each reads `NEGATIVE RESULT` with its status in italic serif, then
  *Hypothesis / Observation / Interpretation / Why keep this?* (italic serif field names). A quiet source line
  follows: `PUBLIC PROJECT EVIDENCE · Supporting research repository · RESULTS.md ↗`, or
  `SYNTHETIC EXAMPLE · not a research result`. They are rules, not cards.

**Visual reasoning.** FinanceIQ now looks like a figure in a notebook: a question, a ruled plate, measurement
marks, a caption, and annotations with a dagger. It is still in the dark lab: no paper texture beyond the faint
rules.

**Mobile.** The question, controls and timeline come first. The evidence sheet follows immediately below the
plate, and the supporting tables after that. The axis keeps only half-year labels (0 collisions, checked).

**Removed.**

- The pre-plate thesis block and paragraph.
- The red leakage banner and the boxed red verdict tag.
- The per-observation "Accepted/Rejected" pill list.
- The "Selected record" card border.
- The negative-result cards and their left accent bars.

**Still weak.**

- At 1280 the side column is narrow (270px), so the evidence sheet wraps.
- The plate header wraps its controls onto a second line at most laptop widths.
- The experiment bench, validation and pipeline tabs only received the shared polish; they were not
  re-composed.

**Uniquely S//LAB?** Yes. It no longer reads as a configuration UI.

Screenshots: `10-financeiq-pit`, `11-financeiq-leakage`, `12-financeiq-reconstruction`,
`12b-financeiq-negative-results`, `20-mobile-financeiq-pit`, `21-mobile-financeiq-evidence`, `w1280-financeiq`.

## 5. Case Study Mode

**What changed.**

- **Masthead.** A ruled document strip (`CASE STUDY · AGENT SYSTEMS LAB` … `ENGINEERING REPORT`, or `RESEARCH
  REPORT` for FinanceIQ), then the title and the one-line summary.
- **At a glance** is a specification plate. A double accent rule replaces the panel fill and pill chips. It has
  three columns:

  | Row | Columns |
  | --- | --- |
  | 1 | **Role** (`Technical Lead / Maintainer` + what it covered) · **Project** (`Independent project · private codebase` + `2-person project`) · **Status** |
  | 2 | **Core challenge** (SAMS) or **Research question** (FinanceIQ, in serif), spanning the plate |
  | 3 | **Approach** / **Method** (numbered) · **Stack** · **Evidence** |

  At 1280×720 the whole plate is in the first viewport for both projects.
- **Reading rhythm.** Prose holds a 64ch measure. Figures, decision records, evidence and tables use the full
  body width (up to 880px). Section headings stay numbered.
- **Evidence** is ruled rows with the kind in the margin.
- **Decision records** became ruled documents: no card. The chosen alternative is marked by a green rule, and
  the index uses a rail marker.

**Content.** SAMS: *Independent project*, *Technical Lead / Maintainer*, *2-person project*, no dates. FinanceIQ:
*Researcher*, *MSc Data Science research / semester project · in progress*, research question *"How can a
historical experiment be restricted to the information that was actually available on each date it
simulates?"* (a rephrasing of the published problem statement, not a new claim), method numbered.

**Still weak.** The architecture figure inside the SAMS case study is the same layered view as in the lab.

**Recruiter-readable in 30 seconds?** Yes. See answer 6.

Screenshots: `13-sams-case-study`, `14-financeiq-case-study`, `22-mobile-case-study`, `w*-sams-case-study`.

## 6. Navigation, cards, typography, motion, colour, surfaces

- **Rail = facility directory.** It is a `Directory` heading over a vertical line with one stop per room:
  `01 Lab · 02 SAMS · 03 FinanceIQ · 04 Archive · 05 Vault · 06 Notes draft`. The numbering matches the floor
  plan and the page eyebrows (Archive was `05` on its page and `04` on the plan). The active item is a marker on
  the rail plus a short coordinate line, with no filled row. **Notes** is quieter and tagged `draft`. **Case
  studies** moved under a separator as a report link. The pocket menu uses the same list.
- **Card audit.** These became ruled regions:
  - the case-study index cards;
  - the archive record (now a ruled sheet with a double top rule);
  - the vault specimens (drawer fronts);
  - the About principles;
  - the decision records and their options;
  - the PIT comparison;
  - the negative results.

  Pills (`.tag`, `.chip`, the archive focus list, note filters) are square. The global radius is 2px. The only
  remaining rounded control is the Case-study switch, because it is a switch.
- **Typography.** Mono stays for sequence numbers, figure labels, dates and as-of values, system state and
  identifiers. Controls, navigation and descriptions are sans (the SAMS controls moved from mono to sans).
  Serif is used for FinanceIQ findings, the plate question, field names in research records, the research
  question and the FinanceIQ names. Still 0 elements below 12px on every captured page.
- **Motion.** Every remaining animation belongs to a category:

  | Category | Animations |
  | --- | --- |
  | STATE | Row replayed, step revealed, as-of breathe |
  | FLOW | Entry event arrival, new log rows, rail pulse, cursor travel |
  | SPACE | Entry fold, floor opening, camera walk, page transitions |
  | FOCUS | Room dimming, trace quieting on hover |

  At rest:

  | Screen | Ambient elements |
  | --- | --- |
  | Entry | 1 |
  | Control Room | 2 |
  | SAMS | The demo itself, which stops at convergence |
  | FinanceIQ | 0 |
  | Case studies | 0 |
- **Colour.** Graphite carries most of the site. Cyan means signal, green convergence, amber a fault, violet
  research. Leakage uses a muted rose (`#d98f8e`) instead of the saturated failure red. Grayscale check: SAMS is
  dense mono rows with stems and cables; FinanceIQ is serif headings with a hatched right half and ruled plates.
  The two differ in shape and type, not only in hue.
- **Surfaces.**

  | Level | Surface |
  | --- | --- |
  | 0 | The facility void (page background, the dark floor) |
  | 1 | The instrument plane (the SAMS machine, the PIT plate) |
  | 2 | The selected detail (the SAMS client column, the PIT evidence sheet) |

  Nested bordered panels were removed.
- **Terminal.** Untouched apart from the shared radius. It stays secondary.

---

## 7. Answers

1. **Does the Entry feel distinctive without reading the copy?** Yes. A name plate over one time axis carrying
   numbered stems above and a stepped publication record below, cut by a single now/as-of cursor with a hatched
   future, is not a template layout. The figure *is* the thesis.
2. **Does the Control Room now feel like a facility?** Yes, more than before. It has poché walls, door swings,
   grid bubbles, a title block, light only where work happens, instruments drawn on the floors, a camera that
   walks toward a room, and a floor that opens when you arrive from the entry. The remaining tell is the upright
   labels floating above the floor.
3. **Does SAMS feel like a running machine rather than an agent demo?** Yes. The page reads as SYSTEM → EVENTS →
   CLIENT STATE, with cursors and a cable. Disconnect is drawn as a broken cable and replay as rows passing
   through a cursor. It ends in a verification table, not in agent "thinking".
4. **Does FinanceIQ feel like research rather than a configuration UI?** Yes. It opens on a question and a ruled
   figure. Controls are secondary. Leakage is a † annotation with a dashed pull, and reconstruction is a five-step
   evidence procedure.
5. **Is the difference between SAMS and FinanceIQ obvious in grayscale?** Yes. SAMS is a tabular mono machine
   with vertical cursors and a horizontal cable. FinanceIQ is a serif-titled plate with time running left to
   right, tick marks, a hatched future and italic annotations.
6. **Is Case Study Mode recruiter-readable in 30 seconds?** Yes. The first viewport at 1280×720 shows project,
   one-liner, role, project type and team size, status, the core challenge or research question, approach or
   method, stack and evidence links.
7. **What is now the strongest screen?** The SAMS disconnect → replay → verification sequence. A close second is
   the Entry, which is now the identity piece the brief asked for.
8. **What is now the weakest screen?** The SAMS **Architecture** tab (and the same figure in the SAMS case
   study). It is still a layered box diagram from Pass 1 and the least S//LAB view on the site. Next weakest:
   the FinanceIQ bench, validation and pipeline tabs, which only received shared polish.
9. **Is any real 3D still justified?** No. The facility reads as a facility in CSS perspective and SVG, the
   instruments are clearer flat, and the budget stayed flat (see below). The Pass 1 note still holds: a 3D event
   column in SAMS would add spectacle, not understanding.
10. **The final three changes before launch:**
    1. Redraw the SAMS Architecture view as the request-path schematic the audit asked for (P2-4), in the same
       machine grammar as the failure demo.
    2. Put the room labels *into* the floor on desktop (projected, foreshortened plaques at the doorways) so the
       Control Room has no floating UI layer, and give the 1024px plan its own label layout.
    3. Make the explicit-gap contract demonstrable: a "trim retained history" intervention that makes the
       reconnect end in `GAP 042–044` instead of a replay, with its own verification line.

---

## 8. Tests and build

| Check | Result |
| --- | --- |
| `npm run typecheck` | pass |
| `npm test` | **51 tests pass** (7 files). New: `verify()` ×4 in `replay.test.ts`, `reconstructRecord()` ×4 in `pit.test.ts`, Pass 2 content decisions ×1 in `content.test.ts` |
| Content guard (`tests/content.test.ts`) | pass. All Pass 1 guards kept; a new guard pins SAMS role, team and project wording, the repository label (never "capstone"), the first-name-only hero and quiet draft Notes. |
| Public boundary scan, `src/` | pass (67 files) |
| Public boundary scan, `out/` | pass (87 files) |
| Static production build | pass; all routes prerendered |
| Browser verification (`capture-v2-pass2.mjs`) | **39 / 39 checks pass**; page overflow 0 and 0 elements under 12px on all 50 captured pages; 0 console errors in every context |

Browser checks cover:

- 1600×1000, 1440×900, 1280×720, 1024×768, 390×844, and a reduced-motion context.
- Keyboard: the skip link is the first Tab stop, arrow keys move between tabs, Tab reaches both project keys and
  `Enter S//LAB` on the entry, and focus stays on the SAMS connection control and on the reconstruct control.
- Reduced motion: no SAMS auto-start, the entry trace is still, reconstruction jumps to its end, and `Enter
  S//LAB` navigates at once without the floor animation.
- SAMS disconnect and reconnect: 041 frozen, server at 047, broken cable, `last_seq=041`, convergence, every
  event delivered exactly once, and verification `PASS,NONE,PASS`.
- Worker stop and resume: `WORKFLOW_RESUMED`, convergence, *Steps re-run after recovery · NONE*.
- PIT: pointer drag, keyboard adjustment, the 1.18 / 1.31 comparison on 31 Mar 2020, the leak annotations, the
  five reconstruction steps, and the hand-over to the bench.
- Case Study navigation (contents link scrolls to its section) and the case-mode route model.
- Mobile: tab overflow affordance, tapping a tab, the SAMS client → events → topology order, and 0 PIT axis
  label collisions.
- Entry → Control Room arrives in under 900ms with the floor animation.

## 9. Performance

Measured with the same script on a fresh build of Pass 1 (`6328d98`) and of this pass (gzip, JS referenced by
each route's HTML):

| Route | Pass 1 JS | Pass 2 JS | Δ |
| --- | --- | --- | --- |
| `/` | 178.0 KB | 178.9 KB | +0.9 |
| `/lab` | 179.9 KB | 181.3 KB | +1.4 |
| `/sams` | 189.7 KB | 190.5 KB | +0.8 |
| `/financeiq` | 193.6 KB | 195.7 KB | +2.1 |
| `/sams/case-study` | 184.4 KB | 184.6 KB | +0.2 |
| `/financeiq/case-study` | 183.5 KB | 183.7 KB | +0.2 |
| CSS (all routes) | 15.9 KB | 19.6 KB | +3.7 |

There are no new dependencies, images, textures or videos, and no WebGL. The floor drawings are SVG and the
light pools are gradients. CSS grew because the Entry, Control Room, SAMS and FinanceIQ each gained a dedicated
stylesheet; some Pass 1 rules for now-unused classes may remain and could be pruned.

## 10. Files

**New**

- `src/components/entry/EnterLab.tsx`
- `src/styles/{entry,facility,sams,fiq}.css`
- `docs/audit/capture-v2-pass2.mjs`
- `docs/audit/v2-pass2-checks.json`
- `docs/V2_PASS2_ART_DIRECTION.md`
- `docs/audit/screenshots/v2-pass2/*`

**Rewritten**

- `src/app/page.tsx`
- `src/components/entry/InstrumentTrace.tsx`
- `src/components/lab/FacilityMap.tsx`
- `src/components/sams/FailureDemo.tsx`
- `src/components/financeiq/{PitLab,NegativeResults}.tsx`

**Edited**

- `src/components/casestudy/CaseStudy.tsx`
- `src/components/shell/{AppShell,LabProvider}.tsx`
- `src/components/sams/SamsLab.tsx`
- `src/components/financeiq/FinanceLab.tsx`
- `src/components/lab/Glyphs.tsx`
- `src/lib/{replay,pit}.ts`
- `src/content/{site,sams,financeiq,about,notes,types}.ts`
- `src/app/{layout,resume/page,archive/page,vault/page,case-studies/page}.tsx`
- `src/styles/{base,shell,lab,editorial}.css` (lab.css lost its Entry, Control Room, SAMS and PIT sections to
  the new files)
- `tests/{replay,pit,content}.test.ts`
- `README.md`

## 11. Screenshot index (`docs/audit/screenshots/v2-pass2/`)

| # | Required | File |
| --- | --- | --- |
| 01 | Entry | `01-entry.png` |
| 02 | Entry hover | `02-entry-hover.png` (+ `02b-entry-transition.png`, the fold) |
| 03 | Control Room | `03-control-room.png` (+ `03b-control-room-arrival.png`, the floor opening) |
| 04 | Control Room, room active | `04-control-room-room-active.png` |
| 05 | Room camera transition | `05-control-room-camera.png` |
| 06 | SAMS initial | `06-sams-initial.png` |
| 07 | SAMS disconnected | `07-sams-disconnected.png` |
| 08 | SAMS replay | `08-sams-replay.png` |
| 09 | SAMS converged | `09-sams-converged.png` (+ `09b-sams-worker-stopped.png`, `09c-sams-worker-verified.png`) |
| 10 | FinanceIQ PIT | `10-financeiq-pit.png` |
| 11 | FinanceIQ leakage | `11-financeiq-leakage.png` |
| 12 | FinanceIQ reconstruction | `12-financeiq-reconstruction.png` (+ `12b-financeiq-negative-results.png`) |
| 13 | SAMS Case Study, first viewport | `13-sams-case-study.png` |
| 14 | FinanceIQ Case Study, first viewport | `14-financeiq-case-study.png` |
| 15 | Archive | `15-archive.png` |
| 16 | Mobile Entry | `16-mobile-entry.png` |
| 17 | Mobile Facility Directory | `17-mobile-facility-directory.png` |
| 18 | Mobile SAMS | `18-mobile-sams.png` |
| 19 | Mobile SAMS disconnected | `19-mobile-sams-disconnected.png` |
| 20 | Mobile FinanceIQ PIT | `20-mobile-financeiq-pit.png` |
| 21 | Mobile FinanceIQ selected evidence | `21-mobile-financeiq-evidence.png` |
| 22 | Mobile Case Study | `22-mobile-case-study.png` |
| — | Extras | `23-mobile-menu.png`, `24-reduced-motion-sams.png`, `w1440-*`, `w1280-*`, `w1024-*` (entry, control room, SAMS, FinanceIQ, SAMS case study) |

## 12. Content decisions applied, and open items

**Applied:**

- The hero stays `SALIH`. The full public name (*Salih Camcı*, from the public profile) appears only as the
  resume heading.
- The FinanceIQ repository is cited as *Supporting research repository*, and in negative results as *Public
  project evidence*. It is never called a capstone; a guard enforces this.
- SAMS is an *Independent project*, *Technical Lead / Maintainer*, *2-person project*, with no dates.
- Lab Notes stay `Draft`, quiet in the rail.
- "Hunt: Showdown" stays where Pass 1 placed it (Archive and Resume), as public professional context only.
- No Pass 1 correction was weakened, and no identifiers, incidents, telemetry, dates or metrics were added.

**For the human review:**

- The FinanceIQ research-question wording.
- The `retained` (rather than "persisted") durability label.
- Whether the full name should also appear on About or Contact.
