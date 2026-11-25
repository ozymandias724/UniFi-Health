export const REPORTING_FIELDS = [
  "parent_child_flag",
  "parent_child_system_flag",
  "parent_unitid",
  "reporting_form",
] as const;

export const FINANCIAL_FIELDS = [
  "total_revenues_additions",
  "total_expenses_deductions",
  "rev_total_current",
  "exp_total_current",
  "assets",
  "liabilities",
  "equity_end",
] as const;

export const SUMMARY_FIELDS = [
  ...REPORTING_FIELDS,
  ...FINANCIAL_FIELDS,
] as const;

export type FinanceSummaryField = (typeof SUMMARY_FIELDS)[number];