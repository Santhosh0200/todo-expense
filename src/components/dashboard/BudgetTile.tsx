import { motion } from "framer-motion";
import { Wallet } from "lucide-react";
import { AnimatedNumber } from "../ui/AnimatedNumber";
import { formatINR } from "../../lib/format";
import type { View } from "../../types";

interface BudgetTileProps {
  total: number;
  budget: string;
  remaining: number | null;
  pct: number;
  barColor: string;
  onNavigate: (v: View) => void;
}

export function BudgetTile({ total, budget, remaining, pct, barColor, onNavigate }: BudgetTileProps) {
  const hasBudget = remaining !== null;

  return (
    <button
      type="button"
      onClick={() => onNavigate("expenses")}
      className="flex h-full w-full flex-col rounded-2xl border border-border bg-surface p-4 text-left shadow-sm transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="flex items-center gap-2 text-sm font-medium text-muted">
        <Wallet className="h-4 w-4" aria-hidden />
        {hasBudget ? "Remaining" : "Spent"}
      </div>

      <p
        className="mt-1 text-2xl font-semibold tracking-tight tabular-nums"
        style={{ color: hasBudget ? (remaining! < 0 ? "var(--danger)" : "var(--success)") : "var(--foreground)" }}
      >
        <AnimatedNumber
          value={hasBudget ? Math.abs(remaining!) : total}
          format={(n) => formatINR(n, { maximumFractionDigits: 0 })}
        />
        {hasBudget && remaining! < 0 ? " over" : ""}
      </p>

      {hasBudget ? (
        <div className="mt-auto pt-3">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
            <motion.div
              className="h-full rounded-full"
              style={{ background: barColor }}
              initial={{ width: 0 }}
              animate={{ width: `${pct.toFixed(1)}%` }}
              transition={{ type: "spring", stiffness: 120, damping: 20 }}
            />
          </div>
          <p className="mt-1.5 text-xs text-muted">
            {pct.toFixed(0)}% of {formatINR(parseFloat(budget), { maximumFractionDigits: 0 })}
          </p>
        </div>
      ) : (
        <p className="mt-auto pt-3 text-xs text-muted">Tap to set a budget</p>
      )}
    </button>
  );
}
