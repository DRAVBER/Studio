import { HttpError } from './http.js';

export function createRateLimit({ windowMs = 60_000, limit = 3, now = Date.now } = {}) {
  const hits = new Map();
  let lastSweep = 0;
  return key => {
    const time = now();
    if (time - lastSweep >= windowMs) {
      for (const [ip, stamps] of hits) if (time - stamps.at(-1) >= windowMs) hits.delete(ip);
      lastSweep = time;
    }
    const fresh = (hits.get(key) || []).filter(stamp => time - stamp < windowMs);
    if (fresh.length >= limit) throw new HttpError(429, 'Слишком много заявок. Попробуйте через минуту.', { retryAfter: Math.ceil((windowMs - (time - fresh[0])) / 1000) });
    if (!hits.has(key) && hits.size >= 10_000) hits.delete(hits.keys().next().value);
    hits.set(key, [...fresh, time]);
  };
}
