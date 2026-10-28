import { expect, test } from "vitest";
import { createRateLimiter } from "./rate-limit";

test("blocks after limit within window and resets after", () => {
  const limiter = createRateLimiter(2, 1000);
  expect(limiter.check("ip", 0)).toBe(true);
  expect(limiter.check("ip", 10)).toBe(true);
  expect(limiter.check("ip", 20)).toBe(false);
  expect(limiter.check("other", 20)).toBe(true);
  expect(limiter.check("ip", 1001)).toBe(true);
});
