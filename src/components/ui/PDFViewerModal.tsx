import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download } from 'lucide-react';
import { Document, Page, pdfjs } from 'react-pdf';

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
// --- PDF.js Worker Configuration ---
// This line is crucial for the PDF viewer to work.
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface PDFViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  filePath: string | null;
}

export const PDFViewerModal: React.FC<PDFViewerModalProps> = ({ isOpen, onClose, filePath }) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);

  if (!isOpen || !filePath) {
    return null;
  }

  const isPdf = filePath.toLowerCase().endsWith('.pdf');

  // Use Microsoft Office viewer for non-PDF files (e.g., DOCX, PPTX)
  const officeViewerSrc = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(filePath)}`;

  function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
    setNumPages(numPages);
    setPageNumber(1); // Reset to the first page on new document load
  }

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = filePath!;
    link.download = filePath!.split('/').pop() || 'document';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="relative bg-white dark:bg-slate-800 rounded-2xl w-full max-w-4xl h-[90vh] flex flex-col shadow-2xl"
          >
            <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Document Preview
              </h3>
              <div className="flex items-center gap-2">
                {isPdf && (
                  <button
                    onClick={handleDownload}
                    className="p-2 rounded-full text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                    title="Download PDF"
                  >
                    <Download className="h-5 w-5" />
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="p-2 rounded-full text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto">
              {isPdf ? (
                <div className="flex flex-col items-center p-4">
                  <Document
                    file={filePath}
                    onLoadSuccess={onDocumentLoadSuccess}
                    options={{ cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`, cMapPacked: true }}
                  >
                    <Page pageNumber={pageNumber} scale={scale} />
                  </Document>
                </div>
              ) : (
                <iframe
                  src={officeViewerSrc}
                  title="Document Viewer"
                  className="w-full h-full"
                  frameBorder="0"
                  sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                />
              )}
            </div>
            
            {isPdf && numPages && (
              <div className="flex-shrink-0 flex items-center justify-center gap-4 p-3 border-t border-gray-200 dark:border-slate-700">
                <button onClick={() => setScale(s => Math.max(0.5, s - 0.1))} title="Zoom Out" className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700"><ZoomOut size={20} /></button>
                <button onClick={() => setScale(s => Math.min(2.5, s + 0.1))} title="Zoom In" className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700"><ZoomIn size={20} /></button>
                <div className="flex items-center gap-2">
                  <button onClick={() => setPageNumber(p => Math.max(1, p - 1))} disabled={pageNumber <= 1} className="p-2 rounded-full disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-slate-700"><ChevronLeft size={20} /></button>
                  <span className="text-sm font-medium text-gray-700 dark:text-slate-300">
                    Page {pageNumber} of {numPages}
                  </span>
                  <button onClick={() => setPageNumber(p => Math.min(numPages, p + 1))} disabled={pageNumber >= numPages} className="p-2 rounded-full disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-slate-700"><ChevronRight size={20} /></button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};