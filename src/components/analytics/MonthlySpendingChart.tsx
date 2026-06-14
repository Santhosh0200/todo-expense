import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { BarChart3 } from "lucide-react";
import { Card } from "../ui/Card";
import { EmptyState } from "../ui/EmptyState";
import { spendingByMonth } from "../../lib/analytics";
import { formatINR } from "../../lib/format";
import type { Expense } from "../../types";

const tooltipStyle = {
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: 10,
  fontSize: 12,
};

const tickStyle = { fill: "var(--muted)", fontSize: 12 };

export function MonthlySpendingChart({ expenses }: { expenses: Expense[] }) {
  const data = spendingByMonth(expenses);

  return (
    <Card className="space-y-3">
      <p className="text-sm font-medium text-foreground">Monthly spending</p>
      {data.length === 0 ? (
        <EmptyState
          icon={BarChart3}
          title="No spending yet"
          description="Your spending trend will appear here as you log expenses."
        />
      ) : (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="month" tick={tickStyle} tickLine={false} axisLine={false} />
              <YAxis
                tick={tickStyle}
                tickLine={false}
                axisLine={false}
                width={56}
                tickFormatter={(value) => formatINR(Number(value), { maximumFractionDigits: 0 })}
              />
              <Tooltip
                cursor={{ fill: "var(--surface-2)", opacity: 0.5 }}
                formatter={(value) => formatINR(Number(value))}
                contentStyle={tooltipStyle}
                itemStyle={{ color: "var(--foreground)" }}
                labelStyle={{ color: "var(--muted)" }}
              />
              <Bar dataKey="total" fill="var(--primary)" radius={[6, 6, 0, 0]} maxBarSize={56} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}
