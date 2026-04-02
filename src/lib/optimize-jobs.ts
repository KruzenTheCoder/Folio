import crypto from "crypto";

const CACHE_TTL_MS = 1000 * 60 * 30;

const cache = new Map<string, { value: any; expiresAt: number }>();

function now() {
  return Date.now();
}

function cleanup() {
  const t = now();
  for (const [key, entry] of cache.entries()) {
    if (entry.expiresAt <= t) cache.delete(key);
  }
}

export function getOptimizeCacheKey(resume: unknown, jobDescription: string, tone: string): string {
  const normalizedResume = JSON.stringify(resume);
  return crypto.createHash("sha256").update(`${normalizedResume}::${jobDescription}::${tone}`).digest("hex");
}

export function getCachedOptimizeResult(cacheKey: string): any | null {
  cleanup();
  const entry = cache.get(cacheKey);
  if (!entry) return null;
  if (entry.expiresAt <= now()) {
    cache.delete(cacheKey);
    return null;
  }
  return entry.value;
}

export function setCachedOptimizeResult(cacheKey: string, value: any) {
  cleanup();
  cache.set(cacheKey, { value, expiresAt: now() + CACHE_TTL_MS });
}
