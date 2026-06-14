import { ArrowRight, MoreHorizontal, Receipt } from "lucide-react";
import type { Expense, View } from "../../types";
import { CAT_COLORS, CAT_LUCIDE } from "../../lib/constants";
import { formatINR } from "../../lib/format";
import { formatDateShort } from "../../lib/dates";

export function RecentExpensesTile({
  expenses,
  onNavigate,
}: {
  expenses: Expense[];
  onNavigate: (v: View) => void;
}) {
  const items = expenses.slice(0, 4); // already ordered by date desc

  return (
    <div className="flex h-full flex-col rounded-2xl border border-border bg-surface p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-medium text-foreground">Recent expenses</p>
        <button
          type="button"
          onClick={() => onNavigate("expenses")}
          className="inline-flex items-center gap-1 text-xs font-medium text-muted transition-colors hover:text-foreground"
        >
          View all <ArrowRight className="h-3.5 w-3.5" aria-hidden />
        </button>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 py-6 text-center">
          <Receipt className="h-6 w-6 text-muted" aria-hidden />
          <p className="text-sm text-muted">No expenses yet</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2.5">
          {items.map((e) => {
            const Icon = CAT_LUCIDE[e.category] ?? MoreHorizontal;
            const color = (CAT_COLORS[e.category as keyof typeof CAT_COLORS] as string) ?? "#888780";
            return (
              <li key={e.id} className="flex items-center gap-2.5">
                <div
                  className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg"
                  style={{ background: `${color}1A`, color }}
                >
                  <Icon className="h-4 w-4" aria-hidden />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{e.name}</p>
                  <p className="text-[11px] text-muted">{formatDateShort(e.date)}</p>
                </div>
                <span className="flex-shrink-0 text-sm font-semibold tabular-nums text-foreground">
                  {formatINR(e.amount)}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
