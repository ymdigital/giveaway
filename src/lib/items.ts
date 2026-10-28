import { formatPickupDate, nextPickupDate } from "./pickup";
import type { Item } from "./types";

export type Filter = "all" | "todo" | "done";
export const FILTERS: readonly Filter[] = ["all", "todo", "done"];

export function isFilter(v: unknown): v is Filter {
  return typeof v === "string" && (FILTERS as readonly string[]).includes(v);
}

export function countItems(items: readonly Item[]) {
  const done = items.filter((i) => i.collected).length;
  return { all: items.length, done, todo: items.length - done };
}

export type SortOrder = "status" | "pickup" | "newest" | "oldest" | "title";
export const SORT_ORDERS: readonly SortOrder[] = ["status", "pickup", "newest", "oldest", "title"];

export function isSortOrder(v: unknown): v is SortOrder {
  return typeof v === "string" && (SORT_ORDERS as readonly string[]).includes(v);
}

export type ViewMode = "card" | "list";
export const VIEW_MODES: readonly ViewMode[] = ["card", "list"];

export function isViewMode(v: unknown): v is ViewMode {
  return typeof v === "string" && (VIEW_MODES as readonly string[]).includes(v);
}

/** The name shown for an item: its title, else its author, else its link. */
export function displayName(item: Item): string {
  return item.title || item.author || shortLink(item.url);
}

const byNewest = (a: Item, b: Item) => Date.parse(b.createdAt) - Date.parse(a.createdAt);

/** Nearest uncollected pickup date first; items with nothing left to pick up go last. */
function byNextPickup(a: Item, b: Item): number {
  const na = nextPickupDate(a.pickupDates);
  const nb = nextPickupDate(b.pickupDates);
  if (na === nb) return byNewest(a, b);
  if (na === null) return 1;
  if (nb === null) return -1;
  return na.localeCompare(nb);
}

const COMPARATORS: Record<SortOrder, (a: Item, b: Item) => number> = {
  status: (a, b) => (a.collected === b.collected ? byNewest(a, b) : a.collected ? 1 : -1),
  pickup: byNextPickup,
  newest: byNewest,
  oldest: (a, b) => byNewest(b, a),
  title: (a, b) => displayName(a).localeCompare(displayName(b), "th") || byNewest(a, b),
};

/** Defaults to not-collected first, then newest first. */
export function sortItems(items: readonly Item[], order: SortOrder = "status"): Item[] {
  return [...items].sort(COMPARATORS[order]);
}

export type PickupDateOption = { date: string; count: number };

/** Pickup dates that occur in `items`, ascending, with how many items have each. */
export function pickupDateOptions(items: readonly Item[]): PickupDateOption[] {
  const counts = new Map<string, number>();
  for (const i of items) {
    for (const d of new Set(i.pickupDates.map((p) => p.date))) counts.set(d, (counts.get(d) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date, count }));
}

/** `date` (YYYY-MM-DD) keeps only items picked up on that day; null keeps all. */
export function visibleItems(
  items: readonly Item[],
  filter: Filter,
  query: string,
  order: SortOrder = "status",
  date: string | null = null,
): Item[] {
  const q = query.trim().toLowerCase();
  const filtered = items
    .filter((i) => filter === "all" || (filter === "done") === i.collected)
    .filter((i) => date === null || i.pickupDates.some((d) => d.date === date))
    .filter(
      (i) =>
        !q ||
        [i.title, i.url, i.note, i.pickup, i.author, ...i.pickupDates.map((d) => formatPickupDate(d.date))]
          .join(" ")
          .toLowerCase()
          .includes(q),
    );
  return sortItems(filtered, order);
}

export function shortLink(raw: string): string {
  try {
    const url = new URL(raw);
    const first = url.pathname.split("/").filter(Boolean)[0];
    if (/(^|\.)(x|twitter)\.com$/.test(url.hostname) && first) return `@${first} · X`;
    return url.hostname.replace(/^www\./, "");
  } catch {
    return raw;
  }
}

const TITLE_FROM_TEXT_MAX = 60;

export function titleFromText(text: string): string {
  return text
    .replace(/https?:\/\/\S+/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, TITLE_FROM_TEXT_MAX);
}
