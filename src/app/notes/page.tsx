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
      <PageHeader eyebrow="06 — Lab Notes" title="Lab notes" lead="Engineering and research writing: systems, agents, data and the experiments that didn't work." />
      <NotesIndex notes={notes} />
    </div>
  );
}
