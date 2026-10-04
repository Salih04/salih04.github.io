import { SystemField } from "@/components/entry/SystemField";
import { LabLink } from "@/components/shell/LabLink";
import { primaryNav, site } from "@/content/site";

const statuses = [
  { label: "SAMS", state: "Online", tone: "" },
  { label: "Market Data Lab", state: "Active", tone: "status-dot--research" },
  { label: "Engineering Archive", state: "Available", tone: "status-dot--signal" },
];

export default function EntryPage() {
  return (
    <section className="entry" aria-labelledby="entry-title">
      <SystemField />
      <div className="entry__inner">
        <p className="entry__mark mono">{site.mark}</p>
        <h1 id="entry-title" className="entry__title">
          <span>{site.name}</span>
          <span>Research Lab</span>
        </h1>
        <p className="entry__roles mono">
          {site.roles[0]}
          <span aria-hidden="true"> × </span>
          <span className="sr-only">, </span>
          {site.roles[1]}
        </p>
        <p className="entry__line">{site.entryLine}</p>

        <div className="entry__actions">
          <LabLink href="/lab/" className="btn entry__enter">
            Enter lab <span aria-hidden="true">→</span>
          </LabLink>
          <LabLink href="/case-studies/" className="btn btn--ghost">
            Read case studies
          </LabLink>
        </div>

        <dl className="entry__status" aria-label="Lab status (interface state)">
          {statuses.map((s) => (
            <div key={s.label} className="entry__status-row">
              <dt>{s.label}</dt>
              <dd>
                <span className={`status-dot ${s.tone}`} aria-hidden="true" />
                {s.state}
              </dd>
            </div>
          ))}
        </dl>

        <nav className="entry__pocket" aria-label="Quick navigation">
          <p className="eyebrow">Navigation</p>
          <ul>
            {primaryNav.map((item) => (
              <li key={item.href}>
                <LabLink href={item.href}>
                  <span className="mono">{item.index}</span> {item.label}
                </LabLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </section>
  );
}
