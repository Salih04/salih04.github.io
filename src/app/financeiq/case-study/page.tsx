import type { Metadata } from "next";
import { ProjectReport } from "@/components/casestudy/ProjectReport";
import { financeReport } from "@/content/reports";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata("/financeiq/case-study/");

export default function FinanceCaseStudyPage() {
  return <ProjectReport report={financeReport} />;
}
