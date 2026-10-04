"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { useLab } from "@/components/shell/LabProvider";
import { observeSteps } from "@/content/sams";
import { prefersReducedMotion } from "@/lib/useReducedMotion";

const STEP_MS = 1500;

/**
 * Signature interaction: the interface dims and a single task travels the
 * whole system, one stage at a time, each with a plain explanation.
 */
export default function ObserveSystem({ onClose }: { onClose: () => void }) {
  const { navigate, cue } = useLab();
  const [step, setStep] = useState(-1);
  const [run, setRun] = useState(0);
  const done = step >= observeSteps.length;
  const dialogRef = useRef<HTMLDivElement>(null);
  const primaryRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const previous = document.activeElement;
    dialogRef.current?.focus();
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
      if (previous instanceof HTMLElement) previous.focus();
    };
  }, []);

  useEffect(() => {
    if (prefersReducedMotion()) {
      setStep(observeSteps.length);
      return;
    }
    setStep(-1);
    let i = -1;
    const t = window.setInterval(() => {
      i += 1;
      // Never move backwards if the visitor skipped ahead.
      setStep((prev) => Math.max(prev, i));
      if (i >= observeSteps.length) window.clearInterval(t);
    }, STEP_MS);
    return () => window.clearInterval(t);
  }, [run]);

  useEffect(() => {
    if (step < 0) return;
    cue(step >= observeSteps.length ? "complete" : "step");
    if (step >= observeSteps.length) primaryRef.current?.focus();
  }, [step, cue]);

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") onClose();
    if (e.key === "Tab") {
      const els = e.currentTarget.querySelectorAll<HTMLElement>("button");
      const first = els[0];
      const last = els[els.length - 1];
      if (e.shiftKey && (document.activeElement === first || document.activeElement === e.currentTarget)) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    }
  };

  const current = observeSteps[Math.min(step, observeSteps.length - 1)];

  // Portalled to <body> so the overlay covers the whole interface, not just the page.
  return createPortal(
    <div className="observe" role="dialog" aria-modal="true" aria-labelledby="observe-title" tabIndex={-1} ref={dialogRef} onKeyDown={onKey}>
      <div className="observe__inner">
        <header className="observe__head">
          <div>
            <p className="eyebrow eyebrow--signal">Observe system</p>
            <h2 id="observe-title">One task, end to end</h2>
          </div>
          <button type="button" className="btn btn--ghost btn--sm" onClick={onClose}>
            Close <span className="sr-only">observation</span>
          </button>
        </header>

        <ol className="observe__pipeline">
          {observeSteps.map((s, i) => {
            const state = done || i < step ? "done" : i === step ? "active" : "idle";
            return (
              <li key={s.id} className="observe__step" data-state={state}>
                <span className="observe__node mono">{s.label}</span>
                <p className="observe__detail">{s.detail}</p>
              </li>
            );
          })}
        </ol>

        <p className="sr-only" aria-live="polite">
          {done ? "Task complete." : current && step >= 0 ? `${current.label}: ${current.detail}` : ""}
        </p>

        <footer className="observe__foot" data-done={done || undefined}>
          {done ? (
            <>
              <p className="observe__complete mono">
                <span className="status-dot" aria-hidden="true" /> Task complete
              </p>
              <div className="observe__actions">
                <button
                  ref={primaryRef}
                  type="button"
                  className="btn"
                  onClick={() => {
                    onClose();
                    navigate("/sams/case-study/#decisions");
                  }}
                >
                  View engineering decisions
                </button>
                <button type="button" className="btn btn--ghost" onClick={() => setRun((r) => r + 1)}>
                  Replay
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="demo-note">Scripted demonstration of the design, not live infrastructure.</p>
              <button type="button" className="btn btn--ghost btn--sm" onClick={() => setStep(observeSteps.length)}>
                Skip to end
              </button>
            </>
          )}
        </footer>
      </div>
    </div>,
    document.body,
  );
}
