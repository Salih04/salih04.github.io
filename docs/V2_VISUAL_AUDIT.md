# S//LAB: V1 visual quality and content grounding audit

Audited build: `claude/slab-research-portfolio-tfb3jb` @ `fd8380c` (V1), on 2026-10-04.
Method: static export (`npm run build`) served locally. Screenshots were captured with Playwright/Chromium at
**1600×1000** (wide desktop), **1280×720** and **1024×768** (laptop) and **390×844** (phone; captured at 2×,
stored at 1× and colour-quantised to keep the repository small). `npm run check` passes: typecheck, 19 unit
tests and the boundary scan.

Companion document: [`CONTENT_VERIFICATION.md`](CONTENT_VERIFICATION.md), the claim-by-claim register.
Screenshots: [`docs/audit/screenshots/v1/`](audit/screenshots/v1/). The capture script is
[`docs/audit/capture.mjs`](audit/capture.mjs).

This pass changed nothing in `src/`. No bug blocked inspection, so nothing was fixed.

---

## 0. Verdict in one paragraph

V1 is a **well-engineered, honest and restrained** build with a real point of view. It has typed content, an
editorial mode that shares records with the lab, a working as-of engine with tests, a boundary scanner, and
reduced-motion support throughout. Visually it reaches **"tasteful dark developer portfolio"**, not yet
**"research facility"**. Most screens are a page header, a row of tabs and a panel grid. Swap the copy and they
could belong to an infrastructure SaaS product. The two places where S//LAB already feels like nothing else are
the **PIT timeline** (a time axis with an as-of cursor, a hatched future and leak verdicts) and the **decision
records**. The biggest problem is not visual. **Most first-person claims about SAMS, FinanceIQ and Crytek are
drafted, not sourced**, and some identifiers (experiment #038, decision 017, note 018, a "failed WebGL
experiment") create a history that does not exist.

---

## 1. Capture index

| State | Desktop | Mobile |
| --- | --- | --- |
| Entry (hero) | `desktop-01-entry.png` | `mobile-01-entry.png`, `mobile-01b-entry-full.png` |
| Entry: Enter hover | `desktop-02-entry-hover-enter.png` | n/a |
| Control Room: default | `desktop-03-lab-default.png`, `laptop1280-lab.png`, `laptop1024-lab.png` | `mobile-03b-lab-full.png` |
| Control Room: room selected (hover) | `desktop-04-lab-room-selected.png` | n/a (no map on mobile) |
| SAMS Live System | `desktop-05b-sams-live-full.png`, `laptop1280-sams-live.png` | `mobile-05b-sams-live-full.png` |
| Observe System: mid-run | `desktop-06-sams-observe-mid.png` | `mobile-06-sams-observe-mid.png` |
| Observe System: completed | `desktop-07-sams-observe-complete.png` | `mobile-07-sams-observe-complete.png` |
| SAMS Architecture | `desktop-08b-sams-architecture-full.png` | `mobile-08b-sams-architecture-full.png` |
| SAMS Engineering decisions | `desktop-09b-sams-engineering-full.png` | `mobile-09b-sams-engineering-full.png` |
| SAMS Case Study | `desktop-10-…`, `desktop-10b-sams-case-study-full.png` | `mobile-10-…`, `mobile-10b-…` |
| FinanceIQ Experiment Console: empty | `desktop-11-fiq-console.png` | `mobile-11-fiq-console.png` |
| Console: running / PIT result / leaky result | `desktop-12a-…`, `desktop-12-…`, `desktop-13-fiq-console-leak-result.png` | `mobile-12a/12/13-…` |
| Data pipeline | `desktop-14-fiq-pipeline.png` | `mobile-14-fiq-pipeline.png` |
| PIT: naive dataset (leakage) | `desktop-15-…`, `desktop-15b-fiq-pit-naive-full.png` | `mobile-15b-fiq-pit-naive-full.png` |
| PIT: point-in-time dataset | `desktop-16-fiq-pit-pointintime.png` | `mobile-16-…` |
| Reconstruct History: mid / complete | `desktop-17a-…`, `desktop-17-fiq-reconstruct-complete.png` | `mobile-17a-…`, `mobile-17-…` |
| Validation | `desktop-18-fiq-validation.png` | `mobile-18-…` |
| Results + failed experiments + research decisions | `desktop-19b-fiq-results-failed-full.png` | `mobile-19b-…` |
| FinanceIQ Case Study | `desktop-20-…`, `desktop-20b-…` | `mobile-20-…`, `mobile-20b-…` |
| Case study index / Archive / Vault / Notes / Note / About / Resume / Contact / 404 | `desktop-21 … desktop-29` | `mobile-21 … mobile-29` |
| Terminal (help + status) | `desktop-30-terminal.png` | `mobile-30-terminal.png` |
| Mobile menu | n/a | `mobile-31-menu-open.png` |
| Non-paired page in Case Study Mode | `desktop-32-lab-in-case-mode.png` | `mobile-32-…` |

Note: in some full-page captures (`*-17-*`, `mobile-15b`), the sticky top bar and a focused skip link appear
partway down the page. That is how Playwright stitches full-page captures of sticky elements, not a rendering
bug. The focus loss behind it **is** real; see P0-6.

### Automated checks recorded during capture

- **Page-level horizontal overflow: none** at any size or in any state.
- Only expected 404s (the deliberate `/does-not-exist/` probe, and `/favicon.ico`, which a static export does
  not serve; the site uses `icon.svg`).
- Inner horizontal scrollers on mobile: the tab bars (SAMS: 3 tabs and a link; FinanceIQ: 5 tabs and a link,
  overflowing to about 890px), the decision index on mobile (to about 914px), the PIT data table, and the code
  block in Lab Note 018. All of them scroll, but **none shows a visual affordance** that more content exists
  (see `mobile-05b`, where the tab is cut to "ENGINEERI").
- **Small type:** every page renders 15–80 text elements below 12px (10, 10.5, 11, 11.5px), almost all of them
  uppercase mono with wide tracking. On the FinanceIQ console there are about 80. This is the main legibility
  problem.
- Colour contrast is fine. `--text-faint` (#7d8995) on `--bg` is about 5.5:1 and on `--panel` about 5.0:1. The
  legibility problem comes from **size × tracking × uppercase**, not colour.

---

## 2. Visual direction: screen by screen

Each screen gets two questions: **"Could this belong to a random developer portfolio?"** and **"What makes it
S//LAB?"**

| Screen | Random portfolio? | Why | What is uniquely S//LAB today |
| --- | --- | --- | --- |
| Entry | **Partly** | Big grotesk name, mono eyebrow, two CTAs, constellation ("plexus") background. That is the most common dark-portfolio hero there is. | The status table (as a concept), and the `S//LAB` mark. |
| Control Room | **Partly** | Five rounded cards around a dashed circle on a 3×3 grid. With the 12° tilt it reads as "cards, slightly skewed". The left column is a standard intro. | Room numbering, "You are here", wiring between rooms. |
| SAMS Live | **Yes** | Boxes and arrows plus an activity feed: the stock "agent workflow demo" image. Uniform node style, generic labels. | Nothing yet. The interesting parts (event log, sequence numbers, replay) are invisible. |
| Observe System | **Yes** | A vertical stepper in a modal. It narrates instead of showing. | The copy is excellent. |
| SAMS Architecture | **Yes** | A stack of identical rectangles that looks like a form. Inspector panel on the right. | The "why / responsibility / trade-off / ⌀ boundary" inspector is distinctive. |
| SAMS Decisions | **No** | ADR-style records with options A/B/C, the selected one highlighted, and evidence. Hiring managers rarely see this. | **Signature content.** |
| FinanceIQ Console | **Yes** | Two fieldsets of `<select>`s and a results card: a SaaS settings page. It is the **default tab**. | The leakage audit verdict ("Looks significant — but … invalid") is excellent. It is just buried under a form. |
| Data pipeline | **Yes** | A segmented tab strip and a description card. | The "question each stage answers" framing. |
| **PIT Reconstruction** | **No** | A time axis, an as-of cursor, a hatched "future", lag bars, LEAK verdicts and a reconstruct log. | **The strongest, most original screen.** |
| Validation | Partly | A Gantt-like fold diagram plus a bullet list. | Embargo gap visual. |
| Results / failed experiments | Partly | Three cards with an amber top rule. | "Why keep it?" is a lovely field. |
| Case Study | **Partly** | Clean editorial typesetting with a TOC. It reads like a well-made blog post more than an engineering report. | Numbered sections, decision records inline. |
| Archive | Partly | A single record. Thin. | "⌀ boundary" notation. |
| Vault | Yes | Generic card grid. All of its entries are about this website. | — |
| Terminal | Yes (it's a common gimmick) | — | It is honest ("the terminal is optional"). |

**Pattern:** the S//LAB identity already lives in *content structures*: records, verdicts, boundaries,
as-of. It does not yet live in the *visual language*. Every lab screen uses the same template: an eyebrow, a
70–80px display title, a lede, a tab row, a two-column "h2 left / description right" section head, and panels.
That template is the generic part.

### Things that break the "research laboratory" illusion

1. **"SAMS · ONLINE" with a green pulsing dot** on the entry screen, and "Live system" as a tab name. A
   laboratory would say *specimen*, *apparatus* or *simulation*. "Online" is ops-dashboard language, and it is
   also untrue.
2. **Wall-clock timestamps in the SAMS feed** (`20:08:19`). They make a scripted demo look like telemetry. Use
   relative time (`t+0.0s`) or sequence numbers (`seq 0041`). The sequence number *is* the SAMS story.
3. **Rounded card plus border plus the same panel colour everywhere.** Instruments, plates, specimens and logs
   all look identical.
4. **Uppercase mono with 0.2em tracking for every label.** That is cybersecurity-template language. Used
   everywhere, it stops meaning "instrument readout".
5. **The FinanceIQ default view is a form.** A research lab should open on an observation, not a settings page.

---

## 3. Entry screen (the first five seconds)

Reference: `desktop-01-entry.png`, `laptop1280-entry.png`, `mobile-01-entry.png`.

| Must communicate without interaction | V1 | Notes |
| --- | --- | --- |
| Salih | ✓ but merged | "SALIH / RESEARCH LAB" is one heading in two weights. The name becomes part of the brand ("Salih Research Lab") rather than a person. The second line is visually larger (longer), so **"RESEARCH LAB" dominates "SALIH"**. |
| Software Engineer | ~ | Present, but as 13px uppercase mono with about 0.3em tracking. It is the third-ranked element at most. |
| MSc Data Science | ~ | Same line as above, joined with "×". |
| Systems / agents / research | ~ | One sentence: "Building reliable intelligent systems through software, agents and data." It is fine but generic, and it names no project. |

**Typography.** The display face (Space Grotesk at about 110px, tight) is confident. The hierarchy is inverted:
the brand outranks the person, and the roles are styled as metadata. Line length of the tagline is fine (about
50ch).

**Status indicators.** A good idea with the wrong vocabulary (see 2). They also aren't links, and they look
clickable.

**Background visualisation.** A Canvas-2D nearest-neighbour graph with occasional packets. It is performant
(DPR capped at 2, paused off-screen) and right-weighted so the copy stays readable. Visually it is the generic
plexus/constellation motif, and it carries no meaning. It doesn't resemble an agent topology, an event log or a
timeline. At 9% stroke alpha it nearly disappears on many displays.

**Spacing.** On desktop the whole composition sits left. The right 55% is the faint graph, and about 140px of
dead space sits above the footer. On mobile the hero fills the screen well, but the status table and a full
"Navigation" list push the page to about 1,200px. The entry duplicates the menu.

**Cinematic quality.** Low to moderate. Nothing arrives, nothing resolves, and there is no sense of a facility
behind the screen. It is restrained (good) but static (missed opportunity).

**Perceived technical sophistication.** Moderate. The mono details and the status table hint at it, but the
first screen shows no evidence: no project names, no artefact.

**Recommendation (P1-1):** recompose the hero as **person, then discipline, then evidence**:

```
SALIH [surname?]
Software engineer · MSc Data Science
I build agent systems that survive failure and research pipelines that can't see the future.

[ SAMS  — agent orchestration · event replay ]   [ FinanceIQ — point-in-time research ]
Enter the lab →        Read case studies
```

Replace the plexus with a **meaningful, quiet instrument trace**: for example a single horizontal time axis on
which events tick in (sequence numbers on one band, an as-of cursor on another). It previews both labs' visual
languages. It stays Canvas 2D, or plain SVG, with no new dependency.

---

## 4. Control Room

Reference: `desktop-03`, `desktop-04`, `laptop1280-lab.png`, `laptop1024-lab.png`, `mobile-03b`.

**What works**
- The *idea*: rooms around a "You are here" core, room numbers matching the rail, and wiring that brightens on
  hover (`desktop-04`).
- The three audience routes ("Short on time? / Systems engineer? / Researcher?"). They are the best
  recruiter-facing UX on the site.
- Room status lines ("PIT reconstruction ready") hint at what is inside.
- Below 1024px it degrades to a clean index rather than a cramped map.

**What feels flat**
- `rotateX(12deg)` with ±6–7° pointer parallax reads as *a tilted card grid*. There is no floor, no depth cue
  (shadow, fog, scale falloff), no wall or room boundary, no ambient light and no scale difference between the
  near and far rows.
- Three of the nine grid cells are empty, so the plan looks unfinished rather than architectural.
- About 220px of dead space sits below the map at 1600×1000. At 1280×720 the map is cut by the fold, and the
  eyebrows wrap to two or three lines ("04 · / ENGINEERING / ARCHIVE").

**What looks generic**
- Rooms are the same rounded card used everywhere else. The core is a dashed circle.
- Rooms don't preview what is inside. The SAMS room could show its node graph in miniature, and the FinanceIQ
  room a tiny timeline.

**Would depth help?** Yes, but *spatial legibility* helps more than *3D*. The goal is "I am entering a
facility, and I can see where things are." That is achieved by:
1. a drawn **floor plan** (walls, doorways, corridors) in SVG, with rooms as *spaces* rather than cards;
2. **live miniatures** inside each room (a static SVG thumbnail of each lab's signature visual);
3. stronger perspective (`rotateX(~50°)`, a perspective origin near the bottom), a floor grid that fades out,
   and room labels counter-rotated to stay readable (the classic 2.5D isometric technique);
4. a **camera move** on room select: scale and translate the plane toward the room, then route-transition into
   it. That links the map to the destination (motion class B).

**Can 2.5D DOM/CSS/SVG achieve it?** Yes. Everything above is CSS transforms and SVG. It keeps text selectable,
accessible and crisp, and it costs no extra JS.

**What deserves real 3D?** At most **one object**: an optional SAMS **event-stream column** (see P4-1). The
Control Room itself does not need WebGL. Do not convert it.

---

## 5. SAMS as a portfolio story

| Must communicate | V1 | Where / gap |
| --- | --- | --- |
| 1. What SAMS is | ~ | The one-liner is clear. "Spatial" is never explained: what kind of spatial tasks? |
| 2. Why it is technically difficult | ✓ in case study, ✗ in lab | "The engineering problem is not calling agents…" is the best sentence about SAMS, and it is only in the case study overview. |
| 3. What Salih personally owns | ✗ in lab, ~ in case study | Section 04, about 3 screens down. **Unverified** (CONTENT_VERIFICATION A-4). |
| 4. Agent orchestration | ✓ | Topology and Observe. |
| 5. Event/state flow | ~ | Present in Observe *text*. The *visual* never shows an event log, a sequence number or a projection. The feed says "Event persisted" while a packet moves Research → **Execution**, so the agent graph and the event log are conflated. |
| 6. Reliability | ~ text only | No visual of failure. Nothing ever fails in the demo. |
| 7. Replay / resumability | ✗ visually | The **central idea** (reconnect, then resume from seq N) is never demonstrated. It is only described. |
| 8. Multi-tenant considerations | ~ | Two "cross-cutting" boxes in Architecture, plus decision 021. |
| 9. Architectural decisions | ✓✓ | The decision records are excellent. |
| 10. Trade-offs | ✓ | Each component and decision has one. |

**Live-vs-demonstration labelling.** The caption under the topology is correct but is 11px mono at the bottom of
the figure. The tab is called "Live system", the feed uses wall-clock time, and the entry says "ONLINE". The
labels contradict each other. The Observe overlay drops its "Scripted demonstration" note once the run
completes (`desktop-07`).

**What the visualisation should teach (P2-1).** Make Observe System a *two-lane* instrument: an **agent lane**
(the topology) and an **event lane** (an append-only log with sequence numbers, a durability marker, and a client
cursor). Then let the visitor **cut the client's connection** halfway through. Events keep appending. On
reconnect the client sends `last_seq=41`, events 42–47 replay, and the projections match ("client = server ✓").
Optionally a **"kill worker"** button shows the workflow resuming at step 4. That teaches durability, ordering,
persist-then-broadcast and replay in about 20 seconds, and it is *obviously* a simulation because the visitor
caused the failure.

---

## 6. FinanceIQ as a research story

**Is it visually different from SAMS?** Only by accent colour (violet instead of teal). The layout template, tab
row, panels, buttons and typography are identical. SAMS should feel like a *running machine*; FinanceIQ should
feel like a *lab notebook or instrument bench*: a light-on-dark *plate*, ruled grids, specimen labels, a
time axis as the dominant structure, and more paper-like editorial typography.

| Must communicate | V1 |
| --- | --- |
| Historical truth | ✓ PIT timeline |
| Point-in-time correctness | ✓ naive/PIT toggle, reconstruct log |
| Publication lag | ✓ lag bars (period end ○ to known ●) |
| Look-ahead leakage | ✓ LEAK rows, leakage banner |
| Reproducibility / determinism | ~ fingerprint shown as `fp 2d8a3774` with no explanation |
| Walk-forward evaluation | ✓ schematic |
| Negative results | ✓ failed experiments (content unverified) |
| Evidence preservation | ~ said, not shown |

**The PIT interaction: would a non-quant understand it?** Partly. Strengths: the hatched future to the right of
the as-of line is a superb, instantly readable metaphor, and the per-row verdicts are clear. Gaps:

1. **The values are never shown.** The whole point is "on 31 March 2020 the naive dataset says Company A's Q4
   EPS was **1.18**, but what was actually known was **1.31**." The numbers are only in the collapsed table. Put
   the value on each row and show the *wrong number versus the right number* for revisions.
2. **No plain-language setup.** "EPS", "restated" and "universe" are unexplained. One sentence of framing
   would fix that: *"A company reports its results weeks after the quarter ends, and sometimes corrects them
   later. A backtest must only use what had been published by the date it simulates."*
3. **The default as-of date already shows leakage**, but nothing invites the visitor to *drag*. The slider is
   small and top-right. Make the as-of cursor itself draggable on the timeline, and add a "▶ scrub through
   time" auto-play.
4. **The consequence is disconnected.** Leakage changes the console's *score*, but the user has to click "Run
   experiment" and change tabs. Show an inline "what the model would conclude" readout beside the timeline:
   naive IC 0.06 (inflated) versus PIT IC 0.01, both labelled synthetic.
5. The default tab is the **Experiment Console**, not PIT. The most memorable interaction is the third tab.

**Console results.** The leakage verdict and audit are strong. The fold chart is well made (rounded data end,
mean line, table alternative). `t-statistic 3.95` with "Looks significant" on synthetic data is fine *because*
of the verdict, but the synthetic label sits at the bottom of the panel.

---

## 7. Unverified content

See [`CONTENT_VERIFICATION.md`](CONTENT_VERIFICATION.md). Headlines:

- **Around 45 Low-confidence first-person claims**: SAMS ownership, test suites, outcomes, Crytek practices,
  FinanceIQ methods and results.
- **9 fabricated or unsupported items**: experiment #038 and up, #021/#027/#031, decision IDs 003–021, note
  numbers 015–018 with 2026 dates, and **Vault EXP-003 "WebGL control room — Failed"**, which never happened (the
  git history contains no such work). The README repeats that claim.
- **4 misleading status labels**: ONLINE, ACTIVE, "Live system", and terminal `status`.
- Missing basics: **no dates and no institution anywhere**. It is unclear whether SAMS is an employer product, a
  startup or a personal project. The resume lists it as an "organisation".

---

## 8. Synthetic data labelling

Current labelling is **present but inconsistent**. It uses four different phrasings ("Controlled demonstration",
"Scripted demonstration of the design", "Synthetic demonstration", "Fictional companies, invented values"),
always in 11px mono with a small amber ◇, always at the *end* of the visual, and sometimes hidden after
completion. Architecture, Pipeline and Walk-forward carry no label but read as factual diagrams.

**Recommended convention (P0-3)**: three classes, one component, always in the **top-left corner of the figure
frame** (like a plate label in a scientific figure):

| Tag | Meaning | Applies to |
| --- | --- | --- |
| `SIMULATION` | Scripted or deterministic run of a design; nothing real is connected | SAMS topology, Observe System, console run log |
| `SYNTHETIC DATA` | Invented numbers or entities | PIT dataset, fold ICs, t-stat, fingerprint |
| `SCHEMATIC` | Conceptual diagram of a real design; not to scale, not exhaustive | Architecture, Pipeline, Walk-forward |

The design: a `<FigureLabel kind=… />` with mono text at 11–12px, a 1px outline in `--line-strong`, and **no**
warning colour. Amber suggests danger; this is ordinary scientific annotation. Add a "Fig. 2 · " prefix for
the lab-notebook feel. Hover or focus shows a one-line explanation. One footnote-style definition goes in the
footer. Remove the four ad-hoc phrasings. This reads as rigour, not defensiveness.

Corollary: real project facts, once verified, get **no** tag. That makes the absence of a tag meaningful.

---

## 9. Case Study Mode

**30–60 second test** (`desktop-10`, `mobile-10`): what a recruiter sees in the first viewport:

| Needed | V1 first viewport |
| --- | --- |
| Problem | ~ only in the one-liner |
| Role | ✗ section 04, about 2,500px down |
| Scope (team, duration, status) | ✗ absent |
| Architecture | ✗ section 05 |
| Difficult decisions | ✗ section 07 |
| Evidence / result | ✗ section 11, about 8,000px down |

The case study is **10,651px** tall on desktop and **14,564px** on mobile. On mobile, the TOC alone takes the
whole second screen. The order (Overview, Problem, Constraints, Role…) is a thesis structure, not a recruiter
structure.

**Recommendation (P1-4): an "At a glance" plate** directly under the title, as a ruled six-cell spec sheet that
reads in under 30 seconds:

```
ROLE        Backend architecture · event model      SCOPE   [team size] · [dates] · [status]
PROBLEM     Long-running agent work that must survive restarts and reconnects
APPROACH    Durable workflows · ordered event log · replay from sequence
KEY CALLS   Persist-then-broadcast · Redis as fan-out only · resume from seq   → decisions
EVIDENCE    [verified test types / outcomes]                                   → evidence
STACK       FastAPI · Temporal · PostgreSQL · Redis · WebSockets
```

Then move **Role** to section 02 and **Result** up to section 03. Collapse Constraints, Implementation and Next
into a "Details" group.

**Typography and reading width.** The body measure (about 66ch, 17px, line-height ~1.75) is good. Problems:
section numbers "01"/"02" are 11px and float above the heading. Desktop leaves the right 400px empty at 1600 (the
article column is 1076px including the TOC), so the TOC could become a sticky side rail on the right. The case
study uses the lab's dark UI chrome (rail, top bar, buttons), so it never feels like "opening a report". To get
there:
- a slightly lighter "paper" surface for the article column (`#111418`) with a hairline frame;
- a report masthead (project · report number · date · author · status), set as a small ruled table;
- figure numbering ("Fig. 1 — Architecture (schematic)");
- serif or semi-serif display headings are optional. Keep Inter for the body.

Also: the architecture figure inside the case study (`ArchitectureView compact`) is the same stacked-box widget,
and it doesn't read as a figure.

---

## 10. Mobile

| Area | Finding |
| --- | --- |
| First-screen comprehension | Good: name, roles and tagline all fit (`mobile-01`). The status table and a duplicate full navigation list push the page to 1,211px. |
| Navigation | The top bar crams the mark, sound, terminal, a **large "CASE STUDY" pill** and a hamburger into 390px. The pill takes about 35% of the bar. On mobile, make it an icon toggle or put it in the menu. Sound and terminal don't belong in the mobile top bar. |
| Control Room | Becomes a plain list (fine), but loses all identity. Proposal: a vertical **"elevator"/floor directory**, with rooms as floors and a mini-preview strip per lab. |
| Diagrams | The SAMS topology scales down to node labels about 7px tall (`mobile-05b`), which is unreadable. The PIT axis labels collide ("2020-01 AS-OF 2020-07", `mobile-15b`), and the track is about 120px wide, so the lag bars are tiny. |
| Tabs | Overflow without any affordance ("ENGINEERI", "P"). There are 5 FinanceIQ tabs. On mobile, use a stacked "chapter" list or a select-style switcher. |
| Terminal | `help` wraps descriptions under commands (`mobile-30`). A terminal on a phone is a gimmick without a keyboard. Hide it, or offer command chips. |
| Case study | The TOC fills screen 2. Collapse it into a `<details>` "Contents" or a sticky section indicator. |
| Typography | 10–11px tracked uppercase labels are hard to read on a phone. Minimum 12px. |
| Touch targets | Main buttons are at least 44px (good). Inline text links in the control-room routes are fine. The `details` summaries ("AGENTS AS TEXT") are 11px text targets. |
| Vertical density | Every lab page spends its first screen on the header (eyebrow, title, subtitle, two stacked buttons, lede). On `mobile-11`, the console's first control is at about 1,300px (2×). |

**Desktop concepts that should become different mobile interactions**
1. **Control Room map → floor directory** (vertical list styled as a building section, with a preview per room).
2. **SAMS topology → vertical "swimlane" timeline**: agents as rows, time flowing down, the event log inline.
   It reads naturally while scrolling and needs no scaling.
3. **PIT timeline → one row per fact, as a horizontal card** that the as-of slider (sticky at the bottom of the
   screen, thumb-reachable) sweeps across. Alternatively, rotate the axis so time runs **down**.
4. **Experiment console → preset chips** ("Clean run", "Leaky data", "Shuffled folds") instead of six selects.
5. **Observe System → full-screen, step-by-step stepper with swipe**, not a long scrolling list.

---

## 11. Motion audit

Classes: **A** communicates system state · **B** supports spatial understanding · **C** aesthetic · **D**
unnecessary (remove).

| Animation | Where | Class | Action |
| --- | --- | --- | --- |
| Packet travel along an edge (`packet-move`) | SAMS topology | **A** | Keep and polish: draw the packet on an SVG path with a trailing fade, not a CSS translate. |
| Node halo on activation (`halo`) | SAMS topology | **A** | Keep. |
| Feed line enter (`feed-in`) | SAMS feed | **A** | Keep. |
| Observe step reveal (1.5s per step) | Observe | **A** | Keep. Add the event-lane appends (P2-1). |
| Reconstruct log reveal (700ms per row) | PIT | **A** | Keep. Tie each row to a highlight on its timeline row (it does highlight; make it stronger). |
| Console log lines (520ms per line) | Console | **A** | Keep, about 3s total. |
| As-of cursor `left` transition | PIT | **B** | Keep. Make the cursor itself draggable. |
| Facility hover wire flow (fast dash) | Control Room | **B** | Keep. |
| Facility pointer parallax tilt | Control Room | **C** | Restrain: currently `setState` on every pointermove (a React re-render per mouse event). Move to CSS variables written through a ref. |
| Facility idle flow (infinite dash, 2.8s) on all wires | Control Room | **C** | Restrain: one slow pulse every few seconds, not continuous. |
| Entry plexus packets (rAF loop) | Entry | **C** | Restrain, or replace with a meaningful trace (P1-1). The loop redraws every frame even when idle. |
| Page enter (`page-in`, 520ms, Y+10px) | All routes | **C** | Keep, but shorten to about 240ms. |
| Route exit (opacity + scale + **blur(3px)**) | All routes | **C** | Drop the `filter: blur` (expensive on large pages, smeary). |
| Tab panel enter (`panel-in`) | Lab tabs | **C** | Keep, short. |
| Decision record enter (`panel-in`) | Decisions | **C** | Keep. |
| Architecture node stagger (`node-draw`) | Architecture | **C** | Restrain: plays on every tab visit. Play once, or turn it into **A** by animating the request path through the layers. |
| Fold bar grow (`bar-grow`, staggered) | Console chart | **C** | Keep (short). |
| Pipeline detail swap (`panel-in`) | Pipeline | **C** | Keep. |
| Terminal / pocket menu / observe fade-in | Overlays | **C** | Keep. |
| **Rail "LAB MODE" dot pulse (infinite)** | Shell, every page | **D** | **Remove.** A permanent heartbeat implies liveness and draws the eye to the least important element. |
| **Entry "ONLINE" status dots** (styled as live) | Entry | **D** | **Remove** the liveness styling together with the wording (P0-2). |

No animation blocks content, and `prefers-reduced-motion` is honoured globally (durations to ~0) and per
interaction (jump to the final state). Good.

---

## 12. Performance

| Metric | V1 |
| --- | --- |
| JS per route (gzip, all chunks in the HTML) | **182 KB** `/`, 182 KB `/lab`, **191 KB** `/sams`, **194 KB** `/financeiq`, 188 KB case study |
| Total JS emitted | 735 KB raw / 225 KB gzip (including the lazily loaded Terminal and Observe chunks) |
| CSS | One global stylesheet: 62.9 KB raw / **12.2 KB gzip**, loaded on every route (lab and editorial both) |
| Fonts | 3 variable families (Inter, JetBrains Mono, Space Grotesk), self-hosted. 16 subset files, 368 KB total on disk. `unicode-range` means a Latin visitor downloads 3 files. |
| HTML | 18–71 KB per page (fully prerendered, useful before JS) |
| Client components | 17 components + 2 hooks are `"use client"`. **`AppShell` and `LabProvider` are client components wrapping every page**, so the whole tree hydrates. Pages with no interactivity (Archive, Notes, About, Resume) still ship and hydrate the shell runtime. |
| Canvas | 1 (entry). DPR capped at 2. `IntersectionObserver` and `document.hidden` pause it, but the rAF loop keeps scheduling frames while paused. Redraw cost is O(edges) per frame, which is small. |
| Code splitting | Terminal and ObserveSystem are lazy (`next/dynamic`, `ssr: false`). The FinanceIQ panels are **all mounted at once** (hidden), so the PIT engine and console render on first load whatever the tab. |
| Animation cost | Mostly transform/opacity (compositor-friendly). Exceptions: the route-exit `filter: blur(3px)` on the full page, the facility tilt causing a React re-render per pointermove, and `transition: all` on `.observe__node` (`lab.css:1179`). |

**Risks:** about 180 KB gzip of baseline JS is mostly the React/Next runtime. That is acceptable but not lean
for a site whose first screen is text. The biggest lever is making the shell a server component with small
client islands (mode switch, terminal trigger, menu). Measure Lighthouse/INP on a mid-tier phone before and
after V2.

**WebGL boundary (if P4 is ever pursued):**
- Never in the entry route, the shell or the Control Room critical path.
- Load only through `next/dynamic(() => import(...), { ssr: false })`, *after* an explicit user action or once
  the target is in view **and** `requestIdleCallback` fires. Gate it on `matchMedia('(prefers-reduced-motion:
  no-preference)')`, on a WebGL2 capability check, and on `navigator.connection?.saveData !== true`.
- An SVG/DOM fallback renders first and stays as the accessible version. The 3D layer is purely additive.
- Budget: ≤ 60 KB gzip for the 3D chunk (raw WebGL or a minimal library such as OGL; **not** full three.js at
  about 150 KB), and ≤ 4 ms per frame on integrated graphics. Pause when off-screen.

---

## 13. Ranked improvement plan

Complexity scale: **S** < ½ day · **M** 1–2 days · **L** 3–5 days · **XL** > 1 week.

### P0: credibility and correctness

| ID | Current problem | Proposed solution | Impact | Cx | Affected files |
| --- | --- | --- | --- | --- | --- |
| **P0-1** | About 45 drafted first-person claims (ownership, tests, outcomes, practices) are published as fact. | Salih resolves `CONTENT_VERIFICATION.md` row by row. Add a `verified: boolean` (or a `source`) field to the content types. Unverified claims either render neutral placeholder copy or are omitted. Add a unit test that fails the build if a `verified: false` record is rendered in production. | Removes the biggest interview and credibility risk. | M (code S + content review) | `src/content/*.ts`, `src/content/types.ts`, `tests/` |
| **P0-2** | Status language implies live production: "SAMS · ONLINE", "ACTIVE", the "Live system" tab, the terminal `status`, wall-clock feed timestamps. | Rename to lab vocabulary: "Simulation ready", "Open", "Agent flow (simulated)". Replace timestamps with `t+1.2s` or `seq 0042`. Remove the pulsing styling. | Removes the most visible honesty contradiction. | S | `app/page.tsx`, `lib/terminal.ts`, `sams/SamsLab.tsx`, `sams/AgentTopology.tsx`, `styles/base.css` |
| **P0-3** | Synthetic and conceptual labelling is inconsistent (4 phrasings, end-of-figure placement, missing on Architecture, Pipeline and Walk-forward; Observe drops it after completion). | A single `FigureLabel` component: `SIMULATION` / `SYNTHETIC DATA` / `SCHEMATIC`, top-left of every figure frame, plus a footer definition. | Lets visitors distinguish real, conceptual and synthetic at a glance. | S–M | new `components/records/FigureLabel.tsx`; `AgentTopology`, `ObserveSystem`, `ArchitectureView`, `PipelineView`, `WalkForward`, `PitLab`, `ExperimentConsole`; `lab.css` |
| **P0-4** | Fabricated identifiers and history: experiment #038 and up, #021/#027/#031, decision IDs, note numbers and dates, Vault EXP-003 "WebGL control room — Failed", and the README "No metrics have been invented" / "WebGL control room was tried and dropped". | Renumber sequentially (`D1…`, `Run 1…`, `Note 01…`) or use real IDs. Remove note dates until published. Rewrite EXP-003 as a *design decision* ("Considered WebGL; chose CSS perspective") or delete it. Correct the README. | Removes invented history. | S | `content/sams.ts`, `content/financeiq.ts`, `content/notes.ts`, `content/vault.ts`, `lab/page.tsx`, `ExperimentConsole.tsx`, `README.md` |
| **P0-5** | Missing basic facts: no dates or institution anywhere. SAMS is listed as an "organisation", and the nature of SAMS (employer, startup or personal) is unclear. | Add `period`, `organisation` and `context` fields to resume entries and case-study headers. Show "Scope: [team] · [dates] · [status]". | Recruiters can place the work in time. | S (after content) | `content/about.ts`, `content/types.ts`, `app/resume/page.tsx`, `casestudy/CaseStudy.tsx` |
| **P0-6** | **A11y bug:** "Reconstruct history" and "Run experiment" set `disabled` on themselves while running, which drops keyboard focus to `<body>` (verified: `document.activeElement === BODY`). | Use `aria-disabled` and ignore clicks while running, or move focus to the log region (`tabIndex=-1`) and back to the button when done. | Keyboard and screen-reader users don't lose their place. | S | `financeiq/PitLab.tsx`, `financeiq/ExperimentConsole.tsx` |
| **P0-7** | **Mode leak:** visiting a case-study URL persists `slab:mode=case` to localStorage, so later non-paired pages (Vault, Resume, Archive…) open in Case Study Mode, and nav links point to case-study routes, without the visitor choosing it (seen in `desktop-21`, `desktop-23`, `desktop-27`). | Paired routes set the mode *for that route only* and do not write the preference. Only an explicit toggle writes to storage. | Predictable navigation. | S | `shell/LabProvider.tsx`, `app/layout.tsx` (pre-paint script) |
| **P0-8** | The mobile tab bars overflow with no affordance ("ENGINEERI", "P…"). FinanceIQ has 5 tabs plus a link. | Edge fade and scroll-snap now. Replace with a chapter list or select on mobile in P3-4. | Tabs become discoverable. | S | `styles/lab.css` (`.tabs`) |
| **P0-9** | The PIT axis labels collide on mobile (`2020-01 AS-OF 2020-07`). | Hide the tick label nearest the as-of label; move the as-of label below the axis on narrow screens. | Legible core interaction on a phone. | S | `financeiq/PitLab.tsx`, `lab.css` (`.timeline__*`) |

### P1: visual identity (make it S//LAB, not a dark portfolio)

| ID | Current problem | Proposed solution | Impact | Cx | Affected files |
| --- | --- | --- | --- | --- | --- |
| **P1-1** | Entry hierarchy: the brand outranks the person; roles are 13px metadata; the plexus background is generic and meaningless. | Recompose: **Name** (display), **roles** (readable 18–20px), a one-line thesis, **two project chips** (SAMS / FinanceIQ, each with a 4-word descriptor), CTAs. Replace the plexus with a quiet *instrument trace* that previews both labs (an event-sequence band and an as-of band). Canvas 2D or SVG, with no new dependency. | The first five seconds communicate who, what, and evidence. | M | `app/page.tsx`, `entry/SystemField.tsx`, `styles/shell.css` |
| **P1-2** | One template for every lab screen (eyebrow, huge title, lede, tabs, panels). Headers eat about 460px before the instrument appears (`laptop1280-sams-live`). | A **compact lab header**: a single line with the name, a short description, and actions on the right (about 120px). Push the instrument above the fold. Keep the big display title for the Entry and the case studies only. | The instrument becomes the hero of each lab. | M | `SamsLab.tsx`, `FinanceLab.tsx`, `lab.css` (`.lab-header`) |
| **P1-3** | SAMS and FinanceIQ differ only in accent colour. | Give each lab its own **material**. SAMS: a dark machine-room, a live-signal teal, a dotted grid, monospaced readouts, things that move. FinanceIQ: an **instrument plate / notebook**, ruled grid, figure captions, time axis as the dominant structure, more editorial serif-ish numerals, nothing moves unless the visitor scrubs. | Two genuinely different labs. | L | `lab.css` (split into `sams.css` / `financeiq.css`), lab components |
| **P1-4** | Case studies fail the 30–60s test: role at about 2,500px, result at about 8,000px, no scope. | An **"At a glance" spec plate** under the title (Role · Problem · Approach · Key calls · Evidence · Stack · Scope). Reorder: Role and Result move up; Constraints, Implementation and Next collapse into a Details group. A report masthead. A "paper" surface. Figure numbering. | Recruiter comprehension in under 60s; "engineering report" feel. | M | `casestudy/CaseStudy.tsx`, `content/types.ts`, `styles/editorial.css` |
| **P1-5** | Overuse of 10–11.5px tracked uppercase mono labels (up to about 80 per page). | Type scale tokens: mono labels at a minimum of 12px with tracking ≤ 0.08em. Reserve uppercase for figure labels and room numbers. Use sentence-case Inter for field labels and section descriptions. | Legibility plus a less "cyber template" feel. | M | `base.css`, `lab.css`, `shell.css`, `editorial.css` |
| **P1-6** | Rounded panel cards everywhere; instruments, records and logs look identical. | A small **component vocabulary**: *Plate* (figure frame with label and caption, square corners, hairline), *Record* (ADR, ruled), *Log* (monospace, line-numbered), *Readout* (big numeral and unit). Retire the generic `.panel` for figures. | Visual hierarchy that maps to meaning. | M | `lab.css`, `records/*`, lab components |
| **P1-7** | FinanceIQ opens on a settings form. | Default tab: **PIT reconstruction**. Order: Reconstruct, Experiment, Validation, Pipeline, Results. | The most memorable interaction is the first thing seen. | S | `FinanceLab.tsx` (`useHashTab` default) |
| **P1-8** | The Vault has only website internals; the Archive has one thin record. | Content: add real side projects to the Vault, or merge the Vault into Archive for now. Show the Archive as a ruled *register* rather than one card. | No visibly empty rooms. | S (code) | `content/vault.ts`, `content/archive.ts`, `app/vault`, `app/archive` |

### P2: signature interactions

| ID | Current problem | Proposed solution | Impact | Cx | Affected files |
| --- | --- | --- | --- | --- | --- |
| **P2-1** | Observe System is a stepper modal. It never *shows* the event log, sequence numbers, durability or replay, which are SAMS's real engineering. | Rebuild it as a **two-lane instrument**: an agent lane (the topology) and an **event lane** (an append-only log: `seq · type · durable ✓`, with a client cursor). Add visitor-triggered faults: **"Drop client connection"** (events keep appending; on reconnect `resume from seq 41`, replay 42–47, projection match ✓) and **"Kill worker"** (the workflow resumes at step 4). Keep the narration as captions. Label it SIMULATION. Reduced motion: a static storyboard of 4 frames. | The portfolio's systems-engineering centrepiece. It teaches replay and durability in about 20s. | L | `sams/ObserveSystem.tsx` (→ `sams/observe/*`), `content/sams.ts` (scripted event stream), new `lib/replay.ts` (pure, unit-tested like `pit.ts`) |
| **P2-2** | PIT: values hidden, no plain-language setup, a small slider, consequence disconnected. | (a) Show the **value per row**, and for revisions show `1.31 → 1.18 (published 2020-05-08)`. (b) A one-sentence plain-English premise above the plate. (c) Make the **as-of cursor draggable on the timeline**, plus "▶ Scrub through time". (d) An inline **consequence readout** (naive vs PIT synthetic score) beside the plate. (e) A "leak" row flashes when the cursor crosses its publication date. | Makes FinanceIQ's idea unforgettable to non-quants. | M–L | `financeiq/PitLab.tsx`, `lib/pit.ts` (value-delta helper + tests), `content/financeiq.ts` |
| **P2-3** | The Control Room reads as tilted cards with empty cells. | A **2.5D floor plan**: SVG walls, doors and corridors on a stronger perspective plane with a fading floor grid; rooms as spaces with **static mini-previews** (SAMS node glyph, FinanceIQ timeline glyph); a **camera move** into the selected room that hands off to the route transition. No WebGL. | Delivers "entering a research facility". | L | `lab/FacilityMap.tsx`, `app/lab/page.tsx`, `lab.css` |
| **P2-4** | The Architecture view is a stacked form of identical boxes. | Turn it into a **request-path schematic**. Selecting "Trace a request" animates one request through the layers: API returns immediately, the workflow takes over, events persist, fan-out, client. Cross-cutting concerns render as bands spanning layers, not as side boxes. | Architecture becomes explanatory (motion A). | M | `sams/ArchitectureView.tsx`, `lab.css` |
| **P2-5** | The console is 6 selects and opaque `fp` hash. | Preset chips ("Clean", "Leaky data", "Shuffled folds", "Both") plus an advanced drawer. A side-by-side **comparison of the last two runs** with matching fingerprints, explained ("same inputs → same fingerprint"). | Determinism and reproducibility become visible. | M | `financeiq/ExperimentConsole.tsx`, `lib/experiment.ts` |

### P3: polish

| ID | Current problem | Proposed solution | Impact | Cx | Affected files |
| --- | --- | --- | --- | --- | --- |
| P3-1 | Rail "LAB MODE" infinite pulse; plexus redraws while idle; facility idle wire flow runs continuously. | Remove the pulse. Stop scheduling rAF when there are no packets or glow (or after N seconds idle). Use an occasional single pulse on the wires. | Calmer, cheaper. | S | `shell/AppShell.tsx`, `base.css`, `entry/SystemField.tsx`, `lab.css` |
| P3-2 | Route-exit `filter: blur(3px)`; `page-in` is 520ms on every route. | Opacity and translate only, about 200–240ms. | Snappier, cheaper. | S | `shell.css` |
| P3-3 | Facility tilt re-renders React on every pointermove. | Write `--tilt-x/y` CSS variables through a ref in a rAF-throttled handler. | Smoother, with no React work. | S | `lab/FacilityMap.tsx` |
| P3-4 | Mobile: top-bar crowding (the Case study pill, sound and terminal); tabs; TOC on screen 2; the topology unreadable; terminal wrapping. | Mobile top bar: mark, mode icon, menu. Sound and terminal move into the menu. A chapter list replaces tabs. A collapsible TOC. A vertical swimlane SAMS view. Hide the terminal on coarse pointers, or offer command chips. | A designed phone experience. | L | `AppShell.tsx`, `shell.css`, `SamsLab.tsx`, `AgentTopology.tsx`, `CaseStudy.tsx`, `editorial.css` |
| P3-5 | Dead space: about 220px under the Control Room map; the entry's right side; the case study's right 400px. | Fill with structure, not decoration: the map scales to the viewport height; the case-study TOC becomes a sticky right rail. | Composed layouts. | S–M | `lab.css`, `editorial.css` |
| P3-6 | At 1280×720 the Control Room eyebrows wrap to 3 lines, and the map is cut by the fold. | Fit the map to the viewport height; shorten room eyebrows (number plus a short area name). | Works on the most common laptop. | S | `lab/page.tsx`, `lab.css` |
| P3-7 | Observe "Scripted demonstration" note disappears on completion; its focus moves to the primary button (good), but the background page is still visible and noisy. | Persistent figure label (P0-3); a darker scrim or `inert` on the page behind. | Polish and a11y. | S | `ObserveSystem.tsx`, `lab.css` |
| P3-8 | `transition: all` on `.observe__node` (`lab.css:1179`). | List explicit properties. | Minor performance. | S | `lab.css` |
| P3-9 | Shell is a client component; static pages hydrate the whole shell. | A server `AppShell` with client islands (mode switch, menu, terminal trigger, sound). | Less JS on editorial routes. | M | `shell/AppShell.tsx`, `shell/LabProvider.tsx`, `app/layout.tsx` |
| P3-10 | `/favicon.ico` 404 on static hosts. | Emit `favicon.ico`, or add `<link rel="icon" href="/icon.svg">` explicitly (Next does add it; the 404 comes from browser default probing). | Clean logs. | S | `app/` |

### P4: optional experiments (only after P0–P2)

| ID | Current problem | Proposed solution | Impact | Cx | Affected files |
| --- | --- | --- | --- | --- | --- |
| P4-1 | Replay and durability are abstract. | **One** WebGL object: a **3D event-stream column** inside Observe System. Events are stacked discs rising in sequence; the client cursor is a ring that drops out on disconnect and climbs back through the replayed discs on reconnect. It is the only object where depth carries meaning (time and sequence as height, consumers around the column). Lazy-loaded per §12; the SVG event lane is the fallback and the accessible version. | Possible "wow" moment with explanatory value. | L | new `sams/observe/EventColumn3D.tsx` (dynamic import) |
| P4-2 | The Control Room could gain a subtle volumetric feel. | **Do not** use WebGL here. If pursued at all: CSS-only fog gradients and a lighting sweep on room select. | Marginal. | S | `lab.css` |
| P4-3 | The PIT plate could be shown as a bitemporal plane (valid time × knowledge time). | An optional "Bitemporal view" toggle that tilts the 2D plate into an **SVG/CSS 2.5D** plane: x = period, y = knowledge time, with the as-of cursor as a horizontal slicing plane. No WebGL needed. | A strong research visual for technical visitors. | M | `financeiq/PitLab.tsx` |

**Is real 3D justified?** Not for V2's core. Everything in P1–P2 is achievable in DOM, CSS and SVG with better
accessibility, crispness and performance. The single defensible WebGL candidate is P4-1, because depth would
encode sequence and time. Even that should come after P2-1 ships in 2D and proves the interaction.

---

## 14. Scores and answers

| Question | Answer |
| --- | --- |
| **1. Overall visual quality** | **6/10.** Restrained, consistent, well-typeset dark UI with no clipping or overflow bugs. It reads as a polished developer portfolio, not yet a research facility. The template is repeated across every screen; labels are small and over-tracked; SAMS and FinanceIQ share one look. |
| **2. Overall engineering quality** | **8.5/10.** Static export, typed content shared between the lab and case-study modes, a pure and tested PIT engine and simulator, a boundary scanner in the build, reduced-motion support everywhere, lazy overlays, keyboard-operable tabs and dialogs, and text alternatives for every diagram. Deductions: the self-disabling buttons drop focus; the mode leaks into storage; a client-side shell on every route; all FinanceIQ panels mount at once. |
| **3. Strongest screen** | **FinanceIQ: PIT Reconstruction** (`desktop-15b`, `desktop-17`). An as-of cursor, a hatched future, lag bars and per-row verdicts. Original and on-concept. |
| **4. Weakest screen** | **FinanceIQ Experiment Console (empty state)** (`desktop-11`): the default view of the research lab is a SaaS settings form. Close second: **SAMS Live System** on mobile, with unreadable 7px node labels. |
| **5. Strongest interaction** | **Reconstruct History**: the line-by-line accept/reject log with reasons, handing off to "Run experiment". |
| **6. Biggest credibility risk** | **First-person SAMS ownership plus specific test-suite and outcome claims** (CONTENT_VERIFICATION A-4, A-20, A-24), drafted without a source, together with invented history (experiment #038, decision 017, the "failed WebGL experiment" EXP-003) and "SAMS · ONLINE". |
| **7. Biggest visual problem** | **No visual language beyond one panel template.** Every lab screen is header, tabs, panels in identical rounded cards with tiny tracked mono labels. The instruments, the labs and the case studies don't get distinct materials, so the "laboratory" lives in the copy rather than in the interface. |
| **8. Is real 3D justified?** | **No, not for the site or the Control Room.** 2.5D DOM/CSS/SVG covers the facility map, the architecture and the PIT plate. At most one optional, lazily loaded WebGL object, the SAMS event-stream column (P4-1), and only after the 2D replay instrument exists. |
| **9. Top five next changes** | 1. **P0-1 + P0-4 + P0-5**: resolve the content register; remove invented IDs and history; add dates and scope. 2. **P0-2 + P0-3**: honest status vocabulary and one `SIMULATION / SYNTHETIC DATA / SCHEMATIC` figure-label system. 3. **P2-1**: rebuild Observe System as an agent-plus-event-log instrument with visitor-triggered disconnect/replay and worker kill. 4. **P2-2 + P1-7**: PIT as the FinanceIQ default, with values, plain-English framing, a draggable cursor and a consequence readout. 5. **P1-1 + P1-2 + P1-4**: an entry that leads with person, then discipline, then evidence; compact lab headers; an "At a glance" plate on the case studies. (Ship the small fixes P0-6, P0-7, P0-8 and P0-9 alongside; each is under half a day.) |
| **10. Paths** | `docs/V2_VISUAL_AUDIT.md` · `docs/CONTENT_VERIFICATION.md` · `docs/audit/screenshots/v1/` (89 PNGs) · `docs/audit/capture.mjs` |
