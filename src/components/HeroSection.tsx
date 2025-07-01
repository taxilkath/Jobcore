import React, { useState } from 'react';
import { Search, MapPin, ArrowRight, Filter } from 'lucide-react';

interface HeroSectionProps {
  onSearch: (searchData: any) => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onSearch }) => {
  const [jobTitle, setJobTitle] = useState('');
  const [location, setLocation] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [jobType, setJobType] = useState('');
  const [salaryRange, setSalaryRange] = useState('');

  const handleSearch = () => {
    onSearch({
      searchTerm: jobTitle,
      location: location,
      jobType: jobType,
      salaryRange: salaryRange
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <section className="bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-20 lg:py-28 relative overflow-hidden transition-colors duration-300">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-r from-teal-500/5 to-blue-600/5 dark:from-cyan-500/10 dark:to-blue-600/10"></div>
      <div className="absolute top-20 left-10 w-72 h-72 bg-teal-500/10 dark:bg-cyan-500/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-600/10 dark:bg-blue-600/20 rounded-full blur-3xl"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center max-w-4xl mx-auto">
          {/* Main Headline */}
          <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-tight transition-colors duration-300">
            Every Job Board.
            <span className="gradient-text block">One Platform.</span>
          </h1>
          
          {/* Sub-headline */}
          <p className="text-xl lg:text-2xl text-gray-600 dark:text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed font-medium transition-colors duration-300">
            Access over 100,000 opportunities from Workday, Greenhouse, and more.
          </p>

          {/* Clean Search Container - Pro Style */}
          <div className="pro-card rounded-3xl p-6 max-w-4xl mx-auto mb-8 transition-colors duration-300">
            <div className="flex flex-col lg:flex-row gap-4 mb-4">
              {/* Job Title Field */}
              <div className="flex-1 relative group">
                <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-slate-500 h-5 w-5 group-focus-within:text-accent transition-colors" />
                <input
                  type="text"
                  placeholder="Job title, keyword, or company"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="pro-input w-full pl-14 pr-4 py-5 text-lg rounded-2xl transition-all duration-300"
                />
              </div>
              
              {/* Location Field */}
              <div className="flex-1 relative group">
                <MapPin className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-slate-500 h-5 w-5 group-focus-within:text-accent transition-colors" />
                <input
                  type="text"
                  placeholder="City, state, or 'remote'"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="pro-input w-full pl-14 pr-4 py-5 text-lg rounded-2xl transition-all duration-300"
                />
              </div>
              
              {/* Search Button - Clean Pro Style */}
              <button
                onClick={handleSearch}
                className="btn-primary px-10 py-5 rounded-2xl font-bold text-lg transition-all transform hover:scale-105 flex items-center justify-center group min-w-fit"
              >
                Search
                <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Advanced Search Toggle */}
            <div className="flex justify-center">
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center text-gray-600 dark:text-slate-400 hover:text-accent font-medium transition-colors"
              >
                <Filter className="h-4 w-4 mr-2" />
                Advanced Search
              </button>
            </div>

            {/* Advanced Search Fields */}
            {showAdvanced && (
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-slate-700 grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
                <select
                  value={jobType}
                  onChange={(e) => setJobType(e.target.value)}
                  className="pro-input px-4 py-3 rounded-xl transition-all"
                >
                  <option value="">Job Type</option>
                  <option value="full-time">Full Time</option>
                  <option value="part-time">Part Time</option>
                  <option value="contract">Contract</option>
                  <option value="remote">Remote</option>
                  <option value="internship">Internship</option>
                </select>
                
                <select
                  value={salaryRange}
                  onChange={(e) => setSalaryRange(e.target.value)}
                  className="pro-input px-4 py-3 rounded-xl transition-all"
                >
                  <option value="">Salary Range</option>
                  <option value="0-50k">$0 - $50k</option>
                  <option value="50k-80k">$50k - $80k</option>
                  <option value="80k-120k">$80k - $120k</option>
                  <option value="120k-150k">$120k - $150k</option>
                  <option value="150k+">$150k+</option>
                </select>
              </div>
            )}
          </div>

          {/* Quick Search Suggestions */}
          <div className="flex flex-wrap justify-center gap-3 mb-16">
            <span className="text-gray-500 dark:text-slate-400 text-sm font-medium">Popular searches:</span>
            {['Software Engineer', 'Product Manager', 'Data Scientist', 'UX Designer', 'Remote Jobs'].map((term) => (
              <button
                key={term}
                onClick={() => {
                  setJobTitle(term);
                  onSearch({ searchTerm: term, location: location });
                }}
                className="pro-card px-4 py-2 rounded-full text-sm transition-all transform hover:scale-105 font-medium hover:border-accent"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;