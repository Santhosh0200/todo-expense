import { describe, it, expect } from "vitest";
import { parseCapture } from "./parseCapture";

// Fixed reference: Wednesday, 17 June 2026 (local time).
const NOW = new Date(2026, 5, 17, 10, 0, 0);

describe("parseCapture — required examples", () => {
  it("₹250 lunch → Food expense", () => {
    expect(parseCapture("₹250 lunch", NOW)).toEqual({
      type: "expense",
      amount: 250,
      name: "lunch",
      category: "Food",
    });
  });

  it("₹1200 fuel → Transport expense", () => {
    expect(parseCapture("₹1200 fuel", NOW)).toEqual({
      type: "expense",
      amount: 1200,
      name: "fuel",
      category: "Transport",
    });
  });

  it("Call manager tomorrow → task due tomorrow", () => {
    expect(parseCapture("Call manager tomorrow", NOW)).toEqual({
      type: "task",
      text: "Call manager",
      due: "2026-06-18",
    });
  });

  it("Pay EB bill Friday → task due Friday (no amount ⇒ not an expense)", () => {
    expect(parseCapture("Pay EB bill Friday", NOW)).toEqual({
      type: "task",
      text: "Pay EB bill",
      due: "2026-06-19",
    });
  });
});

describe("parseCapture — expense edge cases", () => {
  it("handles the amount after the name", () => {
    expect(parseCapture("lunch ₹250", NOW)).toEqual({
      type: "expense",
      amount: 250,
      name: "lunch",
      category: "Food",
    });
  });

  it("keeps a quantity in the name and uses the tagged amount", () => {
    expect(parseCapture("Buy 2 coffees ₹120", NOW)).toEqual({
      type: "expense",
      amount: 120,
      name: "Buy 2 coffees",
      category: "Food",
    });
  });

  it("expands k shorthand", () => {
    expect(parseCapture("1.2k groceries", NOW)).toEqual({
      type: "expense",
      amount: 1200,
      name: "groceries",
      category: "Food",
    });
  });

  it("strips thousands separators and defaults unknown category to Other", () => {
    expect(parseCapture("1,200 rent", NOW)).toEqual({
      type: "expense",
      amount: 1200,
      name: "rent",
      category: "Other",
    });
  });

  it("amount-only input yields an expense with an empty name", () => {
    expect(parseCapture("₹500", NOW)).toEqual({
      type: "expense",
      amount: 500,
      name: "",
      category: "Other",
    });
  });
});

describe("parseCapture — task edge cases", () => {
  it("a task without a date has a null due", () => {
    expect(parseCapture("Buy milk", NOW)).toEqual({
      type: "task",
      text: "Buy milk",
      due: null,
    });
  });

  it("strips a connector word preceding the date", () => {
    expect(parseCapture("Meeting on 25th", NOW)).toEqual({
      type: "task",
      text: "Meeting",
      due: "2026-06-25",
    });
  });

  it("parses 'next week'", () => {
    expect(parseCapture("Submit report next week", NOW)).toEqual({
      type: "task",
      text: "Submit report",
      due: "2026-06-24",
    });
  });

  it("a date-only input yields a task with empty text", () => {
    expect(parseCapture("tomorrow", NOW)).toEqual({
      type: "task",
      text: "",
      due: "2026-06-18",
    });
  });
});

describe("parseCapture — invalid / empty input", () => {
  it("treats ₹0 as a task, stripping the zero amount", () => {
    expect(parseCapture("₹0 test", NOW)).toEqual({
      type: "task",
      text: "test",
      due: null,
    });
  });

  it("returns an empty task for blank input", () => {
    expect(parseCapture("", NOW)).toEqual({ type: "task", text: "", due: null });
    expect(parseCapture("   ", NOW)).toEqual({ type: "task", text: "", due: null });
  });
});
