const { createClient } = require('redis');
const env = require('./env');

let redisClient = null;
let isConnected = false;
const inMemoryCache = new Map();

const initRedis = async () => {
  try {
    redisClient = createClient({ url: env.REDIS_URL });
    redisClient.on('error', (err) => {
      if (isConnected) {
        console.warn('[Redis] Connection lost, falling back to in-memory cache:', err.message);
      }
      isConnected = false;
    });
    redisClient.on('connect', () => {
      console.log('[Redis] Connected to Redis server.');
      isConnected = true;
    });
    await redisClient.connect().catch((err) => {
      console.log('[Redis] Redis not available, using in-memory caching store:', err.message);
      isConnected = false;
    });
  } catch (err) {
    console.log('[Redis] Connection failed, using fallback in-memory store.');
    isConnected = false;
  }
};

const getCache = async (key) => {
  try {
    if (isConnected && redisClient) {
      const data = await redisClient.get(key);
      return data ? JSON.parse(data) : null;
    }
  } catch (e) {
    // fallback
  }
  const item = inMemoryCache.get(key);
  if (item && item.expiry > Date.now()) {
    return item.value;
  }
  return null;
};

const setCache = async (key, value, ttlSeconds = 300) => {
  try {
    if (isConnected && redisClient) {
      await redisClient.set(key, JSON.stringify(value), { EX: ttlSeconds });
      return;
    }
  } catch (e) {
    // fallback
  }
  inMemoryCache.set(key, {
    value,
    expiry: Date.now() + ttlSeconds * 1000,
  });
};

const delCache = async (key) => {
  try {
    if (isConnected && redisClient) {
      await redisClient.del(key);
    }
  } catch (e) {}
  inMemoryCache.delete(key);
};

const invalidatePattern = async (patternKey) => {
  try {
    if (isConnected && redisClient) {
      const keys = await redisClient.keys(`${patternKey}*`);
      if (keys.length > 0) {
        await redisClient.del(keys);
      }
    }
  } catch (e) {}
  for (const k of inMemoryCache.keys()) {
    if (k.startsWith(patternKey)) {
      inMemoryCache.delete(k);
    }
  }
};

module.exports = {
  initRedis,
  getCache,
  setCache,
  delCache,
  invalidatePattern,
};
