import { motion } from "framer-motion";
import { MoreHorizontal, Trash2 } from "lucide-react";
import type { Expense } from "../../types";
import { CAT_COLORS, CAT_LUCIDE } from "../../lib/constants";
import { formatDate } from "../../lib/dates";
import { formatINR } from "../../lib/format";

interface ExpenseCardProps {
  expense: Expense;
  onDelete: () => void;
}

export function ExpenseCard({ expense, onDelete }: ExpenseCardProps) {
  const Icon = CAT_LUCIDE[expense.category] ?? MoreHorizontal;
  const color = (CAT_COLORS[expense.category as keyof typeof CAT_COLORS] as string | undefined) ?? "#888780";
  const tint = `${color}1A`;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -16, transition: { duration: 0.15 } }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="group flex items-center gap-3 rounded-2xl border border-border bg-surface p-4 shadow-sm transition-shadow hover:shadow-md"
    >
      <div
        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl"
        style={{ background: tint, color }}
      >
        <Icon className="h-5 w-5" aria-hidden />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">{expense.name}</p>
        <div className="mt-1 flex items-center gap-2 text-xs text-muted">
          <span
            className="rounded-full px-2 py-0.5 font-medium"
            style={{ background: tint, color }}
          >
            {expense.category}
          </span>
          {formatDate(expense.date)}
        </div>
      </div>

      <div className="flex-shrink-0 text-sm font-semibold tabular-nums text-foreground">
        {formatINR(expense.amount)}
      </div>

      <button
        type="button"
        onClick={onDelete}
        aria-label="Delete expense"
        className="flex-shrink-0 rounded-lg p-1.5 text-muted transition-colors hover:bg-danger/10 hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:opacity-0 sm:group-hover:opacity-100"
      >
        <Trash2 className="h-4 w-4" aria-hidden />
      </button>
    </motion.div>
  );
}
