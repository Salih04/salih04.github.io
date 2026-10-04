import type { Metadata } from "next";
import { CaseStudy } from "@/components/casestudy/CaseStudy";
import { NegativeResults } from "@/components/financeiq/NegativeResults";
import { PipelineView } from "@/components/financeiq/PipelineView";
import { WalkForward } from "@/components/financeiq/WalkForward";
import { financeCaseStudy } from "@/content/financeiq";

export const metadata: Metadata = {
  title: "FinanceIQ — Case Study",
  description: financeCaseStudy.oneLiner,
};

export default function FinanceCaseStudyPage() {
  return (
    <CaseStudy
      study={financeCaseStudy}
      labHref="/financeiq/"
      accent="research"
      decisionKind="Research decision"
      architecture={
        <>
          <PipelineView fig="1" />
          <WalkForward fig="2" />
          <h3 className="cs-subhead">Negative results</h3>
          <NegativeResults />
        </>
      }
    />
  );
}
