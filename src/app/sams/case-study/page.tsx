import type { Metadata } from "next";
import { CaseStudy } from "@/components/casestudy/CaseStudy";
import { ArchitectureView } from "@/components/sams/ArchitectureView";
import { samsCaseStudy } from "@/content/sams";

export const metadata: Metadata = {
  title: "SAMS — Case Study",
  description: samsCaseStudy.oneLiner,
};

export default function SamsCaseStudyPage() {
  return (
    <CaseStudy
      study={samsCaseStudy}
      labHref="/sams/"
      decisionKind="Engineering decision"
      architecture={<ArchitectureView compact fig="1" />}
    />
  );
}
