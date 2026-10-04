import type { Metadata } from "next";
import { NotesIndex } from "@/components/editorial/NotesIndex";
import { PageHeader } from "@/components/editorial/PageHeader";
import { notes } from "@/content/notes";

export const metadata: Metadata = {
  title: "Lab Notes",
  description: "Engineering and research writing from S//LAB.",
};

export default function NotesPage() {
  return (
    <div className="editorial">
      <PageHeader eyebrow="06 — Lab Notes" title="Lab notes" lead="Engineering and research writing on systems, agents and data. Every note is a draft until it has been reviewed and published." />
      <NotesIndex notes={notes} />
    </div>
  );
}
