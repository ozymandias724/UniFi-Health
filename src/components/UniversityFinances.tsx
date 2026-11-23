
import { useEffect } from "react";
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

// Fields we're investigating for financial health and reporting.
const fieldsToInspect = [
  // Institution information
  "unitid",
  "year",
  "parent_child_flag",
  "parent_child_system_flag",
  "parent_unitid",
  "parent_child_allocation",
  "reporting_form",
  "form_type",

  // Revenue and expenditure totals
  "total_revenues_additions",
  "total_expenses_deductions",
  "rev_total_current",
  "exp_total_current",

  // Revenue and expenditure details
  "rev_operating",
  "rev_nonoperating",
  "rev_tuition_fees_net",
  "exp_instruc_total",

  // Income and equity
  "income_net",
  "equity_beg",
  "equity_end",
  "net_position_beginning",
  "net_position_end",

  // Assets and liabilities
  "assets",
  "liabilities",
  "net_assets_unrest",
  "longterm_debt",
  "plant_prop_equip_debt",
] as const;

type InspectedField = {
  key: string;
  label: string;
  value: unknown;
  status: "Missing" | "Null" | "Populated";
};

// Reusable inspection function for any institution.
function inspectFinancialReporting(
  finances: FinanceRecord,
  variables: Record<string, VariableMetadata>,
): InspectedField[] {
  const record = finances as unknown as Record<string, unknown>;

  return fieldsToInspect.map((key) => {
    const exists = Object.prototype.hasOwnProperty.call(record, key);
    const value = record[key];

    return {
      key,
      label: variables[key]?.label ?? key,
      value: exists ? value : undefined,
      status: !exists
        ? "Missing"
        : value == null
          ? "Null"
          : "Populated",
    };
  });
}

function UniversityFinances({ finances, variables }: UniversityFinancesProps) {
  const inspectedFields = inspectFinancialReporting(finances, variables);

  // Log the same inspection data to the browser console.
  useEffect(() => {
    const fields = inspectFinancialReporting(finances, variables);

    console.group(
      `IPEDS Financial Reporting — UNITID ${finances.unitid} (${finances.year})`,
    );

    console.table(
      fields.map(({ key, label, value, status }) => ({
        Variable: key,
        Label: label,
        Value: value === undefined ? "—" : value,
        Status: status,
      })),
    );

    console.groupEnd();
  }, [finances, variables]);

  // Group financial fields by category, excluding administrative metadata.
  const groupedFinances = Object.entries(finances).reduce<GroupedFinances>(
    (groups, [key, value]) => {
      const category = getFinanceCategory(key, variables[key]?.label ?? key);

      // Temporarily include administrative metadata for debugging.
      // if (
      //   category === "Institution Information" ||
      //   category === "Reporting & Accounting"
      // ) {
      //   return groups;
      // }

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

        <details className="finance-debug">
          <summary>Data Inspection</summary>

          <table>
            <thead>
              <tr>
                <th>Variable</th>
                <th>Label</th>
                <th>Value</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {inspectedFields.map(({ key, label, value, status }) => (
                <tr key={key}>
                  <td>
                    <code>{key}</code>
                  </td>

                  <td>{label}</td>

                  <td>
                    {status === "Missing"
                      ? "—"
                      : value === null || value === undefined
                        ? "null"
                        : JSON.stringify(value)}
                  </td>

                  <td>{status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </details>

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
                    {formatFinanceLabel(
                      variables[key]?.label ?? key,
                      category,
                    )}
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
