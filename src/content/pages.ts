import { notes } from "./notes";
import { site } from "./site";

/**
 * Titles and descriptions for every public route, in one place. Page files
 * read their metadata from here and the sitemap lists the indexable ones,
 * so a route cannot be in one and missing from the other.
 *
 * Titles render as "<title> — S//LAB" unless `absolute` is set.
 */
export interface PageInfo {
  title: string;
  /** Rendered as is, without the " — S//LAB" suffix. */
  absolute?: boolean;
  description: string;
  /** False keeps the route out of search indexes and the sitemap. */
  index: boolean;
}

/** Lab Notes are drafts until Salih publishes them; drafts are not indexed. */
const notesPublished = notes.some((n) => n.status !== "Draft");

export const pages = {
  "/": {
    title: `${site.mark} — ${site.labName}`,
    absolute: true,
    description: site.description,
    index: true,
  },
  "/lab/": {
    title: "Control Room",
    description: "The S//LAB Control Room: a floor plan of the lab, with rooms for SAMS, FinanceIQ, the Engineering Archive, the Experiment Vault and Lab Notes.",
    index: true,
  },
  "/sams/": {
    title: "SAMS",
    description:
      "SAMS lab: a scripted failure demo of resumable event delivery, the architecture and the design decisions of an independent system for long-running LLM agent workflows.",
    index: true,
  },
  "/sams/case-study/": {
    title: "SAMS Case Study",
    description:
      "Engineering report on SAMS, an independent 2-person project: durable agent workflows, event replay with explicit gaps, design decisions, historical evidence and limits.",
    index: true,
  },
  "/financeiq/": {
    title: "FinanceIQ",
    description:
      "FinanceIQ lab: point-in-time reconstruction, walk-forward experiments and documented negative results from an MSc research project in progress. Interactive data is synthetic.",
    index: true,
  },
  "/financeiq/case-study/": {
    title: "FinanceIQ Case Study",
    description:
      "Research report on FinanceIQ, an MSc Data Science project in progress at the University of Basel: point-in-time market data, so historical experiments only use what was knowable.",
    index: true,
  },
  "/case-studies/": {
    title: "Case Studies",
    description: "Written reports on the two flagship projects, SAMS and FinanceIQ, for quick and complete reading.",
    index: true,
  },
  "/archive/": {
    title: "Engineering Archive",
    description: "Engineering records of professional work: backend engineering and QA internships at Crytek, described at a public, high level.",
    index: true,
  },
  "/vault/": {
    title: "Experiment Vault",
    description: "Small projects, prototypes and technical experiments made while building this site.",
    index: true,
  },
  "/notes/": {
    title: "Lab Notes",
    description: "Engineering and research notes from S//LAB. Notes marked draft are not yet published.",
    index: notesPublished,
  },
  "/about/": {
    title: "About",
    description: `About ${site.fullName}: software engineer and MSc Data Science student at the University of Basel, working on reliable systems, agentic infrastructure and data research.`,
    index: true,
  },
  "/resume/": {
    // Absolute and name-first: it is also the default file name of a saved PDF.
    title: `${site.fullName} · Resume`,
    absolute: true,
    description: `Resume of ${site.fullName}: software engineer, MSc Data Science student at the University of Basel. Experience, education and skills.`,
    index: true,
  },
  "/contact/": {
    title: "Contact",
    description: `Public contact channels for ${site.fullName}, software engineer and MSc Data Science student at the University of Basel.`,
    index: true,
  },
} satisfies Record<string, PageInfo>;

export type PagePath = keyof typeof pages;
