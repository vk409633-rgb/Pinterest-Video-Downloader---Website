export type RateLimitOptions = {
  intervalMs: number; // window size
  uniqueTokenPerInterval: number; // max requests per token per interval
};

// Simple in-memory rate limiter (best-effort). For production, back with Redis.
export function createRateLimiter(opts: RateLimitOptions) {
  const hits = new Map<string, { count: number; resetAt: number }>();

  return {
    take: (key: string) => {
      const now = Date.now();
      const bucket = hits.get(key);
      if (!bucket || now > bucket.resetAt) {
        hits.set(key, { count: 1, resetAt: now + opts.intervalMs });
        return { ok: true, remaining: opts.uniqueTokenPerInterval - 1, resetAt: now + opts.intervalMs };
      }
      if (bucket.count >= opts.uniqueTokenPerInterval) {
        return { ok: false, remaining: 0, resetAt: bucket.resetAt };
      }
      bucket.count += 1;
      return { ok: true, remaining: opts.uniqueTokenPerInterval - bucket.count, resetAt: bucket.resetAt };
    },
  };
}
