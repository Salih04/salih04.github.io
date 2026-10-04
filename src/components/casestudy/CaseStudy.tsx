import type { ReactNode } from "react";
import { DecisionRecord } from "@/components/records/DecisionRecord";
import { LabLink } from "@/components/shell/LabLink";
import type { CaseStudy as Study } from "@/content/types";

const SECTIONS = [
  ["overview", "Overview"],
  ["problem", "The problem"],
  ["constraints", "Constraints"],
  ["role", "My role"],
  ["architecture", "Architecture"],
  ["hard-problems", "Hard problems"],
  ["decisions", "Decisions"],
  ["implementation", "Implementation"],
  ["evidence", "Validation / evidence"],
  ["didnt-work", "What didn't work"],
  ["result", "Result"],
  ["next", "Next"],
] as const;

interface Props {
  study: Study;
  labHref: string;
  /** The interactive diagram for this project; it stays interactive in Case Study Mode. */
  architecture: ReactNode;
  accent?: "signal" | "research";
}

function Section({ id, n, title, children }: { id: string; n: number; title: string; children: ReactNode }) {
  return (
    <section id={id} className="cs-section" aria-labelledby={`${id}-title`}>
      <p className="cs-section__n mono">{String(n).padStart(2, "0")}</p>
      <h2 id={`${id}-title`}>{title}</h2>
      {children}
    </section>
  );
}

/**
 * The editorial view of a project. It renders the same content records as
 * the lab, so nothing is available only through an animation.
 */
export function CaseStudy({ study, labHref, architecture, accent = "signal" }: Props) {
  return (
    <article className={`case-study case-study--${accent}`}>
      <header className="cs-header">
        <p className="eyebrow">Case study · {study.lab}</p>
        <h1 className="cs-header__title">{study.name}</h1>
        <p className="cs-header__full">{study.fullName}</p>
        <p className="cs-header__one">{study.oneLiner}</p>
        <LabLink href={labHref} className="cs-header__back mono">
          ← Open the interactive lab
        </LabLink>
      </header>

      <div className="cs-layout">
        <nav className="cs-toc" aria-label="Case study sections">
          <p className="eyebrow">Contents</p>
          <ol>
            {SECTIONS.map(([id, label]) => (
              <li key={id}>
                <a href={`#${id}`}>{label}</a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="cs-body">
          <Section id="overview" n={1} title="Overview">
            {study.overview.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </Section>

          <Section id="problem" n={2} title="The problem">
            <h3>What existed</h3>
            <p>{study.problem.existed}</p>
            <h3>Why it was difficult</h3>
            <ul>
              {study.problem.difficulty.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
          </Section>

          <Section id="constraints" n={3} title="Constraints">
            <div className="cs-columns">
              {(["technical", "research", "operational"] as const).map((k) => (
                <div key={k}>
                  <h3 className="cs-label">{k}</h3>
                  <ul>
                    {study.constraints[k].map((c) => (
                      <li key={c}>{c}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Section>

          <Section id="role" n={4} title="My role">
            <p>What I personally owned:</p>
            <ul>
              {study.role.owned.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
            <p className="cs-aside">{study.role.context}</p>
          </Section>

          <Section id="architecture" n={5} title="Architecture">
            <p>{study.architectureSummary}</p>
            <div className="cs-figure">{architecture}</div>
          </Section>

          <Section id="hard-problems" n={6} title="Hard problems">
            <ol className="cs-numbered">
              {study.hardProblems.map((h) => (
                <li key={h.title}>
                  <h3>{h.title}</h3>
                  <p>{h.body}</p>
                </li>
              ))}
            </ol>
          </Section>

          <Section id="decisions" n={7} title="Decisions">
            <p>Important trade-offs, kept as records.</p>
            <div className="cs-records">
              {study.decisions.map((d) => (
                <DecisionRecord key={d.id} decision={d} />
              ))}
            </div>
          </Section>

          <Section id="implementation" n={8} title="Implementation">
            <dl className="cs-defs">
              {study.implementation.map((i) => (
                <div key={i.title}>
                  <dt>{i.title}</dt>
                  <dd>{i.body}</dd>
                </div>
              ))}
            </dl>
          </Section>

          <Section id="evidence" n={9} title="Validation / evidence">
            <div className="cs-columns">
              {study.evidence.map((g) => (
                <div key={g.kind}>
                  <h3 className="cs-label">{g.kind}</h3>
                  <ul>
                    {g.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Section>

          <Section id="didnt-work" n={10} title="What didn't work">
            {study.didntWork.map((l) => (
              <div key={l.title} className="cs-lesson">
                <h3>{l.title}</h3>
                <p>{l.body}</p>
                <p className="cs-lesson__lesson">
                  <span className="mono">Lesson</span> {l.lesson}
                </p>
              </div>
            ))}
          </Section>

          <Section id="result" n={11} title="Result">
            <ul>
              {study.result.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </Section>

          <Section id="next" n={12} title="Next">
            <ul>
              {study.next.map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ul>
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
