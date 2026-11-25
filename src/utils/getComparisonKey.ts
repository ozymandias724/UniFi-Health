import type { ComparisonSelection } from "../types/comparison.ts";

export function getComparisonKey(selection: ComparisonSelection): string {
  return `${selection.unitid}:${selection.year}`;
}