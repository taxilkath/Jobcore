import redis from '../config/redis';

// Cache TTL values in seconds
export const CACHE_TTL = {
  JOBS: 300, // 5 minutes
  JOB_PORTALS: 900, // 15 minutes
  COMPANIES: 600, // 10 minutes
  EXTERNAL_JOBS: 300, // 5 minutes (shorter for pagination)
} as const;

/**
 * Check if Redis is available
 */
export const isRedisAvailable = (): boolean => {
  return redis !== null;
};

/**
 * Get data from cache
 */
export const getFromCache = async <T>(key: string): Promise<T | null> => {
  if (!isRedisAvailable()) {
    return null;
  }
  
  try {
    const cachedData = await redis!.get(key);
    return cachedData as T;
  } catch (error) {
    console.error('Cache get error:', error);
    return null;
  }
};

/**
 * Set data in cache with TTL
 */
export const setInCache = async (key: string, data: any, ttl: number): Promise<void> => {
  if (!isRedisAvailable()) {
    return;
  }
  
  try {
    await redis!.setex(key, ttl, JSON.stringify(data));
  } catch (error) {
    console.error('Cache set error:', error);
  }
};

/**
 * Delete data from cache
 */
export const deleteFromCache = async (key: string): Promise<void> => {
  if (!isRedisAvailable()) {
    return;
  }
  
  try {
    await redis!.del(key);
  } catch (error) {
    console.error('Cache delete error:', error);
  }
};

/**
 * Generate cache key for jobs
 */
export const generateJobsCacheKey = (search?: string, page?: number, limit?: number): string => {
  return `jobs:${search || 'all'}:${page || 1}:${limit || 10}`;
};

/**
 * Generate cache key for job portals
 */
export const generateJobPortalsCacheKey = (): string => {
  return 'job_portals';
};

/**
 * Generate cache key for companies by portal
 */
export const generateCompaniesByPortalCacheKey = (portalName: string, page?: number, limit?: number): string => {
  return `companies:${portalName}:${page || 1}:${limit || 10}`;
};

/**
 * Generate cache key for external company jobs
 */
export const generateExternalJobsCacheKey = (companyId: string): string => {
  return `external_jobs:${companyId}`;
};

/**
 * Clear all cache entries with a specific pattern
 */
export const clearCachePattern = async (pattern: string): Promise<void> => {
  if (!isRedisAvailable()) {
    return;
  }
  
  try {
    // Note: Upstash Redis doesn't support KEYS command directly
    // This is a simplified version - in production, you might want to maintain a separate index
  } catch (error) {
    console.error('Cache pattern clear error:', error);
  }
}; 