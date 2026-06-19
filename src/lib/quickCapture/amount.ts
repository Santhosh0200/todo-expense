export interface AmountMatch {
  /** Numeric value (commas stripped, k-shorthand expanded). */
  value: number;
  /** Exact substring matched, so the caller can strip it from the text. */
  raw: string;
}

const NUM = String.raw`[\d,]+(?:\.\d+)?`;

// Currency-tagged amounts: ₹/rs/inr prefix, "k" shorthand, or an rs/inr suffix.
const PREFIX = new RegExp(String.raw`(?:₹\s?|\b(?:rs|inr)\.?\s?)(${NUM})(k)?`, "i");
const KSUFFIX = new RegExp(String.raw`\b(${NUM})\s?k\b`, "i");
const SUFFIX = new RegExp(String.raw`\b(${NUM})\s?(?:rs|inr)\b`, "i");

// A bare number is only an amount when it is the very first token.
const LEADING = new RegExp(String.raw`^(${NUM})(k)?(?=\s|$)`, "i");

function toValue(num: string, k: boolean): number {
  const n = parseFloat(num.replace(/,/g, ""));
  return k ? n * 1000 : n;
}

/**
 * Extracts a monetary amount from free text. Currency-tagged amounts (₹, rs,
 * inr, or k-shorthand) are preferred and may appear anywhere; an untagged
 * number only counts when it leads the input. Returns null when none is found.
 */
export function parseAmount(input: string): AmountMatch | null {
  const text = input.trim();

  // Prefer the earliest currency-tagged match.
  const tagged = [PREFIX, KSUFFIX, SUFFIX]
    .map((re) => re.exec(text))
    .filter((m): m is RegExpExecArray => m !== null)
    .sort((a, b) => a.index - b.index)[0];

  if (tagged) {
    const hasK = /k$/i.test(tagged[0]);
    return { value: toValue(tagged[1], hasK), raw: tagged[0] };
  }

  const leading = LEADING.exec(text);
  if (leading) {
    return { value: toValue(leading[1], Boolean(leading[2])), raw: leading[0] };
  }

  return null;
}
