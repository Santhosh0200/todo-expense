import { AnimatePresence } from "framer-motion";
import { Receipt } from "lucide-react";
import type { Expense } from "../types";
import { BudgetCard } from "../components/expenses/BudgetCard";
import { ExpenseComposer } from "../components/expenses/ExpenseComposer";
import { CategoryChips } from "../components/expenses/CategoryChips";
import { CategoryBreakdown } from "../components/expenses/CategoryBreakdown";
import { ExpenseCard } from "../components/expenses/ExpenseCard";
import { EmptyState } from "../components/ui/EmptyState";

interface ExpensesViewProps {
  filteredExpenses: Expense[];
  total: number;
  budget: string;
  showBudgetInput: boolean;
  setShowBudgetInput: (v: boolean) => void;
  budgetEdit: string;
  setBudgetEdit: (v: string) => void;
  saveBudget: () => void;
  remaining: number | null;
  pct: number;
  barColor: string;
  catTotals: { c: string; v: number }[];
  expName: string;
  setExpName: (v: string) => void;
  expAmt: string;
  setExpAmt: (v: string) => void;
  expCat: string;
  setExpCat: (v: string) => void;
  addExpense: () => void;
  expFilter: string;
  setExpFilter: (v: string) => void;
  deleteExpense: (id: string | number) => void;
}

export function ExpensesView({
  filteredExpenses,
  total,
  budget,
  showBudgetInput,
  setShowBudgetInput,
  budgetEdit,
  setBudgetEdit,
  saveBudget,
  remaining,
  pct,
  barColor,
  catTotals,
  expName,
  setExpName,
  expAmt,
  setExpAmt,
  expCat,
  setExpCat,
  addExpense,
  expFilter,
  setExpFilter,
  deleteExpense,
}: ExpensesViewProps) {
  return (
    <div className="space-y-4">
      <BudgetCard
        total={total}
        budget={budget}
        remaining={remaining}
        pct={pct}
        barColor={barColor}
        showBudgetInput={showBudgetInput}
        setShowBudgetInput={setShowBudgetInput}
        budgetEdit={budgetEdit}
        setBudgetEdit={setBudgetEdit}
        saveBudget={saveBudget}
      />

      {catTotals.length > 0 && <CategoryBreakdown catTotals={catTotals} total={total} />}

      <ExpenseComposer
        expName={expName}
        setExpName={setExpName}
        expAmt={expAmt}
        setExpAmt={setExpAmt}
        expCat={expCat}
        setExpCat={setExpCat}
        addExpense={addExpense}
      />

      <CategoryChips expFilter={expFilter} setExpFilter={setExpFilter} />

      {filteredExpenses.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title={expFilter === "All" ? "No expenses yet" : `No ${expFilter} expenses`}
          description={
            expFilter === "All"
              ? "Log your first expense above to start tracking."
              : "Nothing logged in this category yet."
          }
        />
      ) : (
        <div className="flex flex-col gap-2.5">
          <AnimatePresence initial={false}>
            {filteredExpenses.map((e) => (
              <ExpenseCard key={e.id} expense={e} onDelete={() => deleteExpense(e.id)} />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
