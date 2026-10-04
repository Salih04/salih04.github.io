import type { Metadata } from "next";
import { PageHeader } from "@/components/editorial/PageHeader";
import { LabLink } from "@/components/shell/LabLink";
import { crossReferences, engineeringRecords } from "@/content/archive";

export const metadata: Metadata = {
  title: "Engineering Archive",
  description: "Engineering records of professional work.",
};

export default function ArchivePage() {
  return (
    <div className="editorial editorial--archive">
      <PageHeader
        eyebrow="04 — Engineering Archive"
        title="Engineering records"
        lead="Professional work, described by role and kind of work. Confidential implementation stays confidential."
      />
      {engineeringRecords.map((r) => (
        <article key={r.id} className="eng-record" aria-labelledby={`${r.id}-title`}>
          <header className="eng-record__head">
            <span className="mono">Engineering record · {r.id}</span>
            <span className="eng-record__period mono">{r.period}</span>
          </header>
          <div className="eng-record__body">
            <div className="eng-record__id">
              <h2 id={`${r.id}-title`} className="eng-record__org">
                {r.organisation}
              </h2>
              <p className="eng-record__disc">{r.role}</p>
              {r.summary ? <p className="eng-record__summary">{r.summary}</p> : null}
            </div>
            <dl className="eng-record__fields">
              <div>
                <dt>Role</dt>
                <dd>{r.role}</dd>
              </div>
              <div>
                <dt>Period</dt>
                <dd className="mono">{r.period}</dd>
              </div>
              {r.area ? (
                <div>
                  <dt>Area</dt>
                  <dd>{r.area.join(" · ")}</dd>
                </div>
              ) : null}
              {r.tech ? (
                <div>
                  <dt>Tech</dt>
                  <dd className="mono">{r.tech.join(" · ")}</dd>
                </div>
              ) : null}
              {r.context ? (
                <div>
                  <dt>Context</dt>
                  <dd>{r.context}</dd>
                </div>
              ) : null}
              <div>
                <dt>Basis</dt>
                <dd className="eng-record__basis">
                  {r.basis.text}
                  {r.basis.link ? (
                    <>
                      {" · "}
                      <a href={r.basis.link.href} rel="noreferrer">
                        {r.basis.link.label} <span aria-hidden="true">↗</span>
                      </a>
                    </>
                  ) : null}
                </dd>
              </div>
            </dl>
          </div>
          <div className="eng-record__limits">
            <p className="eng-record__boundary">
              <span className="eng-record__k mono">Boundary</span> ⌀ {r.boundary}
            </p>
            <p className="eng-record__omitted">
              <span className="eng-record__k mono">Not in this record</span>
              <span className="eng-record__omitted-list">
                {r.omitted.map((o) => (
                  <span key={o}>{o}</span>
                ))}
              </span>
            </p>
          </div>
        </article>
      ))}

      <section className="xref" aria-labelledby="xref-title">
        <h2 id="xref-title" className="xref__head mono">
          Cross-reference · project reports in this facility
        </h2>
        <ol className="xref__list">
          {crossReferences.map((x) => (
            <li key={x.href}>
              <LabLink href={x.href} className="xref__row">
                <span className="xref__id mono">{x.id}</span>
                <span className="xref__title">{x.title}</span>
                <span className="xref__kind">{x.kind}</span>
                <span className="xref__go" aria-hidden="true">
                  →
                </span>
              </LabLink>
            </li>
          ))}
        </ol>
      </section>

      <aside className="editorial__aside">
        Smaller projects and prototypes live in the <LabLink href="/vault/">Experiment Vault</LabLink>.
      </aside>
    </div>
  );
}
