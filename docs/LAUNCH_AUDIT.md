# S//LAB launch audit

Launch-readiness pass on `local/slab-v2-final-polish-a4014f`, starting from `0d7a7ef` with a clean tree. No redesign.
The flagship interactions are unchanged; the only component edits fix accessibility findings (§10). Nothing was
deployed or merged.

Evidence:
- `docs/audit/launch-checks.json`: browser matrix, link audit and accessibility checks, written by
  `docs/audit/capture-launch.mjs`.
- `docs/audit/screenshots/launch/`: screenshots, one per scenario at 1440×900 and 390×844, plus a subset at the
  other sizes and under reduced motion. `resume-print-a4.png` is the resume's A4 print output.

## Summary

| Area | Result |
| --- | --- |
| Public release audit | No secrets, credentials, private endpoints, private paths, ticket IDs, internal names or unapproved contact details, in either the repository or `out/`. Every quoted number matches its public source. |
| Metadata | One registry (`src/content/pages.ts`) gives every route a title and description. Pattern: `<Page> — S//LAB`. |
| Social preview | Static 1200×630 `public/og.png` with alt text. Open Graph and Twitter tags are emitted once `SITE_URL` is set. |
| Icons | Favicon (16/32/48 ICO), SVG icon and 180px Apple touch icon, all from one S//LAB mark. |
| robots / sitemap | Both generated statically. The sitemap lists the 12 indexable routes; draft Lab Notes carry `noindex`. |
| Canonical | Configured from one value, `SITE_URL`. No domain is hard-coded. |
| Contact | GitHub only, until a public email is chosen. The page now says so instead of promising a reply channel. |
| Resume | Facts match the approved list. It prints on one A4 page with no app chrome. |
| Links | All internal links and hash targets resolve. All 8 external links are https and return 200. |
| Accessibility | Three real issues fixed (heading skip, dangling `aria-controls`, the Case Study switch named only "Case" on phones). All checks pass. |
| Performance | Route JS unchanged (179–197 KB gzip). CSS +0.2 KB. Output +157 KB, almost all `og.png`. |
| Static export / Vercel | Compatible. Headers are in `vercel.json`. Production build fails if `SITE_URL` is missing. |
| Validation | Typecheck, 64/64 unit tests, boundary scans of `src/` and `out/`, static build, 31/31 launch browser checks and 37/37 flagship regression checks: all pass. |

## 1. Public release audit

### Method

**Scanner.** `scripts/public-boundary.mjs` was run on `src/` and on `out/` after every build. It covers keys,
tokens, secret assignments, connection strings, non-allowlisted URLs, localhost, IPs, internal hosts, private paths,
UUIDs and unlisted emails.

**Manual sweeps** (`git grep` and `grep` over tracked files and `out/`):
- credential shapes;
- ticket-ID shapes (`ABC-123`);
- localhost and private IPs;
- email addresses;
- `/Users/` paths;
- TODO / FIXME / TBD / lorem;
- "live", "online", "production";
- "private", "internal", "proprietary", "confidential";
- every mention of Crytek and Hunt: Showdown.

**Source checks.**
- Every number quoted from SAMS and FinanceIQ was compared with the public files it cites:
  - 543 unit / 25 integration tests: `results/CI_2026-10-04.md`.
  - IC +0.150 (p = 0.017) and IC +0.031 (p = 0.63): `RESULTS.md`.
- Every external link was requested.

### Findings

| # | Finding | Resolution |
| --- | --- | --- |
| 1 | No secrets, keys, tokens, connection strings, private endpoints, IPs or private paths in `src/` or `out/`. The only credential-shaped grep hit is the word "tokens" in an old design audit (type tokens). | None needed. |
| 2 | No ticket IDs, internal service names, database details or proprietary Crytek details. Crytek appears only in the archive, the resume and the archive's meta description, with the approved wording. | None needed. |
| 3 | SAMS is described as a private codebase with historical, public evidence. "Production" appears only in negations ("not deployed to production", "not production measurements"). "Live" is the replay-to-live handoff or the game backend's context, never a claim that SAMS is live. | None needed. |
| 4 | `localhost` appears in `out/` only inside a framework URL-parser chunk (`/_next/static/chunks`), not in any page, link or metadata. | None needed. Third-party bundle code; the scanner skips `_next` by design. |
| 5 | No TODO, FIXME, lorem or placeholder copy visible to visitors. | None needed. |
| 6 | No broken hrefs or dead navigation (§9). | None needed. |
| 7 | Draft material: all three Lab Notes are visibly marked draft on the page, in the rail and in the title, but were indexable. | **Fixed.** Draft notes and the drafts-only notes index now carry `noindex, follow` and are left out of the sitemap (§5). |
| 8 | Contact page: the lead promised "I read everything and reply" while GitHub, which has no direct messages, was the only channel. | **Fixed.** Without an email, the lead now says GitHub is the public channel for now and a direct email is not published yet. With an email set, the original lead returns. |
| 9 | Identity drift: the site was "Salih Research Lab"; the agreed identity is "S//LAB — Salih’s Interactive Research Portfolio". Two GitHub URL casings (`salih04`, `Salih04`). | **Fixed.** `site.labName` updated (rail, menu, footer, titles). GitHub URL normalised to `https://github.com/Salih04`. |
| 10 | No invented claims or metrics found. All quoted numbers match their public sources. | None needed. |

The scanner was **not weakened**. Two hosts can now appear in URLs:
- **`www.sitemaps.org`.** It is the sitemap's XML namespace, the same kind of entry as the existing `w3.org`.
- **The host of `SITE_URL`, when it is set at build time.** It is the site's own origin, which canonical links and
  the sitemap must name. Without `SITE_URL`, the allowlist is unchanged.

Tests cover both directions: the configured origin is allowed, and a subdomain of it, or the origin when it is not
configured, is still rejected.

## 2. Site identity and metadata

**Identity.**
- **Default title:** **S//LAB — Salih’s Interactive Research Portfolio**.
- **Person:** Salih Camcı (in descriptions, author metadata, resume and contact). The hero stays "Salih".
- **Positioning:** Software Engineer · MSc Data Science student, University of Basel. The MSc is always "student" or
  "in progress"; a test rejects completed-degree wording in descriptions.

**How it is built.**
- `src/content/pages.ts` holds title, description and an index flag for every static route.
- `src/lib/metadata.ts` turns an entry into the complete metadata set: title, description, canonical, robots, Open
  Graph and Twitter.
- Next.js replaces nested metadata objects rather than merging them, so each page gets the full set.
- A test checks that every static route in `src/app` has an entry, that titles are unique and at most 60
  characters, and that descriptions are 50–180 characters.

| Route | Title |
| --- | --- |
| `/` | S//LAB — Salih’s Interactive Research Portfolio |
| `/lab/` | Control Room — S//LAB |
| `/sams/` | SAMS — S//LAB |
| `/sams/case-study/` | SAMS Case Study — S//LAB |
| `/financeiq/` | FinanceIQ — S//LAB |
| `/financeiq/case-study/` | FinanceIQ Case Study — S//LAB |
| `/case-studies/` | Case Studies — S//LAB |
| `/archive/` | Engineering Archive — S//LAB |
| `/vault/` | Experiment Vault — S//LAB |
| `/notes/` | Lab Notes — S//LAB *(noindex while all notes are drafts)* |
| `/notes/<slug>/` | `<Note title> (draft) — S//LAB` *(noindex while draft)* |
| `/about/` | About — S//LAB |
| `/resume/` | Salih Camcı · Resume *(name first: it is also the default file name of a saved PDF; "S//LAB" would become "S__LAB")* |
| `/contact/` | Contact — S//LAB |
| 404 | Not found — S//LAB *(noindex, added by Next.js)* |

Descriptions are factual. They say "scripted", "synthetic" and "in progress" where the page does.

## 3. Open Graph and social preview

- **Image.** `public/og.png` is a static 1200×630 PNG (102 KB). It is rendered from `scripts/brand/og-image.html`
  with the site's own fonts and tokens.
  - **Shows:** dark graphite, corner brackets, the S//LAB mark, SALIH, Software Engineer · MSc Data Science
    student, University of Basel, and a restrained version of the entry's shared time axis (cyan event ticks above,
    the violet period-end → publication → known trace below, the hatched "not yet known" region).
  - **Does not show:** neon, glow, figures or claims.
- **Alt text:** "S//LAB — Salih, Software Engineer. Two instrument traces on one time axis, on a dark graphite panel."
- **Tags** (with `SITE_URL` set):
  - `og:image` with type, width, height and alt;
  - `og:url`, `og:site_name`, `og:locale`, `og:type`;
  - `twitter:card=summary_large_image` and `twitter:image` with alt.
  - Verified in a build with the reserved test origin `https://portfolio.example`; that build was not committed.
- **Without `SITE_URL`.** No image or URL tags, and the Twitter card falls back to `summary`. Social crawlers need
  absolute image URLs, and a guessed origin would be wrong.
- **Why not a generated `opengraph-image`.** Next.js's generated OG images use Satori, which cannot read the site's
  WOFF2 variable fonts and would resolve URLs against `localhost` without a base. A static asset is simpler and
  exact. No dependency was added; Playwright is used only by the render script, as by the audit scripts.

## 4. Favicon and icons

**Before:** an SVG icon only (two cyan slashes and a violet dot).

**Now:**

| File | Size | Notes |
| --- | --- | --- |
| `src/app/icon.svg` | — | The S//LAB "//" as two heavy slashes, cyan and violet (the two traces), on a graphite rounded square. Checked at 16, 32 and 48 px: readable. |
| `src/app/favicon.ico` | 16/32/48 | PNG-in-ICO, for browsers and tools that request `/favicon.ico`. |
| `src/app/apple-icon.png` | 180×180 | Full bleed; iOS applies its own mask. |

Next.js file conventions emit the `<link>` tags. No web manifest and no PWA infrastructure.

## 5. robots.txt and sitemap.xml

`src/app/robots.ts` and `src/app/sitemap.ts` are prerendered with `dynamic = "force-static"`.

**robots.txt**
- `User-Agent: *`, `Allow: /`, plus `Sitemap: <SITE_URL>/sitemap.xml` when `SITE_URL` is set.
- Nothing is disallowed: audit documents, screenshots and source files are never in `out/`.
- Drafts are excluded with `noindex` rather than `Disallow`, so crawlers can see the `noindex`.

**sitemap.xml**
- Lists the 12 indexable routes, from the page registry, plus any published note.
- No `lastmod`: there is no trustworthy per-page date to report.
- Empty until `SITE_URL` is set, because sitemap URLs must be absolute.

**Lab Notes decision:** draft notes and the drafts-only index are **not indexed**. Publishing a note (any `status`
other than `"Draft"`) makes it, and the index, indexable with no other change.

## 6. Canonical URL

- **One value:** `SITE_URL`, read in `src/lib/siteUrl.ts`. It must be an https origin; anything else fails the build
  with a clear message.
- **When set:** every page gets `<link rel="canonical">` to its own trailing-slash URL. The 404 page gets none.
- **When unset:** no absolute URL is emitted anywhere.
- **Production guard:** a Vercel production build (`VERCEL_ENV=production`) without `SITE_URL` fails.
- **No fake domain** is in the repository.
- What Salih must set: [DEPLOYMENT.md](DEPLOYMENT.md#configuration).

## 7. Contact

- **Channels.** GitHub (`github.com/Salih04`, `rel="me"`). Email only when `site.contact.email` is set; it is empty
  and no address was invented.
- **Links.** All external links open in the same tab (ordinary links, no `target=_blank`, so no `noopener` needed).
  The archive's source link keeps `rel="noreferrer"`. The Referrer-Policy header limits what GitHub receives to the
  origin.
- **Copy.** The lead no longer implies a reply channel that does not exist (finding 8).

## 8. Resume

**Consistency with the approved facts:**

| Fact | Resume |
| --- | --- |
| Crytek QA Intern, Feb–Apr 2026 | ✓ (no bullets) |
| Crytek Backend Engineering Intern, May–Jul 2026 | ✓ "Go services for the live game backend of Hunt: Showdown", "Telemetry and automated testing" |
| SAMS: Technical Lead / Maintainer, independent 2-person project | ✓ |
| MSc Data Science, University of Basel: in progress | ✓ |
| FinanceIQ: MSc research / semester project, in progress | ✓ |

The only addition is the public GitHub link in the header, an already-published channel, so a printed copy has a
way back.

**Print** (Chromium print to PDF, A4):
- One page.
- No rail, top bar, footer, print button or cross-links.
- Sections are not split; headings stay with their content.
- Links are dark and underlined.
- Title and file name: "Salih Camcı · Resume".

Changes made: `@page { size: A4; margin: 16mm 18mm }`, tighter print spacing, `break-inside: avoid` on items and
skills. Before the fix it ran to two pages with the skills split between them.

## 9. Link audit

`capture-launch.mjs` collects every `href` on every public page (and every note), then checks each one.

| Check | Result |
| --- | --- |
| Internal paths | All return 200 and use the trailing slash |
| Hash links | Every target exists: section ids on case studies, tab keys such as `/sams/#architecture` and `/financeiq/#results` |
| Case-study mode links | On `/sams/`, the switch moves to `/sams/case-study/` and the rail's SAMS entry follows; it toggles back |
| Malformed hrefs | None |
| External links | 8, all https, all 200 (GitHub profile; SAMS evidence package, verification, limitations, CI record; FinanceIQ repository, RESULTS.md, PIT protocol) |

GitHub rate-limits bursts (429), so the script backs off and retries. No private repository was requested.

## 10. Accessibility

No accessibility checker is installed and none was added. `capture-launch.mjs` implements the checks directly, at
1440×900 and 390×844 on every page.

| Check | Result |
| --- | --- |
| `lang`, one `h1` per page, no skipped heading levels | Pass, after fix 1 below |
| One `main` landmark; every `nav` labelled (Primary, Secondary, Pocket) | Pass |
| Accessible name on every visible control | Pass |
| No duplicate ids; every `aria-labelledby`, `aria-controls` and `aria-describedby` resolves | Pass, after fix 2 below |
| Text contrast, WCAG AA (4.5:1, 3:1 for large text), with ancestor opacity applied | Pass (text over gradients is skipped) |
| Keyboard: first Tab reaches the skip link; up to 30 focus stops on 8 pages, each visibly different from its unfocused state | Pass |
| Case-study toggle | `role="switch"` with `aria-checked`, named "Case study" at every width, after fix 3 below |
| SAMS simulation controls | Named buttons with `aria-pressed`; operable with Enter |
| FinanceIQ as-of cursor | `role="slider"` with `aria-valuenow` and `aria-valuetext`; arrow keys ±7 days, PageUp/PageDown, Home/End |
| Terminal | Optional: `~` opens a modal dialog with focus inside, Escape closes it; every room is reachable from the rail without it |
| Reduced motion | Enter S//LAB navigates at once; the SAMS demo waits for the visitor; reconstructions jump to the end state |
| Mobile touch targets (WCAG 2.2 SC 2.5.8) | Pass |

**Fixed:**
1. **SAMS case-study figure skipped a heading level** (h2 → h4: "A · Request and workflow path", "B · Event
   delivery path", "Reconnect"). They are now h3. Styling comes from the class, so nothing changes visually.
2. **SAMS lab tabs pointed `aria-controls` at panels that were not in the DOM** (the SAMS lab mounts only the active
   panel). `aria-controls` is now set on the selected tab only. This is valid for both labs.
3. **The Case Study switch was named only "Case" at phone width.** Below 520 px the word "study" was removed with
   `display: none`, which also removed it from the accessible name. It is now hidden visually only, so the visible
   label stays short and the name stays "Case study". A check covers it.

**Not changed:** a few standalone text links and the footer's "Press ~ for terminal" are 17–22 px tall. They meet
SC 2.5.8 through its spacing exception: no other target lies within their 24 px circle. The check enforces exactly
that, and lists them as `undersizedButSpaced` in the JSON.

## 11. Performance and build

Gzip sizes from `out/`. Route JS includes the shared framework chunks.

| Route | JS before → after (KB) | CSS before → after (KB) |
| --- | --- | --- |
| `/` | 180.7 → 180.7 | 22.7 → 22.9 |
| `/lab/` | 182.8 → 182.8 | 22.7 → 22.9 |
| `/sams/` | 192.7 → 192.7 | 22.7 → 22.9 |
| `/sams/case-study/` | 179.1 → 179.1 | 22.7 → 22.9 |
| `/financeiq/` | 197.4 → 197.4 | 22.7 → 22.9 |
| `/financeiq/case-study/` | 185.4 → 185.4 | 22.7 → 22.9 |
| `/archive/`, `/vault/`, `/about/`, `/contact/`, `/case-studies/` | 179.1 → 179.1 | 22.7 → 22.9 |
| `/resume/` | 179.4 → 179.4 | 22.7 → 22.9 |
| `/notes/` | 181.9 → 181.9 | 22.7 → 22.9 |

- **Route JS:** unchanged. Metadata, robots and sitemap are build-time only. HTML grew by about 0.2 KB per page
  (meta tags).
- **Static output:** 134 files / 2.65 MB → 141 files / 2.81 MB.
  - New: `og.png` (102 KB), `favicon.ico` (6 KB), `apple-icon.png` (4 KB), `robots.txt`, `sitemap.xml`.
  - By type: HTML 0.60 MB, RSC payloads 0.70 MB, JS 0.75 MB, CSS 0.12 MB, fonts 0.52 MB.
- **Fonts:** 22 WOFF2 subset files (0.52 MB in total). Each is declared with a `unicode-range`, so a visitor
  downloads only the Latin and Latin Extended subsets of the faces in use, about 0.3 MB at most. The others cost
  disk space, not transfer. No change.
- **No leaks:** no duplicate assets, no " 2" copies, and no screenshots, audit files, Markdown or source in `out/`.
- **No unused assets.**
- **Client components:** 20, all interactive (labs, shell, terminal, tabs) or tiny (print button, notes filter).
  The editorial pages are server components. No change.

## 12. Static export and Vercel compatibility

Verified on a local static server that behaves like the host: 404 status for unknown paths, 308 to the trailing
slash, and the `vercel.json` headers.

| Check | Result |
| --- | --- |
| Direct loads and refreshes of every nested route | 200 |
| `/sams` (no slash) | 308 → `/sams/` |
| Unknown path | 404 with the S//LAB page |
| Metadata, icons, OG image, fonts | Served from the export; no request goes to another host |

- **No conversion to server rendering.** Nothing needs a server.
- **On Vercel:** Vercel detects Next.js and serves the export. `next.config` `headers()` does not apply to static
  exports, so headers live in `vercel.json`.
- **Not testable before a real deploy:** Vercel's own trailing-slash redirect and 404 status. They are on the
  post-deploy checklist in DEPLOYMENT.md.

## 13. Security headers

`vercel.json` sets, on every response:
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy` denying camera, microphone, geolocation, payment, usb and browsing-topics
- `X-Frame-Options: DENY`
- `Content-Security-Policy: frame-ancestors 'none'; base-uri 'self'; object-src 'none'; form-action 'self'`

The browser matrix ran with these headers and recorded no console errors.

Not added, on purpose:
- **Script and style CSP.** Next's inline bootstrap scripts and the inline mode script would need per-build hashes.
- **HSTS.** Vercel sends it itself.

The reasons are in DEPLOYMENT.md.

## 14. Analytics and privacy

No analytics added. The site sets no cookies and makes no third-party requests; it stores only the sound on/off
preference in the visitor's browser. The options, and the recommendation to launch without analytics, are in
DEPLOYMENT.md.

## 17. Browser matrix

**Sizes:** 1600×1000, 1440×900, 1280×720, 1024×768, 390×844 (touch), and 1440×900 with reduced motion.

**Scenarios at every size:**
- Entry, Control Room.
- SAMS: initial, disconnected (server 047, client 041), reconnected and converged (PASS / NONE / PASS),
  Architecture, Case Study.
- FinanceIQ: PIT (31 Mar 2020 · 1.18 · 1.31), reconstruction, Negative results, Case Study.
- Archive, About, Resume, Contact, 404, mobile menu (below 1024 px; opens, and Escape closes it).

**Result at every size:**
- no page-level horizontal overflow;
- no console errors;
- no failed requests or missing assets;
- no broken images;
- no text under 12 px;
- no clipped text;
- every scenario's expected state reached.

**Regression:** the previous pass's 37 flagship checks (`capture-final-polish.mjs`) were rerun against the final
build: see §20.

## 18. Adversarial portfolio review

Three reviewers, three likely objections each. A change is made only where an objection exposes factual ambiguity,
misleading language, a usability failure, a security or privacy issue, or broken presentation.

### A. Engineering hiring manager

1. **"How do I reach you?"** There is no email; GitHub has no direct messages. *Usability failure.* The page is
   honest now (finding 8), but this is a **launch blocker that needs Salih's decision** (below).
2. **"What did you build yourself in SAMS, given a 2-person team and AI coding agents?"** Already answered on the
   page:
   - the role ("led backend architecture, event replay, real-time state and reliability validation");
   - the team size;
   - the evidence package's statement that the system was built with AI coding agents in a specification, review
     and validation workflow.

   Not misleading. No change.
3. **"Has any of this run in production, at scale?"** Answered plainly:
   - SAMS: "In development · not deployed to production", with no load or reconnect-storm measurement.
   - FinanceIQ: in progress.
   - Crytek: kept at a high level by design.

   No change.

### B. Data / ML researcher

1. **"Are the numbers in the interactive bench real?"** Every figure carries SIMULATION, SYNTHETIC DATA or
   SCHEMATIC, and the footer defines them. The only real results are cited to `RESULTS.md` and match it. No change.
2. **"Is there a positive result?"** No, and the site says so. The headline is a withdrawn result (IC +0.150,
   p = 0.017) and its point-in-time correction (IC +0.031, p = 0.63). That is presented as the finding, not hidden.
   No change.
3. **"Data source, universe, sample size?"** Deliberately left to the public research repository and its PIT
   protocol, which the case study links. Adding detail here would mean new, unapproved facts. No change.

### C. Security-conscious senior engineer

1. **"Does the portfolio leak the private system: auth, tenancy, endpoints?"**
   - The boundary policy and the build-failing scanner are in place.
   - Authentication and tenancy appear only as named boundaries, with an explicit note that their internals are
     withheld.
   - Nothing was found in `src/` or `out/`.

   No change.
2. **"Headers, framing, third parties?"** Before this pass there was no hosting configuration. *Security gap.*
   **Fixed:** the headers in §13. The site already self-hosts fonts and makes no third-party requests.
3. **"Supply chain?"** Seven runtime dependencies: Next, React, React DOM and four font packages. Nothing is loaded
   from a CDN, and Playwright is not a dependency. No change.

## 19. Not done in this pass, by instruction

- No deploy.
- No Vercel project created.
- No domain assigned.
- No merge to `main`.
- No PR.

## 20. Validation

| Step | Result |
| --- | --- |
| `npm run typecheck` | pass |
| `npm test` (9 files, includes the content guard) | 64/64 pass |
| Boundary scan, `src/` | pass (76 files) |
| `next build` (static export) | pass |
| Boundary scan, `out/` | pass (89 files) |
| Launch browser checks (`docs/audit/launch-checks.json`) | 31/31 pass |
| Flagship regression (`capture-final-polish.mjs`, 37 checks) | 37/37 pass |

## Remaining blockers before production

1. **Choose the domain and set `SITE_URL`** in Vercel's Production environment. A production build fails without it.
2. **Decide on a public contact email.** Today a visitor can reach Salih only through GitHub, which has no direct
   messages. Set `site.contact.email` in `src/content/site.ts` to a chosen address, or accept GitHub-only contact
   knowingly.
3. **Run the post-deploy checks after the first Vercel deploy** (DEPLOYMENT.md): trailing-slash redirect, 404
   status, response headers, social card preview.
4. **Review and merge** `local/slab-v2-final-polish-a4014f` into `main`.

Not blockers, for Salih to decide:
- **Lab Notes:** stay drafts, non-indexed; publish when reviewed.
- **Public GitHub profile:** does not yet mention the QA internship or the telemetry and testing areas. The archive
  states that these rest on Salih's confirmation, so nothing on the site is inconsistent.
