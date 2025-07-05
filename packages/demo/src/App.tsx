import { useState, useEffect, useCallback } from 'react';
import { marked } from 'marked';
import { renderDocxWithMetadata, renderPages } from '@pandapage/pandapage';
import {
  Navigation,
  DocumentUpload,
  Outline,
  DocumentViewer,
  LoadingSpinner,
  ErrorDisplay
} from './components';
import {
  getBasePath,
  removeFrontmatter,
  countWords,
  extractHeadings,
  splitIntoPages
} from './utils';

// Configure marked for better rendering
marked.setOptions({
  gfm: true, // GitHub Flavored Markdown
  headerIds: false, // Don't add IDs to headers
  mangle: false, // Don't mangle email addresses
});

// Sample documents data
const sampleDocuments = [
  { id: '001.docx', title: 'Service Agreement Template' },
  { id: '002.docx', title: 'Employee Handbook' },
  { id: '003.docx', title: 'Open Source Policy Template' },
  { id: '004.docx', title: 'Performance Review Template' },
  { id: '005.docx', title: 'Project Charter Template' },
  { id: '006.docx', title: 'Risk Assessment Framework' },
  { id: '007.docx', title: 'Budget Planning Guide' },
  { id: '008.docx', title: 'Meeting Minutes Template' },
  { id: '009.docx', title: 'Vendor Evaluation Criteria' },
  { id: '010.docx', title: 'Change Management Process' },
];

const App: React.FC = () => {
  // Document state
  const [selectedDocument, setSelectedDocument] = useState<string>('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingTime, setProcessingTime] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // UI state
  const [viewMode, setViewMode] = useState<'read' | 'print'>('read');
  const [showOutline, setShowOutline] = useState(false);
  const [showPrimaryNav, setShowPrimaryNav] = useState(true);
  const [printScale, setPrintScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [showSpinner, setShowSpinner] = useState(false);

  // Computed values
  const wordCount = result ? countWords(removeFrontmatter(result)) : 0;

  // Get initial document from URL hash or default
  const getInitialDocument = () => {
    const hash = window.location.hash.slice(1);
    if (hash && sampleDocuments.some(doc => doc.id === hash)) {
      return `${getBasePath()}/${hash}`;
    }
    return `${getBasePath()}/001.docx`;
  };

  // Calculate print scale
  const calculatePrintScale = () => {
    if (typeof window === 'undefined') return 1;
    
    const containerWidth = window.innerWidth - (showOutline ? 320 : 64);
    const pageWidth = 8.5 * 96; // 8.5 inches at 96 DPI
    const maxScale = Math.min(containerWidth / pageWidth, 1.2); // Max 120%
    return Math.max(0.4, maxScale * 0.9); // Use 90% of available width, min 40%
  };

  // Parse error message for better user display
  const parseErrorMessage = (error: any): string => {
    // Handle different error formats from Effect.js
    if (error && typeof error === 'object') {
      // Check for Effect errors with _tag
      if (error._tag === 'PagesParseError') {
        return 'Apple Pages support is currently in development. Please try a DOCX file instead.';
      }
      if (error._tag === 'DocxParseError') {
        return `Document parsing error: ${error.message || 'Unable to parse this DOCX file.'}`;
      }
      
      // Check for constructor names  
      if (error.constructor?.name === 'DocxParseError') {
        return `Document parsing error: ${error.message || 'Unable to parse this DOCX file.'}`;
      }
      if (error.constructor?.name === 'PagesParseError') {
        return 'Apple Pages support is currently in development. Please try a DOCX file instead.';
      }
      
      // Check error message content
      if (error.message) {
        const message = error.message;
        if (message.includes('Pages support is not yet implemented') || 
            message.includes('PagesParseError')) {
          return 'Apple Pages support is currently in development. Please try a DOCX file instead.';
        }
        if (message.includes('DocxParseError')) {
          return `Document parsing error: Unable to parse this DOCX file.`;
        }
        return message;
      }
      
      // Check for nested errors in Effect format
      if (error.error && error.error.message) {
        return parseErrorMessage(error.error);
      }
    }
    
    // Handle string errors
    if (typeof error === 'string') {
      if (error.includes('Pages support is not yet implemented') || 
          error.includes('PagesParseError')) {
        return 'Apple Pages support is currently in development. Please try a DOCX file instead.';
      }
      if (error.includes('DocxParseError')) {
        return 'Document parsing error: Unable to parse this DOCX file.';
      }
      return error;
    }
    
    return 'An unexpected error occurred while processing the document.';
  };

  // Load document
  const loadDocument = useCallback(async (path: string, file?: File) => {
    try {
      setLoading(true);
      setShowSpinner(true);
      setError(null);
      const startTime = performance.now();

      let arrayBuffer: ArrayBuffer;

      if (file) {
        arrayBuffer = await file.arrayBuffer();
      } else {
        const response = await fetch(path);
        if (!response.ok) {
          throw new Error(`Failed to fetch document: ${response.statusText}`);
        }
        arrayBuffer = await response.arrayBuffer();
      }

      let markdown: string;
      const fileName = file?.name || path;

      if (fileName.endsWith('.docx')) {
        markdown = await renderDocxWithMetadata(arrayBuffer);
      } else if (fileName.endsWith('.pages')) {
        markdown = await renderPages(arrayBuffer);
      } else {
        throw new Error('Unsupported file format. Please use .docx or .pages files.');
      }

      const endTime = performance.now();
      setProcessingTime(Math.round(endTime - startTime));
      setResult(markdown);
      setError(null);

      // Update URL hash for sample documents
      if (!file) {
        const docId = path.split('/').pop();
        if (docId && sampleDocuments.some(doc => doc.id === docId)) {
          window.history.replaceState(null, '', `#${docId}`);
        }
      }
    } catch (error) {
      console.error('Error loading document:', error);
      const errorMessage = parseErrorMessage(error);
      setError(errorMessage);
      setResult(null);
      setProcessingTime(null);
    } finally {
      setLoading(false);
      setTimeout(() => setShowSpinner(false), 300);
    }
  }, []);

  // Handle document selection
  const handleDocumentLoad = useCallback((path: string) => {
    setSelectedDocument(path);
    loadDocument(path);
  }, [loadDocument]);

  // Handle file upload
  const handleFileUpload = useCallback((file: File) => {
    setUploadedFile(file);
    setSelectedDocument('');
    loadDocument('', file);
  }, [loadDocument]);

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    const file = files.find(f => f.name.endsWith('.docx') || f.name.endsWith('.pages'));
    
    if (file) {
      handleFileUpload(file);
    }
  }, [handleFileUpload]);

  // Initialize with first document
  useEffect(() => {
    const initialDoc = getInitialDocument();
    setSelectedDocument(initialDoc);
    loadDocument(initialDoc);
  }, [loadDocument]);

  // Update print scale when view mode changes
  useEffect(() => {
    if (viewMode === 'print') {
      const newScale = calculatePrintScale();
      setPrintScale(newScale);
    }
  }, [viewMode, showOutline]);

  // Handle window resize for print scale
  useEffect(() => {
    if (viewMode !== 'print') return;

    const handleResize = () => {
      const newScale = calculatePrintScale();
      setPrintScale(newScale);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [viewMode, showOutline]);

  return (
    <div 
      className="min-h-screen bg-gray-50 flex flex-col"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <Navigation
        showPrimaryNav={showPrimaryNav}
        setShowPrimaryNav={setShowPrimaryNav}
        selectedDocument={selectedDocument}
        setSelectedDocument={setSelectedDocument}
        uploadedFile={uploadedFile}
        setUploadedFile={setUploadedFile}
        handleDocumentLoad={handleDocumentLoad}
        handleFileUpload={handleFileUpload}
        sampleDocuments={sampleDocuments}
        getBasePath={getBasePath}
        showOutline={showOutline}
        setShowOutline={setShowOutline}
        viewMode={viewMode}
        setViewMode={setViewMode}
        printScale={printScale}
        setPrintScale={setPrintScale}
        result={result}
        extractHeadings={extractHeadings}
        removeFrontmatter={removeFrontmatter}
        wordCount={wordCount}
        processingTime={processingTime}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        <Outline
          showOutline={showOutline}
          result={result}
          extractHeadings={extractHeadings}
          removeFrontmatter={removeFrontmatter}
          viewMode={viewMode}
          showPrimaryNav={showPrimaryNav}
        />
        
        {/* Document Content */}
        <div className="flex-1 overflow-auto bg-gray-50 relative">
          <DocumentUpload isDragging={isDragging} />
          
          {error ? (
            <div className="p-6">
              <ErrorDisplay 
                error={error} 
                onClear={() => setError(null)}
                onRetry={() => {
                  setError(null);
                  if (uploadedFile) {
                    handleFileUpload(uploadedFile);
                  } else {
                    handleDocumentLoad(selectedDocument);
                  }
                }}
              />
            </div>
          ) : result ? (
            <DocumentViewer
              result={result}
              loading={loading}
              showSpinner={showSpinner}
              viewMode={viewMode}
              printScale={printScale}
              removeFrontmatter={removeFrontmatter}
              splitIntoPages={splitIntoPages}
              countWords={countWords}
            />
          ) : loading && showSpinner ? (
            <LoadingSpinner result={result} />
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default App;