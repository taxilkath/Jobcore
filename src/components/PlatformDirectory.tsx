import React, { useState, useEffect } from 'react';
import { ArrowRight, Building, Users, Briefcase, TrendingUp, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Platform {
  id: string;
  name: string;
  description: string;
  logo: string;
  jobCount: number;
  companyCount: number;
  brandColor: string;
  gradientFrom: string;
  gradientTo: string;
  category: string;
  features: string[];
}

const PlatformDirectory: React.FC = () => {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [animationDelay, setAnimationDelay] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const platforms: Platform[] = [
    {
      id: 'workday',
      name: 'Workday',
      description: 'Enterprise HR Platform',
      logo: '🏢',
      jobCount: 45234,
      companyCount: 2500,
      brandColor: '#FF6B35',
      gradientFrom: '#FF6B35',
      gradientTo: '#F7931E',
      category: 'Enterprise',
      features: ['Fortune 500 Companies', 'Global Opportunities', 'Enterprise Roles']
    },
    {
      id: 'greenhouse',
      name: 'Greenhouse',
      description: 'Recruiting Software',
      logo: '🌱',
      jobCount: 32156,
      companyCount: 1800,
      brandColor: '#2ECC71',
      gradientFrom: '#2ECC71',
      gradientTo: '#27AE60',
      category: 'Recruiting',
      features: ['Tech Startups', 'Growth Companies', 'Structured Hiring']
    },
    {
      id: 'smartrecruiters',
      name: 'SmartRecruiters',
      description: 'Talent Acquisition Suite',
      logo: '🎯',
      jobCount: 28943,
      companyCount: 1200,
      brandColor: '#3498DB',
      gradientFrom: '#3498DB',
      gradientTo: '#2980B9',
      category: 'Talent Acquisition',
      features: ['Mid-Market', 'Collaborative Hiring', 'AI-Powered']
    },
    {
      id: 'bamboohr',
      name: 'BambooHR',
      description: 'HR Management System',
      logo: '🎋',
      jobCount: 18765,
      companyCount: 950,
      brandColor: '#9B59B6',
      gradientFrom: '#9B59B6',
      gradientTo: '#8E44AD',
      category: 'HR Management',
      features: ['SMB Focus', 'People Operations', 'Culture-First']
    },
    {
      id: 'lever',
      name: 'Lever',
      description: 'Modern Recruiting Platform',
      logo: '⚡',
      jobCount: 22341,
      companyCount: 800,
      brandColor: '#E74C3C',
      gradientFrom: '#E74C3C',
      gradientTo: '#C0392B',
      category: 'Modern Recruiting',
      features: ['Tech Companies', 'Data-Driven', 'Candidate Experience']
    },
    {
      id: 'jazzhr',
      name: 'JazzHR',
      description: 'Hiring Software',
      logo: '🎵',
      jobCount: 15432,
      companyCount: 600,
      brandColor: '#F39C12',
      gradientFrom: '#F39C12',
      gradientTo: '#E67E22',
      category: 'SMB Hiring',
      features: ['Small Business', 'Easy Setup', 'Cost-Effective']
    },
    { 
      id: 'marketing', 
      name: 'Marketing & Sales', 
      description: 'Platforms like HubSpot, Marketo', 
      logo: '📊',
      jobCount: 12543,
      companyCount: 1100,
      brandColor: '#1abc9c',
      gradientFrom: '#1abc9c',
      gradientTo: '#16a085',
      category: 'Marketing',
      features: ['Lead Generation', 'CRM', 'Automation']
    },
  ];

  const filteredPlatforms = platforms.filter(platform =>
    platform.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    platform.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    setAnimationDelay(50);
  }, []);

  const handlePlatformSelect = (platformId: string) => {
    navigate(`/platforms/${platformId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-16 lg:py-24 transition-colors duration-300">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-r from-teal-500/5 to-blue-600/5 dark:from-teal-500/10 dark:to-blue-600/10"></div>
      <div className="absolute top-20 left-10 w-72 h-72 bg-teal-500/10 dark:bg-teal-500/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-600/10 dark:bg-blue-600/20 rounded-full blur-3xl"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Page Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight transition-colors duration-300">
            Explore by
            <span className="gradient-text block">Platform</span>
          </h1>
          <p className="text-xl lg:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed font-medium transition-colors duration-300">
            Each platform connects to thousands of unique companies. Dive in to discover roles from industry leaders and innovative startups.
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-12 max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-6 w-6" />
            <input
              type="text"
              placeholder="Search by platform name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-16 pr-6 py-5 text-lg border-0 focus:ring-2 focus:ring-teal-500/30 focus:outline-none placeholder-gray-500 dark:placeholder-gray-400 rounded-2xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm shadow-lg text-gray-900 dark:text-white transition-all"
            />
          </div>
        </div>

        {/* Platform Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {filteredPlatforms.map((platform, index) => (
            <PlatformCard
              key={platform.id}
              platform={platform}
              index={index}
              animationDelay={animationDelay}
              isHovered={hoveredCard === platform.id}
              onHover={() => setHoveredCard(platform.id)}
              onLeave={() => setHoveredCard(null)}
              onClick={() => handlePlatformSelect(platform.id)}
            />
          ))}
        </div>

        {/* Stats Section */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20 dark:border-gray-700/20 transition-colors duration-300">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold gradient-text mb-2">6</div>
              <div className="text-gray-600 dark:text-gray-400 font-medium">Integrated Platforms</div>
            </div>
            <div>
              <div className="text-4xl font-bold gradient-text mb-2">162K+</div>
              <div className="text-gray-600 dark:text-gray-400 font-medium">Total Jobs</div>
            </div>
            <div>
              <div className="text-4xl font-bold gradient-text mb-2">7.8K+</div>
              <div className="text-gray-600 dark:text-gray-400 font-medium">Companies</div>
            </div>
            <div>
              <div className="text-4xl font-bold gradient-text mb-2">24/7</div>
              <div className="text-gray-600 dark:text-gray-400 font-medium">Real-time Updates</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface PlatformCardProps {
  platform: Platform;
  index: number;
  animationDelay: number;
  isHovered: boolean;
  onHover: () => void;
  onLeave: () => void;
  onClick: () => void;
}

const PlatformCard: React.FC<PlatformCardProps> = ({
  platform,
  index,
  animationDelay,
  isHovered,
  onHover,
  onLeave,
  onClick
}) => {
  const [isVisible, setIsVisible] = useState(false);

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
      style={{ transitionDelay: `${index * 50}ms` }}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      onClick={onClick}
    >
      <div className="relative bg-white dark:bg-gray-800 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700">
        {/* Gradient Background Accent */}
        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300"
          style={{
            background: `linear-gradient(135deg, ${platform.gradientFrom}, ${platform.gradientTo})`
          }}
        />

        {/* Animated Border */}
        <div 
          className={`
            absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300
            bg-gradient-to-r p-0.5
          `}
          style={{
            background: `linear-gradient(135deg, ${platform.gradientFrom}, ${platform.gradientTo})`
          }}
        >
          <div className="w-full h-full bg-white dark:bg-gray-800 rounded-3xl" />
        </div>

        <div className="relative p-5">
          {/* Platform Logo & Info - Horizontal Layout */}
          <div className="flex items-center space-x-4 mb-4">
            <div 
              className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl shadow-md group-hover:scale-105 transition-transform duration-300 flex-shrink-0"
              style={{
                background: `linear-gradient(135deg, ${platform.gradientFrom}, ${platform.gradientTo})`
              }}
            >
              {platform.logo}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors truncate">
                {platform.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium truncate">{platform.description}</p>
            </div>
          </div>

          {/* Category Badge */}
          <div className="flex justify-center mb-4">
            <span 
              className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold text-white"
              style={{ backgroundColor: platform.brandColor }}
            >
              {platform.category}
            </span>
          </div>

          {/* Stats - Compact */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="text-center p-2.5 bg-gray-50 dark:bg-gray-700 rounded-lg group-hover:bg-gray-100 dark:group-hover:bg-gray-600 transition-colors">
              <div className="flex items-center justify-center mb-0.5">
                <Briefcase className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
              </div>
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                {platform.jobCount.toLocaleString()}+
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">Live Jobs</div>
            </div>
            <div className="text-center p-2.5 bg-gray-50 dark:bg-gray-700 rounded-lg group-hover:bg-gray-100 dark:group-hover:bg-gray-600 transition-colors">
              <div className="flex items-center justify-center mb-0.5">
                <Building className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
              </div>
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                {platform.companyCount.toLocaleString()}+
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">Companies</div>
            </div>
          </div>

          {/* Features - Compact */}
          <div className="space-y-1.5 mb-4">
            {platform.features.slice(0, 2).map((feature, idx) => (
              <div key={idx} className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                <div 
                  className="w-1.5 h-1.5 rounded-full mr-2 flex-shrink-0"
                  style={{ backgroundColor: platform.brandColor }}
                />
                <span className="truncate">{feature}</span>
              </div>
            ))}
            {platform.features.length > 2 && (
              <div className="text-xs text-gray-500 dark:text-gray-500 pl-3.5">
                +{platform.features.length - 2} more features
              </div>
            )}
          </div>

          {/* CTA */}
          <div className="flex items-center justify-center">
            <div 
              className={`
                flex items-center text-xs font-semibold transition-all duration-300
                ${isHovered ? 'translate-x-0 opacity-100' : 'translate-x-2 opacity-0'}
              `}
              style={{ color: platform.brandColor }}
            >
              View Companies
              <ArrowRight className="h-3.5 w-3.5 ml-1.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </div>

        {/* Hover Glow Effect */}
        <div 
          className={`
            absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 pointer-events-none
          `}
          style={{
            boxShadow: `0 0 30px ${platform.brandColor}40`
          }}
        />
      </div>
    </div>
  );
};

export default PlatformDirectory;