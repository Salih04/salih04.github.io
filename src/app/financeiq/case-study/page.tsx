import type { Metadata } from "next";
import { CaseStudy } from "@/components/casestudy/CaseStudy";
import { FailedExperiments } from "@/components/financeiq/FailedExperiments";
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
      architecture={
        <>
          <PipelineView />
          <WalkForward />
          <h3 className="cs-subhead">Failed experiments</h3>
          <FailedExperiments />
        </>
      }
    />
  );
}
