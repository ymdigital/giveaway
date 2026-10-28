import { describe, expect, test } from "vitest";
import {
  formatPickupDate,
  isAllCollected,
  monthGrid,
  nextPickupDate,
  normalizePickupDates,
  setAllPickupDates,
  shiftMonth,
  toggleItemPatch,
  togglePickupDatePatch,
  toggleSelectedDate,
  toIsoDate,
} from "./pickup";
import type { Item, PickupDate } from "./types";

const d = (date: string, collected = false): PickupDate => ({ date, collected });

const item = (over: Partial<Item>): Item => ({
  id: "id", url: "https://x.com/u/status/1", title: "", pickup: "", pickupDates: [], note: "", image: "",
  author: "", collected: false, createdAt: "2026-10-01T00:00:00Z", updatedAt: "2026-10-01T00:00:00Z",
  ...over,
});

describe("normalizePickupDates", () => {
  test("sorts ascending and merges duplicates, keeping collected", () => {
    const input = [d("2026-11-16"), d("2026-11-15"), d("2026-11-16", true)];
    expect(normalizePickupDates(input)).toEqual([d("2026-11-15"), d("2026-11-16", true)]);
  });
  test("does not mutate input", () => {
    const input = [d("2026-11-16"), d("2026-11-15")];
    normalizePickupDates(input);
    expect(input.map((x) => x.date)).toEqual(["2026-11-16", "2026-11-15"]);
  });
});

describe("toggleSelectedDate", () => {
  test("adds a new date as not collected, in order", () => {
    expect(toggleSelectedDate([d("2026-11-16")], "2026-11-15")).toEqual([d("2026-11-15"), d("2026-11-16")]);
  });
  test("removes a date that is already selected", () => {
    expect(toggleSelectedDate([d("2026-11-15", true), d("2026-11-16")], "2026-11-15")).toEqual([d("2026-11-16")]);
  });
});

describe("collected state", () => {
  test("isAllCollected needs every date and at least one", () => {
    expect(isAllCollected([d("2026-11-15", true), d("2026-11-16", true)])).toBe(true);
    expect(isAllCollected([d("2026-11-15", true), d("2026-11-16")])).toBe(false);
    expect(isAllCollected([])).toBe(false);
  });
  test("setAllPickupDates marks every date", () => {
    expect(setAllPickupDates([d("2026-11-15"), d("2026-11-16", true)], true)).toEqual([
      d("2026-11-15", true),
      d("2026-11-16", true),
    ]);
  });
  test("nextPickupDate is the earliest date not yet collected", () => {
    expect(nextPickupDate([d("2026-11-15", true), d("2026-11-17"), d("2026-11-16")])).toBe("2026-11-16");
    expect(nextPickupDate([d("2026-11-15", true)])).toBeNull();
  });
});

describe("toggle patches", () => {
  test("ticking one date collects only that date", () => {
    const it = item({ pickupDates: [d("2026-11-15"), d("2026-11-16")] });
    expect(togglePickupDatePatch(it, "2026-11-15")).toEqual({
      pickupDates: [d("2026-11-15", true), d("2026-11-16")],
      collected: false,
    });
  });
  test("ticking the last remaining date collects the item", () => {
    const it = item({ pickupDates: [d("2026-11-15", true), d("2026-11-16")] });
    expect(togglePickupDatePatch(it, "2026-11-16").collected).toBe(true);
  });
  test("unticking a date of a collected item un-collects it", () => {
    const it = item({ collected: true, pickupDates: [d("2026-11-15", true), d("2026-11-16", true)] });
    expect(togglePickupDatePatch(it, "2026-11-15")).toEqual({
      pickupDates: [d("2026-11-15"), d("2026-11-16", true)],
      collected: false,
    });
  });
  test("the main check flips the item and all its dates", () => {
    const it = item({ pickupDates: [d("2026-11-15", true), d("2026-11-16")] });
    expect(toggleItemPatch(it)).toEqual({ collected: true, pickupDates: [d("2026-11-15", true), d("2026-11-16", true)] });
  });
  test("the main check sends only collected when there are no dates", () => {
    expect(toggleItemPatch(item({ collected: true }))).toEqual({ collected: false });
  });
});

describe("formatPickupDate", () => {
  test("shows weekday, day and month in Thai", () => {
    expect(formatPickupDate("2026-11-15", 2026)).toBe("อา. 15 พ.ย.");
  });
  test("adds the Buddhist year when it is not the current year", () => {
    expect(formatPickupDate("2027-01-02", 2026)).toBe("ส. 2 ม.ค. 2570");
  });
});

describe("calendar helpers", () => {
  test("monthGrid pads to whole weeks starting Sunday", () => {
    const grid = monthGrid(2026, 10); // November 2026 starts on Sunday
    expect(grid.length % 7).toBe(0);
    expect(grid[0]).toBe("2026-11-01");
    expect(grid.filter(Boolean)).toHaveLength(30);
  });
  test("monthGrid leaves leading blanks before the first day", () => {
    const grid = monthGrid(2026, 9); // October 2026 starts on Thursday
    expect(grid.slice(0, 5)).toEqual([null, null, null, null, "2026-10-01"]);
  });
  test("shiftMonth wraps across years", () => {
    expect(shiftMonth({ year: 2026, month: 11 }, 1)).toEqual({ year: 2027, month: 0 });
    expect(shiftMonth({ year: 2026, month: 0 }, -1)).toEqual({ year: 2025, month: 11 });
  });
  test("toIsoDate uses the local calendar day", () => {
    expect(toIsoDate(new Date(2026, 1, 3, 23, 30))).toBe("2026-02-03");
  });
});
