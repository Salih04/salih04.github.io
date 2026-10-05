import type { Metadata } from "next";
import { CaseStudy } from "@/components/casestudy/CaseStudy";
import { ArchitectureFigure } from "@/components/sams/ArchitectureFigure";
import { samsCaseStudy } from "@/content/sams";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata("/sams/case-study/");

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
