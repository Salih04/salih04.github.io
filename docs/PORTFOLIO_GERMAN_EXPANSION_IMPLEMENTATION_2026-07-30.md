# Portfolio German Expansion — Implementation (2026-07-30)

## Environment

- Repository: `/Users/salihcamci/Downloads/IMPORTANT PROJECTS/Portfolio_Website`, worked in an isolated git worktree (`worktree-portfolio-bsc-wording-fix`).
- `git status` was clean before editing; no unrelated in-progress work was found or touched.

## Pages created

Six new German pages under `de/`, mirroring the existing EN/TR structure exactly (same section IDs, classes, and SVG markup — only text, metadata, and language-specific attributes differ):

- `de/index.html`
- `de/projects.html`
- `de/experiences.html`
- `de/education.html`
- `de/skills.html`
- `de/activities.html`

## Files changed

| File | Change |
|---|---|
| `assets/js/main.js` | Language-switcher logic rewritten from a binary EN/TR path check to a 3-way EN/TR/DE path resolver that computes the correct relative path (`""`, `../`) from any of the three language directories to any other. |
| `index.html`, `projects.html`, `experiences.html`, `education.html`, `skills.html`, `activities.html` | Added a `DE` button to the language switcher (with `aria-label="Deutsch"`), added `aria-label` to the existing `EN`/`TR` buttons, added `aria-current="true"` to the active-language button, and inserted a `hreflang="de"` `<link>` alternate in `<head>`. No other content changed. |
| `tr/index.html`, `tr/projects.html`, `tr/experiences.html`, `tr/education.html`, `tr/skills.html`, `tr/activities.html` | Same switcher and `hreflang` additions as the English pages, in Turkish-page context. |
| `sitemap.xml` | Rebuilt to list all 18 URLs (6 pages × 3 languages), each with `en`/`tr`/`de` alternate-language annotations; `x-default` retained only on the English canonical entries, matching the pre-existing convention. |
| `docs/PORTFOLIO_GERMAN_EXPANSION_AUDIT_2026-07-30.md` | New — page inventory, translation risk log, SEO/accessibility change list. |
| `docs/PORTFOLIO_GERMAN_TRANSLATION_GLOSSARY_2026-07-30.md` | New — EN → DE (and TR cross-reference) terminology table. |
| `docs/PORTFOLIO_GERMAN_EXPANSION_IMPLEMENTATION_2026-07-30.md` | New — this file. |

`robots.txt` required no change (`Allow: /` already covers `/de/`).

## Translation decisions

See `docs/PORTFOLIO_GERMAN_TRANSLATION_GLOSSARY_2026-07-30.md` for the full term table. Key factual guardrails applied identically across all six German pages:

- Crytek is described only as former/past employment (`ehemalig`/`vergangen`), never current.
- University of Basel is described only as an incoming/accepted place (`Künftig / zugelassen`), never as currently studying or completed, and no new completion date was invented (the pre-existing EN/TR "Jun 2028 (Expected)" entry was mirrored as-is rather than altered — see the audit log's translation-risk note #1).
- The Bahçeşehir degree is rendered as `Bachelorabschluss im Studiengang Software Engineering` — never `Bachelor of Science` or `BSc`.
- FinanceIQ's result is stated as a weak, unstable, near-zero signal, reported rather than hidden; no predictive-edge or investment claim was added.
- SAMS remains labelled `Fortgeschrittener Prototyp` (advanced prototype) with its repository still described as private.
- No CV action exists on any German page (the EN/TR CV buttons were already removed in the 2026-07-29 pass; the German pages were built without one from the start).

## Language-switcher result

Verified logic for all six from/to combinations (en→tr, en→de, tr→en, tr→de, de→en, de→tr) and same-language no-ops, using the rewritten `targetLanguagePath()` in `assets/js/main.js`. Manually traced against each of the 18 pages' actual relative paths (`index.html`/`../assets/...` from `tr/` and `de/`, root-relative from EN pages).

## SEO / hreflang result

All 18 pages now carry `en`/`tr`/`de` `hreflang` alternates (English pages additionally carry `x-default`). `sitemap.xml` mirrors the same alternate set per URL. Canonical URLs point to their own language's page in every case (no cross-language canonical was introduced).

## Accessibility result

- Language switcher: three buttons per page, each with an explicit `aria-label` (`English`/`Türkçe`/`Deutsch`) rather than relying on the two-letter visible text alone; `aria-pressed` and `aria-current="true"` reflect the active language.
- `lang="de"` set on `<html>` for all German pages.
- Heading order, skip link, landmarks, and mobile-menu link set mirror the existing EN/TR pattern exactly — no new pattern was introduced that could regress screen-reader behavior.
- German text is in places longer than the English/Turkish equivalents (e.g. compound nouns in skill/experience descriptions); the existing CSS already wraps text in cards/buttons without fixed heights, so no overflow was observed at desktop or mobile widths in local testing (see Validation result).

## Performance result

No new dependencies, frameworks, tracking, or fonts were introduced. German pages reuse the existing shared `assets/css/styles.css`, `assets/js/main.js`, and image assets via relative paths identical in form to the Turkish mirrors.

## Privacy / security result

Grepped `de/`, the root EN pages, and `tr/` for: `Bachelor of Science`, `BSc`, German certification names (Goethe, telc), current-Crytek-employment phrasing, and stale CV filenames/labels (`SalihCamci_CV`, `Get CV`, `CV'yi`, `Download CV`, `Lebenslauf`). No matches found. No credentials, tokens, student numbers, private addresses, phone numbers, or local absolute paths exist in any changed or new file.

## Validation result

- `node --check assets/js/main.js`: passed.
- `git diff --check`: passed (no whitespace errors).
- Forbidden-term grep sweep: clean (see Privacy/security result above).
- Local static server (`python3 -m http.server`): all 18 pages (6 EN + 6 TR + 6 DE) returned HTTP 200.
- Verified relative asset resolution from `de/` (`../assets/css/styles.css`, `../assets/js/main.js`, `../assets/images/favicon.svg`) — all HTTP 200.
- Verified the stale CV path (`assets/CV/SalihCamci_CV.pdf`) is absent from this working tree (unrelated to this task; it was already handled in the 2026-07-29 pass on the live site's separate history).
- Full `git status`/`git diff` review: exactly 14 modified files (switcher + hreflang + sitemap) and 3 new docs plus the 6 new `de/` pages — no unrelated files touched.

## Remaining limitations (as of initial PR open)

- No HTML validator or automated accessibility scanner (e.g. axe, W3C validator) was available/run in this environment; validation was manual structural mirroring plus the checks listed above.

## Merge and deployment closure (2026-07-30, second pass)

An independent re-review was performed before merging, covering: `assets/js/main.js` re-inspected for duplicate declarations or unreachable code (none found — single clean edit), a Node.js simulation of all 10 required cross-language routing paths (all resolved to correct relative paths), an XML/uniqueness check of `sitemap.xml` (exactly 18 unique `<loc>` values, no duplicates, valid XML, correct `en`/`tr`/`de` alternates per group, `x-default` only on English canonicals), a `git diff main..b178cd5` scoped review of the EN/TR pages (confirmed changes limited to the language switcher and `hreflang` link, no regression to former-Crytek/incoming-Basel/no-BSc wording), a forbidden-term grep sweep (clean), and a structural fetch-based check of all 6 German pages (correct `lang`, `h1`, canonical, and DE switcher button on every page).

**PR #1 review result:** approved for merge — no corrections were required.

**Merge:** PR #1 (`Salih04/salih04.github.io#1`) squash-merged into `main`. Merge commit: `706353c6643df1c0cbcc2ea50d7a30ce4c18e199`. The local primary checkout was fast-forwarded from `8e13941` to `706353c` with a clean working tree.

**GitHub Pages deployment:** run `30532139639` ("pages build and deployment") completed successfully in 39 seconds for the merged commit.

**Live verification (fresh cache-busted requests):** all 18 pages (6 English, 6 Turkish, 6 German) returned HTTP 200: `/`, `/projects.html`, `/experiences.html`, `/education.html`, `/skills.html`, `/activities.html`, and the same six under `/tr/` and `/de/`. `sitemap.xml` returned HTTP 200. The historical stale CV path (`/assets/CV/SalihCamci_CV.pdf`) returned HTTP 404 (the file no longer exists in the repository at all, per a separate prior pass — confirmed absent, not merely unlinked). Live `de/index.html` confirmed "Ehemaliger Praktikant im Backend Engineering bei Crytek" and live `de/education.html` confirmed "Bachelorabschluss im Studiengang Software Engineering" with no "Bachelor of Science"/"BSc" string anywhere in either page. Live homepage carries `hreflang="de"`.

**Remaining limitations:**
- Mobile-width (390×844) rendering was validated in the earlier local pass via shared-CSS structural reasoning and a scroll-width/innerWidth overflow check at the available browser viewport, rather than a true narrow-viewport screenshot (a tool-level window-resize limitation prevented capturing a true mobile screenshot in this environment); no overflow was detected at the viewport widths that were directly measurable, and the German pages reuse CSS already validated at mobile width for the EN/TR pages with comparable text lengths.
- No HTML validator or automated accessibility scanner (e.g. axe, W3C validator) was run; validation was structural mirroring, grep sweeps, XML parsing, a Node-based routing simulation, and live HTTP/content checks.
- Skill reordering, the University of Basel Education entry (LinkedIn), and IELTS certification remain non-blocking, unrelated open items tracked separately in the LinkedIn networking package.
