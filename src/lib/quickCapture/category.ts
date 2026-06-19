// Keyword → category inference for Quick Capture. Categories must stay in sync
// with CATEGORIES in ../constants. Checked in priority order; first hit wins.
const KEYWORDS: ReadonlyArray<readonly [string, readonly string[]]> = [
  ["Food", ["food", "lunch", "dinner", "breakfast", "brunch", "meal", "coffee", "tea", "snack", "grocer", "restaurant", "cafe", "pizza", "burger", "swiggy", "zomato"]],
  ["Transport", ["fuel", "petrol", "diesel", "uber", "ola", "cab", "taxi", "bus", "metro", "train", "auto", "parking", "toll", "fare", "flight"]],
  ["Shopping", ["shopping", "clothes", "amazon", "flipkart", "myntra", "shoes", "dress", "mall"]],
  ["Education", ["course", "book", "tuition", "class", "exam", "fees", "udemy", "college", "school"]],
  ["Health", ["medicine", "doctor", "pharmacy", "hospital", "gym", "medical", "clinic", "meds"]],
  ["Entertainment", ["movie", "cinema", "netflix", "spotify", "game", "concert", "subscription", "prime"]],
];

/** Infers an expense category from free text, defaulting to "Other". */
export function parseCategory(text: string): string {
  const t = text.toLowerCase();
  for (const [category, words] of KEYWORDS) {
    if (words.some((w) => t.includes(w))) return category;
  }
  return "Other";
}
