import type { ReactNode } from "react";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { RefreshCw } from "lucide-react";
import type { View } from "../types";
import { FloatingDock } from "./FloatingDock";
import { ThemeToggle } from "./ThemeToggle";
import { Logo } from "./ui/Logo";

interface AppShellProps {
  view: View;
  onNavigate: (view: View) => void;
  onRefresh: () => void;
  notice?: ReactNode;
  children: ReactNode;
}

export function AppShell({ view, onNavigate, onRefresh, notice, children }: AppShellProps) {
  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-svh">
        <div className="mx-auto w-full max-w-2xl px-4 pb-32 pt-6">
        <header className="mb-6 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <Logo />
            <p className="mt-1 truncate text-xs text-muted">{today}</p>
          </div>
          <div className="flex flex-shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={onRefresh}
              aria-label="Refresh"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface text-muted transition-colors hover:bg-surface-2 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <RefreshCw className="h-[18px] w-[18px]" aria-hidden />
            </button>
            <ThemeToggle />
          </div>
        </header>

        {notice}

        <main>
          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

        <FloatingDock active={view} onNavigate={onNavigate} />
      </div>
    </MotionConfig>
  );
}
