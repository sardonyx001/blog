import Redis from "ioredis";

// Self-hosted Redis (plain `redis:alpine` on the `marsa-net` compose network,
// see docker-compose.yaml) — replaces the old @upstash/redis REST client.
// ioredis speaks the normal RESP protocol over TCP.
const redisUrl = process.env.REDIS_URL ?? "redis://redis:6379";

// `next build`'s static-generation phase runs both in CI and inside the
// Dockerfile's builder stage during a deploy — neither has a real Redis to
// talk to, and neither needs one: view counts and tweet-embed caching are
// only ever read/written at request time, not baked into the static build.
// With `lazyConnect: false`, importing this module used to eagerly open a
// connection during that phase; since none of ioredis's built-in retry
// limits (maxRetriesPerRequest etc.) bound the underlying reconnect loop,
// it just kept retrying in the background for the rest of the build,
// spamming "connection error" (396 lines, ~88s, in one measured CI run) for
// no benefit. A no-op stub during the build phase skips the connection
// attempt entirely — no wait, no noise — while leaving the real client
// (and its "stay up through a brief redis restart" retry behavior) exactly
// as before for actual runtime.
const isBuildPhase = process.env.NEXT_PHASE === "phase-production-build";

const redis: Redis = isBuildPhase
  ? (new Proxy(
      {},
      {
        get: () => async () => undefined,
      }
    ) as unknown as Redis)
  : new Redis(redisUrl, {
      // keep the app booting even if redis is briefly unreachable (e.g.
      // during a compose restart) instead of crash-looping the whole
      // process
      lazyConnect: false,
      maxRetriesPerRequest: 3,
    });

if (!isBuildPhase) {
  redis.on("error", err => {
    console.error("redis connection error:", err.message);
  });
}

export default redis;
