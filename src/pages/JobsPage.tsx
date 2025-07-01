import React, { useState, useEffect } from 'react';
import SearchSection from '../components/SearchSection';
import FilterSidebar from '../components/FilterSidebar';
import JobListings from '../components/JobListings';
import { mockJobs, generateMoreJobs } from '../data/mockJobs';
import { useAuth } from '../contexts/AuthContext';

const JobsPage: React.FC = () => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [jobs, setJobs] = useState(mockJobs);
  const [filteredJobs, setFilteredJobs] = useState(mockJobs);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchParams, setSearchParams] = useState({});
  const [activeFilters, setActiveFilters] = useState({});
  const [showFilters, setShowFilters] = useState(false);

  const jobsPerPage = user ? 10 : 5;
  const totalJobs = 127845;

  useEffect(() => {
    const additionalJobs = generateMoreJobs(100);
    const allJobs = [...mockJobs, ...additionalJobs];
    setJobs(allJobs);
    setFilteredJobs(allJobs);
  }, []);

  const handleSearch = (searchData: any) => {
    setSearchParams(searchData);
    setCurrentPage(1);
    console.log('Search params:', searchData);
  };

  const handleFilterChange = (filters: any) => {
    setActiveFilters(filters);
    setCurrentPage(1);
    console.log('Active filters:', filters);
  };

  const handleBookmark = (jobId: string) => {
    setJobs(prevJobs =>
      prevJobs.map(job =>
        job.id === jobId ? { ...job, isBookmarked: !job.isBookmarked } : job
      )
    );
    setFilteredJobs(prevJobs =>
      prevJobs.map(job =>
        job.id === jobId ? { ...job, isBookmarked: !job.isBookmarked } : job
      )
    );
  };

  const handleApply = (jobId: string) => {
    console.log('Applying to job:', jobId);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleFilters = () => {
    setShowFilters(!showFilters);
    setSidebarOpen(!showFilters);
  };

  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const currentJobs = filteredJobs.slice(indexOfFirstJob, indexOfLastJob);

  return (
    <>
      <SearchSection onSearch={handleSearch} />
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
              jobs={currentJobs}
              totalJobs={totalJobs}
              currentPage={currentPage}
              jobsPerPage={jobsPerPage}
              onPageChange={handlePageChange}
              onBookmark={handleBookmark}
              onApply={handleApply}
              showFilters={showFilters}
              onToggleFilters={handleToggleFilters}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default JobsPage; 