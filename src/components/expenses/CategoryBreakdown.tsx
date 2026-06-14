import { Card } from "../ui/Card";
import { CAT_COLORS } from "../../lib/constants";
import { formatINR } from "../../lib/format";

interface CategoryBreakdownProps {
  catTotals: { c: string; v: number }[];
  total: number;
}

export function CategoryBreakdown({ catTotals, total }: CategoryBreakdownProps) {
  const sorted = catTotals.slice().sort((a, b) => b.v - a.v);

  return (
    <Card className="space-y-3">
      <p className="text-sm font-medium text-muted">Spending by category</p>
      <div className="flex flex-col gap-3">
        {sorted.map(({ c, v }) => {
          const pct = total > 0 ? (v / total) * 100 : 0;
          const color = CAT_COLORS[c as keyof typeof CAT_COLORS];
          return (
            <div key={c} className="flex items-center gap-3">
              <span className="w-20 flex-shrink-0 text-xs text-muted">{c}</span>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-2">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${pct.toFixed(1)}%`, background: color }}
                />
              </div>
              <span className="min-w-16 flex-shrink-0 text-right text-xs font-medium tabular-nums text-foreground">
                {formatINR(v, { maximumFractionDigits: 0 })}
              </span>
              <span className="min-w-8 flex-shrink-0 text-right text-xs tabular-nums text-muted">
                {pct.toFixed(0)}%
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
