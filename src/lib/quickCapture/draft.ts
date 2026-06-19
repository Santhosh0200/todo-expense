import type { CaptureResult } from "./parseCapture";

/**
 * An editable, string-backed version of a parsed capture. Both representations
 * (expense fields and task fields) are kept populated so the type toggle is
 * lossless — switching type never discards what the user already has.
 */
export interface CaptureDraft {
  type: "expense" | "task";
  amount: string;
  name: string;
  category: string;
  text: string;
  due: string; // YYYY-MM-DD or ""
}

/** Seeds an editable draft from a parsed capture result. */
export function toDraft(result: CaptureResult): CaptureDraft {
  if (result.type === "expense") {
    return {
      type: "expense",
      amount: String(result.amount),
      name: result.name,
      category: result.category,
      text: result.name,
      due: "",
    };
  }
  return {
    type: "task",
    amount: "",
    name: result.text,
    category: "Other",
    text: result.text,
    due: result.due ?? "",
  };
}

export type DraftFocus = "name" | "amount" | "text" | "due" | null;

/**
 * Seeds an editable draft and applies smart defaults so a thin capture never
 * dead-ends: an amount-only expense gets a placeholder name, a date-only task
 * gets a placeholder title. `focus` points at the field the user should land
 * on so they can immediately overwrite the default.
 */
export function prepareDraft(result: CaptureResult): { draft: CaptureDraft; focus: DraftFocus } {
  const draft = toDraft(result);
  let focus: DraftFocus = null;

  if (draft.type === "expense") {
    if (!draft.name.trim()) {
      draft.name = "Expense";
      focus = "name";
    } else if (!(parseFloat(draft.amount) > 0)) {
      focus = "amount";
    }
  } else {
    if (!draft.text.trim()) {
      draft.text = "Untitled Task";
      focus = "text";
    }
  }

  return { draft, focus };
}

/** Builds the argument for the existing expense write path. */
export function expensePayload(draft: CaptureDraft): { name: string; amount: number; category: string } {
  return {
    name: draft.name.trim(),
    amount: parseFloat(draft.amount),
    category: draft.category,
  };
}

/** Builds the argument for the existing task write path. */
export function taskPayload(draft: CaptureDraft): { text: string; due: string | null } {
  return {
    text: draft.text.trim(),
    due: draft.due ? draft.due : null,
  };
}
