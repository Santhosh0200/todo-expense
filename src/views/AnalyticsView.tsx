import type { Expense } from "../types";
import { CategoryPieChart } from "../components/analytics/CategoryPieChart";
import { MonthlySpendingChart } from "../components/analytics/MonthlySpendingChart";
import { BudgetUtilizationChart } from "../components/analytics/BudgetUtilizationChart";

interface AnalyticsViewProps {
  expenses: Expense[];
  total: number;
  budget: string;
  remaining: number | null;
  pct: number;
  barColor: string;
}

export function AnalyticsView({ expenses, total, budget, remaining, pct, barColor }: AnalyticsViewProps) {
  return (
    <div className="space-y-4">
      <CategoryPieChart expenses={expenses} />
      <MonthlySpendingChart expenses={expenses} />
      <BudgetUtilizationChart
        total={total}
        budget={budget}
        remaining={remaining}
        pct={pct}
        barColor={barColor}
      />
    </div>
  );
}
