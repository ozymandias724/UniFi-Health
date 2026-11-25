export function getClusterFinance(
  ratios: readonly (number | null)[],
) {
  let deficitCount = 0;
  let validCount = 0;

  for (const ratio of ratios) {
    if (
      ratio === null ||
      !Number.isFinite(ratio) ||
      ratio < 0
    ) {
      continue;
    }

    validCount++;

    if (ratio < 100) {
      deficitCount++;
    }
  }

  const deficitPercentage =
    validCount > 0
      ? (deficitCount / validCount) * 100
      : null;

  const color =
    deficitPercentage === null
      ? "#94a3b8"
      : deficitPercentage >= 80
        ? "#dc2626"
        : deficitPercentage >= 60
          ? "#f97316"
          : deficitPercentage >= 40
            ? "#eab308"
            : deficitPercentage >= 20
              ? "#84cc16"
              : "#16a34a";

  return {
    validCount,
    deficitCount,
    deficitPercentage,
    color,
  };
}