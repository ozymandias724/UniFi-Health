import type { FinanceSummaryField } from "../config/financeSummaryFields.ts";

export interface UniversityFinanceSummary
  extends Record<FinanceSummaryField, number | null> {
  unitid: number;
  year: number;
}