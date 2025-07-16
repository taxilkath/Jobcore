import { Request, Response } from 'express';
import Job from '../models/Job';
import Company from '../models/Company';
import JobPortal from '../models/JobPortal';
import { deleteFromCache, generateJobsCacheKey, generateJobPortalsCacheKey, generateCompaniesByPortalCacheKey } from '../utils/cache';
import { externalJobService } from '../services/externalJobService';
import { searchService } from '../services/searchService';

const defaultPortals = [
  { name: 'Lever', pattern: 'lever\\.co' },
  { name: 'Greenhouse', pattern: 'greenhouse\\.io' },
  { name: 'Ashby', pattern: 'jobs\\.ashbyhq\\.com' },
  { name: 'Workday', pattern: 'myworkdayjobs\\.com' },
  { name: 'BambooHR', pattern: 'bamboohr\\.com' },
  { name: 'SmartRecruiters', pattern: 'smartrecruiters\\.com' },
];

const linkPortalsToCompanies = async () => {
  const defaultPortals = [
    { name: 'Lever', pattern: 'lever\\.co' },
    { name: 'Greenhouse', pattern: 'greenhouse\\.io' },
    { name: 'Ashby', pattern: 'jobs\\.ashbyhq\\.com' },
    { name: 'Workday', pattern: 'myworkdayjobs\\.com' },
    { name: 'BambooHR', pattern: 'bamboohr\\.com' },
    { name: 'SmartRecruiters', pattern: 'smartrecruiters\\.com' },
  ];

  for (const p of defaultPortals) {
    await JobPortal.findOneAndUpdate(
      { name: p.name },
      { $setOnInsert: { name: p.name, pattern: p.pattern, companies: [] } },
      { upsert: true, new: true }
    );
  }
  
  const allPortals = await JobPortal.find({});
  const allJobs = await Job.find({ applicationUrl: { $ne: null } }).select('company applicationUrl');
  const portalCompanyMap = new Map<string, Set<string>>();

  for (const job of allJobs) {
    if (!job.applicationUrl || !job.company) continue;
    for (const portal of allPortals) {
      const regex = new RegExp(portal.pattern, 'i');
      if (regex.test(job.applicationUrl)) {
        if (!portalCompanyMap.has(portal.name)) {
          portalCompanyMap.set(portal.name, new Set());
        }
        portalCompanyMap.get(portal.name)!.add(job.company.toString());
        break; 
      }
    }
  }

  const updatePromises = [];
  for (const [portalName, companyIdSet] of portalCompanyMap.entries()) {
    updatePromises.push(
      JobPortal.updateOne(
        { name: portalName },
        { $set: { companies: Array.from(companyIdSet) } }
      )
    );
  }
  await Promise.all(updatePromises);
};

export const getJobs = async (req: Request, res: Response): Promise<void> => {
  try {
    const { 
      search, 
      jobType, 
      page = 1, 
      limit = 10, 
      includeExternal = 'true',
      includeInternal = 'true',
      externalPageToken 
    } = req.query;
    
    const requestedLimit = Number(limit);
    const currentPage = Number(page);
    
    // Calculate proper skip count for pagination
    const skipCount = (currentPage - 1) * requestedLimit;
    
    // If only external jobs are requested
    if (includeInternal === 'false' && includeExternal === 'true') {
      try {
        
        const externalResults = await externalJobService.searchAllExternalJobs({
          query: search as string,
          limit: requestedLimit,
          pageToken: externalPageToken as string
        });


        // For external jobs, we'll use the total from the API but cap it reasonably
        const cappedTotal = Math.min(externalResults.totalJobs, 2000);
        
        res.json({
          jobs: externalResults.jobs,
          totalJobs: cappedTotal,
          currentPage: currentPage,
          totalPages: externalResults.nextPageToken ? currentPage + 1 : currentPage, // Simple pagination logic for token-based
          sources: {
            internal: 0,
            external: externalResults.jobs.length
          },
          pagination: {
            hasNextPage: !!externalResults.nextPageToken,
            nextExternalPageToken: externalResults.nextPageToken,
            isTokenBased: true
          }
        });
        return;
      } catch (externalError) {
        console.error('External job fetch failed:', externalError);
        res.json({
          jobs: [],
          totalJobs: 0,
          currentPage: currentPage,
          totalPages: 0,
          sources: { internal: 0, external: 0 },
          pagination: { hasNextPage: false }
        });
        return;
      }
    }

    // If only internal jobs are requested
    if (includeInternal === 'true' && includeExternal === 'false') {
      try {
        // Try Typesense search first
        const typesenseResults = await searchService.searchJobs({
          query: search as string || '*',
          jobType: jobType as string,
          page: currentPage,
          limit: requestedLimit
        });

        res.json({
          jobs: typesenseResults.jobs,
          totalJobs: typesenseResults.totalJobs,
          currentPage: currentPage,
          totalPages: typesenseResults.totalPages,
          sources: {
            internal: typesenseResults.jobs.length,
            external: 0
          },
          pagination: {
            hasNextPage: currentPage < typesenseResults.totalPages
          },
          searchEngine: 'typesense'
        });
        return;
      } catch (typesenseError) {
        console.log('Typesense search failed, falling back to MongoDB:', typesenseError);
        
        // Fallback to MongoDB search
      let companyIds: any[] = [];
      if (search) {
        const companies = await Company.find({ name: new RegExp(search as string, 'i') });
        companyIds = companies.map(c => c._id);
      }

      const mongoQuery: any = {};
      if (search) {
        const searchRegex = new RegExp(search as string, 'i');
        const orConditions: any[] = [
          { title: searchRegex },
          { description: searchRegex },
          { location: searchRegex },
        ];
        if (companyIds.length > 0) {
          orConditions.push({ company: { $in: companyIds } });
        }
        mongoQuery.$or = orConditions;
      }

      const [mongoJobs, mongoTotal] = await Promise.all([
        Job.find(mongoQuery)
          .populate('company')
          .sort({ publishedAt: -1 })
          .limit(requestedLimit)
          .skip(skipCount),
        Job.countDocuments(mongoQuery)
      ]);

      res.json({
        jobs: mongoJobs,
        totalJobs: mongoTotal,
        currentPage: currentPage,
        totalPages: Math.ceil(mongoTotal / requestedLimit),
        sources: {
          internal: mongoJobs.length,
          external: 0
        },
        pagination: {
          hasNextPage: currentPage < Math.ceil(mongoTotal / requestedLimit)
          },
          searchEngine: 'mongodb'
      });
      return;
      }
    }

    // Mixed results (both internal and external) - Use simpler approach
    if (includeInternal === 'true' && includeExternal === 'true') {
      // For mixed results, we'll show internal jobs first, then external
      // This provides more predictable pagination
      
      let internalJobs: any[] = [];
      let internalTotal = 0;
      
      try {
        // Try Typesense search for internal jobs first
        const typesenseResults = await searchService.searchJobs({
          query: search as string || '*',
          jobType: jobType as string,
          page: currentPage,
          limit: requestedLimit
        });
        
        internalJobs = typesenseResults.jobs;
        internalTotal = typesenseResults.totalJobs;
      } catch (typesenseError) {
        console.log('Typesense search failed, falling back to MongoDB for mixed search:', typesenseError);
        
        // Fallback to MongoDB search for internal jobs
      let companyIds: any[] = [];
      if (search) {
        const companies = await Company.find({ name: new RegExp(search as string, 'i') });
        companyIds = companies.map(c => c._id);
      }

      const mongoQuery: any = {};
      if (search) {
        const searchRegex = new RegExp(search as string, 'i');
        const orConditions: any[] = [
          { title: searchRegex },
          { description: searchRegex },
          { location: searchRegex },
        ];
        if (companyIds.length > 0) {
          orConditions.push({ company: { $in: companyIds } });
        }
        mongoQuery.$or = orConditions;
      }

      // Get total count of internal jobs
        internalTotal = await Job.countDocuments(mongoQuery);
      
      // If we're still in the internal jobs range
        if (skipCount < internalTotal) {
          const internalJobsToFetch = Math.min(requestedLimit, internalTotal - skipCount);
        const mongoJobs = await Job.find(mongoQuery)
          .populate('company')
          .sort({ publishedAt: -1 })
          .limit(internalJobsToFetch)
          .skip(skipCount);
        
          internalJobs = [...mongoJobs];
        }
      }
      
      let allJobs: any[] = [];
      let totalCombined = internalTotal;
      
      // If we're still in the internal jobs range
      if (skipCount < internalTotal) {
        allJobs = [...internalJobs];
        
        // If we have space for external jobs and fetched all available internal jobs for this page
        if (allJobs.length < requestedLimit) {
          try {
            const externalLimit = requestedLimit - allJobs.length;
            const externalResults = await externalJobService.searchAllExternalJobs({
              query: search as string,
              limit: externalLimit,
              pageToken: externalPageToken as string
            });
            
            allJobs = [...allJobs, ...externalResults.jobs];
            totalCombined = internalTotal + Math.min(externalResults.totalJobs, 500); // Cap external
          } catch (externalError) {
            console.error('External job fetch failed:', externalError);
          }
        }
      } else {
        // We're past internal jobs, fetch only external
        try {
          const externalSkip = skipCount - internalTotal;
          const externalResults = await externalJobService.searchAllExternalJobs({
            query: search as string,
            limit: requestedLimit,
            pageToken: externalPageToken as string
          });
          
          // Since external APIs don't support skip, we'll start from beginning
          // This is a limitation but provides consistent results
          allJobs = externalResults.jobs;
          totalCombined = internalTotal + Math.min(externalResults.totalJobs, 500);
        } catch (externalError) {
          console.error('External job fetch failed:', externalError);
          allJobs = [];
        }
      }

      res.json({
        jobs: allJobs,
        totalJobs: totalCombined,
        currentPage: currentPage,
        totalPages: Math.ceil(totalCombined / requestedLimit),
        sources: {
          internal: allJobs.filter(job => !job.external).length,
          external: allJobs.filter(job => job.external).length
        },
        pagination: {
          hasNextPage: currentPage < Math.ceil(totalCombined / requestedLimit)
        }
      });
      return;
    }

    // Fallback - should not reach here
    res.json({
      jobs: [],
      totalJobs: 0,
      currentPage: currentPage,
      totalPages: 0,
      sources: { internal: 0, external: 0 },
      pagination: { hasNextPage: false }
    });

  } catch (error) {
    console.error('Error in getJobs:', error);
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};

export const createJob = async (req: Request, res: Response): Promise<void> => {
  const job = new Job({
    title: req.body.title,
    company: req.body.company,
    location: req.body.location,
    description: req.body.description,
    requirements: req.body.requirements,
    salary: req.body.salary,
    url: req.body.url,
    applicationUrl: req.body.applicationUrl,
  });

  try {
    const newJob = await job.save();
    
    // Index the new job to Typesense
    try {
      await newJob.populate('company');
      await searchService.indexJob(newJob);
      console.log('Job indexed to Typesense successfully');
    } catch (typesenseError) {
      console.error('Failed to index job to Typesense:', typesenseError);
      // Don't fail the request if indexing fails
    }
    
    // Invalidate relevant caches when a new job is created
    try {
      // Clear job portals cache
      await deleteFromCache(generateJobPortalsCacheKey());
      
      // Clear jobs cache (for various search combinations)
      // Note: This is a simplified approach - in production, you might want to be more specific
      await deleteFromCache(generateJobsCacheKey());
      await deleteFromCache(generateJobsCacheKey('all'));
      
      // If we know the company, clear company-specific caches
      if (req.body.company) {
        const company = await Company.findById(req.body.company).populate('jobportal_id');
        if (company && company.jobportal_id) {
          const portal = company.jobportal_id as any;
          await deleteFromCache(generateCompaniesByPortalCacheKey(portal.name));
        }
      }
      
    } catch (cacheError) {
      console.error('Cache invalidation error:', cacheError);
      // Don't fail the request if cache invalidation fails
    }
    
    res.status(201).json(newJob);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(400).json({ message: 'An unknown error occurred' });
    }
  }
};

export const getJobPortals = async (req: Request, res: Response): Promise<void> => {
  try {
    const portals = await JobPortal.find({});
    const portalData = [];

    for (const portal of portals) {
      // Count companies for this portal
      const companyCount = await Company.countDocuments({ jobportal_id: portal._id });
      
      if (companyCount > 0) {
        // Get company IDs for this portal
        const companies = await Company.find({ jobportal_id: portal._id }).select('_id');
        const companyIds = companies.map(c => c._id);
        
        // Count jobs for these companies
        const jobCount = await Job.countDocuments({ company: { $in: companyIds } });
        
        // Include portal if it has companies, regardless of job count
        portalData.push({
          _id: portal._id,
          name: portal.name,
          jobCount,
          companyCount
        });
      }
    }
    res.json(portalData);
  } catch (error) {
    console.error('Error in getJobPortals:', error);
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};

export const clearJobPortalsCache = async (req: Request, res: Response): Promise<void> => {
  try {
    await deleteFromCache(generateJobPortalsCacheKey());
    res.json({ message: 'Job portals cache cleared successfully' });
  } catch (error) {
    console.error('Error clearing job portals cache:', error);
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};

export const clearAllCache = async (req: Request, res: Response): Promise<void> => {
  try {
    // Clear all major cache keys
    await deleteFromCache(generateJobPortalsCacheKey());
    await deleteFromCache(generateJobsCacheKey());
    await deleteFromCache(generateJobsCacheKey('all'));
    
    res.json({ message: 'All caches cleared successfully' });
  } catch (error) {
    console.error('Error clearing all caches:', error);
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};

export const initializeTypesenseCollection = async (req: Request, res: Response): Promise<void> => {
  try {
    await searchService.initializeCollection();
    res.json({ message: 'Typesense collection initialized successfully' });
  } catch (error) {
    console.error('Error initializing Typesense collection:', error);
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};

export const bulkIndexJobs = async (req: Request, res: Response): Promise<void> => {
  try {
    // Initialize collection first
    await searchService.initializeCollection();
    
    // Get total job count
    const totalJobs = await Job.countDocuments({});
    
    if (totalJobs === 0) {
      res.json({ message: 'No jobs found to index' });
      return;
    }

    const batchSize = 5000; // Process in smaller batches
    const totalBatches = Math.ceil(totalJobs / batchSize);
    let totalIndexed = 0;
    const results = [];

    console.log(`Starting bulk indexing of ${totalJobs} jobs in ${totalBatches} batches...`);

    for (let batch = 0; batch < totalBatches; batch++) {
      const skip = batch * batchSize;
      console.log(`Processing batch ${batch + 1}/${totalBatches} (${skip + 1}-${Math.min(skip + batchSize, totalJobs)})`);
      
      try {
        // Get jobs in batches with populated company data
        const jobs = await Job.find({})
          .populate('company')
          .skip(skip)
          .limit(batchSize)
          .lean(); // Use lean() for better performance
        
        if (jobs.length === 0) {
          console.log(`No jobs found in batch ${batch + 1}`);
          continue;
        }

        // Bulk index this batch
        const batchResults = await searchService.bulkIndexJobs(jobs);
        results.push(batchResults);
        totalIndexed += jobs.length;
        
        console.log(`Batch ${batch + 1} completed: ${jobs.length} jobs indexed`);
        
        // Add a small delay to prevent overwhelming the system
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (batchError) {
        console.error(`Error in batch ${batch + 1}:`, batchError);
        results.push({ error: `Batch ${batch + 1} failed: ${batchError}` });
      }
    }
    
    res.json({ 
      message: `Bulk indexing completed: ${totalIndexed}/${totalJobs} jobs indexed`,
      totalJobs: totalJobs,
      totalIndexed: totalIndexed,
      batches: totalBatches,
      batchSize: batchSize,
      results: results
    });
  } catch (error) {
    console.error('Error bulk indexing jobs:', error);
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};

export const updateExternalJobCounts = async (req: Request, res: Response): Promise<void> => {
  try {
    let updatedCount = 0;

    // Update Workable companies
    const workablePortal = await JobPortal.findOne({ name: /workable/i });
    if (workablePortal) {
      const workableCompanies = await Company.find({ jobportal_id: workablePortal._id, slug: { $exists: true, $ne: null } });
      
      for (const company of workableCompanies) {
        try {
          const response = await fetch(`https://jobs.workable.com/api/v1/companies/${company.slug}`);
          if (response.ok) {
            const data = await response.json();
            await Company.updateOne(
              { _id: company._id },
              { posting_count: data.posting_count || 0 }
            );
            updatedCount++;
          }
        } catch (error) {
          console.error(`Failed to update Workable company ${company.name}:`, error);
        }
      }
    }

    // Update SmartRecruiters companies
    const smartRecruitersPortal = await JobPortal.findOne({ name: /smartrecruiters/i });
    if (smartRecruitersPortal) {
      const smartRecruitersCompanies = await Company.find({ jobportal_id: smartRecruitersPortal._id });
      
      for (const company of smartRecruitersCompanies) {
        try {
          const response = await fetch(`https://api.smartrecruiters.com/v1/companies/${company.name}/postings`);
          if (response.ok) {
            const data = await response.json();
            await Company.updateOne(
              { _id: company._id },
              { posting_count: data.totalFound || 0 }
            );
            updatedCount++;
          }
        } catch (error) {
          console.error(`Failed to update SmartRecruiters company ${company.name}:`, error);
        }
      }
    }

    // Clear caches after updating
    await deleteFromCache(generateJobPortalsCacheKey());
    
    res.json({ message: `Updated job counts for ${updatedCount} companies` });
  } catch (error) {
    console.error('Error updating external job counts:', error);
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};

export const getCompaniesByPortal = async (req: Request, res: Response): Promise<void> => {
  try {
    const { portalName } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    
    let portal = await JobPortal.findOne({ name: portalName });
    
    // If exact match fails, try case-insensitive search
    if (!portal) {
      portal = await JobPortal.findOne({ name: new RegExp(`^${portalName}$`, 'i') });
    }

    if (!portal) {
      res.status(404).json({ message: 'Portal not found' });
      return;
    }

    // Get total count for this portal
    const totalCompanies = await Company.countDocuments({ jobportal_id: portal._id });

    if (totalCompanies === 0) {
      res.json({
        companies: [],
        pagination: {
          currentPage: page,
          totalPages: 0,
          totalCompanies: 0,
          companiesPerPage: limit,
          hasNext: false,
          hasPrev: false
        }
      });
      return;
    }

    // Use aggregation to get companies with job counts efficiently
    const companies = await Company.aggregate([
      { 
        $match: { jobportal_id: portal._id } 
      },
      {
        $lookup: {
          from: 'jobs',
          localField: '_id',
          foreignField: 'company',
          as: 'jobs'
        }
      },
      {
        $project: {
          _id: 1,
          name: 1,
          logo: '$logo_url',
          slug: 1,
          posting_count: 1,
          jobCount: { $size: '$jobs' }
        }
      },
      {
        $skip: skip
      },
      {
        $limit: limit
      }
    ]);

    // For Workable and SmartRecruiters, use posting_count from DB or fetch from external API
    if (portal.name.toLowerCase().includes('workable')) {
      for (const company of companies) {
        if (company.posting_count && company.posting_count > 0) {
          // Use cached posting_count from database
          company.jobCount = company.posting_count;
        } else if (company.slug) {
          // Fetch from external API if no cached count
          try {
            const response = await fetch(`https://jobs.workable.com/api/v1/companies/${company.slug}`);
            if (response.ok) {
              const data = await response.json();
              company.jobCount = data.posting_count || 0;
            }
          } catch (error) {
            console.error(`Failed to fetch job count for Workable company ${company.name}:`, error);
          }
        }
      }
    }

    if (portal.name.toLowerCase().includes('smartrecruiters')) {
      for (const company of companies) {
        if (company.posting_count && company.posting_count > 0) {
          // Use cached posting_count from database
          company.jobCount = company.posting_count;
        } else {
          // Fetch from external API if no cached count
          try {
            const response = await fetch(`https://api.smartrecruiters.com/v1/companies/${company.name}/postings`);
            if (response.ok) {
              const data = await response.json();
              company.jobCount = data.totalFound || 0;
            }
          } catch (error) {
            console.error(`Failed to fetch job count for SmartRecruiters company ${company.name}:`, error);
          }
        }
      }
    }
    
    const totalPages = Math.ceil(totalCompanies / limit);
    
    
    res.json({
      companies,
      pagination: {
        currentPage: page,
        totalPages,
        totalCompanies,
        companiesPerPage: limit,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error in getCompaniesByPortal:', error);
    
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};

export const getExternalCompanyJobs = async (req: Request, res: Response): Promise<void> => {

  try {
    const { companyId } = req.params;
    const { nextPageToken, offset } = req.query; // For Workable and SmartRecruiters pagination
    
    // Get company info including portal
    const company = await Company.findById(companyId).populate('jobportal_id');
    if (!company) {
      res.status(404).json({ message: 'Company not found' });
      return;
    }

    const portal = company.jobportal_id as any;
    if (!portal) {
      res.status(404).json({ message: 'Portal not found for company' });
      return;
    }

    let externalJobs = [];
    let nextToken = null;
    
    try {
      // Determine API URL based on portal
      let apiUrl = '';
      
      if (portal.name.toLowerCase().includes('smartrecruiters')) {
        // SmartRecruiters API format: https://api.smartrecruiters.com/v1/companies/{companyName}/postings
        apiUrl = `https://api.smartrecruiters.com/v1/companies/${company.name}/postings`;
        
        // Add offset for SmartRecruiters pagination if provided
        if (offset) {
          apiUrl += `?offset=${offset}`;
        }
      } else if (portal.name.toLowerCase().includes('workable')) {
        if (!company.slug) {
          res.status(400).json({ message: `Company slug not found for Workable company: ${company.name}` });
          return;
        }
        
        apiUrl = `https://jobs.workable.com/api/v1/companies/${company.slug}`;
        
        // Add nextPageToken for pagination if provided
        if (nextPageToken) {
          apiUrl += `?nextPageToken=${nextPageToken}`;
        }
      } else if (portal.name.toLowerCase().includes('ashby')) {
        // Ashby API format: https://api.ashbyhq.com/posting-api/job-board/{companyName}
        const companySlug = company.name.toLowerCase().replace(/[^a-z0-9]/g, '');
        apiUrl = `https://api.ashbyhq.com/posting-api/job-board/${companySlug}`;
      } else if (portal.name.toLowerCase().includes('lever')) {
        // Lever API format: https://api.lever.co/v0/postings/{companyName}?mode=json
        const companySlug = company.name.toLowerCase().replace(/[^a-z0-9]/g, '');
        apiUrl = `https://api.lever.co/v0/postings/${companySlug}?mode=json`;
      } else if (portal.name.toLowerCase().includes('greenhouse')) {
        // Greenhouse API format: https://boards-api.greenhouse.io/v1/boards/{companyName}/jobs?content=true
        const companySlug = company.name.toLowerCase().replace(/[^a-z0-9]/g, '');
        apiUrl = `https://boards-api.greenhouse.io/v1/boards/${companySlug}/jobs?content=true`;
      } else if (portal.name.toLowerCase().includes('workday')) {
        // Workday jobs are stored in internal database, not fetched from external API
        const internalJobs = await Job.find({ company: companyId }).populate('company');
        res.json({
          jobs: internalJobs,
          source: 'internal',
          portal: portal.name,
          company: company.name,
          message: `Showing ${internalJobs.length} internal jobs for ${company.name}`
        });
        return;
      } else {
        res.status(400).json({ message: `External API not supported for portal: ${portal.name}` });
        return;
      }
      
      const response = await fetch(apiUrl);
      
      
      if (!response.ok) {
        // If external API fails, fall back to internal jobs
        const internalJobs = await Job.find({ company: companyId }).populate('company');
        res.json({
          jobs: internalJobs,
          source: 'internal',
          message: `External API unavailable (${response.status}), showing ${internalJobs.length} internal jobs`
        });
        return;
      }

      const data = await response.json();
      
      // Parse jobs based on portal format
      if (portal.name.toLowerCase().includes('smartrecruiters')) {
        externalJobs = data.content?.map((job: any) => ({
          id: job.id,
          title: job.name,
          department: job.department?.label || '',
          location: job.location?.fullLocation || `${job.location?.city || ''}, ${job.location?.country || ''}`.trim(),
          employmentType: job.typeOfEmployment?.label || '',
          isRemote: job.location?.remote || false,
          publishedAt: job.releasedDate,
          jobUrl: `https://jobs.smartrecruiters.com/oneclick-ui/company/${company.name}/publication/${job.uuid}`,
          applyUrl: `https://jobs.smartrecruiters.com/oneclick-ui/company/${company.name}/publication/${job.uuid}`,
          description_html: job.description || '',
          company: { name: company.name, logo_url: company.logo_url },
          refNumber: job.refNumber,
          industry: job.industry?.label,
          experienceLevel: job.experienceLevel?.label
        })) || [];
        
        // Calculate pagination info for SmartRecruiters
        const currentOffset = data.offset || 0;
        const limit = data.limit || 100;
        const totalFound = data.totalFound || 0;
        const hasMoreJobs = (currentOffset + limit) < totalFound;
        const nextOffset = hasMoreJobs ? currentOffset + limit : null;
        
        if (hasMoreJobs) {
          nextToken = nextOffset?.toString() || null;
        }
      } else if (portal.name.toLowerCase().includes('workable')) {
        externalJobs = data.jobs?.map((job: any) => ({
          id: job.id,
          title: job.title,
          department: job.department || '',
          location: job.locations?.join(', ') || job.location?.city || '',
          employmentType: job.employmentType || '',
          isRemote: job.workplace === 'remote' || job.workplace === 'hybrid',
          publishedAt: job.created,
          jobUrl: job.url,
          applyUrl: job.url,
          description_html: [
            job.description || '',
            job.company?.description ? `<hr><h3>About the Company</h3>${job.company.description}` : ''
          ].filter(Boolean).join(''),
          company: { 
            name: job.company?.title || company.name, 
            logo_url: job.company?.image || company.logo_url,
            website: job.company?.website || ''
          },
          workplace: job.workplace,
          socialSharingDescription: job.socialSharingDescription || '',
          benefitsSection: job.benefitsSection || '',
          requirementsSection: job.requirementsSection || '',
          state: job.state || 'published'
        })) || [];
        
        
        // Extract nextPageToken for pagination
        nextToken = data.nextPageToken || null;
      } else if (portal.name.toLowerCase().includes('ashby')) {
        externalJobs = data.jobs?.map((job: any) => ({
          id: job.id,
          title: job.title,
          department: job.department,
          location: job.location,
          employmentType: job.employmentType,
          isRemote: job.isRemote,
          publishedAt: job.publishedAt,
          jobUrl: job.jobUrl,
          applyUrl: job.applyUrl,
          description_html: job.descriptionHtml || job.descriptionPlain,
          company: { name: company.name, logo_url: company.logo_url }
        })) || [];
      } else if (portal.name.toLowerCase().includes('lever')) {
        externalJobs = data.map((job: any) => ({
          id: job.id,
          title: job.text,
          department: job.categories?.department,
          location: job.categories?.location,
          employmentType: job.categories?.commitment,
          publishedAt: job.createdAt,
          jobUrl: job.hostedUrl,
          applyUrl: job.applyUrl,
          description_html: job.description,
          company: { name: company.name, logo_url: company.logo_url }
        })) || [];
      } else if (portal.name.toLowerCase().includes('greenhouse')) {
        externalJobs = data.jobs?.map((job: any) => ({
          id: job.id,
          title: job.title,
          department: job.departments?.[0]?.name || '',
          location: job.location?.name || job.offices?.[0]?.name || '',
          employmentType: job.metadata?.find((m: any) => m.name === 'Employment Type')?.value || '',
          publishedAt: job.first_published || job.updated_at,
          jobUrl: job.absolute_url,
          applyUrl: job.absolute_url,
          description_html: job.content || '',
          company: { name: job.company_name || company.name, logo_url: company.logo_url },
          requisitionId: job.requisition_id,
          internalJobId: job.internal_job_id
        })) || [];
      }

      // Prepare API response with pagination info
      const apiResponseData = {
        jobs: externalJobs,
        source: 'external' as const,
        portal: portal.name,
        company: company.name,
        apiUrl: apiUrl,
        ...(portal.name.toLowerCase().includes('workable') && {
          pagination: {
            hasNextPage: !!nextToken,
            nextPageToken: nextToken,
            currentPageJobs: externalJobs.length
          }
        }),
        ...(portal.name.toLowerCase().includes('smartrecruiters') && {
          pagination: {
            hasNextPage: !!nextToken,
            nextOffset: nextToken,
            currentPageJobs: externalJobs.length,
            totalJobs: data.totalFound || 0,
            currentOffset: data.offset || 0,
            limit: data.limit || 100
          }
        })
      };

      res.json(apiResponseData);

    } catch (apiError) {
      // Fall back to internal jobs if external API fails
      const internalJobs = await Job.find({ company: companyId }).populate('company');
      res.json({
        jobs: internalJobs,
        source: 'internal',
        message: `External API error, showing ${internalJobs.length} internal jobs`
      });
    }

  } catch (error) {
    console.error('Error in getExternalCompanyJobs:', error);
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};

export const getExternalJobDetails = async (req: Request, res: Response): Promise<void> => {

  try {
    const { companyId, jobId } = req.params;
    
    // Get company info including portal
    const company = await Company.findById(companyId).populate('jobportal_id');
    if (!company) {
      res.status(404).json({ message: 'Company not found' });
      return;
    }

    const portal = company.jobportal_id as any;
    if (!portal) {
      res.status(404).json({ message: 'Portal not found for company' });
      return;
    }

    try {
      let apiUrl = '';
      
      if (portal.name.toLowerCase().includes('smartrecruiters')) {
        // SmartRecruiters individual job API: https://api.smartrecruiters.com/v1/companies/{companyName}/postings/{jobId}
        apiUrl = `https://api.smartrecruiters.com/v1/companies/${company.name}/postings/${jobId}`;
      } else if (portal.name.toLowerCase().includes('workable')) {
        // Workable doesn't need individual job API as job details are already in the listings
        res.status(400).json({ message: 'Individual job details not needed for Workable' });
        return;
      } else {
        res.status(400).json({ message: `Individual job API not supported for portal: ${portal.name}` });
        return;
      }
      
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        res.status(404).json({ message: `Job not found: ${jobId}` });
        return;
      }

      const data = await response.json();
      
      // Parse SmartRecruiters job details
      if (portal.name.toLowerCase().includes('smartrecruiters')) {
        // Function to clean and format HTML content
        const cleanHtmlContent = (htmlText: string): string => {
          // Remove empty tags and clean up formatting
          return htmlText
            .replace(/<p><\/p>/g, '') // Remove empty paragraphs
            .replace(/<p><b><\/b><\/p>/g, '') // Remove empty bold paragraphs
            .replace(/<p><b><span><\/span><\/b><\/p>/g, '') // Remove empty span paragraphs
            .replace(/<b><span><\/span><\/b>/g, '') // Remove empty bold spans
            .replace(/<span><\/span>/g, '') // Remove empty spans
            .replace(/(<p>\s*<\/p>)/g, '') // Remove paragraphs with only whitespace
            .replace(/&apos;/g, "'") // Replace HTML entities
            .replace(/\s+/g, ' ') // Replace multiple spaces with single space
            .trim();
        };

        // Parse sections into structured format for frontend rendering
        const jobSections = [];
        
        if (data.jobAd?.sections) {
          const sections = data.jobAd.sections;
          
          // Add job description section
          if (sections.jobDescription?.text) {
            const cleanText = cleanHtmlContent(sections.jobDescription.text);
            jobSections.push({
              id: 'job-description',
              title: sections.jobDescription.title || 'Job Description',
              content: cleanText,
              type: 'job-description',
              gradient: 'from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900',
              border: 'border-blue-100 dark:border-gray-700',
              accent: 'from-blue-500 to-indigo-600',
              icon: '📋'
            });
          }
          
          // Add qualifications section
          if (sections.qualifications?.text) {
            const cleanText = cleanHtmlContent(sections.qualifications.text);
            jobSections.push({
              id: 'qualifications',
              title: sections.qualifications.title || 'What You Need',
              content: cleanText,
              type: 'qualifications',
              gradient: 'from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-900',
              border: 'border-green-100 dark:border-gray-700',
              accent: 'from-green-500 to-emerald-600',
              icon: '✅'
            });
          }
          
          // Add company description section
          if (sections.companyDescription?.text) {
            const cleanText = cleanHtmlContent(sections.companyDescription.text);
            jobSections.push({
              id: 'company-description',
              title: sections.companyDescription.title || 'About the Company',
              content: cleanText,
              type: 'company-description',
              gradient: 'from-purple-50 to-violet-50 dark:from-gray-800 dark:to-gray-900',
              border: 'border-purple-100 dark:border-gray-700',
              accent: 'from-purple-500 to-violet-600',
              icon: '🏢'
            });
          }
          
          // Add additional information section
          if (sections.additionalInformation?.text) {
            const cleanText = cleanHtmlContent(sections.additionalInformation.text);
            jobSections.push({
              id: 'additional-information',
              title: sections.additionalInformation.title || 'Additional Information',
              content: cleanText,
              type: 'additional-information',
              gradient: 'from-amber-50 to-orange-50 dark:from-gray-800 dark:to-gray-900',
              border: 'border-amber-100 dark:border-gray-700',
              accent: 'from-amber-500 to-orange-600',
              icon: 'ℹ️'
            });
          }
        }
        
        const jobDetails = {
          id: data.id,
          title: data.name,
          department: data.function?.label || '',
          location: data.location?.fullLocation || `${data.location?.city || ''}, ${data.location?.country || ''}`.trim(),
          employmentType: data.typeOfEmployment?.label || '',
          isRemote: data.location?.remote || false,
          publishedAt: data.releasedDate,
          jobUrl: data.postingUrl,
          applyUrl: data.applyUrl,
          sections: jobSections,
          company: { 
            name: data.company?.name || company.name, 
            logo_url: company.logo_url 
          },
          refNumber: data.refNumber,
          industry: data.industry?.label,
          experienceLevel: data.experienceLevel?.label,
          referralUrl: data.referralUrl
        };
        
        res.json({
          job: jobDetails,
          source: 'external',
          portal: portal.name,
          apiUrl: apiUrl
        });
      }

    } catch (apiError) {
      console.error('Error fetching external job details:', apiError);
      res.status(500).json({ message: 'Failed to fetch job details from external API' });
    }

  } catch (error) {
    console.error('Error in getExternalJobDetails:', error);
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};

export const getSmartRecruitersJobDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    const { companyName, jobId } = req.params;
    try {
      // SmartRecruiters individual job API: https://api.smartrecruiters.com/v1/companies/{companyName}/postings/{jobId}
      const apiUrl = `https://api.smartrecruiters.com/v1/companies/${companyName}/postings/${jobId}`;
      
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        res.status(404).json({ message: `Job not found: ${jobId}` });
        return;
      }

      const data = await response.json();
      
      // Function to clean and format HTML content
      const cleanHtmlContent = (htmlText: string): string => {
        // Remove empty tags and clean up formatting
        return htmlText
          .replace(/<p><\/p>/g, '') // Remove empty paragraphs
          .replace(/<p><b><\/b><\/p>/g, '') // Remove empty bold paragraphs
          .replace(/<p><b><span><\/span><\/b><\/p>/g, '') // Remove empty span paragraphs
          .replace(/<b><span><\/span><\/b>/g, '') // Remove empty bold spans
          .replace(/<span><\/span>/g, '') // Remove empty spans
          .replace(/(<p>\s*<\/p>)/g, '') // Remove paragraphs with only whitespace
          .replace(/&apos;/g, "'") // Replace HTML entities
          .replace(/\s+/g, ' ') // Replace multiple spaces with single space
          .trim();
      };

      // Parse sections into structured format for frontend rendering
      const jobSections = [];
      
      if (data.jobAd?.sections) {
        const sections = data.jobAd.sections;
        
        // Add job description section
        if (sections.jobDescription?.text) {
          const cleanText = cleanHtmlContent(sections.jobDescription.text);
          jobSections.push({
            id: 'job-description',
            title: sections.jobDescription.title || 'Job Description',
            content: cleanText,
            type: 'job-description',
            gradient: 'from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900',
            border: 'border-blue-100 dark:border-gray-700',
            accent: 'from-blue-500 to-indigo-600',
            icon: '📋'
          });
        }
        
        // Add qualifications section
        if (sections.qualifications?.text) {
          const cleanText = cleanHtmlContent(sections.qualifications.text);
          jobSections.push({
            id: 'qualifications',
            title: sections.qualifications.title || 'What You Need',
            content: cleanText,
            type: 'qualifications',
            gradient: 'from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-900',
            border: 'border-green-100 dark:border-gray-700',
            accent: 'from-green-500 to-emerald-600',
            icon: '✅'
          });
        }
        
        // Add company description section
        if (sections.companyDescription?.text) {
          const cleanText = cleanHtmlContent(sections.companyDescription.text);
          jobSections.push({
            id: 'company-description',
            title: sections.companyDescription.title || 'About the Company',
            content: cleanText,
            type: 'company-description',
            gradient: 'from-purple-50 to-violet-50 dark:from-gray-800 dark:to-gray-900',
            border: 'border-purple-100 dark:border-gray-700',
            accent: 'from-purple-500 to-violet-600',
            icon: '🏢'
          });
        }
        
        // Add additional information section
        if (sections.additionalInformation?.text) {
          const cleanText = cleanHtmlContent(sections.additionalInformation.text);
          jobSections.push({
            id: 'additional-information',
            title: sections.additionalInformation.title || 'Additional Information',
            content: cleanText,
            type: 'additional-information',
            gradient: 'from-amber-50 to-orange-50 dark:from-gray-800 dark:to-gray-900',
            border: 'border-amber-100 dark:border-gray-700',
            accent: 'from-amber-500 to-orange-600',
            icon: 'ℹ️'
          });
        }
      }
      
      const jobDetails = {
        id: data.id,
        title: data.name,
        department: data.function?.label || '',
        location: data.location?.fullLocation || `${data.location?.city || ''}, ${data.location?.country || ''}`.trim(),
        employmentType: data.typeOfEmployment?.label || '',
        isRemote: data.location?.remote || false,
        publishedAt: data.releasedDate,
        jobUrl: data.postingUrl,
        applyUrl: data.applyUrl,
        sections: jobSections,
        company: { 
          name: data.company?.name || companyName, 
          logo_url: data.company?.logoUrl
        },
        refNumber: data.refNumber,
        industry: data.industry?.label,
        experienceLevel: data.experienceLevel?.label,
        referralUrl: data.referralUrl
      };
      
      res.json({
        job: jobDetails,
        source: 'external',
        portal: 'SmartRecruiters',
        apiUrl: apiUrl
      });

    } catch (apiError) {
      console.error('Error fetching SmartRecruiters job details:', apiError);
      res.status(500).json({ message: 'Failed to fetch job details from SmartRecruiters API' });
    }

  } catch (error) {
    console.error('Error in getSmartRecruitersJobDetails:', error);
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};

// Temporarily disabled - Typesense bulk indexing
// export const bulkIndexJobs = async (req: Request, res: Response): Promise<void> => {
//   res.json({ message: 'Typesense indexing is currently disabled' });
// }; 