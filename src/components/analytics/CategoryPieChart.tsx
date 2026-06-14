import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { PieChart as PieIcon } from "lucide-react";
import { Card } from "../ui/Card";
import { EmptyState } from "../ui/EmptyState";
import { spendingByCategory } from "../../lib/analytics";
import { formatINR } from "../../lib/format";
import type { Expense } from "../../types";

const tooltipStyle = {
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: 10,
  fontSize: 12,
};

export function CategoryPieChart({ expenses }: { expenses: Expense[] }) {
  const data = spendingByCategory(expenses);

  return (
    <Card className="space-y-3">
      <p className="text-sm font-medium text-foreground">Category breakdown</p>
      {data.length === 0 ? (
        <EmptyState
          icon={PieIcon}
          title="No spending yet"
          description="Log expenses to see how your spending splits by category."
        />
      ) : (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius={55}
                outerRadius={88}
                paddingAngle={2}
                stroke="none"
              >
                {data.map((d) => (
                  <Cell key={d.name} fill={d.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => formatINR(Number(value))}
                contentStyle={tooltipStyle}
                itemStyle={{ color: "var(--foreground)" }}
                labelStyle={{ color: "var(--muted)" }}
              />
              <Legend
                iconType="circle"
                formatter={(value) => (
                  <span style={{ color: "var(--muted)", fontSize: 12 }}>{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}
