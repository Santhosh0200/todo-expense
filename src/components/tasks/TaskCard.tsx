import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { AlertCircle, CalendarDays, Check, Trash2 } from "lucide-react";
import type { Todo } from "../../types";
import { formatDate, formatDateShort, isDueToday, isOverdue } from "../../lib/dates";
import { cn } from "../../lib/cn";

interface TaskCardProps {
  todo: Todo;
  onToggle: () => void;
  onDelete: () => void;
}

export function TaskCard({ todo, onToggle, onDelete }: TaskCardProps) {
  const overdue = !todo.done && isOverdue(todo.due);
  const today = !todo.done && isDueToday(todo.due);

  const leftBorder = todo.done
    ? "border-l-success"
    : overdue
      ? "border-l-danger"
      : today
        ? "border-l-warning"
        : "border-l-transparent";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -16, transition: { duration: 0.15 } }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={cn(
        "group flex items-start gap-3 rounded-2xl border border-l-4 border-border bg-surface p-4 shadow-sm transition-shadow hover:shadow-md",
        leftBorder,
      )}
    >
      <motion.button
        type="button"
        onClick={onToggle}
        whileTap={{ scale: 0.85 }}
        aria-label={todo.done ? "Mark task as not done" : "Mark task as done"}
        aria-pressed={todo.done}
        className={cn(
          "mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          todo.done
            ? "border-success bg-success text-white"
            : "border-border text-transparent hover:border-success",
        )}
      >
        {todo.done && (
          <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}>
            <Check className="h-3.5 w-3.5" aria-hidden />
          </motion.span>
        )}
      </motion.button>

      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "break-words text-sm font-medium",
            todo.done ? "text-muted line-through" : "text-foreground",
          )}
        >
          {todo.text}
        </p>
        {todo.due && (
          <span
            className={cn(
              "mt-1 inline-flex items-center gap-1 text-xs font-medium",
              overdue ? "text-danger" : today ? "text-warning" : "text-muted",
            )}
          >
            {overdue ? (
              <AlertCircle className="h-3.5 w-3.5" aria-hidden />
            ) : (
              <CalendarDays className="h-3.5 w-3.5" aria-hidden />
            )}
            {overdue ? "Overdue · " : today ? "Due today · " : ""}
            {formatDate(todo.due)}
          </span>
        )}
        <p className="mt-0.5 text-[11px] text-muted">Added {formatDateShort(todo.created_at)}</p>
      </div>

      <div className="flex flex-shrink-0 items-center gap-2">
        {todo.done && <Badge className="bg-success/10 text-success">Done</Badge>}
        {overdue && <Badge className="bg-danger/10 text-danger">Overdue</Badge>}
        {today && !overdue && <Badge className="bg-warning/10 text-warning">Today</Badge>}
        <button
          type="button"
          onClick={onDelete}
          aria-label="Delete task"
          className="rounded-lg p-1.5 text-muted transition-colors hover:bg-danger/10 hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:opacity-0 sm:group-hover:opacity-100"
        >
          <Trash2 className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </motion.div>
  );
}

function Badge({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 text-[11px] font-medium",
        className,
      )}
    >
      {children}
    </span>
  );
}
