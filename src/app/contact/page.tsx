import type { Metadata } from "next";
import { PageHeader } from "@/components/editorial/PageHeader";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "Contact",
  description: `Contact ${site.name} at ${site.mark}.`,
};

export default function ContactPage() {
  const channels = [
    site.contact.email ? { label: "Email", value: site.contact.email, href: `mailto:${site.contact.email}` } : null,
    { label: "GitHub", value: site.contact.github.replace(/^https:\/\//, ""), href: site.contact.github },
  ].filter((c): c is { label: string; value: string; href: string } => c !== null);

  return (
    <div className="editorial">
      <PageHeader
        eyebrow="Contact"
        title="Open a channel"
        lead="For roles, research collaboration or questions about the work. I read everything and reply to what I can help with."
      />
      <dl className="channels">
        {channels.map((c) => (
          <div key={c.label}>
            <dt className="mono">{c.label}</dt>
            <dd>
              <a href={c.href} rel="me noopener">
                {c.value}
              </a>
            </dd>
          </div>
        ))}
      </dl>
      <p className="editorial__aside mono">
        Prefer a command line? Press <kbd>~</kbd> and type <code>contact</code>.
      </p>
    </div>
  );
}
