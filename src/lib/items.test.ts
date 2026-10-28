import { describe, expect, test } from "vitest";
import { countItems, isSortOrder, isViewMode, shortLink, sortItems, titleFromText, visibleItems } from "./items";
import type { Item } from "./types";

const item = (over: Partial<Item>): Item => ({
  id: "id", url: "https://x.com/u/status/1", title: "", pickup: "", note: "", image: "",
  author: "", collected: false, createdAt: "2026-10-01T00:00:00Z", updatedAt: "2026-10-01T00:00:00Z",
  ...over,
});

const items = [
  item({ id: "old-todo", createdAt: "2026-10-01T00:00:00Z", title: "การ์ดเซ็ต" }),
  item({ id: "new-done", createdAt: "2026-10-05T00:00:00Z", collected: true, note: "รับหน้างาน" }),
  item({ id: "new-todo", createdAt: "2026-10-03T00:00:00Z", author: "@fanbase", pickup: "15 พ.ย." }),
];

describe("sortItems", () => {
  test("puts not-collected first, then newest first", () => {
    expect(sortItems(items).map((i) => i.id)).toEqual(["new-todo", "old-todo", "new-done"]);
  });
  test("newest puts the latest created first regardless of status", () => {
    expect(sortItems(items, "newest").map((i) => i.id)).toEqual(["new-done", "new-todo", "old-todo"]);
  });
  test("oldest puts the earliest created first", () => {
    expect(sortItems(items, "oldest").map((i) => i.id)).toEqual(["old-todo", "new-todo", "new-done"]);
  });
  test("title sorts by displayed name with Thai script first, newest breaking ties", () => {
    const named = [
      item({ id: "kho", title: "ขนม", createdAt: "2026-10-01T00:00:00Z" }),
      item({ id: "ko", title: "กระเป๋า" }),
      item({ id: "author", author: "@aaa" }),
      item({ id: "kho-newer", title: "ขนม", createdAt: "2026-10-09T00:00:00Z" }),
    ];
    expect(sortItems(named, "title").map((i) => i.id)).toEqual(["ko", "kho-newer", "kho", "author"]);
  });
  test("does not mutate input", () => {
    const copy = [...items];
    sortItems(items);
    expect(items).toEqual(copy);
  });
});

describe("visibleItems", () => {
  test("filters by tab", () => {
    expect(visibleItems(items, "done", "").map((i) => i.id)).toEqual(["new-done"]);
    expect(visibleItems(items, "todo", "")).toHaveLength(2);
  });
  test("applies the requested order", () => {
    expect(visibleItems(items, "todo", "", "oldest").map((i) => i.id)).toEqual(["old-todo", "new-todo"]);
  });
  test("searches title, note, pickup, author, url", () => {
    expect(visibleItems(items, "all", "การ์ด").map((i) => i.id)).toEqual(["old-todo"]);
    expect(visibleItems(items, "all", "หน้างาน").map((i) => i.id)).toEqual(["new-done"]);
    expect(visibleItems(items, "all", "15 พ.ย").map((i) => i.id)).toEqual(["new-todo"]);
    expect(visibleItems(items, "all", "FANBASE").map((i) => i.id)).toEqual(["new-todo"]);
    expect(visibleItems(items, "all", "x.com")).toHaveLength(3);
  });
});

test("countItems", () => {
  expect(countItems(items)).toEqual({ all: 3, done: 1, todo: 2 });
});

test("shortLink formats X links and hostnames", () => {
  expect(shortLink("https://x.com/fanbase/status/1")).toBe("@fanbase · X");
  expect(shortLink("https://www.example.com/a")).toBe("example.com");
  expect(shortLink("not a url")).toBe("not a url");
});

test("titleFromText strips urls and caps at 60 chars", () => {
  expect(titleFromText("แจกการ์ด https://t.co/abc   ด่วน")).toBe("แจกการ์ด ด่วน");
  expect(titleFromText("ก".repeat(80))).toHaveLength(60);
});

test("isSortOrder and isViewMode accept only known values", () => {
  expect(isSortOrder("newest")).toBe(true);
  expect(isSortOrder("random")).toBe(false);
  expect(isSortOrder(null)).toBe(false);
  expect(isViewMode("list")).toBe(true);
  expect(isViewMode("grid")).toBe(false);
});
