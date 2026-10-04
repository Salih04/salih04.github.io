import type { Metadata } from "next";
import { PageHeader } from "@/components/editorial/PageHeader";
import { LabLink } from "@/components/shell/LabLink";
import { engineeringRecords } from "@/content/archive";

export const metadata: Metadata = {
  title: "Engineering Archive",
  description: "Engineering records of professional work.",
};

export default function ArchivePage() {
  return (
    <div className="editorial">
      <PageHeader
        eyebrow="05 — Engineering Archive"
        title="Engineering records"
        lead="Professional work, described by role and kind of work. Confidential implementation stays confidential."
      />
      {engineeringRecords.map((r) => (
        <article key={r.id} className="eng-record" aria-labelledby={`${r.id}-title`}>
          <header className="eng-record__head">
            <span className="mono">Engineering record · {r.id}</span>
            <span className="eng-record__period mono">{r.period}</span>
          </header>
          <h2 id={`${r.id}-title`} className="eng-record__org">
            {r.organisation}
          </h2>
          <p className="eng-record__disc">{r.role}</p>
          <p className="eng-record__summary">{r.summary}</p>
          <ul className="eng-record__focus mono">
            {r.focus.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
          <p className="eng-record__boundary">⌀ {r.boundary}</p>
        </article>
      ))}
      <aside className="editorial__aside">
        Smaller projects and prototypes live in the <LabLink href="/vault/">Experiment Vault</LabLink>.
      </aside>
    </div>
  );
}
