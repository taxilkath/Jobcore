import { Request, Response, NextFunction } from 'express';
import { getFromCache, setInCache } from '../utils/cache';

interface CacheOptions {
  ttl: number;
  keyGenerator?: (req: Request) => string;
}

/**
 * Cache middleware for Express routes
 */
export const cacheMiddleware = (options: CacheOptions) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Skip caching for non-GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Skip caching for external jobs requests
    const { includeExternal, includeInternal } = req.query;
    if (includeExternal === 'true' && includeInternal === 'false') {
      // Only external jobs requested - skip caching
      return next();
    }
    if (includeExternal === 'true' && includeInternal === 'true') {
      // Mixed results including external jobs - skip caching for consistency
      return next();
    }

    // Generate cache key
    const cacheKey = options.keyGenerator 
      ? options.keyGenerator(req) 
      : `${req.originalUrl}:${JSON.stringify(req.query)}`;

    try {
      // Try to get from cache
      const cachedData = await getFromCache(cacheKey);
      
      if (cachedData) {
        res.json(cachedData);
        return;
      }
      
      // Override res.json to cache the response
      const originalJson = res.json;
      res.json = function(data: any) {
        // Cache the response data
        setInCache(cacheKey, data, options.ttl);
        
        // Call original json method
        return originalJson.call(this, data);
      };

      next();
    } catch (error) {
      console.error('Cache middleware error:', error);
      // If cache fails, continue without caching
      next();
    }
  };
};

/**
 * Cache key generators for different endpoints
 */
export const cacheKeyGenerators = {
  jobs: (req: Request) => {
    const { search, page = 1, limit = 10 } = req.query;
    return `jobs:${search || 'all'}:${page}:${limit}`;
  },
  
  jobPortals: (req: Request) => {
    return 'job_portals';
  },
  
  companiesByPortal: (req: Request) => {
    const { portalName } = req.params;
    const { page = 1, limit = 10 } = req.query;
    return `companies:${portalName}:${page}:${limit}`;
  },
  
  externalJobs: (req: Request) => {
    const { companyId } = req.params;
    const { nextPageToken, offset } = req.query;
    const pageParam = nextPageToken || offset || 'first';
    return `external_jobs:${companyId}:${pageParam}`;
  }
}; 