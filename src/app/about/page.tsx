import type { Metadata } from "next";
import { PageHeader } from "@/components/editorial/PageHeader";
import { LabLink } from "@/components/shell/LabLink";
import { about } from "@/content/about";

export const metadata: Metadata = {
  title: "About",
  description: "About Salih: software engineer and MSc Data Science student at the University of Basel.",
};

export default function AboutPage() {
  return (
    <div className="editorial">
      <PageHeader eyebrow="About" title={about.title}>
        <ul className="about__summary mono">
          {about.summary.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      </PageHeader>
      <div className="prose">
        {about.intro.map((p) => (
          <p key={p}>{p}</p>
        ))}
      </div>

      <section className="areas" aria-labelledby="areas-title">
        <h2 id="areas-title" className="eyebrow">
          Areas of work
        </h2>
        <dl>
          {about.areas.map((a) => (
            <div key={a.area}>
              <dt>{a.area}</dt>
              <dd>{a.note}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="principles-title" className="principles">
        <h2 id="principles-title" className="eyebrow">
          Working principles
        </h2>
        <dl>
          {about.principles.map((p) => (
            <div key={p.title}>
              <dt>{p.title}</dt>
              <dd>{p.body}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="editorial__aside">
        Continue to the <LabLink href="/resume/">resume</LabLink> or <LabLink href="/contact/">get in touch</LabLink>.
      </p>
    </div>
  );
}
