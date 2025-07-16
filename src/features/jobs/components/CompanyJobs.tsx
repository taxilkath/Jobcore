import React, { useState, useEffect, useCallback } from 'react';
import { ChevronRight, ArrowLeft, Search, Loader2, LayoutGrid, List, Building, MapPin, Briefcase, Clock, Users, Bookmark, Check } from 'lucide-react';
import { formatDatePosted } from '../../../lib/utils';
import { saveJobToAPIWithCallback, getSavedJobIds, registerSavedJobUpdateCallback } from '../../../lib/userService';
import { JobCard } from '../../../components/ui/JobCard';
import { InteractiveHoverButton } from '../../../components/ui/interactive-hover-button';
import JobDetailDrawer from './JobDetailDrawer';
import { useParams, useNavigate } from 'react-router-dom';

// Type definitions for external API response
interface PaginationInfo {
  hasNextPage: boolean;
  nextPageToken?: string | null;  // Workable pagination
  nextOffset?: string | null;     // SmartRecruiters pagination
  currentPageJobs: number;
  totalJobs?: number;             // SmartRecruiters total count
  currentOffset?: number;         // SmartRecruiters current offset
  limit?: number;                 // SmartRecruiters page size
}

interface ExternalJobsResponse {
  jobs: any[];
  source: 'external' | 'internal';
  portal: string;
  company: string;
  apiUrl: string;
  pagination?: PaginationInfo;
  message?: string;
}

const CompanyJobs: React.FC = () => {
  const { platformId, companyId } = useParams<{ platformId: string; companyId: string }>();
  const navigate = useNavigate();
  
  console.log('CompanyJobs companyId from URL:', companyId);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedFilters, setSelectedFilters] = useState({
    jobType: '',
    location: '',
  });
  const [jobs, setJobs] = useState<any[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<any[]>([]);
  const [savedJobIds, setSavedJobIds] = useState<string[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [source, setSource] = useState<'external' | 'internal'>('external');
  const [portal, setPortal] = useState<string>('');

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

  const fetchJobs = useCallback(async (pageToken?: string, append = false) => {
    if (!companyId) return;

    try {
      pageToken ? setLoadingMore(true) : setLoading(true);
      
      let url = `/api/jobs/companies/${companyId}/external-jobs`;
      if (pageToken) {
        // Check if this looks like a SmartRecruiters offset (numeric) or Workable token
        if (/^\d+$/.test(pageToken)) {
          // SmartRecruiters offset
          url += `?offset=${pageToken}`;
        } else {
          // Workable nextPageToken
          url += `?nextPageToken=${pageToken}`;
        }
      }

      console.log('Fetching jobs from URL:', url);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        console.error('API Error:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('Error details:', errorText);
        throw new Error(`API call failed: ${response.status} ${response.statusText}`);
      }
      
      const data: ExternalJobsResponse = await response.json();
      
      // Debug logging
      console.log('API Response:', {
        url,
        source: data.source,
        portal: data.portal,
        jobsCount: data.jobs?.length,
        pagination: data.pagination,
        append,
        message: data.message
      });
      
      // Add companyId to each job for API calls
      const jobsWithCompanyId = data.jobs.map(job => ({
        ...job,
        companyId: companyId
      }));
      
      console.log('Jobs with companyId added:', jobsWithCompanyId.length > 0 ? jobsWithCompanyId[0] : 'No jobs');

      // Filter out saved jobs
      const filteredJobsForUser = jobsWithCompanyId.filter((job: any) => {
        const jobId = job.id || job._id;
        return !savedJobIds.includes(jobId);
      });

      if (append) {
        setJobs(prev => [...prev, ...filteredJobsForUser]);
      } else {
        setJobs(filteredJobsForUser);
      }
      
      // Update pagination state for both Workable and SmartRecruiters
      if (data.pagination) {
        setHasNextPage(data.pagination.hasNextPage);
        // SmartRecruiters uses nextOffset, Workable uses nextPageToken
        const nextToken = data.pagination.nextOffset || data.pagination.nextPageToken || null;
        setNextPageToken(nextToken);
        console.log('Pagination updated:', {
          hasNextPage: data.pagination.hasNextPage,
          nextToken: nextToken,
          portal: data.portal
        });
        
        if (data.pagination.totalJobs) {
          console.log(`SmartRecruiters: Showing ${(data.pagination.currentOffset || 0) + data.jobs.length} of ${data.pagination.totalJobs} total jobs`);
        }
      } else {
        setHasNextPage(false);
        setNextPageToken(null);
        console.log('No pagination data available');
      }
      
      // Update company and portal info
      setSource(data.source);
      setPortal(data.portal);
      
      // Infer company details from first job if available
      if (data.jobs.length > 0 && data.jobs[0].company) {
        setCompany(data.jobs[0].company);
      }
      
    } catch (error) {
      console.error("Failed to fetch jobs:", error);
      // Set empty jobs array on error to show "no jobs" message
      if (!append) {
        setJobs([]);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [companyId, savedJobIds]);

  const loadMoreJobs = useCallback(() => {
    console.log('loadMoreJobs called with:', { nextPageToken, loadingMore });
    if (nextPageToken && !loadingMore) {
      fetchJobs(nextPageToken, true);
    }
  }, [nextPageToken, loadingMore, fetchJobs]);

  useEffect(() => {
    fetchJobs();
  }, [companyId]);

  // Infinite scroll effect
  useEffect(() => {
    const handleScroll = () => {
      // Check if we're near the bottom of the page
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      
      // Load more when within 500px of bottom (increased threshold)
      const nearBottom = scrollTop + windowHeight >= documentHeight - 500;
      
      // Debug logging for scroll detection
      console.log('Scroll Debug:', {
        scrollTop,
        windowHeight,
        documentHeight,
        nearBottom,
        hasNextPage,
        loadingMore,
        nextPageToken,
        shouldLoad: nearBottom && hasNextPage && !loadingMore && nextPageToken
      });
      
      if (nearBottom && hasNextPage && !loadingMore && nextPageToken) {
        console.log('Triggering loadMoreJobs from scroll');
        loadMoreJobs();
      }
    };

    // Add scroll listener
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Cleanup
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [hasNextPage, loadingMore, nextPageToken, loadMoreJobs]); // Added loadMoreJobs to dependencies

  useEffect(() => {
    let filtered = jobs.filter(job => {
      const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesJobType = !selectedFilters.jobType || job.type === selectedFilters.jobType;
      const matchesLocation = !selectedFilters.location || job.location.toLowerCase().includes(selectedFilters.location.toLowerCase());
      return matchesSearch && matchesJobType && matchesLocation;
    });
    setFilteredJobs(filtered);
  }, [searchTerm, selectedFilters, jobs]);

  const handleJobClick = (job: any) => {
    setSelectedJobId(job.id || job._id);
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setSelectedJobId(null);
  };

  const handleApply = (jobId: string) => {
    const job = jobs.find((j: any) => (j.id || j._id) === jobId);
    // For external jobs, use applyUrl or jobUrl; for internal jobs, use applicationUrl
    const applyUrl = job?.applyUrl || job?.jobUrl || job?.applicationUrl;
    if (applyUrl) {
      window.open(applyUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const selectedJob = jobs.find(job => (job?.id || job?._id) === selectedJobId);
  
  // Debug selected job
  console.log('Selected job:', selectedJob);

  const handleBackToPlatforms = () => {
    navigate('/platforms');
  };

  useEffect(() => {
    const savedView = localStorage.getItem('jobViewMode');
    if (savedView && (savedView === 'grid' || savedView === 'list')) {
      setViewMode(savedView as 'grid' | 'list');
    }
  }, []);

  const handleViewModeChange = (mode: 'grid' | 'list') => {
    setViewMode(mode);
    localStorage.setItem('jobViewMode', mode);
  };

  if (loading && jobs.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-teal-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading jobs...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen py-8 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mb-8">
            <button 
              onClick={handleBackToPlatforms}
              className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
            >
              Platforms
            </button>
            <ChevronRight className="h-4 w-4" />
            <button 
              onClick={() => navigate(`/platforms/${platformId}`)}
              className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors capitalize"
            >
              {platformId}
            </button>
            <ChevronRight className="h-4 w-4" />
            <span className="text-gray-900 dark:text-white font-medium">{company?.name}</span>
          </nav>

          <button
            onClick={() => navigate(`/platforms/${platformId}`)}
            className="flex items-center text-gray-600 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 mb-8 transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to {platformId} Companies
          </button>

          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 mb-8 border border-white/20 dark:border-gray-700/20">
            <div className="flex items-center mb-6">
              <img 
                src={company?.logo_url} 
                alt={company?.name} 
                className="w-20 h-20 rounded-2xl object-contain bg-white p-1 shadow-lg mr-6"
              />
              <div className="flex-1">
                <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-2">
                  <span className="gradient-text">{filteredJobs.length}</span> Open Roles
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 mb-2">
                  at {company?.name}
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  {company?.description}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 mb-8 border border-white/20 dark:border-gray-700/20">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              <div className="lg:col-span-2 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search job titles or keywords..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <select
                value={selectedFilters.jobType}
                onChange={(e) => setSelectedFilters(prev => ({ ...prev, jobType: e.target.value }))}
                className="border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">All Job Types</option>
                <option value="Full Time">Full Time</option>
                <option value="Part Time">Part Time</option>
                <option value="Contract">Contract</option>
                <option value="Remote">Remote</option>
                <option value="Internship">Internship</option>
              </select>

              <input
                type="text"
                placeholder="Filter by location..."
                value={selectedFilters.location}
                onChange={(e) => setSelectedFilters(prev => ({ ...prev, location: e.target.value }))}
                className="border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {/* View Mode Toggle and Results Info */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-gray-600 dark:text-gray-400">
              Showing <span className="font-semibold text-teal-600">{filteredJobs.length}</span> jobs
            </p>
            
            {/* View Mode Toggle */}
            <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-xl overflow-hidden">
              <button
                onClick={() => handleViewModeChange('grid')}
                className={`p-3 transition-all ${
                  viewMode === 'grid' 
                    ? 'bg-gradient-to-r from-teal-500 to-blue-600 text-white shadow-md' 
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleViewModeChange('list')}
                className={`p-3 transition-all ${
                  viewMode === 'list' 
                    ? 'bg-gradient-to-r from-teal-500 to-blue-600 text-white shadow-md' 
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Jobs Display */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredJobs.map((job, index) => (
                <JobCard
                  key={job.id || job._id || `job-${index}`}
                  job={job}
                  onApply={handleApply}
                  isSelected={selectedJobId === (job.id || job._id)}
                  onClick={() => handleJobClick(job)}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredJobs.map((job, index) => (
                <JobListItem
                  key={job.id || job._id || `job-${index}`}
                  job={job}
                  onApply={handleApply}
                  isSelected={selectedJobId === (job.id || job._id)}
                  onClick={() => handleJobClick(job)}
                />
              ))}
            </div>
          )}

          {/* Infinite Scroll Loading Indicator */}
          {loadingMore && (
            <div className="flex justify-center mt-8 mb-8">
              <div className="flex items-center text-gray-600 dark:text-gray-400">
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                Loading more jobs...
              </div>
            </div>
          )}

          {/* Load More Button for Manual Loading (fallback) */}
          {hasNextPage && source === 'external' && !loadingMore && (
            <div className="flex justify-center mt-8">
              <button
                onClick={loadMoreJobs}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Load More Jobs
                <ChevronRight className="ml-2 h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      </div>

      <JobDetailDrawer
        job={selectedJob}
        isOpen={drawerOpen}
        onClose={handleCloseDrawer}
        onApply={handleApply}
        companyId={companyId}
      />
    </>
  );
};

// Job List Item Component for List View
interface JobListItemProps {
  job: any;
  onApply: (jobId: string) => void;
  isSelected?: boolean;
  onClick?: () => void;
}

const JobListItem: React.FC<JobListItemProps> = ({
  job,
  onApply,
  isSelected,
  onClick
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [saveState, setSaveState] = useState<'idle' | 'loading' | 'saved'>('idle');
  const companyLogo = job.company?.logo_url;

  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setSaveState('loading');
    
    try {
      const saveData: any = {
        jobId: job.id || job._id,
        jobTitle: job.title,
        companyName: job.company.name,
        location: job.location,
        applicationUrl: job.url || job.applyUrl || job.jobUrl || job.applicationUrl
      };

      // Include full job data for external jobs
      if (job.external !== false) {
        saveData.fullJobData = job;
      }

      await saveJobToAPIWithCallback(saveData);
      setSaveState('saved');
      
      // Reset to idle after 2 seconds
      setTimeout(() => setSaveState('idle'), 2000);
    } catch (error) {
      console.error('Failed to save job:', error);
      setSaveState('idle');
    }
  };

  return (
    <div
      className={`
        group cursor-pointer bg-white dark:bg-gray-900/50 
        border border-gray-100 dark:border-gray-800 rounded-2xl p-6
        transition-all duration-200 ease-out
        hover:border-gray-200 dark:hover:border-gray-700
        hover:shadow-xl hover:shadow-gray-900/5 dark:hover:shadow-black/20
        ${isSelected ? 'ring-2 ring-blue-500/20 border-blue-200 dark:border-blue-800' : ''}
        ${isHovered ? 'scale-[1.01] -translate-y-0.5' : ''}
      `}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center justify-between">
        {/* Job Identity (40%) */}
        <div className="flex items-center space-x-4 flex-1 min-w-0" style={{ maxWidth: '40%' }}>
          {/* Company Logo */}
          <div className="flex-shrink-0">
            {companyLogo ? (
              <img 
                src={companyLogo} 
                alt={job.company.name} 
                className="w-14 h-14 rounded-lg object-contain bg-white p-2 border border-gray-200 dark:border-gray-600 shadow-sm"
              />
            ) : (
              <div className="w-14 h-14 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-800 dark:to-gray-700 rounded-lg flex items-center justify-center border border-gray-100 dark:border-gray-700">
                <Building className="h-7 w-7 text-blue-600 dark:text-blue-400" />
              </div>
            )}
          </div>
          
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
              {job.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-base font-medium truncate">{job.company.name}</p>
          </div>
        </div>

        {/* Job Meta (35%) */}
        <div className="flex-1 px-6" style={{ maxWidth: '35%' }}>
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs font-medium">
              <MapPin className="h-3 w-3 mr-1" />
              {job.location}
            </span>
            
            {job.type && (
              <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${
                job.type === 'Full Time' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' :
                job.type === 'Part Time' ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400' :
                job.type === 'Contract' ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400' :
                job.type === 'Remote' ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400' :
                'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
              }`}>
                <Briefcase className="h-3 w-3 mr-1" />
                {job.type}
              </span>
            )}
            
            <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs font-medium">
              <Clock className="h-3 w-3 mr-1" />
              {formatDatePosted(job.publishedat)}
            </span>

            <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs font-medium">
              <Users className="h-3 w-3 mr-1" />
              {(() => {
                // Generate consistent employee count based on job ID
                const seed = job.id ? job.id.toString() : job.title;
                let hash = 0;
                for (let i = 0; i < seed.length; i++) {
                  const char = seed.charCodeAt(i);
                  hash = ((hash << 5) - hash) + char;
                  hash = hash & hash; // Convert to 32-bit integer
                }
                return Math.abs(hash % 4950) + 50;
              })()} employees
            </span>
          </div>
        </div>

        {/* Actions (25%) */}
        <div className="text-right flex items-center gap-3" style={{ maxWidth: '25%' }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClick?.();
            }}
            className="flex items-center px-2 py-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 text-sm font-medium transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg"
          >
            View Details
            <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
          </button>
          
          <button
            onClick={handleSave}
            disabled={saveState === 'loading'}
            className={`p-2 rounded-lg transition-all duration-200 group relative overflow-hidden ${
              saveState === 'saved' 
                ? 'text-green-600 bg-green-50 dark:bg-green-900/20' 
                : saveState === 'loading'
                ? 'text-green-600 bg-green-50 dark:bg-green-900/20'
                : 'text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20'
            }`}
          >
            {saveState === 'loading' && (
              <Loader2 className="h-4 w-4 animate-spin" />
            )}
            {saveState === 'saved' && (
              <Check className="h-4 w-4 animate-in zoom-in duration-300" />
            )}
            {saveState === 'idle' && (
              <Bookmark className="h-4 w-4 group-hover:scale-110 transition-transform" />
            )}
          </button>
          
          <InteractiveHoverButton
            text="Apply"
            className="w-24 h-10 border-green-500 bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 shadow-lg hover:shadow-green-500/25 [&_.bg-primary]:bg-gradient-to-r [&_.bg-primary]:from-green-600 [&_.bg-primary]:to-green-700 [&_.text-primary-foreground]:text-white text-sm font-medium"
            onClick={(e) => {
              e.stopPropagation();
              onApply(job.id || job._id);
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default CompanyJobs;