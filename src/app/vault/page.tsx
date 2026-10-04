import type { Metadata } from "next";
import { PageHeader } from "@/components/editorial/PageHeader";
import { vault, type VaultOutcome } from "@/content/vault";

export const metadata: Metadata = {
  title: "Experiment Vault",
  description: "Small projects, prototypes and technical experiments made while building this site.",
};

const tone: Record<VaultOutcome, string> = {
  Completed: "tag--success",
  Ongoing: "tag--signal",
};

export default function VaultPage() {
  return (
    <div className="editorial editorial--wide">
      <PageHeader
        eyebrow="05 — Experiment Vault"
        title="Specimens"
        lead="Small technical experiments made while building this site. Each one is real and can be inspected in the repository."
      />
      <ul className="vault">
        {vault.map((s) => (
          <li key={s.id} className="sample">
            <div className="sample__id mono">{s.id}</div>
            <h2 className="sample__name">{s.name}</h2>
            <dl className="sample__meta mono">
              <div>
                <dt>Status</dt>
                <dd>{s.status}</dd>
              </div>
              <div>
                <dt>Domain</dt>
                <dd>{s.domain}</dd>
              </div>
              <div>
                <dt>Outcome</dt>
                <dd>
                  <span className={`tag ${tone[s.outcome]}`}>{s.outcome}</span>
                </dd>
              </div>
            </dl>
            <p className="sample__note">{s.note}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
