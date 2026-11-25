export function getRevenueExpenseRatio(
  revenue: number | null,
  expenses: number | null,
): number | null {
  if (
    revenue === null ||
    expenses === null ||
    !Number.isFinite(revenue) ||
    !Number.isFinite(expenses) ||
    revenue < 0 ||
    expenses <= 0
  ) {
    return null;
  }

  const ratio = (revenue / expenses) * 100;

  return Number.isFinite(ratio) ? ratio : null;
}