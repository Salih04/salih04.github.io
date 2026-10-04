"use client";

import Link from "next/link";
import type { MouseEvent } from "react";
import { useLab } from "@/components/shell/LabProvider";

/**
 * "Enter S//LAB": a plain link to the Control Room. A plain click plays the
 * short facility transition (the trace folds into a line, the floor opens
 * from it); modified clicks and reduced motion navigate normally.
 */
export function EnterLab() {
  const { enterFacility } = useLab();
  const onClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    enterFacility("/lab/");
  };
  return (
    <Link href="/lab/" className="entry__enter" onClick={onClick}>
      <span className="entry__enter-k mono">Enter</span>
      <span className="entry__enter-t">S//LAB</span>
      <span className="entry__enter-arrow" aria-hidden="true">
        →
      </span>
    </Link>
  );
}
