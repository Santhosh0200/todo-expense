import { ProgressRing } from "../ui/ProgressRing";
import { AnimatedNumber } from "../ui/AnimatedNumber";
import type { View } from "../../types";
import type { TaskCounts } from "../tasks/TaskFilters";

export function TasksSummaryTile({
  counts,
  onNavigate,
}: {
  counts: TaskCounts;
  onNavigate: (v: View) => void;
}) {
  const rate = counts.all > 0 ? Math.round((counts.done / counts.all) * 100) : 0;

  return (
    <button
      type="button"
      onClick={() => onNavigate("tasks")}
      className="flex h-full w-full items-center gap-4 rounded-2xl border border-border bg-surface p-4 text-left shadow-sm transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <ProgressRing value={rate}>
        <span className="text-sm font-semibold tabular-nums text-foreground">
          <AnimatedNumber value={rate} format={(n) => `${Math.round(n)}%`} />
        </span>
      </ProgressRing>
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground">Completion rate</p>
        <p className="mt-0.5 text-xs text-muted">
          {counts.done} of {counts.all} done
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <span className="rounded-full bg-warning/10 px-2 py-0.5 text-[11px] font-medium text-warning">
            {counts.active} active
          </span>
          {counts.overdue > 0 && (
            <span className="rounded-full bg-danger/10 px-2 py-0.5 text-[11px] font-medium text-danger">
              {counts.overdue} overdue
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
