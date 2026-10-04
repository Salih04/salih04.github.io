/**
 * Global identity and navigation for S//LAB.
 *
 * Everything in src/content is public. It is scanned by
 * scripts/public-boundary.mjs on every build — see docs/PUBLIC_BOUNDARY.md.
 */

export const site = {
  mark: "S//LAB",
  name: "Salih",
  labName: "Salih Research Lab",
  roles: ["Software Engineer", "MSc Data Science"],
  headline:
    "Building reliable intelligent systems at the intersection of software, data, and real-world complexity.",
  shortHeadline: "Software systems. Intelligent agents. Reproducible research.",
  entryLine: "Building reliable intelligent systems through software, agents and data.",
  description:
    "S//LAB is the research portfolio of Salih, a software engineer with an MSc in Data Science, building reliable intelligent systems through software, agents and data.",
  /**
   * Public contact channels. Leave `email` empty until a public address is
   * chosen; the contact page and terminal only render channels that are set.
   */
  contact: {
    email: "",
    github: "https://github.com/salih04",
  } as { email: string; github: string },
} as const;

export interface NavItem {
  index: string;
  label: string;
  href: string;
  /** Where the link points while Case Study Mode is active. */
  caseHref?: string;
}

/** Desktop left rail, in the order the brief defines. */
export const primaryNav: NavItem[] = [
  { index: "01", label: "Lab", href: "/lab/" },
  { index: "02", label: "SAMS", href: "/sams/", caseHref: "/sams/case-study/" },
  { index: "03", label: "FinanceIQ", href: "/financeiq/", caseHref: "/financeiq/case-study/" },
  { index: "04", label: "Case Studies", href: "/case-studies/" },
  { index: "05", label: "Archive", href: "/archive/" },
  { index: "06", label: "Lab Notes", href: "/notes/" },
];

export const secondaryNav: NavItem[] = [
  { index: "", label: "About", href: "/about/" },
  { index: "", label: "Resume", href: "/resume/" },
  { index: "", label: "Contact", href: "/contact/" },
];

/**
 * Lab ↔ case-study route pairs. Toggling Case Study Mode on one of these
 * routes navigates to its partner instead of only restyling the page.
 */
export const modePairs: { lab: string; caseStudy: string }[] = [
  { lab: "/sams/", caseStudy: "/sams/case-study/" },
  { lab: "/financeiq/", caseStudy: "/financeiq/case-study/" },
];
