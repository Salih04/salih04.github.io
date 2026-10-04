/**
 * Global identity and navigation for S//LAB.
 *
 * Everything in src/content is public. It is scanned by
 * scripts/public-boundary.mjs on every build — see docs/PUBLIC_BOUNDARY.md.
 */

export const site = {
  mark: "S//LAB",
  name: "Salih",
  /** Full public name, for the resume and contact pages only. The hero stays "Salih". */
  fullName: "Salih Camcı",
  labName: "Salih Research Lab",
  role: "Software Engineer",
  /** Current study. In progress: never present it as a completed degree. */
  study: { degree: "MSc Data Science", institution: "University of Basel", status: "student" },
  roles: ["Software Engineer", "MSc Data Science student, University of Basel"],
  headline: "I build reliable software systems, agentic infrastructure, and reproducible data research.",
  entryLine: "I build reliable software systems, agentic infrastructure, and reproducible data research.",
  description:
    "S//LAB is the research portfolio of Salih, a software engineer and MSc Data Science student at the University of Basel, who builds reliable software systems, agentic infrastructure and reproducible data research.",
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
  /** Shown quieter than the rest (drafts). */
  quiet?: string;
}

/**
 * The left rail is the facility directory: one line per room, numbered as
 * on the Control Room floor plan. Lab Notes are drafts, so they sit quieter.
 */
export const primaryNav: NavItem[] = [
  { index: "01", label: "Lab", href: "/lab/" },
  { index: "02", label: "SAMS", href: "/sams/", caseHref: "/sams/case-study/" },
  { index: "03", label: "FinanceIQ", href: "/financeiq/", caseHref: "/financeiq/case-study/" },
  { index: "04", label: "Archive", href: "/archive/" },
  { index: "05", label: "Vault", href: "/vault/" },
  { index: "06", label: "Notes", href: "/notes/", quiet: "draft" },
];

/** Reports: the editorial view of the two flagship projects. */
export const reportsNav: NavItem = { index: "", label: "Case studies", href: "/case-studies/" };

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
