import { describe, expect, test } from "vitest";
import { codeSchema, createItemSchema, updateItemSchema } from "./schemas";

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
