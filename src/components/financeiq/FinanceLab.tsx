"use client";

import { useState } from "react";
import { DecisionBrowser } from "@/components/records/DecisionBrowser";
import { LabLink } from "@/components/shell/LabLink";
import { TabBar } from "@/components/shell/TabBar";
import { financeCaseStudy, financeDecisions, financeSources } from "@/content/financeiq";
import { useHashTab } from "@/lib/useHashTab";
import { ExperimentBench } from "./ExperimentBench";
import { NegativeResults } from "./NegativeResults";
import { PipelineView } from "./PipelineView";
import { PitLab } from "./PitLab";
import { WalkForward } from "./WalkForward";

const TABS = ["pit", "bench", "validation", "pipeline", "results"] as const;
type Tab = (typeof TABS)[number];
const LABELS: Record<Tab, string> = {
  pit: "Point-in-time reconstruction",
  bench: "Experiment bench",
  validation: "Validation",
  pipeline: "Data pipeline",
  results: "Results",
};

export function FinanceLab() {
  const [tab, setTab] = useHashTab(TABS, "pit");
  const [runToken, setRunToken] = useState(0);

  const openTab = (t: Tab) => {
    setTab(t);
    document.getElementById("financeiq-tabs")?.scrollIntoView({ block: "start" });
  };

  return (
    <div className="lab lab--research">
      <header className="lab-header">
        <div className="lab-header__id">
          <p className="lab-header__status mono">
            03 · Market Data Research Lab <span className="lab-header__dot" aria-hidden="true" /> In progress
          </p>
          <h1 className="lab-header__name">
            FinanceIQ <span className="lab-header__full">{financeCaseStudy.fullName}</span>
          </h1>
          <p className="lab-header__lede">{financeCaseStudy.oneLiner}</p>
        </div>
        <div className="lab-header__actions">
          <LabLink href="/financeiq/case-study/" className="btn btn--ghost">
            Case study
          </LabLink>
        </div>
      </header>

      <div id="financeiq-tabs">
        <TabBar
          tabs={TABS}
          labels={LABELS}
          active={tab}
          onSelect={setTab}
          label="FinanceIQ views"
          trailing={
            <LabLink href="/financeiq/case-study/" className="tabs__tab tabs__tab--link">
              Case study →
            </LabLink>
          }
        />
      </div>

      {/* Panels stay mounted so a reconstruction can hand over to the bench. */}
      <div id="panel-pit" role="tabpanel" aria-labelledby="tab-pit" className="tab-panel" hidden={tab !== "pit"} tabIndex={-1}>
        <PitLab
          onRunExperiment={() => {
            openTab("bench");
            setRunToken((n) => n + 1);
          }}
          onOpenResults={() => openTab("results")}
        />
      </div>

      <div id="panel-bench" role="tabpanel" aria-labelledby="tab-bench" className="tab-panel" hidden={tab !== "bench"} tabIndex={-1}>
        <div className="section-head">
          <h2>Experiment bench</h2>
          <p>Write a specification and run it. Switch the dataset to naive values, or shuffle the folds, and watch the leakage audit fail.</p>
        </div>
        <ExperimentBench runToken={runToken} />
      </div>

      <div id="panel-validation" role="tabpanel" aria-labelledby="tab-validation" className="tab-panel" hidden={tab !== "validation"} tabIndex={-1}>
        <div className="section-head">
          <h2>Validation</h2>
          <p>Clean data is not enough. Evaluation must also respect time, and a result must survive comparison with chance.</p>
        </div>
        <div className="validation">
          <WalkForward />
          <ul className="validation__rules">
            <li>
              <strong>Walk-forward, never shuffled.</strong> Each fold trains only on data before its test window.
            </li>
            <li>
              <strong>Compared with chance.</strong> A permutation null shows what the score looks like when there is no signal.
            </li>
            <li>
              <strong>Corrected for the models tried.</strong> Many models on one history will produce false winners.
            </li>
            <li>
              <strong>Read against power.</strong> With few test years, only large effects are detectable; a null means &ldquo;no large edge&rdquo;.
            </li>
            <li>
              <strong>Leakage audit.</strong> Naive and point-in-time data are compared on the same dates; any difference is a fact used too early.
            </li>
          </ul>
        </div>
      </div>

      <div id="panel-pipeline" role="tabpanel" aria-labelledby="tab-pipeline" className="tab-panel" hidden={tab !== "pipeline"} tabIndex={-1}>
        <div className="section-head">
          <h2>Data pipeline</h2>
          <p>The target design of the in-progress project. Each stage answers one question; get any of them wrong and the future leaks into the past.</p>
        </div>
        <PipelineView />
      </div>

      <div id="panel-results" role="tabpanel" aria-labelledby="tab-results" className="tab-panel" hidden={tab !== "results"} tabIndex={-1}>
        <div className="section-head">
          <h2>Negative results</h2>
          <p>
            Kept on purpose. Documented records are quoted from the{" "}
            <a href={financeSources.repository.href}>public FinanceIQ repository</a>; the illustration is labelled as one.
          </p>
        </div>
        <NegativeResults />
        <div className="section-head section-head--spaced">
          <h2>Research decisions</h2>
          <p>Each with its status: applied in the public repository, a design direction of the in-progress project, or an open problem.</p>
        </div>
        <DecisionBrowser decisions={financeDecisions} kind="Research decision" />
      </div>
    </div>
  );
}
