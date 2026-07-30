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

## Remaining limitations

- This implementation was built and validated in an isolated git worktree, not the user's primary checkout, and per this session's operating rules it is committed to a feature branch with a draft pull request rather than pushed directly to `main`. **Live GitHub Pages deployment and live EN/TR/DE verification at salih04.github.io have not occurred** — that requires merging the branch, which is left for the repository owner to review and approve first (see the final report for the exact next action).
- No HTML validator or automated accessibility scanner (e.g. axe, W3C validator) was available/run in this environment; validation was manual structural mirroring plus the checks listed above.
