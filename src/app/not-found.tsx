import type { Metadata } from "next";
import { LabLink } from "@/components/shell/LabLink";

// Next.js adds noindex to the 404 page itself.
export const metadata: Metadata = { title: "Not found" };

export default function NotFound() {
  return (
    <div className="editorial not-found">
      <p className="eyebrow eyebrow--signal">404 · Signal lost</p>
      <h1>This room does not exist.</h1>
      <p className="page-header__lead">The link may be old, or the experiment was archived. The control room has a map of everything.</p>
      <div className="not-found__actions">
        <LabLink href="/lab/" className="btn">
          Control room
        </LabLink>
        <LabLink href="/case-studies/" className="btn btn--ghost">
          Case studies
        </LabLink>
      </div>
    </div>
  );
}
