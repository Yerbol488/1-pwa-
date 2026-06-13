// Small formatting helpers shared across pages.

/** Format a number with non-breaking thin spaces as thousands separators. */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat("ru-RU").format(value).replace(/ /g, " ");
}

/** Format a value as ₸ currency, e.g. "185 000 ₸". */
export function formatTenge(value: number): string {
  return `${formatNumber(value)} ₸`;
}

/** Join class names, skipping falsy values. */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}
