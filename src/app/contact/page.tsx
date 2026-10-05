import type { Metadata } from "next";
import { PageHeader } from "@/components/editorial/PageHeader";
import { site } from "@/content/site";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata("/contact/");

export default function ContactPage() {
  const channels = [
    site.contact.email ? { label: "Email", value: site.contact.email, href: `mailto:${site.contact.email}`, rel: undefined } : null,
    { label: "GitHub", value: site.contact.github.replace(/^https:\/\//, ""), href: site.contact.github, rel: "me" },
  ].filter((c) => c !== null);

  return (
    <div className="editorial">
      <PageHeader
        eyebrow="Contact"
        title="Open a channel"
        lead={
          site.contact.email
            ? "For roles, research collaboration or questions about the work. I read everything and reply to what I can help with."
            : "For roles, research collaboration or questions about the work. GitHub is the public channel for now; a direct email address is not published yet."
        }
      />
      <dl className="channels">
        {channels.map((c) => (
          <div key={c.label}>
            <dt className="mono">{c.label}</dt>
            <dd>
              {/* Same tab: an ordinary link. rel="me" ties the profile to this site. */}
              <a href={c.href} rel={c.rel}>
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
