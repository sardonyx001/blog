import Redis from "ioredis";

// Self-hosted Redis (plain `redis:alpine` on the `marsa-net` compose network,
// see docker-compose.yaml) — replaces the old @upstash/redis REST client.
// ioredis speaks the normal RESP protocol over TCP.
const redisUrl = process.env.REDIS_URL ?? "redis://redis:6379";

const redis = new Redis(redisUrl, {
  // keep the app booting even if redis is briefly unreachable (e.g. during
  // a compose restart) instead of crash-looping the whole process
  lazyConnect: false,
  maxRetriesPerRequest: 3,
});

redis.on("error", err => {
  console.error("redis connection error:", err.message);
});

export default redis;
