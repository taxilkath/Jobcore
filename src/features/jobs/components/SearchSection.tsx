import React, { useState, useEffect } from 'react';
import { Search, Briefcase, DollarSign, Zap, Database, Clock, CheckCircle } from 'lucide-react';
import AnimatedBorder from '../../../components/ui/AnimatedBorder';
import { StarBorder } from '../../../components/ui/star-border';

interface SearchSectionProps {
  onSearch: (searchData: any) => void;
  initialSearchParams?: {
    query?: string;
    location?: string;
    jobType?: string;
  };
  searchStats?: {
    totalJobs?: number;
    searchEngine?: string;
    searchTime?: number;
  };
}

const SearchSection: React.FC<SearchSectionProps> = ({ onSearch, initialSearchParams, searchStats }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [jobType, setJobType] = useState('');

  // Initialize search inputs with parameters from URL
  useEffect(() => {
    if (initialSearchParams) {
      if (initialSearchParams.query) {
        setSearchTerm(initialSearchParams.query);
      }
      if (initialSearchParams.jobType) {
        setJobType(initialSearchParams.jobType);
      }
    }
  }, [initialSearchParams]);

  const handleSearch = () => {
    onSearch({
      query: searchTerm,
      jobType,
    });
  };

  return (
    <section className="py-12 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Smart Job Search Starts Here
          </h2>
          <p className="text-lg text-gray-600 dark:text-slate-300 max-w-2xl mx-auto">
          Connect with top employers through fast, AI-powered search.
          </p>
        </div>

        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg dark:shadow-emerald-500/10 p-6 max-w-4xl mx-auto border border-white/20 dark:border-slate-700/20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-center">
            {/* Job Title Search */}
            <div className="relative group lg:col-span-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-slate-500 h-5 w-5 group-focus-within:text-emerald-500 dark:group-focus-within:text-emerald-400 transition-colors" />
              <input
                type="text"
                placeholder="Job title, keywords..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500/20 dark:focus:ring-emerald-400/20 focus:border-emerald-500 dark:focus:border-emerald-400 transition-all bg-white dark:bg-slate-900 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-slate-400 focus:shadow-lg dark:focus:shadow-emerald-500/20"
              />
            </div>

            {/* Job Type */}
            <div className="relative group lg:col-span-1">
              <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-slate-500 h-5 w-5 group-focus-within:text-sky-500 dark:group-focus-within:text-sky-400 transition-colors pointer-events-none" />
              <select
                value={jobType}
                onChange={(e) => setJobType(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-sky-500/20 dark:focus:ring-sky-400/20 focus:border-sky-500 dark:focus:border-sky-400 transition-all appearance-none bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:shadow-lg dark:focus:shadow-sky-500/20"
              >
                <option value="">Job Type</option>
                <option value="full-time">Full Time</option>
                <option value="part-time">Part Time</option>
                <option value="contract">Contract</option>
                <option value="remote">Remote</option>
                <option value="internship">Internship</option>
              </select>
            </div>
            
            <div className="lg:col-span-1">
              <AnimatedBorder>
                <button
                  onClick={handleSearch}
                  className="relative z-10 w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-emerald-500/40 flex items-center justify-center"
                >
                  <Search className="h-5 w-5 mr-2" />
                  Search
                </button>
              </AnimatedBorder>
            </div>
          </div>
        </div>

        {/* Typesense Stats */}
        {searchStats && (
          <div className="mt-6 max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-emerald-50/50 to-teal-50/50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl p-4 border border-emerald-200/30 dark:border-emerald-700/30 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  {/* Search Engine Status */}
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <Zap className="h-5 w-5 text-emerald-500 dark:text-emerald-400" />
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 dark:bg-emerald-400 rounded-full animate-pulse"></div>
                    </div>
                    <div className="text-sm">
                      <span className="font-semibold text-emerald-700 dark:text-emerald-300">
                        {searchStats.searchEngine === 'typesense' ? 'Typesense' : 'MongoDB'}
                      </span>
                      <span className="text-emerald-600 dark:text-emerald-400 ml-1">
                        {searchStats.searchEngine === 'typesense' ? 'Active' : 'Fallback'}
                      </span>
                    </div>
                  </div>

                  {/* Total Jobs */}
                  <div className="flex items-center space-x-2">
                    <Database className="h-5 w-5 text-sky-500 dark:text-sky-400" />
                    <div className="text-sm">
                      <span className="font-semibold text-sky-700 dark:text-sky-300">
                        {searchStats.totalJobs?.toLocaleString() || '0'}
                      </span>
                      <span className="text-sky-600 dark:text-sky-400 ml-1">Jobs Indexed</span>
                    </div>
                  </div>

                  {/* Search Speed */}
                  {searchStats.searchTime && (
                    <div className="flex items-center space-x-2">
                      <Clock className="h-5 w-5 text-purple-500 dark:text-purple-400" />
                      <div className="text-sm">
                        <span className="font-semibold text-purple-700 dark:text-purple-300">
                          {searchStats.searchTime}ms
                        </span>
                        <span className="text-purple-600 dark:text-purple-400 ml-1">Search Time</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Performance Badge */}
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400" />
                  <span className="text-xs font-medium text-green-700 dark:text-green-300 px-2 py-1 bg-green-100 dark:bg-green-900/30 rounded-full">
                    {searchStats.searchEngine === 'typesense' ? 'Ultra-Fast Search' : 'Standard Search'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default SearchSection;