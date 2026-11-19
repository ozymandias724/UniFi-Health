import type { FinanceRecord } from "../../services/ipeds";

export type FinanceCategoryKey = keyof FinanceRecord;

// Selected financial fields for visualization.
// Labels come from variables.json rather than being hardcoded here.

export const revenueCategories = [
  "rev_tuition_fees_net",
  "rev_appropriations_state",
  "rev_fed_approps_grants",
  "rev_gifts_grants_contracts",
  "rev_auxiliary_enterprises_net",
  "rev_investment_return",
] as const satisfies readonly FinanceCategoryKey[];

export const expenseCategories = [
  "exp_instruc_total",
  "exp_research_total",
  "exp_pub_serv_total",
  "exp_acad_supp_total",
  "exp_student_serv_total",
  "exp_inst_supp_total",
  "exp_aux_ent_total",
] as const satisfies readonly FinanceCategoryKey[];
