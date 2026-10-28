import { describe, expect, test } from "vitest";
import { isValidCode, normalizeCode } from "./code";

describe("normalizeCode", () => {
  test("trims, lowercases and removes inner whitespace", () => {
    expect(normalizeCode("  Pim-Gift 2026 ")).toBe("pim-gift2026");
  });
  test("handles null/undefined", () => {
    expect(normalizeCode(undefined)).toBe("");
    expect(normalizeCode(null)).toBe("");
  });
});

describe("isValidCode", () => {
  test.each(["pim-gift-2026", "abcdefgh", "a".repeat(40), "12345678"])("accepts %s", (c) => {
    expect(isValidCode(c)).toBe(true);
  });
  test.each(["short", "a".repeat(41), "has_underscore", "UPPERCASE", "ไทยไทยไทยไทย", "with space"])(
    "rejects %s",
    (c) => {
      expect(isValidCode(c)).toBe(false);
    },
  );
});
