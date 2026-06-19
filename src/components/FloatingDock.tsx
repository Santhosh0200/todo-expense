import { motion } from "framer-motion";
import { BarChart3, LayoutDashboard, ListTodo, Plus, Wallet } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { View } from "../types";
import { cn } from "../lib/cn";
import { requestQuickCaptureFocus } from "../lib/quickCapture/focusBus";

const items: { id: View; label: string; icon: LucideIcon }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "tasks", label: "Tasks", icon: ListTodo },
  { id: "expenses", label: "Expenses", icon: Wallet },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
];

export function FloatingDock({
  active,
  onNavigate,
}: {
  active: View;
  onNavigate: (view: View) => void;
}) {
  return (
    <nav className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center pb-[max(1rem,env(safe-area-inset-bottom))]">
      <div className="pointer-events-auto flex items-center gap-1 rounded-2xl border border-border bg-surface/80 p-1.5 shadow-lg backdrop-blur-md">
        {items.map((item) => {
          const isActive = active === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "relative flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors",
                isActive ? "text-primary-foreground" : "text-muted hover:text-foreground",
              )}
            >
              {isActive && (
                <motion.span
                  layoutId="dock-active-pill"
                  className="absolute inset-0 rounded-xl bg-primary"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
              <Icon className="relative h-[18px] w-[18px]" aria-hidden />
              <span className="relative hidden sm:inline">{item.label}</span>
            </button>
          );
        })}

        <span className="mx-0.5 h-6 w-px bg-border" aria-hidden />

        <button
          type="button"
          onClick={() => {
            onNavigate("dashboard");
            requestQuickCaptureFocus();
          }}
          aria-label="Quick capture"
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Plus className="h-[18px] w-[18px]" aria-hidden />
        </button>
      </div>
    </nav>
  );
}
