export interface DateMatch {
  /** Resolved date as a local YYYY-MM-DD string (matches the `due` column). */
  date: string;
  /** Exact substring matched, so the caller can strip it from the text. */
  raw: string;
}

const WEEKDAYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
const WEEKDAY_ABBR: Record<string, number> = {
  sun: 0, mon: 1, tue: 2, tues: 2, wed: 3, thu: 4, thur: 4, thurs: 4, fri: 5, sat: 6,
};
const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

/** Local YYYY-MM-DD (avoids UTC off-by-one from toISOString). */
function fmt(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function addDays(now: Date, n: number): Date {
  return new Date(now.getFullYear(), now.getMonth(), now.getDate() + n);
}

/** Builds a date for `day` in the month nearest the future (this month or next). */
function dayOfMonth(now: Date, day: number): Date {
  const candidate = new Date(now.getFullYear(), now.getMonth(), day);
  if (candidate < new Date(now.getFullYear(), now.getMonth(), now.getDate())) {
    return new Date(now.getFullYear(), now.getMonth() + 1, day);
  }
  return candidate;
}

/** Builds a day/month date in the year nearest the future. */
function dayMonth(now: Date, day: number, monthIndex: number): Date {
  const candidate = new Date(now.getFullYear(), monthIndex, day);
  if (candidate < new Date(now.getFullYear(), now.getMonth(), now.getDate())) {
    return new Date(now.getFullYear() + 1, monthIndex, day);
  }
  return candidate;
}

type Matcher = (text: string, now: Date) => DateMatch | null;

const matchers: Matcher[] = [
  // today / tomorrow / yesterday
  (t, now) => {
    const m = /\b(today|tomorrow|tmrw|yesterday)\b/i.exec(t);
    if (!m) return null;
    const word = m[1].toLowerCase();
    const offset = word === "today" ? 0 : word === "yesterday" ? -1 : 1;
    return { date: fmt(addDays(now, offset)), raw: m[0] };
  },
  // next week
  (t, now) => {
    const m = /\bnext\s+week\b/i.exec(t);
    return m ? { date: fmt(addDays(now, 7)), raw: m[0] } : null;
  },
  // in N days
  (t, now) => {
    const m = /\bin\s+(\d+)\s+days?\b/i.exec(t);
    return m ? { date: fmt(addDays(now, parseInt(m[1], 10))), raw: m[0] } : null;
  },
  // weekday name (full or abbreviated) → next occurrence, today if it is today
  (t, now) => {
    const re = new RegExp(String.raw`\b(${WEEKDAYS.join("|")}|${Object.keys(WEEKDAY_ABBR).join("|")})\b`, "i");
    const m = re.exec(t);
    if (!m) return null;
    const word = m[1].toLowerCase();
    const target = WEEKDAYS.indexOf(word) >= 0 ? WEEKDAYS.indexOf(word) : WEEKDAY_ABBR[word];
    const delta = (target - now.getDay() + 7) % 7;
    return { date: fmt(addDays(now, delta)), raw: m[0] };
  },
  // ordinal day of month: 25th, 3rd, 1st
  (t, now) => {
    const m = /\b(\d{1,2})(st|nd|rd|th)\b/i.exec(t);
    return m ? { date: fmt(dayOfMonth(now, parseInt(m[1], 10))), raw: m[0] } : null;
  },
  // numeric dd/mm or dd/mm/yyyy
  (t, now) => {
    const m = /\b(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?\b/.exec(t);
    if (!m) return null;
    const day = parseInt(m[1], 10);
    const month = parseInt(m[2], 10) - 1;
    if (m[3]) {
      const year = m[3].length === 2 ? 2000 + parseInt(m[3], 10) : parseInt(m[3], 10);
      return { date: fmt(new Date(year, month, day)), raw: m[0] };
    }
    return { date: fmt(dayMonth(now, day, month)), raw: m[0] };
  },
  // "Mon DD" or "DD Mon"
  (t, now) => {
    const re = new RegExp(String.raw`\b(?:(${MONTHS.join("|")})\w*\s+(\d{1,2})|(\d{1,2})\s+(${MONTHS.join("|")})\w*)\b`, "i");
    const m = re.exec(t);
    if (!m) return null;
    const monthName = (m[1] || m[4]).toLowerCase();
    const day = parseInt(m[2] || m[3], 10);
    return { date: fmt(dayMonth(now, day, MONTHS.indexOf(monthName))), raw: m[0] };
  },
];

/** Extracts the first date phrase from free text, resolved against `now`. */
export function parseDate(input: string, now: Date = new Date()): DateMatch | null {
  for (const matcher of matchers) {
    const hit = matcher(input, now);
    if (hit) return hit;
  }
  return null;
}
