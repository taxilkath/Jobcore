import React, { useEffect, useState } from 'react';
import { Briefcase, Globe, Users, Target, CheckCircle, Building } from 'lucide-react';

const SocialProofSection: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const element = document.getElementById('social-proof-section');
    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, []);

  // Trusted companies with real logos (using placeholder images)
  const trustedCompanies = [
    { name: 'Google', logo: 'https://images.pexels.com/photos/270408/pexels-photo-270408.jpeg?auto=compress&cs=tinysrgb&w=120&h=60&fit=crop' },
    { name: 'Microsoft', logo: 'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&w=120&h=60&fit=crop' },
    { name: 'Apple', logo: 'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=120&h=60&fit=crop' },
    { name: 'Amazon', logo: 'https://images.pexels.com/photos/267350/pexels-photo-267350.jpeg?auto=compress&cs=tinysrgb&w=120&h=60&fit=crop' },
    { name: 'Meta', logo: 'https://images.pexels.com/photos/267394/pexels-photo-267394.jpeg?auto=compress&cs=tinysrgb&w=120&h=60&fit=crop' },
    { name: 'Netflix', logo: 'https://images.pexels.com/photos/265087/pexels-photo-265087.jpeg?auto=compress&cs=tinysrgb&w=120&h=60&fit=crop' },
    { name: 'Tesla', logo: 'https://images.pexels.com/photos/270408/pexels-photo-270408.jpeg?auto=compress&cs=tinysrgb&w=120&h=60&fit=crop' },
    { name: 'Spotify', logo: 'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&w=120&h=60&fit=crop' },
    { name: 'Uber', logo: 'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=120&h=60&fit=crop' },
    { name: 'Airbnb', logo: 'https://images.pexels.com/photos/267350/pexels-photo-267350.jpeg?auto=compress&cs=tinysrgb&w=120&h=60&fit=crop' }
  ];

  // Premium platform cards with official branding
  const jobPlatforms = [
    { 
      name: 'Workday', 
      description: 'Enterprise HR Platform',
      logo: '🏢',
      brandColor: '#FF6B35',
      gradientFrom: '#FF6B35',
      gradientTo: '#F7931E',
      jobCount: '45K+'
    },
    { 
      name: 'Greenhouse', 
      description: 'Recruiting Software',
      logo: '🌱',
      brandColor: '#2ECC71',
      gradientFrom: '#2ECC71',
      gradientTo: '#27AE60',
      jobCount: '32K+'
    },
    { 
      name: 'SmartRecruiters', 
      description: 'Talent Acquisition',
      logo: '🎯',
      brandColor: '#3498DB',
      gradientFrom: '#3498DB',
      gradientTo: '#2980B9',
      jobCount: '29K+'
    },
    { 
      name: 'BambooHR', 
      description: 'HR Management',
      logo: '🎋',
      brandColor: '#9B59B6',
      gradientFrom: '#9B59B6',
      gradientTo: '#8E44AD',
      jobCount: '19K+'
    },
    { 
      name: 'Lever', 
      description: 'Recruiting Platform',
      logo: '⚡',
      brandColor: '#E74C3C',
      gradientFrom: '#E74C3C',
      gradientTo: '#C0392B',
      jobCount: '22K+'
    },
    { 
      name: 'JazzHR', 
      description: 'Hiring Software',
      logo: '🎵',
      brandColor: '#F39C12',
      gradientFrom: '#F39C12',
      gradientTo: '#E67E22',
      jobCount: '15K+'
    }
  ];

  return (
    <div id="social-proof-section" className="transition-colors duration-300">
      {/* Section 1: Dynamic Logo Marquee */}
      <section className="py-16 lg:py-20 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Join Professionals from <span className="gradient-text">World-Class Companies</span>
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Trusted by job seekers from the most innovative companies worldwide
            </p>
          </div>
          
          {/* Infinite Scrolling Logo Marquee */}
          <div className="relative overflow-hidden">
            <div className="flex animate-marquee space-x-12 items-center">
              {/* First set of logos */}
              {trustedCompanies.map((company, index) => (
                <div key={`first-${index}`} className="flex-shrink-0 group">
                  <div className="bg-white dark:bg-gray-700 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-gray-200 dark:border-gray-600">
                    <img 
                      src={company.logo} 
                      alt={company.name}
                      className="h-12 w-24 object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300"
                    />
                  </div>
                </div>
              ))}
              {/* Duplicate set for seamless loop */}
              {trustedCompanies.map((company, index) => (
                <div key={`second-${index}`} className="flex-shrink-0 group">
                  <div className="bg-white dark:bg-gray-700 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-gray-200 dark:border-gray-600">
                    <img 
                      src={company.logo} 
                      alt={company.name}
                      className="h-12 w-24 object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Premium Platform Showcase */}
      <section className="py-20 lg:py-28 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              <span className="gradient-text">One Search</span>, Every Major Platform
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Your central hub for top hiring platforms. We aggregate opportunities from the most trusted job platforms and HR systems in the industry.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {jobPlatforms.map((platform, index) => (
              <div 
                key={platform.name} 
                className={`
                  group cursor-pointer transform transition-all duration-500 ease-out
                  ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
                  hover:scale-105 hover:-translate-y-2
                `}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="relative bg-white dark:bg-gray-800 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700 p-8">
                  {/* Gradient Background Accent */}
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300"
                    style={{
                      background: `linear-gradient(135deg, ${platform.gradientFrom}, ${platform.gradientTo})`
                    }}
                  />

                  {/* Animated Border */}
                  <div 
                    className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r p-0.5"
                    style={{
                      background: `linear-gradient(135deg, ${platform.gradientFrom}, ${platform.gradientTo})`
                    }}
                  >
                    <div className="w-full h-full bg-white dark:bg-gray-800 rounded-3xl" />
                  </div>

                  <div className="relative">
                    {/* Platform Logo */}
                    <div className="flex items-center justify-center mb-6">
                      <div 
                        className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-lg group-hover:scale-110 transition-transform duration-300"
                        style={{
                          background: `linear-gradient(135deg, ${platform.gradientFrom}, ${platform.gradientTo})`
                        }}
                      >
                        {platform.logo}
                      </div>
                    </div>

                    {/* Platform Info */}
                    <div className="text-center">
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors">
                        {platform.name}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 font-medium mb-4">{platform.description}</p>
                      
                      {/* Job Count Badge */}
                      <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-bold text-white shadow-lg"
                           style={{ backgroundColor: platform.brandColor }}>
                        <Briefcase className="h-4 w-4 mr-2" />
                        {platform.jobCount} Jobs
                      </div>
                    </div>

                    {/* Hover Glow Effect */}
                    <div 
                      className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 pointer-events-none"
                      style={{
                        boxShadow: `0 0 30px ${platform.brandColor}40`
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 3: Success by the Numbers */}
      <section className="py-20 lg:py-28 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              The <span className="gradient-text">JobCore</span> Advantage
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Experience the difference with our comprehensive platform that connects you to opportunities across the entire job market.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Stat Block 1 */}
            <div className={`
              text-center transform transition-all duration-700 ease-out
              ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
            `} style={{ transitionDelay: '200ms' }}>
              <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700 group hover:scale-105">
                <div className="flex items-center justify-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-teal-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Briefcase className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div className="text-5xl lg:text-6xl font-bold gradient-text mb-4">162K+</div>
                <div className="text-gray-600 dark:text-gray-400 font-semibold text-lg">Active Jobs</div>
                <div className="text-gray-500 dark:text-gray-500 text-sm mt-2">Updated in real-time</div>
              </div>
            </div>

            {/* Stat Block 2 */}
            <div className={`
              text-center transform transition-all duration-700 ease-out
              ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
            `} style={{ transitionDelay: '400ms' }}>
              <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700 group hover:scale-105">
                <div className="flex items-center justify-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Globe className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div className="text-5xl lg:text-6xl font-bold gradient-text mb-4">50+</div>
                <div className="text-gray-600 dark:text-gray-400 font-semibold text-lg">Platforms</div>
                <div className="text-gray-500 dark:text-gray-500 text-sm mt-2">Integrated systems</div>
              </div>
            </div>

            {/* Stat Block 3 */}
            <div className={`
              text-center transform transition-all duration-700 ease-out
              ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
            `} style={{ transitionDelay: '600ms' }}>
              <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700 group hover:scale-105">
                <div className="flex items-center justify-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div className="text-5xl lg:text-6xl font-bold gradient-text mb-4">2M+</div>
                <div className="text-gray-600 dark:text-gray-400 font-semibold text-lg">Job Seekers</div>
                <div className="text-gray-500 dark:text-gray-500 text-sm mt-2">Trust our platform</div>
              </div>
            </div>

            {/* Stat Block 4 */}
            <div className={`
              text-center transform transition-all duration-700 ease-out
              ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
            `} style={{ transitionDelay: '800ms' }}>
              <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700 group hover:scale-105">
                <div className="flex items-center justify-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Target className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div className="text-5xl lg:text-6xl font-bold gradient-text mb-4">95%</div>
                <div className="text-gray-600 dark:text-gray-400 font-semibold text-lg">Success Rate</div>
                <div className="text-gray-500 dark:text-gray-500 text-sm mt-2">Find their dream job</div>
              </div>
            </div>
          </div>

          {/* Additional Trust Indicators */}
          <div className="mt-16 text-center">
            <div className="inline-flex items-center px-6 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full shadow-lg border border-gray-200 dark:border-gray-700">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              <span className="text-gray-700 dark:text-gray-300 font-medium">Trusted by professionals worldwide</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SocialProofSection;