import { Plus } from "lucide-react";
import { Card } from "../ui/Card";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { Button } from "../ui/Button";
import { CATEGORIES } from "../../lib/constants";

interface ExpenseComposerProps {
  expName: string;
  setExpName: (v: string) => void;
  expAmt: string;
  setExpAmt: (v: string) => void;
  expCat: string;
  setExpCat: (v: string) => void;
  addExpense: () => void;
}

export function ExpenseComposer({
  expName,
  setExpName,
  expAmt,
  setExpAmt,
  expCat,
  setExpCat,
  addExpense,
}: ExpenseComposerProps) {
  return (
    <Card className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row">
        <Input
          value={expName}
          onChange={(e) => setExpName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addExpense()}
          placeholder="Expense name"
          aria-label="Expense name"
          className="sm:flex-[2]"
        />
        <div className="relative sm:flex-1">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted">
            ₹
          </span>
          <Input
            value={expAmt}
            onChange={(e) => setExpAmt(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addExpense()}
            placeholder="Amount"
            type="number"
            aria-label="Amount"
            className="pl-7"
          />
        </div>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Select
          value={expCat}
          onChange={(e) => setExpCat(e.target.value)}
          aria-label="Category"
          className="sm:flex-1"
        >
          {CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </Select>
        <Button onClick={addExpense} className="w-full sm:w-auto">
          <Plus className="h-4 w-4" aria-hidden />
          Log expense
        </Button>
      </div>
    </Card>
  );
}
