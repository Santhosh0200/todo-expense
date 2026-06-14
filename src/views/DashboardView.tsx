import { ArrowRight, ListTodo, Wallet } from "lucide-react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import type { View } from "../types";

/**
 * Phase 2 placeholder. The real bento dashboard (today's tasks, budget overview,
 * recent activity, insights) is built in Phase 5 — no analytics here yet.
 */
export function DashboardView({ onNavigate }: { onNavigate: (view: View) => void }) {
  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-br from-surface to-surface-2 p-6">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">Welcome back 👋</h2>
        <p className="mt-1 max-w-md text-sm text-muted">
          Your dashboard overview is coming together. For now, jump straight into managing your
          tasks and expenses.
        </p>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card className="flex flex-col gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <ListTodo className="h-5 w-5" aria-hidden />
          </div>
          <div>
            <h3 className="font-medium text-foreground">Tasks</h3>
            <p className="text-sm text-muted">Track what needs to get done.</p>
          </div>
          <Button variant="secondary" className="mt-1 w-full" onClick={() => onNavigate("tasks")}>
            Open tasks <ArrowRight className="h-4 w-4" aria-hidden />
          </Button>
        </Card>

        <Card className="flex flex-col gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Wallet className="h-5 w-5" aria-hidden />
          </div>
          <div>
            <h3 className="font-medium text-foreground">Expenses</h3>
            <p className="text-sm text-muted">Keep an eye on your spending.</p>
          </div>
          <Button variant="secondary" className="mt-1 w-full" onClick={() => onNavigate("expenses")}>
            Open expenses <ArrowRight className="h-4 w-4" aria-hidden />
          </Button>
        </Card>
      </div>
    </div>
  );
}
