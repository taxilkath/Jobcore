import React, { useState, useEffect, useMemo } from 'react';
import { Search, ChevronRight, Building, Users, MapPin, ArrowLeft, SortAsc, LayoutGrid, List, ChevronLeft, Loader2, X } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';

// Get server URL from environment variable
const SERVER_URL = import.meta.env.VITE_API_URL || '';

interface Company {
  id: string;
  name: string;
  logo: string;
  industry: string;
  location: string;
  size: number;
  openRoles: number;
  description: string;
  founded: string;
}

const PlatformCompanies: React.FC = () => {
  const { platformId } = useParams<{ platformId: string }>();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [animationDelay, setAnimationDelay] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreData, setHasMoreData] = useState(true);

  const platformData = {
    workday: {
      name: 'Workday',
      logo: '🏢',
      brandColor: '#FF6B35',
      gradientFrom: '#FF6B35',
      gradientTo: '#F7931E'
    },
    greenhouse: {
      name: 'Greenhouse',
      logo: '🌱',
      brandColor: '#2ECC71',
      gradientFrom: '#2ECC71',
      gradientTo: '#27AE60'
    },
    smartrecruiters: {
      name: 'SmartRecruiters',
      logo: '🎯',
      brandColor: '#3498DB',
      gradientFrom: '#3498DB',
      gradientTo: '#2980B9'
    },
    bamboohr: {
      name: 'BambooHR',
      logo: '🎋',
      brandColor: '#9B59B6',
      gradientFrom: '#9B59B6',
      gradientTo: '#8E44AD'
    },
    lever: {
      name: 'Lever',
      logo: '⚡',
      brandColor: '#E74C3C',
      gradientFrom: '#E74C3C',
      gradientTo: '#C0392B'
    },
    jazzhr: {
      name: 'JazzHR',
      logo: '🎵',
      brandColor: '#F39C12',
      gradientFrom: '#F39C12',
      gradientTo: '#E67E22'
    }
  };

  // Process companies data - memoized to prevent infinite re-renders
  const allCompanies = useMemo(() => 
    companies.map((company: any) => {
      // Generate consistent random values based on company name
      const seed = company.name ? company.name.length : 0;
      const sizeHash = (seed * 7) % 10;
      const industryHash = (seed * 3) % 8;
      
      const industries = [
        'Technology', 'Healthcare', 'Finance', 'E-commerce', 
        'Education', 'Media', 'Manufacturing', 'Consulting'
      ];
      
      const locations = [
        'Remote', 'New York, NY', 'San Francisco, CA', 'London, UK',
        'Toronto, CA', 'Berlin, DE', 'Austin, TX', 'Seattle, WA'
      ];
      
      return {
      id: company._id,
      name: company.name,
      logo: company.logo || '/placeholder-logo.png',
        industry: industries[industryHash] || 'Technology',
        location: locations[sizeHash] || 'Remote',
        size: Math.floor((seed * 123) % 4950) + 50, // Consistent random size
      openRoles: company.jobCount || 0,
        description: `Join ${company.name} and explore exciting opportunities in ${industries[industryHash]}.`,
      founded: 'N/A'
      };
    }), [companies]
  );

  const platform = platformData[platformId as keyof typeof platformData];

  // Fetch companies from API with infinite scroll
  const fetchCompanies = async (page: number = 1, append: boolean = false) => {
    if (!platformId) return;
    
    if (page === 1) {
      setLoading(true);
      setError(null);
      setCompanies([]);
      setCurrentPage(1);
      setHasMoreData(true);
    } else {
      setLoadingMore(true);
    }
    
    try {
      console.log('Fetching companies from:', `${SERVER_URL}/api/jobs/portals/${encodeURIComponent(platformId)}/companies?page=${page}&limit=20`);
      const response = await fetch(`${SERVER_URL}/api/jobs/portals/${encodeURIComponent(platformId)}/companies?page=${page}&limit=20`);
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Portal "${platformId}" not found`);
        }
        throw new Error(`Failed to fetch companies: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      console.log('Companies data received:', data);
      const newCompanies = Array.isArray(data.companies) ? data.companies : [];
      
      if (append) {
        setCompanies(prev => [...prev, ...newCompanies]);
      } else {
        setCompanies(newCompanies);
      }
      
      setHasMoreData(data.pagination?.hasNext || false);
      setCurrentPage(page);
    } catch (err) {
      console.error('Error fetching companies:', err);
      setError(err instanceof Error ? err.message : 'Failed to load companies');
      if (!append) setCompanies([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    if (platformId) {
      fetchCompanies(1, false);
    }
  }, [platformId]);

  // Infinite scroll effect with debouncing
  useEffect(() => {
    let scrollTimeout: NodeJS.Timeout;
    
    const handleScroll = () => {
      if (loadingMore || !hasMoreData) return;
      
      // Debounce scroll events to prevent rapid firing
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const scrollTop = document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight;
        const clientHeight = document.documentElement.clientHeight;
        
        // Trigger load when user is 300px from bottom (less aggressive)
        if (scrollTop + clientHeight >= scrollHeight - 300) {
          fetchCompanies(currentPage + 1, true);
        }
      }, 100);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, [loadingMore, hasMoreData, currentPage, platformId]);

  useEffect(() => {
    setAnimationDelay(0); // Remove animation delay for smoother infinite scroll
    setFilteredCompanies(allCompanies);
  }, [allCompanies]);

  // Enhanced search with debouncing
  useEffect(() => {
    setIsSearching(true);
    
    const searchTimeout = setTimeout(() => {
      let filtered = allCompanies;

      // Apply search filter
      if (searchTerm.trim()) {
        const searchLower = searchTerm.toLowerCase().trim();
        filtered = allCompanies.filter(company => {
          const nameMatch = company.name.toLowerCase().includes(searchLower);
          const industryMatch = company.industry.toLowerCase().includes(searchLower);
          const locationMatch = company.location.toLowerCase().includes(searchLower);
          const descriptionMatch = company.description.toLowerCase().includes(searchLower);
          
          return nameMatch || industryMatch || locationMatch || descriptionMatch;
        });
      }

      // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'roles':
          return b.openRoles - a.openRoles;
        case 'size':
          return b.size - a.size;
        default:
          return 0;
      }
    });

    setFilteredCompanies(filtered);
      setIsSearching(false);
    }, 300); // 300ms debounce

    return () => clearTimeout(searchTimeout);
  }, [searchTerm, sortBy, allCompanies]);

  useEffect(() => {
    const savedView = localStorage.getItem('companyViewMode');
    if (savedView && (savedView === 'grid' || savedView === 'list')) {
      setViewMode(savedView as 'grid' | 'list');
    }
  }, []);

  const handleCompanySelect = (companyId: string) => {
    navigate(`/platforms/${platformId}/${companyId}`);
  };

  const handleBackToPlatforms = () => {
    console.log('Navigating back to platforms...');
    navigate('/platforms', { replace: true });
  };

  const handleViewModeChange = (mode: 'grid' | 'list') => {
    setViewMode(mode);
    localStorage.setItem('companyViewMode', mode);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      handleClearSearch();
    }
  };

  // Helper function to highlight search terms
  const highlightSearchTerm = (text: string, searchTerm: string) => {
    if (!searchTerm) return text;
    
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <span key={index} className="bg-yellow-200 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-1 rounded">
          {part}
        </span>
      ) : (
        part
      )
    );
  };



  if (!platformId) {
    return <div>Platform not found</div>;
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen py-8 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-teal-600 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">Loading companies...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Failed to load companies
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
            <button
              onClick={handleBackToPlatforms}
              className="text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 font-medium"
            >
              ← Back to Platforms
            </button>
          </div>
        </div>
      </div>
    );
  }



  return (
    <div className="min-h-screen py-8 transition-colors duration-300">
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
          <span className="text-gray-900 dark:text-white font-medium">{platform?.name}</span>
        </nav>

        {/* Back Button */}
        <button
          onClick={handleBackToPlatforms}
          className="flex items-center text-gray-600 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 mb-8 transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Platforms
        </button>

        {/* Page Header */}
        <div className="flex items-center mb-8">
          <div 
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-lg mr-6"
            style={{
              background: `linear-gradient(135deg, ${platform?.gradientFrom}, ${platform?.gradientTo})`
            }}
          >
            {platform?.logo}
          </div>
          <div>
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-2">
              Explore <span className="gradient-text">{filteredCompanies.length.toLocaleString()}</span> Companies
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Hiring on {platform?.name}
            </p>
          </div>
        </div>

        {/* Search and Controls */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 mb-8 border border-white/20 dark:border-gray-700/20">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-5 w-5" />
              <input
                type="text"
                placeholder="Search company name, industry, or location... (Press Escape to clear)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                className="w-full pl-12 pr-12 py-4 text-lg border-0 focus:ring-2 focus:ring-teal-500/20 focus:outline-none placeholder-gray-500 dark:placeholder-gray-400 rounded-xl bg-gray-50/50 dark:bg-gray-700/50 text-gray-900 dark:text-white transition-all"
              />
              {/* Clear Search Button */}
              {searchTerm && !isSearching && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  title="Clear search (Esc)"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
              {/* Search Loading Indicator */}
              {isSearching && (
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <Loader2 className="h-5 w-5 animate-spin text-teal-500" />
                </div>
              )}
            </div>

            <div className="flex items-center space-x-4">
              {/* Sort Dropdown */}
              <div className="flex items-center space-x-3">
                <SortAsc className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-4 text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-medium"
                >
                  <option value="name">Company A-Z</option>
                  <option value="roles">Most Open Roles</option>
                  <option value="size">Company Size</option>
                </select>
              </div>

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
          </div>
        </div>

        {/* Results Info */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
          <p className="text-gray-600 dark:text-gray-400">
              {searchTerm ? (
                <>
                  Found <span className="font-semibold text-teal-600">{filteredCompanies.length}</span> companies 
                  {searchTerm && (
                    <span className="ml-1">
                      for "<span className="font-semibold text-gray-900 dark:text-white">{searchTerm}</span>"
                    </span>
                  )}
                </>
              ) : (
                <>
            Showing <span className="font-semibold text-teal-600">{filteredCompanies.length}</span> companies
                </>
              )}
            </p>
            {isSearching && (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin text-teal-500" />
                <span className="text-sm text-gray-500 dark:text-gray-400">Searching...</span>
              </div>
            )}
          </div>
        </div>

        {/* Companies Display */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
            {filteredCompanies.map((company, index) => (
              <CompanyCard
                key={`${company.id}-${index}`}
                company={company}
                index={index}
                animationDelay={0}
                onClick={() => handleCompanySelect(company.id)}
                platformColor={platform?.brandColor || '#3B82F6'}
                searchTerm={searchTerm}
                highlightSearchTerm={highlightSearchTerm}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-3 mb-12">
            {filteredCompanies.map((company, index) => (
              <CompanyListItem
                key={`${company.id}-${index}`}
                company={company}
                index={index}
                onClick={() => handleCompanySelect(company.id)}
                platformColor={platform?.brandColor || '#3B82F6'}
                searchTerm={searchTerm}
                highlightSearchTerm={highlightSearchTerm}
              />
            ))}
          </div>
        )}

        {/* Loading More Indicator */}
        {loadingMore && (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center space-x-2">
              <Loader2 className="h-5 w-5 animate-spin text-teal-600" />
              <span className="text-gray-600 dark:text-gray-400">Loading more companies...</span>
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredCompanies.length === 0 && !isSearching && (
          <div className="text-center py-16">
            <Building className="h-16 w-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
            {searchTerm ? (
              <>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No companies found for "{searchTerm}"
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Try searching for different terms or check your spelling
                </p>
                <button
                  onClick={handleClearSearch}
                  className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-xl transition-colors"
                >
                  Clear Search
                </button>
              </>
            ) : (
              <>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No companies found</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {allCompanies.length === 0 ? 'No companies available on this platform' : 'Try adjusting your search terms'}
                </p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Grid View Component
interface CompanyCardProps {
  company: Company;
  index: number;
  animationDelay: number;
  onClick: () => void;
  platformColor: string;
  searchTerm?: string;
  highlightSearchTerm?: (text: string, searchTerm: string) => React.ReactNode;
}

const CompanyCard: React.FC<CompanyCardProps> = ({
  company,
  index,
  animationDelay,
  onClick,
  platformColor,
  searchTerm = '',
  highlightSearchTerm
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, index * animationDelay);

    return () => clearTimeout(timer);
  }, [index, animationDelay]);

  return (
    <div
      className={`
        group cursor-pointer transform transition-all duration-500 ease-out
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
        ${isHovered ? 'scale-105 -translate-y-2' : 'hover:scale-102 hover:-translate-y-1'}
      `}
      style={{ transitionDelay: `${index * 30}ms` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700 p-6">
        {/* Hover Glow Effect */}
        <div 
          className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"
          style={{ backgroundColor: platformColor }}
        />

        {/* Company Logo */}
        <div className="flex items-center justify-center mb-4">
          <div className="w-16 h-16 bg-white rounded-xl p-2 shadow-md border border-gray-200 dark:border-gray-600 group-hover:scale-110 transition-transform duration-300">
            <img 
              src={company.logo} 
              alt={company.name} 
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* Company Info */}
        <div className="text-center mb-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors">
            {highlightSearchTerm ? highlightSearchTerm(company.name, searchTerm) : company.name}
          </h3>
          
          {/* Industry Tag */}
          <span 
            className="inline-block px-3 py-1 rounded-full text-sm font-semibold text-white mb-3"
            style={{ backgroundColor: platformColor }}
          >
            {company.industry}
          </span>

          {/* Key Stats */}
          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center justify-center">
              <MapPin className="h-4 w-4 mr-2" />
              {company.location}
            </div>
            <div className="flex items-center justify-center">
              <Users className="h-4 w-4 mr-2" />
              {company.size} employees
            </div>
          </div>
        </div>

        {/* Open Roles Count */}
        <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-xl group-hover:bg-gray-100 dark:group-hover:bg-gray-600 transition-colors">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {company.openRoles}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">Open Roles</div>
        </div>

        {/* CTA */}
        <div className="flex items-center justify-center mt-4">
          <div 
            className={`
              flex items-center text-sm font-semibold transition-all duration-300
              ${isHovered ? 'translate-x-0 opacity-100' : 'translate-x-2 opacity-0'}
            `}
            style={{ color: platformColor }}
          >
            View Jobs
            <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </div>
  );
};

// List View Component
interface CompanyListItemProps {
  company: Company;
  index: number;
  onClick: () => void;
  platformColor: string;
  searchTerm?: string;
  highlightSearchTerm?: (text: string, searchTerm: string) => React.ReactNode;
}

const CompanyListItem: React.FC<CompanyListItemProps> = ({
  company,
  index,
  onClick,
  platformColor,
  searchTerm = '',
  highlightSearchTerm
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, index * 20);

    return () => clearTimeout(timer);
  }, [index]);

  return (
    <div
      className={`
        group cursor-pointer transform transition-all duration-300 ease-out
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
      `}
      style={{ transitionDelay: `${index * 20}ms` }}
      onClick={onClick}
    >
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-lg transition-all duration-300 p-6">
        <div className="flex items-center justify-between">
          {/* Company Identity (25%) */}
          <div className="flex items-center space-x-4 flex-1 min-w-0" style={{ maxWidth: '25%' }}>
            <div className="w-12 h-12 bg-white rounded-xl p-1.5 shadow-md border border-gray-200 dark:border-gray-600 flex-shrink-0">
              <img 
                src={company.logo} 
                alt={company.name} 
                className="w-full h-full object-contain"
              />
            </div>
            <div className="min-w-0">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors truncate">
                {highlightSearchTerm ? highlightSearchTerm(company.name, searchTerm) : company.name}
              </h3>
              <span 
                className="inline-block px-2 py-1 rounded-full text-xs font-semibold text-white mt-1"
                style={{ backgroundColor: platformColor }}
              >
                {company.industry}
              </span>
            </div>
          </div>

          {/* Location & Size (35%) */}
          <div className="flex-1 px-6" style={{ maxWidth: '35%' }}>
            <div className="space-y-2">
              <div className="flex items-center text-gray-600 dark:text-gray-400">
                <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                <span className="truncate">{company.location}</span>
              </div>
              <div className="flex items-center text-gray-600 dark:text-gray-400">
                <Users className="h-4 w-4 mr-2 flex-shrink-0" />
                <span className="truncate">{company.size} employees</span>
              </div>
            </div>
          </div>

          {/* Open Roles (20%) */}
          <div className="text-center px-4" style={{ maxWidth: '20%' }}>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {company.openRoles}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">Open Roles</div>
          </div>

          {/* CTA (20%) */}
          <div className="text-right" style={{ maxWidth: '20%' }}>
            <button 
              className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 transition-all font-semibold group-hover:border-teal-300 dark:group-hover:border-teal-500 group-hover:text-teal-600 dark:group-hover:text-teal-400"
              style={{ 
                borderColor: `${platformColor}20`,
                color: platformColor
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = `${platformColor}10`;
                e.currentTarget.style.borderColor = platformColor;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '';
                e.currentTarget.style.borderColor = `${platformColor}20`;
              }}
            >
              View Jobs →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlatformCompanies;