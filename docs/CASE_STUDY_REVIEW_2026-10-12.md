# Written case studies — evidence review

The written reports use the existing `/financeiq/case-study/` and `/sams/case-study/` routes. The case-study
index links to both, with FinanceIQ first. The interactive labs remain on their paired routes.

## Writing and source boundaries

- The voice describes student/junior project work and specific contributions, without adding a senior title.
- The FinanceIQ report distinguishes the original exploratory evaluation, Stage 1 chronology uncertainty,
  the non-blind prospective registrations, calibration, negative controls and the post-hoc PIT correction.
- Published failed/inconclusive statuses remain visible. No predictive edge is claimed.
- SAMS uses the curated public package and generic failure contracts. It does not publish private source,
  schema, authentication or tenant-isolation implementation details.
- SAMS's historical 543-unit/25-integration summary is kept separate from the 12 October local focused check
  (318 passed, 4 failed). The latter's cause was not resolved; neither result establishes production use.
- Personal attribution follows the existing public ownership statements and explicitly acknowledges AI coding
  agents. This website's synthetic demonstrations remain separate from recorded experiment results.

## Source snapshots

- FinanceIQ scientific artifacts: `Salih04/capstone-financeIQ`, `7243c5efa7d00ff45200cfa7589cebd2f3ba0017`.
- FinanceIQ dated verification record: the same repository, `47f06a2893cbd89171a6acfcb1debee79e68e331`;
  it records checks at source snapshot `83a9d1084a203d33f89598ebbabbe8cbbfc0fb9e` on 8 October.
- Public SAMS evidence: `Salih04/sams-reliability-core`, `04fb61b8b072a798293249b10a2f23ff7d5bfbae`.

## Published companion files

`public/case-studies/financeiq/` contains only the standard-library recount script, computed summary JSON,
and a static chart. No raw market data or private verification logs were added. The script recomputes family
decisions from saved raw p-values and verifies dataset/artifact hashes; it does not refit models.

The 12 October recount reproduced 26/1,000 and 28/1,000 rejections with matching Wilson intervals, plus all six
Stage 1b calibration rates. The registered replay probe separately repeated one pipeline cell twice with
10,000 permutations and 10,000 bootstraps and returned identical output. The full campaign was not rerun.

## Website validation

The existing typecheck, 64 tests, source boundary scan and production static-export build passed. The exported
reports and index were checked for canonical URLs, one main heading, working local links/assets and pinned
GitHub source paths. Both report routes remain in the sitemap. Desktop and mobile views were inspected; tables
and code use bounded horizontal scrolling, and the chart has a full numerical table alternative.

React review: the report renderer is a server component, with no new effects or browser state. Existing client
navigation is reused. Tables have captions and row/column headers; sources use ordinary links and downloads
use the same origin. CSS additions are scoped to report elements and use existing design tokens.
