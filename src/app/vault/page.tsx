import type { Metadata } from "next";
import { PageHeader } from "@/components/editorial/PageHeader";
import { vault, type VaultOutcome } from "@/content/vault";

export const metadata: Metadata = {
  title: "Experiment Vault",
  description: "Small projects, prototypes and technical experiments — including the ones that failed.",
};

const tone: Record<VaultOutcome, string> = {
  Completed: "tag--success",
  Failed: "tag--failure",
  Archived: "tag--warning",
  Ongoing: "tag--signal",
};

export default function VaultPage() {
  return (
    <div className="editorial editorial--wide">
      <PageHeader
        eyebrow="Experiment Vault"
        title="Archived samples"
        lead="Prototypes and technical experiments. Unfinished and failed work is catalogued on purpose: each one taught something."
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
