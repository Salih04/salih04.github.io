import type { ReactNode } from "react";
import { DecisionRecord } from "@/components/records/DecisionRecord";
import { LabLink } from "@/components/shell/LabLink";
import type { CaseStudy as Study, SourceLink } from "@/content/types";

const SECTIONS = [
  ["glance", "At a glance"],
  ["problem", "Problem"],
  ["role", "My role"],
  ["status", "Result / current status"],
  ["architecture", "Architecture"],
  ["decisions", "Key decisions"],
  ["evidence", "Evidence"],
  ["didnt-work", "What didn't work"],
  ["details", "Technical details"],
] as const;

interface Props {
  study: Study;
  labHref: string;
  /** The interactive figures for this project; they stay interactive in Case Study Mode. */
  architecture: ReactNode;
  accent?: "signal" | "research";
  decisionKind: string;
}

function Section({ id, n, title, children }: { id: string; n: number; title: string; children: ReactNode }) {
  return (
    <section id={id} className="cs-section" aria-labelledby={`${id}-title`}>
      <h2 id={`${id}-title`}>
        <span className="cs-section__n mono" aria-hidden="true">
          {String(n).padStart(2, "0")}
        </span>
        {title}
      </h2>
      {children}
    </section>
  );
}

function Source({ source }: { source?: SourceLink }) {
  if (!source) return null;
  return (
    <p className="cs-source">
      Source: <a href={source.href}>{source.label} ↗</a>
    </p>
  );
}

/**
 * The "At a glance" specification plate: who did what, what it is, where it
 * stands, the central problem, the approach, the stack and the evidence. It
 * fits the first viewport so nobody has to scroll for the basics.
 */
function Glance({ study }: { study: Study }) {
  const g = study.glance;
  return (
    <section id="glance" className="glance" aria-labelledby="glance-title">
      <h2 id="glance-title" className="glance__title">
        At a glance
      </h2>
      <dl className="glance__grid">
        <div className="glance__cell">
          <dt>Role</dt>
          <dd>
            <strong>{g.role}</strong>
            {g.roleDetail ? <span className="glance__sub">{g.roleDetail}</span> : null}
          </dd>
        </div>
        <div className="glance__cell">
          <dt>Project</dt>
          <dd>
            {g.project}
            {g.team ? <span className="glance__sub">{g.team}</span> : null}
          </dd>
        </div>
        <div className="glance__cell">
          <dt>Status</dt>
          <dd>{g.status}</dd>
        </div>
        <div className="glance__cell glance__cell--problem">
          <dt>{g.problemLabel ?? "Problem"}</dt>
          <dd>{g.problem}</dd>
        </div>
        <div className="glance__cell">
          <dt>{g.approachLabel ?? "Approach"}</dt>
          <dd>
            <ol className="glance__list">
              {g.approach.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ol>
          </dd>
        </div>
        <div className="glance__cell">
          <dt>Stack</dt>
          <dd className="glance__stack mono">
            {g.stack.map((t) => (
              <span key={t}>{t}</span>
            ))}
          </dd>
        </div>
        <div className="glance__cell">
          <dt>Evidence</dt>
          <dd>
            <ul className="glance__evidence">
              {g.evidence.map((e) => (
                <li key={e.text}>{e.href ? <a href={e.href}>{e.text} ↗</a> : e.text}</li>
              ))}
            </ul>
          </dd>
        </div>
      </dl>
    </section>
  );
}

/**
 * The editorial view of a project. It renders the same content records as
 * the lab, so nothing is available only through an animation.
 */
export function CaseStudy({ study, labHref, architecture, accent = "signal", decisionKind }: Props) {
  return (
    <article className={`case-study case-study--${accent}`}>
      <header className="cs-header">
        <p className="cs-header__kicker mono">
          <span>Case study · {study.lab}</span>
          <span>{accent === "research" ? "Research report" : "Engineering report"}</span>
        </p>
        <h1 className="cs-header__title">
          {study.name} <span className="cs-header__full">{study.fullName}</span>
        </h1>
        <p className="cs-header__one">{study.oneLiner}</p>
      </header>

      <Glance study={study} />

      <div className="cs-layout">
        <nav className="cs-toc" aria-label="Case study sections">
          <details className="cs-toc__details" open>
            <summary>Contents</summary>
            <ol>
              {SECTIONS.map(([id, label]) => (
                <li key={id}>
                  <a href={`#${id}`}>{label}</a>
                </li>
              ))}
            </ol>
          </details>
          <LabLink href={labHref} className="cs-toc__lab">
            Open the interactive lab →
          </LabLink>
        </nav>

        <div className="cs-body">
          <Section id="problem" n={2} title="Problem">
            <p>{study.problem.summary}</p>
            <ul>
              {study.problem.difficulty.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
          </Section>

          <Section id="role" n={3} title="My role">
            <p>{study.role.summary}</p>
            <ul>
              {study.role.items.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
            <p className="cs-aside">{study.role.context}</p>
          </Section>

          <Section id="status" n={4} title="Result / current status">
            <p>{study.status.summary}</p>
            <ul>
              {study.status.items.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
            <h3>What this does not show</h3>
            <ul className="cs-limits">
              {study.status.limits.map((l) => (
                <li key={l}>{l}</li>
              ))}
            </ul>
            <Source source={study.status.limitsSource} />
          </Section>

          <Section id="architecture" n={5} title="Architecture">
            <p>{study.architectureSummary}</p>
            <div className="cs-figure">{architecture}</div>
            <h3>Hard problems</h3>
            <dl className="cs-defs">
              {study.hardProblems.map((h) => (
                <div key={h.title}>
                  <dt>{h.title}</dt>
                  <dd>{h.body}</dd>
                </div>
              ))}
            </dl>
          </Section>

          <Section id="decisions" n={6} title="Key decisions">
            <p>Important trade-offs, kept as records. Letters label records within this project; they imply no wider log.</p>
            <div className="cs-records">
              {study.decisions.map((d) => (
                <DecisionRecord key={d.key} decision={d} kind={decisionKind} />
              ))}
            </div>
          </Section>

          <Section id="evidence" n={7} title="Evidence">
            <div className="cs-evidence">
              {study.evidence.map((g) => (
                <div key={g.kind} className="cs-evidence__group">
                  <h3 className="cs-label">{g.kind}</h3>
                  <ul>
                    {g.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                  <Source source={g.source} />
                </div>
              ))}
            </div>
          </Section>

          <Section id="didnt-work" n={8} title="What didn't work">
            <p>{study.didntWork.intro}</p>
            {study.didntWork.items.map((l) => (
              <div key={l.title} className="cs-lesson">
                <h3>{l.title}</h3>
                <p>{l.body}</p>
                <p className="cs-lesson__lesson">
                  <span>Lesson</span> {l.lesson}
                </p>
              </div>
            ))}
            <Source source={study.didntWork.source} />
          </Section>

          <Section id="details" n={9} title="Technical details">
            <h3>Constraints</h3>
            <ul>
              {study.details.constraints.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
            <h3>Implementation</h3>
            <dl className="cs-defs">
              {study.details.implementation.map((i) => (
                <div key={i.title}>
                  <dt>{i.title}</dt>
                  <dd>{i.body}</dd>
                </div>
              ))}
            </dl>
          </Section>

          <footer className="cs-end">
            <LabLink href={labHref} className="btn">
              Open the interactive lab
            </LabLink>
            <LabLink href="/case-studies/" className="btn btn--ghost">
              All case studies
            </LabLink>
          </footer>
        </div>
      </div>
    </article>
  );
}
