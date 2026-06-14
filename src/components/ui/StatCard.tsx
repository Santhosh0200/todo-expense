import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Card } from "./Card";
import { cn } from "../../lib/cn";

export interface StatCardProps {
  label: string;
  value: ReactNode;
  icon?: LucideIcon;
  /** Tailwind text-color class for the value + icon accent, e.g. "text-primary". */
  accentClassName?: string;
  hint?: ReactNode;
  className?: string;
}

export function StatCard({
  label,
  value,
  icon: Icon,
  accentClassName,
  hint,
  className,
}: StatCardProps) {
  return (
    <Card className={cn("flex flex-col gap-1", className)}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted">{label}</span>
        {Icon && <Icon className={cn("h-4 w-4 text-muted", accentClassName)} aria-hidden />}
      </div>
      <span
        className={cn(
          "text-2xl font-semibold tracking-tight text-foreground",
          accentClassName,
        )}
      >
        {value}
      </span>
      {hint && <span className="text-xs text-muted">{hint}</span>}
    </Card>
  );
}
