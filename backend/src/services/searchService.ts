import typesenseClient, { jobCollectionSchema } from '../config/typesense';
import { SearchParams } from 'typesense/lib/Typesense/Documents';

interface JobDocument {
  id: string;
  title: string;
  company: string;
  location: string;
  jobType: string;
  description: string;
  requirements: string[];
  salary: string;
  publishedat: number;
  apply_url: string;
}

export interface JobSearchParams {
  query?: string;
  jobType?: string;
  page?: number;
  limit?: number;
}

export interface JobSearchResult {
  jobs: any[];
  totalJobs: number;
  page: number;
  totalPages: number;
}

export class SearchService {
  private collectionName = 'jobs';

  async initializeCollection() {
    try {
      // Check if collection exists
      await typesenseClient.collections(this.collectionName).retrieve();
      console.log('Jobs collection already exists');
    } catch (error: any) {
      // If connection fails, throw to indicate Typesense is not available
      if (error.code === 'ECONNREFUSED' || error.message?.includes('ECONNREFUSED')) {
        throw new Error('Typesense server is not running');
      }
      
      // Collection doesn't exist, create it
      try {
        await typesenseClient.collections().create(jobCollectionSchema);
        console.log('Jobs collection created successfully');
      } catch (createError: any) {
        console.error('Error creating jobs collection:', createError.message);
        throw createError;
      }
    }
  }

  async indexJob(job: any) {
    try {
      const document = {
        id: job._id.toString(),
        title: job.title || '',
        company: job.company?.name || '',
        location: job.location || '',
        jobType: job.type || '',
        description: job.description || '',
        requirements: job.requirements || [],
        salary: job.salary || '',
        publishedat: new Date(job.publishedat || job.createdAt).getTime(),
        apply_url: job.apply_url || job.applyUrl || job.applicationUrl || ''
      };

      await typesenseClient.collections(this.collectionName).documents().upsert(document);
      return true;
    } catch (error) {
      console.error('Error indexing job:', error);
      return false;
    }
  }

  async searchJobs(params: JobSearchParams): Promise<JobSearchResult> {
    try {
      const {
        query = '*',
        jobType,
        page = 1,
        limit = 10
      } = params;

      const searchParams: SearchParams = {
        q: query,
        query_by: 'title,company,description,location',
        per_page: limit,
        page: page,
        sort_by: 'publishedat:desc',
        highlight_full_fields: 'title,company,description'
      };

      // Add job type filter if provided
      if (jobType && jobType !== '') {
        searchParams.filter_by = `jobType:=${jobType}`;
      }

      const searchResults = await typesenseClient
        .collections(this.collectionName)
        .documents()
        .search(searchParams);

      const jobs = searchResults.hits?.map(hit => {
        const doc = hit.document as JobDocument;
        return {
          _id: doc.id,
          title: doc.title,
          company: {
            name: doc.company
          },
          location: doc.location,
          type: doc.jobType,
          description: doc.description,
          requirements: doc.requirements,
          salary: doc.salary,
          publishedat: new Date(doc.publishedat),
          apply_url: doc.apply_url,
          // Add highlights if available
          highlights: hit.highlights
        };
      }) || [];

      const totalJobs = searchResults.found || 0;
      const totalPages = Math.ceil(totalJobs / limit);

      return {
        jobs,
        totalJobs,
        page,
        totalPages
      };
    } catch (error) {
      console.error('Error searching jobs:', error);
      // Fallback to empty results
      return {
        jobs: [],
        totalJobs: 0,
        page: 1,
        totalPages: 0
      };
    }
  }

  async bulkIndexJobs(jobs: any[]) {
    try {
      const documents = jobs.map(job => ({
        id: job._id.toString(),
        title: job.title || '',
        company: job.company?.name || '',
        location: job.location || '',
        jobType: job.type || '',
        description: job.description || '',
        requirements: job.requirements || [],
        salary: job.salary || '',
        publishedat: new Date(job.publishedat || job.createdAt).getTime(),
        apply_url: job.apply_url || job.applyUrl || job.applicationUrl || ''
      }));

      const results = await typesenseClient
        .collections(this.collectionName)
        .documents()
        .import(documents, { action: 'upsert' });

      console.log(`Bulk indexed ${jobs.length} jobs`);
      return results;
    } catch (error) {
      console.error('Error bulk indexing jobs:', error);
      throw error;
    }
  }
}

export const searchService = new SearchService(); 