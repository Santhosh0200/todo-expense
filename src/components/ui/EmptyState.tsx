import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "../../lib/cn";

export function EmptyState({
  icon: Icon,
  title,
  description,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-dashed border-border px-6 py-14 text-center",
        className,
      )}
    >
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-surface-2 text-muted">
        <Icon className="h-6 w-6" aria-hidden />
      </div>
      <p className="text-sm font-medium text-foreground">{title}</p>
      {description && <p className="mt-1 max-w-xs text-sm text-muted">{description}</p>}
    </div>
  );
}
