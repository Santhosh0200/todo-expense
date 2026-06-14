import type { TaskFilter } from "../../types";
import { cn } from "../../lib/cn";

export interface TaskCounts {
  all: number;
  active: number;
  today: number;
  overdue: number;
  done: number;
}

const FILTERS: { id: TaskFilter; label: string; countKey: keyof TaskCounts }[] = [
  { id: "all", label: "All", countKey: "all" },
  { id: "active", label: "Pending", countKey: "active" },
  { id: "today", label: "Today", countKey: "today" },
  { id: "overdue", label: "Overdue", countKey: "overdue" },
  { id: "done", label: "Completed", countKey: "done" },
];

export function TaskFilters({
  filter,
  setFilter,
  counts,
}: {
  filter: TaskFilter;
  setFilter: (f: TaskFilter) => void;
  counts: TaskCounts;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {FILTERS.map(({ id, label, countKey }) => {
        const isActive = filter === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => setFilter(id)}
            aria-pressed={isActive}
            className={cn(
              "inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
              isActive
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-surface text-muted hover:bg-surface-2 hover:text-foreground",
            )}
          >
            {label}
            <span
              className={cn(
                "rounded-full px-1.5 text-xs tabular-nums",
                isActive ? "bg-primary-foreground/20" : "bg-surface-2 text-muted",
              )}
            >
              {counts[countKey]}
            </span>
          </button>
        );
      })}
    </div>
  );
}
