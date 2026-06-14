import type { CSSProperties } from "react";
import type { Expense } from "../types";
import { CATEGORIES, CAT_COLORS, CAT_BG, CAT_ICONS } from "../lib/constants";
import { legacy } from "../lib/legacyStyles";

interface ExpensesViewProps {
  filteredExpenses: Expense[];
  total: number;
  budget: string;
  showBudgetInput: boolean;
  setShowBudgetInput: (v: boolean) => void;
  budgetEdit: string;
  setBudgetEdit: (v: string) => void;
  saveBudget: () => void;
  remaining: number | null;
  pct: number;
  barColor: string;
  catTotals: { c: string; v: number }[];
  expName: string;
  setExpName: (v: string) => void;
  expAmt: string;
  setExpAmt: (v: string) => void;
  expCat: string;
  setExpCat: (v: string) => void;
  addExpense: () => void;
  expFilter: string;
  setExpFilter: (v: string) => void;
  deleteExpense: (id: string | number) => void;
}

export function ExpensesView({
  filteredExpenses,
  total,
  budget,
  showBudgetInput,
  setShowBudgetInput,
  budgetEdit,
  setBudgetEdit,
  saveBudget,
  remaining,
  pct,
  barColor,
  catTotals,
  expName,
  setExpName,
  expAmt,
  setExpAmt,
  expCat,
  setExpCat,
  addExpense,
  expFilter,
  setExpFilter,
  deleteExpense,
}: ExpensesViewProps) {
  return (
    <div>
      <div
        style={
          {
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 8,
            marginBottom: "1.25rem",
          } as CSSProperties
        }
      >
        <div style={legacy.card}>
          <div style={{ fontSize: 11, color: "var(--color-text-secondary)", marginBottom: 3 }}>
            Total spent
          </div>
          <div style={{ fontSize: 20, fontWeight: 500, color: "#E24B4A" }}>
            ₹{total.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
          </div>
        </div>
        <div style={legacy.card}>
          <div style={{ fontSize: 11, color: "var(--color-text-secondary)", marginBottom: 3 }}>
            Budget
          </div>
          {showBudgetInput ? (
            <div style={{ display: "flex", gap: 4 } as CSSProperties}>
              <input
                value={budgetEdit}
                onChange={(e) => setBudgetEdit(e.target.value)}
                placeholder="e.g. 5000"
                style={{ ...legacy.input, padding: "4px 8px", fontSize: 13 } as CSSProperties}
              />
              <button
                onClick={saveBudget}
                style={{
                  padding: "4px 10px",
                  background: "#378ADD",
                  color: "#fff",
                  border: "none",
                  borderRadius: "var(--border-radius-md)",
                  cursor: "pointer",
                  fontSize: 12,
                }}
              >
                Save
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 6 } as CSSProperties}>
              <span style={{ fontSize: 20, fontWeight: 500, color: "var(--color-text-primary)" }}>
                {budget ? `₹${parseFloat(budget).toLocaleString("en-IN")}` : "—"}
              </span>
              <button
                onClick={() => {
                  setBudgetEdit(budget);
                  setShowBudgetInput(true);
                }}
                style={legacy.iconBtn}
              >
                <i className="ti ti-edit" aria-hidden="true" style={{ fontSize: 14 }} />
              </button>
            </div>
          )}
        </div>
        <div style={legacy.card}>
          <div style={{ fontSize: 11, color: "var(--color-text-secondary)", marginBottom: 3 }}>
            Remaining
          </div>
          <div
            style={{
              fontSize: 20,
              fontWeight: 500,
              color:
                remaining === null
                  ? "var(--color-text-tertiary)"
                  : remaining < 0
                    ? "#E24B4A"
                    : "#1D9E75",
            }}
          >
            {remaining === null
              ? "—"
              : `₹${Math.abs(remaining).toLocaleString("en-IN", { maximumFractionDigits: 0 })}${
                  remaining < 0 ? " over" : ""
                }`}
          </div>
        </div>
      </div>

      {remaining !== null && (
        <div style={{ marginBottom: "1rem" } as CSSProperties}>
          <div
            style={
              {
                height: 8,
                borderRadius: 99,
                background: "var(--color-background-secondary)",
                overflow: "hidden",
              } as CSSProperties
            }
          >
            <div
              style={
                {
                  height: "100%",
                  width: `${pct.toFixed(1)}%`,
                  background: barColor,
                  borderRadius: 99,
                } as CSSProperties
              }
            />
          </div>
          <div style={{ fontSize: 11, color: "var(--color-text-tertiary)", marginTop: 3 }}>
            {pct.toFixed(0)}% of ₹{parseFloat(budget).toLocaleString("en-IN")} used
          </div>
        </div>
      )}

      {catTotals.length > 0 && (
        <div style={{ ...legacy.card, marginBottom: "1rem" } as CSSProperties}>
          <div
            style={{
              fontSize: 12,
              color: "var(--color-text-secondary)",
              marginBottom: 10,
              fontWeight: 500,
            }}
          >
            Spending by category
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 } as CSSProperties}>
            {catTotals
              .slice()
              .sort((a, b) => b.v - a.v)
              .map(({ c, v }) => (
                <div
                  key={c}
                  style={{ display: "flex", alignItems: "center", gap: 10 } as CSSProperties}
                >
                  <span
                    style={{
                      fontSize: 12,
                      width: 90,
                      color: "var(--color-text-secondary)",
                      flexShrink: 0,
                    }}
                  >
                    {c}
                  </span>
                  <div
                    style={
                      {
                        flex: 1,
                        height: 6,
                        borderRadius: 99,
                        background: "var(--color-background-secondary)",
                        overflow: "hidden",
                      } as CSSProperties
                    }
                  >
                    <div
                      style={
                        {
                          height: "100%",
                          width: `${((v / total) * 100).toFixed(1)}%`,
                          background: CAT_COLORS[c as keyof typeof CAT_COLORS],
                          borderRadius: 99,
                        } as CSSProperties
                      }
                    />
                  </div>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 500,
                      color: "var(--color-text-primary)",
                      minWidth: 70,
                      textAlign: "right",
                    }}
                  >
                    ₹{v.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      color: "var(--color-text-tertiary)",
                      minWidth: 32,
                      textAlign: "right",
                    }}
                  >
                    {((v / total) * 100).toFixed(0)}%
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}

      <div style={{ ...legacy.card, marginBottom: "1rem" } as CSSProperties}>
        <div style={{ display: "flex", gap: 8, marginBottom: 8 } as CSSProperties}>
          <input
            value={expName}
            onChange={(e) => setExpName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addExpense()}
            placeholder="Expense name"
            style={{ ...legacy.input, flex: 2 } as CSSProperties}
          />
          <input
            value={expAmt}
            onChange={(e) => setExpAmt(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addExpense()}
            placeholder="₹ Amount"
            type="number"
            style={{ ...legacy.input, flex: 1 } as CSSProperties}
          />
        </div>
        <div style={{ display: "flex", gap: 8 } as CSSProperties}>
          <select
            value={expCat}
            onChange={(e) => setExpCat(e.target.value)}
            style={{ ...legacy.input, flex: 1 } as CSSProperties}
          >
            {CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <button
            onClick={addExpense}
            style={{
              padding: "10px 20px",
              borderRadius: "var(--border-radius-md)",
              border: "none",
              background: "#1D9E75",
              color: "#fff",
              fontWeight: 500,
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            Log expense
          </button>
        </div>
      </div>

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: "1rem" } as CSSProperties}>
        {["All", ...CATEGORIES].map((f) => (
          <button
            key={f}
            onClick={() => setExpFilter(f)}
            style={legacy.pill(expFilter === f, CAT_COLORS[f as keyof typeof CAT_COLORS] || "#378ADD")}
          >
            {f}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 } as CSSProperties}>
        {filteredExpenses.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "3rem 0",
              color: "var(--color-text-tertiary)",
              fontSize: 14,
            }}
          >
            <i
              className="ti ti-receipt"
              style={{ fontSize: 28, display: "block", marginBottom: 8 }}
              aria-hidden="true"
            />
            No expenses here
          </div>
        )}
        {filteredExpenses.map((e) => (
          <div
            key={e.id}
            style={{ ...legacy.card, display: "flex", alignItems: "center", gap: 12 } as CSSProperties}
          >
            <div
              style={
                {
                  width: 36,
                  height: 36,
                  borderRadius: "var(--border-radius-md)",
                  background: CAT_BG[e.category as keyof typeof CAT_BG],
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                } as CSSProperties
              }
            >
              <i
                className={`ti ti-${CAT_ICONS[e.category as keyof typeof CAT_ICONS]}`}
                aria-hidden="true"
                style={{ fontSize: 18, color: CAT_COLORS[e.category as keyof typeof CAT_COLORS] }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 500, color: "var(--color-text-primary)" }}>
                {e.name}
              </div>
              <div style={{ fontSize: 11, color: "var(--color-text-tertiary)", marginTop: 2 }}>
                <span
                  style={{
                    display: "inline-block",
                    padding: "1px 7px",
                    borderRadius: 99,
                    background: CAT_BG[e.category as keyof typeof CAT_BG],
                    color: CAT_COLORS[e.category as keyof typeof CAT_COLORS],
                    fontSize: 11,
                    marginRight: 6,
                  }}
                >
                  {e.category}
                </span>
                {new Date(e.date).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </div>
            </div>
            <div style={{ fontWeight: 500, fontSize: 15, color: "var(--color-text-primary)" }}>
              ₹{e.amount.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
            </div>
            <button onClick={() => deleteExpense(e.id)} style={legacy.iconBtn} title="Delete">
              <i className="ti ti-trash" aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
