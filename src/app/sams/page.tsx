import type { Metadata } from "next";
import { SamsLab } from "@/components/sams/SamsLab";
import { samsCaseStudy } from "@/content/sams";

export const metadata: Metadata = {
  title: "SAMS — Agent Systems Lab",
  description: samsCaseStudy.oneLiner,
};

export default function SamsPage() {
  return <SamsLab />;
}
