/**
 * Formats IPEDS financial-record values for display in the Explorer.
 *
 * Field-specific overrides and API metadata determine whether a value is a
 * monetary amount, count, percentage, ratio, or coded response. The formatter
 * also translates documented missing-value codes and categorical labels.
 *
 * Classification is intentionally conservative: unknown numeric fields are
 * not assumed to represent dollars, and source percentage scales are retained.
 * This module changes presentation only; it does not normalize API values.
 */
import type { VariableMetadata } from "../types/metadata.ts";
import {
  integerFormatter,
  decimalFormatter,
  currencyFormatter,
} from "./formatters.ts";

import { getCodeLabel } from "./getCodeLabel.ts";

// The display formats supported by the classifier below.
type FinanceValueKind =
  | "currency"
  | "integer"
  | "decimal"
  | "percent"
  | "ratio"
  | "code";

// Known fields override the broader metadata and category-based rules.
const fieldKinds: Record<string, FinanceValueKind> = {
  unitid: "integer",
  year: "integer",
  fips: "code",
  parent_unitid: "integer",
  est_fte: "integer",
};

// These existing UI groups predominantly contain monetary measurements.
const financialCategories = new Set([
  "Financial Summary",
  "Revenue",
  "Expenditures",
  "Assets",
  "Endowments & Investments",
  "Pensions",
  "Liabilities & Debt",
  "Property & Equipment",
  "Equity & Net Position",
  "Scholarships and Financial Aid",
  "Taxes",
]);

// Human-readable labels for IPEDS sentinel values when metadata confirms them.
const missingCodes: Record<number, string> = {
  [-1]: "Not reported",
  [-2]: "Not applicable",
  [-3]: "Suppressed",
};

// Apply the most specific classification rules before general fallbacks.
function getValueKind(
  key: string,
  category: string,
  metadata?: VariableMetadata,
): FinanceValueKind {
  if (Object.hasOwn(fieldKinds, key)) {
    return fieldKinds[key];
  }

  // Non-numeric formats (including yes_no) encode categories, not amounts.
  if (metadata?.format && !["numeric", "string"].includes(metadata.format)) {
    return "code";
  }

  // Labels and suffixes distinguish ratios/percentages from dollar amounts.
  const label = metadata?.label.toLowerCase() ?? "";
  if (key.endsWith("_ratio") || /\bratio\b|\bshare of\b/.test(label))
    return "ratio";
  if (key.endsWith("_pct") || /\bpercent(age)?\b/.test(label)) return "percent";
  if (category === "Enrollment") return "integer";
  if (category === "Economic Indicators") return "decimal";
  if (financialCategories.has(category)) return "currency";

  // Unknown numeric fields are numbers, not automatically dollars.
  return metadata?.data_type === "integer" ? "integer" : "decimal";
}

// Public entry point used by the financial-data display.
export function formatFinanceValue(
  key: string,
  value: number | null,
  category: string,
  metadata?: VariableMetadata,
): string {
  if (value === null || value === undefined || !Number.isFinite(value))
    return "N/A";

  // Classify first, then look up a possible human-readable coded response.
  const kind = getValueKind(key, category, metadata);

  const codeLabel =
    kind === "code" ||
    (kind !== "currency" && Object.hasOwn(missingCodes, value))
      ? getCodeLabel(metadata?.values, value)
      : undefined;

  // IPEDS documents these special codes. For financial measurements a small
  // negative value could also be real, so don't reinterpret it as missing.
  if (kind === "code" && codeLabel) return codeLabel;
  if (kind !== "currency" && value in missingCodes && codeLabel) {
    return missingCodes[value];
  }

  // Foundational identifiers should never use thousands separators.
  if (key === "unitid" || key === "year" || key === "parent_unitid") {
    return String(value);
  }

  switch (kind) {
    case "code":
      return codeLabel ?? integerFormatter.format(value);
    case "currency":
      return currencyFormatter.format(value);
    case "integer":
      return integerFormatter.format(value);
    case "percent":
      // Source metadata doesn't specify whether percentages are 0–1 or 0–100.
      // Preserve the original numeric scale rather than multiplying by 100.
      return `${decimalFormatter.format(value)}%`;
    case "ratio":
    case "decimal":
      return decimalFormatter.format(value);
  }
}
