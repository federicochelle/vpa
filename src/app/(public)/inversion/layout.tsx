import type { ReactNode } from "react";
import { InvestorResidencyGate } from "@/features/investor-residency/investor-residency-gate";

export default function InvestmentLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <InvestorResidencyGate />
      {children}
    </>
  );
}
