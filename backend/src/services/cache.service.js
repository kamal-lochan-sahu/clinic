import getRedis from "../config/redis.js";

const TTL = 300;

export const setCache = async (key, data, ttl = TTL) => {
  const redis = getRedis();
  if (!redis) return;
  try { await redis.setex(key, ttl, JSON.stringify(data)); }
  catch (err) { console.error("Cache set error:", err.message); }
};

export const getCache = async (key) => {
  const redis = getRedis();
  if (!redis) return null;
  try { const data = await redis.get(key); return data ? JSON.parse(data) : null; }
  catch (err) { return null; }
};

export const deleteCache = async (key) => {
  const redis = getRedis();
  if (!redis) return;
  try { await redis.del(key); }
  catch (err) { console.error("Cache delete error:", err.message); }
};
