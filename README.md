# Salih Camcı - Portfolio

A bilingual, zero-build portfolio for Salih Camcı's software engineering, data, backend, and applied-AI work.

**Status:** Completed project

**Live site:** [salih04.github.io](https://salih04.github.io/)

## What this repository contains

- Six English pages at the repository root
- Six mirrored Turkish pages under `tr/`
- One shared stylesheet and one shared JavaScript file
- Static metadata, sitemap, robots file, favicon, and social-preview assets

The site presents project maturity and limitations explicitly. FinanceIQ is described as a completed research project with no reliable predictive edge; prototypes are not presented as production systems.

## Structure

```text
.
├── index.html
├── projects.html
├── experiences.html
├── education.html
├── skills.html
├── activities.html
├── tr/                  # Turkish mirrors of all six pages
└── assets/
    ├── css/styles.css
    ├── js/main.js
    └── images/
```

## Local preview

No installation or build step is required.

```bash
python3 -m http.server 8000
```

Open `http://localhost:8000/` and use the language switcher to verify the corresponding English and Turkish pages.

## Validation

The repository has no package manager or application test suite. The relevant checks are:

- all 12 pages load with meaningful content;
- English/Turkish routes round-trip through the language switcher;
- internal links and relative asset paths resolve;
- pages have no horizontal overflow at desktop and mobile widths;
- structured metadata remains valid;
- no public page links to a stale CV.

## Known limitations

- Page content is duplicated manually between English and Turkish files; every content change must update both versions.
- The contact form provides client-side feedback only and does not send a message.
- There is no build system, CMS, or automated deployment workflow in this repository.

## License status

No open-source license has been declared. Portfolio content and original assets remain reserved unless stated otherwise.
