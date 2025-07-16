import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import SearchSection from '../components/SearchSection';
import FilterSidebar from '../components/FilterSidebar';
import JobListings from '../components/JobListings';
import { useAuth } from '../../../contexts/AuthContext';
import { searchJobs } from '../../../lib/typesense';
import { getSavedJobIds, registerSavedJobUpdateCallback } from '../../../lib/userService';

const JobsPage: React.FC = () => {
  const { user } = useAuth();
  const [urlSearchParams] = useSearchParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [savedJobIds, setSavedJobIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchParams, setSearchParams] = useState<{ query?: string; jobType?: string }>({});
  const [activeFilters, setActiveFilters] = useState({});
  const [showFilters, setShowFilters] = useState(false);
  const [totalJobs, setTotalJobs] = useState(0);
  const [jobsPerPage, setJobsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [sourceFilter, setSourceFilter] = useState<'internal' | 'external'>('internal');
  const [nextExternalPageToken, setNextExternalPageToken] = useState<string | null>(null);
  const [hasMoreJobs, setHasMoreJobs] = useState(true);
  const [searchStats, setSearchStats] = useState<{
    totalJobs: number;
    searchEngine: string;
    searchTime?: number;
  }>({
    totalJobs: 0,
    searchEngine: 'typesense',
    searchTime: undefined
  });

  // Fetch saved job IDs to filter them out
  const fetchSavedJobIds = useCallback(async () => {
    try {
      const ids = await getSavedJobIds();
      setSavedJobIds(ids);
    } catch (error) {
      console.error('Failed to fetch saved job IDs:', error);
      setSavedJobIds([]);
    }
  }, []);

  useEffect(() => {
    fetchSavedJobIds();

    // Register for saved job updates
    const unregister = registerSavedJobUpdateCallback(() => {
      fetchSavedJobIds();
    });

    return unregister;
  }, [fetchSavedJobIds]);

  const fetchJobs = useCallback(async (append = false, pageOverride?: number) => {
    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }
    
    try {
      const { query = '', jobType = '' } = searchParams;
      const pageToUse = pageOverride !== undefined ? pageOverride : currentPage;
      
      // Always use backend API which has Typesense + MongoDB fallback
      const params = new URLSearchParams({
        limit: jobsPerPage.toString(),
      });
      
      // For external jobs with infinite scroll, don't use page numbers
      if (sourceFilter !== 'external' || !append) {
        params.append('page', append ? currentPage.toString() : pageToUse.toString());
      }
      
      if (query) params.append('search', query);
      if (jobType) params.append('jobType', jobType);
      
      // Add source filter
      if (sourceFilter === 'external') {
        params.append('includeExternal', 'true');
        params.append('includeInternal', 'false');
        
        // For external jobs, use token-based pagination
        if (append && nextExternalPageToken) {
          params.append('externalPageToken', nextExternalPageToken);
        }
      } else {
        // Internal jobs only (from MongoDB)
        params.append('includeExternal', 'false');
        params.append('includeInternal', 'true');
      }
      
      const startTime = performance.now();
      const response = await fetch(`/api/jobs?${params.toString()}`);
      const data = await response.json();
      const endTime = performance.now();
      const searchTime = Math.round(endTime - startTime);
      
      // Filter out saved jobs
      const filteredJobs = data.jobs.filter((job: any) => {
        const jobId = job.id || job._id;
        return !savedJobIds.includes(jobId);
      });
      
      if (append) {
        setJobs(prev => [...prev, ...filteredJobs]);
      } else {
        setJobs(filteredJobs);
        if (pageOverride === undefined) {
          setCurrentPage(1);
        }
      }
      
      setTotalJobs(data.totalJobs);
      setJobsPerPage(10);
      
      // Update search stats
      setSearchStats({
        totalJobs: data.totalJobs,
        searchEngine: data.searchEngine || 'typesense',
        searchTime: searchTime
      });
      
      // Handle external pagination tokens
      if (data.pagination?.nextExternalPageToken) {
        setNextExternalPageToken(data.pagination.nextExternalPageToken);
        setHasMoreJobs(true);
      } else {
        setNextExternalPageToken(null);
        setHasMoreJobs(false);
      }
      
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
      if (!append) {
        setJobs([]);
        setTotalJobs(0);
      }
    } finally {
      if (append) {
        setLoadingMore(false);
      } else {
        setLoading(false);
      }
    }
  }, [searchParams, jobsPerPage, sourceFilter, nextExternalPageToken, savedJobIds, currentPage]);

  const loadMoreJobs = useCallback(async () => {
    if (sourceFilter === 'external' && nextExternalPageToken && !loadingMore) {
      await fetchJobs(true);
    } else if (sourceFilter === 'internal') {
      // For internal jobs, use traditional pagination
      setCurrentPage(prev => prev + 1);
    }
  }, [sourceFilter, nextExternalPageToken, loadingMore, fetchJobs]);

  useEffect(() => {
    fetchJobs();
  }, [searchParams, jobsPerPage, sourceFilter]);

  useEffect(() => {
    // Only fetch when currentPage changes for internal jobs (not on initial load)
    if (sourceFilter === 'internal' && currentPage > 1) {
      fetchJobs(false, currentPage);
    }
  }, [currentPage, sourceFilter]);

  // Initialize search params from URL on component mount
  useEffect(() => {
    const queryFromUrl = urlSearchParams.get('query');
    const locationFromUrl = urlSearchParams.get('location');
    
    if (queryFromUrl || locationFromUrl) {
      const initialSearchParams: { query?: string; location?: string } = {};
      
      if (queryFromUrl) {
        initialSearchParams.query = queryFromUrl;
      }
      if (locationFromUrl) {
        initialSearchParams.location = locationFromUrl;
      }
      
      setSearchParams(initialSearchParams);
    }
  }, []); // Empty dependency array to run only on mount

  const handleSearch = (searchData: any) => {
    setSearchParams(searchData);
    setCurrentPage(1);
    // Reset pagination tokens when searching
    setNextExternalPageToken(null);
    setHasMoreJobs(true);
    console.log('Search params:', searchData);
  };

  const handleFilterChange = (filters: any) => {
    setActiveFilters(filters);
    setCurrentPage(1);
    // Reset pagination tokens when filtering
    setNextExternalPageToken(null);
    setHasMoreJobs(true);
    console.log('Active filters:', filters);
  };

  const handleSourceFilterChange = (filter: 'internal' | 'external') => {
    setSourceFilter(filter);
    setCurrentPage(1); // Reset to page 1 when changing source filter
    // Reset pagination tokens when changing source filter
    setNextExternalPageToken(null);
    setHasMoreJobs(true);
  };

  const handleBookmark = (jobId: string) => {
    // This functionality will be re-implemented later
    console.log(`Bookmark action for job: ${jobId}`);
  };

  const handleApply = (jobId: string) => {
    const jobA = jobs.find((j: any) => j._id === jobId);
    if (jobA && jobA.url) {
      window.open(jobA.url, '_blank', 'noopener,noreferrer');
    } else {
      console.warn(`Application URL not found for job ${jobId}`);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleFilters = () => {
    setShowFilters(!showFilters);
    setSidebarOpen(!showFilters);
  };

  return (
    <>
      <SearchSection onSearch={handleSearch} initialSearchParams={searchParams} searchStats={searchStats} />
      <div className="transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className={`flex gap-8 transition-all duration-300 ${showFilters ? '' : 'justify-center'}`}>
            {showFilters && (
              <FilterSidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                onFilterChange={handleFilterChange}
              />
            )}
            <div className={`transition-all duration-300 ${showFilters ? 'flex-1' : 'w-full max-w-5xl'}`}>
              <JobListings
                jobs={jobs}
                totalJobs={totalJobs}
                currentPage={currentPage}
                jobsPerPage={jobsPerPage}
                onPageChange={handlePageChange}
                onBookmark={handleBookmark}
                onApply={handleApply}
                showFilters={showFilters}
                onToggleFilters={handleToggleFilters}
                loading={loading}
                loadingMore={loadingMore}
                sourceFilter={sourceFilter}
                onSourceFilterChange={handleSourceFilterChange}
                onLoadMore={loadMoreJobs}
                hasMoreJobs={hasMoreJobs}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default JobsPage; 