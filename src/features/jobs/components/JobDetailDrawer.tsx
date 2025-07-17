import React, { useEffect, useState, useMemo } from 'react';
import { X, MapPin, Building, Clock, DollarSign, Bookmark, ExternalLink, Briefcase, Users, Calendar, Globe, FileText, Download, Brain, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useParams } from 'react-router-dom';
import TailoringStudio from '../../home/components/TailoringStudio';
import { formatDatePosted, cleanHtml } from '@/lib/utils';

interface JobDetailDrawerProps {
  job: any;
  isOpen: boolean;
  onClose: () => void;
  onApply: (jobId: string) => void;
  companyId?: string;
}

const JobDetailDrawer: React.FC<JobDetailDrawerProps> = ({
  job,
  isOpen,
  onClose,
  onApply,
  companyId: propCompanyId,
}) => {
  const { companyId: urlCompanyId } = useParams<{ companyId: string }>();
  const companyId = propCompanyId || urlCompanyId;
  const [studioOpen, setStudioOpen] = useState(false);
  const [leverDetails, setLeverDetails] = useState<any>(null);
  const [smartRecruitersDetails, setSmartRecruitersDetails] = useState<any>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [showApplyConfirmation, setShowApplyConfirmation] = useState(false);

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

  useEffect(() => {
    const fetchLeverDetails = async () => {
      const leverUrlRegex = /https?:\/\/jobs(\.eu)?\.lever\.co\/([^\/]+)\/([^\/]+)/;
      const match = job?.url?.match(leverUrlRegex);

      if (match) {
        const companyId = match[2];
        const jobId = match[3];

        if (companyId && jobId) {
          setIsLoadingDetails(true);
          try {
            const response = await fetch(
              `https://api.lever.co/v0/postings/${companyId}/${jobId}`
            );
            const data = await response.json();
            setLeverDetails(data);
          } catch (error) {
            console.error("Failed to fetch from Lever API", error);
            setLeverDetails(null);
          } finally {
            setIsLoadingDetails(false);
          }
        }
      } else {
        setLeverDetails(null);
      }
    };

    if (isOpen && job) {
      fetchLeverDetails();
    } else {
      setLeverDetails(null);
    }
  }, [isOpen, job]);

  useEffect(() => {
    const fetchSmartRecruitersDetails = async () => {
      // Check if this is a SmartRecruiters job by looking at the jobUrl or applyUrl pattern
      const smartRecruitersUrlRegex = /jobs\.smartrecruiters\.com\/oneclick-ui\/company\/([^\/]+)\/publication\/([^\/]+)/;
      const jobUrl = job?.jobUrl || job?.url || job?.applyUrl;
      const match = jobUrl?.match(smartRecruitersUrlRegex);

      if (match) {
        const companyName = match[1]; // Extract company name from URL
        const jobUuid = match[2]; // This is the UUID from the URL
        setIsLoadingDetails(true);
        try {
          // Use company name directly in API call (SmartRecruiters API needs company name, not ID)
          const apiUrl = `/api/jobs/smartrecruiters/${companyName}/${jobUuid}`;
          
          const response = await fetch(apiUrl);
          
          if (response.ok) {
            const data = await response.json();
            setSmartRecruitersDetails(data.job);
          } else {
            console.error("Failed to fetch SmartRecruiters details:", response.statusText);
            setSmartRecruitersDetails(null);
          }
        } catch (error) {
          console.error("Failed to fetch SmartRecruiters details:", error);
          setSmartRecruitersDetails(null);
        } finally {
          setIsLoadingDetails(false);
        }
      } else {
        setSmartRecruitersDetails(null);
      }
    };

    if (isOpen && job) {
      fetchSmartRecruitersDetails();
    } else {
      setSmartRecruitersDetails(null);
    }
  }, [isOpen, job]);

  const parsedSections = useMemo(() => {
    if (!job?.description_html) return [];

    const parser = new DOMParser();
    const doc = parser.parseFromString(job.description_html, "text/html");
    const nodes = Array.from(doc.body.childNodes);

    const sections: { title: string; content: string }[] = [];
    let currentSection: { title: string; content: string } | null = null;

    nodes.forEach(node => {
      if (node.nodeType !== 1 || !(node instanceof HTMLElement)) return;

      const isHeader =
        node.tagName.toLowerCase() === "div" &&
        node.firstElementChild?.tagName.toLowerCase() === "b" &&
        node.textContent?.trim() === node.firstElementChild.textContent?.trim();

      if (isHeader) {
        if (currentSection) {
          sections.push(currentSection);
        }
        currentSection = {
          title: node.textContent || "",
          content: "",
        };
      } else if (currentSection) {
        if (node.innerHTML.toLowerCase().trim() !== "<br>") {
          currentSection.content += node.outerHTML;
        }
      }
    });

    if (currentSection) {
      sections.push(currentSection);
    }

    return sections;
  }, [job?.description_html]);

  const displayJob = useMemo(() => {
    // Return null if job is null to prevent errors
    if (!job) return null;
    
    if (smartRecruitersDetails) {
      return {
        ...job,
        title: smartRecruitersDetails.title || job.title,
        department: smartRecruitersDetails.department || job.department,
        location: smartRecruitersDetails.location || job.location,
        employmentType: smartRecruitersDetails.employmentType || job.employmentType,
        isRemote: smartRecruitersDetails.isRemote || job.isRemote,
        publishedAt: smartRecruitersDetails.publishedAt || job.publishedAt,
        jobUrl: smartRecruitersDetails.jobUrl || job.jobUrl,
        applyUrl: smartRecruitersDetails.applyUrl || job.applyUrl,
        description_html: smartRecruitersDetails.description_html || job.description_html,
        sections: smartRecruitersDetails.sections || job.sections,
        company: smartRecruitersDetails.company || job.company,
        refNumber: smartRecruitersDetails.refNumber || job.refNumber,
        industry: smartRecruitersDetails.industry || job.industry,
        experienceLevel: smartRecruitersDetails.experienceLevel || job.experienceLevel,
      };
    }
    if (leverDetails) {
      return {
        ...job,
        title: leverDetails.text || job.title,
        location: leverDetails.categories?.location || job.location,
        type: leverDetails.categories?.commitment || job.type,
        publishedAt: leverDetails.createdAt || job.publishedAt,
        url: leverDetails.applyUrl || job.url,
      };
    }
    return job;
  }, [job, leverDetails, smartRecruitersDetails]);

  if (!displayJob) return null;

  const companyLogo = displayJob.company?.logo_url;

  const handleApplyClick = () => {
    setStudioOpen(true);
  };

  const handleStudioComplete = (tailoredResume: any) => {
    setStudioOpen(false);
    onClose();
    // Here you would typically save the tailored resume and redirect to application
    console.log('Tailored resume created:', tailoredResume);
  };

  const handleApplyConfirmation = () => {
    onApply(displayJob.id || displayJob._id);
    setShowApplyConfirmation(false);
    onClose();
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
            className="fixed top-0 right-0 h-full w-full max-w-3xl bg-white dark:bg-gray-900 shadow-2xl z-50 overflow-y-auto custom-scrollbar"
          >

            {/* Drawer Content with staggered animation */}
            <motion.div
              className="p-8"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{
                duration: 0.5,
                delay: 0.1,
                ease: "easeOut"
              }}
            >

              {/* Drawer Header */}
              <div className="flex items-start gap-x-6 mb-8">
                {companyLogo && (
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.15, ease: 'easeOut' }}
                  >
                    <img
                      src={companyLogo}
                      alt={`${displayJob.company.name} logo`}
                      className="w-24 h-24 rounded-2xl object-contain bg-white p-2 shadow-lg border border-gray-200/50 dark:border-slate-700/50"
                    />
                  </motion.div>
                )}
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div className="max-w-xl">
                      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{displayJob.title}</h1>
                      <p className="text-lg text-gray-500 dark:text-gray-400 mt-1">{displayJob.company.name}</p>
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
                </div>
              </div>

              {/* Job Overview Section */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 mb-6"
              >
                <div className="flex items-center gap-x-3 mb-4">
                  <Briefcase className="h-5 w-5 text-cyan-400" />
                  <h3 className="text-base font-semibold uppercase tracking-wider text-gray-800 dark:text-white">
                    Job Overview
                  </h3>
                </div>

                <div className="flex flex-wrap gap-3 mb-4">
                  <div className="ghost-pill ghost-pill-location">
                    <MapPin className="h-3.5 w-3.5 mr-1.5" />
                    {displayJob.location}
                  </div>
                  <div className="ghost-pill ghost-pill-type">
                    <Briefcase className="h-3.5 w-3.5 mr-1.5" />
                    {displayJob.type || 'N/A'}
                  </div>
                  <div className="ghost-pill ghost-pill-date">
                    <Clock className="h-3.5 w-3.5 mr-1.5" />
                    {formatDatePosted(displayJob.publishedAt)}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                    onClick={() => setShowApplyConfirmation(true)}
                    className="btn-primary px-6 py-3 rounded-xl font-bold text-base flex-1 flex items-center justify-center"
                  >
                    <Briefcase className="h-4 w-4 mr-2" />
                    Apply
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                    onClick={handleApplyClick}
                    className="btn-secondary px-6 py-3 rounded-xl font-bold text-base flex-1 flex items-center justify-center"
                  >
                    <Brain className="h-4 w-4 mr-2" />
                    Apply with AI
                  </motion.button>
                  {displayJob.url && (
                    <motion.button
                      onClick={() => window.open(displayJob.url, '_blank', 'noopener,noreferrer')}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      transition={{ duration: 0.2 }}
                      className="btn-secondary p-3 rounded-xl"
                      title="Apply on company site"
                    >
                      <ExternalLink className="h-5 w-5" />
                    </motion.button>
                  )}
                </div>
              </motion.div>

              {/* Apply URL Section */}
              {(displayJob.url || displayJob.apply_url || displayJob.jobUrl || displayJob.applyUrl) && (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.25 }}
                  className="bg-gradient-to-r from-emerald-50 via-cyan-50 to-blue-50 dark:from-emerald-900/20 dark:via-cyan-900/20 dark:to-blue-900/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-6 mb-6"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                        <ExternalLink className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                          Apply Directly
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Visit the company's career page
                        </p>
                      </div>
                    </div>
                    <motion.a
                      href={displayJob.url || displayJob.apply_url || displayJob.jobUrl || displayJob.applyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform"
                    >
                      <span className="mr-2">Apply Now</span>
                      <ExternalLink className="h-4 w-4" />
                    </motion.a>
                  </div>
                </motion.div>
              )}

              {isLoadingDetails && (
                <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 mb-6">
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-300 dark:bg-slate-700 rounded w-1/4 mb-4"></div>
                    <div className="h-3 bg-gray-300 dark:bg-slate-700 rounded w-full mb-2"></div>
                    <div className="h-3 bg-gray-300 dark:bg-slate-700 rounded w-5/6 mb-2"></div>
                    <div className="h-3 bg-gray-300 dark:bg-slate-700 rounded w-full"></div>
                  </div>
                </div>
              )}

              {!isLoadingDetails && leverDetails?.lists ? (
                leverDetails.lists.map((section: { text: string; content: string }, index: number) => {
                  const isList = section.content.trim().startsWith('<li>');

                  const listItems = isList
                    ? Array.from(new DOMParser().parseFromString(section.content, 'text/html').querySelectorAll('li'))
                    : [];

                  return (
                    <motion.div
                      key={index}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                      className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 mb-6"
                    >
                      <div className="flex items-center gap-x-3 mb-4">
                        <FileText className="h-5 w-5 text-cyan-400" />
                        <h3 className="text-base font-semibold uppercase tracking-wider text-gray-800 dark:text-white">
                          {section.text}
                        </h3>
                      </div>
                      {isList ? (
                        <ul className="accent-list">
                          {listItems.map((item, i) => (
                            <li key={i} dangerouslySetInnerHTML={{ __html: cleanHtml(item.innerHTML) }} />
                          ))}
                        </ul>
                      ) : (
                        <div
                          className="prose prose-sm dark:prose-invert max-w-none"
                          dangerouslySetInnerHTML={{ __html: cleanHtml(section.content) }}
                        />
                      )}
                    </motion.div>
                  )
                })
              ) : !isLoadingDetails ? (
                parsedSections.map((section, index) => (
                  <motion.div
                    key={index}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                    className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 mb-6"
                  >
                    <div className="flex items-center gap-x-3 mb-4">
                      <FileText className="h-5 w-5 text-cyan-400" />
                      <h3 className="text-base font-semibold uppercase tracking-wider text-gray-800 dark:text-white">
                        {section.title}
                      </h3>
                    </div>
                    <div
                      className="prose prose-sm dark:prose-invert max-w-none"
                      dangerouslySetInnerHTML={{ __html: cleanHtml(section.content) }}
                    />
                  </motion.div>
                ))
              ) : null}

              {/* SmartRecruiters Sections or Regular Job Description */}
              {displayJob.sections && displayJob.sections.length > 0 ? (
                // Render SmartRecruiters sections as individual cards
                displayJob.sections.map((section: any, index: number) => (
                  <motion.div
                    key={section.id}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                    className={`p-6 mb-6 rounded-2xl border bg-gradient-to-br ${section.gradient} ${section.border} hover:shadow-lg transition-all duration-300`}
                  >
                    <div className="flex items-center mb-4">
                      <div className={`w-2 h-8 bg-gradient-to-b ${section.accent} rounded-full mr-4`}></div>
                      <div className="flex items-center gap-x-3">
                        <span className="text-2xl" role="img" aria-label={section.type}>
                          {section.icon}
                        </span>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                          {section.title}
                        </h3>
                      </div>
                    </div>
                    <div
                      className="prose prose-lg max-w-none text-gray-700 dark:text-gray-300"
                      dangerouslySetInnerHTML={{ __html: cleanHtml(section.content) }}
                    />
                  </motion.div>
                ))
              ) : (
                // Fallback to regular job description with elegant styling
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.4 }}
                  className="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 border border-cyan-200 dark:border-cyan-800 rounded-2xl p-6 mb-6"
                >
                  <div className="flex items-center gap-x-3 mb-4">
                    <FileText className="h-5 w-5 text-cyan-500" />
                    <h3 className="text-base font-semibold uppercase tracking-wider text-gray-800 dark:text-white">
                      Job Description
                    </h3>
                  </div>
                  <div
                    className="prose prose-sm dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 [&>p]:mb-4 [&>ul]:mb-4 [&>ol]:mb-4 [&>h1]:mb-4 [&>h2]:mb-4 [&>h3]:mb-4 whitespace-pre-wrap break-words overflow-visible"
                    dangerouslySetInnerHTML={{ __html: cleanHtml(displayJob.description_html || displayJob.description || '') }}
                  />
                </motion.div>
              )}





             

              {/* Requirements Section */}
              {displayJob.requirementsSection && (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.5 }}
                  className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6 mb-6"
                >
                  <div className="flex items-center gap-x-3 mb-4">
                    <FileText className="h-5 w-5 text-blue-500" />
                    <h3 className="text-base font-semibold uppercase tracking-wider text-gray-800 dark:text-white">
                      Requirements
                    </h3>
                  </div>
                  <div
                    className="prose prose-sm dark:prose-invert max-w-none text-gray-700 dark:text-gray-300"
                    dangerouslySetInnerHTML={{ __html: cleanHtml(displayJob.requirementsSection) }}
                  />
                </motion.div>
              )}

              {/* Benefits Section */}
              {displayJob.benefitsSection && (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.6 }}
                  className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-6 mb-6"
                >
                  <div className="flex items-center gap-x-3 mb-4">
                    <Sparkles className="h-5 w-5 text-green-500" />
                    <h3 className="text-base font-semibold uppercase tracking-wider text-gray-800 dark:text-white">
                      Benefits & Perks
                    </h3>
                  </div>
                  <div
                    className="prose prose-sm dark:prose-invert max-w-none text-gray-700 dark:text-gray-300"
                    dangerouslySetInnerHTML={{ __html: cleanHtml(displayJob.benefitsSection) }}
                  />
                </motion.div>
              )}

              {/* Social Sharing Description - Only if different from main description */}
              {displayJob.socialSharingDescription && 
               displayJob.socialSharingDescription !== displayJob.description &&
               displayJob.socialSharingDescription !== 'No description available' && (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.7 }}
                  className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800 rounded-2xl p-6 mb-6"
                >
                  <div className="flex items-center gap-x-3 mb-4">
                    <Globe className="h-5 w-5 text-purple-500" />
                    <h3 className="text-base font-semibold uppercase tracking-wider text-gray-800 dark:text-white">
                      Company Overview
                    </h3>
                  </div>
                  <div 
                    className="prose prose-sm dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words"
                    dangerouslySetInnerHTML={{ __html: cleanHtml(displayJob.socialSharingDescription) }}
                  />
                </motion.div>
              )}

              {/* Company Description */}
              {displayJob.company?.description && (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.8 }}
                  className="bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-900/20 dark:to-slate-900/20 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 mb-6"
                >
                  <div className="flex items-center gap-x-3 mb-4">
                    <Building className="h-5 w-5 text-gray-500" />
                    <h3 className="text-base font-semibold uppercase tracking-wider text-gray-800 dark:text-white">
                      About {displayJob.company.name}
                    </h3>
                  </div>
                  <div
                    className="prose prose-sm dark:prose-invert max-w-none text-gray-700 dark:text-gray-300"
                    dangerouslySetInnerHTML={{ __html: cleanHtml(displayJob.company.description) }}
                  />
                </motion.div>
              )}

              {/* External Job Source Indicator */}
              {displayJob.source && displayJob.external && (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.9 }}
                  className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-6"
                >
                  <div className="flex items-center gap-x-2 text-amber-700 dark:text-amber-300">
                    <ExternalLink className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      This job is sourced from {displayJob.source}
                    </span>
                  </div>
                </motion.div>
              )}

            </motion.div>
          </motion.div>

          {/* Apply Confirmation Dialog */}
          {showApplyConfirmation && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
              onClick={() => setShowApplyConfirmation(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <Briefcase className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Apply to Job</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Are you sure you want to apply?</p>
                  </div>
                </div>
                <p className="text-gray-700 dark:text-gray-300 mb-6">
                  This will mark the job as applied and move it to your applied jobs section.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowApplyConfirmation(false)}
                    className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    No, Cancel
                  </button>
                  <button
                    onClick={handleApplyConfirmation}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-colors"
                  >
                    Yes, Apply
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* AI Tailoring Studio */}
          <TailoringStudio
            job={displayJob}
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