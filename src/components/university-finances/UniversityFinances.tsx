/** Coordinates the detailed IPEDS financial data display. */
import type { FinanceRecord } from "../../types/finance.ts";
import type { VariableMetadata } from "../../types/metadata.ts";
import { useMemo } from "react";

import { groupFinances } from "../../utils/groupFinances";
import FinanceCategory from "./FinanceCategory";
// import FinanceDebug from "./FinanceDebug";

interface UniversityFinancesProps {
  finances: FinanceRecord;
  variables: Record<string, VariableMetadata>;
}

function UniversityFinances({ finances, variables }: UniversityFinancesProps) {
  const sections = useMemo(
    () => groupFinances(finances, variables),
    [finances, variables],
  );

  return (
    <section className="university-finances">
      <div className="container">
        <h3>Financial Data ({finances.year})</h3>

        {/* <FinanceDebug finances={finances} variables={variables} /> */}

        {sections.map((section) => (
          <FinanceCategory
            key={section.title}
            section={section}
            variables={variables}
          />
        ))}
      </div>
    </section>
  );
}

export default UniversityFinances;
