"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { DecisionBrowser } from "@/components/records/DecisionBrowser";
import { LabLink } from "@/components/shell/LabLink";
import { samsCaseStudy, samsDecisions } from "@/content/sams";
import { useHashTab } from "@/lib/useHashTab";
import { AgentTopology } from "./AgentTopology";
import { ArchitectureView } from "./ArchitectureView";

const ObserveSystem = dynamic(() => import("./ObserveSystem"), { ssr: false });

const TABS = ["live", "architecture", "engineering"] as const;
type Tab = (typeof TABS)[number];
const LABELS: Record<Tab, string> = { live: "Live system", architecture: "Architecture", engineering: "Engineering" };

export function SamsLab() {
  const [tab, setTab] = useHashTab(TABS, "live");
  const [observing, setObserving] = useState(false);

  return (
    <div className="lab">
      <header className="lab-header">
        <div>
          <p className="eyebrow eyebrow--signal">02 — Agent Systems Lab</p>
          <h1 className="lab-header__name">SAMS</h1>
          <p className="lab-header__full">{samsCaseStudy.fullName}</p>
        </div>
        <div className="lab-header__actions">
          <button type="button" className="btn" onClick={() => setObserving(true)} aria-haspopup="dialog">
            Observe system
          </button>
          <LabLink href="/sams/case-study/" className="btn btn--research">
            Case study
          </LabLink>
        </div>
      </header>

      <p className="lab-lede">{samsCaseStudy.oneLiner}</p>

      <div className="tabs" role="tablist" aria-label="SAMS views">
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
        <LabLink href="/sams/case-study/" className="tabs__tab tabs__tab--link">
          Case study →
        </LabLink>
      </div>

      <div key={tab} id={`panel-${tab}`} role="tabpanel" aria-labelledby={`tab-${tab}`} className="tab-panel" tabIndex={0}>
        {tab === "live" ? (
          <>
            <div className="section-head">
              <h2>Live system</h2>
              <p>Watch a task move through the agents. Messages travel along the edges; every step lands in the activity feed.</p>
            </div>
            <AgentTopology />
          </>
        ) : null}
        {tab === "architecture" ? (
          <>
            <div className="section-head">
              <h2>Architecture</h2>
              <p>The same system, seen as engineering components. Select one to see why it exists and what it is responsible for.</p>
            </div>
            <ArchitectureView />
          </>
        ) : null}
        {tab === "engineering" ? (
          <>
            <div className="section-head">
              <h2>Engineering decisions</h2>
              <p>Each significant choice is kept as a record: the problem, the options, the reason, the trade-off and the evidence.</p>
            </div>
            <DecisionBrowser decisions={samsDecisions} initial="017" />
          </>
        ) : null}
      </div>

      {observing ? <ObserveSystem onClose={() => setObserving(false)} /> : null}
    </div>
  );
}
