# Deployment

S//LAB is a Next.js static export (`output: "export"`, `trailingSlash: true`). `npm run build` writes a complete
static site to `out/`: one HTML file per route, hashed JS and CSS, self-hosted fonts, `robots.txt`,
`sitemap.xml`, the icons and the social preview image. No server, database or runtime secret is involved.

This document contains no secrets, and none are needed.

## Configuration

| Variable | Required | Where | What it does |
| --- | --- | --- | --- |
| `SITE_URL` | **Yes, for production** | Build environment | The production origin, for example `https://<your-domain>`: https, no path, no trailing slash needed. It turns on canonical links, `og:url`, the Open Graph and Twitter image, the sitemap entries and the `Sitemap:` line in `robots.txt`, and adds that one host to the boundary scanner's allowlist. |

- **Unset** (local development, previews): the build succeeds and emits no absolute URL at all, rather than a guessed
  or local one. The sitemap is empty, `robots.txt` has no sitemap line, and social cards have no image.
- **Unset on a Vercel production build** (`VERCEL_ENV=production`): the build fails with
  `SITE_URL must be set for a production deployment`, so the site cannot launch without canonical URLs by mistake.
- **Invalid** (not https, has a path, not a URL): the build fails with a message naming the problem.
- Defined in `src/lib/siteUrl.ts`; nothing else reads the domain.

**Public contact email.** Not an environment variable: it is `site.contact.email` in `src/content/site.ts`, empty
today. Set it only to an address Salih has chosen to publish. The contact page, resume and terminal show it as soon
as it is set, and the boundary scanner allows exactly that address and no other.

## Commands

### Local development

```bash
npm install
```

```bash
npm run dev
```

The dev server runs on http://localhost:3000.

### Checks

```bash
npm run check
```

Typecheck, all unit tests (including the content guard) and the boundary scan of `src/`.

### Production build

```bash
SITE_URL=https://<your-domain> npm run build
```

Runs the boundary scan on `src/`, `next build` (static export to `out/`) and the boundary scan on `out/`. Any
finding fails the build.

### Static export verification

```bash
npx --yes serve out
```

Then confirm:

- `out/sitemap.xml` lists the indexable routes under `SITE_URL`, with no Lab Notes while they are drafts.
- `out/robots.txt` ends with `Sitemap: <SITE_URL>/sitemap.xml`.
- The `<head>` of any page carries `<link rel="canonical">`, `og:image` and `twitter:card` = `summary_large_image`.
- `/no-such-page/` shows the S//LAB 404 page.

The browser matrix, link audit and accessibility checks (Playwright, not a project dependency):

```bash
PLAYWRIGHT_MODULE=<path-to>/playwright/index.mjs node docs/audit/capture-launch.mjs > docs/audit/launch-checks.json
```

It expects the export on port 4173, served with `404.html` for unknown paths and the headers from `vercel.json`.

### Vercel

The repository needs no Vercel-specific build settings: Vercel detects Next.js, runs `npm run build` and serves the
static export.

1. Import the repository in Vercel, or link it from the command line:

   ```bash
   npx vercel link
   ```

2. In **Project → Settings → Environment Variables**, add `SITE_URL` for the **Production** environment. Adding the
   same value to **Preview** is optional: preview canonicals then point at production, which is correct.
3. Deploy a preview and check it, then deploy to production:

   ```bash
   npx vercel
   ```

   ```bash
   npx vercel --prod
   ```

4. Attach the domain in **Project → Settings → Domains**, and make sure `SITE_URL` is exactly that origin.

After the first production deploy, check:

- `https://<your-domain>/sams` redirects to `/sams/`, and a refresh on `/sams/case-study/` loads directly.
- An unknown path returns status 404 with the S//LAB 404 page.
- The response headers listed below are present (`curl -I https://<your-domain>/`).
- The social preview renders in a card validator (for example by pasting the URL into a LinkedIn or Bluesky post
  draft).

## Hosting headers

`vercel.json` sets these on every response. `next.config` `headers()` is not used: it does not apply to a static
export.

| Header | Value | Why |
| --- | --- | --- |
| `X-Content-Type-Options` | `nosniff` | Files are only interpreted as their declared type. |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Outbound links (GitHub) receive the origin only, never a full path. |
| `Permissions-Policy` | camera, microphone, geolocation, payment, usb, browsing-topics all `()` | The site uses none of them. Sound is synthesized with Web Audio, which needs no permission. |
| `X-Frame-Options` | `DENY` | No framing, for browsers without CSP `frame-ancestors`. |
| `Content-Security-Policy` | `frame-ancestors 'none'; base-uri 'self'; object-src 'none'; form-action 'self'` | Framing, `<base>` injection and plugins are refused. |

Not added, on purpose:

- **`script-src` / `style-src` in the CSP.** Next.js writes inline bootstrap scripts into every exported page, and
  the root layout has a small inline script that sets the mode before first paint. A correct policy would need a
  hash per inline script, regenerated on every build. A policy with `'unsafe-inline'` would add little, and a
  wrong one would break the site, so the CSP is limited to the directives above. There is no user input, form,
  third-party script or cookie on the site.
- **`Strict-Transport-Security`.** Vercel serves every deployment over HTTPS and sends HSTS itself. If the site moves
  to another host, add `Strict-Transport-Security: max-age=63072000` there.
- **Cache headers.** Vercel already serves `/_next/static/*` as immutable and revalidates HTML.

## Search indexing

- `robots.txt` allows everything that is deployed. Audit documents, screenshots and source files are not part of
  `out/`, so they are never deployed.
- Draft Lab Notes and the Lab Notes index (which lists only drafts) carry `<meta name="robots" content="noindex, follow">`
  and are left out of the sitemap. They are not blocked in `robots.txt`, because a crawler that may not fetch a page
  never sees its noindex. When a note is published (`status` other than `"Draft"` in `src/content/notes.ts`), it and
  the index become indexable automatically.
- The 404 page carries `noindex` (added by Next.js).

## Analytics and privacy

**Recommendation: launch without analytics.** The site sets no cookies, stores nothing about visitors (only the sound
on/off preference, in the visitor's own browser), and makes no third-party requests. That needs no
consent banner and no privacy notice beyond the obvious.

If analytics are wanted later, prefer a privacy-conscious, cookieless option and add it deliberately:

| Option | Notes |
| --- | --- |
| None (default) | Nothing to disclose. GitHub traffic insights for the evidence repositories already show some interest. |
| Vercel Web Analytics | Cookieless and first-party on Vercel; aggregate page views only. Enable it in the Vercel dashboard and add its script. |
| Plausible or Umami | Cookieless, aggregate, open source; Umami can be self-hosted. Adds a third-party script host. |

Whichever is chosen: no tracking cookies, no fingerprinting, no consent UI unless the tool requires it. Adding a
script from another host means adding that host to `ALLOWED_HOSTS` in `scripts/public-boundary.mjs` in a reviewed
change, and mentioning it on the contact or about page.

## Regenerating the brand assets

`public/og.png` (1200×630), `src/app/apple-icon.png` (180×180) and `src/app/favicon.ico` (16/32/48) are rendered
from `scripts/brand/og-image.html` and `src/app/icon.svg`:

```bash
PLAYWRIGHT_MODULE=<path-to>/playwright/index.mjs npm run brand
```
