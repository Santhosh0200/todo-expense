import type { CSSProperties } from "react";

/**
 * The original inline styles from App.tsx, relocated verbatim so the existing
 * Tasks/Expenses markup keeps working after being moved into the new shell.
 * Temporary: removed as each view is redesigned in Phases 3 & 4.
 */
export const legacy = {
  card: {
    background: "var(--color-background-primary)",
    border: "0.5px solid var(--color-border-tertiary)",
    borderRadius: "var(--border-radius-lg)",
    padding: "12px 16px",
  } as CSSProperties,
  input: {
    width: "100%",
    padding: "10px 12px",
    fontSize: 14,
    borderRadius: "var(--border-radius-md)",
    border: "0.5px solid var(--color-border-secondary)",
    background: "var(--color-background-primary)",
    color: "var(--color-text-primary)",
    boxSizing: "border-box",
  } as CSSProperties,
  pill: (active: boolean, color: string): CSSProperties => ({
    padding: "5px 14px",
    borderRadius: 99,
    fontSize: 12,
    fontWeight: active ? 500 : 400,
    border: active ? `1.5px solid ${color}` : "0.5px solid var(--color-border-tertiary)",
    background: active ? color + "18" : "transparent",
    color: active ? color : "var(--color-text-secondary)",
    cursor: "pointer",
  }),
  iconBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "var(--color-text-tertiary)",
    fontSize: 17,
    padding: "2px 4px",
    display: "flex",
    alignItems: "center",
  } as CSSProperties,
};
