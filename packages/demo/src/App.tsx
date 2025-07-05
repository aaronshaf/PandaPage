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

// Parse URL hash for document and view mode (moved outside component)
const parseUrlHash = () => {
  if (typeof window === 'undefined') return { docId: '', mode: 'read' as const };
  
  const hash = window.location.hash.slice(1); // Remove #
  const parts = hash.split('&');
  
  let docId = '';
  let mode: 'read' | 'print' = 'read';
  
  for (const part of parts) {
    if (part.includes('=')) {
      const [key, value] = part.split('=');
      if (key === 'view' && (value === 'read' || value === 'print')) {
        mode = value;
      }
    } else if (part.endsWith('.docx') || part.endsWith('.pages')) {
      docId = part;
    }
  }
  
  return { docId, mode };
};

const App: React.FC = () => {
  // Document state
  const [selectedDocument, setSelectedDocument] = useState<string>('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingTime, setProcessingTime] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // UI state
  const [viewMode, setViewMode] = useState<'read' | 'print'>(() => parseUrlHash().mode);
  const [showOutline, setShowOutline] = useState(false);
  const [showPrimaryNav, setShowPrimaryNav] = useState(true);
  const [printScale, setPrintScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [showSpinner, setShowSpinner] = useState(false);

  // Computed values
  const wordCount = result ? countWords(removeFrontmatter(result)) : 0;

  // Extract document title from metadata, first heading, or filename
  const getDocumentTitle = () => {
    if (!result) return 'pandapage';
    
    // Try to extract from frontmatter metadata
    const frontmatterMatch = result.match(/^---\n([\s\S]*?)\n---/);
    if (frontmatterMatch) {
      const frontmatter = frontmatterMatch[1];
      const titleMatch = frontmatter.match(/title:\s*["']?(.+?)["']?$/m);
      if (titleMatch) {
        return titleMatch[1].trim();
      }
    }
    
    // Try to get first heading
    const headings = extractHeadings(removeFrontmatter(result));
    if (headings.length > 0) {
      return headings[0].text;
    }
    
    // Try to infer from first line of content
    const content = removeFrontmatter(result).trim();
    if (content) {
      // Get first non-empty line
      const firstLine = content.split('\n').find(line => line.trim().length > 0);
      if (firstLine) {
        // Remove markdown formatting
        let cleanLine = firstLine
          .replace(/^#+\s*/, '') // Remove heading markers
          .replace(/^\*+\s*/, '') // Remove bullet points
          .replace(/^\d+\.\s*/, '') // Remove numbered lists
          .replace(/^[-+]\s*/, '') // Remove list markers
          .replace(/\*\*/g, '') // Remove bold
          .replace(/\*/g, '') // Remove italic
          .replace(/`/g, '') // Remove code
          .trim();
        
        // Limit to reasonable title length (max 10 words or 60 chars)
        const words = cleanLine.split(/\s+/);
        if (words.length > 10) {
          cleanLine = words.slice(0, 10).join(' ') + '...';
        } else if (cleanLine.length > 60) {
          cleanLine = cleanLine.substring(0, 57) + '...';
        }
        
        return cleanLine;
      }
    }
    
    // Fall back to filename
    if (uploadedFile) {
      return uploadedFile.name.replace(/\.(docx|pages)$/i, '');
    }
    
    const docId = selectedDocument.split('/').pop()?.replace(/\.(docx|pages)$/i, '');
    const sampleDoc = sampleDocuments.find(doc => doc.id === docId?.split('.')[0]);
    return sampleDoc ? sampleDoc.title : docId || 'pandapage';
  };

  // Get initial document from URL hash or default
  const getInitialDocument = () => {
    const { docId } = parseUrlHash();
    if (docId && sampleDocuments.some(doc => doc.id === docId)) {
      return `${getBasePath()}/${docId}`;
    }
    return `${getBasePath()}/001.docx`;
  };

  // Update URL hash with current document and view mode
  const updateUrlHash = (docId?: string, mode?: 'read' | 'print') => {
    const currentDocId = docId || (selectedDocument ? selectedDocument.split('/').pop() : '001.docx');
    const currentMode = mode || viewMode;
    
    // Only add view mode to URL if it's not the default 'read'
    const hashParts = [currentDocId];
    if (currentMode === 'print') {
      hashParts.push(`view=${currentMode}`);
    }
    
    const newHash = hashParts.join('&');
    window.history.replaceState(null, '', `#${newHash}`);
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
          updateUrlHash(docId);
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

  // Handle view mode change with URL update
  const handleViewModeChange = useCallback((newMode: 'read' | 'print') => {
    setViewMode(newMode);
    updateUrlHash(undefined, newMode);
  }, [selectedDocument, viewMode]);

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

  // Prevent body scrolling
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  // Listen for URL hash changes to update view mode
  useEffect(() => {
    const handleHashChange = () => {
      const { docId, mode } = parseUrlHash();
      
      // Update view mode if it changed
      if (mode !== viewMode) {
        setViewMode(mode);
      }
      
      // Update document if it changed
      if (docId && sampleDocuments.some(doc => doc.id === docId)) {
        const newPath = `${getBasePath()}/${docId}`;
        if (newPath !== selectedDocument) {
          setSelectedDocument(newPath);
          loadDocument(newPath);
        }
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [viewMode, selectedDocument, loadDocument]);

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
      className="h-screen bg-gray-50 flex flex-col"
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
        viewMode={viewMode}
        setViewMode={handleViewModeChange}
        printScale={printScale}
        setPrintScale={setPrintScale}
        result={result}
        wordCount={wordCount}
        processingTime={processingTime}
        documentTitle={getDocumentTitle()}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        <Outline
          showOutline={showOutline}
          setShowOutline={setShowOutline}
          result={result}
          extractHeadings={extractHeadings}
          removeFrontmatter={removeFrontmatter}
          viewMode={viewMode}
          showPrimaryNav={showPrimaryNav}
        />
        
        {/* Document Content */}
        <main className="flex-1 overflow-auto bg-gray-50 relative document-scroll-container">
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
              showPrimaryNav={showPrimaryNav}
              removeFrontmatter={removeFrontmatter}
              splitIntoPages={splitIntoPages}
              countWords={countWords}
              showOutline={showOutline}
              setShowOutline={setShowOutline}
              extractHeadings={extractHeadings}
            />
          ) : loading && showSpinner ? (
            <LoadingSpinner result={result} />
          ) : null}
        </main>
      </div>
    </div>
  );
};

export default App;