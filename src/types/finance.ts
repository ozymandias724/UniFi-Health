import type { FinanceSummaryField } from "../config/financeSummaryFields.ts";

export interface UniversityFinanceSummary
  extends Record<FinanceSummaryField, number | null> {
  unitid: number;
  year: number;
}

// Financial data for one university in one reporting year
export interface FinanceRecord {
  [key: string]: number | null;

  unitid: number;
  year: number;

  // Financial overview
  total_revenues_additions: number | null;
  total_expenses_deductions: number | null;
  income_net: number | null;

  // Assets and liabilities
  assets: number | null;
  liabilities: number | null;
  endowment_end: number | null;

  // Enrollment
  est_fte: number | null;

  // Revenue
  rev_tuition_fees_net: number | null;
  rev_appropriations_state: number | null;
  rev_fed_approps_grants: number | null;
  rev_gifts_grants_contracts: number | null;
  rev_auxiliary_enterprises_net: number | null;
  rev_investment_return: number | null;

  // Expenditures
  exp_instruc_total: number | null;
  exp_research_total: number | null;
  exp_pub_serv_total: number | null;
  exp_acad_supp_total: number | null;
  exp_student_serv_total: number | null;
  exp_inst_supp_total: number | null;
  exp_aux_ent_total: number | null;
}