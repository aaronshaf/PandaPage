import { useState, useEffect } from 'react';

interface SampleDocument {
  id: string;
  title: string;
}

interface NavigationProps {
  showPrimaryNav: boolean;
  setShowPrimaryNav: (show: boolean) => void;
  selectedDocument: string;
  setSelectedDocument: (doc: string) => void;
  uploadedFile: File | null;
  setUploadedFile: (file: File | null) => void;
  handleDocumentLoad: (path: string) => void;
  handleFileUpload: (file: File) => void;
  sampleDocuments: SampleDocument[];
  getBasePath: () => string;
  showOutline: boolean;
  setShowOutline: (show: boolean) => void;
  viewMode: 'read' | 'print';
  setViewMode: (mode: 'read' | 'print') => void;
  printScale: number;
  setPrintScale: (scale: number) => void;
  result: string | null;
  extractHeadings: (markdown: string) => Array<{level: number, text: string, id: string}>;
  removeFrontmatter: (markdown: string) => string;
  wordCount: number;
  processingTime: number | null;
}

export const Navigation: React.FC<NavigationProps> = ({
  showPrimaryNav,
  setShowPrimaryNav,
  selectedDocument,
  setSelectedDocument,
  uploadedFile,
  setUploadedFile,
  handleDocumentLoad,
  handleFileUpload,
  sampleDocuments,
  getBasePath,
  showOutline,
  setShowOutline,
  viewMode,
  setViewMode,
  printScale,
  setPrintScale,
  result,
  extractHeadings,
  removeFrontmatter,
  wordCount,
  processingTime
}) => {
  return (
    <div className="sticky top-0 z-40">
      {/* Primary Header */}
      <div className={`bg-white shadow-sm border-b border-gray-200 overflow-hidden transition-all duration-300 ease-in-out ${
        showPrimaryNav ? 'max-h-24 opacity-100' : 'max-h-0 opacity-0'
      }`}>
        <div className="px-3 sm:px-6 lg:px-8 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center flex-shrink-0">
            <h1 className="text-lg sm:text-xl font-semibold text-gray-900">pandapage</h1>
          </div>
          
          {/* Document controls */}
          <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto">
            {/* Document dropdown */}
            <div className="hidden sm:flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 shadow-sm border border-gray-200">
              <label htmlFor="document-select" className="text-sm font-medium text-gray-700 whitespace-nowrap">
                Document:
              </label>
              <select
                id="document-select"
                value={uploadedFile ? 'uploaded' : selectedDocument}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value !== 'uploaded') {
                    setUploadedFile(null);
                    setSelectedDocument(value);
                    handleDocumentLoad(value);
                  }
                }}
                className="text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 px-2 sm:px-3 py-2 pr-8 sm:pr-10 bg-white shadow-sm font-medium max-w-[150px] sm:max-w-[200px] lg:max-w-[250px]"
              >
              {uploadedFile && (
                <option value="uploaded">{uploadedFile.name}</option>
              )}
              {sampleDocuments.map((doc) => {
                const docPath = `${getBasePath()}/${doc.id}`;
                return (
                  <option key={doc.id} value={docPath}>
                    {doc.id} - {doc.title}
                  </option>
                );
              })}
              </select>
            </div>
            
            {/* Upload button */}
            <div className="relative">
              <input
                type="file"
                accept=".docx,.pages"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleFileUpload(file);
                  }
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500 cursor-pointer whitespace-nowrap"
              >
                <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span className="hidden sm:inline">Upload</span>
              </label>
            </div>
            
            {/* GitHub link */}
            <div className="flex items-center">
              <a
                href="https://github.com/aaronshaf/PandaPage"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-gray-500 transition-colors"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>
        </div>
        </div>
      </div>

      {/* Secondary Ribbon Bar */}
      <div className="bg-gray-100 border-b border-gray-200">
        <div className="px-3 sm:px-6 lg:px-8 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto">
            {/* Outline toggle - start enabled, disable only when document has 1 or fewer headings */}
            {(() => {
              // Start optimistic (enabled) and only disable when we know there aren't enough headings
              const headingCount = result ? extractHeadings(removeFrontmatter(result)).length : -1; // -1 = loading
              const hasMultipleHeadings = headingCount === -1 || headingCount > 1; // Enabled during loading or when >1 heading
              
              return (
                <button
                  onClick={() => hasMultipleHeadings && setShowOutline(!showOutline)}
                  disabled={!hasMultipleHeadings}
                  className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 text-sm font-medium rounded transition-colors whitespace-nowrap ${
                    !hasMultipleHeadings
                      ? 'text-gray-400 cursor-not-allowed bg-gray-50'
                      : showOutline 
                        ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
                        : 'text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                  </svg>
                  <span className="hidden sm:inline">Outline</span>
                </button>
              );
            })()}
            
            {/* View mode buttons */}
            <div className="flex items-center bg-white rounded-md shadow-sm">
              <button
                onClick={() => setViewMode('read')}
                className={`px-2 sm:px-3 lg:px-4 py-1.5 text-sm font-medium rounded-l-md border whitespace-nowrap ${
                  viewMode === 'read' 
                    ? 'bg-blue-50 text-blue-700 border-blue-300' 
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-1 sm:gap-2">
                  <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <span className="hidden sm:inline">Read</span>
                </div>
              </button>
              <button
                onClick={() => setViewMode('print')}
                className={`px-2 sm:px-3 lg:px-4 py-1.5 text-sm font-medium rounded-r-md border-t border-r border-b whitespace-nowrap ${
                  viewMode === 'print' 
                    ? 'bg-blue-50 text-blue-700 border-blue-300' 
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-1 sm:gap-2">
                  <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="whitespace-nowrap">Print Layout</span>
                </div>
              </button>
            </div>
          </div>
          
          {/* Right side controls */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Stats */}
            {result && (
              <div className="text-xs text-gray-500 whitespace-nowrap font-sans">
                {wordCount.toLocaleString()} words{processingTime && ` · ${processingTime}ms`}
              </div>
            )}
            
            {/* Zoom controls for print view */}
            {viewMode === 'print' && (
              <div className="flex items-center gap-1 bg-white rounded-md shadow-sm border border-gray-200 px-2 py-1">
                <button
                  onClick={() => setPrintScale(Math.max(0.25, printScale - 0.1))}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded"
                  title="Zoom out"
                >
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                </button>
                <span className="text-xs text-gray-600 min-w-[3rem] text-center font-mono">
                  {Math.round(printScale * 100)}%
                </span>
                <button
                  onClick={() => setPrintScale(Math.min(2, printScale + 0.1))}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded"
                  title="Zoom in"
                >
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
            )}
            
            {/* Separator line */}
            <div className="w-px h-6 bg-gray-300 mx-2"></div>
            
            {/* Primary nav toggle button */}
            <button
              onClick={() => setShowPrimaryNav(!showPrimaryNav)}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded transition-colors"
              title={showPrimaryNav ? "Collapse header" : "Expand header"}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {showPrimaryNav ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                )}
              </svg>
            </button>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};