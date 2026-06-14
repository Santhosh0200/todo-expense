export function formatINR(value: number, options?: Intl.NumberFormatOptions): string {
  return "₹" + value.toLocaleString("en-IN", { maximumFractionDigits: 2, ...options });
}
