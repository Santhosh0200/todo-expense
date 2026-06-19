import { describe, it, expect } from "vitest";
import { parseCategory } from "./category";
import { CATEGORIES } from "../constants";

describe("parseCategory", () => {
  it("maps food words to Food", () => {
    expect(parseCategory("lunch")).toBe("Food");
    expect(parseCategory("dinner")).toBe("Food");
  });

  it("maps transport words to Transport", () => {
    expect(parseCategory("fuel")).toBe("Transport");
    expect(parseCategory("uber ride")).toBe("Transport");
  });

  it("matches a keyword inside a larger phrase", () => {
    expect(parseCategory("Buy 2 coffees")).toBe("Food");
    expect(parseCategory("weekly groceries")).toBe("Food");
  });

  it("maps shopping, education, health and entertainment words", () => {
    expect(parseCategory("amazon order")).toBe("Shopping");
    expect(parseCategory("react course")).toBe("Education");
    expect(parseCategory("medicine")).toBe("Health");
    expect(parseCategory("movie night")).toBe("Entertainment");
  });

  it("is case-insensitive", () => {
    expect(parseCategory("LUNCH")).toBe("Food");
  });

  it("defaults to Other for unknown or empty input", () => {
    expect(parseCategory("random thing")).toBe("Other");
    expect(parseCategory("")).toBe("Other");
  });

  it("only ever returns a known category", () => {
    expect(CATEGORIES).toContain(parseCategory("fuel"));
    expect(CATEGORIES).toContain(parseCategory("xyz"));
  });
});
