type Bucket = { count: number; resetAt: number };

export type RateLimiter = {
  /** Returns true when the request is allowed. */
  check: (key: string, now?: number) => boolean;
};

const SWEEP_THRESHOLD = 5000;

// In-memory fixed-window limiter. Per serverless instance only —
// use Upstash Redis (@upstash/ratelimit) in production.
export function createRateLimiter(limit: number, windowMs: number): RateLimiter {
  const buckets = new Map<string, Bucket>();

  function sweep(now: number) {
    for (const [key, bucket] of buckets) {
      if (bucket.resetAt <= now) buckets.delete(key);
    }
  }

  return {
    check(key, now = Date.now()) {
      if (buckets.size > SWEEP_THRESHOLD) sweep(now);
      const current = buckets.get(key);
      if (!current || current.resetAt <= now) {
        buckets.set(key, { count: 1, resetAt: now + windowMs });
        return true;
      }
      if (current.count >= limit) return false;
      buckets.set(key, { ...current, count: current.count + 1 });
      return true;
    },
  };
}
