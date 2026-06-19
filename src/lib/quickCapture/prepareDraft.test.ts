import { describe, it, expect } from "vitest";
import { prepareDraft } from "./draft";

describe("prepareDraft — smart defaults", () => {
  it("fills a default name for an amount-only expense and focuses the name", () => {
    const { draft, focus } = prepareDraft({ type: "expense", amount: 500, name: "", category: "Other" });
    expect(draft.name).toBe("Expense");
    expect(draft.amount).toBe("500");
    expect(draft.category).toBe("Other");
    expect(focus).toBe("name");
  });

  it("fills a default text for a date-only task and focuses the text", () => {
    const { draft, focus } = prepareDraft({ type: "task", text: "", due: "2026-06-20" });
    expect(draft.text).toBe("Untitled Task");
    expect(draft.due).toBe("2026-06-20");
    expect(focus).toBe("text");
  });

  it("leaves a complete expense untouched with no forced focus", () => {
    const { draft, focus } = prepareDraft({ type: "expense", amount: 250, name: "lunch", category: "Food" });
    expect(draft.name).toBe("lunch");
    expect(focus).toBeNull();
  });

  it("leaves a complete task untouched with no forced focus", () => {
    const { draft, focus } = prepareDraft({ type: "task", text: "Call manager", due: "2026-06-18" });
    expect(draft.text).toBe("Call manager");
    expect(focus).toBeNull();
  });
});
