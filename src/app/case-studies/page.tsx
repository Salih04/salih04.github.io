import type { Metadata } from "next";
import { PageHeader } from "@/components/editorial/PageHeader";
import { LabLink } from "@/components/shell/LabLink";
import { engineeringRecords } from "@/content/archive";
import { financeCaseStudy } from "@/content/financeiq";
import { samsCaseStudy } from "@/content/sams";

export const metadata: Metadata = {
  title: "Case Studies",
  description: "Engineering case studies: SAMS and FinanceIQ, written for quick, complete reading.",
};

const studies = [
  { study: samsCaseStudy, href: "/sams/case-study/", lab: "/sams/", accent: "signal" },
  { study: financeCaseStudy, href: "/financeiq/case-study/", lab: "/financeiq/", accent: "research" },
] as const;

export default function CaseStudiesPage() {
  return (
    <div className="editorial">
      <PageHeader
        eyebrow="Reports — Case studies"
        title="The research reports"
        lead="Each project as an engineering report that opens with role, status and evidence, then the problem, architecture, decisions and what didn't work."
      />
      <ul className="study-list">
        {studies.map(({ study, href, lab, accent }) => (
          <li key={study.slug} className={`study-card study-card--${accent}`}>
            <p className="eyebrow">{study.lab}</p>
            <h2>
              <LabLink href={href}>{study.name}</LabLink>
            </h2>
            <p className="study-card__full">{study.fullName}</p>
            <p>{study.oneLiner}</p>
            <dl className="study-card__meta">
              <div>
                <dt>Role</dt>
                <dd>{study.glance.role.split(".")[0]}</dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>{study.glance.status}</dd>
              </div>
            </dl>
            <div className="study-card__actions">
              <LabLink href={href} className="btn btn--sm">
                Read case study
              </LabLink>
              <LabLink href={lab} className="btn btn--ghost btn--sm">
                Open lab
              </LabLink>
            </div>
          </li>
        ))}
      </ul>
      <p className="editorial__aside">
        Professional work is kept in the <LabLink href="/archive/">Engineering Archive</LabLink> ({engineeringRecords.map((r) => r.organisation).join(", ")}).
      </p>
    </div>
  );
}
