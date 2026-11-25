/*
 * Reusable horizontal bar chart for revenue or expenditure fields. Metadata
 * supplies readable labels, and missing/non-finite values are omitted. The
 * surrounding scroll region preserves label space on narrow screens.
 */
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import type { FinanceRecord } from "../../types/finance.ts";
import type { VariableMetadata } from "../../types/metadata.ts";

import {
  currencyFormatter,
  compactCurrencyFormatter,
} from "../../utils/formatters";
import { formatFinanceLabel } from "../../utils/formatFinanceLabel";

interface CategoryChartProps {
  title: string;
  finances: FinanceRecord;
  variables: Record<string, VariableMetadata>;
  categories: readonly (keyof FinanceRecord)[];
}

function CategoryChart({
  title,
  finances,
  variables,
  categories,
}: CategoryChartProps) {
  const data = categories
    .map((key) => ({
      name: formatFinanceLabel(variables[key]?.label ?? key, title),
      value: finances[key],
    }))
    .filter(
      (item): item is { name: string; value: number } =>
        typeof item.value === "number" && Number.isFinite(item.value),
    );

  if (data.length === 0) {
    return null;
  }

  return (
    <section className="category-chart">
      <h3>{title}</h3>

      <p className="category-chart-scroll-hint">
        Scroll horizontally to see the full chart.
      </p>
      <div
        className="category-chart-scroll"
        role="region"
        aria-label={`${title} chart`}
        tabIndex={0}
      >
        <div className="category-chart-plot">
          <ResponsiveContainer
            width="100%"
            height={Math.max(300, data.length * 60)}
          >
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 10, right: 30, bottom: 10, left: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />

              <XAxis
                type="number"
                tickFormatter={(value: number) =>
                  compactCurrencyFormatter.format(value)
                }
              />

              <YAxis
                type="category"
                dataKey="name"
                width={240}
                tick={{ fontSize: 12 }}
              />

              <Tooltip
                cursor={{ fill: "var(--bg-subtle)" }}
                formatter={(value) =>
                  typeof value === "number"
                    ? currencyFormatter.format(value)
                    : "N/A"
                }
              />

              <Bar dataKey="value" fill="var(--chart-primary)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}

export default CategoryChart;
