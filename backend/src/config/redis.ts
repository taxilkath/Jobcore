import { Redis } from '@upstash/redis';

// Check if Redis credentials are provided
const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

let redis: Redis | null = null;

if (REDIS_URL && REDIS_TOKEN) {
  // Initialize Redis client with Upstash credentials
  redis = new Redis({
    url: REDIS_URL,
    token: REDIS_TOKEN,
  });
} else {
  console.warn('Redis credentials not provided. Caching will be disabled.');
}

export default redis; 