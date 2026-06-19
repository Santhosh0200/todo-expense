import type { CaptureResult } from "./parseCapture";
import { parseDate } from "./date";

export type Confidence = "high" | "medium" | "needs-review";

/**
 * Rates how sure Fluxa is about a parsed capture.
 *
 * - "high": unambiguous and complete — safe to save in one tap.
 *     expense = amount + recognised category + name (and no competing date);
 *     task    = text + a parsed due date.
 * - "medium": classified, but worth a glance — an expense that also looks
 *     date-like, an uncategorised expense, or a task with no due date.
 * - "needs-review": missing the essentials (no name / no text).
 */
export function scoreCapture(
  result: CaptureResult,
  rawInput: string,
  now: Date = new Date(),
): Confidence {
  if (result.type === "expense") {
    if (!result.name.trim()) return "needs-review";
    if (parseDate(rawInput, now)) return "medium";
    if (result.category === "Other") return "medium";
    return "high";
  }

  if (!result.text.trim()) return "needs-review";
  if (result.due == null) return "medium";
  return "high";
}
