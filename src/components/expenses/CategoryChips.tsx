import type { CSSProperties } from "react";
import { CATEGORIES, CAT_COLORS } from "../../lib/constants";
import { cn } from "../../lib/cn";

export function CategoryChips({
  expFilter,
  setExpFilter,
}: {
  expFilter: string;
  setExpFilter: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {["All", ...CATEGORIES].map((c) => {
        const isActive = expFilter === c;
        const color = CAT_COLORS[c as keyof typeof CAT_COLORS] as string | undefined;

        const activeStyle: CSSProperties | undefined =
          isActive && color ? { background: `${color}1A`, borderColor: color, color } : undefined;

        return (
          <button
            key={c}
            type="button"
            onClick={() => setExpFilter(c)}
            aria-pressed={isActive}
            style={activeStyle}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
              isActive
                ? color
                  ? ""
                  : "border-primary bg-primary text-primary-foreground"
                : "border-border bg-surface text-muted hover:bg-surface-2 hover:text-foreground",
            )}
          >
            {color && (
              <span className="h-2 w-2 rounded-full" style={{ background: color }} aria-hidden />
            )}
            {c}
          </button>
        );
      })}
    </div>
  );
}
