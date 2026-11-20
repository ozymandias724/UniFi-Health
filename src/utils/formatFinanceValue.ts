import {
  integerFormatter,
  decimalFormatter,
  currencyFormatter,
} from "../utils/formatters";
//
export function formatFinanceValue(
  key: string,
  value: number | null,
  category: string,
): string {
  if (value === null) return "N/A";

  // Fields representing people rather than money
  if (category === "Enrollment") {
    return integerFormatter.format(value);
  }

  // Economic indices and other nonmonetary measurements
  if (category === "Economic Indicators") {
    return decimalFormatter.format(value);
  }

  // Individual fields requiring special formatting
  switch (key) {
    case "own_endowment_assets":
      return value === 1 ? "Yes" : value === 0 ? "No" : "N/A";
  }

  // All remaining financial values are assumed to be monetary
  return currencyFormatter.format(value);
}
