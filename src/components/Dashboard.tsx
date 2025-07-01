import React, { useState } from 'react';
import { User, FileText, Activity, Settings, Upload, Download, Star, Trash2, Edit3, Calendar, MapPin, Building, Eye, ExternalLink, Sparkles, Brain, Clock, DollarSign, X } from 'lucide-react';
import { BorderTrail } from './ui/border-trail';

interface DashboardProps {
  onNavigateHome: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigateHome }) => {
  const [activeSection, setActiveSection] = useState('activity');
  const [activeTab, setActiveTab] = useState<'applied' | 'saved'>('applied');
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  
  const [resumes, setResumes] = useState([
    {
      id: '1',
      name: 'Software Engineer Resume - 2024',
      uploadDate: '2024-01-15',
      fileSize: '245 KB',
      isDefault: true,
      type: 'pdf'
    },
    {
      id: '2',
      name: 'Frontend Developer Resume',
      uploadDate: '2024-01-10',
      fileSize: '198 KB',
      isDefault: false,
      type: 'pdf'
    }
  ]);

  const [savedJobs] = useState([
    {
      id: '1',
      title: 'Senior Software Engineer',
      company: 'Google',
      location: 'Mountain View, CA',
      salary: '$150k - $200k',
      savedDate: '2024-01-20',
      logo: 'https://images.pexels.com/photos/270408/pexels-photo-270408.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&fit=crop'
    },
    {
      id: '2',
      title: 'Product Manager',
      company: 'Microsoft',
      location: 'Seattle, WA',
      salary: '$130k - $180k',
      savedDate: '2024-01-18',
      logo: 'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&fit=crop'
    }
  ]);

  const [appliedJobs] = useState([
    {
      id: '1',
      title: 'Senior Full Stack Developer',
      company: 'Google',
      location: 'Mountain View, CA',
      salary: '$160k - $220k',
      appliedDate: '2024-01-22',
      status: 'In Review',
      resumeUsed: 'Google_Tailored_Resume_v3.pdf',
      isAiTailored: true,
      aiOptimizations: ['Keyword optimization for Google tech stack', 'Leadership experience highlighted', 'Open source contributions emphasized'],
      logo: 'https://images.pexels.com/photos/270408/pexels-photo-270408.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&fit=crop'
    },
    {
      id: '2',
      title: 'Principal Data Scientist',
      company: 'Meta',
      location: 'Menlo Park, CA',
      salary: '$180k - $250k',
      appliedDate: '2024-01-19',
      status: 'Application Sent',
      resumeUsed: 'Data_Scientist_Resume_Standard.pdf',
      isAiTailored: false,
      logo: 'https://images.pexels.com/photos/267394/pexels-photo-267394.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&fit=crop'
    },
    {
      id: '3',
      title: 'Staff Software Engineer',
      company: 'Apple',
      location: 'Cupertino, CA',
      salary: '$170k - $230k',
      appliedDate: '2024-01-17',
      status: 'Viewed',
      resumeUsed: 'Apple_iOS_Specialist_Resume.pdf',
      isAiTailored: true,
      aiOptimizations: ['iOS development experience prioritized', 'Swift/Objective-C skills highlighted', 'App Store publications featured'],
      logo: 'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&fit=crop'
    }
  ]);

  const handleResumeAction = (action: string, resumeId: string) => {
    switch (action) {
      case 'setDefault':
        setResumes(prev => prev.map(resume => ({
          ...resume,
          isDefault: resume.id === resumeId
        })));
        break;
      case 'delete':
        setResumes(prev => prev.filter(resume => resume.id !== resumeId));
        break;
      case 'download':
        console.log('Downloading resume:', resumeId);
        break;
      default:
        break;
    }
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
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Welcome back! 👋
        </h2>
        <p className="text-gray-600 dark:text-slate-300 text-lg mb-6">
          Here's what's happening with your job search
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="pro-card rounded-2xl p-6 text-center">
            <div className="text-3xl font-bold text-accent mb-2">{savedJobs.length}</div>
            <div className="text-gray-600 dark:text-slate-400 font-medium">Saved Jobs</div>
          </div>
          <div className="pro-card rounded-2xl p-6 text-center">
            <div className="text-3xl font-bold text-accent mb-2">{appliedJobs.length}</div>
            <div className="text-gray-600 dark:text-slate-400 font-medium">Applications</div>
          </div>
          <div className="pro-card rounded-2xl p-6 text-center">
            <div className="text-3xl font-bold text-accent mb-2">{resumes.length}</div>
            <div className="text-gray-600 dark:text-slate-400 font-medium">Resumes</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="pro-card rounded-2xl p-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {appliedJobs.slice(0, 2).map((job) => (
              <div key={job.id} className="flex items-center space-x-3">
                <img src={job.logo} alt={job.company} className="company-logo w-10 h-10 rounded-lg object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{job.title}</p>
                  <p className="text-xs text-gray-500 dark:text-slate-400">{job.company} • {job.appliedDate}</p>
                </div>
                <span className={`ghost-pill text-xs ${getStatusColor(job.status)}`}>
                  {job.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="pro-card rounded-2xl p-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Saved Jobs</h3>
          <div className="space-y-4">
            {savedJobs.slice(0, 2).map((job) => (
              <div key={job.id} className="flex items-center space-x-3">
                <img src={job.logo} alt={job.company} className="company-logo w-10 h-10 rounded-lg object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{job.title}</p>
                  <p className="text-xs text-gray-500 dark:text-slate-400">{job.company} • {job.salary}</p>
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

  const renderResumes = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">My Resumes</h2>
          <p className="text-gray-600 dark:text-slate-400">Manage your resume collection</p>
        </div>
        <button className="btn-primary flex items-center px-6 py-3 rounded-xl font-semibold">
          <Upload className="h-5 w-5 mr-2" />
          Upload New Resume
        </button>
      </div>

      {/* Resume Cards */}
      {resumes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resumes.map((resume) => (
            <div key={resume.id} className="pro-card rounded-2xl p-6 group">
              {/* File Icon */}
              <div className="flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-2xl mb-4 mx-auto">
                <FileText className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>

              {/* Resume Info */}
              <div className="text-center mb-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                  {resume.name}
                </h3>
                <div className="flex items-center justify-center space-x-4 text-sm text-gray-500 dark:text-slate-400">
                  <span>{resume.fileSize}</span>
                  <span>•</span>
                  <span>{resume.uploadDate}</span>
                </div>
                {resume.isDefault && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-accent text-white mt-2">
                    <Star className="h-3 w-3 mr-1" />
                    Default
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleResumeAction('download', resume.id)}
                  className="p-2 text-gray-500 dark:text-slate-400 hover:text-accent rounded-lg transition-all"
                  title="Download"
                >
                  <Download className="h-4 w-4" />
                </button>
                {!resume.isDefault && (
                  <button
                    onClick={() => handleResumeAction('setDefault', resume.id)}
                    className="p-2 text-gray-500 dark:text-slate-400 hover:text-yellow-600 rounded-lg transition-all"
                    title="Set as Default"
                  >
                    <Star className="h-4 w-4" />
                  </button>
                )}
                <button
                  className="p-2 text-gray-500 dark:text-slate-400 hover:text-accent rounded-lg transition-all"
                  title="Rename"
                >
                  <Edit3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleResumeAction('delete', resume.id)}
                  className="p-2 text-gray-500 dark:text-slate-400 hover:text-red-600 rounded-lg transition-all"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-gray-100 dark:bg-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <FileText className="h-12 w-12 text-gray-400 dark:text-slate-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No resumes uploaded</h3>
          <p className="text-gray-600 dark:text-slate-400 mb-6">Upload your first resume to get started</p>
          <button className="btn-primary flex items-center px-6 py-3 rounded-xl font-semibold mx-auto">
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
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Job Activity</h2>
          <p className="text-gray-600 dark:text-slate-400">Track your applications and saved opportunities</p>
        </div>

        {/* Clean Tabs - NO GRADIENTS */}
        <div className="border-b border-gray-200 dark:border-slate-700">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('applied')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'applied'
                  ? 'tab-active'
                  : 'tab-inactive'
              }`}
            >
              Applied Jobs ({appliedJobs.length})
            </button>
            <button
              onClick={() => setActiveTab('saved')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'saved'
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
                      boxShadow: "0px 0px 60px 30px rgb(59 130 246 / 50%), 0 0 100px 60px rgb(59 130 246 / 30%), 0 0 140px 90px rgb(59 130 246 / 20%)",
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
            savedJobs.length > 0 ? (
              savedJobs.map((job) => (
                <div 
                  key={job.id}
                  className="relative w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-6"
                >
                  <BorderTrail
                    className="bg-green-500"
                    size={80}
                    style={{
                      boxShadow: "0px 0px 60px 30px rgb(34 197 94 / 50%), 0 0 100px 60px rgb(34 197 94 / 30%), 0 0 140px 90px rgb(34 197 94 / 20%)",
                    }}
                  />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      <img src={job.logo} alt={job.company} className="company-logo w-12 h-12 rounded-xl object-cover" />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{job.title}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-slate-400">
                          <div className="flex items-center">
                            <Building className="h-4 w-4 mr-1" />
                            {job.company}
                          </div>
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {job.location}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            Saved {job.savedDate}
                          </div>
                        </div>
                        <div className="text-lg font-semibold text-green-600 dark:text-green-400 mt-2">
                          {job.salary}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button className="btn-primary px-6 py-2 rounded-xl font-semibold">
                        Apply Now
                      </button>
                      <button className="p-2 text-gray-400 dark:text-slate-500 hover:text-red-600 transition-colors">
                        <Trash2 className="h-5 w-5" />
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
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity duration-300"
              onClick={handleCloseDrawer}
            />

            {/* Unified Surface Drawer */}
            <div className="fixed top-0 right-0 h-full w-full max-w-2xl unified-drawer z-50 transform transition-transform duration-300 ease-out animate-slide-in overflow-y-auto custom-scrollbar">
              
              {/* Drawer Header */}
              <div className="drawer-header">
                <div className="drawer-title">
                  <h1>{selectedJob.title}</h1>
                  <p>{selectedJob.company}</p>
                </div>
                <button
                  onClick={handleCloseDrawer}
                  className="drawer-close-button"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Application Status Section */}
              <div className="drawer-section">
                <div className="section-header">
                  <Activity />
                  Application Status
                </div>
                <div className="flex items-center justify-between mb-4">
                  <span className={`ghost-pill ${getStatusColor(selectedJob.status)}`}>
                    {selectedJob.status}
                  </span>
                  <div className="text-right">
                    <div className="text-sm text-gray-600 dark:text-slate-400">Applied on</div>
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">{selectedJob.appliedDate}</div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <div className="ghost-pill" style={{ borderColor: '#6B7280', color: '#6B7280' }}>
                    <MapPin className="h-3.5 w-3.5 mr-1.5" />
                    {selectedJob.location}
                  </div>
                  <div className="ghost-pill" style={{ borderColor: '#10B981', color: '#10B981' }}>
                    <DollarSign className="h-3.5 w-3.5 mr-1.5" />
                    {selectedJob.salary}
                  </div>
                </div>
              </div>

              {/* Resume Submitted Section */}
              <div className="drawer-section">
                <div className="section-header">
                  <FileText />
                  Resume Submitted
                </div>
                <div className="resume-row">
                  <FileText className="resume-icon" />
                  <span className="resume-filename">{selectedJob.resumeUsed}</span>
                  <a href="#" className="download-link">
                    Download
                    <Download />
                  </a>
                </div>
                {selectedJob.isAiTailored && (
                  <div className="mt-3">
                    <span className="ghost-pill-ai-tailored">
                      <Brain className="h-3.5 w-3.5 mr-1.5" />
                      <Sparkles className="h-3 w-3 mr-1" />
                      AI Tailored
                    </span>
                  </div>
                )}
              </div>

              {/* AI Optimizations Section */}
              {selectedJob.isAiTailored && selectedJob.aiOptimizations && (
                <div className="drawer-section">
                  <div className="section-header">
                    <Brain />
                    AI Optimizations Applied
                  </div>
                  <ul className="accent-list">
                    {selectedJob.aiOptimizations.map((optimization: string, index: number) => (
                      <li key={index}>{optimization}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Actions Section */}
              <div className="drawer-section">
                <div className="section-header">
                  <ExternalLink />
                  Actions
                </div>
                <div className="space-y-3">
                  <button className="btn-primary w-full py-4 rounded-xl font-bold text-lg">
                    View Original Job Posting
                  </button>
                  <button className="btn-secondary w-full py-4 rounded-xl font-semibold">
                    View Application Details
                  </button>
                </div>
              </div>
            </div>
          </>
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Left Sidebar - Clean Pro Style */}
          <div className="w-80 flex-shrink-0">
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
                      className={`w-full flex items-center px-4 py-3 rounded-xl text-left transition-all ${
                        activeSection === item.id
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
          <div className="flex-1">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;