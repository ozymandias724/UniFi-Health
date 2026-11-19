import type { FinanceRecord, VariableMetadata } from "../services/ipeds";
import { getFinanceCategory } from "../utils/getFinanceCategory";
import {
  integerFormatter,
  decimalFormatter,
  currencyFormatter,
} from "../utils/formatters";
import { formatFinanceLabel } from "../utils/formatFinanceLabel";

interface UniversityFinancesProps {
  finances: FinanceRecord;
  variables: Record<string, VariableMetadata>;
}

function formatFinanceValue(
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

function UniversityFinances({ finances, variables }: UniversityFinancesProps) {
  // Group financial fields by category, excluding administrative metadata.
  const groupedFinances = Object.entries(finances).reduce<
    Record<string, [string, number | null][]>
  >((groups, [key, value]) => {
    const category = getFinanceCategory(key, variables[key]?.label ?? key);

    if (
      category === "Institution Information" ||
      category === "Reporting & Accounting"
    ) {
      return groups;
    }

    if (!groups[category]) {
      groups[category] = [];
    }

    groups[category].push([key, value]);

    return groups;
  }, {});

  return (
    <div className="university-finances">
      <h3>Financial Data ({finances.year})</h3>

      {Object.entries(groupedFinances).map(([category, fields]) => (
        <section key={category} className="finance-category">
          <h4>{category}</h4>

          <dl className="finance-category-fields">
            {fields.map(([key, value]) => (
              <div
                key={key}
                className={`finance-field${value === null ? " hidden" : ""}`}
              >
                <dt>
                  {formatFinanceLabel(variables[key]?.label ?? key, category)}
                </dt>
                <dd>{formatFinanceValue(key, value, category)}</dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
    </div>
  );
}

export default UniversityFinances;
