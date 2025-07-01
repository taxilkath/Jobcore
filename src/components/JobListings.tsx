import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, LayoutGrid, List, SortAsc, Filter, Lock, Sparkles, Star, Users } from 'lucide-react';
import JobCard from './JobCard';
import JobDetailDrawer from './JobDetailDrawer';
import { useAuth } from '../contexts/AuthContext';

interface JobListingsProps {
  jobs: any[];
  totalJobs: number;
  currentPage: number;
  jobsPerPage: number;
  onPageChange: (page: number) => void;
  onBookmark: (jobId: string) => void;
  onApply: (jobId: string) => void;
  showFilters: boolean;
  onToggleFilters: () => void;
}

const JobListings: React.FC<JobListingsProps> = ({
  jobs,
  totalJobs,
  currentPage,
  jobsPerPage,
  onPageChange,
  onBookmark,
  onApply,
  showFilters,
  onToggleFilters
}) => {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [sortBy, setSortBy] = useState('relevance');
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Use auth context to determine if user is logged in
  const isLoggedIn = !!user;
  const previewJobCount = 5; // Number of jobs to show to guests

  const totalPages = Math.ceil(totalJobs / jobsPerPage);
  const startIndex = (currentPage - 1) * jobsPerPage + 1;
  const endIndex = Math.min(currentPage * jobsPerPage, totalJobs);

  const handleJobClick = (jobId: string) => {
    setSelectedJobId(jobId);
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setSelectedJobId(null);
  };

  const selectedJob = jobs.find(job => job.id === selectedJobId);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  // Split jobs for guest preview
  const visibleJobs = isLoggedIn ? jobs : jobs.slice(0, previewJobCount);
  const hiddenJobsCount = isLoggedIn ? 0 : Math.max(0, totalJobs - previewJobCount);

  return (
    <>
      <div className="flex-1">
        {/* Results Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
          <div className="flex items-center gap-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Job Results</h2>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                {isLoggedIn ? (
                  <>
                    Showing <span className="font-semibold text-teal-600 dark:text-cyan-400">{startIndex.toLocaleString()}-{endIndex.toLocaleString()}</span> of <span className="font-semibold text-teal-600 dark:text-cyan-400">{totalJobs.toLocaleString()}</span> jobs
                  </>
                ) : (
                  <>
                    Showing <span className="font-semibold text-teal-600 dark:text-cyan-400">{previewJobCount}</span> of <span className="font-semibold text-teal-600 dark:text-cyan-400">{totalJobs.toLocaleString()}</span> jobs
                  </>
                )}
              </p>
            </div>
            
            {/* Show/Hide Filters Button */}
            <button
              onClick={onToggleFilters}
              className={`flex items-center px-6 py-3 rounded-xl font-semibold text-sm transition-all transform hover:scale-105 shadow-lg ${
                showFilters 
                  ? 'bg-gradient-to-r from-teal-500 to-blue-600 dark:from-cyan-500 dark:to-blue-600 text-white hover:from-teal-600 hover:to-blue-700 dark:hover:from-cyan-600 dark:hover:to-blue-700' 
                  : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 border-2 border-gray-200 dark:border-slate-700 hover:border-teal-300 dark:hover:border-cyan-500 hover:text-teal-700 dark:hover:text-cyan-400'
              }`}
            >
              <Filter className="h-4 w-4 mr-2" />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Sort Dropdown */}
            <div className="flex items-center space-x-3">
              <SortAsc className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 dark:border-slate-600 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-teal-500/20 dark:focus:ring-cyan-500/20 focus:border-teal-500 dark:focus:border-cyan-500 transition-all bg-white dark:bg-slate-800 text-gray-900 dark:text-white font-medium"
              >
                <option value="relevance">Most Relevant</option>
                <option value="date">Date Posted</option>
                <option value="salary-high">Salary: High to Low</option>
                <option value="salary-low">Salary: Low to High</option>
                <option value="company">Company A-Z</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center border border-gray-300 dark:border-slate-600 rounded-xl overflow-hidden">
              <button
                onClick={() => setViewMode('list')}
                className={`p-3 transition-all ${
                  viewMode === 'list' 
                    ? 'bg-gradient-to-r from-teal-500 to-blue-600 dark:from-cyan-500 dark:to-blue-600 text-white shadow-md' 
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700'
                }`}
              >
                <List className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-3 transition-all ${
                  viewMode === 'grid' 
                    ? 'bg-gradient-to-r from-teal-500 to-blue-600 dark:from-cyan-500 dark:to-blue-600 text-white shadow-md' 
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700'
                }`}
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Job Cards Container */}
        <div className="relative">
          {/* Visible Job Cards */}
          <div className="space-y-3 mb-12">
            {visibleJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onBookmark={onBookmark}
                onApply={onApply}
                isSelected={selectedJobId === job.id}
                onClick={() => handleJobClick(job.id)}
                isCompact={true}
              />
            ))}
          </div>

          {/* Guest Preview Blur Effect and CTA */}
          {!isLoggedIn && hiddenJobsCount > 0 && (
            <div className="relative">
              {/* Blurred Job Cards Preview - More visible but unreadable */}
              <div className="space-y-3 relative">
                {/* Generate some preview cards to show under the blur */}
                {Array.from({ length: Math.min(10, hiddenJobsCount) }).map((_, index) => (
                  <div
                    key={`preview-${index}`}
                    className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 flex-1">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-slate-700 dark:to-slate-600 rounded-xl"></div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <div className="h-5 bg-gray-800 dark:bg-slate-200 rounded w-48 font-bold"></div>
                            <span className="text-gray-500 dark:text-slate-400">•</span>
                            <div className="h-4 bg-gray-700 dark:bg-slate-300 rounded w-32"></div>
                          </div>
                          <div className="flex flex-wrap gap-2 mb-2">
                            <div className="flex items-center bg-gray-100 dark:bg-slate-700 px-3 py-1 rounded-full">
                              <div className="h-3 w-20 bg-gray-600 dark:bg-slate-400 rounded"></div>
                            </div>
                            <div className="flex items-center bg-green-100 dark:bg-green-900/30 px-3 py-1 rounded-full">
                              <div className="h-3 w-16 bg-green-600 dark:bg-green-400 rounded"></div>
                            </div>
                            <div className="flex items-center bg-blue-100 dark:bg-blue-900/30 px-3 py-1 rounded-full">
                              <div className="h-3 w-20 bg-blue-600 dark:bg-blue-400 rounded"></div>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            <div className="h-3 w-12 bg-gray-500 dark:bg-slate-500 rounded"></div>
                            <div className="h-3 w-16 bg-gray-500 dark:bg-slate-500 rounded"></div>
                            <div className="h-3 w-14 bg-gray-500 dark:bg-slate-500 rounded"></div>
                            <div className="h-3 w-10 bg-gray-500 dark:bg-slate-500 rounded"></div>
                          </div>
                        </div>
                      </div>
                      <div className="w-8 h-8 bg-gray-200 dark:bg-slate-600 rounded-lg"></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Subtle Frosted Glass Overlay - Much lighter */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/40 to-white/70 dark:via-slate-900/40 dark:to-slate-900/70 backdrop-blur-sm pointer-events-none"></div>

              {/* Premium CTA Overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 dark:border-slate-700/50 p-8 max-w-md mx-4 text-center pointer-events-auto transform hover:scale-105 transition-all duration-300 hover:shadow-3xl">
                  {/* Premium Icon */}
                  <div className="flex items-center justify-center mb-6">
                    <div className="relative">
                      <div className="w-20 h-20 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg animate-pulse-glow">
                        <Lock className="h-10 w-10 text-white" />
                      </div>
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                        <Sparkles className="h-4 w-4 text-white" />
                      </div>
                    </div>
                  </div>

                  {/* Compelling Headlines */}
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    Unlock <span className="gradient-text">{hiddenJobsCount.toLocaleString()}+</span> More Opportunities
                  </h3>
                  
                  <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                    You've found amazing jobs! Create a free account to view all details, save favorites, and access our AI Resume Builder.
                  </p>

                  {/* Trust Indicators */}
                  <div className="flex items-center justify-center space-x-6 mb-6 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      <span>2M+ Users</span>
                    </div>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 mr-1 text-yellow-500" />
                      <span>4.9/5 Rating</span>
                    </div>
                  </div>

                  {/* CTA Buttons */}
                  <div className="space-y-3">
                    <button className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-lg hover:shadow-xl">
                      Sign Up for Free
                    </button>
                    
                    <button className="w-full text-gray-600 dark:text-gray-400 hover:text-cyan-600 dark:hover:text-cyan-400 font-medium transition-colors underline">
                      Already have an account? Log In
                    </button>
                  </div>

                  {/* Additional Benefits */}
                  <div className="mt-6 pt-6 border-t border-gray-200 dark:border-slate-700">
                    <div className="grid grid-cols-2 gap-4 text-xs text-gray-500 dark:text-gray-400">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        <span>100% Free</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        <span>No Spam</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        <span>AI Resume Builder</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        <span>Job Alerts</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center mt-12 space-x-2">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 hover:border-teal-300 dark:hover:border-cyan-500 hover:text-teal-700 dark:hover:text-cyan-400"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            {getPageNumbers().map((page, index) =>
              page === '...' ? (
                <span key={index} className="px-4 py-2 text-gray-500">...</span>
              ) : (
                <button
                  key={index}
                  onClick={() => onPageChange(page as number)}
                  className={`px-5 py-3 rounded-xl font-semibold text-sm transition-all ${
                    currentPage === page
                      ? 'bg-gradient-to-r from-teal-500 to-blue-600 text-white shadow-lg'
                      : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 border-2 border-gray-200 dark:border-slate-700 hover:border-teal-300 dark:hover:border-cyan-500 hover:text-teal-700 dark:hover:text-cyan-400'
                  }`}
                >
                  {page}
                </button>
              )
            )}
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 hover:border-teal-300 dark:hover:border-cyan-500 hover:text-teal-700 dark:hover:text-cyan-400"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>

      {/* Job Detail Drawer */}
      <JobDetailDrawer
        job={selectedJob}
        isOpen={drawerOpen}
        onClose={handleCloseDrawer}
        onApply={onApply}
        onBookmark={onBookmark}
      />
    </>
  );
};

export default JobListings;