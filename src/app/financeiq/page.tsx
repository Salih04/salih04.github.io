import type { Metadata } from "next";
import { FinanceLab } from "@/components/financeiq/FinanceLab";
import { financeCaseStudy } from "@/content/financeiq";

export const metadata: Metadata = {
  title: "FinanceIQ — Market Data Research Lab",
  description: financeCaseStudy.oneLiner,
};

export default function FinancePage() {
  return <FinanceLab />;
}
