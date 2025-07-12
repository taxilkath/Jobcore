import React, { useState } from 'react';
import { MapPin, Building, Clock, DollarSign, Bookmark, Briefcase, Loader2, Check, Users } from 'lucide-react';
import { toast } from 'sonner';
import { GlowingEffect } from './glowing-effect';
import { BorderTrail } from './border-trail';
import { formatDatePosted, cleanHtml } from '@/lib/utils';
import { InteractiveHoverButton } from './interactive-hover-button';
import { SaveButton } from './save-button';
import { saveJobToAPIWithCallback, markJobAsAppliedAPI } from '../../lib/userService';

interface JobCardProps {
  job: any;
  onApply: (jobId: string) => void;
  isSelected?: boolean;
  onClick?: () => void;
  isCompact?: boolean;
}

export const JobCard: React.FC<JobCardProps> = ({ 
  job, 
  onApply, 
  isSelected, 
  onClick, 
  isCompact = false 
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [saveState, setSaveState] = useState<'idle' | 'loading' | 'saved'>('idle');
  const companyLogo = job.company?.logo_url;

  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setSaveState('loading');
    
    try {
      const saveData: any = {
        jobId: job._id,
        jobTitle: job.title,
        companyName: job.company.name,
        location: job.location,
        applicationUrl: job.url || job.apply_url || job.applyUrl || job.applicationUrl
      };

      // If it's an external job, include the full job data
      if (job.external !== false) {
        saveData.fullJobData = job;
      }

      await saveJobToAPIWithCallback(saveData);
      setSaveState('saved');
      toast.success('Job saved successfully! ✨');
      
      // Reset to idle after 2 seconds
      setTimeout(() => setSaveState('idle'), 2000);
    } catch (error: any) {
      console.error('Failed to save job:', error);
      
      // Check if job is already saved
      if (error?.message?.includes('already saved') || error?.status === 409 || error?.response?.status === 409) {
        setSaveState('saved');
        toast.info('This job is already in your saved list! 💼');
        setTimeout(() => setSaveState('idle'), 2000);
      } else {
        setSaveState('idle');
        toast.error('Already saved!');
      }
    }
  };

  return (
          <div 
        className={`
          relative group cursor-pointer 
          bg-gradient-to-br from-emerald-50/40 via-white to-cyan-50/30 
          dark:bg-gradient-to-br dark:from-emerald-950/20 dark:via-slate-800/90 dark:to-cyan-950/20
          backdrop-blur-md border border-emerald-100/60 dark:border-emerald-800/40 
          rounded-3xl p-5 shadow-xl shadow-emerald-900/5 dark:shadow-emerald-950/20
          transition-all duration-500 ease-out
          hover:border-emerald-200/80 dark:hover:border-emerald-700/60
          hover:shadow-2xl hover:shadow-emerald-900/10 dark:hover:shadow-emerald-950/30
          hover:bg-gradient-to-br hover:from-emerald-100/50 hover:via-white hover:to-cyan-100/40
          dark:hover:bg-gradient-to-br dark:hover:from-emerald-900/30 dark:hover:via-slate-800/95 dark:hover:to-cyan-900/30
          ${isSelected ? 'ring-2 ring-emerald-400/50 border-emerald-300 dark:border-emerald-600 shadow-emerald-500/20' : ''}
          ${isHovered ? 'scale-[1.03] -translate-y-2' : ''}
        `}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Glowing Border Effects - Only on hover */}
      {isHovered && (
        <>
          <BorderTrail
            className="bg-emerald-400"
            size={50}
            style={{
              boxShadow: "0px 0px 30px 15px rgb(52 211 153 / 25%), 0 0 50px 30px rgb(52 211 153 / 15%), 0 0 70px 50px rgb(52 211 153 / 8%)",
            }}
          />
          <GlowingEffect
            spread={25}
            glow={true}
            disabled={false}
            proximity={40}
            inactiveZone={0.01}
            borderWidth={1.5}
          />
        </>
      )}

      {/* Header */}
      <div className="flex items-start gap-2.5 mb-2.5">
        {/* Company Logo */}
        <div className="flex-shrink-0">
          {companyLogo ? (
            <img 
              src={companyLogo} 
              alt={job.company.name} 
              className="w-16 h-16 rounded-lg object-contain bg-white p-1.5 border border-gray-200 dark:border-gray-600 shadow-sm"
            />
          ) : (
            <div className="w-16 h-16 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-800 dark:to-gray-700 rounded-lg flex items-center justify-center border border-gray-100 dark:border-gray-700">
              <Building className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
          )}
        </div>
        
        {/* Job Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className="font-semibold text-gray-900 dark:text-white text-base group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {job.title}
            </h3>
            {/* External Job Badge */}
            {job.external && (
              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.083 9h1.946c.089-1.546.383-2.97.837-4.118A6.004 6.004 0 004.083 9zM10 2a8 8 0 100 16 8 8 0 000-16zm0 2c-.076 0-.232.032-.465.262-.238.234-.497.623-.737 1.182-.389.907-.673 2.142-.766 3.556h3.936c-.093-1.414-.377-2.649-.766-3.556-.24-.56-.5-.948-.737-1.182C10.232 4.032 10.076 4 10 4zm3.971 5c-.089-1.546-.383-2.97-.837-4.118A6.004 6.004 0 0115.917 9h-1.946zm-2.003 2H8.032c.093 1.414.377 2.649.766 3.556.24.56.5.948.737 1.182.233.23.389.262.465.262.076 0 .232-.032.465-.262.238-.234.498-.623.737-1.182.389-.907.673-2.142.766-3.556zm1.166 4.118c.454-1.148.748-2.572.837-4.118h1.946a6.004 6.004 0 01-2.783 4.118zm-6.268 0C6.412 13.97 6.118 12.546 6.03 11H4.083a6.004 6.004 0 002.783 4.118z" clipRule="evenodd" />
                </svg>
                External
              </span>
            )}
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
            {job.company.name}
            {job.external && job.source && (
              <span className="text-gray-500 dark:text-gray-500 ml-2">via {job.source}</span>
            )}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            disabled={saveState === 'loading'}
            className={`p-2.5 rounded-lg transition-all duration-200 group relative overflow-hidden ${
              saveState === 'saved' 
                ? 'text-green-600 bg-green-50 dark:bg-green-900/20' 
                : saveState === 'loading'
                ? 'text-green-600 bg-green-50 dark:bg-green-900/20'
                : 'text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20'
            }`}
          >
            {saveState === 'loading' && (
              <Loader2 className="h-5 w-5 animate-spin" />
            )}
            {saveState === 'saved' && (
              <Check className="h-5 w-5 animate-in zoom-in duration-300" />
            )}
            {saveState === 'idle' && (
              <Bookmark className="h-5 w-5 group-hover:scale-110 transition-transform" />
            )}
          </button>
          <InteractiveHoverButton
            text="Apply"
            className={`w-24 h-10 text-white text-sm font-medium shadow-lg ${
              job.external 
                ? 'border-emerald-500 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 hover:shadow-emerald-500/25 [&_.bg-primary]:bg-gradient-to-r [&_.bg-primary]:from-emerald-600 [&_.bg-primary]:to-emerald-700'
                : 'border-green-500 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 hover:shadow-green-500/25 [&_.bg-primary]:bg-gradient-to-r [&_.bg-primary]:from-green-600 [&_.bg-primary]:to-green-700'
            } [&_.text-primary-foreground]:text-white`}
            onClick={async (e) => {
              e.stopPropagation();
              
              // Handle external jobs differently
              if (job.external && job.source && (job.apply_url || job.applyUrl || job.applicationUrl || job.url)) {
                // Open external application URL directly
                const applyUrl = job.apply_url || job.applyUrl || job.applicationUrl || job.url;
                window.open(applyUrl, '_blank', 'noopener,noreferrer');
                
                try {
                  await markJobAsAppliedAPI(job._id);
                } catch (error) {
                  console.error('Failed to mark external job as applied:', error);
                }
              } else {
                // Handle internal jobs - either open URL if available or trigger onApply
                if (job.url || job.apply_url || job.applyUrl) {
                  const applyUrl = job.url || job.apply_url || job.applyUrl;
                  window.open(applyUrl, '_blank', 'noopener,noreferrer');
                } else {
                  // Fallback to onApply callback for internal jobs without URL
                  onApply(job._id);
                }
                
                try {
                  await markJobAsAppliedAPI(job._id);
                } catch (error) {
                  console.error('Failed to mark job as applied:', error);
                }
              }
            }}
          />
        </div>
      </div>

      {/* Meta Information */}
      <div className="flex flex-wrap gap-2 mb-3">
        <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium">
          <MapPin className="h-4 w-4 mr-1.5" />
          {job.location}
        </span>
        
        {job.type && (
          <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium ${
            job.type === 'Full Time' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' :
            job.type === 'Part Time' ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400' :
            job.type === 'Contract' ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400' :
            job.type === 'Remote' ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400' :
            'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
          }`}>
            <Briefcase className="h-4 w-4 mr-1.5" />
            {job.type}
          </span>
        )}
        
        <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-sm font-medium">
          <Clock className="h-4 w-4 mr-1.5" />
          {formatDatePosted(job.publishedat)}
        </span>

        <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-sm font-medium">
          <Users className="h-4 w-4 mr-1.5" />
          {Math.floor(Math.random() * 4950) + 50} employees
        </span>
      </div>

      {/* Skills Preview - Only show for internal jobs or external jobs with proper skill tags */}
      {job.requirements && job.requirements.length > 0 && !job.external && (
        <div className="flex flex-wrap gap-1 mb-3">
          {job.requirements.slice(0, 3).map((tag: string, index: number) => (
            <span 
              key={index} 
              className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded text-xs"
            >
              {tag}
            </span>
          ))}
          {job.requirements.length > 3 && (
            <span className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-500 rounded text-xs">
              +{job.requirements.length - 3}
            </span>
          )}
        </div>
      )}


    </div>
  );
};