# Salih Camcı — portfolio

Static, zero-build portfolio: a home page and two case studies.

**Live site:** [salih04.github.io](https://salih04.github.io/)

## Contents

```text
.
├── index.html        # home: work, experience, education, contact
├── sams.html         # case study: SAMS reliability layer
├── financeiq.html    # case study: FinanceIQ evaluation and its audit
├── projects.html, experiences.html, education.html, skills.html, activities.html
│                     # redirects from the previous site's URLs
├── de/, tr/          # redirects: the site is English-only for now
├── sitemap.xml, robots.txt
└── assets/
    ├── css/site.css
    └── images/
```

The figures are inline SVG drawn from the mechanisms and numbers they
describe (the SAMS replay → live handoff, the FinanceIQ point-in-time
correction). The site is English-only; German and Turkish pages were retired
rather than machine-translated.

## Local preview

```bash
python3 -m http.server 8000
```

## Checks

- every page loads, with working internal links;
- no horizontal overflow at 320 px, 390 px and desktop widths;
- light and dark colour schemes, reduced motion, keyboard focus visible;
- metadata, canonical URLs and sitemap agree;
- claims match the linked repositories.

## Licence

No licence is granted. Content and original assets remain all rights reserved.
