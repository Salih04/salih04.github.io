import type { Metadata } from "next";
import { PrintButton } from "@/components/editorial/PrintButton";
import { LabLink } from "@/components/shell/LabLink";
import { about, resume } from "@/content/about";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "Resume",
  description: `Resume of ${site.name}: ${site.roles.join(", ")}.`,
};

export default function ResumePage() {
  return (
    <div className="editorial resume">
      <header className="resume__head">
        <div>
          <p className="eyebrow eyebrow--signal">Resume</p>
          <h1>{site.name}</h1>
          <p className="resume__roles mono">{site.roles.join(" · ")}</p>
          <p className="resume__line">{site.headline}</p>
        </div>
        <PrintButton />
      </header>

      <section aria-labelledby="exp-title" className="resume__section">
        <h2 id="exp-title" className="eyebrow">
          Experience
        </h2>
        {resume.experience.map((e) => (
          <div key={e.role} className="resume__item">
            <h3>{e.role}</h3>
            <p className="resume__org">{e.organisation}</p>
            <ul>
              {e.points.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <section aria-labelledby="edu-title" className="resume__section">
        <h2 id="edu-title" className="eyebrow">
          Education
        </h2>
        {resume.education.map((e) => (
          <div key={e.degree} className="resume__item">
            <h3>{e.degree}</h3>
            <ul>
              {e.points.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <section aria-labelledby="skills-title" className="resume__section">
        <h2 id="skills-title" className="eyebrow">
          Skills
        </h2>
        <dl className="resume__skills">
          {resume.skills.map((s) => (
            <div key={s.group}>
              <dt>{s.group}</dt>
              <dd>{s.items.join(" · ")}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="dir-title" className="resume__section">
        <h2 id="dir-title" className="eyebrow">
          Direction
        </h2>
        <p>{about.trajectory.map((t) => t.stage).join(" → ")}</p>
      </section>

      <p className="editorial__aside resume__noprint">
        Project detail: <LabLink href="/sams/case-study/">SAMS</LabLink> · <LabLink href="/financeiq/case-study/">FinanceIQ</LabLink> ·{" "}
        <LabLink href="/archive/">Engineering Archive</LabLink>
      </p>
    </div>
  );
}
