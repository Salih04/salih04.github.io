import { EnterLab } from "@/components/entry/EnterLab";
import { InstrumentTrace } from "@/components/entry/InstrumentTrace";
import { LabLink } from "@/components/shell/LabLink";
import { site } from "@/content/site";

/*
 * The entry is an instrument panel opening onto the lab: who (name, role,
 * study, positioning), then one shared time axis on which the two flagship
 * projects are the two traces. Each trace's key is the way into its lab.
 */
export default function EntryPage() {
  return (
    <section className="entry" aria-labelledby="entry-title">
      <div className="entry__panel">
        <header className="entry__who">
          <h1 id="entry-title" className="entry__name">
            {site.name}
          </h1>
          <p className="entry__discipline">
            <span className="entry__role">{site.role}</span>
            <span className="entry__sep" aria-hidden="true">
              ·
            </span>
            <span className="entry__study">
              {site.study.degree} {site.study.status}, {site.study.institution}
            </span>
          </p>
          <p className="entry__line">{site.entryLine}</p>
        </header>

        <InstrumentTrace />

        <div className="entry__actions">
          <EnterLab />
          <LabLink href="/case-studies/" className="entry__reports">
            Read the case studies <span aria-hidden="true">→</span>
          </LabLink>
        </div>
      </div>
    </section>
  );
}
