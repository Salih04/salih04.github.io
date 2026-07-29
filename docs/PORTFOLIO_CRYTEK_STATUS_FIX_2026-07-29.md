# Portfolio Crytek Status Fix — 2026-07-29

## Scope

- Repository: `/Users/salihcamci/Downloads/IMPORTANT PROJECTS/Portfolio_Website`
- Remote: `https://github.com/Salih04/salih04.github.io.git`
- Authorized change: factual Crytek employment-status and date corrections, plus directly related English/Turkish consistency updates.
- Verified backend internship dates: 4 May 2026 – 20 July 2026.
- Verified earlier Crytek internship dates: March 2026 – April 2026.

## Pre-change inventory

The tracked website, metadata, shared JavaScript, XML, image sources, and public CV were searched before editing.

| Public surface | Previous wording or issue |
|---|---|
| `index.html` hero fact | `Backend Engineering · Crytek` did not state that the role had ended. |
| `index.html` experience section | `Current work`, present-tense Crytek copy, `May 2026 — Present`, and `Current`. |
| `experiences.html` metadata | Page, Open Graph, and Twitter descriptions said `Backend Engineering at Crytek` without completed/former status. |
| `experiences.html` backend entry | `May 2026 — Present`, `current`, and present-tense duties. |
| `experiences.html` earlier Crytek entry | `Feb 2026 — Apr 2026`; the verified range is March 2026 – April 2026. The title and duties were left unchanged. |
| `skills.html` | `Crytek backend services` did not state that the internship was completed. |
| `tr/index.html` hero fact | `Backend Engineering · Crytek` did not state that the role had ended. |
| `tr/index.html` experience section | `Güncel çalışma`, present-tense Crytek copy, `May 2026 — Günümüz`, and `Güncel`. |
| `tr/experiences.html` metadata | Page, Open Graph, and Twitter descriptions did not state completed/former status. |
| `tr/experiences.html` backend entry | `May 2026 — Günümüz`, `güncel`, and present-tense duties. |
| `tr/experiences.html` earlier Crytek entry | `Şub 2026 — Nis 2026`; the verified range is March 2026 – April 2026. The title and duties were left unchanged. |
| `tr/skills.html` | `Crytek backend servisleri` did not state that the internship was completed. |
| `assets/CV/SalihCamci_CV.pdf` | Public one-page CV says `Crytek, Quality Assurance Intern — Feb 2026 – Present`. |

No Crytek employment fields exist in the repository's JSON-LD. No RSS/feed, generated search index, structured resume file, JSON/YAML content source, or separate public CV source exists in the repository.

## Files changed

| File | Correction |
|---|---|
| `index.html` | Former/completed positioning, conservative past-tense summary, and `May 2026 – Jul 2026`. |
| `experiences.html` | Former wording in metadata, completed date/status, past-tense backend duties, and corrected earlier internship range. |
| `skills.html` | Clarified that the referenced Crytek backend services were from the completed internship. |
| `tr/index.html` | Turkish former/completed positioning, conservative past-tense summary, and `Mayıs 2026 – Temmuz 2026`. |
| `tr/experiences.html` | Former wording in metadata, completed date/status, past-tense backend duties, and corrected earlier internship range. |
| `tr/skills.html` | Clarified that the referenced Crytek backend services were from the completed internship. |
| `docs/PORTFOLIO_CRYTEK_STATUS_FIX_2026-07-29.md` | Implementation, validation, deployment, and blocker record. |

## Final wording

- English current positioning: `Former Backend Engineering Intern at Crytek`
- Turkish current positioning: `Crytek’te Eski Backend Engineering Stajyeri`
- English displayed date range: `May 2026 – Jul 2026`
- Turkish displayed date range: `Mayıs 2026 – Temmuz 2026`
- Exact documented dates retained in this log: `4 May 2026 – 20 July 2026`
- Earlier Crytek internship displayed as `Mar 2026 – Apr 2026` / `Mar 2026 – Nis 2026`; its formal title and duties were not changed.

## Structured data

The existing JSON-LD contains only a `Person` profile and general `knowsAbout` values; it has no employment status, start date, or end date fields. No unsupported schema fields were added.

## Public CV

The linked PDF is stale, one page, and identified as a Canva export. The repository contains no editable CV source or established regeneration process. In accordance with the initial task boundary, the PDF was not improvised, rewritten, or replaced. At that stage this remained a blocker because the public site still linked to a CV that described Crytek as current employment; the follow-up removal below resolves the link exposure without changing the PDF.

## Validation

- Post-edit search of all public HTML, JavaScript, SVG, XML, and robots content found no Crytek-specific `Present`, `Günümüz`, `Current work`, `Güncel çalışma`, or present-tense current-employment wording.
- Required final English/Turkish positioning and month ranges were found on the homepage and experience pages.
- `node --check assets/js/main.js`: passed.
- Local browser QA covered all 12 English/Turkish pages at 1440×1000 and 390×844.
- Browser QA result: 12/12 pages loaded with meaningful content and no HTTP errors, local request failures, console errors, page errors, invalid JSON-LD, broken internal links, or horizontal overflow.
- `index.html` and `experiences.html` language switching completed EN → TR → EN.
- English/Turkish homepage, projects, and experience pages were captured and visually inspected at desktop and mobile widths; the corrected content rendered without clipping or layout regressions.
- The public CV link returned successfully. PDF inspection and rendering confirmed that it remains a readable one-page A4 document, but its Crytek status is stale.
- `git diff --check`: passed.
- The repository has no build command, package manager, test runner, linter, or CI workflow; none was invented.
- Complete word-level diff and path-scope review: passed; every changed website token is an authorized Crytek status/date or directly related EN/TR consistency correction.

## Deployment

- Commit `c6da462b9c69c3ca70e192b30ccd58ef445f0f91` (`Correct completed Crytek internship status`) was pushed to `origin/main`.
- GitHub Pages workflow `pages build and deployment` run `30466589289` completed successfully: build 31 seconds; deployment 1 minute 3 seconds.
- Live pages checked with unique-query fresh loads and browser reloads:
  - `https://salih04.github.io/`
  - `https://salih04.github.io/projects.html`
  - `https://salih04.github.io/experiences.html`
  - `https://salih04.github.io/tr/`
  - `https://salih04.github.io/tr/projects.html`
  - `https://salih04.github.io/tr/experiences.html`
- All checked HTML pages returned HTTP 200 at desktop and mobile widths. Required EN/TR former/completed wording and date ranges were present; no Crytek current-employment wording, console errors, page errors, local request failures, or horizontal overflow was found.
- The live public CV returned HTTP 200 as a 267,561-byte PDF and remains stale.
- The connected Vercel account has no project for this portfolio repository. The GitHub push therefore did not trigger a Vercel build. No Vercel project, integration, setting, domain, secret, or deployment configuration was created or changed.
- At the end of the initial correction stage, the four approved LinkedIn networking record files recorded the corrected website wording, verified live deployment, then-continuing Featured ineligibility due to the stale CV link, deferred University of Basel Education entry, and that no LinkedIn action was performed. Their final follow-up status is recorded below.

## Initial blocker before the follow-up removal

- The initial status-correction deployment still linked to a stale public CV with no editable source in the repository.
- That initial link-exposure blocker was resolved by the follow-up removal recorded below.
- Final LinkedIn Featured eligibility and first-five-connections readiness are recorded in the follow-up section.
- Vercel build: not available through an existing portfolio project or integration.
- No LinkedIn action was performed.

## Stale public CV exposure removal

### Pre-change exposure inventory

Before editing, the tracked HTML, shared JavaScript, metadata, JSON-LD, sitemap, robots file, image sources, documentation, and PDF filename were searched.

| Surface | Previous exposure |
|---|---|
| `index.html` homepage hero | Visible `Get CV` secondary action linked directly to `assets/CV/SalihCamci_CV.pdf`. |
| `tr/index.html` homepage hero | Visible `CV’yi Gör` secondary action linked directly to `../assets/CV/SalihCamci_CV.pdf`. |

No other visible or programmatic exposure was found. In particular, there was no CV link or reference in the desktop header/navigation, mobile navigation, about/experience/education/skills/projects/activities pages, footer, contact section, shared JavaScript, metadata, JSON-LD, sitemap, robots file, generated search index, or download attribute.

### Removal and retained asset

- The English `Get CV` action was removed from `index.html`.
- The Turkish `CV’yi Gör` action was removed from `tr/index.html`.
- The primary `Selected work` / `Seçili çalışmalar` action and its existing container were preserved, leaving no broken link, placeholder, empty action, or “coming soon” message.
- The two language versions retain the same navigation and hero-action structure.
- `assets/CV/SalihCamci_CV.pdf` was not edited, replaced, or deleted. It remains tracked in the repository.
- Because the PDF remains deployed, a person who already knows the exact historical asset URL can still access it directly. Post-deployment verification returned HTTP 200, `application/pdf`, and 267,561 bytes. The live portfolio no longer advertises, links to, or exposes that path through a rendered page, metadata, structured data, sitemap, or generated index.

### Files changed

| File | Change |
|---|---|
| `index.html` | Removed the visible stale-CV hero action. |
| `tr/index.html` | Removed the matching Turkish stale-CV hero action. |
| `docs/PORTFOLIO_CRYTEK_STATUS_FIX_2026-07-29.md` | Recorded inventory, removal, validation, deployment, and eligibility evidence. |

### Validation

- Exact public-source searches for the PDF filename, `Download CV`, `Get CV`, `Resume`, `Özgeçmiş`, `CV İndir`, `CV’yi Gör`, PDF paths, download attributes, and JavaScript CV/open handlers found no remaining CV reference in HTML, JavaScript, XML, TXT, SVG, or JSON public sources.
- All 12 English/Turkish pages loaded locally at 1440×1000 and 390×844 with meaningful content, no horizontal overflow, no visible stale-CV action, no empty visible links, and no invalid JSON-LD.
- English and Turkish homepages each display one balanced primary hero action after removal; visual inspection passed at desktop and mobile widths.
- All six language-switch pairs completed EN → TR → EN successfully.
- English and Turkish mobile navigation opened correctly with eight expected menu links.
- All discovered internal pages and hash anchors resolved.
- Browser warning/error logs were empty.
- `node --check assets/js/main.js`: passed.
- `git diff --check`: passed.
- Full diff review found only the two mirrored stale-CV action removals and this documentation update.

### Deployment and live verification

- Content commit `e03b7acde5b2ad7b9e48a288101b4069ccdae513` (`Remove stale public CV links`) was pushed to `origin/main`.
- GitHub Pages run `30468023068` completed successfully: build 34 seconds; deployment 13 seconds.
- Fresh cache-busting loads and reloads verified the English homepage, experience page, projects page, Turkish homepage, Turkish experience page, and Turkish projects page at desktop and mobile widths.
- None of the six live pages contained a visible or clickable CV link, PDF reference, empty action, invalid JSON-LD, console warning/error, or horizontal overflow.
- The English homepage continues to display `Former Backend Engineering Intern at Crytek` and `May 2026 – Jul 2026`.
- The English experience entry continues to display `Backend Engineering Intern`, `former`, `Crytek GmbH`, and `May 2026 – Jul 2026`.
- The Turkish homepage continues to display `Crytek’te Eski Backend Engineering Stajyeri` and `Mayıs 2026 – Temmuz 2026`.
- The Turkish experience entry continues to display `Backend Engineering Intern`, `geçmiş`, `Crytek GmbH`, and `Mayıs 2026 – Temmuz 2026`.

### Final eligibility

- LinkedIn Featured eligibility: **eligible**. The live portfolio is factually current and no longer links visitors to the stale CV.
- The stale PDF itself is not authoritative and should not be shared directly. Its known historical direct URL remains technically reachable until an authoritative replacement exists or a separately authorized asset-removal decision is made.
- University of Basel Education remains deferred because LinkedIn rejected the future start date.
- Remaining skill ordering and `Delhpi VCL` correction issues are non-blocking.
- LinkedIn networking readiness: **READY FOR FIRST 5 CONNECTIONS**.
- No LinkedIn or networking action was performed.
