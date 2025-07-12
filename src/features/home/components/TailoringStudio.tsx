import React, { useState, useEffect } from 'react';
import { X, FileText, Sparkles, Brain, Download, Save, Check, X as XIcon, ArrowRight, Target, Zap, RefreshCw } from 'lucide-react';
import { cleanHtml } from '@/lib/utils';

interface TailoringStudioProps {
  job: any;
  isOpen: boolean;
  onClose: () => void;
  onComplete: (tailoredResume: any) => void;
}

interface Suggestion {
  id: string;
  type: 'addition' | 'revision' | 'highlight';
  originalText?: string;
  suggestedText: string;
  explanation: string;
  section: string;
  accepted: boolean;
  position: number;
}

const TailoringStudio: React.FC<TailoringStudioProps> = ({
  job,
  isOpen,
  onClose,
  onComplete
}) => {
  const [currentStep, setCurrentStep] = useState<'select' | 'analyzing' | 'studio' | 'generating'>('select');
  const [selectedResume, setSelectedResume] = useState<any>(null);
  const [matchScore, setMatchScore] = useState(67);
  const [targetScore, setTargetScore] = useState(89);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [acceptedSuggestions, setAcceptedSuggestions] = useState<string[]>([]);
  const [hoveredSuggestion, setHoveredSuggestion] = useState<string | null>(null);
  const [analysisProgress, setAnalysisProgress] = useState(0);

  // Mock resumes for selection
  const availableResumes = [
    {
      id: '1',
      name: 'Software Engineer Resume - 2024',
      lastModified: '2024-01-15',
      isDefault: true,
      content: `John Doe
Software Engineer

EXPERIENCE
• Senior Software Engineer at TechCorp (2022-Present)
  - Developed web applications using React and Node.js
  - Collaborated with cross-functional teams
  - Implemented CI/CD pipelines

• Software Engineer at StartupXYZ (2020-2022)
  - Built scalable backend services
  - Worked with databases and APIs
  - Participated in code reviews

SKILLS
JavaScript, Python, React, Node.js, SQL, Git`
    },
    {
      id: '2',
      name: 'Frontend Developer Resume',
      lastModified: '2024-01-10',
      isDefault: false,
      content: `John Doe
Frontend Developer

EXPERIENCE
• Frontend Developer at WebCorp (2021-Present)
  - Created responsive user interfaces
  - Worked with design teams
  - Optimized application performance

SKILLS
HTML, CSS, JavaScript, React, Vue.js`
    }
  ];

  // Mock AI suggestions based on job
  const generateSuggestions = (): Suggestion[] => {
    return [
      {
        id: '1',
        type: 'addition',
        suggestedText: 'TypeScript, AWS, PostgreSQL',
        explanation: 'Added key technologies mentioned in the job requirements',
        section: 'Skills',
        accepted: false,
        position: 1
      },
      {
        id: '2',
        type: 'revision',
        originalText: 'Developed web applications using React and Node.js',
        suggestedText: 'Architected and developed scalable web applications using React, TypeScript, and Node.js, serving 10,000+ daily active users',
        explanation: 'Enhanced with specific technologies and quantified impact',
        section: 'Experience',
        accepted: false,
        position: 2
      },
      {
        id: '3',
        type: 'addition',
        suggestedText: '• Led technical architecture decisions for microservices migration, reducing system latency by 40%',
        explanation: 'Added leadership experience and quantified technical achievement',
        section: 'Experience',
        accepted: false,
        position: 3
      },
      {
        id: '4',
        type: 'revision',
        originalText: 'Implemented CI/CD pipelines',
        suggestedText: 'Designed and implemented automated CI/CD pipelines using Jenkins and Docker, reducing deployment time by 60%',
        explanation: 'Added specific tools and quantified improvement',
        section: 'Experience',
        accepted: false,
        position: 4
      }
    ];
  };

  // Job keywords for highlighting
  const jobKeywords = {
    technical: ['React', 'TypeScript', 'Node.js', 'AWS', 'PostgreSQL', 'Docker', 'Kubernetes'],
    soft: ['Leadership', 'Collaboration', 'Communication', 'Problem-solving'],
    experience: ['Senior', '5+ years', 'Architecture', 'Scalable', 'Microservices']
  };

  useEffect(() => {
    if (currentStep === 'analyzing') {
      const interval = setInterval(() => {
        setAnalysisProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => {
              setSuggestions(generateSuggestions());
              setCurrentStep('studio');
            }, 500);
            return 100;
          }
          return prev + 10;
        });
      }, 200);
    }
  }, [currentStep]);

  useEffect(() => {
    // Update match score based on accepted suggestions
    const baseScore = 67;
    const maxImprovement = targetScore - baseScore;
    const improvement = (acceptedSuggestions.length / suggestions.length) * maxImprovement;
    setMatchScore(Math.round(baseScore + improvement));
  }, [acceptedSuggestions, suggestions.length, targetScore]);

  const handleResumeSelect = (resume: any) => {
    setSelectedResume(resume);
    setCurrentStep('analyzing');
    setAnalysisProgress(0);
  };

  const handleSuggestionAccept = (suggestionId: string) => {
    setAcceptedSuggestions(prev => [...prev, suggestionId]);
    setSuggestions(prev => 
      prev.map(s => s.id === suggestionId ? { ...s, accepted: true } : s)
    );
  };

  const handleSuggestionReject = (suggestionId: string) => {
    setSuggestions(prev => prev.filter(s => s.id !== suggestionId));
  };

  const handleGenerateFinal = () => {
    setCurrentStep('generating');
    setTimeout(() => {
      const tailoredResume = {
        id: Date.now().toString(),
        name: `${job.company}_Tailored_Resume_${new Date().toISOString().split('T')[0]}.pdf`,
        isAiTailored: true,
        matchScore: matchScore,
        optimizations: suggestions.filter(s => s.accepted).map(s => s.explanation)
      };
      onComplete(tailoredResume);
    }, 2000);
  };

  const renderJobDescription = () => {
    let description = job.description + " We are looking for a Senior Software Engineer with 5+ years of experience in React, TypeScript, and Node.js. The ideal candidate will have experience with AWS, PostgreSQL, Docker, and Kubernetes. Strong leadership and communication skills are essential. You will be responsible for architecting scalable microservices and mentoring junior developers.";
    
    // Clean HTML first
    description = cleanHtml(description);
    
    // Highlight keywords
    Object.entries(jobKeywords).forEach(([category, keywords]) => {
      keywords.forEach(keyword => {
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
        const colorClass = category === 'technical' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300' :
                          category === 'soft' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
                          'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300';
        
        description = description.replace(regex, `<mark class="px-1 py-0.5 rounded text-xs font-medium ${colorClass}">${keyword}</mark>`);
      });
    });

    return { __html: description };
  };

  const renderResumeWithSuggestions = () => {
    if (!selectedResume) return '';

    let content = selectedResume.content;
    
    suggestions.forEach(suggestion => {
      if (suggestion.type === 'revision' && suggestion.originalText) {
        if (suggestion.accepted) {
          content = content.replace(suggestion.originalText, suggestion.suggestedText);
        } else {
          content = content.replace(
            suggestion.originalText,
            `<span class="suggestion-revision" data-suggestion-id="${suggestion.id}">
              <span class="original-text">${suggestion.originalText}</span>
              <span class="suggested-text">${suggestion.suggestedText}</span>
            </span>`
          );
        }
      } else if (suggestion.type === 'addition') {
        if (suggestion.accepted) {
          if (suggestion.section === 'Skills') {
            content = content.replace('JavaScript, Python, React, Node.js, SQL, Git', 
              'JavaScript, Python, React, Node.js, SQL, Git, ' + suggestion.suggestedText);
          } else {
            content = content.replace('• Software Engineer at StartupXYZ', 
              suggestion.suggestedText + '\n• Software Engineer at StartupXYZ');
          }
        } else {
          const insertPoint = suggestion.section === 'Skills' ? 
            'JavaScript, Python, React, Node.js, SQL, Git' :
            '• Software Engineer at StartupXYZ';
          
          content = content.replace(insertPoint, 
            `${insertPoint}<span class="suggestion-addition" data-suggestion-id="${suggestion.id}">${suggestion.section === 'Skills' ? ', ' + suggestion.suggestedText : '\n' + suggestion.suggestedText}</span>`
          );
        }
      }
    });

    return { __html: content.replace(/\n/g, '<br>') };
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 transition-opacity duration-300" />

      {/* Studio Container */}
      <div className="fixed inset-0 z-50 overflow-hidden">
        <div className="h-full flex flex-col">
          
          {/* Header */}
          <div className="pro-card border-b p-6 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">AI Resume Tailoring Studio</h1>
                <p className="text-gray-600 dark:text-slate-400">Optimize your resume for: <span className="font-semibold">{job.title} at {job.company}</span></p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="drawer-close-button"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            {currentStep === 'select' && (
              <div className="h-full flex items-center justify-center p-8">
                <div className="max-w-2xl w-full">
                  <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                      <Sparkles className="h-10 w-10 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Select Your Base Resume</h2>
                    <p className="text-lg text-gray-600 dark:text-slate-400">Choose a resume for our AI to optimize for this specific job</p>
                  </div>

                  <div className="space-y-4">
                    {availableResumes.map((resume) => (
                      <button
                        key={resume.id}
                        onClick={() => handleResumeSelect(resume)}
                        className="w-full pro-card rounded-2xl p-6 text-left hover:shadow-lg transition-all group"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
                              <FileText className="h-6 w-6 text-red-600 dark:text-red-400" />
                            </div>
                            <div>
                              <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                                {resume.name}
                              </h3>
                              <p className="text-gray-600 dark:text-slate-400">Last modified: {resume.lastModified}</p>
                              {resume.isDefault && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400 mt-1">
                                  Default
                                </span>
                              )}
                            </div>
                          </div>
                          <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {currentStep === 'analyzing' && (
              <div className="h-full flex items-center justify-center p-8">
                <div className="text-center max-w-md">
                  <div className="w-24 h-24 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg">
                    <Brain className="h-12 w-12 text-white animate-pulse" />
                  </div>
                  
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">AI Analysis in Progress</h2>
                  
                  <div className="space-y-4 mb-8">
                    <div className="flex items-center justify-center space-x-2 text-gray-600 dark:text-slate-400">
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Analyzing job requirements...</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2 text-gray-600 dark:text-slate-400">
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Comparing against your resume...</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2 text-gray-600 dark:text-slate-400">
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Generating optimizations...</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2 mb-4">
                    <div 
                      className="bg-gradient-to-r from-cyan-500 to-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${analysisProgress}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-500 dark:text-slate-500">{analysisProgress}% complete</p>
                </div>
              </div>
            )}

            {currentStep === 'studio' && (
              <div className="h-full flex">
                {/* Left Panel - Job Analysis */}
                <div className="w-1/2 border-r border-gray-200 dark:border-slate-700 overflow-y-auto custom-scrollbar">
                  <div className="p-6">
                    <div className="mb-6">
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Job Analysis</h2>
                      
                      {/* Match Score */}
                      <div className="pro-card rounded-2xl p-6 mb-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-semibold text-gray-900 dark:text-white">Current Match Score</h3>
                          <div className="flex items-center space-x-2">
                            <div className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">{matchScore}%</div>
                            <ArrowRight className="h-4 w-4 text-gray-400" />
                            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{targetScore}%</div>
                          </div>
                        </div>
                        
                        {/* Progress Ring */}
                        <div className="relative w-24 h-24 mx-auto">
                          <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                            <circle
                              cx="50"
                              cy="50"
                              r="40"
                              stroke="currentColor"
                              strokeWidth="8"
                              fill="transparent"
                              className="text-gray-200 dark:text-slate-700"
                            />
                            <circle
                              cx="50"
                              cy="50"
                              r="40"
                              stroke="currentColor"
                              strokeWidth="8"
                              fill="transparent"
                              strokeDasharray={`${2 * Math.PI * 40}`}
                              strokeDashoffset={`${2 * Math.PI * 40 * (1 - matchScore / 100)}`}
                              className="text-cyan-500 transition-all duration-500"
                              strokeLinecap="round"
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-lg font-bold text-gray-900 dark:text-white">{matchScore}%</span>
                          </div>
                        </div>
                      </div>

                      {/* Keyword Legend */}
                      <div className="pro-card rounded-2xl p-4 mb-6">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Highlighted Keywords</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700 rounded"></div>
                            <span className="text-gray-600 dark:text-slate-400">Technical Skills</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded"></div>
                            <span className="text-gray-600 dark:text-slate-400">Soft Skills</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-purple-100 dark:bg-purple-900/30 border border-purple-300 dark:border-purple-700 rounded"></div>
                            <span className="text-gray-600 dark:text-slate-400">Experience Level</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Job Description */}
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Job Description</h3>
                      <div 
                        className="prose prose-sm dark:prose-invert max-w-none text-gray-700 dark:text-slate-300 leading-relaxed"
                        dangerouslySetInnerHTML={renderJobDescription()}
                      />
                    </div>
                  </div>
                </div>

                {/* Right Panel - Resume Editor */}
                <div className="w-1/2 overflow-y-auto custom-scrollbar">
                  <div className="p-6">
                    <div className="mb-6">
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Your Tailored Resume</h2>
                      <p className="text-gray-600 dark:text-slate-400">Review and accept AI suggestions to improve your match score</p>
                    </div>

                    {/* Suggestions Summary */}
                    <div className="pro-card rounded-2xl p-4 mb-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Zap className="h-5 w-5 text-cyan-500" />
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {acceptedSuggestions.length} of {suggestions.length} suggestions applied
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-slate-400">
                          +{Math.round((acceptedSuggestions.length / suggestions.length) * (targetScore - 67))} points
                        </div>
                      </div>
                    </div>

                    {/* Resume Content */}
                    <div className="pro-card rounded-2xl p-6 relative">
                      <div 
                        className="whitespace-pre-wrap font-mono text-sm text-gray-900 dark:text-white leading-relaxed"
                        dangerouslySetInnerHTML={renderResumeWithSuggestions()}
                      />

                      {/* Suggestion Tooltips */}
                      {suggestions.map(suggestion => (
                        !suggestion.accepted && (
                          <div
                            key={suggestion.id}
                            className={`absolute z-10 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-4 shadow-lg max-w-sm ${
                              hoveredSuggestion === suggestion.id ? 'block' : 'hidden'
                            }`}
                            style={{ top: '50%', left: '100%', marginLeft: '10px', transform: 'translateY(-50%)' }}
                          >
                            <p className="text-sm text-gray-700 dark:text-slate-300 mb-3">{suggestion.explanation}</p>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleSuggestionAccept(suggestion.id)}
                                className="flex items-center px-3 py-1.5 bg-cyan-500 text-white rounded-lg text-sm font-medium hover:bg-cyan-600 transition-colors"
                              >
                                <Check className="h-3 w-3 mr-1" />
                                Accept
                              </button>
                              <button
                                onClick={() => handleSuggestionReject(suggestion.id)}
                                className="flex items-center px-3 py-1.5 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                              >
                                <XIcon className="h-3 w-3 mr-1" />
                                Reject
                              </button>
                            </div>
                          </div>
                        )
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 'generating' && (
              <div className="h-full flex items-center justify-center p-8">
                <div className="text-center max-w-md">
                  <div className="w-24 h-24 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg">
                    <FileText className="h-12 w-12 text-white animate-pulse" />
                  </div>
                  
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Generating Your Tailored Resume</h2>
                  <p className="text-gray-600 dark:text-slate-400 mb-8">Creating a perfectly optimized PDF with all your accepted changes...</p>
                  
                  <div className="flex items-center justify-center space-x-2 text-cyan-600 dark:text-cyan-400">
                    <RefreshCw className="h-5 w-5 animate-spin" />
                    <span className="font-medium">Almost ready...</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Bar */}
          {currentStep === 'studio' && (
            <div className="pro-card border-t p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-slate-400">
                    <Target className="h-4 w-4" />
                    <span>Match Score: <span className="font-semibold text-cyan-600 dark:text-cyan-400">{matchScore}%</span></span>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-slate-400">
                    {acceptedSuggestions.length} suggestions applied
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <button
                    onClick={onClose}
                    className="btn-secondary px-6 py-3 rounded-xl font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleGenerateFinal}
                    disabled={acceptedSuggestions.length === 0}
                    className={`px-8 py-3 rounded-xl font-bold transition-all ${
                      acceptedSuggestions.length > 0
                        ? 'btn-primary'
                        : 'bg-gray-300 dark:bg-slate-700 text-gray-500 dark:text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    Generate Final Resume
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Custom Styles for Suggestions */}
      <style jsx>{`
        .suggestion-revision .original-text {
          text-decoration: line-through;
          color: #9CA3AF;
        }
        .suggestion-revision .suggested-text {
          color: #2DD4BF;
          text-decoration: underline;
          margin-left: 8px;
        }
        .suggestion-addition {
          color: #2DD4BF;
          text-decoration: underline;
        }
        .suggestion-revision:hover,
        .suggestion-addition:hover {
          background-color: rgba(45, 212, 191, 0.1);
          border-radius: 4px;
          padding: 2px 4px;
          cursor: pointer;
        }
      `}</style>
    </>
  );
};

export default TailoringStudio;