import type { Metadata } from "next";
import { CaseStudy } from "@/components/casestudy/CaseStudy";
import { ArchitectureFigure } from "@/components/sams/ArchitectureFigure";
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
      architecture={<ArchitectureFigure fig="1" />}
    />
  );
}
