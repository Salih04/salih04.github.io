import { InstrumentTrace } from "@/components/entry/InstrumentTrace";
import { FinanceGlyph, SamsGlyph } from "@/components/lab/Glyphs";
import { LabLink } from "@/components/shell/LabLink";
import { site } from "@/content/site";

const projects = [
  {
    href: "/sams/",
    tone: "sams",
    status: "Agent Systems Lab · Simulation ready",
    name: "SAMS",
    desc: "Agent systems · event replay · reliable workflows",
    go: "Run the failure demo",
    Glyph: SamsGlyph,
  },
  {
    href: "/financeiq/",
    tone: "fiq",
    status: "Market Data Lab · In progress",
    name: "FinanceIQ",
    desc: "Point-in-time data · reproducible research",
    go: "Reconstruct history",
    Glyph: FinanceGlyph,
  },
] as const;

export default function EntryPage() {
  return (
    <section className="entry" aria-labelledby="entry-title">
      <div className="entry__inner">
        <div className="entry__who">
          <p className="entry__mark mono">{site.mark} · research portfolio</p>
          <h1 id="entry-title" className="entry__name">
            {site.name}
          </h1>
          <p className="entry__discipline">
            <span className="entry__role">{site.role}</span>
            <span className="entry__study">
              {site.study.degree} {site.study.status} · {site.study.institution}
            </span>
          </p>
          <p className="entry__line">{site.entryLine}</p>
          <div className="entry__actions">
            <LabLink href="/lab/" className="btn entry__enter">
              Enter the lab <span aria-hidden="true">→</span>
            </LabLink>
            <LabLink href="/case-studies/" className="btn btn--ghost">
              Read case studies
            </LabLink>
          </div>
        </div>

        <ul className="entry__projects" aria-label="Flagship projects">
          {projects.map(({ href, tone, status, name, desc, go, Glyph }) => (
            <li key={href}>
              <LabLink href={href} className={`project-card project-card--${tone}`}>
                <span className="project-card__status mono">{status}</span>
                <span className="project-card__name">{name}</span>
                <span className="project-card__desc">{desc}</span>
                <span className="project-card__glyph">
                  <Glyph />
                </span>
                <span className="project-card__go">
                  {go} <span aria-hidden="true">→</span>
                </span>
              </LabLink>
            </li>
          ))}
        </ul>
      </div>
      <InstrumentTrace />
    </section>
  );
}
