// 
export function getFinanceColor(ratio: number | null): string {
  if (ratio === null) return "#94a3b8";

  if (ratio >= 120) return "#16a34a";
  if (ratio >= 105) return "#84cc16";
  if (ratio >= 95) return "#eab308";
  if (ratio >= 80) return "#f97316";

  return "#dc2626";
}
