import Redis from "ioredis";

let redis;

const connectRedis = () => {
  if (!process.env.REDIS_URL) {
    console.warn("⚠️  REDIS_URL not set — Redis disabled");
    return null;
  }

  redis = new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      if (times > 3) return null;
      return Math.min(times * 200, 2000);
    },
  });

  redis.on("connect", () => console.log("✅ Redis Connected"));
  redis.on("error", (err) => console.error("❌ Redis Error:", err.message));

  return redis;
};

export { connectRedis };
export default () => redis;
