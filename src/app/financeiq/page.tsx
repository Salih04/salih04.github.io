import type { Metadata } from "next";
import { FinanceLab } from "@/components/financeiq/FinanceLab";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata("/financeiq/");

export default function FinancePage() {
  return <FinanceLab />;
}
