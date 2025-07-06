import { useState, useEffect, useRef } from 'react';
import type { ParsedDocument } from '@pandapage/pandapage';

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
  viewMode: 'read' | 'print';
  setViewMode: (mode: 'read' | 'print') => void;
  printScale: number;
  setPrintScale: (scale: number) => void;
  result: string | null;
  wordCount: number;
  documentTitle: string;
  parsedDocument: ParsedDocument | null;
  structuredDocument: any;
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
  viewMode,
  setViewMode,
  printScale,
  setPrintScale,
  result,
  wordCount,
  documentTitle,
  parsedDocument,
  structuredDocument
}) => {
  const [showMetadata, setShowMetadata] = useState(false);
  const [popoverPosition, setPopoverPosition] = useState({ top: 0, left: 0 });
  const popoverRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Get metadata from either parsed or structured document
  const getMetadata = () => {
    if (parsedDocument?.metadata) {
      return parsedDocument.metadata;
    }
    if (structuredDocument?.metadata) {
      return structuredDocument.metadata;
    }
    return null;
  };

  const metadata = getMetadata();

  // Calculate popover position
  const updatePopoverPosition = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPopoverPosition({
        top: rect.bottom + 4,
        left: rect.left
      });
    }
  };

  // Show metadata and calculate position
  const handleShowMetadata = () => {
    setShowMetadata(true);
    setTimeout(updatePopoverPosition, 0); // Wait for next tick
  };

  // Close popover on click outside or ESC key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setShowMetadata(false);
      }
    };

    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowMetadata(false);
      }
    };

    if (showMetadata) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscKey);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [showMetadata]);
  return (
    <header className="sticky top-0 z-40" data-testid="app-header">
      {/* Primary Header */}
      <div className={`bg-white shadow-sm border-b border-gray-200 overflow-hidden transition-all duration-300 ease-in-out ${
        showPrimaryNav ? 'max-h-24 opacity-100' : 'max-h-0 opacity-0'
      }`}
      data-testid="primary-nav-container"
      role="banner">
        <nav className="px-3 sm:px-6 lg:px-8 py-3 sm:py-4" aria-label="Primary navigation">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Document type icon */}
            {(selectedDocument.endsWith('.docx') || uploadedFile?.name.endsWith('.docx')) && (
              <div className="relative h-5 w-5 flex-shrink-0">
                <svg className="absolute inset-0" viewBox="0 0 24 24">
                  <path 
                    d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2Z" 
                    fill="white" 
                    stroke="#2563eb" 
                    strokeWidth="1.5"
                  />
                  <path 
                    d="M14,2V8H20" 
                    fill="white" 
                    stroke="#2563eb" 
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />
                </svg>
                <svg className="absolute inset-0" viewBox="0 0 24 24">
                  <path d="M17,11H7V13H17V11M17,14H7V16H17V14M17,17H7V19H17V17Z" fill="#2563eb" />
                </svg>
              </div>
            )}
            {(selectedDocument.endsWith('.pages') || uploadedFile?.name.endsWith('.pages')) && (
              <div className="relative h-5 w-5 flex-shrink-0">
                <svg className="absolute inset-0" viewBox="0 0 24 24">
                  <path 
                    d="M19,3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3Z" 
                    fill="white" 
                    stroke="#ea580c" 
                    strokeWidth="1.5"
                  />
                </svg>
                <svg className="absolute inset-0" viewBox="0 0 24 24">
                  <path d="M17,17H7V15H17V17M17,13H7V11H17V13M17,9H7V7H17V9Z" fill="#ea580c" />
                </svg>
              </div>
            )}
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-semibold text-gray-900" data-testid="app-title">{documentTitle}</h1>
              
              {/* Metadata info button */}
              {metadata && (
                <div className="relative">
                  <button
                    ref={buttonRef}
                    onClick={handleShowMetadata}
                    className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                    title="Document information"
                  >
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
                    </svg>
                  </button>
                  
                  {/* Metadata popover */}
                  {showMetadata && (
                    <div 
                      ref={popoverRef} 
                      className="fixed z-[100]"
                      style={{ 
                        top: `${popoverPosition.top}px`, 
                        left: `${popoverPosition.left}px` 
                      }}
                    >
                      <div className="bg-white rounded-lg shadow-2xl border border-gray-300 w-80 max-w-sm">
                        <div className="px-4 py-3 border-b border-gray-200">
                          <div className="flex justify-between items-center">
                            <h3 className="text-sm font-medium text-gray-900">Document details</h3>
                            <button
                              onClick={() => setShowMetadata(false)}
                              className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                            >
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        </div>
                        
                        <div className="px-4 py-3 max-h-96 overflow-y-auto">
                          <div className="space-y-4 text-sm">
                            {metadata.title && (
                              <div>
                                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Title</div>
                                <div className="text-gray-900">{metadata.title}</div>
                              </div>
                            )}
                            
                            {metadata.author && (
                              <div>
                                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Author</div>
                                <div className="text-gray-900">{metadata.author}</div>
                              </div>
                            )}
                            
                            {metadata.description && (
                              <div>
                                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Description</div>
                                <div className="text-gray-900">{metadata.description}</div>
                              </div>
                            )}
                            
                            {metadata.keywords && metadata.keywords.length > 0 && (
                              <div>
                                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Keywords</div>
                                <div className="text-gray-900">{metadata.keywords.join(', ')}</div>
                              </div>
                            )}
                            
                            {metadata.language && (
                              <div>
                                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Language</div>
                                <div className="text-gray-900">{metadata.language}</div>
                              </div>
                            )}
                            
                            {metadata.createdDate && (
                              <div>
                                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Created</div>
                                <div className="text-gray-900">{new Date(metadata.createdDate).toLocaleDateString('en-US', { 
                                  year: 'numeric', 
                                  month: 'long', 
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}</div>
                              </div>
                            )}
                            
                            {metadata.modifiedDate && (
                              <div>
                                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Modified</div>
                                <div className="text-gray-900">{new Date(metadata.modifiedDate).toLocaleDateString('en-US', { 
                                  year: 'numeric', 
                                  month: 'long', 
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}</div>
                              </div>
                            )}
                            
                            {!metadata.title && !metadata.author && !metadata.description && !metadata.keywords?.length && !metadata.language && !metadata.createdDate && !metadata.modifiedDate && (
                              <div className="text-gray-500 text-center py-4">
                                <svg className="h-8 w-8 mx-auto mb-2 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                No details available
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
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
      </nav>
    </div>

      {/* Secondary Ribbon Bar */}
      <nav className="bg-gray-100 border-b border-gray-200" data-testid="secondary-nav" aria-label="View controls">
        <div className="px-3 sm:px-6 lg:px-8 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto">
            {/* View mode buttons */}
            <div className="flex items-center bg-white rounded-md shadow-sm">
              <button
                onClick={() => setViewMode('print')}
                className={`px-2 sm:px-3 lg:px-4 py-1.5 text-sm font-medium rounded-l-md border whitespace-nowrap ${
                  viewMode === 'print' 
                    ? 'bg-blue-50 text-blue-700 border-blue-300' 
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-1 sm:gap-2">
                  <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="whitespace-nowrap">View</span>
                </div>
              </button>
              <button
                onClick={() => setViewMode('read')}
                className={`px-2 sm:px-3 lg:px-4 py-1.5 text-sm font-medium rounded-r-md border-t border-r border-b whitespace-nowrap ${
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
            </div>
          </div>
          
          {/* Right side controls */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Stats */}
            {result && (
              <div className="text-xs text-gray-500 whitespace-nowrap font-sans">
                {wordCount.toLocaleString()} words
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
      </nav>
    </header>
  );
};