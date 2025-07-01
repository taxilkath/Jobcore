import React, { useState, useEffect } from 'react';
import { ChevronRight, ArrowLeft, Search, Filter, Building, MapPin, DollarSign, Clock, Briefcase } from 'lucide-react';
import JobCard from './JobCard';
import JobDetailDrawer from './JobDetailDrawer';
import { mockJobs, generateMoreJobs } from '../data/mockJobs';
import { useParams, useNavigate } from 'react-router-dom';

const CompanyJobs: React.FC = () => {
  const { platformId, companyId } = useParams<{ platformId: string; companyId: string }>();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilters, setSelectedFilters] = useState({
    jobType: '',
    location: '',
    experience: ''
  });
  const [jobs, setJobs] = useState(mockJobs);
  const [filteredJobs, setFilteredJobs] = useState(mockJobs);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const platformData = {
    workday: { name: 'Workday', logo: '🏢', brandColor: '#FF6B35' },
    greenhouse: { name: 'Greenhouse', logo: '🌱', brandColor: '#2ECC71' },
    smartrecruiters: { name: 'SmartRecruiters', logo: '🎯', brandColor: '#3498DB' },
    bamboohr: { name: 'BambooHR', logo: '🎋', brandColor: '#9B59B6' },
    lever: { name: 'Lever', logo: '⚡', brandColor: '#E74C3C' },
    jazzhr: { name: 'JazzHR', logo: '🎵', brandColor: '#F39C12' }
  };

  const companyData = {
    google: { 
      name: 'Google', 
      logo: 'https://images.pexels.com/photos/270408/pexels-photo-270408.jpeg?auto=compress&cs=tinysrgb&w=80&h=80&fit=crop',
      industry: 'Technology',
      description: 'A multinational technology company specializing in Internet-related services and products.'
    },
    microsoft: { 
      name: 'Microsoft', 
      logo: 'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&w=80&h=80&fit=crop',
      industry: 'Technology',
      description: 'A multinational technology corporation that develops computer software, consumer electronics, and personal computers.'
    },
    apple: { 
      name: 'Apple', 
      logo: 'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=80&h=80&fit=crop',
      industry: 'Technology',
      description: 'A multinational technology company that designs, develops, and sells consumer electronics and software.'
    },
    amazon: { 
      name: 'Amazon', 
      logo: 'https://images.pexels.com/photos/267350/pexels-photo-267350.jpeg?auto=compress&cs=tinysrgb&w=80&h=80&fit=crop',
      industry: 'E-commerce',
      description: 'A multinational technology company focusing on e-commerce, cloud computing, and artificial intelligence.'
    },
    meta: { 
      name: 'Meta', 
      logo: 'https://images.pexels.com/photos/267394/pexels-photo-267394.jpeg?auto=compress&cs=tinysrgb&w=80&h=80&fit=crop',
      industry: 'Social Media',
      description: 'A technology company that builds technologies that help people connect, find communities, and grow businesses.'
    },
    netflix: { 
      name: 'Netflix', 
      logo: 'https://images.pexels.com/photos/265087/pexels-photo-265087.jpeg?auto=compress&cs=tinysrgb&w=80&h=80&fit=crop',
      industry: 'Entertainment',
      description: 'A streaming entertainment service with over 200 million paid memberships in over 190 countries.'
    }
  };

  const platform = platformData[platformId as keyof typeof platformData];
  const company = companyData[companyId as keyof typeof companyData];

  useEffect(() => {
    // Generate company-specific jobs
    const additionalJobs = generateMoreJobs(50);
    const companyJobs = [...mockJobs, ...additionalJobs].map(job => ({
      ...job,
      company: company?.name || 'Company'
    }));
    setJobs(companyJobs);
    setFilteredJobs(companyJobs);
  }, [company]);

  useEffect(() => {
    let filtered = jobs.filter(job => {
      const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           job.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesJobType = !selectedFilters.jobType || job.type === selectedFilters.jobType;
      const matchesLocation = !selectedFilters.location || job.location.toLowerCase().includes(selectedFilters.location.toLowerCase());
      
      return matchesSearch && matchesJobType && matchesLocation;
    });

    setFilteredJobs(filtered);
  }, [searchTerm, selectedFilters, jobs]);

  const handleJobClick = (jobId: string) => {
    setSelectedJobId(jobId);
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setSelectedJobId(null);
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
    // In a real app, this would redirect to the company's application page
  };

  const selectedJob = jobs.find(job => job.id === selectedJobId);

  const handleBackToCompanies = () => {
    navigate(`/platforms/${platformId}`);
  };
  
  const handleBackToPlatforms = () => {
    navigate('/platforms');
  };

  if (!companyId) {
    return <div>Company not found</div>;
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumbs */}
          <nav className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mb-8">
            <button 
              onClick={handleBackToPlatforms}
              className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
            >
              Home
            </button>
            <ChevronRight className="h-4 w-4" />
            <button 
              onClick={handleBackToPlatforms}
              className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
            >
              Platforms
            </button>
            <ChevronRight className="h-4 w-4" />
            <button 
              onClick={handleBackToCompanies}
              className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
            >
              {platform?.name}
            </button>
            <ChevronRight className="h-4 w-4" />
            <span className="text-gray-900 dark:text-white font-medium">{company?.name}</span>
          </nav>

          {/* Back Button */}
          <button
            onClick={handleBackToCompanies}
            className="flex items-center text-gray-600 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 mb-8 transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to {platform?.name} Companies
          </button>

          {/* Company Header */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 mb-8 border border-white/20 dark:border-gray-700/20">
            <div className="flex items-center mb-6">
              <img 
                src={company?.logo} 
                alt={company?.name} 
                className="w-20 h-20 rounded-2xl object-cover shadow-lg mr-6"
              />
              <div className="flex-1">
                <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-2">
                  <span className="gradient-text">{filteredJobs.length}</span> Open Roles
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 mb-2">
                  at {company?.name} (via {platform?.name})
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  {company?.description}
                </p>
              </div>
              <div 
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl shadow-lg"
                style={{ backgroundColor: platform?.brandColor }}
              >
                {platform?.logo}
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 mb-8 border border-white/20 dark:border-gray-700/20">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              {/* Search Bar */}
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

              {/* Job Type Filter */}
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

              {/* Location Filter */}
              <input
                type="text"
                placeholder="Filter by location..."
                value={selectedFilters.location}
                onChange={(e) => setSelectedFilters(prev => ({ ...prev, location: e.target.value }))}
                className="border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {/* Job Results Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Job Listings</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Showing {filteredJobs.length} of {jobs.length} positions
              </p>
            </div>
          </div>

          {/* Job Listings */}
          <div className="space-y-3">
            {filteredJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onBookmark={handleBookmark}
                onApply={handleApply}
                isSelected={selectedJobId === job.id}
                onClick={() => handleJobClick(job.id)}
                isCompact={true}
              />
            ))}
          </div>

          {/* Empty State */}
          {filteredJobs.length === 0 && (
            <div className="text-center py-16">
              <Briefcase className="h-16 w-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No jobs found</h3>
              <p className="text-gray-600 dark:text-gray-400">Try adjusting your search criteria</p>
            </div>
          )}
        </div>
      </div>

      {/* Job Detail Drawer */}
      <JobDetailDrawer
        job={selectedJob}
        isOpen={drawerOpen}
        onClose={handleCloseDrawer}
        onApply={handleApply}
        onBookmark={handleBookmark}
      />
    </>
  );
};

export default CompanyJobs;