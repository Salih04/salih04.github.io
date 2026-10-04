# S//LAB — Salih Research Lab

An interactive research portfolio built as a working lab rather than a personal website. Each project is an
experiment, each architecture is an instrument, and each engineering decision is a research record.

The same content can be read two ways:

- **Lab mode** lets you explore: a control room, a live (scripted) agent system, an experiment console and a
  point-in-time reconstruction instrument.
- **Case Study Mode** (the toggle in the top bar) turns the same content into clean editorial case studies, with
  no page reload. Nothing is only available through an animation.

## Routes

| Route | What it is |
| --- | --- |
| `/` | Entry screen: identity, status, Enter Lab |
| `/lab` | Control Room: facility map and research index |
| `/sams` | SAMS Agent Systems Lab: Live system, Architecture, Engineering decisions, **Observe System** |
| `/sams/case-study` | SAMS case study |
| `/financeiq` | FinanceIQ: Experiment console, Data pipeline, PIT reconstruction (**Reconstruct History**), Validation, Results |
| `/financeiq/case-study` | FinanceIQ case study |
| `/case-studies` | Case study index |
| `/archive` | Engineering Archive (Crytek record) |
| `/vault` | Experiment Vault |
| `/notes`, `/notes/[slug]` | Lab Notes |
| `/about`, `/resume`, `/contact` | About, printable resume, contact |

Lab tabs have deep links too: `/sams/#architecture`, `/financeiq/#pit`, and so on.

**Terminal:** press `~` (or click the terminal icon). Try `help`, `whoami`, `open sams`, `case financeiq`,
`mode case`, `status`. It is an alternative way to get around and is never required.

## Stack and design choices

- **Next.js 16 (App Router) with static export.** Every route, including each note, is prerendered to HTML in
  `out/`, so deep links work on any static host and the first screen is useful before any JavaScript runs.
- **No WebGL and no 3D library.** The control room is a CSS-perspective plan with pointer parallax. The entry
  background is a small Canvas 2D topology that pauses when hidden. Everything works without WebGL. A WebGL
  control room was tried and dropped (see `EXP-003` in the vault).
- **Hand-written CSS** with design tokens in `src/styles/base.css`: a graphite background, one cold teal
  signal colour, blue-violet for FinanceIQ research, and amber, muted red and muted green reserved for state.
- **Fonts are self-hosted** through `@fontsource-variable` (Inter, JetBrains Mono, Space Grotesk), with no
  third-party font requests.
- **Code that loads only when used:** the terminal and the Observe System overlay are loaded on demand.
- **Motion carries meaning:** packets travel between agents, nodes pulse when they process, and pipeline steps
  light up in order. `prefers-reduced-motion` turns animation off, and the signature interactions skip
  straight to their final state.
- **Sound is off by default.** When turned on, the tones are synthesized at runtime; no audio files are shipped.
- **Accessibility:** semantic landmarks, a skip link, keyboard-operable tabs (arrow keys), focus-trapped dialogs
  that close on Esc, visible focus states, and a text or table alternative for every diagram.
- **Pocket interface (below 1024px):** the rail becomes a menu, the facility map becomes an index, and the
  diagrams stay interactive.

## Honesty rules built into the interface

- Live views are labelled as **scripted demonstrations**. They are never presented as production telemetry.
- The FinanceIQ console runs a **deterministic simulator** (`src/lib/experiment.ts`). The data is synthetic and
  labelled that way. It shows how leakage inflates results; it does not report research results.
- The PIT reconstruction uses a tiny **fictional** dataset (companies A–C), resolved by a real as-of engine
  (`src/lib/pit.ts`) that is covered by unit tests.

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
| `sams.ts` | Agents, live script, architecture components, decision records, case study |
| `financeiq.ts` | PIT dataset (fictional), pipeline, console options, failed experiments, decisions, case study |
| `archive.ts` | Engineering records |
| `vault.ts` | Experiment Vault samples |
| `notes.ts` | Lab Notes (structured blocks, no Markdown parser shipped) |
| `about.ts` | About page and resume |

> **Review before publishing.** The project narratives, decision records, failed experiments, notes and resume
> were drafted from the portfolio brief. Check every claim for accuracy against your own work, and add dates,
> institutions and real experiment details. No metrics have been invented. Set `site.contact.email` when you have
> a public address; until then the contact page shows GitHub only.

## Development

```bash
npm install
npm run dev          # local development
npm run check        # typecheck + unit tests + boundary scan
npm run build        # boundary scan → static export to out/ → boundary scan of the export
npm start            # serve out/ locally
```

Node 20.9 or newer.
