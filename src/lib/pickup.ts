import type { Item, PickupDate } from "./types";

/** Sorted ascending, one entry per date; a date collected in any duplicate stays collected. */
export function normalizePickupDates(dates: readonly PickupDate[]): PickupDate[] {
  const byDate = new Map<string, boolean>();
  for (const d of dates) byDate.set(d.date, (byDate.get(d.date) ?? false) || d.collected);
  return [...byDate.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, collected]) => ({ date, collected }));
}

/** Calendar selection: removes the date when selected, otherwise adds it as not collected. */
export function toggleSelectedDate(dates: readonly PickupDate[], date: string): PickupDate[] {
  if (dates.some((d) => d.date === date)) return dates.filter((d) => d.date !== date);
  return normalizePickupDates([...dates, { date, collected: false }]);
}

export function isAllCollected(dates: readonly PickupDate[]): boolean {
  return dates.length > 0 && dates.every((d) => d.collected);
}

export function setAllPickupDates(dates: readonly PickupDate[], collected: boolean): PickupDate[] {
  return dates.map((d) => ({ ...d, collected }));
}

/** Earliest date not yet collected, or null when there is none. */
export function nextPickupDate(dates: readonly PickupDate[]): string | null {
  return normalizePickupDates(dates).find((d) => !d.collected)?.date ?? null;
}

export type CollectPatch = { collected: boolean; pickupDates?: PickupDate[] };

/** The main check: flips the item, and every pickup date with it. */
export function toggleItemPatch(item: Item): CollectPatch {
  const collected = !item.collected;
  if (item.pickupDates.length === 0) return { collected };
  return { collected, pickupDates: setAllPickupDates(item.pickupDates, collected) };
}

/** One date's checkbox: the item counts as collected once every date is. */
export function togglePickupDatePatch(item: Item, date: string): Required<CollectPatch> {
  const pickupDates = item.pickupDates.map((d) => (d.date === date ? { ...d, collected: !d.collected } : d));
  return { pickupDates, collected: isAllCollected(pickupDates) };
}

const WEEKDAYS_SHORT = ["อา.", "จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส."];
const DAY_MONTH = new Intl.DateTimeFormat("th-TH", { day: "numeric", month: "short", timeZone: "UTC" });
const DAY_MONTH_YEAR = new Intl.DateTimeFormat("th-TH", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

function parseIsoDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

/** "อา. 15 พ.ย." — with the Buddhist year when it differs from `currentYear` (Gregorian). */
export function formatPickupDate(iso: string, currentYear = new Date().getFullYear()): string {
  const date = parseIsoDate(iso);
  const fmt = date.getUTCFullYear() === currentYear ? DAY_MONTH : DAY_MONTH_YEAR;
  return `${WEEKDAYS_SHORT[date.getUTCDay()]} ${fmt.format(date)}`;
}

const pad2 = (n: number) => String(n).padStart(2, "0");

/** Local calendar day as YYYY-MM-DD. */
export function toIsoDate(date: Date): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

export type MonthRef = { year: number; month: number };

export function shiftMonth({ year, month }: MonthRef, delta: number): MonthRef {
  const total = year * 12 + month + delta;
  return { year: Math.floor(total / 12), month: ((total % 12) + 12) % 12 };
}

const DAYS_PER_WEEK = 7;

/** Days of a month (month is 0-based) padded with nulls to whole Sunday-first weeks. */
export function monthGrid(year: number, month: number): (string | null)[] {
  const leading = new Date(Date.UTC(year, month, 1)).getUTCDay();
  const days = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const cells = [
    ...Array<null>(leading).fill(null),
    ...Array.from({ length: days }, (_, i) => `${year}-${pad2(month + 1)}-${pad2(i + 1)}`),
  ];
  const trailing = (DAYS_PER_WEEK - (cells.length % DAYS_PER_WEEK)) % DAYS_PER_WEEK;
  return [...cells, ...Array<null>(trailing).fill(null)];
}
