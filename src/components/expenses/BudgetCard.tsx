import { motion } from "framer-motion";
import { Check, Pencil, Wallet } from "lucide-react";
import { Card } from "../ui/Card";
import { Input } from "../ui/Input";
import { cn } from "../../lib/cn";
import { formatINR } from "../../lib/format";

interface BudgetCardProps {
  total: number;
  budget: string;
  remaining: number | null;
  pct: number;
  barColor: string;
  showBudgetInput: boolean;
  setShowBudgetInput: (v: boolean) => void;
  budgetEdit: string;
  setBudgetEdit: (v: string) => void;
  saveBudget: () => void;
}

export function BudgetCard({
  total,
  budget,
  remaining,
  pct,
  barColor,
  showBudgetInput,
  setShowBudgetInput,
  budgetEdit,
  setBudgetEdit,
  saveBudget,
}: BudgetCardProps) {
  const hasBudget = remaining !== null;

  return (
    <Card className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm font-medium text-muted">
          <Wallet className="h-4 w-4" aria-hidden />
          Budget overview
        </div>
        {showBudgetInput ? (
          <div className="flex items-center gap-2">
            <Input
              value={budgetEdit}
              onChange={(e) => setBudgetEdit(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && saveBudget()}
              placeholder="e.g. 5000"
              type="number"
              aria-label="Monthly budget"
              className="h-8 w-28"
              autoFocus
            />
            <button
              type="button"
              onClick={saveBudget}
              aria-label="Save budget"
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-colors hover:bg-primary-hover"
            >
              <Check className="h-4 w-4" aria-hidden />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => {
              setBudgetEdit(budget);
              setShowBudgetInput(true);
            }}
            className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium text-muted transition-colors hover:bg-surface-2 hover:text-foreground"
          >
            <Pencil className="h-3.5 w-3.5" aria-hidden />
            {budget ? "Edit budget" : "Set budget"}
          </button>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Stat label="Spent" value={formatINR(total, { maximumFractionDigits: 0 })} className="text-danger" />
        <Stat
          label="Budget"
          value={budget ? formatINR(parseFloat(budget), { maximumFractionDigits: 0 }) : "—"}
          className="text-foreground"
        />
        <Stat
          label="Remaining"
          value={
            remaining === null
              ? "—"
              : `${formatINR(Math.abs(remaining), { maximumFractionDigits: 0 })}${remaining < 0 ? " over" : ""}`
          }
          className={remaining === null ? "text-muted" : remaining < 0 ? "text-danger" : "text-success"}
        />
      </div>

      {hasBudget ? (
        <div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-surface-2">
            <motion.div
              className="h-full rounded-full"
              style={{ background: barColor }}
              initial={{ width: 0 }}
              animate={{ width: `${pct.toFixed(1)}%` }}
              transition={{ type: "spring", stiffness: 120, damping: 20 }}
            />
          </div>
          <p className="mt-1.5 text-xs text-muted">
            {pct.toFixed(0)}% of {formatINR(parseFloat(budget), { maximumFractionDigits: 0 })} used
          </p>
        </div>
      ) : (
        !showBudgetInput && (
          <p className="text-xs text-muted">Set a monthly budget to track how much you have left.</p>
        )
      )}
    </Card>
  );
}

function Stat({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className="min-w-0 rounded-xl bg-surface-2/60 p-3">
      <p className="text-xs text-muted">{label}</p>
      <p
        className={cn(
          "mt-0.5 truncate text-base font-semibold tracking-tight tabular-nums sm:text-lg",
          className,
        )}
      >
        {value}
      </p>
    </div>
  );
}
