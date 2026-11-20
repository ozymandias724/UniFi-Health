import type { FinanceRecord, VariableMetadata } from "../services/ipeds";
import { getFinanceCategory } from "../utils/getFinanceCategory";
import { formatFinanceValue } from "../utils/formatFinanceValue";
import { formatFinanceLabel } from "../utils/formatFinanceLabel";

interface UniversityFinancesProps {
  finances: FinanceRecord;
  variables: Record<string, VariableMetadata>;
}

type FinanceEntry = [string, number | null];
type GroupedFinances = Record<string, FinanceEntry[]>;

function UniversityFinances({ finances, variables }: UniversityFinancesProps) {
  // Group financial fields by category, excluding administrative metadata.
  const groupedFinances = Object.entries(finances).reduce<GroupedFinances>(
    (groups, [key, value]) => {
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
    },
    {},
  );

  return (
    <section className="university-finances">
      <div className="container">
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
    </section>
  );
}

export default UniversityFinances;
