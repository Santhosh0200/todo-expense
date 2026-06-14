import { ArrowRight, CalendarCheck } from "lucide-react";
import type { Todo, View } from "../../types";
import { isDueToday, isOverdue } from "../../lib/dates";
import { cn } from "../../lib/cn";

export function TodayTasksTile({
  todos,
  onNavigate,
}: {
  todos: Todo[];
  onNavigate: (v: View) => void;
}) {
  // Actionable now: overdue first, then due today. Existing data only.
  const items = todos
    .filter((t) => !t.done && (isOverdue(t.due) || isDueToday(t.due)))
    .sort((a, b) => Number(isOverdue(b.due)) - Number(isOverdue(a.due)))
    .slice(0, 4);

  return (
    <div className="flex h-full flex-col rounded-2xl border border-border bg-surface p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-medium text-foreground">Today&apos;s tasks</p>
        <button
          type="button"
          onClick={() => onNavigate("tasks")}
          className="inline-flex items-center gap-1 text-xs font-medium text-muted transition-colors hover:text-foreground"
        >
          View all <ArrowRight className="h-3.5 w-3.5" aria-hidden />
        </button>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 py-6 text-center">
          <CalendarCheck className="h-6 w-6 text-muted" aria-hidden />
          <p className="text-sm text-muted">Nothing due today 🎉</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map((t) => {
            const overdue = isOverdue(t.due);
            return (
              <li key={t.id} className="flex items-center gap-2.5">
                <span
                  className={cn(
                    "h-2 w-2 flex-shrink-0 rounded-full",
                    overdue ? "bg-danger" : "bg-warning",
                  )}
                  aria-hidden
                />
                <span className="min-w-0 flex-1 truncate text-sm text-foreground">{t.text}</span>
                <span
                  className={cn(
                    "flex-shrink-0 text-[11px] font-medium",
                    overdue ? "text-danger" : "text-warning",
                  )}
                >
                  {overdue ? "Overdue" : "Today"}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
