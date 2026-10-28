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

/** Not-collected first, then newest first. */
export function sortItems(items: readonly Item[]): Item[] {
  return [...items].sort((a, b) => {
    if (a.collected !== b.collected) return a.collected ? 1 : -1;
    return Date.parse(b.createdAt) - Date.parse(a.createdAt);
  });
}

export function visibleItems(items: readonly Item[], filter: Filter, query: string): Item[] {
  const q = query.trim().toLowerCase();
  const filtered = items
    .filter((i) => filter === "all" || (filter === "done") === i.collected)
    .filter(
      (i) =>
        !q ||
        [i.title, i.url, i.note, i.pickup, i.author].join(" ").toLowerCase().includes(q),
    );
  return sortItems(filtered);
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
