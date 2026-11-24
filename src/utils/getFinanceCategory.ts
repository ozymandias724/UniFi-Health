export function getFinanceCategory(key: string, label: string): string {
  const name = label.toLowerCase();

  // Financial summary
  if (
    key === "total_revenues_additions" ||
    key === "total_expenses_deductions" ||
    key === "income_net"
  ) {
    return "Financial Summary";
  }

  // Primary financial categories
  if (key.startsWith("rev_")) return "Revenue";
  if (key.startsWith("exp_")) return "Expenditures";
  if (key.startsWith("sch_")) return "Scholarships and Financial Aid";

  // Endowments and investments
  if (name.includes("endowment") || name.includes("investments")) {
    return "Endowments & Investments";
  }

  // Assets
  if (key.includes("asset") || name.startsWith("assets:")) {
    return "Assets";
  }

  // Pensions
  if (name.includes("pension")) {
    return "Pensions";
  }

  // Liabilities and debt
  if (
    name.includes("liabilit") ||
    name.includes("debt") ||
    name.includes("deferred inflows") ||
    name.includes("deferred outflows")
  ) {
    return "Liabilities & Debt";
  }

  // Property and equipment
  if (
    name.includes("property, plant, and equipment") ||
    name.includes("depreciation")
  ) {
    return "Property & Equipment";
  }

  // Equity and net position
  if (name.includes("equity") || name.includes("net position")) {
    return "Equity & Net Position";
  }

  // Enrollment
  if (name.includes("full-time equivalent enrollment")) {
    return "Enrollment";
  }

  // Economic indicators
  if (name.includes("price index") || name.includes("cost adjustment")) {
    return "Economic Indicators";
  }

  // Institution information
  if (["unitid", "year", "fips"].includes(key) || key.startsWith("parent_")) {
    return "Institution Information";
  }

  // Reporting and accounting
  if (
    key.startsWith("reporting_") ||
    key === "form_type" ||
    key.startsWith("gasb_") ||
    key.endsWith("_treatment")
  ) {
    return "Reporting & Accounting";
  }

  // Taxes
  if (key.startsWith("income_tax_")) {
    return "Taxes";
  }

  // Everything not yet classified
  return "Other";
}
