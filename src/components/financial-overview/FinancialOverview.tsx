import type { FinanceRecord, VariableMetadata } from "../../services/ipeds";
import FinancialSummary from "./FinancialSummary";
import RevenueCoverageDonut from "./RevenueCoverageDonut";
import CategoryChart from "./CategoryChart";
import { revenueCategories, expenseCategories } from "./financeCategories";

interface FinancialOverviewProps {
  finances: FinanceRecord;
  variables: Record<string, VariableMetadata>;
}

function FinancialOverview({ finances, variables }: FinancialOverviewProps) {
  return (
    <>
      <RevenueCoverageDonut finances={finances} />

      <FinancialSummary finances={finances} />

      <section className="financial-overview-charts">
        <div className="container">
          <CategoryChart
            title="Revenue"
            finances={finances}
            variables={variables}
            categories={revenueCategories}
          />

          <CategoryChart
            title="Expenditures"
            finances={finances}
            variables={variables}
            categories={expenseCategories}
          />
        </div>
      </section>
    </>
  );
}

export default FinancialOverview;
