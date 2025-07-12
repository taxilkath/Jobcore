import { Client } from 'typesense';

// Frontend Typesense client configuration
const typesenseClient = new Client({
  nodes: [
    {
      host: import.meta.env.VITE_TYPESENSE_HOST || 'localhost',
      port: parseInt(import.meta.env.VITE_TYPESENSE_PORT || '8108'),
      protocol: import.meta.env.VITE_TYPESENSE_PROTOCOL || 'http'
    }
  ],
  apiKey: import.meta.env.VITE_TYPESENSE_SEARCH_API_KEY || 'xyz',
  connectionTimeoutSeconds: 2
});

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

export const searchJobs = async (params: JobSearchParams): Promise<JobSearchResult> => {
  try {
    const {
      query = '*',
      jobType,
      page = 1,
      limit = 10
    } = params;

    const searchParams: any = {
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
      .collections('jobs')
      .documents()
      .search(searchParams);

    const jobs = searchResults.hits?.map(hit => ({
      _id: hit.document.id,
      title: hit.document.title,
      company: {
        name: hit.document.company
      },
      location: hit.document.location,
      type: hit.document.jobType,
      description: hit.document.description,
      requirements: hit.document.requirements,
      salary: hit.document.salary,
      publishedat: new Date(hit.document.publishedat),
      apply_url: hit.document.apply_url,
      // Add highlights if available
      highlights: hit.highlights
    })) || [];

    const totalJobs = searchResults.found || 0;
    const totalPages = Math.ceil(totalJobs / limit);

    return {
      jobs,
      totalJobs,
      page,
      totalPages
    };
  } catch (error) {
    console.error('Error searching jobs with Typesense:', error);
    // Fallback to empty results
    return {
      jobs: [],
      totalJobs: 0,
      page: 1,
      totalPages: 0
    };
  }
};

export default typesenseClient; 