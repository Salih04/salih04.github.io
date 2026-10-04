"use client";

import { useState } from "react";
import { DecisionBrowser } from "@/components/records/DecisionBrowser";
import { LabLink } from "@/components/shell/LabLink";
import { financeCaseStudy, financeDecisions } from "@/content/financeiq";
import { useHashTab } from "@/lib/useHashTab";
import { ExperimentConsole } from "./ExperimentConsole";
import { FailedExperiments } from "./FailedExperiments";
import { PipelineView } from "./PipelineView";
import { PitLab } from "./PitLab";
import { WalkForward } from "./WalkForward";

const TABS = ["console", "pipeline", "pit", "validation", "results"] as const;
type Tab = (typeof TABS)[number];
const LABELS: Record<Tab, string> = {
  console: "Experiment console",
  pipeline: "Data pipeline",
  pit: "PIT reconstruction",
  validation: "Validation",
  results: "Results",
};

export function FinanceLab() {
  const [tab, setTab] = useHashTab(TABS, "console");
  const [reconstructToken, setReconstructToken] = useState(0);
  const [runToken, setRunToken] = useState(0);

  const openTab = (t: Tab) => {
    setTab(t);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="lab lab--research">
      <header className="lab-header">
        <div>
          <p className="eyebrow eyebrow--research">03 — Market Data Research Lab</p>
          <h1 className="lab-header__name">FinanceIQ</h1>
          <p className="lab-header__full">Point-in-time market data lab</p>
        </div>
        <div className="lab-header__actions">
          <button
            type="button"
            className="btn btn--research"
            onClick={() => {
              setTab("pit");
              setReconstructToken((n) => n + 1);
            }}
          >
            Reconstruct history
          </button>
          <LabLink href="/financeiq/case-study/" className="btn btn--ghost">
            Case study
          </LabLink>
        </div>
      </header>

      <p className="lab-lede">Reconstructing historical truth for reproducible financial research.</p>

      <div className="tabs" role="tablist" aria-label="FinanceIQ views">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            id={`tab-${t}`}
            aria-selected={tab === t}
            aria-controls={`panel-${t}`}
            tabIndex={tab === t ? 0 : -1}
            className="tabs__tab"
            onClick={() => setTab(t)}
            onKeyDown={(e) => {
              const i = TABS.indexOf(t);
              const next = e.key === "ArrowRight" ? TABS[(i + 1) % TABS.length] : e.key === "ArrowLeft" ? TABS[(i + TABS.length - 1) % TABS.length] : null;
              if (next) {
                e.preventDefault();
                setTab(next);
                document.getElementById(`tab-${next}`)?.focus();
              }
            }}
          >
            {LABELS[t]}
          </button>
        ))}
        <LabLink href="/financeiq/case-study/" className="tabs__tab tabs__tab--link">
          Case study →
        </LabLink>
      </div>

      {/* Panels stay mounted so a reconstruction can hand over to the console. */}
      <div id="panel-console" role="tabpanel" aria-labelledby="tab-console" className="tab-panel" hidden={tab !== "console"} tabIndex={0}>
        <div className="section-head">
          <h2>Experiment console</h2>
          <p>Configure a study and run it. Switch PIT mode off, or shuffle the folds, and watch the leakage audit fail.</p>
        </div>
        <ExperimentConsole runToken={runToken} />
      </div>

      <div id="panel-pipeline" role="tabpanel" aria-labelledby="tab-pipeline" className="tab-panel" hidden={tab !== "pipeline"} tabIndex={0}>
        <div className="section-head">
          <h2>Data pipeline</h2>
          <p>Each stage answers one question. Get any of them wrong and the future leaks into the past.</p>
        </div>
        <PipelineView />
      </div>

      <div id="panel-pit" role="tabpanel" aria-labelledby="tab-pit" className="tab-panel" hidden={tab !== "pit"} tabIndex={0}>
        <div className="section-head">
          <h2>Point-in-time reconstruction</h2>
          <p>
            A report describes a period but becomes available later. Drag the as-of date and compare what a naive dataset uses
            with what was actually knowable.
          </p>
        </div>
        <PitLab
          autoStart={reconstructToken}
          onRunExperiment={() => {
            openTab("console");
            setRunToken((n) => n + 1);
          }}
        />
      </div>

      <div id="panel-validation" role="tabpanel" aria-labelledby="tab-validation" className="tab-panel" hidden={tab !== "validation"} tabIndex={0}>
        <div className="section-head">
          <h2>Validation</h2>
          <p>Clean data is not enough. Validation must also respect time, and results must survive statistical scrutiny.</p>
        </div>
        <div className="validation">
          <WalkForward />
          <ul className="validation__rules">
            <li>
              <strong>Walk-forward, never shuffled.</strong> Each fold trains only on data before its test window.
            </li>
            <li>
              <strong>Embargo gap.</strong> A buffer between train and test stops overlapping horizons from leaking.
            </li>
            <li>
              <strong>Multiple-testing correction.</strong> Many hypotheses on one history will produce false winners.
            </li>
            <li>
              <strong>Leakage audit.</strong> Naive and PIT datasets are compared on the same dates; any difference is a fact used too early.
            </li>
            <li>
              <strong>Fingerprinted runs.</strong> Configuration, data version and seed identify every result.
            </li>
          </ul>
        </div>
      </div>

      <div id="panel-results" role="tabpanel" aria-labelledby="tab-results" className="tab-panel" hidden={tab !== "results"} tabIndex={0}>
        <div className="section-head">
          <h2>Results</h2>
          <p>What exists today — and the experiments that failed, kept on purpose.</p>
        </div>
        <ul className="results-list">
          {financeCaseStudy.result.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
        <div className="section-head section-head--spaced">
          <h2>Failed experiments</h2>
          <p>Negative evidence prevents repeated mistakes.</p>
        </div>
        <FailedExperiments />
        <div className="section-head section-head--spaced">
          <h2>Research decisions</h2>
        </div>
        <DecisionBrowser decisions={financeDecisions} />
      </div>
    </div>
  );
}
