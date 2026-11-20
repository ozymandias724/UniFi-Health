import type { FinanceRecord } from "../../services/ipeds";
import { currencyFormatter, integerFormatter } from "../../utils/formatters";

interface FinancialSummaryProps {
  finances: FinanceRecord;
}

function FinancialSummary({ finances }: FinancialSummaryProps) {
  const metrics = [
    {
      label: "Total Revenue",
      value: finances.total_revenues_additions,
    },
    {
      label: "Total Expenses",
      value: finances.total_expenses_deductions,
    },
    {
      label: "Reported Net Income",
      value: finances.income_net,
    },
    {
      label: "Total Assets",
      value: finances.assets,
    },
    {
      label: "Total Liabilities",
      value: finances.liabilities,
    },
    {
      label: "Ending Endowment",
      value: finances.endowment_end,
    },
  ];

  return (
    <section className="financial-summary">
      <div className="container">
        <h3>Reported Financial Figures</h3>

        <dl className="financial-summary-metrics">
          {metrics.map(({ label, value }) => (
            <div key={label} className="financial-summary-metric">
              <dt>{label}</dt>
              <dd>{value == null ? "N/A" : currencyFormatter.format(value)}</dd>
            </div>
          ))}
        </dl>

        <p className="financial-summary-enrollment">
          Estimated full-time equivalent enrollment:{" "}
          <strong>
            {finances.est_fte == null
              ? "N/A"
              : integerFormatter.format(finances.est_fte)}
          </strong>
        </p>
      </div>
    </section>
  );
}

export default FinancialSummary;
