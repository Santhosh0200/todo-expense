import { PolarAngleAxis, RadialBar, RadialBarChart, ResponsiveContainer } from "recharts";
import { Gauge } from "lucide-react";
import { Card } from "../ui/Card";
import { EmptyState } from "../ui/EmptyState";
import { formatINR } from "../../lib/format";

interface BudgetUtilizationChartProps {
  total: number;
  budget: string;
  remaining: number | null;
  pct: number;
  barColor: string;
}

export function BudgetUtilizationChart({
  total,
  budget,
  remaining,
  pct,
  barColor,
}: BudgetUtilizationChartProps) {
  return (
    <Card className="space-y-3">
      <p className="text-sm font-medium text-foreground">Budget utilization</p>
      {remaining === null ? (
        <EmptyState
          icon={Gauge}
          title="No budget set"
          description="Set a monthly budget in the Expenses tab to track utilization."
        />
      ) : (
        <div className="relative h-64">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              cx="50%"
              cy="50%"
              innerRadius="70%"
              outerRadius="100%"
              barSize={16}
              data={[{ name: "used", value: Math.min(pct, 100) }]}
              startAngle={90}
              endAngle={-270}
            >
              <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
              <RadialBar
                dataKey="value"
                angleAxisId={0}
                cornerRadius={12}
                fill={barColor}
                background={{ fill: "var(--surface-2)" }}
              />
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-semibold tabular-nums text-foreground">
              {pct.toFixed(0)}%
            </span>
            <span className="text-xs text-muted">used</span>
            <span
              className="mt-1 text-xs font-medium tabular-nums"
              style={{ color: remaining < 0 ? "var(--danger)" : "var(--success)" }}
            >
              {formatINR(Math.abs(remaining), { maximumFractionDigits: 0 })}
              {remaining < 0 ? " over" : " left"}
            </span>
          </div>
        </div>
      )}
      {remaining !== null && (
        <p className="text-center text-xs text-muted">
          {formatINR(total, { maximumFractionDigits: 0 })} of{" "}
          {formatINR(parseFloat(budget), { maximumFractionDigits: 0 })}
        </p>
      )}
    </Card>
  );
}
