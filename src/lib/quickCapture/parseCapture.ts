import { parseAmount } from "./amount";
import { parseCategory } from "./category";
import { parseDate } from "./date";

export interface ExpenseCapture {
  type: "expense";
  amount: number;
  name: string;
  category: string;
}

export interface TaskCapture {
  type: "task";
  text: string;
  due: string | null;
}

export type CaptureResult = ExpenseCapture | TaskCapture;

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function collapse(s: string): string {
  return s.replace(/\s+/g, " ").trim();
}

/** Removes the first occurrence of `raw` (any case) and tidies whitespace. */
function removeRaw(text: string, raw: string): string {
  return collapse(text.replace(new RegExp(escapeRegExp(raw), "i"), " "));
}

/** Removes a date phrase plus an optional connector word in front of it. */
function removeDatePhrase(text: string, raw: string): string {
  const re = new RegExp(String.raw`(?:\b(?:on|by|at|due|before)\s+)?${escapeRegExp(raw)}`, "i");
  return collapse(text.replace(re, " "));
}

/**
 * Parses a Quick Capture line into either an expense or a task.
 *
 * Rule: a monetary amount (> 0) makes it an expense; otherwise it is a task,
 * with any recognised date phrase resolved into `due`. Deterministic and
 * dependency-free — pass `now` to make date resolution testable.
 */
export function parseCapture(input: string, now: Date = new Date()): CaptureResult {
  const trimmed = input.trim();
  const amount = parseAmount(trimmed);

  if (amount && amount.value > 0) {
    const name = removeRaw(trimmed, amount.raw);
    return { type: "expense", amount: amount.value, name, category: parseCategory(name) };
  }

  // Task path. A zero/invalid amount token is still stripped from the text.
  let working = trimmed;
  if (amount) working = removeRaw(working, amount.raw);

  const date = parseDate(working, now);
  const text = date ? removeDatePhrase(working, date.raw) : collapse(working);

  return { type: "task", text, due: date ? date.date : null };
}
