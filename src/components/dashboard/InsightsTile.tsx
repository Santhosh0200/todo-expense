import type { ReactNode } from "react";
import { CheckCircle2, PieChart, Receipt, TrendingUp } from "lucide-react";
import type { Expense } from "../../types";
import type { TaskCounts } from "../tasks/TaskFilters";
import { formatINR } from "../../lib/format";

interface InsightsTileProps {
  expenses: Expense[];
  counts: TaskCounts;
  total: number;
  remaining: number | null;
  pct: number;
}

export function InsightsTile({ expenses, counts, total, remaining, pct }: InsightsTileProps) {
  const byCategory = expenses.reduce<Record<string, number>>((acc, e) => {
    acc[e.category] = (acc[e.category] ?? 0) + e.amount;
    return acc;
  }, {});
  const top = Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0];

  return (
    <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
      <p className="mb-3 text-sm font-medium text-foreground">Quick insights</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Insight
          icon={<PieChart className="h-4 w-4" aria-hidden />}
          label="Top category"
          value={top ? top[0] : "—"}
          sub={top ? formatINR(top[1], { maximumFractionDigits: 0 }) : undefined}
        />
        <Insight
          icon={<TrendingUp className="h-4 w-4" aria-hidden />}
          label="Budget used"
          value={remaining !== null ? `${pct.toFixed(0)}%` : formatINR(total, { maximumFractionDigits: 0 })}
          sub={remaining !== null ? "of budget" : "total spent"}
        />
        <Insight
          icon={<CheckCircle2 className="h-4 w-4" aria-hidden />}
          label="Tasks done"
          value={`${counts.done}`}
          sub={`of ${counts.all}`}
        />
        <Insight
          icon={<Receipt className="h-4 w-4" aria-hidden />}
          label="Logged"
          value={`${expenses.length}`}
          sub={expenses.length === 1 ? "expense" : "expenses"}
        />
      </div>
    </div>
  );
}

function Insight({
  icon,
  label,
  value,
  sub,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="min-w-0 rounded-xl bg-surface-2/60 p-3">
      <div className="flex items-center gap-1.5 text-muted">
        {icon}
        <span className="truncate text-[11px] font-medium">{label}</span>
      </div>
      <p className="mt-1 truncate text-base font-semibold tracking-tight text-foreground">{value}</p>
      {sub && <p className="truncate text-[11px] text-muted">{sub}</p>}
    </div>
  );
}
