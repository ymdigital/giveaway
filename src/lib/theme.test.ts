import { describe, expect, test } from "vitest";
import { isAccent, isColorMode, isDarkMode, nextColorMode } from "./theme";

describe("isDarkMode", () => {
  test("forced modes ignore the device", () => {
    expect(isDarkMode("dark", false)).toBe(true);
    expect(isDarkMode("light", true)).toBe(false);
  });
  test("system follows the device", () => {
    expect(isDarkMode("system", true)).toBe(true);
    expect(isDarkMode("system", false)).toBe(false);
  });
});

test("toggle flips what is shown", () => {
  expect(nextColorMode(true)).toBe("light");
  expect(nextColorMode(false)).toBe("dark");
});

test("guards", () => {
  expect(isAccent("mint")).toBe(true);
  expect(isAccent("red")).toBe(false);
  expect(isColorMode("system")).toBe(true);
  expect(isColorMode(null)).toBe(false);
});
