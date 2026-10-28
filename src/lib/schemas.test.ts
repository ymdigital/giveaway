import { describe, expect, test } from "vitest";
import { codeSchema, createItemSchema, createListSchema, updateItemSchema, updateListSchema } from "./schemas";

describe("codeSchema", () => {
  test("normalizes before validating", () => {
    expect(codeSchema.parse("  MY-LIST-01 ")).toBe("my-list-01");
  });
  test("rejects invalid code", () => {
    expect(codeSchema.safeParse("bad").success).toBe(false);
  });
});

describe("createItemSchema", () => {
  test("requires http(s) url", () => {
    expect(createItemSchema.safeParse({ url: "ftp://x.com" }).success).toBe(false);
    expect(createItemSchema.safeParse({ url: "https://x.com/a/status/1" }).success).toBe(true);
  });
  test("enforces field limits", () => {
    const base = { url: "https://example.com" };
    expect(createItemSchema.safeParse({ ...base, title: "x".repeat(121) }).success).toBe(false);
    expect(createItemSchema.safeParse({ ...base, pickup: "x".repeat(81) }).success).toBe(false);
    expect(createItemSchema.safeParse({ ...base, note: "x".repeat(501) }).success).toBe(false);
    expect(createItemSchema.safeParse({ ...base, note: "x".repeat(500) }).success).toBe(true);
  });
  test("drops non-https images", () => {
    const parsed = createItemSchema.parse({ url: "https://a.com", image: "http://a.com/i.png" });
    expect(parsed.image).toBe("");
  });
});

describe("updateItemSchema", () => {
  test("accepts collected-only patch", () => {
    expect(updateItemSchema.parse({ collected: true })).toEqual({ collected: true });
  });
  test("rejects empty patch", () => {
    expect(updateItemSchema.safeParse({}).success).toBe(false);
  });
});

describe("pickupDates", () => {
  const base = { url: "https://x.com/a/status/1" };
  test("normalizes order and duplicates", () => {
    const parsed = createItemSchema.parse({
      ...base,
      pickupDates: [
        { date: "2026-11-16", collected: false },
        { date: "2026-11-15", collected: true },
        { date: "2026-11-16", collected: true },
      ],
    });
    expect(parsed.pickupDates).toEqual([
      { date: "2026-11-15", collected: true },
      { date: "2026-11-16", collected: true },
    ]);
  });
  test("rejects malformed or impossible dates", () => {
    expect(createItemSchema.safeParse({ ...base, pickupDates: [{ date: "15/11/2026", collected: false }] }).success).toBe(false);
    expect(createItemSchema.safeParse({ ...base, pickupDates: [{ date: "2026-02-30", collected: false }] }).success).toBe(false);
    expect(createItemSchema.safeParse({ ...base, pickupDates: [{ date: "2026-11-15" }] }).success).toBe(false);
  });
  test("caps the number of dates", () => {
    const many = Array.from({ length: 15 }, (_, i) => ({ date: `2026-11-${String(i + 1).padStart(2, "0")}`, collected: false }));
    expect(createItemSchema.safeParse({ ...base, pickupDates: many }).success).toBe(false);
  });
  test("update accepts a pickupDates-only patch", () => {
    expect(updateItemSchema.safeParse({ pickupDates: [], collected: false }).success).toBe(true);
  });
});

describe("list schemas", () => {
  test("create accepts optional theme prefs", () => {
    expect(createListSchema.parse({ code: "my-list-01", accent: "mint", colorMode: "dark" })).toEqual({
      code: "my-list-01",
      accent: "mint",
      colorMode: "dark",
    });
    expect(createListSchema.safeParse({ code: "my-list-01", colorMode: "neon" }).success).toBe(false);
  });
  test("update needs accent or colorMode", () => {
    expect(updateListSchema.safeParse({}).success).toBe(false);
    expect(updateListSchema.safeParse({ colorMode: "light" }).success).toBe(true);
    expect(updateListSchema.safeParse({ accent: "peach" }).success).toBe(true);
  });
});
