"use client";

import { useState } from "react";
import { LabLink } from "@/components/shell/LabLink";
import { formatNoteDate, noteCategories, readingMinutes, type LabNote, type NoteCategory } from "@/content/notes";

export function NotesIndex({ notes }: { notes: LabNote[] }) {
  const [filter, setFilter] = useState<NoteCategory | null>(null);
  const shown = filter ? notes.filter((n) => n.category === filter) : notes;

  return (
    <>
      <div className="filters" role="group" aria-label="Filter by category">
        <button type="button" aria-pressed={filter === null} onClick={() => setFilter(null)}>
          All
        </button>
        {noteCategories.map((c) => {
          const count = notes.filter((n) => n.category === c).length;
          return (
            <button key={c} type="button" aria-pressed={filter === c} onClick={() => setFilter(c)} disabled={count === 0}>
              {c} <span className="filters__count">{count}</span>
            </button>
          );
        })}
      </div>
      <ol className="notes" aria-live="polite">
        {shown.map((n) => (
          <li key={n.slug}>
            <LabLink href={`/notes/${n.slug}/`} className="note-row">
              <span className="note-row__n mono">Lab note {n.number}</span>
              <span className="note-row__title">{n.title}</span>
              <span className="note-row__summary">{n.summary}</span>
              <span className="note-row__meta mono">
                {n.category} · {formatNoteDate(n.date)} · {readingMinutes(n)} min read
              </span>
            </LabLink>
          </li>
        ))}
        {shown.length === 0 ? <li className="notes__empty">No notes in this category yet.</li> : null}
      </ol>
    </>
  );
}
