import { motion } from "framer-motion";
import { BarChart3, LayoutDashboard, ListTodo, Wallet } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { View } from "../types";
import { cn } from "../lib/cn";

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
      </div>
    </nav>
  );
}
