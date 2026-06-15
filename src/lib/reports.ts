// Pure analytics helpers for the Reports page. No React, no storage — they
// take already-filtered (by business) active records and a time range.

import type { Sale } from "../types";

export interface DateRange {
  start: Date;
  end: Date; // exclusive
}

export type PeriodKey = "today" | "week" | "month" | "prev_month" | "all";

export const PERIOD_OPTIONS: Array<{ key: PeriodKey; label: string }> = [
  { key: "today", label: "Сегодня" },
  { key: "week", label: "Неделя" },
  { key: "month", label: "Этот месяц" },
  { key: "prev_month", label: "Прошлый месяц" },
  { key: "all", label: "Всё время" },
];

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function startOfTomorrow(): Date {
  const d = startOfToday();
  d.setDate(d.getDate() + 1);
  return d;
}

export function getPeriodRange(key: PeriodKey): DateRange {
  const now = new Date();
  switch (key) {
    case "today":
      return { start: startOfToday(), end: startOfTomorrow() };
    case "week": {
      const start = startOfToday();
      const dow = (start.getDay() + 6) % 7; // Monday = 0
      start.setDate(start.getDate() - dow);
      return { start, end: startOfTomorrow() };
    }
    case "month":
      return { start: new Date(now.getFullYear(), now.getMonth(), 1), end: startOfTomorrow() };
    case "prev_month":
      return {
        start: new Date(now.getFullYear(), now.getMonth() - 1, 1),
        end: new Date(now.getFullYear(), now.getMonth(), 1),
      };
    case "all":
      return { start: new Date(0), end: startOfTomorrow() };
  }
}

/** Explicit month range, e.g. month picker. */
export function monthRange(year: number, monthIndex: number): DateRange {
  return { start: new Date(year, monthIndex, 1), end: new Date(year, monthIndex + 1, 1) };
}

export function inRange(iso: string, range: DateRange): boolean {
  const t = new Date(iso).getTime();
  return t >= range.start.getTime() && t < range.end.getTime();
}

export function filterByRange<T extends { createdAt: string }>(records: T[], range: DateRange): T[] {
  return records.filter((r) => inRange(r.createdAt, range));
}

// --- Sales by time-of-day ---------------------------------------------------

export interface TimeBucket {
  label: string;
  startHour: number;
  endHour: number;
}

export const TIME_BUCKETS: TimeBucket[] = [
  { label: "00:00–08:00", startHour: 0, endHour: 8 },
  { label: "08:00–10:00", startHour: 8, endHour: 10 },
  { label: "10:00–12:00", startHour: 10, endHour: 12 },
  { label: "12:00–14:00", startHour: 12, endHour: 14 },
  { label: "14:00–16:00", startHour: 14, endHour: 16 },
  { label: "16:00–18:00", startHour: 16, endHour: 18 },
  { label: "18:00–20:00", startHour: 18, endHour: 20 },
  { label: "20:00–00:00", startHour: 20, endHour: 24 },
];

export interface BucketResult {
  label: string;
  count: number;
  revenue: number;
}

export function getSalesByTimeBucket(sales: Sale[]): BucketResult[] {
  const results: BucketResult[] = TIME_BUCKETS.map((b) => ({ label: b.label, count: 0, revenue: 0 }));
  const otherIndex = results.length - 1;
  sales.forEach((s) => {
    const hour = new Date(s.createdAt).getHours();
    const idx = TIME_BUCKETS.findIndex((b) => b.startHour >= 0 && hour >= b.startHour && hour < b.endHour);
    const target = idx >= 0 ? idx : otherIndex;
    results[target].count += 1;
    results[target].revenue += s.total;
  });
  return results;
}

/** Best (highest-revenue) time bucket, or null if no sales. */
export function bestTimeBucket(buckets: BucketResult[]): BucketResult | null {
  const withSales = buckets.filter((b) => b.count > 0);
  if (withSales.length === 0) return null;
  return withSales.reduce((best, b) => (b.revenue > best.revenue ? b : best));
}

/** Sales counts/revenue grouped by day-of-month (1..31). */
export function getSalesByDayOfMonth(sales: Sale[]): Array<{ day: number; count: number; revenue: number }> {
  const map = new Map<number, { count: number; revenue: number }>();
  sales.forEach((s) => {
    const day = new Date(s.createdAt).getDate();
    const cur = map.get(day) ?? { count: 0, revenue: 0 };
    cur.count += 1;
    cur.revenue += s.total;
    map.set(day, cur);
  });
  return [...map.entries()]
    .map(([day, v]) => ({ day, ...v }))
    .sort((a, b) => a.day - b.day);
}
