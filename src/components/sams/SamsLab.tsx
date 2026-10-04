"use client";

import { DecisionBrowser } from "@/components/records/DecisionBrowser";
import { LabLink } from "@/components/shell/LabLink";
import { TabBar } from "@/components/shell/TabBar";
import { samsCaseStudy, samsDecisions, samsSources } from "@/content/sams";
import { useHashTab } from "@/lib/useHashTab";
import { ArchitecturePath } from "./ArchitecturePath";
import { FailureDemo } from "./FailureDemo";

const TABS = ["demo", "architecture", "decisions"] as const;
type Tab = (typeof TABS)[number];
const LABELS: Record<Tab, string> = { demo: "Failure demo", architecture: "Architecture", decisions: "Engineering decisions" };

export function SamsLab() {
  const [tab, setTab] = useHashTab(TABS, "demo");

  return (
    <div className="lab lab--sams">
      <header className="lab-header">
        <div className="lab-header__id">
          <p className="lab-header__status mono">
            02 · Agent Systems Lab <span className="lab-header__dot" aria-hidden="true" /> Simulation ready
          </p>
          <h1 className="lab-header__name">
            SAMS <span className="lab-header__full">{samsCaseStudy.fullName}</span>
          </h1>
          <p className="lab-header__lede">{samsCaseStudy.oneLiner}</p>
        </div>
      </header>

      <TabBar
        tabs={TABS}
        labels={LABELS}
        active={tab}
        onSelect={setTab}
        label="SAMS views"
        trailing={
          <LabLink href="/sams/case-study/" className="tabs__tab tabs__tab--link">
            Case study →
          </LabLink>
        }
      />

      <div key={tab} id={`panel-${tab}`} role="tabpanel" aria-labelledby={`tab-${tab}`} className="tab-panel" tabIndex={-1}>
        {tab === "demo" ? <FailureDemo /> : null}
        {tab === "architecture" ? (
          <>
            <div className="section-head">
              <h2>Architecture</h2>
              <p>The same system as paths: what owns durable work, what owns durable state, how events reach a client and how it reconnects. Select a component to see why it exists and what it costs.</p>
            </div>
            <ArchitecturePath />
          </>
        ) : null}
        {tab === "decisions" ? (
          <>
            <div className="section-head">
              <h2>Engineering decisions</h2>
              <p>
                Each significant choice as a record: the need, the alternatives, the reason, the trade-off and the evidence. Evidence cites
                the public <a href={samsSources.evidence.href}>reliability evidence package</a>; its test results are historical.
              </p>
            </div>
            <DecisionBrowser decisions={samsDecisions} initial="B" kind="Engineering decision" />
          </>
        ) : null}
      </div>
    </div>
  );
}
