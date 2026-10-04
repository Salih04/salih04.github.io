import type { ReactNode } from "react";

export function PageHeader({ eyebrow, title, lead, children }: { eyebrow: string; title: string; lead?: string; children?: ReactNode }) {
  return (
    <header className="page-header">
      <p className="eyebrow eyebrow--signal">{eyebrow}</p>
      <h1>{title}</h1>
      {lead ? <p className="page-header__lead">{lead}</p> : null}
      {children}
    </header>
  );
}
