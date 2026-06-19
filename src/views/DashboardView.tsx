import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import type { Expense, Todo, View } from "../types";
import type { TaskCounts } from "../components/tasks/TaskFilters";
import { TasksSummaryTile } from "../components/dashboard/TasksSummaryTile";
import { BudgetTile } from "../components/dashboard/BudgetTile";
import { TodayTasksTile } from "../components/dashboard/TodayTasksTile";
import { RecentExpensesTile } from "../components/dashboard/RecentExpensesTile";
import { InsightsTile } from "../components/dashboard/InsightsTile";
import { QuickCapture } from "../components/QuickCapture";

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
  onCreateExpense: (e: { name: string; amount: number; category: string }) => Promise<string | number | null>;
  onCreateTask: (t: { text: string; due: string | null }) => Promise<string | number | null>;
  onUndo: (type: "expense" | "task", id: string | number) => void;
}

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
};

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

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
  onCreateExpense,
  onCreateTask,
  onUndo,
}: DashboardViewProps) {
  const qcTasks = todos.filter((t) => t.source === "quick_capture").length;
  const qcExpenses = expenses.filter((e) => e.source === "quick_capture").length;
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-2 gap-3 sm:gap-4"
    >
      <motion.div variants={item} className="col-span-2">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">
          {greeting()}, welcome to Fluxa
        </h2>
        <p className="mt-1 text-sm text-muted">Plan. Spend. Progress.</p>
      </motion.div>

      <motion.div variants={item} className="col-span-2">
        <QuickCapture
          onCreateExpense={onCreateExpense}
          onCreateTask={onCreateTask}
          onUndo={onUndo}
        />
      </motion.div>

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
          qcTasks={qcTasks}
          qcExpenses={qcExpenses}
        />
      </motion.div>
    </motion.div>
  );
}
