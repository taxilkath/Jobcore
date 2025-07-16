import Uppy from '@uppy/core';
import '@uppy/core/dist/style.css';
import '@uppy/dashboard/dist/style.css';
import { DashboardModal } from '@uppy/react';
import Tus from '@uppy/tus';
import Url from '@uppy/url';
import '@uppy/url/dist/style.css';
import { AnimatePresence, motion } from 'framer-motion';
import { Activity, Building, Calendar, DollarSign, ExternalLink, FileText, MapPin, Menu, Settings, Sparkles, Star, Trash2, Upload, User, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner'; // For user feedback
import { BorderTrail } from '../../../components/ui/border-trail';
import { ConfirmModal } from '../../../components/ui/ConfirmModal';
import { InteractiveHoverButton } from '../../../components/ui/interactive-hover-button';
import { useAuth } from '../../../contexts/AuthContext'; // We'll need the user context
import { getAppliedJobsFromAPI, getSavedJobsWithDetailsFromAPI, markJobAsAppliedAPI, removeSavedJobFromAPI } from '../../../lib/userService';
import { ResumeCard } from '../../home/components/ResumeCard';
import JobDetailDrawer from '../../jobs/components/JobDetailDrawer';
import { PDFViewerModal } from '../../../components/ui/PDFViewerModal';

interface DashboardProps {
  onNavigateHome: () => void;
}

const uppy = new Uppy({
  meta: { type: 'resume' },
  restrictions: { maxNumberOfFiles: 1, allowedFileTypes: ['.pdf', '.doc', '.docx'] },
  autoProceed: true,
})
  .use(Tus, { endpoint: 'https://tusd.tusdemo.net/files/' })
  .use(Url, { companionUrl: 'https://companion.uppy.io/' });

const Dashboard: React.FC<DashboardProps> = ({ onNavigateHome }) => {
  const [activeSection, setActiveSection] = useState('resumes'); // Start on the resumes tab
  const [activeTab, setActiveTab] = useState<'applied' | 'saved'>('applied');
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isUploadModalOpen, setUploadModalOpen] = useState(false);
  const [savedJobs, setSavedJobs] = useState<any[]>([]);
  const [appliedJobs, setAppliedJobs] = useState<any[]>([]);
  const [loadingSavedJobs, setLoadingSavedJobs] = useState(false);
  const [loadingAppliedJobs, setLoadingAppliedJobs] = useState(false);
  const [selectedSavedJob, setSelectedSavedJob] = useState<any>(null);
  const [isJobDrawerOpen, setIsJobDrawerOpen] = useState(false);
  // --- New state for the delete confirmation modal ---
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [resumeToDelete, setResumeToDelete] = useState<string | null>(null);
  // --- New state for the PDF viewer modal ---
  const [isPdfViewerOpen, setPdfViewerOpen] = useState(false);
  const [pdfToView, setPdfToView] = useState<string | null>(null);
  // Mobile sidebar state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const { user } = useAuth(); // Get user from your AuthContext

  // State to hold your resumes. We will fetch these from the backend later.
  // For now, we start with an empty array.
  const [resumes, setResumes] = useState<any[]>([]);
  const [loadingResumes, setLoadingResumes] = useState(true);

  // Uppy instance managed by React state
  const [uppy] = useState(() => new Uppy({
    meta: { type: 'resume' },
    restrictions: { maxNumberOfFiles: 1, allowedFileTypes: ['.pdf', '.doc', '.docx'] },
    autoProceed: false, // Important: We handle the upload manually
  }));

  // New useEffect for handling the Vercel Blob upload process
  useEffect(() => {
    const handleFileAdded = async (file: any) => {
      if (!user) {
        toast.error('You must be logged in to upload a resume.');
        uppy.removeFile(file.id);
        return;
      }

      const formData = new FormData();
      // The key 'resume' should match what multer expects, but `upload.any()` is flexible.
      formData.append('resume', file.data);
      formData.append('userId', user.id);

      try {
        // Remove the incorrect setFileState call for progress
        // uppy.setFileState(file.id, { progress: { uploadStarted: Date.now() } });

        // Send the file directly to your backend in a single request.
        const response = await fetch('/api/resumes/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Upload failed');
        }

        const result = await response.json();

        toast.success(result.message);
        setResumes(prev => [result.resume, ...prev]);
        setUploadModalOpen(false);
        uppy.clear(); // Use clear() instead of reset()

      } catch (error: any) {
        toast.error(error.message || 'An error occurred during upload.');
        uppy.setFileState(file.id, { error: error.message });
      }
    };

    uppy.on('file-added', handleFileAdded);

    return () => {
      uppy.off('file-added', handleFileAdded);
    };
  }, [uppy, user]); // Dependencies
  
   // Fetch saved jobs from API
   useEffect(() => {
    const fetchSavedJobs = async () => {
      setLoadingSavedJobs(true);
      try {
        const jobs = await getSavedJobsWithDetailsFromAPI();
        setSavedJobs(jobs);
      } catch (error) {
        console.error('Failed to fetch saved jobs:', error);
        setSavedJobs([]);
      } finally {
        setLoadingSavedJobs(false);
      }
    };

    fetchSavedJobs();
  }, []);

  // Fetch applied jobs from API
  useEffect(() => {
    const fetchAppliedJobs = async () => {
      setLoadingAppliedJobs(true);
      try {
        const jobs = await getAppliedJobsFromAPI();
        setAppliedJobs(jobs);
      } catch (error) {
        console.error('Failed to fetch applied jobs:', error);
        setAppliedJobs([]);
      } finally {
        setLoadingAppliedJobs(false);
      }
    };

    fetchAppliedJobs();
  }, []);

  // --- This is a new function to fetch existing resumes ---
  const fetchResumes = async () => {
    if (!user) return;
    setLoadingResumes(true);
    try {
      // We will create this API endpoint next
      const response = await fetch(`/api/resumes/user/${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setResumes(data.resumes || []);
      } else {
        setResumes([]);
      }
    } catch (error) {
      console.error("Failed to fetch resumes:", error);
      setResumes([]);
    } finally {
      setLoadingResumes(false);
    }
  };

  // Fetch resumes when the component mounts or the user changes
  useEffect(() => {
    fetchResumes();
  }, [user]);
  // --- End of Changes ---

  // --- New handler functions for resume actions ---
  const handleViewResume = (filePath: string) => {
    setPdfToView(filePath);
    setPdfViewerOpen(true);
  };

  const handleDownloadResume = (filePath: string) => {
    const link = document.createElement('a');
    link.href = filePath;
    link.setAttribute('download', '');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeleteRequest = (resumeId: string) => {
    setResumeToDelete(resumeId);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!resumeToDelete || !user) {
      toast.error("Could not delete resume. Required information is missing.");
      return;
    }

    try {
      // Call your backend DELETE endpoint
      const response = await fetch(`/api/resumes/user/${user.id}/resume/${resumeToDelete}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete resume.');
      }

      // If successful, update the UI optimistically
      setResumes(prev => prev.filter(r => r._id !== resumeToDelete));
      toast.success('Resume deleted successfully.');

    } catch (error: any) {
      toast.error(error.message || 'An error occurred during deletion.');
    } finally {
      // Close the modal and reset state
      setDeleteModalOpen(false);
      setResumeToDelete(null);
    }
  };


  const handleResumeAction = (action: string, resumeId: string) => {
    switch (action) {
      case 'setDefault':
        setResumes(prev => prev.map(resume => ({
          ...resume,
          isDefault: resume._id === resumeId // Assuming _id is the correct field for updating
        })));
        break;
      case 'delete':
        setResumes(prev => prev.filter(resume => resume._id !== resumeId)); // Assuming _id is the correct field for deleting
        break;
      case 'download':
        console.log('Downloading resume:', resumeId);
        break;
      default:
        break;
    }
  };

  const handleRemoveSavedJob = async (jobId: string) => {
    try {
      await removeSavedJobFromAPI(jobId);
      setSavedJobs(prev => prev.filter(job => job.jobId !== jobId));
    } catch (error) {
      console.error('Failed to remove saved job:', error);
    }
  };

  const handleSavedJobClick = async (savedJob: any) => {
    // If we have fullJobData, use it; otherwise fetch from main jobs API
    if (savedJob.fullJobData) {
      setSelectedSavedJob(savedJob.fullJobData);
    } else {
      // Try to fetch full job details from main API
      try {
        const response = await fetch(`/api/jobs/${savedJob.jobId}`);
        if (response.ok) {
          const fullJob = await response.json();
          setSelectedSavedJob(fullJob);
        } else {
          // Fallback to saved job data if API fetch fails
          setSelectedSavedJob(savedJob);
        }
      } catch (error) {
        console.error('Failed to fetch full job details:', error);
        setSelectedSavedJob(savedJob);
      }
    }
    setIsJobDrawerOpen(true);
  };

  const handleCloseJobDrawer = () => {
    setIsJobDrawerOpen(false);
    setSelectedSavedJob(null);
  };

  const handleApplyToSavedJob = async (jobId: string) => {
    const savedJob = savedJobs.find(job => job.jobId === jobId);
    if (savedJob) {
      // Try multiple possible application URL fields
      const applyUrl = savedJob.applicationUrl ||
        savedJob.apply_url ||
        savedJob.applyUrl;

      if (applyUrl) {
        window.open(applyUrl, '_blank', 'noopener,noreferrer');

        try {
          // Mark job as applied in the database
          await markJobAsAppliedAPI(jobId);

          // Remove from saved jobs list
          setSavedJobs(prev => prev.filter(job => job.jobId !== jobId));

          // Refresh applied jobs list
          const updatedAppliedJobs = await getAppliedJobsFromAPI();
          setAppliedJobs(updatedAppliedJobs);
        } catch (error) {
          console.error('Failed to mark job as applied:', error);
        }
      }
    }
    handleCloseJobDrawer();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Review':
        return 'ghost-pill-in-review';
      case 'Application Sent':
        return 'ghost-pill-application-sent';
      case 'Viewed':
        return 'ghost-pill-viewed';
      default:
        return 'ghost-pill';
    }
  };

  const handleJobRowClick = (jobId: string) => {
    setSelectedJobId(jobId);
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setSelectedJobId(null);
  };

  const selectedJob = appliedJobs.find(job => job.id === selectedJobId);

  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'resumes', label: 'My Resumes', icon: FileText },
    { id: 'activity', label: 'Job Activity', icon: Activity },
    { id: 'settings', label: 'Profile Settings', icon: Settings }
  ];

  const renderOverview = () => (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="pro-card rounded-3xl p-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Welcome back! 👋
        </h2>
        <p className="text-gray-600 dark:text-slate-300 text-base sm:text-lg mb-6">
          Here's what's happening with your job search
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="pro-card rounded-2xl p-4 sm:p-6 text-center">
            <div className="text-2xl sm:text-3xl font-bold text-accent mb-2">{savedJobs.length}</div>
            <div className="text-gray-600 dark:text-slate-400 font-medium text-sm sm:text-base">Saved Jobs</div>
          </div>
          <div className="pro-card rounded-2xl p-4 sm:p-6 text-center">
            <div className="text-2xl sm:text-3xl font-bold text-accent mb-2">{appliedJobs.length}</div>
            <div className="text-gray-600 dark:text-slate-400 font-medium text-sm sm:text-base">Applications</div>
          </div>
          <div className="pro-card rounded-2xl p-4 sm:p-6 text-center">
            <div className="text-2xl sm:text-3xl font-bold text-accent mb-2">{resumes.length}</div>
            <div className="text-gray-600 dark:text-slate-400 font-medium text-sm sm:text-base">Resumes</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="pro-card rounded-2xl p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {appliedJobs.slice(0, 2).map((job) => (
              <div key={job.id} className="flex items-center space-x-3">
              <img src={job.logo} alt={job.company?.name || job.company} className="company-logo w-10 h-10 rounded-lg object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{job.title}</p>
                <p className="text-xs text-gray-500 dark:text-slate-400">{job.company?.name || job.company} • {job.appliedDate}</p>
                </div>
                <span className={`ghost-pill text-xs ${getStatusColor(job.status)}`}>
                  {job.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="pro-card rounded-2xl p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4">Saved Jobs</h3>
          <div className="space-y-4">
            {savedJobs.slice(0, 2).map((job) => (
              <div key={job.id} className="flex items-center space-x-3">
              <img src={job.logo} alt={job.company?.name || job.companyName} className="company-logo w-10 h-10 rounded-lg object-cover" />
                <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{job.title || job.jobTitle}</p>
                <p className="text-xs text-gray-500 dark:text-slate-400">{job.company?.name || job.companyName} • {job.salary}</p>
                </div>
                <button className="text-accent hover:text-accent/80 transition-colors">
                  <ExternalLink className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // --- Update your renderResumes function ---
  const renderResumes = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">My Resumes</h2>
          <p className="text-gray-600 dark:text-slate-400 text-sm sm:text-base">Manage your resume collection</p>
        </div>
        <button 
          onClick={() => setUploadModalOpen(true)}
          className="btn-primary flex items-center px-6 py-3 rounded-xl font-semibold"
        >
          <Upload className="h-5 w-5 mr-2" />
          Upload New Resume
        </button>
      </div>
      {loadingResumes ? (
        <div className="text-center py-16">Loading...</div>
      ) : resumes.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {resumes.map((resume) => (
            <ResumeCard 
              key={resume._id}
              resume={resume}
              onView={handleViewResume}
              onDownload={handleDownloadResume}
              onDelete={handleDeleteRequest}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-gray-100 dark:bg-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <FileText className="h-12 w-12 text-gray-400 dark:text-slate-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No resumes uploaded</h3>
          <p className="text-gray-600 dark:text-slate-400 mb-6">Upload your first resume to get started</p>
          <button 
            onClick={() => setUploadModalOpen(true)}
            className="btn-primary flex items-center px-6 py-3 rounded-xl font-semibold mx-auto"
          >
            <Upload className="h-5 w-5 mr-2" />
            Upload Resume
          </button>
        </div>
      )}
    </div>
  );

  const renderActivity = () => {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">Job Activity</h2>
          <p className="text-gray-600 dark:text-slate-400 text-sm sm:text-base">Track your applications and saved opportunities</p>
        </div>

        {/* Clean Tabs - NO GRADIENTS */}
        <div className="border-b border-gray-200 dark:border-slate-700">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('applied')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'applied'
                  ? 'tab-active'
                  : 'tab-inactive'
                }`}
            >
              Applied Jobs ({appliedJobs.length})
            </button>
            <button
              onClick={() => setActiveTab('saved')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'saved'
                  ? 'tab-active'
                  : 'tab-inactive'
                }`}
            >
              Saved Jobs ({savedJobs.length})
            </button>
          </nav>
        </div>

        {/* Compact List View */}
        <div className="space-y-3">
          {activeTab === 'applied' ? (
            appliedJobs.length > 0 ? (
              appliedJobs.map((job) => (
                <div
                  key={job.id}
                  className="relative w-full cursor-pointer group hover:shadow-md transition-all bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-6"
                  onClick={() => handleJobRowClick(job.id)}
                >
                  <BorderTrail
                    className="bg-blue-500"
                    size={80}
                    style={{
                      boxShadow: "0px 0px 20px 10px rgb(59 130 246 / 25%), 0 0 30px 15px rgb(59 130 246 / 15%), 0 0 40px 20px rgb(59 130 246 / 10%)",
                    }}
                  />
                  <div className="flex items-center">
                    {/* Job Identity (40% width) */}
                    <div className="flex-1 flex items-center space-x-4" style={{ maxWidth: '40%' }}>
                      <img src={job.logo} alt={job.company} className="company-logo w-12 h-12 rounded-xl object-cover" />
                      <div className="min-w-0 flex-1">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 truncate group-hover:text-accent transition-colors">
                          {job.title}
                        </h3>
                        <p className="text-gray-600 dark:text-slate-400 font-medium truncate">{job.company}</p>
                      </div>
                    </div>

                    {/* Date Applied (30% width) */}
                    <div className="flex-1 px-6" style={{ maxWidth: '30%' }}>
                      <div className="flex items-center text-gray-600 dark:text-slate-400">
                        <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span className="text-sm font-medium">Applied on {job.appliedDate}</span>
                      </div>
                    </div>

                    {/* Application Status (30% width, right-aligned) */}
                    <div className="flex-1 flex justify-end" style={{ maxWidth: '30%' }}>
                      <span className={`ghost-pill ${getStatusColor(job.status)}`}>
                        {job.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gray-100 dark:bg-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Activity className="h-12 w-12 text-gray-400 dark:text-slate-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No applications yet</h3>
                <p className="text-gray-600 dark:text-slate-400 mb-6">Start applying to jobs to track your progress here</p>
                <button
                  onClick={onNavigateHome}
                  className="btn-primary px-6 py-3 rounded-xl font-semibold"
                >
                  Find Jobs
                </button>
              </div>
            )
          ) : (
            loadingSavedJobs ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gray-100 dark:bg-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Star className="h-12 w-12 text-gray-400 dark:text-slate-500 animate-pulse" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Loading saved jobs...</h3>
              </div>
            ) : savedJobs.length > 0 ? (
              savedJobs.map((job) => (
                <div
                  key={job.jobId}
                  className="relative w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-6 cursor-pointer group hover:shadow-md transition-all"
                  onClick={() => handleSavedJobClick(job)}
                >
                  <BorderTrail
                    className="bg-green-500"
                    size={80}
                    style={{
                      boxShadow: "0px 0px 20px 10px rgb(34 197 94 / 25%), 0 0 30px 15px rgb(34 197 94 / 15%), 0 0 40px 20px rgb(34 197 94 / 10%)",
                    }}
                  />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="w-12 h-12 rounded-xl bg-white dark:bg-white shadow-sm border border-gray-200 dark:border-gray-300 flex items-center justify-center overflow-hidden">
                        {job.company?.logo_url ? (
                          <img
                            src={job.company.logo_url}
                            alt={job.companyName}
                            className="w-full h-full object-contain p-1"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              target.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                        ) : null}
                        <Building className={`h-6 w-6 text-blue-600 dark:text-blue-500 ${job.company?.logo ? 'hidden' : ''}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 group-hover:text-accent transition-colors">{job.jobTitle}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-slate-400">
                          <div className="flex items-center">
                            <Building className="h-4 w-4 mr-1" />
                            {job.companyName}
                          </div>
                          {job.location && (
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-1" />
                              {job.location}
                            </div>
                          )}
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            Saved {new Date(job.savedAt).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="mt-2 text-sm text-gray-500 dark:text-slate-400">
                          Click to view details and apply
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {/* Apply button that opens drawer */}
                      <InteractiveHoverButton
                        text={(() => {
                          const applyUrl = job.url || job.applicationUrl || job.apply_url || job.applyUrl;
                          return (applyUrl && job.external) ? "Apply Now" : "Apply with AI";
                        })()}
                        className={(() => {
                          const applyUrl = job.url || job.applicationUrl || job.apply_url || job.applyUrl;
                          return (applyUrl && job.external)
                            ? "px-4 py-2 text-sm font-medium bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white border-2 border-emerald-500 hover:border-emerald-400 rounded-lg shadow-md hover:shadow-lg hover:shadow-emerald-500/25 transition-all duration-300 hover:scale-105 active:scale-95"
                            : "px-4 py-2 text-sm font-medium bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white border-2 border-purple-500 hover:border-purple-400 rounded-lg shadow-md hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 hover:scale-105 active:scale-95";
                        })()}
                        onClick={async (e) => {
                          e.stopPropagation();
                          // Check if this is an external job with apply URL
                          const applyUrl = job.url ||
                            job.applicationUrl ||
                            job.apply_url ||
                            job.applyUrl;

                          if (applyUrl && job.external) {
                            // External job with apply URL - open directly
                            window.open(applyUrl, '_blank', 'noopener,noreferrer');

                            try {
                              // Mark job as applied in the database
                              await markJobAsAppliedAPI(job.jobId);

                              // Remove from saved jobs list
                              setSavedJobs(prev => prev.filter(savedJob => savedJob.jobId !== job.jobId));

                              // Refresh applied jobs list
                              const updatedAppliedJobs = await getAppliedJobsFromAPI();
                              setAppliedJobs(updatedAppliedJobs);
                            } catch (error) {
                              console.error('Failed to mark job as applied:', error);
                            }
                          } else {
                            // Apply with AI button - no action for now
                            console.log('Apply with AI clicked - no action implemented yet');
                          }
                        }}
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveSavedJob(job.jobId);
                        }}
                        className="group relative px-4 py-2 text-sm font-medium text-gray-500 dark:text-slate-400 bg-white dark:bg-slate-800 border-2 border-gray-300 dark:border-slate-600 hover:border-red-400 dark:hover:border-red-500 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-red-500/20 hover:scale-105 active:scale-95"
                      >
                        <div className="flex items-center space-x-2">
                          <Trash2 className="h-4 w-4 transition-transform duration-300 group-hover:rotate-12" />
                        </div>
                        <div className="absolute inset-0 bg-red-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gray-100 dark:bg-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Star className="h-12 w-12 text-gray-400 dark:text-slate-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No saved jobs yet</h3>
                <p className="text-gray-600 dark:text-slate-400 mb-6">Start exploring and save jobs you're interested in</p>
                <button
                  onClick={onNavigateHome}
                  className="btn-primary px-6 py-3 rounded-xl font-semibold"
                >
                  Browse Jobs
                </button>
              </div>
            )
          )}
        </div>

        {/* Application Details Drawer */}
        {drawerOpen && selectedJob && (
          <AnimatePresence>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="fixed inset-0 bg-gray-500/30 dark:bg-black/50 backdrop-blur-sm z-50"
              onClick={handleCloseDrawer}
            />
            {/* Drawer */}
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
                    <h1>{selectedJob.title}</h1>
                    <p>{selectedJob.company}</p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                    onClick={handleCloseDrawer}
                    className="drawer-close-button group"
                  >
                    <X className="h-6 w-6" />
                  </motion.button>
                </div>

                {/* Application Details Section */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                  className="drawer-section"
                >
                  <div className="section-header">
                    <Activity />
                    Application Status
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-xl">
                      <p className="text-sm text-gray-500 dark:text-slate-400 mb-1">Status</p>
                      <p className={`font-semibold text-lg ${getStatusColor(selectedJob.status).replace('ghost-pill-', 'text-')}`}>{selectedJob.status}</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-xl">
                      <p className="text-sm text-gray-500 dark:text-slate-400 mb-1">Applied on</p>
                      <p className="font-semibold text-lg text-gray-900 dark:text-white">{selectedJob.appliedDate}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <div className="ghost-pill ghost-pill-location"><MapPin className="h-3.5 w-3.5 mr-1.5" />{selectedJob.location}</div>
                    <div className="ghost-pill ghost-pill-salary"><DollarSign className="h-3.5 w-3.5 mr-1.5" />{selectedJob.salary}</div>
                  </div>
                </motion.div>

                {/* AI Resume Insights */}
                {selectedJob.isAiTailored && (
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                    className="drawer-section"
                  >
                    <div className="section-header">
                      <Sparkles />
                      AI Resume Insights
                    </div>
                    <p className="text-sm text-gray-600 dark:text-slate-300 mb-3">Resume used: <span className="font-medium text-gray-800 dark:text-slate-100">{selectedJob.resumeUsed}</span></p>
                    <ul className="accent-list">
                      {selectedJob.aiOptimizations?.map((item: string, index: number) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </motion.div>
                )}

                {/* Actions */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.4 }}
                  className="drawer-section"
                >
                  <div className="section-header">
                    <ExternalLink />
                    Actions
                  </div>
                  <div className="flex gap-4">
                    <button className="btn-secondary flex-1">View Original Job Post</button>
                    <button className="btn-secondary flex-1">Withdraw Application</button>
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    );
  };

  const renderSettings = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Profile Settings</h2>
        <p className="text-gray-600 dark:text-slate-400">Manage your account preferences</p>
      </div>

      <div className="pro-card rounded-2xl p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Personal Information</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">
              Full Name
            </label>
            <input
              type="text"
              defaultValue="John Doe"
              className="pro-input w-full px-4 py-3 rounded-xl"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">
              Email Address
            </label>
            <input
              type="email"
              defaultValue="john.doe@example.com"
              className="pro-input w-full px-4 py-3 rounded-xl"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              defaultValue="+1 (555) 123-4567"
              className="pro-input w-full px-4 py-3 rounded-xl"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">
              Location
            </label>
            <input
              type="text"
              defaultValue="San Francisco, CA"
              className="pro-input w-full px-4 py-3 rounded-xl"
            />
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-slate-700">
          <button className="btn-primary px-6 py-3 rounded-xl font-semibold">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return renderOverview();
      case 'resumes':
        return renderResumes();
      case 'activity':
        return renderActivity();
      case 'settings':
        return renderSettings();
      default:
        return renderOverview();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
            <p className="text-sm text-gray-600 dark:text-slate-400">Manage your career journey</p>
          </div>
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
          >
            <Menu className="h-6 w-6 text-gray-600 dark:text-gray-300" />
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="flex gap-4 sm:gap-6 lg:gap-8">
          {/* Mobile Sidebar Overlay */}
          {isSidebarOpen && (
            <>
              <div 
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
                onClick={() => setIsSidebarOpen(false)}
              />
              <div className="fixed inset-y-0 left-0 z-50 w-80 bg-white dark:bg-slate-800 shadow-xl transform transition-transform duration-300 ease-in-out lg:hidden">
                <div className="pro-card rounded-none h-full p-6 overflow-y-auto">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Dashboard</h2>
                      <p className="text-gray-600 dark:text-slate-400">Manage your career journey</p>
                    </div>
                    <button
                      onClick={() => setIsSidebarOpen(false)}
                      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                    >
                      <X className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                    </button>
                  </div>

                  <nav className="space-y-2">
                    {sidebarItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            setActiveSection(item.id);
                            setIsSidebarOpen(false);
                          }}
                          className={`w-full flex items-center px-4 py-3 rounded-xl text-left transition-all ${activeSection === item.id
                              ? 'nav-active'
                              : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-slate-700'
                            }`}
                        >
                          <Icon className="h-5 w-5 mr-3" />
                          {item.label}
                        </button>
                      );
                    })}
                  </nav>
                </div>
              </div>
            </>
          )}

          {/* Desktop Left Sidebar */}
          <div className="w-80 flex-shrink-0 hidden lg:block">
            <div className="pro-card rounded-2xl p-6 sticky top-8">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Dashboard</h2>
                <p className="text-gray-600 dark:text-slate-400">Manage your career journey</p>
              </div>

              <nav className="space-y-2">
                {sidebarItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveSection(item.id)}
                      className={`w-full flex items-center px-4 py-3 rounded-xl text-left transition-all ${activeSection === item.id
                          ? 'nav-active'
                          : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-slate-700'
                        }`}
                    >
                      <Icon className="h-5 w-5 mr-3" />
                      {item.label}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {renderContent()}
          </div>
        </div>
      </div>
      {/* Job Detail Drawer for Saved Jobs */}
      <JobDetailDrawer
        isOpen={isJobDrawerOpen}
        onClose={handleCloseJobDrawer}
        job={selectedSavedJob}
        onApply={() => handleApplyToSavedJob(selectedSavedJob?.jobId || selectedSavedJob?.id)}
      />
      <DashboardModal
        uppy={uppy}
        open={isUploadModalOpen}
        onRequestClose={() => setUploadModalOpen(false)}
        theme='dark'
        proudlyDisplayPoweredByUppy={false}
        note="Please upload your resume in PDF, DOC, or DOCX format."
        closeModalOnClickOutside={true}
      />
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Resume"
        message="Are you sure you want to permanently delete this resume? This action cannot be undone."
      />
      <PDFViewerModal
        isOpen={isPdfViewerOpen}
        onClose={() => setPdfViewerOpen(false)}
        filePath={pdfToView}
      />
    </div>
  );
};

export default Dashboard;