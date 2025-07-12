import React from 'react';
import { motion } from 'framer-motion';

interface JobListingLoaderProps {
  count?: number;
}

const JobListingLoader: React.FC<JobListingLoaderProps> = ({ count = 5 }) => {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-6 relative overflow-hidden"
        >
          {/* Shimmer overlay */}
          <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
          
          <div className="flex items-center justify-between">
            {/* Left section with logo and job details */}
            <div className="flex items-center space-x-4 flex-1">
              {/* Company logo skeleton */}
              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-slate-700 dark:to-slate-600 rounded-xl animate-pulse"></div>
              
              <div className="flex-1">
                {/* Job title and company */}
                <div className="flex items-center space-x-3 mb-2">
                  <div className="h-5 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-slate-600 dark:to-slate-500 rounded-lg animate-pulse" style={{ width: `${200 + Math.random() * 100}px` }}></div>
                  <span className="text-gray-300 dark:text-slate-600">•</span>
                  <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-slate-600 dark:to-slate-500 rounded-lg animate-pulse" style={{ width: `${120 + Math.random() * 60}px` }}></div>
                </div>
                
                {/* Job details pills */}
                <div className="flex flex-wrap gap-2 mb-2">
                  <div className="h-6 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-slate-700 dark:to-slate-600 rounded-full animate-pulse" style={{ width: `${80 + Math.random() * 40}px` }}></div>
                  <div className="h-6 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-slate-700 dark:to-slate-600 rounded-full animate-pulse" style={{ width: `${60 + Math.random() * 30}px` }}></div>
                  <div className="h-6 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-slate-700 dark:to-slate-600 rounded-full animate-pulse" style={{ width: `${90 + Math.random() * 50}px` }}></div>
                </div>
                
                {/* Job description preview */}
                <div className="space-y-1">
                  <div className="h-3 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-slate-700 dark:to-slate-600 rounded animate-pulse" style={{ width: '90%' }}></div>
                  <div className="h-3 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-slate-700 dark:to-slate-600 rounded animate-pulse" style={{ width: '75%' }}></div>
                </div>
              </div>
            </div>
            
            {/* Right section with salary and buttons */}
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="h-5 bg-gradient-to-r from-green-100 to-green-200 dark:from-green-800 dark:to-green-700 rounded-lg animate-pulse mb-1" style={{ width: '80px' }}></div>
                <div className="h-3 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-slate-700 dark:to-slate-600 rounded animate-pulse" style={{ width: '60px' }}></div>
              </div>
              
              {/* Action buttons */}
              <div className="flex space-x-2">
                <div className="w-10 h-10 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-slate-700 dark:to-slate-600 rounded-xl animate-pulse"></div>
                <div className="w-20 h-10 bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-800 dark:to-blue-700 rounded-xl animate-pulse"></div>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default JobListingLoader; 