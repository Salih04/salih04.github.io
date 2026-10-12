import type { Metadata } from "next";
import { ProjectReport } from "@/components/casestudy/ProjectReport";
import { samsReport } from "@/content/reports";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata("/sams/case-study/");

export default function SamsCaseStudyPage() {
  return <ProjectReport report={samsReport} />;
}
