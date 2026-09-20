const buckets = globalThis.__offbeatRateLimitBuckets || new Map();
globalThis.__offbeatRateLimitBuckets = buckets;

const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS = 8;
const CLEANUP_MS = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanup(now) {
  if (now - lastCleanup < CLEANUP_MS) return;
  lastCleanup = now;

  for (const [key, bucket] of buckets.entries()) {
    if (now - bucket.windowStart >= WINDOW_MS) buckets.delete(key);
  }
}

export function getClientKey(req, userKey = "guest") {
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
  return `${userKey}:${ip}`;
}

export function checkRateLimit(key, limit = MAX_REQUESTS) {
  const now = Date.now();
  cleanup(now);

  let bucket = buckets.get(key);

  if (!bucket || now - bucket.windowStart >= WINDOW_MS) {
    bucket = { count: 0, windowStart: now };
    buckets.set(key, bucket);
  }

  bucket.count += 1;
  const remaining = Math.max(0, limit - bucket.count);
  const resetInSeconds = Math.max(1, Math.ceil((WINDOW_MS - (now - bucket.windowStart)) / 1000));

  return {
    allowed: bucket.count <= limit,
    remaining,
    resetInSeconds,
  };
}

export function rateLimitResponse(result) {
  return Response.json(
    {
      error: "Too many requests. Please wait a minute and try again.",
      retryAfterSeconds: result.resetInSeconds,
    },
    {
      status: 429,
      headers: {
        "Retry-After": String(result.resetInSeconds),
        "X-RateLimit-Remaining": String(result.remaining),
      },
    }
  );
}
