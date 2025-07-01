import React, { useEffect, useState } from 'react';
import { X, MapPin, Building, Clock, DollarSign, Bookmark, ExternalLink, Briefcase, Users, Calendar, Globe, FileText, Download, Brain, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import TailoringStudio from './TailoringStudio';

interface JobDetailDrawerProps {
  job: any;
  isOpen: boolean;
  onClose: () => void;
  onApply: (jobId: string) => void;
  onBookmark: (jobId: string) => void;
}

const JobDetailDrawer: React.FC<JobDetailDrawerProps> = ({
  job,
  isOpen,
  onClose,
  onApply,
  onBookmark
}) => {
  const [studioOpen, setStudioOpen] = useState(false);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!job) return null;

  const getCompanyLogo = (company: string) => {
    const logos: { [key: string]: string } = {
      'Google': 'https://images.pexels.com/photos/270408/pexels-photo-270408.jpeg?auto=compress&cs=tinysrgb&w=80&h=80&fit=crop',
      'Microsoft': 'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&w=80&h=80&fit=crop',
      'Apple': 'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=80&h=80&fit=crop',
      'Amazon': 'https://images.pexels.com/photos/267350/pexels-photo-267350.jpeg?auto=compress&cs=tinysrgb&w=80&h=80&fit=crop',
      'Meta': 'https://images.pexels.com/photos/267394/pexels-photo-267394.jpeg?auto=compress&cs=tinysrgb&w=80&h=80&fit=crop',
      'TechCorp Inc.': 'https://images.pexels.com/photos/265087/pexels-photo-265087.jpeg?auto=compress&cs=tinysrgb&w=80&h=80&fit=crop'
    };
    return logos[company] || null;
  };

  const companyLogo = getCompanyLogo(job.company);

  const handleApplyClick = () => {
    setStudioOpen(true);
  };

  const handleStudioComplete = (tailoredResume: any) => {
    setStudioOpen(false);
    onClose();
    // Here you would typically save the tailored resume and redirect to application
    console.log('Tailored resume created:', tailoredResume);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed inset-0 bg-gray-500/30 dark:bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Unified Surface Drawer */}
          <motion.div 
            initial={{ x: "100%", opacity: 0, scale: 0.95 }}
            animate={{ x: 0, opacity: 1, scale: 1 }}
            exit={{ x: "100%", opacity: 0, scale: 0.95 }}
            transition={{ 
              duration: 0.4, 
              ease: [0.16, 1, 0.3, 1],
              opacity: { duration: 0.3 }
            }}
            className="fixed top-0 right-0 h-full w-full max-w-2xl unified-drawer z-50 overflow-y-auto custom-scrollbar"
          >
            
            {/* Drawer Content with staggered animation */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ 
                duration: 0.5, 
                delay: 0.1,
                ease: "easeOut" 
              }}
            >
              
              {/* Drawer Header */}
              <div className="drawer-header">
                <div className="drawer-title">
                  <h1>{job.title}</h1>
                  <p>{job.company}</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  onClick={onClose}
                  className="drawer-close-button group"
                >
                  <X className="h-6 w-6" />
                </motion.button>
              </div>

              {/* Job Overview Section */}
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="drawer-section"
              >
                <div className="section-header">
                  <Briefcase />
                  Job Overview
                </div>
                
                <div className="flex flex-wrap gap-3 mb-4">
                  <div className="ghost-pill ghost-pill-location">
                    <MapPin className="h-3.5 w-3.5 mr-1.5" />
                    {job.location}
                  </div>
                  <div className="ghost-pill ghost-pill-salary">
                    <DollarSign className="h-3.5 w-3.5 mr-1.5" />
                    {job.salary}
                  </div>
                  <div className="ghost-pill ghost-pill-type">
                    <Briefcase className="h-3.5 w-3.5 mr-1.5" />
                    {job.type}
                  </div>
                  <div className="ghost-pill ghost-pill-date">
                    <Clock className="h-3.5 w-3.5 mr-1.5" />
                    {job.postedDate}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                    onClick={handleApplyClick}
                    className="btn-primary px-6 py-3 rounded-xl font-bold text-base flex-1 flex items-center justify-center"
                  >
                    <Brain className="h-4 w-4 mr-2" />
                    Apply with AI Resume
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                    onClick={() => onBookmark(job.id)}
                    className={`p-3 rounded-xl bookmark-button ${job.isBookmarked ? 'bookmarked' : ''}`}
                  >
                    <Bookmark 
                      className="h-5 w-5" 
                      fill={job.isBookmarked ? 'currentColor' : 'none'} 
                    />
                  </motion.button>
                  <motion.button 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                    className="btn-secondary p-3 rounded-xl"
                  >
                    <ExternalLink className="h-5 w-5" />
                  </motion.button>
                </div>
              </motion.div>

              {/* Required Skills Section */}
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="drawer-section"
              >
                <div className="section-header">
                  <Brain />
                  Required Skills
                </div>
                <div className="flex flex-wrap gap-3">
                  {job.tags.map((tag: string, index: number) => (
                    <span 
                      key={index} 
                      className="skill-tag"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.div>

              {/* Job Description Section */}
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.4 }}
                className="drawer-section"
              >
                <div className="section-header">
                  <FileText />
                  Job Description
                </div>
                <div className="space-y-4">
                  <p className="job-description-text">
                    {job.description}
                  </p>
                  <p className="job-description-text">
                    We are looking for a talented professional to join our dynamic team. You will be working on cutting-edge projects that make a real impact on our users and the industry as a whole.
                  </p>
                </div>
              </motion.div>

              {/* Key Responsibilities Section */}
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.5 }}
                className="drawer-section"
              >
                <div className="section-header">
                  <Users />
                  Key Responsibilities
                </div>
                <ul className="accent-list">
                  <li>Design and develop scalable applications using modern technologies</li>
                  <li>Collaborate with cross-functional teams to deliver high-quality solutions</li>
                  <li>Participate in code reviews and maintain coding standards</li>
                  <li>Stay up-to-date with industry trends and best practices</li>
                </ul>
              </motion.div>

              {/* Requirements Section */}
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.6 }}
                className="drawer-section"
              >
                <div className="section-header">
                  <Building />
                  Requirements
                </div>
                <ul className="accent-list">
                  <li>Bachelor's degree in Computer Science or related field</li>
                  <li>3+ years of experience in software development</li>
                  <li>Strong problem-solving and analytical skills</li>
                  <li>Excellent communication and teamwork abilities</li>
                </ul>
              </motion.div>

              {/* Company Information Section */}
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.7 }}
                className="drawer-section"
              >
                <div className="section-header">
                  <Globe />
                  About {job.company}
                </div>
                
                <div className="company-info">
                  <div className="flex items-center gap-3 mb-3">
                    {companyLogo && (
                      <img 
                        src={companyLogo} 
                        alt={job.company} 
                        className="w-12 h-12 rounded-lg object-cover shadow-lg"
                      />
                    )}
                    <div>
                      <h4 className="font-bold text-lg text-white dark:text-white mb-1">{job.company}</h4>
                      <div className="flex items-center gap-3 text-xs text-gray-400">
                        <div className="flex items-center">
                          <Users className="h-3 w-3 mr-1" />
                          1,000-5,000 employees
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          Founded 2010
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <p className="job-description-text">
                    {job.company} is a leading technology company focused on innovation and excellence. We're committed to creating products that make a difference in people's lives while fostering a collaborative and inclusive work environment.
                  </p>
                </div>
              </motion.div>

              {/* Benefits Section */}
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.8 }}
                className="drawer-section"
              >
                <div className="section-header">
                  <Sparkles />
                  Benefits & Perks
                </div>
                <ul className="accent-list">
                  <li><strong>Health & Wellness:</strong> Medical, dental, vision insurance</li>
                  <li><strong>Time Off:</strong> Unlimited PTO policy</li>
                  <li><strong>Growth:</strong> Learning & development budget</li>
                  <li><strong>Flexibility:</strong> Remote work options</li>
                  <li><strong>Equipment:</strong> Latest tech and home office setup</li>
                  <li><strong>Wellness:</strong> Gym membership and mental health support</li>
                </ul>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* AI Tailoring Studio */}
          <TailoringStudio
            job={job}
            isOpen={studioOpen}
            onClose={() => setStudioOpen(false)}
            onComplete={handleStudioComplete}
          />
        </>
      )}
    </AnimatePresence>
  );
};

export default JobDetailDrawer;