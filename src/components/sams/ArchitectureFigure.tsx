import { FigureLabel } from "@/components/records/FigureLabel";
import { architecture, architecturePaths as P, type PathStep } from "@/content/sams";

const byId = (id: string) => architecture.find((c) => c.id === id)!;

function Path({ steps }: { steps: readonly PathStep[] }) {
  return (
    <ol className="archfig__path">
      {steps.map((s, i) => {
        const c = byId(s.id);
        return (
          <li key={`${s.id}-${i}`} className="archfig__step">
            <span className="archfig__role mono">{s.role}</span>
            <span className="archfig__name">{c.label}</span>
            <span className="archfig__owns">{c.owns}</span>
            {s.edge ? <span className="archfig__edge mono">↓ {s.edge}</span> : null}
          </li>
        );
      })}
    </ol>
  );
}

/**
 * The SAMS architecture for the engineering report: the same two paths, roles
 * and reconnect contract as the lab's Architecture tab (both read
 * `architecturePaths`), set as a static, ruled figure instead of an
 * interactive instrument.
 */
export function ArchitectureFigure({ fig = "1" }: { fig?: string }) {
  const workflow = byId("temporal");
  const workers = byId(P.activities.id);
  return (
    <figure className="archfig" aria-labelledby="archfig-caption">
      <div className="archfig__head">
        <FigureLabel fig={fig} kind="schematic" />
        <span id="archfig-caption" className="archfig__title">
          Two paths inside one system boundary
        </span>
      </div>

      <div className="archfig__paths">
        <section className="archfig__col" aria-labelledby="archfig-a">
          <h3 id="archfig-a" className="archfig__k mono">
            A · Request and workflow path
          </h3>
          <Path steps={P.request} />
          <p className="archfig__note">
            <span className="mono">{P.activities.role}</span> {workflow.label} {P.activities.edge} on {workers.label.toLowerCase()}.
          </p>
        </section>

        <section className="archfig__col archfig__col--delivery" aria-labelledby="archfig-b">
          <h3 id="archfig-b" className="archfig__k mono">
            B · Event delivery path
          </h3>
          <Path steps={P.delivery} />
          <p className="archfig__note">
            <span className="mono">A → B</span> The workflow {P.crossing}.
          </p>
        </section>
      </div>

      <div className="archfig__reconnect">
        <h3 className="archfig__k mono">Reconnect</h3>
        <ol>
          {P.reconnect.map((r) => (
            <li key={r.k}>
              <code className="mono">{r.k}</code>
              <span>{r.text}</span>
            </li>
          ))}
        </ol>
      </div>

      <p className="archfig__boundary">
        <span className="mono">System boundary</span>
        {P.boundary.map((id) => (
          <span key={id}>
            <strong>{byId(id).label}</strong> — {byId(id).owns.charAt(0).toLowerCase() + byId(id).owns.slice(1)}.
          </span>
        ))}
      </p>
    </figure>
  );
}
