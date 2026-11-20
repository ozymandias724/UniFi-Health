import { Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import type { FinanceRecord } from "../../services/ipeds";
import { currencyFormatter, percentageFormatter } from "../../utils/formatters";

interface RevenueCoverageDonutProps {
  finances: FinanceRecord;
}

function RevenueCoverageDonut({ finances }: RevenueCoverageDonutProps) {
  const revenue = finances.total_revenues_additions;
  const expenses = finances.total_expenses_deductions;

  // ! TEST ONLY: Simulate expenses at 125% of revenue
  // const expenses = revenue !== null ? revenue * 1.25 : null;

  if (revenue == null || expenses == null || revenue <= 0 || expenses < 0) {
    return (
      <section className="revenue-coverage">
        <h3>Revenue Coverage</h3>
        <p>Revenue coverage is unavailable for this institution.</p>
      </section>
    );
  }

  const expenseShare = expenses / revenue;
  const exceededRevenue = expenses > revenue;

  const expenseWithinRevenue = Math.min(expenses, revenue);
  const revenueAboveExpenses = Math.max(revenue - expenses, 0);

  const overrunShare = Math.min(Math.max((expenses - revenue) / revenue, 0), 1);

  const chartData = [
    {
      name: "Expenses within revenue",
      value: expenseWithinRevenue,
      fill: "#5a8963",
    },
    {
      name: "Revenue above expenses",
      value: revenueAboveExpenses,
      fill: "#344638",
    },
  ];

  return (
    <section className="revenue-coverage">
      <div className="container">
        <h3>Revenue Coverage</h3>

        <div className="revenue-coverage-layout">
          <div
            className="revenue-coverage-chart"
            role="img"
            aria-label={`Expenses are ${percentageFormatter.format(
              expenseShare * 100,
            )}% of reported revenue.`}
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                {exceededRevenue && (
                  <Pie
                    data={[
                      {
                        name: "Expenses above revenue",
                        value: overrunShare,
                        fill: "#c94d3b",
                      },
                      {
                        name: "Remaining overrun scale",
                        value: 1 - overrunShare,
                        fill: "transparent",
                      },
                    ]}
                    dataKey="value"
                    nameKey="name"
                    startAngle={90}
                    endAngle={-270}
                    innerRadius="91%"
                    outerRadius="99%"
                    stroke="none"
                    tooltipType="none"
                  />
                )}

                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius="68%"
                  outerRadius="90%"
                  paddingAngle={1}
                  stroke="none"
                />

                <Tooltip
                  formatter={(value) =>
                    currencyFormatter.format(Number(value ?? 0))
                  }
                />
              </PieChart>
            </ResponsiveContainer>

            <div className="revenue-coverage-center" aria-hidden="true">
              <strong>{percentageFormatter.format(expenseShare * 100)}%</strong>
              <span>expenses of revenue</span>
            </div>
          </div>

          <div className="revenue-coverage-details">
            <dl>
              <div>
                <dt>Total Revenue</dt>
                <dd>{currencyFormatter.format(revenue)}</dd>
              </div>
              <div>
                <dt>Total Expenses</dt>
                <dd>{currencyFormatter.format(expenses)}</dd>
              </div>
            </dl>

            <p>
              {exceededRevenue
                ? `Reported expenses exceed revenue by ${currencyFormatter.format(
                    expenses - revenue,
                  )}.`
                : `Revenue above reported expenses: ${currencyFormatter.format(
                    revenueAboveExpenses,
                  )}.`}
            </p>
          </div>
        </div>

        <p className="revenue-coverage-note">
          This compares reported totals, not net income or overall institutional
          financial health.
        </p>
      </div>
    </section>
  );
}

export default RevenueCoverageDonut;
