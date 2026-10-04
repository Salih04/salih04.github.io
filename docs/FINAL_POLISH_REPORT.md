# S//LAB — Final surgical polish

Base: V2 Pass 2 (`7a4c50c`). Screenshots: [`docs/audit/screenshots/final-polish/`](audit/screenshots/final-polish/).
Capture and verification script: [`docs/audit/capture-final-polish.mjs`](audit/capture-final-polish.mjs). Its
recorded output is [`docs/audit/final-polish-checks.json`](audit/final-polish-checks.json).

No PR was opened. Nothing was merged. No dependency was added, and nothing uses WebGL, Three.js or GSAP.

---

## 1. Changes made

### Entry (atmosphere and trace)

**Depth.** The trace is now an instrument plane in front of the room, using four subtle cues:

| Cue | What it does |
| --- | --- |
| Opaque surface | One step lighter than the page. It hides the facility grid behind it. |
| Top highlight | A 1px highlight along the top edge. |
| Light falloff | A restrained light pool centred on "now". |
| Past fade | The oldest events fade into the dark on the left. |

Behind the panel, the page gets one quiet light pool and an edge vignette. There is no glow, no colour and no card
radius.

**Readability.**

- The shared axis is the anchor. It is a stronger line with major marks every four ticks, a `SHARED TIME AXIS`
  label and `t →`.
- Server and client cursors are explicit. `◂ server` sits at the head of the log, beside its number. `client ◇`
  sits at the last applied event, down by the axis.
- The FinanceIQ lane spells out what was known when:
  - period end → publication is dashed and labelled *reporting lag* (the result is not yet known);
  - publication → as-of is solid violet and labelled *known*;
  - the later revision sits in the hatched future.
- The hatch is a little more visible and is labelled `NOT YET KNOWN`.

No explanatory paragraph was added.

**Project indexes.** The SAMS and FinanceIQ keys stay on the left. Each key's index line now takes its project's
colour (signal or research) and lights on hover or focus. Copy and actions are unchanged.

### Entry → Control Room transition (`facilityBridge.ts`, `LabProvider.tsx`)

Three lines are lifted out of the instrument into a fixed layer that survives the route change: the top rule, the
time axis and the bottom rule.

1. **0–200ms.** The hero recedes and the bands fold. The lines compress onto the axis.
2. **Route change.** The lines travel to the Control Room's corridor centre line, computed with the plan's own
   projection (180ms).
3. **Floor opens.** The floor opens from that line (400ms). The two outer lines become the corridor walls, then
   hand over to the plan and the layer removes itself.
4. **Arrival.** The rail and the intro fade in around the floor. Room labels arrive last.

Timing:

| Step | Measured / set |
| --- | --- |
| Click → route change | Measured under 400ms |
| Floor settled | ≈ 800ms |
| Labels settled | ≈ 900ms |

At least one visual reference is on screen for the whole sequence; see `02-entry-transition-midpoint`. On phones the
lines land on the facility directory's head rule. Under reduced motion, navigation is instant: no bridge, no floor
animation (checked).

### Control Room

**Selection is internal state, not an outline.** The room boundary dropped to a ~28% hairline. The selected room
instead:

- turns on its own light: a cyan or violet pool inside the room, and a neutral one for Archive, Vault and Notes;
- casts a faint reflection on the corridor floor by its door;
- lifts its instruments:

  | Room | What lifts |
  | --- | --- |
  | SAMS | The rail, event boxes and drop line go to full stroke opacity; the sequence numbers brighten. |
  | FinanceIQ | The axis, record and labels lift. |
  | Neutral rooms | Sheets, drawers and ink brighten. |

Unrelated rooms recede to 42% opacity, and to 24% once the camera moves.

**Depth hierarchy.**

- The far-side mask is gentler (0.66 instead of 0.42 at the far edge), so the far flagship rooms stay readable.
- The near outer wall and the lower partitions carry slightly more light.
- The corridor is neutral.
- The selected room has the highest contrast.

**Previews.** Base contrast is raised for every floor drawing: SAMS rail, FinanceIQ axis, record and period marks,
sheets, drawers and specimens. The flagship rooms' labels moved out of the rooms to their doorways, as corridor
signage with a dashed tick to the door. Both flagship floors are now unobstructed. The title block became a ruled
strip under the plan.

**Camera** (`lib/facility.ts`, `dolly()`):

1. The room activates from inside and the other rooms recede.
2. After 120ms, the plane itself moves in 3D: it translates toward the room, dollies toward the viewer and eases its
   tilt from 40° to 33°. Because it is a dolly, near parts grow more than far ones; this is a perspective change,
   not a uniform 2D scale.
3. The room's floor drawing grows to 1.09×.
4. The view's edges soften instead of clipping hard.
5. The route changes at 680ms, before the room fills the view.

**1024 / 1280 / 1440.**

- Audience routes wrap as two short lines (question, then link) below 1280px.
- The FinanceIQ door sign moved right so it never touches "You are here".
- The plan height budget includes the new title strip.
- Checked at each width: labels are inside the plan, nothing overlaps, and the plan fits the first viewport.

**Mobile directory.** The Vault and Notes counts come from `countLabel()` over the records (Notes filters
`status === "Draft"`). Nothing else changed.

### SAMS

**Architecture tab.** After inspection it was clearly weaker than the failure demo: generic stacked boxes. It was
redrawn, in this tab only, as `ArchitecturePath`:

- **Left (request path into durable work and state):** Client → API boundary (FastAPI) → Workflow (Temporal), with
  Activities (agent workers) on a branch, down to Durable state (PostgreSQL).
- **Right (delivery path back to the client):** Event delivery (Redis) → Event gateway (WebSockets) → client.
- **Between them:** one cyan crossing, *appends events · in order*.
- **Reconnect procedure** under delivery:
  1. `last_seq`
  2. replay when history is provably complete
  3. otherwise an explicit gap
- **System boundary:** a dashed frame named on its lower edge. Authentication and the tenant boundary are selectable
  tags on it.

Each node shows its role, its name and one line on what it owns. The marks use the demo's grammar: chevron entry,
double-bordered workflow, dot agents, solid state bar, cyan stream ticks.

Every label restates the existing `architecture` content. The one new field, `owns`, paraphrases each component's
published responsibilities. The `SCHEMATIC` label, the detail panel and the text alternative are kept, and keyboard
focus stays on the selected node (checked).

**Mobile event labels.** Long identifiers no longer truncate. Phones show concise labels (`WORKFLOW START`,
`APPROVAL REQUEST`, …). The canonical identifier stays in the accessible name and the row's `title`. The font size
and the simulation are unchanged.

### FinanceIQ

The research question now reads: *"How can we ensure a historical experiment only uses information that was actually
knowable at each simulated date?"* This is its only occurrence.

### Engineering Archive

The archive now holds two Crytek records, numbered in order of time and listed newest first. Each is a record
sheet:

| Field | ER-02 | ER-01 |
| --- | --- | --- |
| Role | Backend Engineering Intern | QA Intern |
| Period | May–Jul 2026 | Feb–Apr 2026 |
| Area | Backend services · Telemetry · Automated testing | — |
| Tech | Go | — |
| Context | Live game backend · Hunt: Showdown | — |
| Basis | Role, period, Go and context from the public profile; areas confirmed by Salih for publication · Public GitHub profile ↗ | Role and period confirmed by Salih. No further detail is published for this record. |

The QA record is deliberately minimal: no summary, areas or responsibilities. Below each record's fields sit a
Boundary line and a *Not in this record* row of dashed, redacted-style items. A **Cross-reference** list links the
two project reports. Nothing was invented.

The resume lists the same two roles: the backend internship adds *Telemetry and automated testing*, and the QA
internship has no bullet points.

### SAMS case-study architecture (content-consistency cleanup)

The case study no longer draws the old layered diagram. `ArchitectureView` was removed, along with its CSS.

The architecture is now one model, `architecturePaths` in `src/content/sams.ts`. It holds the steps, roles, edge
labels, the crossing, the reconnect contract and the boundary concerns. Both views read it:

- **Lab tab:** `ArchitecturePath`, the interactive version.
- **Case study:** `ArchitectureFigure`, a static, ruled report figure.

The figure shows:

- **A · Request and workflow path:** Client → API boundary (FastAPI) → durable workflow (Temporal) → durable state
  (PostgreSQL), with agent workers as activities.
- **B · Event delivery path:** Redis (ordered streams, retained history) → WebSockets → Client, plus the crossing
  *the workflow appends events, in order*.
- **Reconnect:**

  | Key | Contract |
  | --- | --- |
  | `last_seq` | The client states the last event it applied. |
  | `replay` | Used when retained history provably covers the interval. |
  | `gap` | An explicit gap otherwise. |

- **The system boundary,** with authentication and the tenant boundary.

A browser check asserts that the two views agree.

### Navigation

The Case Study toggle is now a square, ruled mode selector with a two-position slot. It keeps the same `role="switch"`
semantics and behaviour.

---

## 2. Screens deliberately left untouched

These were locked, or found strong enough on inspection:

- **SAMS Failure Demo:** structure, counters, cable, replay, `STATE CONVERGED`, verification, `retained`. The only
  change is the mobile label fix.
- **SAMS Engineering Decisions.** Inspected: IDs are letters A–E, the need, alternatives, reason, trade-off and
  evidence are separate fields, and evidence is labelled historical with a source.
- **FinanceIQ:**
  - Point-in-Time reconstruction, the evidence panel and Negative Results.
  - The Experiment Bench (utilitarian but clear), Validation (fold schematic plus evidence list) and Data pipeline
    (eight stages, each answering one question). None was dramatically more generic than the PIT view, so none was
    re-composed.
- **Case Study Mode** structure. The one exception is the SAMS architecture figure, made consistent with the lab tab
  in the cleanup (see §1).
- **Mobile:** Facility Directory, SAMS and FinanceIQ layouts.
- **Pages:** Vault (four real site experiments, no fabricated history), Lab Notes (drafts, no numbers or dates),
  About, Resume and Contact.
- **Terminal.**

## 3. Bundle comparison

Gzip size of the JS and CSS referenced by each route's HTML, measured on fresh static builds of `7a4c50c` and of this
pass:

| Route | JS before | JS after | Δ |
| --- | --- | --- | --- |
| `/` | 178.9 KB | 180.7 KB | +1.8 |
| `/lab` | 181.3 KB | 182.8 KB | +1.5 |
| `/sams` | 190.5 KB | 192.7 KB | +2.2 |
| `/financeiq` | 195.7 KB | 197.4 KB | +1.7 |
| `/sams/case-study` | 184.6 KB | 179.1 KB | −5.5 |
| `/financeiq/case-study` | 183.7 KB | 185.4 KB | +1.7 |
| `/archive` | 177.4 KB | 179.1 KB | +1.7 |
| CSS (all routes) | 19.6 KB | 22.7 KB | +3.1 |

Where the growth comes from:

- **JS, about 1%.** The shared bridge and projection code sits in the shell chunk. `/sams/case-study` got smaller: its architecture figure is now static, so the interactive diagram no longer ships there. `/sams` adds the architecture
  path and the mobile labels.
- **CSS.** Mostly the architecture path, the archive sheet and the Control Room states. The legacy layered-diagram rules were removed
  with `ArchitectureView`.

There are no images, video or texture assets. The committed screenshots are reduced to 192-colour PNGs (1.6 MB in
total).

## 4. Test and build status

| Check | Result |
| --- | --- |
| `npm run typecheck` | pass |
| `npm test` | **57 tests pass** (8 files). New: `tests/facility.test.ts` (projection, dolly, corridor lines, derived counts) and one content guard (research question wording, archive records — approved areas, minimal QA record, no "Backend Engineer" — and mobile event labels). |
| Public boundary scan, `src/` | pass (71 files) |
| Public boundary scan, `out/` | pass (87 files) |
| Static export | pass; all routes prerendered |
| Browser verification (`capture-final-polish.mjs`) | **37 / 37 checks pass** at 1440, 1280, 1024, 390 and under reduced motion |

The browser run found:

- page horizontal overflow 0 and 0 visible text under 12px on all 28 captured pages;
- 0 console errors in every context;
- deep links, the skip link and keyboard order on the entry all working;
- SAMS disconnect → replay → `PASS,NONE,PASS` and the `retained` column unchanged;
- PIT values unchanged.

## 5. Content grounding changes

| Item | Change | Source |
| --- | --- | --- |
| FinanceIQ research question | Reworded as specified; same meaning. | Brief |
| Crytek backend record | Structured fields. AREA is *Backend services · Telemetry · Automated testing*, at a high level only. No ticket IDs, feature names, APIs or telemetry schemas. | Public GitHub profile (`github.com/Salih04`) for role, period, Go and context; Salih's approval for the areas |
| Crytek QA record | Added as a minimal record: *Crytek · QA Intern · Feb–Apr 2026*. No responsibilities: none are established. | Salih's confirmation |
| SAMS architecture | One shared model for the lab tab and the case study. No new facts. | Existing `architecture` content |
| Not-in-record list | Only generic categories (internal systems, implementation details, proprietary code, internal tools and tickets, internal data), no names. | — |
| Architecture `owns` lines | Paraphrase each component's existing published responsibilities. Redis is "ordered streams, retained history", never "persisted". | Existing `architecture` content |
| Room counts | Derived from `vault` and draft `notes`. | Records |

## 6. Remaining launch blockers

1. **Draft content still awaiting Salih:**

   | Item | What it needs |
   | --- | --- |
   | Lab Notes (N-3) | Approve or rewrite. They are still drafts, written in the first person. |
   | Working principles (E-5) | Confirm the voice. |
   | Vault (M-4) | Decide whether to add real side projects beyond this site's own experiments. |

2. **Public email.** `site.contact.email` is still empty. The public profile lists an address; decide whether the
   site should show it.
3. **Public profile.** The GitHub profile does not mention the QA internship or the backend areas. Consider adding
   them there, so the public record and the site match.
4. **Launch-readiness phase (out of scope here):** SEO and metadata, domain, deployment, the analytics and privacy
   decision, link check, resume PDF, and a final adversarial content audit.
5. **Tooling.** The capture script needs a Playwright install outside the project (`PLAYWRIGHT_MODULE`), by design.

## 7. Final three weaknesses

1. **The middle of the transition is sparse.** For about 150ms between the route change and the floor opening, the
   frame is the intro text plus one corridor line on dark. It is continuous and never black, but it is the quietest
   moment of the sequence. The rail still appears with the route change; it is faded in rather than built.
2. **1024px Control Room.** The bottom rooms' labels (as plaques) still partly cover the top of their floor drawings.
   The FinanceIQ floor's small labels (*report*, *available*, *as of*) are legible but faint at rest.
3. **The Archive is still thin.** Two records, one of them minimal by design. It is honest, but it is the sparsest
   room in the facility.

---

## Is real 3D now justified?

**No.** Nothing in this pass hit a problem that 2D/2.5D could not solve:

- The transition needed a persistent reference across a route change. Three DOM lines and the plan's own projection
  math do it.
- The camera needed a real perspective change rather than a zoom. CSS `translate3d` on the already-perspective plane
  gives a true dolly.
- Room activation needed light from inside. SVG radial pools do it.

Each was solved with existing primitives for about 2 KB of JS. A WebGL scene would add a large dependency, a second
rendering path for reduced motion and mobile, and spectacle rather than understanding.
