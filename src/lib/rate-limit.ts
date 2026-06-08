interface RateEntry {
  count: number;
  resetAt: number;
}

const requests = new Map<string, RateEntry>();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_REQUESTS = 8;

export function checkRateLimit(identifier: string) {
  const now = Date.now();
  const current = requests.get(identifier);

  if (!current || current.resetAt <= now) {
    requests.set(identifier, {
      count: 1,
      resetAt: now + WINDOW_MS
    });
    cleanExpiredEntries(now);
    return { allowed: true, retryAfter: 0 };
  }

  if (current.count >= MAX_REQUESTS) {
    return {
      allowed: false,
      retryAfter: Math.ceil((current.resetAt - now) / 1000)
    };
  }

  current.count += 1;
  return { allowed: true, retryAfter: 0 };
}

function cleanExpiredEntries(now: number) {
  if (requests.size < 500) {
    return;
  }

  for (const [key, entry] of requests) {
    if (entry.resetAt <= now) {
      requests.delete(key);
    }
  }
}
