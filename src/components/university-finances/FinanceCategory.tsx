/*
 * Renders native, keyboard-accessible accordions for financial categories
 * and their subgroups. Revenue opens initially; subgroups start collapsed.
 * Existing field formatting and grouping are unchanged.
 */
import type { VariableMetadata } from "../../types/metadata.ts";
import type { FinanceSection } from "../../utils/groupFinances";
import { formatFinanceValue } from "../../utils/formatFinanceValue";
import { formatFinanceLabel } from "../../utils/formatFinanceLabel";

interface FinanceCategoryProps {
  section: FinanceSection;
  variables: Record<string, VariableMetadata>;
}

function FinanceCategory({ section, variables }: FinanceCategoryProps) {
  return (
    <details className="finance-category" open={section.title === "Revenue"}>
      <summary className="finance-category-toggle">
        <h4>{section.title}</h4>
      </summary>

      <div className="finance-category-content">
        {section.description && (
          <p className="finance-category-description">{section.description}</p>
        )}

        {section.groups.map((group) => (
          <details className="finance-group" key={group.title}>
            <summary className="finance-group-toggle">
              <h5>{group.title}</h5>
            </summary>

            <div className="finance-group-content">
              {group.description && (
                <p className="finance-group-description">{group.description}</p>
              )}

              <dl className="finance-category-fields">
                {group.fields.map(([key, value]) => (
                  <div
                    key={key}
                    className={`finance-field${value === null ? " hidden" : ""}`}
                  >
                    <dt>
                      {formatFinanceLabel(
                        variables[key]?.label ?? key,
                        section.title,
                      )}
                    </dt>
                    <dd>
                      {formatFinanceValue(
                        key,
                        value,
                        section.title,
                        variables[key],
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </details>
        ))}
      </div>
    </details>
  );
}

export default FinanceCategory;
