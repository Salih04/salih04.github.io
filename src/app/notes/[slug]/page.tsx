import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LabLink } from "@/components/shell/LabLink";
import { notes, readingMinutes, type NoteBlock } from "@/content/notes";
import { routeMetadata } from "@/lib/metadata";

export const dynamicParams = false;

export function generateStaticParams() {
  return notes.map((n) => ({ slug: n.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const note = notes.find((n) => n.slug === slug);
  if (!note) return {};
  const draft = note.status === "Draft";
  // Drafts stay out of search indexes and the sitemap until published.
  return routeMetadata(`/notes/${note.slug}/`, {
    title: draft ? `${note.title} (draft)` : note.title,
    description: note.summary,
    index: !draft,
  });
}

function Block({ block }: { block: NoteBlock }) {
  switch (block.type) {
    case "h2":
      return <h2>{block.text}</h2>;
    case "list":
      return (
        <ul>
          {block.items.map((i) => (
            <li key={i}>{i}</li>
          ))}
        </ul>
      );
    case "code":
      return (
        <pre className="note__code">
          <code>{block.text}</code>
        </pre>
      );
    case "quote":
      return <blockquote>{block.text}</blockquote>;
    default:
      return <p>{block.text}</p>;
  }
}

export default async function NotePage({ params }: Props) {
  const { slug } = await params;
  const index = notes.findIndex((n) => n.slug === slug);
  const note = notes[index];
  if (!note) notFound();
  const newer = notes[index - 1];
  const older = notes[index + 1];

  return (
    <article className="editorial note">
      <header className="note__head">
        <p className="eyebrow eyebrow--signal">Lab note — draft</p>
        <h1>{note.title}</h1>
        <p className="note__summary">{note.summary}</p>
        <p className="note__meta mono">
          <span>{note.category}</span>
          <span>Draft · not yet published</span>
          <span>{readingMinutes(note)} min read</span>
        </p>
      </header>
      <div className="prose">
        {note.body.map((b, i) => (
          <Block key={i} block={b} />
        ))}
      </div>
      <nav className="note__nav" aria-label="More lab notes">
        {older ? (
          <LabLink href={`/notes/${older.slug}/`}>
            <span className="mono">← Previous</span> {older.title}
          </LabLink>
        ) : (
          <span />
        )}
        {newer ? (
          <LabLink href={`/notes/${newer.slug}/`}>
            <span className="mono">Next →</span> {newer.title}
          </LabLink>
        ) : null}
      </nav>
      <LabLink href="/notes/" className="mono note__back">
        All lab notes
      </LabLink>
    </article>
  );
}
