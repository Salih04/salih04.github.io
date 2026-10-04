import type { Metadata } from "next";
import { PageHeader } from "@/components/editorial/PageHeader";
import { LabLink } from "@/components/shell/LabLink";
import { engineeringRecords } from "@/content/archive";

export const metadata: Metadata = {
  title: "Engineering Archive",
  description: "Engineering records of professional work: problem, responsibility, practice and environment.",
};

export default function ArchivePage() {
  return (
    <div className="editorial">
      <PageHeader
        eyebrow="05 — Engineering Archive"
        title="Engineering records"
        lead="Professional work, described by problem, responsibility and practice. Confidential implementation stays confidential."
      />
      {engineeringRecords.map((r) => (
        <article key={r.id} className="eng-record" aria-labelledby={`${r.id}-title`}>
          <header className="eng-record__head">
            <span className="mono">Engineering record · {r.id}</span>
            <span className="tag">On file</span>
          </header>
          <h2 id={`${r.id}-title`} className="eng-record__org">
            {r.organisation}
          </h2>
          <p className="eng-record__disc">{r.discipline}</p>
          <ul className="eng-record__focus mono">
            {r.focus.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
          <dl className="eng-record__fields">
            <div>
              <dt>Problem</dt>
              <dd>{r.problem}</dd>
            </div>
            <div>
              <dt>Responsibility</dt>
              <dd>
                <ul>
                  {r.responsibility.map((x) => (
                    <li key={x}>{x}</li>
                  ))}
                </ul>
              </dd>
            </div>
            <div>
              <dt>Engineering practice</dt>
              <dd>
                <ul>
                  {r.practice.map((x) => (
                    <li key={x}>{x}</li>
                  ))}
                </ul>
              </dd>
            </div>
            <div>
              <dt>Environment</dt>
              <dd>{r.environment}</dd>
            </div>
          </dl>
          <p className="eng-record__boundary mono">⌀ {r.boundary}</p>
        </article>
      ))}
      <aside className="editorial__aside">
        Smaller projects and prototypes live in the <LabLink href="/vault/">Experiment Vault</LabLink>.
      </aside>
    </div>
  );
}
