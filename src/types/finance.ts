export interface UniversityFinanceSummary {
  unitid: number;
  year: number;

  // Reporting relationships
  parent_child_flag: number | null;
  parent_child_system_flag: number | null;
  parent_unitid: number | null;
  reporting_form: number | null;

  // Financial totals
  total_revenues_additions: number | null;
  total_expenses_deductions: number | null;
  rev_total_current: number | null;
  exp_total_current: number | null;

  // Balance sheet
  assets: number | null;
  liabilities: number | null;
  equity_end: number | null;
}