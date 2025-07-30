import React, { useState, useEffect, useCallback } from 'react';
import { ArrowRight, Building, Users, Briefcase, List, Grid, ArrowLeft, Loader2, MapPin, Calendar, ExternalLink, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import JobDetailDrawer from '../../jobs/components/JobDetailDrawer';
import { InteractiveHoverButton } from '../../../components/ui/interactive-hover-button';
import { SaveButton } from '../../../components/ui/save-button';
import { saveJobToAPIWithCallback, markJobAsAppliedAPI, getSavedJobIds, registerSavedJobUpdateCallback } from '../../../lib/userService';

// Get server URL from environment variable
const SERVER_URL = '/api/proxy'; 

interface Portal {
  name: string;
  jobCount: number;
  companyCount: number;
}

interface Company {
  _id: string;
  name: string;
  logo: string;
  jobCount: number;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalCompanies: number;
  companiesPerPage: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface CompaniesResponse {
  companies: Company[];
  pagination: PaginationInfo;
}

const PlatformDirectory: React.FC = () => {
  const navigate = useNavigate();
  const [portals, setPortals] = useState<Portal[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedPortal, setSelectedPortal] = useState<string | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [companyJobs, setCompanyJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [loadingMoreJobs, setLoadingMoreJobs] = useState(false);
  const [jobsNextPageToken, setJobsNextPageToken] = useState<string | null>(null);
  const [hasMoreJobs, setHasMoreJobs] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [hasMoreData, setHasMoreData] = useState(true);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [isJobDrawerOpen, setIsJobDrawerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [jobSearchTerm, setJobSearchTerm] = useState('');
  const [renderKey, setRenderKey] = useState(0); // Force re-render key
  const [savedJobIds, setSavedJobIds] = useState<string[]>([]);

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

  useEffect(() => {
    const fetchPortals = async () => {
      try {
        setLoading(true);
        console.log('Fetching portals from:', `${SERVER_URL}/api/jobs/portals`);
        const response = await fetch(`${SERVER_URL}/api/jobs/portals`);
        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch portals: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Portals data received:', data);
        const filteredData = data.filter((p: Portal) => p.name);
        console.log('Filtered portals:', filteredData);
        setPortals(filteredData);
      } catch (error) {
        console.error("Error fetching portals:", error);
        console.error("Error details:", {
          message: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined
        });
      } finally {
        setLoading(false);
      }
    };

    if (!selectedPortal && !selectedCompany) {
        fetchPortals();
    }
  }, [selectedPortal, selectedCompany]);

  const fetchCompanies = useCallback(async (portalName: string, page: number = 1, append: boolean = false) => {
    try {
      if (page === 1) setLoading(true);
      else setLoadingMore(true);

      const response = await fetch(`${SERVER_URL}/api/jobs/portals/${portalName}/companies?page=${page}&limit=10`);
      if (!response.ok) {
        throw new Error(`Failed to fetch companies for ${portalName}`);
      }
      
      const data: CompaniesResponse = await response.json();
      
      if (append) {
        setCompanies(prev => [...prev, ...data.companies]);
      } else {
        setCompanies(data.companies);
      }
      
      setPagination(data.pagination);
      setHasMoreData(data.pagination.hasNext);
    } catch (error) {
      console.error(`Error fetching companies for ${portalName}:`, error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  const fetchCompanyJobs = async (company: Company, pageToken?: string, append = false) => {
    try {
      pageToken ? setLoadingMoreJobs(true) : setLoadingJobs(true);
      if (!append) {
        // Clear all job state when selecting a new company
        setCompanyJobs([]);
        setSelectedCompany(company);
        setJobsNextPageToken(null);
        setHasMoreJobs(false);
        setJobSearchTerm('');
      }
      
      let url = `${SERVER_URL}/api/jobs/companies/${company._id}/external-jobs`;
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
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch jobs for ${company.name}`);
      }
      
      const data = await response.json();
      
      // Filter out saved jobs
      const filteredJobs = (data.jobs || []).filter((job: any) => {
        const jobId = job.id || job._id;
        return !savedJobIds.includes(jobId);
      });
      
      if (append) {
        setCompanyJobs(prev => [...prev, ...filteredJobs]);
      } else {
        setCompanyJobs(filteredJobs);
      }
      
      // Handle pagination for both Workable and SmartRecruiters
      if (data.pagination) {
        setHasMoreJobs(data.pagination.hasNextPage);
        // SmartRecruiters uses nextOffset, Workable uses nextPageToken
        setJobsNextPageToken(data.pagination.nextOffset || data.pagination.nextPageToken);
      } else {
        setHasMoreJobs(false);
        setJobsNextPageToken(null);
      }
      
      console.log(`Fetched ${data.jobs?.length || 0} jobs from ${data.source} for ${company.name}`, 
                  data.pagination ? `(hasMore: ${data.pagination.hasNextPage}, portal: ${data.portal})` : '');
      
      if (data.pagination && data.pagination.totalJobs) {
        console.log(`SmartRecruiters: Showing ${(data.pagination.currentOffset || 0) + data.jobs.length} of ${data.pagination.totalJobs} total jobs`);
      }
    } catch (error) {
      console.error(`Error fetching jobs for ${company.name}:`, error);
      if (!append) setCompanyJobs([]);
    } finally {
      setLoadingJobs(false);
      setLoadingMoreJobs(false);
    }
  };

  const handlePortalSelect = (portalName: string) => {
    navigate(`/platforms/${portalName}`);
  };

  const loadMoreCompanies = useCallback(async () => {
    if (selectedPortal && pagination && pagination.hasNext && !loadingMore) {
      await fetchCompanies(selectedPortal, pagination.currentPage + 1, true);
    }
  }, [selectedPortal, pagination, loadingMore, fetchCompanies]);

  const loadMoreJobs = useCallback(async () => {
    if (selectedCompany && jobsNextPageToken && hasMoreJobs && !loadingMoreJobs) {
      await fetchCompanyJobs(selectedCompany, jobsNextPageToken, true);
    }
  }, [selectedCompany, jobsNextPageToken, hasMoreJobs, loadingMoreJobs]);

  // Infinite scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop
        >= document.documentElement.offsetHeight - 500 // Load more when 500px from bottom
      ) {
        if (selectedCompany && hasMoreJobs && !loadingMoreJobs) {
          // Load more jobs for the selected company
          loadMoreJobs();
        } else if (hasMoreData && !loadingMore && selectedPortal && !selectedCompany) {
          // Load more companies
          loadMoreCompanies();
        }
      }
    };

    if (selectedPortal) {
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [selectedPortal, selectedCompany, hasMoreData, loadingMore, loadMoreCompanies, hasMoreJobs, loadingMoreJobs, loadMoreJobs]);

  const handleBack = () => {
    if (selectedCompany) {
      // Go back to companies list - NUCLEAR reset
      setSelectedCompany(null);
      setCompanyJobs([]);
      setJobSearchTerm('');
      setJobsNextPageToken(null);
      setHasMoreJobs(false);
      setLoadingMoreJobs(false);
      setLoadingJobs(false);
      setSelectedJob(null);
      setIsJobDrawerOpen(false);
      setRenderKey(prev => prev + 1); // Force complete re-render
    } else {
      // Go back to portals list
      setSelectedPortal(null);
      setCompanies([]);
      setPagination(null);
      setHasMoreData(true);
      setSearchTerm('');
      setRenderKey(prev => prev + 1); // Force complete re-render
    }
  };

  const handleJobClick = (job: any) => {
    setSelectedJob(job);
    setIsJobDrawerOpen(true);
  };

  const handleCloseJobDrawer = () => {
    setIsJobDrawerOpen(false);
    setSelectedJob(null);
  };

  const handleApply = async (jobId: string) => {
    // Find the job and open its apply URL
    const job = companyJobs.find(j => j.id === jobId);
    if (job && (job.apply_url || job.applyUrl)) {
      window.open(job.apply_url || job.applyUrl, '_blank', 'noopener,noreferrer');
      
      try {
        // Mark job as applied in the database
        await markJobAsAppliedAPI(jobId);
      } catch (error) {
        console.error('Failed to mark job as applied:', error);
      }
    }
    handleCloseJobDrawer();
  };

  // Filter companies based on search term
  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter jobs based on search term
  const filteredJobs = companyJobs.filter(job =>
    job.title.toLowerCase().includes(jobSearchTerm.toLowerCase()) ||
    (job.department && job.department.toLowerCase().includes(jobSearchTerm.toLowerCase())) ||
    (job.location && job.location.toLowerCase().includes(jobSearchTerm.toLowerCase())) ||
    (job.employmentType && job.employmentType.toLowerCase().includes(jobSearchTerm.toLowerCase())) ||
    (job.description_html && job.description_html.toLowerCase().includes(jobSearchTerm.toLowerCase())) ||
    (job.description && job.description.toLowerCase().includes(jobSearchTerm.toLowerCase()))
  );

  const renderPortals = () => (
    <div>
        <div className="flex justify-end items-center mb-8">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mr-4">View as:</p>
          <div className="flex items-center gap-2 p-1 rounded-xl bg-gray-200 dark:bg-gray-800">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-white dark:bg-gray-700 shadow' : 'hover:bg-gray-300 dark:hover:bg-gray-700/50'}`}
              aria-label="Grid view"
            >
              <Grid className={`h-5 w-5 ${viewMode === 'grid' ? 'text-teal-500' : 'text-gray-500 dark:text-gray-400'}`} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-white dark:bg-gray-700 shadow' : 'hover:bg-gray-300 dark:hover:bg-gray-700/50'}`}
              aria-label="List view"
            >
              <List className={`h-5 w-5 ${viewMode === 'list' ? 'text-teal-500' : 'text-gray-500 dark:text-gray-400'}`} />
            </button>
          </div>
        </div>
      <div className={`${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8' : 'space-y-4'}`}>
        {portals.map((portal) => (
          portal.name ? (
            viewMode === 'grid' ? (
              <PortalCard key={portal.name} portal={portal} onSelect={() => handlePortalSelect(portal.name)} />
            ) : (
              <PortalListItem key={portal.name} portal={portal} onSelect={() => handlePortalSelect(portal.name)} />
            )
          ) : null
        ))}
      </div>
    </div>
  );

  const renderCompanies = () => (
    <div>
      <button onClick={handleBack} className="flex items-center text-lg font-semibold text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 mb-8 transition-colors duration-300">
        <ArrowLeft className="mr-2" />
        Back to Portals
      </button>
      
      {/* Search Input */}
      <div className="mb-8">
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search companies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />
        </div>
      </div>
      
      <div className="flex justify-between items-center mb-6">
        <p className="text-gray-600 dark:text-gray-400">
          {pagination && (
            <>
              {searchTerm ? (
                <>Showing {filteredCompanies.length} of {companies.length} companies matching "{searchTerm}"</>
              ) : (
                <>
                  Showing {companies.length} of {pagination.totalCompanies} companies
                  {hasMoreData && " (scroll down for more)"}
                </>
              )}
            </>
          )}
        </p>
        
        <div className="flex items-center gap-2 p-1 rounded-xl bg-gray-200 dark:bg-gray-800">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-white dark:bg-gray-700 shadow' : 'hover:bg-gray-300 dark:hover:bg-gray-700/50'}`}
            aria-label="Grid view"
          >
            <Grid className={`h-5 w-5 ${viewMode === 'grid' ? 'text-teal-500' : 'text-gray-500 dark:text-gray-400'}`} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-white dark:bg-gray-700 shadow' : 'hover:bg-gray-300 dark:hover:bg-gray-700/50'}`}
            aria-label="List view"
          >
            <List className={`h-5 w-5 ${viewMode === 'list' ? 'text-teal-500' : 'text-gray-500 dark:text-gray-400'}`} />
          </button>
        </div>
      </div>

      {filteredCompanies.length === 0 && searchTerm ? (
        <div className="text-center py-16">
          <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-xl text-gray-500 dark:text-gray-400">No companies found matching "{searchTerm}"</p>
          <p className="text-gray-400 dark:text-gray-500 mt-2">Try adjusting your search terms</p>
        </div>
      ) : (
        <div className={`${viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6' : 'space-y-4'} mb-8`}>
          {filteredCompanies.map((company) => (
            viewMode === 'grid' ? (
              <CompanyCard key={company._id} company={company} onClick={() => {
                navigate(`/platforms/${selectedPortal}/${company._id}`);
              }} />
            ) : (
              <CompanyListItem key={company._id} company={company} onClick={() => {
                navigate(`/platforms/${selectedPortal}/${company._id}`);
              }} />
            )
          ))}
        </div>
      )}

      {loadingMore && (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <span className="ml-3 text-gray-600 dark:text-gray-400">Loading more companies...</span>
        </div>
      )}

      {!hasMoreData && companies.length > 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">You've reached the end of the list</p>
        </div>
      )}
    </div>
  );

  const renderJobs = () => (
    <div>
      <button onClick={handleBack} className="flex items-center text-lg font-semibold text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 mb-8 transition-colors duration-300">
        <ArrowLeft className="mr-2" />
        Back to Companies
      </button>
      
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-6">
          {selectedCompany?.logo && (
            <img
              src={selectedCompany.logo}
              alt={`${selectedCompany.name} logo`}
              className="w-16 h-16 rounded-lg object-contain bg-gray-100 dark:bg-gray-800 p-2"
            />
          )}
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              {selectedCompany?.name} Jobs
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {loadingJobs ? 'Loading jobs...' : `${jobSearchTerm ? filteredJobs.length : companyJobs.length} jobs available`}
            </p>
          </div>
        </div>
        
        {/* Search Bar */}
        {!loadingJobs && companyJobs.length > 0 && (
          <div className="max-w-md mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search jobs by title, department, location..."
                value={jobSearchTerm}
                onChange={(e) => setJobSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all duration-300 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
            {jobSearchTerm && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 text-center">
                Showing {filteredJobs.length} of {companyJobs.length} jobs
              </p>
            )}
          </div>
        )}
      </div>

      {loadingJobs ? (
        <div className="flex justify-center items-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <span className="ml-3 text-gray-600 dark:text-gray-400">Fetching latest jobs...</span>
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="text-center py-16">
          <Briefcase className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-xl text-gray-500 dark:text-gray-400">
            {jobSearchTerm ? `No jobs found matching "${jobSearchTerm}"` : `No jobs found for ${selectedCompany?.name}`}
          </p>
          {jobSearchTerm && (
            <button
              onClick={() => setJobSearchTerm('')}
              className="mt-4 text-blue-600 dark:text-blue-400 hover:underline"
            >
              Clear search
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredJobs.map((job, index) => (
            <div 
              key={job.id || index} 
              onClick={() => handleJobClick(job)}
              className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200/50 dark:border-gray-700/50 cursor-pointer group"
            >
              {/* Company Logo Header */}
              <div className="flex items-start space-x-4 mb-4">
                <div className="w-12 h-12 rounded-lg bg-white shadow-sm border border-gray-200/50 dark:border-gray-600/50 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {(job.company?.logo_url || selectedCompany?.logo) ? (
                    <img 
                      src={job.company?.logo_url || selectedCompany?.logo} 
                      alt={`${job.company?.name || selectedCompany?.name} logo`} 
                      className="w-full h-full object-contain p-1"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <div className={`text-lg font-bold text-gray-400 dark:text-gray-500 ${(job.company?.logo_url || selectedCompany?.logo) ? 'hidden' : ''}`}>
                    {(job.company?.name || selectedCompany?.name)?.charAt(0).toUpperCase()}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {job.title}
                  </h3>
                  <div className="flex flex-wrap gap-2 text-sm text-gray-600 dark:text-gray-400">
                    {job.department && (
                      <span className="flex items-center">
                        <Building className="h-4 w-4 mr-1" />
                        {job.department}
                      </span>
                    )}
                    {job.location && (
                      <span className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {job.location}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {job.employmentType && (
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-md text-xs">
                    {job.employmentType}
                  </span>
                )}
                {job.isRemote && (
                  <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-md text-xs">
                    Remote
                  </span>
                )}
              </div>
              
              {(job.description_html || job.description) && (
                <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-3 text-sm">
                  {(job.description_html || job.description).replace(/<[^>]*>/g, '').substring(0, 150)}...
                </p>
              )}
              
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  {job.publishedAt ? new Date(job.publishedAt).toLocaleDateString() : 'Recently posted'}
                </span>
                <div className="flex gap-2">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleJobClick(job);
                    }}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                  >
                    View Details
                  </button>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="mt-4 pt-4 border-t border-gray-200/50 dark:border-gray-700/50 flex gap-3">
                {/* Interactive Apply Button */}
                <InteractiveHoverButton
                  text="Apply Now"
                  className="flex-1 min-w-0 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white border-emerald-500 hover:border-emerald-600 shadow-lg hover:shadow-emerald-500/25"
                  onClick={async (e) => {
                    e.stopPropagation();
                    if (job.url || job.applyUrl) {
                      window.open(job.url || job.applyUrl, '_blank', 'noopener,noreferrer');
                      
                      try {
                        // Mark job as applied in the database
                        await markJobAsAppliedAPI(job.id);
                      } catch (error) {
                        console.error('Failed to mark job as applied:', error);
                      }
                    }
                  }}
                />
                
                {/* Bookmark Button */}
                <SaveButton
                  text={{
                    idle: "📑 Save",
                    saving: "Saving...",
                    saved: "Saved!"
                  }}
                  className="flex-1 min-w-0"
                  onSave={async () => {
                    try {
                      const saveData: any = {
                        jobId: job.id,
                        jobTitle: job.title,
                        companyName: job.company?.name || selectedCompany?.name || '',
                        location: job.location,
                        applicationUrl: job.url || job.apply_url || job.applyUrl || job.applicationUrl
                      };

                      // For external jobs from platform directory, include full job data
                      // All jobs in platform directory are external jobs
                      if (job.external !== false) {
                        saveData.fullJobData = job;
                      }

                      await saveJobToAPIWithCallback(saveData);
                    } catch (error) {
                      console.error('Failed to save job:', error);
                      // Optionally show error message to user
                    }
                  }}
                />
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Loading indicator for more jobs */}
      {loadingMoreJobs && (
        <div className="flex justify-center items-center py-8 mt-6">
          <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
          <span className="ml-3 text-gray-600 dark:text-gray-400">Loading more jobs...</span>
        </div>
      )}

      {/* End of jobs indicator */}
      {!loadingMoreJobs && !hasMoreJobs && companyJobs.length > 20 && (
        <div className="text-center py-8 mt-6">
          <p className="text-gray-500 dark:text-gray-400">You've seen all available jobs</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen py-16 lg:py-24 transition-colors duration-300">
      <div className="absolute inset-0 bg-gradient-to-r from-teal-500/5 to-blue-600/5 dark:from-teal-500/10 dark:to-blue-600/10"></div>
      <div className="absolute top-20 left-10 w-72 h-72 bg-teal-500/10 dark:bg-teal-500/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-600/10 dark:bg-blue-600/20 rounded-full blur-3xl"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-16">
          <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight transition-colors duration-300">
            <span className="gradient-text block">
              {selectedPortal ? `Companies on ${selectedPortal}` : 
               'Explore by Platform'}
            </span>
          </h1>
          <p className="text-xl lg:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed font-medium transition-colors duration-300">
            {selectedCompany 
              ? `Browse the latest job openings at ${selectedCompany.name}.`
              : selectedPortal 
                ? `Discover companies using ${selectedPortal} for their hiring process.`
                : 'Each platform connects to thousands of unique companies. Dive in to discover roles from industry leaders and innovative startups.'
            }
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="relative">
              {/* Outer ring */}
              <div className="w-16 h-16 rounded-full border-4 border-blue-200 dark:border-blue-800 animate-spin border-t-blue-600 dark:border-t-blue-400"></div>
              {/* Inner ring */}
              <div className="absolute top-2 left-2 w-12 h-12 rounded-full border-4 border-teal-200 dark:border-teal-800 animate-spin-reverse border-t-teal-600 dark:border-t-teal-400"></div>
              {/* Center dot */}
              <div className="absolute top-1/2 left-1/2 w-4 h-4 bg-gradient-to-r from-blue-500 to-teal-500 rounded-full transform -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
            </div>
            <div className="mt-6 text-center">
              <p className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Loading amazing opportunities...</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Discovering the perfect jobs for you</p>
            </div>
          </div>
        ) : selectedPortal ? (
          <div key={`companies-${renderKey}`}>{renderCompanies()}</div>
        ) : (
          <div key={`portals-${renderKey}`}>{renderPortals()}</div>
        )}
      </div>

      <JobDetailDrawer
        isOpen={isJobDrawerOpen}
        onClose={handleCloseJobDrawer}
        job={selectedJob}
        onApply={handleApply}
      />
    </div>
  );
};

const PortalCard: React.FC<{ portal: Portal; onSelect: () => void }> = ({ portal, onSelect }) => (
  <div onClick={onSelect} className="cursor-pointer bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300">
    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{portal.name}</h3>
    <div className="flex justify-between items-center text-gray-600 dark:text-gray-400">
      <div className="flex items-center">
        <Users className="inline-block mr-2 h-5 w-5" />
        <span>{portal.companyCount} Companies</span>
      </div>
      <div className="flex items-center">
        <Briefcase className="inline-block mr-2 h-5 w-5" />
        <span>{portal.jobCount} Jobs</span>
      </div>
        </div>
          </div>
);

const PortalListItem: React.FC<{ portal: Portal; onSelect: () => void }> = ({ portal, onSelect }) => (
  <div onClick={onSelect} className="cursor-pointer bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 flex justify-between items-center shadow-md hover:shadow-xl transition-all duration-300">
    <h3 className="text-xl font-semibold text-gray-800 dark:text-white">{portal.name}</h3>
    <div className="flex items-center space-x-6 text-gray-500 dark:text-gray-400">
            <div className="flex items-center">
        <Users className="mr-2 h-5 w-5" />
        <span>{portal.companyCount} Companies</span>
            </div>
            <div className="flex items-center">
        <Briefcase className="mr-2 h-5 w-5" />
        <span>{portal.jobCount} Jobs</span>
      </div>
      <ArrowRight className="h-6 w-6 text-blue-500" />
            </div>
          </div>
);

const CompanyCard: React.FC<{ company: Company; onClick: () => void }> = ({ company, onClick }) => (
  <div 
    onClick={onClick}
    className="group bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-3xl p-6 text-center shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 border border-gray-200/50 dark:border-gray-700/50 cursor-pointer"
  >
    <div className="relative mb-6">
      <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center overflow-hidden shadow-md group-hover:shadow-lg transition-shadow duration-300">
        {company.logo ? (
          <img 
            src={company.logo} 
            alt={`${company.name} logo`} 
            className="w-full h-full object-contain p-2"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              target.nextElementSibling?.classList.remove('hidden');
            }}
          />
        ) : null}
        <div className={`text-2xl font-bold text-gray-400 dark:text-gray-500 ${company.logo ? 'hidden' : ''}`}>
          {company.name.charAt(0).toUpperCase()}
        </div>
      </div>
    </div>
    
    <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
      {company.name}
    </h4>
    
    <div className="flex items-center justify-center space-x-2 text-gray-600 dark:text-gray-400">
      <Briefcase className="h-4 w-4" />
      <span className="font-medium">{company.jobCount} {company.jobCount === 1 ? 'job' : 'jobs'}</span>
    </div>
    
    <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
      <div className="w-full h-1 bg-gradient-to-r from-blue-500 to-teal-500 rounded-full"></div>
      </div>
    </div>
  );

const CompanyListItem: React.FC<{ company: Company; onClick: () => void }> = ({ company, onClick }) => (
  <div 
    onClick={onClick}
    className="group bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200/50 dark:border-gray-700/50 cursor-pointer"
  >
    <div className="flex items-center space-x-4">
      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center overflow-hidden shadow-md flex-shrink-0">
        {company.logo ? (
          <img 
            src={company.logo} 
            alt={`${company.name} logo`} 
            className="w-full h-full object-contain p-1"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              target.nextElementSibling?.classList.remove('hidden');
            }}
          />
        ) : null}
        <div className={`text-lg font-bold text-gray-400 dark:text-gray-500 ${company.logo ? 'hidden' : ''}`}>
          {company.name.charAt(0).toUpperCase()}
        </div>
      </div>
      
      <div className="flex-1 min-w-0">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300 truncate">
          {company.name}
        </h4>
        <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 mt-1">
          <Briefcase className="h-4 w-4" />
          <span className="text-sm">{company.jobCount} {company.jobCount === 1 ? 'job' : 'jobs'}</span>
        </div>
      </div>
      
      <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-500 transition-colors duration-300" />
    </div>
  </div>
);

export default PlatformDirectory;