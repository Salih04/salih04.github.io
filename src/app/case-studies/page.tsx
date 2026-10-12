import type { Metadata } from "next";
import { PageHeader } from "@/components/editorial/PageHeader";
import { LabLink } from "@/components/shell/LabLink";
import { engineeringRecords } from "@/content/archive";
import { financeReport, samsReport } from "@/content/reports";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata("/case-studies/");

const studies = [
  { study: financeReport, href: "/financeiq/case-study/" },
  { study: samsReport, href: "/sams/case-study/" },
] as const;

export default function CaseStudiesPage() {
  return (
    <div className="editorial">
      <PageHeader
        eyebrow="Project notes — Case studies"
        title="Two projects, in detail"
        lead="What I worked on, how I checked it, and what still needs work. Each write-up links to the public evidence behind it."
      />
      <ul className="study-list">
        {studies.map(({ study, href }) => (
          <li key={study.name} className={`study-card study-card--${study.accent}`}>
            <p className="eyebrow">{study.accent === "research" ? "Data research" : "Agent systems"}</p>
            <h2>
              <LabLink href={href}>{study.name}</LabLink>
            </h2>
            <p className="study-card__full">{study.title}</p>
            <p>{study.intro}</p>
            <dl className="study-card__meta">
              <div>
                <dt>Role</dt>
                <dd>{study.role}</dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>{study.status}</dd>
              </div>
            </dl>
            <div className="study-card__actions">
              <LabLink href={href} className="btn btn--sm">
                Read case study
              </LabLink>
              <LabLink href={study.labHref} className="btn btn--ghost btn--sm">
                Open lab
              </LabLink>
            </div>
          </li>
        ))}
      </ul>
      <p className="editorial__aside">
        Professional work is kept in the <LabLink href="/archive/">Engineering Archive</LabLink> ({[...new Set(engineeringRecords.map((r) => r.organisation))].join(", ")}).
      </p>
    </div>
  );
}
