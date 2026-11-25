import { MAX_COMPARISON_SELECTIONS } from "../config/comparison.ts";
import { SUPPORTED_YEARS } from "../config/reportingYears.ts";
import type { ComparisonSelection } from "../types/comparison.ts";
import { getComparisonKey } from "./getComparisonKey.ts";

export function serializeComparisonSelections(
  selections: ComparisonSelection[],
): string {
  return selections.map(getComparisonKey).join(",");
}

export function parseComparisonSelections(
  value: string | null,
): ComparisonSelection[] {
  if (!value) return [];

  const selections: ComparisonSelection[] = [];
  const seen = new Set<string>();

  for (const item of value.split(",")) {
    if (!/^\d+:\d{4}$/.test(item)) continue;

    const [unitid, year] = item.split(":").map(Number);

    if (!Number.isSafeInteger(unitid) || unitid <= 0) continue;

    if (!SUPPORTED_YEARS.some((supported) => supported === year)) {
      continue;
    }

    const selection = { unitid, year };
    const key = getComparisonKey(selection);

    if (seen.has(key)) continue;

    seen.add(key);
    selections.push(selection);

    if (selections.length >= MAX_COMPARISON_SELECTIONS) break;
  }

  return selections;
}
