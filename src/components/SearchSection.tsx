import React, { useState } from 'react';
import { Search, MapPin, Briefcase, DollarSign } from 'lucide-react';

interface SearchSectionProps {
  onSearch: (searchData: any) => void;
}

const SearchSection: React.FC<SearchSectionProps> = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState('');
  const [jobType, setJobType] = useState('');
  const [salaryRange, setSalaryRange] = useState('');

  const handleSearch = () => {
    onSearch({
      searchTerm,
      location,
      jobType,
      salaryRange
    });
  };

  return (
    <section className="bg-gradient-to-br from-gray-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 py-12 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Refine Your Search
          </h2>
          <p className="text-lg text-gray-600 dark:text-slate-300 max-w-2xl mx-auto">
            Use advanced filters to find exactly what you're looking for
          </p>
        </div>

        {/* Enhanced Dark Mode Search Container */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg dark:shadow-cyan-500/10 p-6 max-w-5xl mx-auto border border-white/20 dark:border-slate-700/20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Job Title Search */}
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-slate-500 h-5 w-5 group-focus-within:text-cyan-500 dark:group-focus-within:text-cyan-400 transition-colors" />
              <input
                type="text"
                placeholder="Job title, keywords..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500/20 dark:focus:ring-cyan-400/20 focus:border-cyan-500 dark:focus:border-cyan-400 transition-all bg-white dark:bg-slate-900 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-slate-400 focus:shadow-lg dark:focus:shadow-cyan-500/20"
              />
            </div>

            {/* Location */}
            <div className="relative group">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-slate-500 h-5 w-5 group-focus-within:text-cyan-500 dark:group-focus-within:text-cyan-400 transition-colors" />
              <input
                type="text"
                placeholder="City, state, or remote"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500/20 dark:focus:ring-cyan-400/20 focus:border-cyan-500 dark:focus:border-cyan-400 transition-all bg-white dark:bg-slate-900 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-slate-400 focus:shadow-lg dark:focus:shadow-cyan-500/20"
              />
            </div>

            {/* Job Type */}
            <div className="relative group">
              <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-slate-500 h-5 w-5 group-focus-within:text-cyan-500 dark:group-focus-within:text-cyan-400 transition-colors pointer-events-none" />
              <select
                value={jobType}
                onChange={(e) => setJobType(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500/20 dark:focus:ring-cyan-400/20 focus:border-cyan-500 dark:focus:border-cyan-400 transition-all appearance-none bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:shadow-lg dark:focus:shadow-cyan-500/20"
              >
                <option value="">Job Type</option>
                <option value="full-time">Full Time</option>
                <option value="part-time">Part Time</option>
                <option value="contract">Contract</option>
                <option value="remote">Remote</option>
                <option value="internship">Internship</option>
              </select>
            </div>

            {/* Salary Range */}
            <div className="relative group">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-slate-500 h-5 w-5 group-focus-within:text-cyan-500 dark:group-focus-within:text-cyan-400 transition-colors pointer-events-none" />
              <select
                value={salaryRange}
                onChange={(e) => setSalaryRange(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500/20 dark:focus:ring-cyan-400/20 focus:border-cyan-500 dark:focus:border-cyan-400 transition-all appearance-none bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:shadow-lg dark:focus:shadow-cyan-500/20"
              >
                <option value="">Salary Range</option>
                <option value="0-50k">$0 - $50k</option>
                <option value="50k-80k">$50k - $80k</option>
                <option value="80k-120k">$80k - $120k</option>
                <option value="120k-150k">$120k - $150k</option>
                <option value="150k+">$150k+</option>
              </select>
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={handleSearch}
              className="bg-gradient-to-r from-teal-500 to-blue-600 dark:from-cyan-500 dark:to-blue-600 hover:from-teal-600 hover:to-blue-700 dark:hover:from-cyan-600 dark:hover:to-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg hover:shadow-xl dark:shadow-cyan-500/25 dark:hover:shadow-cyan-500/40"
            >
              Search Jobs
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SearchSection;