import { describe, it, expect } from "vitest";
import { toDraft, expensePayload, taskPayload } from "./draft";

describe("toDraft", () => {
  it("builds an editable draft from an expense result", () => {
    expect(toDraft({ type: "expense", amount: 1200, name: "fuel", category: "Transport" })).toEqual({
      type: "expense",
      amount: "1200",
      name: "fuel",
      category: "Transport",
      text: "fuel",
      due: "",
    });
  });

  it("builds an editable draft from a task result with a due date", () => {
    expect(toDraft({ type: "task", text: "Call manager", due: "2026-06-18" })).toEqual({
      type: "task",
      amount: "",
      name: "Call manager",
      category: "Other",
      text: "Call manager",
      due: "2026-06-18",
    });
  });

  it("represents a missing due date as an empty string", () => {
    expect(toDraft({ type: "task", text: "Buy milk", due: null }).due).toBe("");
  });
});

describe("expensePayload", () => {
  it("trims the name and converts the amount to a number", () => {
    const draft = { type: "expense" as const, amount: "250", name: "  lunch ", category: "Food", text: "", due: "" };
    expect(expensePayload(draft)).toEqual({ name: "lunch", amount: 250, category: "Food" });
  });

  it("supports decimal amounts", () => {
    const draft = { type: "expense" as const, amount: "99.50", name: "snack", category: "Food", text: "", due: "" };
    expect(expensePayload(draft).amount).toBe(99.5);
  });
});

describe("taskPayload", () => {
  it("trims the text and keeps a due date", () => {
    const draft = { type: "task" as const, amount: "", name: "", category: "Other", text: "  Pay EB bill ", due: "2026-06-19" };
    expect(taskPayload(draft)).toEqual({ text: "Pay EB bill", due: "2026-06-19" });
  });

  it("maps an empty due to null", () => {
    const draft = { type: "task" as const, amount: "", name: "", category: "Other", text: "Buy milk", due: "" };
    expect(taskPayload(draft)).toEqual({ text: "Buy milk", due: null });
  });
});
