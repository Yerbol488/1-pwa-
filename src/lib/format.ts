// Small formatting helpers shared across pages.

/** Format a number with thousands separators (ru-RU). */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat("ru-RU").format(value);
}

/** Format a value as ₸ currency, e.g. "185 000 ₸". */
export function formatTenge(value: number): string {
  return `${formatNumber(value)} ₸`;
}

/** Join class names, skipping falsy values. */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

/** True if the ISO timestamp falls on the local "today". */
export function isToday(iso: string): boolean {
  const d = new Date(iso);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

/** "15:42" */
export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** "13 июня, 15:42" — compact date + time for list cards. */
export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  const date = d.toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
  return `${date}, ${formatTime(iso)}`;
}
