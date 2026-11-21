export function getRevenueExpenseRatio(
  revenue: number | null,
  expenses: number | null,
): number | null {
  if (revenue === null || expenses === null || expenses <= 0) {
    return null;
  }

  return (revenue / expenses) * 100;
}