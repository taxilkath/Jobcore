import React, { useState, useEffect } from 'react';
import { Search, MapPin, ArrowRight, Sparkles } from 'lucide-react';
import Typesense from 'typesense';
import { GlowingEffect } from '../../../components/ui/glowing-effect';
import { StarBorder } from '../../../components/ui/star-border';

interface HeroSectionProps {
  onSearch: (searchData: any) => void;
}

const typesenseClient = new Typesense.Client({
    nodes: [{
      host: 'qtg5aekc2ios2gupp-1.a1.typesense.net', 
      port: 443,
      protocol: 'https'
    }],
    apiKey: 'XyXB4mSAw1Uscxur61sc3j3k5p5j2b8P', 
    connectionTimeoutSeconds: 2
  });
  

const HeroSection: React.FC<HeroSectionProps> = ({ onSearch }) => {
  const [jobTitle, setJobTitle] = useState('');
  const [location, setLocation] = useState('');
  const [searchStats, setSearchStats] = useState<{ found: number; time: number } | null>(null);

  useEffect(() => {
    const performSearch = async () => {
      if (!jobTitle.trim() && !location.trim()) {
        setSearchStats(null);
        return;
      }

      try {
        const searchParameters = {
          'q': `${jobTitle} ${location}`,
          'query_by': 'title,company_name,location',
          'per_page': 10
        };
        const searchResult = await typesenseClient.collections('jobs').documents().search(searchParameters);
        setSearchStats({
          found: searchResult.found,
          time: searchResult.search_time_ms,
        });
      } catch (error) {
        console.error("Typesense search error:", error);
        setSearchStats(null);
      }
    };

    const debounceTimer = setTimeout(() => {
      performSearch();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [jobTitle, location]);


  const handleSearch = () => {
    onSearch({
      searchTerm: jobTitle,
      location: location,
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <section className="py-20 lg:py-28 relative overflow-hidden transition-colors duration-300">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-blue-600/5 dark:from-emerald-500/10 dark:to-blue-600/10"></div>
      <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-full blur-3xl"></div>
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

          <div className="max-w-3xl mx-auto mb-4">
            <div className="relative group">
              {/* Outer glow effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-400/20 via-blue-500/20 to-purple-500/20 rounded-2xl blur-lg opacity-30 group-hover:opacity-60 transition-all duration-500"></div>
              
              {/* Main search container with glowing border */}
              <div className="relative">
                <GlowingEffect 
                  disabled={false}
                  blur={4}
                  spread={30}
                  proximity={150}
                  glow={true}
                  movementDuration={1.5}
                  borderWidth={2}
                  className="rounded-2xl"
                />
                
                <div className="relative bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 dark:border-slate-700/30 p-2 flex flex-col sm:flex-row items-center gap-2 transition-all duration-300 hover:shadow-3xl">
                  {/* Job title input */}
                  <div className="flex-1 w-full relative group/input">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-slate-500 h-5 w-5 group-focus-within/input:text-emerald-500 dark:group-focus-within/input:text-emerald-400 transition-colors duration-200" />
                  <input
                    type="text"
                    placeholder="Job title, keyword, or company"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    onKeyPress={handleKeyPress}
                      className="w-full pl-12 pr-4 py-4 text-base border-0 focus:ring-0 focus:outline-none placeholder-gray-500 dark:placeholder-slate-400 rounded-xl bg-transparent text-gray-900 dark:text-white font-medium"
                  />
                </div>

                  {/* Separator */}
                  <div className="w-full sm:w-px sm:h-8 bg-gradient-to-r from-transparent via-gray-200 to-transparent dark:via-slate-600"></div>

                  {/* Location input */}
                  <div className="flex-1 w-full relative group/input">
                    <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-slate-500 h-5 w-5 group-focus-within/input:text-emerald-500 dark:group-focus-within/input:text-emerald-400 transition-colors duration-200" />
                  <input
                    type="text"
                    placeholder="City, state, or 'remote'"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    onKeyPress={handleKeyPress}
                      className="w-full pl-12 pr-4 py-4 text-base border-0 focus:ring-0 focus:outline-none placeholder-gray-500 dark:placeholder-slate-400 rounded-xl bg-transparent text-gray-900 dark:text-white font-medium"
                  />
                </div>

                  {/* StarBorder search button */}
                  <StarBorder
                    onClick={handleSearch}
                    color="#10B981"
                    speed="4s"
                    className="w-full sm:w-auto transition-all duration-300 transform hover:scale-105"
                  >
                    <div className="flex items-center justify-center text-gray-900 dark:text-white font-medium px-2 py-1">
                      Search
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
                    </div>
                  </StarBorder>
              </div>
              </div>
            </div>
          </div>

          {searchStats && (
            <div className="flex items-center justify-center text-xs text-gray-500 dark:text-slate-400 mb-6 animate-fade-in h-4">
              <Sparkles className="h-4 w-4 mr-2 text-emerald-400/70" />
              <span>
                Found <strong>{searchStats.found.toLocaleString()}</strong> jobs in {searchStats.time}ms
              </span>
            </div>
          )}

          {/* Quick Search Suggestions */}
          <div className={`flex flex-wrap justify-center gap-3 mb-16 ${!searchStats ? 'pt-8' : 'pt-2'}`}>
            <span className="text-gray-500 dark:text-slate-400 text-sm font-medium my-auto">Popular searches:</span>
            {['Software Engineer', 'Product Manager', 'Data Scientist', 'UX Designer', 'Remote Jobs'].map((term) => (
              <button
                key={term}
                onClick={() => {
                  setJobTitle(term);
                  onSearch({ searchTerm: term, location: location });
                }}
                className="bg-white/50 dark:bg-slate-800/30 border border-gray-200/50 dark:border-slate-700/50 px-4 py-2 rounded-full text-sm transition-all transform hover:scale-105 font-medium hover:border-emerald-500/50 hover:text-emerald-500 dark:text-slate-300"
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