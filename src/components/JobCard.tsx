import React, { useState } from 'react';
import { MapPin, Building, Clock, DollarSign, Bookmark, Briefcase } from 'lucide-react';
import { GlowingEffect } from './ui/glowing-effect';
import { BorderTrail } from './ui/border-trail';

interface JobCardProps {
  job: {
    id: string;
    title: string;
    company: string;
    location: string;
    type: string;
    salary: string;
    description: string;
    postedDate: string;
    logo?: string;
    tags: string[];
    isBookmarked?: boolean;
  };
  onBookmark: (jobId: string) => void;
  onApply: (jobId: string) => void;
  isSelected?: boolean;
  onClick?: () => void;
  isCompact?: boolean;
}

const JobCard: React.FC<JobCardProps> = ({ 
  job, 
  onBookmark, 
  onApply, 
  isSelected, 
  onClick, 
  isCompact = false 
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const getCompanyLogo = (company: string) => {
    const logos: { [key: string]: string } = {
      'Google': 'https://images.pexels.com/photos/270408/pexels-photo-270408.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&fit=crop',
      'Microsoft': 'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&fit=crop',
      'Apple': 'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&fit=crop',
      'Amazon': 'https://images.pexels.com/photos/267350/pexels-photo-267350.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&fit=crop',
      'Meta': 'https://images.pexels.com/photos/267394/pexels-photo-267394.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&fit=crop',
      'TechCorp Inc.': 'https://images.pexels.com/photos/265087/pexels-photo-265087.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&fit=crop'
    };
    return logos[company] || null;
  };

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onBookmark(job.id);
  };

  const companyLogo = getCompanyLogo(job.company);

  if (isCompact) {
    return (
      <div 
        className={`
          relative w-full transition-all duration-300 group cursor-pointer bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-6
          ${isSelected 
            ? 'job-card-selected shadow-xl' 
            : 'hover:shadow-lg'
          }
          ${isHovered ? 'transform scale-[1.01]' : ''}
        `}
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <BorderTrail
          className="bg-blue-500"
          size={80}
          style={{
            boxShadow: "0px 0px 60px 30px rgb(59 130 246 / 50%), 0 0 100px 60px rgb(59 130 246 / 30%), 0 0 140px 90px rgb(59 130 246 / 20%)",
          }}
        />
        <GlowingEffect
          spread={40}
          glow={true}
          disabled={false}
          proximity={64}
          inactiveZone={0.01}
          borderWidth={3}
        />
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1 min-w-0">
            {/* Company Logo */}
            <div className="flex-shrink-0">
              {companyLogo ? (
                <img 
                  src={companyLogo} 
                  alt={job.company} 
                  className="company-logo w-12 h-12 rounded-xl object-cover shadow-md"
                />
              ) : (
                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-slate-700 dark:to-slate-600 rounded-xl flex items-center justify-center shadow-md">
                  <Building className="h-6 w-6 text-blue-600 dark:text-cyan-400" />
                </div>
              )}
            </div>
            
            {/* Job Info */}
            <div className="flex-1 min-w-0">
              {/* Top Line: Job Title & Company */}
              <div className="flex items-center space-x-3 mb-2">
                <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors truncate">
                  {job.title}
                </h3>
                <span className="text-gray-500 dark:text-slate-400">•</span>
                <p className="text-gray-700 dark:text-slate-300 font-semibold truncate">{job.company}</p>
              </div>
              
              {/* Second Line: Key Info Pills */}
              <div className="flex flex-wrap gap-2 mb-2">
                <div className="flex items-center bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 px-3 py-1 rounded-full text-sm font-medium">
                  <MapPin className="h-3 w-3 mr-1" />
                  {job.location}
                </div>
                <div className="flex items-center bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1 rounded-full text-sm font-medium">
                  <DollarSign className="h-3 w-3 mr-1" />
                  {job.salary}
                </div>
                <div className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  job.type === 'Full Time' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' :
                  job.type === 'Part Time' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400' :
                  job.type === 'Contract' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400' :
                  job.type === 'Remote' ? 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400' :
                  'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300'
                }`}>
                  <Briefcase className="h-3 w-3 mr-1" />
                  {job.type}
                </div>
                <div className="flex items-center bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-400 px-3 py-1 rounded-full text-sm font-medium">
                  <Clock className="h-3 w-3 mr-1" />
                  {job.postedDate}
                </div>
              </div>

              {/* Third Line: Skills Tags */}
              <div className="flex flex-wrap gap-1.5">
                {job.tags.slice(0, 4).map((tag, index) => (
                  <span 
                    key={index} 
                    className="px-2 py-1 bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-slate-400 rounded-md text-xs font-medium border border-gray-200 dark:border-slate-600"
                  >
                    {tag}
                  </span>
                ))}
                {job.tags.length > 4 && (
                  <span className="px-2 py-1 bg-gray-50 dark:bg-slate-800 text-gray-500 dark:text-slate-500 rounded-md text-xs font-medium border border-gray-200 dark:border-slate-600">
                    +{job.tags.length - 4}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Bookmark Button */}
          <button
            onClick={handleBookmarkClick}
            className={`p-2.5 rounded-xl transition-all transform hover:scale-110 flex-shrink-0 ml-4 ${
              job.isBookmarked
                ? 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/30 hover:bg-yellow-100 dark:hover:bg-yellow-900/50 shadow-md'
                : 'text-gray-400 dark:text-slate-500 hover:text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/30'
            }`}
          >
            <Bookmark 
              className="h-4 w-4" 
              fill={job.isBookmarked ? 'currentColor' : 'none'} 
            />
          </button>
        </div>
      </div>
    );
  }

  // Original expanded card layout for non-compact view
  return (
    <div 
      className={`
        relative w-full transition-all duration-300 group cursor-pointer bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-6
        ${isSelected 
          ? 'job-card-selected shadow-xl' 
          : 'hover:shadow-lg'
        }
        ${isHovered ? 'transform scale-[1.02]' : ''}
      `}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <BorderTrail
        className="bg-purple-500"
        size={80}
        style={{
          boxShadow: "0px 0px 60px 30px rgb(168 85 247 / 50%), 0 0 100px 60px rgb(168 85 247 / 30%), 0 0 140px 90px rgb(168 85 247 / 20%)",
        }}
      />
      <GlowingEffect
        spread={40}
        glow={true}
        disabled={false}
        proximity={64}
        inactiveZone={0.01}
        borderWidth={3}
      />
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-4 flex-1">
          {/* Company Logo */}
          <div className="flex-shrink-0">
            {companyLogo ? (
              <img 
                src={companyLogo} 
                alt={job.company} 
                className="company-logo w-14 h-14 rounded-2xl object-cover shadow-md"
              />
            ) : (
              <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-slate-700 dark:to-slate-600 rounded-2xl flex items-center justify-center shadow-md">
                <Building className="h-7 w-7 text-blue-600 dark:text-cyan-400" />
              </div>
            )}
          </div>
          
          {/* Job Info */}
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-bold text-gray-900 dark:text-slate-100 mb-2 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors line-clamp-2">
              {job.title}
            </h3>
            <p className="text-gray-700 dark:text-slate-300 font-semibold mb-3 text-lg">{job.company}</p>
            
            {/* Job Meta Pills */}
            <div className="flex flex-wrap gap-2 mb-3">
              <div className="flex items-center bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 px-3 py-1.5 rounded-full text-sm font-medium">
                <MapPin className="h-3.5 w-3.5 mr-1.5" />
                {job.location}
              </div>
              <div className="flex items-center bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1.5 rounded-full text-sm font-medium">
                <DollarSign className="h-3.5 w-3.5 mr-1.5" />
                {job.salary}
              </div>
              <div className={`flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${
                job.type === 'Full Time' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' :
                job.type === 'Part Time' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400' :
                job.type === 'Contract' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400' :
                job.type === 'Remote' ? 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400' :
                'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300'
              }`}>
                <Briefcase className="h-3.5 w-3.5 mr-1.5" />
                {job.type}
              </div>
              <div className="flex items-center bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-400 px-3 py-1.5 rounded-full text-sm font-medium">
                <Clock className="h-3.5 w-3.5 mr-1.5" />
                {job.postedDate}
              </div>
            </div>
          </div>
        </div>

        {/* Bookmark Button */}
        <button
          onClick={handleBookmarkClick}
          className={`p-3 rounded-2xl transition-all transform hover:scale-110 ${
            job.isBookmarked
              ? 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/30 hover:bg-yellow-100 dark:hover:bg-yellow-900/50 shadow-md'
              : 'text-gray-400 dark:text-slate-500 hover:text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/30'
          }`}
        >
          <Bookmark 
            className="h-5 w-5" 
            fill={job.isBookmarked ? 'currentColor' : 'none'} 
          />
        </button>
      </div>

      {/* Job Description */}
      <p className="text-gray-600 dark:text-slate-400 text-sm mb-4 line-clamp-2 leading-relaxed">
        {job.description}
      </p>

      {/* Skills Tags */}
      <div className="flex flex-wrap gap-2 mb-6">
        {job.tags.slice(0, 4).map((tag, index) => (
          <span 
            key={index} 
            className="px-3 py-1 bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-slate-400 rounded-lg text-xs font-medium border border-gray-200 dark:border-slate-600 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
          >
            {tag}
          </span>
        ))}
        {job.tags.length > 4 && (
          <span className="px-3 py-1 bg-gray-50 dark:bg-slate-800 text-gray-500 dark:text-slate-500 rounded-lg text-xs font-medium border border-gray-200 dark:border-slate-600">
            +{job.tags.length - 4} more
          </span>
        )}
      </div>
    </div>
  );
};

export default JobCard;