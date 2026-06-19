import { describe, it, expect } from "vitest";
import { parseAmount } from "./amount";

describe("parseAmount", () => {
  it("parses a ₹-prefixed amount", () => {
    expect(parseAmount("₹250 lunch")).toEqual({ value: 250, raw: "₹250" });
  });

  it("parses a larger ₹-prefixed amount", () => {
    expect(parseAmount("₹1200 fuel")).toEqual({ value: 1200, raw: "₹1200" });
  });

  it("parses a bare leading number as an amount", () => {
    expect(parseAmount("250 lunch")).toEqual({ value: 250, raw: "250" });
  });

  it("parses an amount that appears after the name", () => {
    expect(parseAmount("lunch ₹250")).toEqual({ value: 250, raw: "₹250" });
  });

  it("prefers a currency-tagged amount over a non-leading bare number", () => {
    expect(parseAmount("Buy 2 coffees ₹120")).toEqual({ value: 120, raw: "₹120" });
  });

  it("ignores a non-leading bare number with no currency tag", () => {
    expect(parseAmount("Buy 2 coffees")).toBeNull();
  });

  it("expands k shorthand", () => {
    expect(parseAmount("1.2k groceries")).toEqual({ value: 1200, raw: "1.2k" });
    expect(parseAmount("5k bonus")).toEqual({ value: 5000, raw: "5k" });
  });

  it("strips thousands separators", () => {
    expect(parseAmount("1,200 rent")).toEqual({ value: 1200, raw: "1,200" });
  });

  it("parses decimals", () => {
    expect(parseAmount("₹99.50 snack")).toEqual({ value: 99.5, raw: "₹99.50" });
  });

  it("parses rs / Rs. prefixes with or without spacing", () => {
    expect(parseAmount("rs250 lunch")).toEqual({ value: 250, raw: "rs250" });
    expect(parseAmount("Rs. 250 lunch")).toEqual({ value: 250, raw: "Rs. 250" });
  });

  it("parses a suffixed rs amount", () => {
    expect(parseAmount("250rs lunch")).toEqual({ value: 250, raw: "250rs" });
  });

  it("returns zero value for ₹0 (caller decides it is not an expense)", () => {
    expect(parseAmount("₹0 test")).toEqual({ value: 0, raw: "₹0" });
  });

  it("returns null when there is no amount", () => {
    expect(parseAmount("Call manager tomorrow")).toBeNull();
    expect(parseAmount("Pay EB bill Friday")).toBeNull();
  });

  it("does not treat a leading numeric date as an amount", () => {
    expect(parseAmount("25/06 rent")).toBeNull();
    expect(parseAmount("25th meeting")).toBeNull();
  });
});
