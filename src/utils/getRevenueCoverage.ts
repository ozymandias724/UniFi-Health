export function getRevenueCoverage(
  revenue: number | null,
  expenses: number | null,
) {
  if (
    revenue == null ||
    expenses == null ||
    !Number.isFinite(revenue) ||
    !Number.isFinite(expenses) ||
    revenue <= 0 ||
    expenses < 0
  ) {
    return null;
  }

  const expenseShare = expenses / revenue;

  if (!Number.isFinite(expenseShare * 100)) {
    return null;
  }

  return {
    revenue,
    expenses,
    expenseShare,
    exceededRevenue: expenses > revenue,
    expenseWithinRevenue: Math.min(expenses, revenue),
    revenueAboveExpenses: Math.max(revenue - expenses, 0),
    overrunShare: Math.min(Math.max((expenses - revenue) / revenue, 0), 1),
  };
}
