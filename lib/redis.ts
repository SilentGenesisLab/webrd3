import IORedis, { type Redis } from "ioredis";

declare global {
  // eslint-disable-next-line no-var
  var __webrd3Redis: Redis | undefined;
}

function buildRedis(): Redis {
  const url = process.env.REDIS_URL;
  if (!url) {
    throw new Error("REDIS_URL is not set. See .env.example for the expected format.");
  }
  return new IORedis(url, {
    maxRetriesPerRequest: 3,
    lazyConnect: false,
  });
}

export function getRedis(): Redis {
  if (!globalThis.__webrd3Redis) {
    globalThis.__webrd3Redis = buildRedis();
  }
  return globalThis.__webrd3Redis;
}

// Test seam — vitest can swap this with ioredis-mock instances per test.
export function setRedisForTesting(client: Redis | undefined): void {
  globalThis.__webrd3Redis = client;
}
