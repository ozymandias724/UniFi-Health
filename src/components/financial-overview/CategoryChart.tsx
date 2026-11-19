import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import type { FinanceRecord, VariableMetadata } from "../../services/ipeds";
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
            formatter={(value) =>
              typeof value === "number"
                ? currencyFormatter.format(value)
                : "N/A"
            }
          />

          <Bar dataKey="value" fill="#4f9cf9" />
        </BarChart>
      </ResponsiveContainer>
    </section>
  );
}

export default CategoryChart;
