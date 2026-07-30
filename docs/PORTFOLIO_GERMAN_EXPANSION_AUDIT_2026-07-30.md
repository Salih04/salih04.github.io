# Portfolio German Expansion — Audit (2026-07-30)

## Scope

Extend the existing EN/TR bilingual, zero-build portfolio to EN/TR/DE. No CLAUDE.md, AGENTS.md, PRD.md, TASK.md, or TASK_STATE.md exist in this repository; the only prior report is `docs/PORTFOLIO_CRYTEK_STATUS_FIX_2026-07-29.md`, which was reviewed before editing. `git status` was clean before any change.

## Current page matrix (pre-expansion)

The site has exactly 12 pages: 6 English pages at the repository root and 6 Turkish mirrors under `tr/`. There is one shared stylesheet (`assets/css/styles.css`), one shared script (`assets/js/main.js`), and static metadata/sitemap/robots/favicon/social-preview assets. No build system, package manager, or CMS exists.

| English (root) | Turkish (`tr/`) | Proposed German (`de/`) |
|---|---|---|
| `index.html` | `tr/index.html` | `de/index.html` |
| `projects.html` | `tr/projects.html` | `de/projects.html` |
| `experiences.html` | `tr/experiences.html` | `de/experiences.html` |
| `education.html` | `tr/education.html` | `de/education.html` |
| `skills.html` | `tr/skills.html` | `de/skills.html` |
| `activities.html` | `tr/activities.html` | `de/activities.html` |

## Shared components requiring modification

- `assets/js/main.js` — the language switcher only recognized `en`/`tr` via a path check for the `tr` segment. Rewritten to detect `en`/`tr`/`de` and compute the correct relative path from any of the three directories to any of the other two (see Implementation log for the exact diff).
- Header language switcher markup (`role="group"` block) — present identically across all 12 EN/TR pages; extended with a third `DE` button carrying an explicit `aria-label="Deutsch"` on every page (EN/TR/DE), plus `aria-label="English"` / `aria-label="Türkçe"` on the other two buttons so the switcher does not rely on the two-letter codes alone.
- `<head>` `hreflang` alternates — every EN/TR page had `en`, `tr`, and `x-default` alternates; a `hreflang="de"` alternate was inserted (via an exact-match script keyed off the existing `hreflang="tr"` line, so the target page slug is preserved automatically) into all 12 existing pages.
- `sitemap.xml` — rebuilt with all three language variants of all six pages, each carrying `en`/`tr`/`de` alternate-language annotations (`x-default` only on the English canonical entries, consistent with the pre-existing convention).

## Translation risks identified and how they were handled

1. **MSc completion date already on the live site.** `education.html` / `tr/education.html` already display `Sep 2026 — Jun 2028 (Expected)` / `Eyl 2026 — Haz 2028 (Beklenen)` for the University of Basel entry. The new instruction set says not to *add* an expected completion date. Since this is pre-existing published content (not a new claim) and the task also requires EN/TR/DE factual and structural consistency, the German page mirrors it as `Sep 2026 — Jun 2028 (voraussichtlich)` rather than silently diverging from the other two languages. Flagged here rather than resolved unilaterally.
2. **Bachelor degree wording.** Kept as `Bachelorabschluss im Studiengang Software Engineering` — never `Bachelor of Science` / `BSc`, matching the EN "Bachelor's Degree" / TR "Yazılım Mühendisliği Lisans Programı" framing.
3. **Crytek employment status.** Rendered only as `ehemalig` / `Ehemaliger Praktikant im Backend Engineering bei Crytek`, mirroring the already-corrected EN "former" / TR "eski" wording from the 2026-07-29 fix.
4. **FinanceIQ predictive claim.** German result copy states the signal stayed weak, unstable, and near zero, and that the negative result is reported rather than hidden — no claim of a working trading edge.
5. **SAMS / project maturity labels.** Translated as status labels only (`Fortgeschrittener Prototyp`, `Angewandtes ML-System`, `Lernprojekt`), never upgraded in maturity relative to EN/TR.
6. **Technical terminology.** Left in English where EN/TR already do (`Data Science`, `Backend Engineering`, `Data Engineering`, FastAPI/PostgreSQL/Redis/etc., project names, company/university names), per the glossary.
7. **No CV action.** The German pages never had a CV button to begin with (built from scratch after the EN/TR CV-removal fix), so there is nothing to remove; verified by grep.

## SEO changes

- Added `hreflang="de"` to all 12 pre-existing pages; added canonical, Open Graph, and Twitter metadata (title/description in German, URL pointing at the `/de/` path) to all 6 new pages.
- `sitemap.xml` now lists 18 URLs (previously 12), each with full alternate-language annotations.
- `robots.txt` required no change — `Allow: /` already covers `/de/`.

## Accessibility changes

- Language switcher: explicit `aria-label` per language button (`English`/`Türkçe`/`Deutsch`), `aria-pressed` reflecting the active language, and `aria-current="true"` on the active language's own button, on all 18 pages.
- `lang="de"` set on `<html>` for all German pages; `lang="de"` was not needed elsewhere since no mixed-language inline text was introduced.
- Skip link, landmark structure, heading order, and mobile-menu link set were mirrored 1:1 from the EN/TR pattern (no new pattern introduced).

## Validation plan

1. `node --check assets/js/main.js`.
2. Grep sweep for forbidden terms (`Bachelor of Science`, `BSc`, German certification names, current-Crytek-employment phrasing, stale CV filenames/labels) across `de/`, root, and `tr/`.
3. `git diff --check` for whitespace errors.
4. Local static server (`python3 -m http.server`) — HTTP 200 for all 18 pages; verified relative asset paths (`../assets/...`) resolve correctly from `de/`.
5. Manual review of every new/changed file's diff before commit.

## Closure (2026-07-30, merge pass)

All items above passed on independent re-review before merge. PR #1 was squash-merged into `main` at commit `706353c6643df1c0cbcc2ea50d7a30ce4c18e199`; GitHub Pages redeployed successfully (run `30532139639`); all 18 live pages return HTTP 200 and the stale CV path returns HTTP 404. See `docs/PORTFOLIO_GERMAN_EXPANSION_IMPLEMENTATION_2026-07-30.md` for the full closure record.
