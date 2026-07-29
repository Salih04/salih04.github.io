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

The linked PDF is stale, one page, and identified as a Canva export. The repository contains no editable CV source or established regeneration process. In accordance with the task boundary, the PDF was not improvised, rewritten, or replaced. This remains a blocker because the public site continues to link to a CV that describes Crytek as current employment.

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

Pending completion.

## Remaining blockers and Featured eligibility

- Blocker: stale linked public CV with no editable source in the repository.
- LinkedIn Featured eligibility: pending rendered-site and live-deployment checks; the stale public CV is expected to keep the portfolio ineligible until corrected through its authoritative source.
- No LinkedIn action was performed.
