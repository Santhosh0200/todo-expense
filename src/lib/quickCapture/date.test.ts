import { describe, it, expect } from "vitest";
import { parseDate } from "./date";

// Fixed reference: Wednesday, 17 June 2026 (local time).
const NOW = new Date(2026, 5, 17, 10, 0, 0);

describe("parseDate", () => {
  it("parses 'tomorrow'", () => {
    expect(parseDate("call manager tomorrow", NOW)).toEqual({ date: "2026-06-18", raw: "tomorrow" });
  });

  it("parses a weekday name to the next occurrence", () => {
    expect(parseDate("pay eb bill friday", NOW)).toEqual({ date: "2026-06-19", raw: "friday" });
  });

  it("parses 'today' and 'yesterday'", () => {
    expect(parseDate("meeting today", NOW)?.date).toBe("2026-06-17");
    expect(parseDate("ping yesterday", NOW)?.date).toBe("2026-06-16");
  });

  it("resolves the current weekday to today", () => {
    expect(parseDate("standup wednesday", NOW)?.date).toBe("2026-06-17");
  });

  it("parses 'next week'", () => {
    expect(parseDate("review next week", NOW)?.date).toBe("2026-06-24");
  });

  it("parses 'in N days'", () => {
    expect(parseDate("follow up in 3 days", NOW)?.date).toBe("2026-06-20");
  });

  it("parses an ordinal day of the month", () => {
    expect(parseDate("rent on 25th", NOW)).toEqual({ date: "2026-06-25", raw: "25th" });
  });

  it("rolls an already-passed ordinal into next month", () => {
    expect(parseDate("rent on 5th", NOW)?.date).toBe("2026-07-05");
  });

  it("parses a dd/mm numeric date", () => {
    expect(parseDate("rent 25/06", NOW)?.date).toBe("2026-06-25");
  });

  it("parses a 'Mon DD' style date", () => {
    expect(parseDate("trip jun 25", NOW)?.date).toBe("2026-06-25");
  });

  it("returns null when there is no date", () => {
    expect(parseDate("buy milk", NOW)).toBeNull();
    expect(parseDate("call manager", NOW)).toBeNull();
  });
});
