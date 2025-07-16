// src/features/dashboard/components/ResumeCard.tsx
import React from 'react';
import { FileText, Download, Trash2, Eye } from 'lucide-react';

interface ResumeCardProps {
  resume: {
    _id: string;
    fileName: string;
    fileSize: number;
    createdAt: string;
    filePath: string;
  };
  onView: (filePath: string) => void;
  onDelete: (resumeId: string) => void;
  onDownload: (filePath: string) => void;
}

export const ResumeCard: React.FC<ResumeCardProps> = ({ resume, onView, onDelete, onDownload }) => {
  const formattedSize = `${Math.round(resume.fileSize / 1024)} KB`;
  const formattedDate = new Date(resume.createdAt).toLocaleDateString();

  return (
    <div className="pro-card rounded-2xl p-6 group transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <div className="flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-2xl mb-4 mx-auto">
        <FileText className="h-8 w-8 text-red-600 dark:text-red-400" />
      </div>

      <div className="text-center mb-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2" title={resume.fileName}>
          {resume.fileName}
        </h3>
        <div className="flex items-center justify-center space-x-4 text-sm text-gray-500 dark:text-slate-400">
          <span>{formattedSize}</span>
          <span>•</span>
          <span>{formattedDate}</span>
        </div>
      </div>

      <div className="flex items-center justify-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <button
          onClick={() => onView(resume.filePath)}
          className="p-2 text-gray-500 dark:text-slate-400 hover:text-blue-600 rounded-lg transition-all"
          title="View PDF"
        >
          <Eye className="h-4 w-4" />
        </button>
        <button
          onClick={() => onDownload(resume.filePath)}
          className="p-2 text-gray-500 dark:text-slate-400 hover:text-accent rounded-lg transition-all"
          title="Download"
        >
          <Download className="h-4 w-4" />
        </button>
        <button
          onClick={() => onDelete(resume._id)}
          className="p-2 text-gray-500 dark:text-slate-400 hover:text-red-600 rounded-lg transition-all"
          title="Delete"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};