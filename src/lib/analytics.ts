import type { Expense } from "../types";
import { CAT_COLORS } from "./constants";

export interface CategoryDatum {
  name: string;
  value: number;
  color: string;
}

export function spendingByCategory(expenses: Expense[]): CategoryDatum[] {
  const totals = expenses.reduce<Record<string, number>>((acc, e) => {
    acc[e.category] = (acc[e.category] ?? 0) + e.amount;
    return acc;
  }, {});

  return Object.entries(totals)
    .map(([name, value]) => ({
      name,
      value,
      color: (CAT_COLORS[name as keyof typeof CAT_COLORS] as string) ?? "#888780",
    }))
    .sort((a, b) => b.value - a.value);
}

export interface MonthDatum {
  month: string;
  total: number;
}

export function spendingByMonth(expenses: Expense[]): MonthDatum[] {
  const buckets = expenses.reduce<Record<string, { total: number; sort: number }>>((acc, e) => {
    const d = new Date(e.date);
    const key = d.toLocaleDateString("en-IN", { month: "short", year: "numeric" });
    if (!acc[key]) acc[key] = { total: 0, sort: d.getFullYear() * 12 + d.getMonth() };
    acc[key].total += e.amount;
    return acc;
  }, {});

  return Object.entries(buckets)
    .map(([month, { total, sort }]) => ({ month, total, sort }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ month, total }) => ({ month, total }));
}
