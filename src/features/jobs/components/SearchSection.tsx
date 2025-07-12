import React, { useState, useEffect } from 'react';
import { Search, Briefcase, DollarSign } from 'lucide-react';
import { StarBorder } from '../../../components/ui/star-border';

interface SearchSectionProps {
  onSearch: (searchData: any) => void;
  initialSearchParams?: {
    query?: string;
    location?: string;
    jobType?: string;
  };
}

const SearchSection: React.FC<SearchSectionProps> = ({ onSearch, initialSearchParams }) => {
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
    <section className="bg-gradient-to-br from-gray-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 py-12 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Find Your Next Opportunity
          </h2>
          <p className="text-lg text-gray-600 dark:text-slate-300 max-w-2xl mx-auto">
            Search through thousands of jobs from top companies.
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
              <button
                onClick={handleSearch}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold py-3 px-6 rounded-lg transition-all transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center"
              >
                <Search className="h-5 w-5 mr-2" />
                Search
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SearchSection;