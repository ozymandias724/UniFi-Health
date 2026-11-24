/**
 * Developer-only inspection of selected IPEDS reporting fields.
 * Receives the same record and metadata as UniversityFinances.
 */
import { useEffect } from "react";
import type { FinanceRecord, VariableMetadata } from "../../services/ipeds";
import { financeFields } from "../../config/financeFields";
import { getFinanceCategory } from "../../utils/getFinanceCategory";

interface FinanceDebugProps {
  finances: FinanceRecord;
  variables: Record<string, VariableMetadata>;
}

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
      status: !exists ? "Missing" : value == null ? "Null" : "Populated",
    };
  });
}

function FinanceDebug({ finances, variables }: FinanceDebugProps) {
  const inspectedFields = inspectFinancialReporting(finances, variables);

  // Compare the actual record with the configured field keys, including
  // fields that fall into entirely unconfigured categories.
  const auditUnconfiguredFields = () => {
    const configuredKeys = new Set(
      Object.values(financeFields).flatMap((section) =>
        section.groups.flatMap((group) => [...group.fields]),
      ),
    );

    const rows = Object.entries(finances)
      .filter(([key]) => !configuredKeys.has(key))
      .map(([key, value]) => ({
        Category: getFinanceCategory(key, variables[key]?.label ?? key),
        Key: key,
        Label: variables[key]?.label ?? key,
        Value: value,
        Status: value === null ? "Null" : "Populated",
      }));

    console.group(
      `IPEDS unconfigured fields — UNITID ${finances.unitid} (${finances.year})`,
    );
    console.info(`${rows.length} unconfigured fields`);
    console.table(rows);
    console.groupEnd();
  };

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

  return (
    <details className="finance-debug">
      <summary>Data Inspection</summary>

      <button type="button" onClick={auditUnconfiguredFields}>
        Audit unconfigured fields (console)
      </button>

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
  );
}

export default FinanceDebug;
