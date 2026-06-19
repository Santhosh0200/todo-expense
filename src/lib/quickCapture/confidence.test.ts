import { describe, it, expect } from "vitest";
import { parseCapture } from "./parseCapture";
import { scoreCapture } from "./confidence";

// Fixed reference: Wednesday, 17 June 2026 (local time).
const NOW = new Date(2026, 5, 17, 10, 0, 0);

function score(input: string) {
  return scoreCapture(parseCapture(input, NOW), input, NOW);
}

describe("scoreCapture", () => {
  it("rates a clean expense (amount + category + name) as high", () => {
    expect(score("₹250 lunch")).toBe("high");
    expect(score("₹1200 fuel")).toBe("high");
  });

  it("rates a clean task (text + due) as high", () => {
    expect(score("Call manager tomorrow")).toBe("high");
    expect(score("Pay EB bill Friday")).toBe("high");
  });

  it("rates an expense that also contains a date as medium (ambiguous)", () => {
    expect(score("Pay ₹1200 EB bill Friday")).toBe("medium");
    expect(score("Pay ₹1200 Friday")).toBe("medium");
  });

  it("rates an expense with an unknown category as medium", () => {
    expect(score("1,200 rent")).toBe("medium");
  });

  it("rates a task with no due date as medium", () => {
    expect(score("Buy milk")).toBe("medium");
  });

  it("rates thin inputs that lack a name or text as needs-review", () => {
    expect(score("₹500")).toBe("needs-review");
    expect(score("tomorrow")).toBe("needs-review");
  });
});
