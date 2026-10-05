import type { Metadata } from "next";
import { SamsLab } from "@/components/sams/SamsLab";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata("/sams/");

export default function SamsPage() {
  return <SamsLab />;
}
