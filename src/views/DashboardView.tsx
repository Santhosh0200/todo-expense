import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import type { Expense, Todo, View } from "../types";
import type { TaskCounts } from "../components/tasks/TaskFilters";
import { TasksSummaryTile } from "../components/dashboard/TasksSummaryTile";
import { BudgetTile } from "../components/dashboard/BudgetTile";
import { TodayTasksTile } from "../components/dashboard/TodayTasksTile";
import { RecentExpensesTile } from "../components/dashboard/RecentExpensesTile";
import { InsightsTile } from "../components/dashboard/InsightsTile";

interface DashboardViewProps {
  todos: Todo[];
  expenses: Expense[];
  counts: TaskCounts;
  total: number;
  budget: string;
  remaining: number | null;
  pct: number;
  barColor: string;
  onNavigate: (v: View) => void;
}

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
};

export function DashboardView({
  todos,
  expenses,
  counts,
  total,
  budget,
  remaining,
  pct,
  barColor,
  onNavigate,
}: DashboardViewProps) {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-2 gap-3 sm:gap-4"
    >
      <motion.div variants={item} className="col-span-2 sm:col-span-1">
        <TasksSummaryTile counts={counts} onNavigate={onNavigate} />
      </motion.div>
      <motion.div variants={item} className="col-span-2 sm:col-span-1">
        <BudgetTile
          total={total}
          budget={budget}
          remaining={remaining}
          pct={pct}
          barColor={barColor}
          onNavigate={onNavigate}
        />
      </motion.div>

      <motion.div variants={item} className="col-span-2 sm:col-span-1">
        <TodayTasksTile todos={todos} onNavigate={onNavigate} />
      </motion.div>
      <motion.div variants={item} className="col-span-2 sm:col-span-1">
        <RecentExpensesTile expenses={expenses} onNavigate={onNavigate} />
      </motion.div>

      <motion.div variants={item} className="col-span-2">
        <InsightsTile
          expenses={expenses}
          counts={counts}
          total={total}
          remaining={remaining}
          pct={pct}
        />
      </motion.div>
    </motion.div>
  );
}
