export function isOverdue(due: string | undefined): boolean {
  if (!due) return false;
  return new Date(due) < new Date(new Date().toDateString());
}

export function isDueToday(due: string | undefined): boolean {
  if (!due) return false;
  return new Date(due).toDateString() === new Date().toDateString();
}

export function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatDateShort(value: string): string {
  return new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}
