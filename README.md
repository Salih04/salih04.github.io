# S//LAB — Salih Research Lab

An interactive research portfolio built as a working lab rather than a personal website. Each project is an
experiment, each architecture is an instrument, and each engineering decision is a research record.

The same content can be read two ways:

- **Lab mode** lets you explore: a control room drawn as a 2.5D floor plan, a SAMS failure demo (a deterministic
  simulation of event replay and worker recovery), a point-in-time reconstruction instrument and an experiment bench.
- **Case Study Mode** turns the same content into editorial case studies that open with an "At a glance" plate
  (role, project, status, problem, approach, stack, evidence). Nothing is only available through an animation.

## Routes

| Route | What it is |
| --- | --- |
| `/` | Entry: a nameplate, then one shared time axis on which SAMS and FinanceIQ are the two traces |
| `/lab` | Control Room: 2.5D architectural floor plan (facility directory below desktop) |
| `/sams` | SAMS Agent Systems Lab: **Failure demo** (default), Architecture, Engineering decisions |
| `/sams/case-study` | SAMS case study |
| `/financeiq` | FinanceIQ: **Point-in-time reconstruction** (default), Experiment bench, Validation, Data pipeline, Results |
| `/financeiq/case-study` | FinanceIQ case study |
| `/case-studies` | Case study index |
| `/archive` | Engineering Archive (Crytek records: backend internship, QA internship) |
| `/vault` | Experiment Vault |
| `/notes`, `/notes/[slug]` | Lab Notes |
| `/about`, `/resume`, `/contact` | About, printable resume, contact |

Lab tabs have deep links too: `/sams/#decisions`, `/financeiq/#bench`, and so on.

**Case Study Mode is a property of the route.** The paired project routes (`/sams/case-study/`,
`/financeiq/case-study/`) open in case mode and keep it when you move between them; every other route opens in
lab mode. A toggle on an unpaired page applies to that page only. Nothing is restored from storage.

**Terminal:** press `~` (or click the terminal icon). Try `help`, `whoami`, `open sams`, `case financeiq`,
`mode case`, `status`. It is an alternative way to get around and is never required.

## Stack and design choices

- **Next.js 16 (App Router) with static export.** Every route, including each note, is prerendered to HTML in
  `out/`, so deep links work on any static host and the first screen is useful before any JavaScript runs.
- **No WebGL and no 3D library.** The control room is an SVG floor plan on a CSS-perspective plane, with
  upright DOM labels placed by a projection that mirrors the CSS transform. The entry trace is plain DOM.
- **Two materials.** SAMS is a running machine (system / events / client state, cursors, a cable that breaks on
  disconnect, cold signal cyan). FinanceIQ is a research notebook (a question-led ruled plate, measurement ticks,
  serif findings, † annotations, violet accents).
- **Hand-written CSS** with design tokens in `src/styles/base.css`, one stylesheet per world (`entry.css`,
  `facility.css`, `sams.css`, `fiq.css`) plus shared `shell.css`, `lab.css` and `editorial.css`. Nothing renders
  below 12px; small uppercase mono is reserved for instrument metadata.
- **Fonts are self-hosted** through `@fontsource-variable` (Inter, JetBrains Mono, Space Grotesk, Source Serif 4),
  with no third-party font requests.
- **Code that loads only when used:** the terminal is loaded on demand.
- **Motion carries meaning:** events append to the log, cursors move, the as-of cursor scrubs through time.
  `prefers-reduced-motion` turns animation off; the SAMS demo waits for the visitor, and reconstructions jump
  straight to their final state.
- **Sound is off by default.** When turned on, the tones are synthesized at runtime; no audio files are shipped.
- **Accessibility:** semantic landmarks, a skip link, keyboard-operable tabs (arrow keys), focus-trapped dialogs
  that close on Esc, visible focus states, and a text or table alternative for every diagram.
- **Pocket interface (below 1024px):** the rail becomes a menu, the facility map becomes a facility directory
  (no pseudo-3D), and the diagrams stay interactive.

## Honesty rules built into the interface

Every figure carries one plate label in its top-left corner (`<FigureLabel />`), and the footer defines them:

| Label | Meaning |
| --- | --- |
| `SIMULATION` | A deterministic demonstration of system behaviour. Nothing real is connected. |
| `SYNTHETIC DATA` | Invented entities or numerical values. Not research results. |
| `SCHEMATIC` | A conceptual representation of a real architecture or method. Not to scale, not exhaustive. |

- The SAMS failure demo is driven by a pure, unit-tested engine (`src/lib/replay.ts`). Its test results are never
  presented as live metrics; the only SAMS numbers on the site are historical verification results from the
  public [evidence package](https://github.com/Salih04/sams-reliability-core), labelled as historical.
- The FinanceIQ bench runs a **deterministic simulator** (`src/lib/experiment.ts`) on synthetic data. The PIT
  reconstruction uses a tiny **fictional** dataset (companies A–C), resolved by a tested as-of engine
  (`src/lib/pit.ts`). The only real FinanceIQ results quoted are cited to the public
  [supporting research repository](https://github.com/Salih04/capstone-financeIQ).
- Status labels describe the lab, not production: "Simulation ready", "In progress", "Open".
- Records use letters (Engineering decision A, Research decision B); notes are drafts with no number or date.

## Public information boundary

This is a product requirement, not an afterthought. See [docs/PUBLIC_BOUNDARY.md](docs/PUBLIC_BOUNDARY.md).
`scripts/public-boundary.mjs` scans `src/` before the build and the exported HTML after it. The build fails on
credentials, connection strings, non-allowlisted URLs, IP addresses, internal hostnames, private paths, UUIDs or
unpublished email addresses.

## Content

All content is in `src/content/` as typed data. Lab mode and Case Study Mode render the same records.

| File | Content |
| --- | --- |
| `site.ts` | Identity, navigation, contact channels |
| `sams.ts` | Schematic topology, failure-demo script, architecture, decision records, case study, evidence links |
| `financeiq.ts` | PIT dataset (fictional), pipeline, bench options, negative results, decisions, case study |
| `archive.ts` | Engineering records |
| `vault.ts` | Experiment Vault specimens |
| `notes.ts` | Lab Notes, all drafts (structured blocks, no Markdown parser shipped) |
| `about.ts` | About page and resume |

> **Review before publishing.** V2 Pass 1 grounded the content in Salih's approved facts and his public
> repositories, and removed invented identifiers, dates and incidents. Remaining open items are listed in
> `docs/V2_PASS1_REPORT.md`. The Lab Notes are drafts and stay marked as drafts until reviewed. Set
> `site.contact.email` when you have a public address; until then the contact page shows GitHub only.

## Development

```bash
npm install
npm run dev          # local development
npm run check        # typecheck + unit tests + boundary scan
npm run build        # boundary scan → static export to out/ → boundary scan of the export
npm start            # serve out/ locally
```

Visual verification: `docs/audit/capture-v2.mjs` captures the V2 comparison set into
`docs/audit/screenshots/v2-pass1/` and records checks (overflow, small type, focus, tab overflow, route modes,
reconnect convergence) as JSON.

Node 20.9 or newer.
