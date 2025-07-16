import { Router } from 'express';
import { getJobs, createJob, getJobPortals, getCompaniesByPortal, getExternalCompanyJobs, getExternalJobDetails, getSmartRecruitersJobDetails, clearJobPortalsCache, clearAllCache, updateExternalJobCounts, initializeTypesenseCollection, bulkIndexJobs } from '../controllers/jobController';
import { cacheMiddleware, cacheKeyGenerators } from '../middleware/cache';
import { CACHE_TTL } from '../utils/cache';
import { externalJobService } from '../services/externalJobService';

const router = Router();

// Debug endpoint for testing external job pagination
router.get('/debug/external-pagination', async (req, res) => {
  try {
    const { query, pageToken, limit = 10 } = req.query;
    
    console.log('Debug: Testing external pagination with:', {
      query,
      pageToken,
      limit
    });
    
    const results = await externalJobService.searchAllExternalJobs({
      query: query as string,
      limit: Number(limit),
      pageToken: pageToken as string
    });
    
    res.json({
      debug: true,
      query: query,
      pageToken: pageToken,
      limit: Number(limit),
      results: {
        jobsCount: results.jobs.length,
        totalJobs: results.totalJobs,
        nextPageToken: results.nextPageToken,
        hasNextPage: !!results.nextPageToken,
        jobs: results.jobs.map(job => ({
          id: job._id,
          title: job.title,
          company: job.company.name,
          location: job.location,
          source: job.source,
          external: job.external
        }))
      }
    });
  } catch (error) {
    console.error('Debug endpoint error:', error);
    res.status(500).json({ 
      error: 'Debug endpoint failed', 
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Apply caching middleware to GET routes
router.get('/', cacheMiddleware({
  ttl: CACHE_TTL.JOBS,
  keyGenerator: cacheKeyGenerators.jobs
}), getJobs);

router.post('/', createJob);

router.get('/portals', cacheMiddleware({
  ttl: CACHE_TTL.JOB_PORTALS,
  keyGenerator: cacheKeyGenerators.jobPortals
}), getJobPortals);

// Clear cache endpoints (for development)
router.delete('/portals/cache', clearJobPortalsCache);
router.delete('/cache/all', clearAllCache);

// Update external job counts
router.post('/update-external-counts', updateExternalJobCounts);

// Typesense management endpoints
router.post('/typesense/init', initializeTypesenseCollection);
router.post('/typesense/bulk-index', bulkIndexJobs);

router.get('/portals/:portalName/companies', cacheMiddleware({
  ttl: CACHE_TTL.COMPANIES,
  keyGenerator: cacheKeyGenerators.companiesByPortal
}), getCompaniesByPortal);

router.get('/companies/:companyId/external-jobs', cacheMiddleware({
  ttl: CACHE_TTL.EXTERNAL_JOBS,
  keyGenerator: cacheKeyGenerators.externalJobs
}), getExternalCompanyJobs);

// Get individual external job details
router.get('/external-job/:companyId/:jobId', getExternalJobDetails);

// Get SmartRecruiters job details using company name from URL
router.get('/smartrecruiters/:companyName/:jobId', getSmartRecruitersJobDetails);

export default router; 