import { useState, useEffect, useCallback } from 'react';
import { marked } from 'marked';
import { renderDocxWithMetadata, renderPages } from '@pandapage/pandapage';

// Configure marked for better rendering
marked.setOptions({
  gfm: true, // GitHub Flavored Markdown
  headerIds: false, // Don't add IDs to headers
  mangle: false, // Don't mangle email addresses
});

// Get base path for GitHub Pages deployment
const getBasePath = () => {
  return process.env.NODE_ENV === 'production' ? '/PandaPage' : '';
};

// Remove YAML frontmatter from markdown for rendering
const removeFrontmatter = (markdown: string): string => {
  // Check if markdown starts with frontmatter (---)
  if (markdown.startsWith('---\n')) {
    const endIndex = markdown.indexOf('\n---\n', 4);
    if (endIndex !== -1) {
      // Return content after the closing ---
      return markdown.substring(endIndex + 5).trim();
    }
  }
  return markdown;
};

// Count words in text
const countWords = (text: string): number => {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
};

// Extract headings from markdown for outline view
const extractHeadings = (markdown: string): Array<{level: number, text: string, id: string}> => {
  const lines = markdown.split('\n');
  const headings: Array<{level: number, text: string, id: string}> = [];
  
  for (const line of lines) {
    const match = line.match(/^(#{1,6})\s+(.+)$/);
    if (match) {
      const level = match[1].length;
      const text = match[2].trim();
      const id = text.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
      headings.push({ level, text, id });
    }
  }
  
  return headings;
};

// Split HTML content into pages for print view with better logic
const splitIntoPages = (html: string): string[] => {
  // Create a temporary DOM to work with the HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  
  const pages: string[] = [];
  let currentPageElements: Element[] = [];
  let currentPageHeight = 0;
  
  // Rough estimates based on 8.5x11" page with 1" margins (6.5x9" content area)
  // At 12pt font, approximately 54 lines per page
  const maxPageHeight = 54;
  
  const getElementHeight = (element: Element): number => {
    const tagName = element.tagName;
    const textContent = element.textContent || '';
    const textLines = Math.ceil(textContent.length / 80) || 1; // ~80 chars per line
    
    switch (tagName) {
      case 'H1': return Math.max(3, textLines + 1); // Heading + space
      case 'H2': return Math.max(2.5, textLines + 0.5);
      case 'H3': 
      case 'H4': 
      case 'H5': 
      case 'H6': return Math.max(2, textLines + 0.5);
      case 'P': return Math.max(1.5, textLines);
      case 'UL':
      case 'OL': return element.children.length * 1.2 + 0.5; // Space for list
      case 'LI': return Math.max(1, textLines);
      case 'TABLE': {
        const rows = element.querySelectorAll('tr').length;
        return rows * 1.5 + 1; // Table spacing
      }
      case 'TR': return 1.5;
      case 'BLOCKQUOTE': return Math.max(2, textLines + 1);
      case 'PRE': return textContent.split('\n').length + 1;
      case 'HR': return 1;
      case 'DIV': return textLines > 0 ? Math.max(1, textLines) : 0;
      default: return textLines > 0 ? Math.max(0.5, textLines) : 0;
    }
  };
  
  const shouldPageBreakBefore = (element: Element, currentHeight: number): boolean => {
    const tagName = element.tagName;
    
    // Always break before H1 if not at start of page
    if (tagName === 'H1' && currentHeight > 2) {
      return true;
    }
    
    // Break before H2 if we're more than 75% down the page
    if (tagName === 'H2' && currentHeight > maxPageHeight * 0.75) {
      return true;
    }
    
    // Avoid breaking tables and lists near page end
    if ((tagName === 'TABLE' || tagName === 'UL' || tagName === 'OL') && 
        currentHeight > maxPageHeight * 0.8) {
      return true;
    }
    
    return false;
  };
  
  const flushCurrentPage = () => {
    if (currentPageElements.length > 0) {
      const pageContent = currentPageElements.map(el => el.outerHTML).join('');
      pages.push(pageContent);
      currentPageElements = [];
      currentPageHeight = 0;
    }
  };
  
  // Process all top-level elements
  Array.from(tempDiv.children).forEach((element) => {
    const elementHeight = getElementHeight(element);
    
    // Check if we need a page break
    if (shouldPageBreakBefore(element, currentPageHeight) ||
        (currentPageHeight + elementHeight > maxPageHeight && currentPageElements.length > 0)) {
      flushCurrentPage();
    }
    
    // If single element is larger than a page, split it
    if (elementHeight > maxPageHeight && element.tagName === 'P') {
      // Split long paragraphs
      const text = element.textContent || '';
      const words = text.split(' ');
      const wordsPerPage = Math.floor(maxPageHeight * 80 / 10); // Rough estimate
      
      for (let i = 0; i < words.length; i += wordsPerPage) {
        const chunk = words.slice(i, i + wordsPerPage).join(' ');
        const p = document.createElement('p');
        p.textContent = chunk;
        // Copy attributes
        Array.from(element.attributes).forEach(attr => {
          p.setAttribute(attr.name, attr.value);
        });
        
        if (currentPageHeight + 2 > maxPageHeight && currentPageElements.length > 0) {
          flushCurrentPage();
        }
        
        currentPageElements.push(p);
        currentPageHeight += 2;
      }
    } else {
      currentPageElements.push(element);
      currentPageHeight += elementHeight;
    }
  });
  
  // Flush any remaining content
  flushCurrentPage();
  
  return pages.length > 0 ? pages : [html];
};

// Document samples data
const sampleDocuments = [
  { id: '001.docx', title: 'Basic formatting', description: 'Headings, text styles, and simple lists', format: 'DOCX' },
  { id: '001.pages', title: 'Basic formatting', description: 'Headings, text styles, and simple lists', format: 'Pages' },
  { id: '002.docx', title: 'Find and replace', description: 'Template with placeholder content', format: 'DOCX' },
  { id: '002.pages', title: 'Find and replace', description: 'Template with placeholder content', format: 'Pages' },
  { id: '003.docx', title: 'Open source policy', description: 'Multi-level numbered lists', format: 'DOCX' },
  { id: '003.pages', title: 'Open source policy', description: 'Multi-level numbered lists', format: 'Pages' },
  { id: '004.docx', title: 'Collaboration guide', description: 'Complex tables and TOC', format: 'DOCX' },
  { id: '004.pages', title: 'Collaboration guide', description: 'Complex tables and TOC', format: 'Pages' },
  { id: '005.docx', title: 'DOCX demo', description: 'Tables, images, and footnotes', format: 'DOCX' },
  { id: '005.pages', title: 'DOCX demo', description: 'Tables, images, and footnotes', format: 'Pages' },
  { id: '006.docx', title: 'Academic paper', description: 'Professional formatting', format: 'DOCX' },
  { id: '006.pages', title: 'Academic paper', description: 'Professional formatting', format: 'Pages' },
  { id: '007.docx', title: 'Additional tests', description: 'Edge cases and variants', format: 'DOCX' },
  { id: '007.pages', title: 'Additional tests', description: 'Edge cases and variants', format: 'Pages' },
];

const App = () => {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(true); // Start with loading true since we always load a document
  const [showSpinner, setShowSpinner] = useState(false);
  const [processingTime, setProcessingTime] = useState<number | null>(null);
  // Get initial document from URL hash or default
  const getInitialDocument = () => {
    const hash = window.location.hash.slice(1); // Remove #
    if (hash && sampleDocuments.some(doc => doc.id === hash)) {
      return `${getBasePath()}/${hash}`;
    }
    return `${getBasePath()}/001.docx`;
  };
  
  const [selectedDocument, setSelectedDocument] = useState<string>(getInitialDocument());
  const [printScale, setPrintScale] = useState(1);
  const [showOutline, setShowOutline] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [viewMode, setViewMode] = useState<'read' | 'print'>('read');
  const [isDragging, setIsDragging] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [showPageIndicator, setShowPageIndicator] = useState(false);
  const [showPrimaryNav, setShowPrimaryNav] = useState(true);

  // Calculate print scale to show full page
  const calculatePrintScale = useCallback(() => {
    if (typeof window === 'undefined') return 1;
    
    const containerWidth = window.innerWidth - 64; // Just padding now, no sidebar
    const containerHeight = window.innerHeight - 150; // Account for header and padding
    
    const pageWidth = 8.5 * 96; // 8.5 inches at 96 DPI
    const pageHeight = 11 * 96; // 11 inches at 96 DPI
    
    // Calculate scale needed for width and height
    const widthScale = containerWidth / pageWidth;
    const heightScale = containerHeight / pageHeight;
    
    // Use width scale primarily, but cap it at a reasonable max
    // This gives a better default zoom that uses more screen space
    const targetScale = Math.min(1.2, widthScale * 0.9); // 90% of width, max 120%
    
    // But ensure we don't cut off the page vertically
    return Math.min(targetScale, heightScale);
  }, []);

  // Update print scale on window resize
  useEffect(() => {
    const handleResize = () => {
      setPrintScale(calculatePrintScale());
    };
    
    handleResize(); // Initial calculation
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [calculatePrintScale]);

  // Recalculate scale when switching to print view
  useEffect(() => {
    if (viewMode === 'print') {
      setPrintScale(calculatePrintScale());
    }
  }, [viewMode, calculatePrintScale]);

  // Handle pinch-to-zoom for print layout
  useEffect(() => {
    if (viewMode !== 'print' || !result) return;

    const handleWheel = (e: WheelEvent) => {
      // Check if this is a pinch gesture (ctrlKey is set for pinch on trackpads)
      if (e.ctrlKey) {
        e.preventDefault();
        
        // Calculate zoom based on wheel delta
        const scaleDelta = e.deltaY > 0 ? -0.05 : 0.05;
        setPrintScale((prevScale) => {
          const newScale = prevScale + scaleDelta;
          // Clamp between 0.5 and 2
          return Math.max(0.5, Math.min(2, newScale));
        });
      }
    };

    // Add event listener to the print view container
    const printContainer = document.querySelector('.print-view');
    if (printContainer) {
      printContainer.addEventListener('wheel', handleWheel, { passive: false });
      return () => {
        printContainer.removeEventListener('wheel', handleWheel);
      };
    }
  }, [viewMode, result]);
  
  // Track current page on scroll in print view
  useEffect(() => {
    if (viewMode !== 'print' || !result) return;
    
    let scrollTimer: NodeJS.Timeout;
    let hideTimer: NodeJS.Timeout;
    
    const handleScroll = () => {
      // Show page indicator
      setShowPageIndicator(true);
      
      // Clear existing timers
      clearTimeout(scrollTimer);
      clearTimeout(hideTimer);
      
      // Debounce page calculation
      scrollTimer = setTimeout(() => {
        const printView = document.querySelector('.print-view');
        if (!printView) return;
        
        const pages = printView.querySelectorAll('.print-page');
        const viewportMiddle = window.innerHeight / 2;
        
        // Find which page is in the middle of viewport
        for (let i = 0; i < pages.length; i++) {
          const page = pages[i] as HTMLElement;
          const rect = page.getBoundingClientRect();
          
          if (rect.top <= viewportMiddle && rect.bottom >= viewportMiddle) {
            setCurrentPage(i + 1);
            break;
          }
        }
      }, 50);
      
      // Hide indicator after 2 seconds
      hideTimer = setTimeout(() => {
        setShowPageIndicator(false);
      }, 2000);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimer);
      clearTimeout(hideTimer);
    };
  }, [viewMode, result]);

  // Show spinner - immediately on first load, with delay on subsequent loads
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (loading) {
      if (!result) {
        // First load - show spinner after 2s delay
        timer = setTimeout(() => {
          setShowSpinner(true);
        }, 2000);
      } else {
        // Subsequent loads - delay to prevent flickering
        timer = setTimeout(() => {
          setShowSpinner(true);
        }, 2000);
      }
    } else {
      setShowSpinner(false);
    }
    return () => clearTimeout(timer);
  }, [loading, result]);

  // Load default document on initial render
  useEffect(() => {
    if (!uploadedFile) {
      handleDocumentLoad();
    }
  }, []);
  
  // Update URL hash when document changes
  useEffect(() => {
    if (!uploadedFile && selectedDocument) {
      const docId = selectedDocument.split('/').pop();
      if (docId) {
        window.location.hash = docId;
      }
    }
  }, [selectedDocument, uploadedFile]);
  
  // Listen for hash changes (browser back/forward)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      if (hash && sampleDocuments.some(doc => doc.id === hash)) {
        const newPath = `${getBasePath()}/${hash}`;
        if (newPath !== selectedDocument) {
          setSelectedDocument(newPath);
          setUploadedFile(null);
          handleDocumentLoad(newPath);
        }
      }
    };
    
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [selectedDocument]);

  const handleDocumentLoad = async (docPath?: string) => {
    const startTime = performance.now();
    setLoading(true);
    // Don't reset processingTime to avoid flicker
    try {
      let documentSource: string | File;
      if (uploadedFile) {
        documentSource = uploadedFile;
      } else {
        documentSource = docPath || selectedDocument;
      }
      
      let arrayBuffer: ArrayBuffer;
      if (typeof documentSource === 'string') {
        // Fetch from URL
        const response = await fetch(documentSource);
        arrayBuffer = await response.arrayBuffer();
      } else {
        // Read from File
        arrayBuffer = await documentSource.arrayBuffer();
      }
      
      // Determine file type and use appropriate renderer
      let markdown: string;
      const fileName = typeof documentSource === 'string' ? documentSource : documentSource.name;
      
      if (fileName.endsWith('.docx')) {
        markdown = await renderDocxWithMetadata(arrayBuffer);
      } else if (fileName.endsWith('.pages')) {
        markdown = await renderPages(arrayBuffer);
      } else {
        throw new Error('Unsupported file format. Please use .docx or .pages files.');
      }
      
      setResult(markdown);  // Only update when new content is ready
      setProcessingTime(performance.now() - startTime);
      
      // Scroll to top of the results container only if not already near the top
      setTimeout(() => {
        const currentScrollY = window.scrollY || document.documentElement.scrollTop;
        if (currentScrollY > 100) {
          const resultsContainer = document.querySelector('.rendered-markdown, pre');
          if (resultsContainer) {
            resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
      }, 100);
    } catch (error) {
      setResult(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && (
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
      file.name.endsWith('.docx') || 
      file.name.endsWith('.pages')
    )) {
      setUploadedFile(file);
      setResult('');
    }
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    const docFile = files.find(file => 
      file.name.endsWith('.docx') || file.name.endsWith('.pages')
    );
    
    if (docFile) {
      setUploadedFile(docFile);
      setResult('');
      // Delay to ensure state is updated
      setTimeout(() => handleDocumentLoad(), 100);
    }
  };
  
  return (
    <div 
      className="min-h-screen bg-gray-50 flex flex-col"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Sticky Navigation Container */}
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
              
              {/* Mobile document select */}
              <select
                className="sm:hidden text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 px-2 py-1.5 bg-white shadow-sm font-medium max-w-[120px]"
                value={uploadedFile ? 'uploaded' : selectedDocument}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value !== 'uploaded') {
                    setUploadedFile(null);
                    setSelectedDocument(value);
                    handleDocumentLoad(value);
                  }
                }}
              >
                {uploadedFile && (
                  <option value="uploaded">{uploadedFile.name.substring(0, 15)}...</option>
                )}
                {sampleDocuments.map((doc) => {
                  const docPath = `${getBasePath()}/${doc.id}`;
                  return (
                    <option key={doc.id} value={docPath}>
                      {doc.id}
                    </option>
                  );
                })}
              </select>
              
              {/* Upload button */}
              <label className="relative cursor-pointer flex-shrink-0">
                <input
                  type="file"
                  accept=".docx,.pages"
                  onChange={handleFileUpload}
                  className="sr-only"
                />
                <span className="inline-flex items-center px-2 sm:px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                  <svg className="h-4 w-4 sm:mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <span className="hidden sm:inline">Upload</span>
                </span>
              </label>
              
              <a
                href="https://github.com/aaronshaf/pandapage"
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
        )}

        {/* Secondary Ribbon Bar */}
        <div className="bg-gray-100 border-b border-gray-200">
          <div className="px-3 sm:px-6 lg:px-8 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto">
              {/* Outline toggle - only show if document has more than 1 heading */}
              {result && extractHeadings(removeFrontmatter(result)).length > 1 && (
                <button
                  onClick={() => setShowOutline(!showOutline)}
                  className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 text-sm font-medium rounded transition-colors whitespace-nowrap ${
                    showOutline 
                      ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
                      : 'text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                  </svg>
                  <span className="hidden sm:inline">Outline</span>
                </button>
              )}
              
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
            <div className="flex items-center gap-3">
              {/* Document info */}
              <div className="hidden lg:flex items-center gap-3">
                {!loading && result && (
                  <span className="whitespace-nowrap text-xs text-gray-500 font-sans">{countWords(result)} words</span>
                )}
              </div>
              
              {/* Zoom controls - show for print layout */}
              {viewMode === 'print' && result && (
                <div className="flex items-center bg-white rounded-md shadow-sm border border-gray-200">
                  <button
                    onClick={() => setPrintScale(Math.max(0.5, printScale - 0.1))}
                    className="px-2 py-1 text-gray-600 hover:bg-gray-50 rounded-l-md border-r border-gray-200 transition-colors"
                    title="Zoom out"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  </button>
                  <span className="px-3 text-sm text-gray-700 font-medium min-w-[4rem] text-center">
                    {Math.round(printScale * 100)}%
                  </span>
                  <button
                    onClick={() => setPrintScale(Math.min(2, printScale + 0.1))}
                    className="px-2 py-1 text-gray-600 hover:bg-gray-50 rounded-r-md border-l border-gray-200 transition-colors"
                    title="Zoom in"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>
              )}
              
              {/* Separator line */}
              <div className="w-px h-6 bg-gray-300"></div>
              
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

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Collapsible Outline Sidebar - only show if there are headings */}
        {showOutline && result && extractHeadings(removeFrontmatter(result)).length > 1 && (
          <div className="w-64 bg-white border-r border-gray-200 overflow-y-auto sticky top-0 h-[calc(100vh-var(--nav-height))]" style={{ 
            '--nav-height': showPrimaryNav ? '7rem' : '3rem'
          } as React.CSSProperties}>
            <div className="p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Document Outline</h3>
              {extractHeadings(removeFrontmatter(result)).length === 0 ? (
                <p className="text-sm text-gray-500 italic">No headings found</p>
              ) : (
                <div className="space-y-1">
                  {extractHeadings(removeFrontmatter(result)).map((heading, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        // Navigate to heading in current view
                        if (viewMode === 'print') {
                          // Find the heading in print view
                          const printContent = document.querySelector('.print-content');
                          if (printContent) {
                            const headings = printContent.querySelectorAll(`h${heading.level}`);
                            for (const h of headings) {
                              if (h.textContent?.includes(heading.text)) {
                                // Calculate offset for sticky nav bars
                                const navHeight = showPrimaryNav ? 112 : 56; // Approximate heights
                                const elementPosition = h.getBoundingClientRect().top + window.pageYOffset;
                                const offsetPosition = elementPosition - navHeight - 20; // Extra padding
                                
                                window.scrollTo({
                                  top: offsetPosition,
                                  behavior: 'smooth'
                                });
                                break;
                              }
                            }
                          }
                        } else {
                          // Find the heading in read view
                          const markdownContent = document.querySelector('.rendered-markdown');
                          if (markdownContent) {
                            const headings = markdownContent.querySelectorAll(`h${heading.level}`);
                            for (const h of headings) {
                              if (h.textContent?.includes(heading.text)) {
                                // Calculate offset for sticky nav bars
                                const navHeight = showPrimaryNav ? 112 : 56; // Approximate heights
                                const elementPosition = h.getBoundingClientRect().top + window.pageYOffset;
                                const offsetPosition = elementPosition - navHeight - 20; // Extra padding
                                
                                window.scrollTo({
                                  top: offsetPosition,
                                  behavior: 'smooth'
                                });
                                break;
                              }
                            }
                          }
                        }
                      }}
                      className="w-full text-left text-sm hover:bg-gray-100 rounded px-2 py-1 transition-colors"
                      style={{ paddingLeft: `${(heading.level - 1) * 12 + 8}px` }}
                    >
                      <span className={`${
                        heading.level === 1 ? 'font-semibold text-gray-900' :
                        heading.level === 2 ? 'font-medium text-gray-800' :
                        'text-gray-700'
                      }`}>
                        {heading.text}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Document Content */}
        <div className="flex-1 overflow-auto bg-gray-50 relative">
          {/* Drag and drop overlay */}
          {isDragging && (
            <div className="absolute inset-0 bg-blue-50 bg-opacity-90 flex items-center justify-center z-50 border-4 border-dashed border-blue-400">
              <div className="text-center">
                <svg className="mx-auto h-12 w-12 text-blue-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-lg font-medium text-blue-900">Drop your DOCX or Pages file here</p>
                <p className="text-sm text-blue-700 mt-1">We'll convert it to Markdown instantly</p>
              </div>
            </div>
          )}
          {result ? (
            <div className={viewMode === 'print' ? '' : 'p-6'}>
              {viewMode === 'read' ? (
                <div className="max-w-4xl mx-auto">
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div 
                      className="rendered-markdown prose prose-gray prose-lg max-w-none"
                      dangerouslySetInnerHTML={{ __html: marked(removeFrontmatter(result)) }}
                    />
                  </div>
                </div>
              ) : (
                // Print view
                <div className="print-view relative">
                  {/* Page Indicator */}
                  {showPageIndicator && totalPages > 0 && (
                    <div className="fixed top-1/2 right-8 transform -translate-y-1/2 bg-gray-800 text-white px-3 py-2 rounded-lg shadow-lg transition-opacity duration-300 z-30">
                      <div className="text-sm font-medium">
                        Page {currentPage} of {totalPages}
                      </div>
                    </div>
                  )}
                  
                  <div className="print-page-container" style={{
                    transform: `scale(${printScale})`,
                    transformOrigin: 'top center',
                    marginBottom: `${(1 - printScale) * 11 * 96}px` // Adjust margin for scaled height
                  }}>
                    {(() => {
                      const htmlContent = marked(removeFrontmatter(result));
                      const pages = splitIntoPages(htmlContent);
                      
                      // Update total pages when pages change
                      if (pages.length !== totalPages) {
                        setTimeout(() => setTotalPages(pages.length), 0);
                      }
                      
                      return pages.map((pageContent, index) => (
                        <div key={index} className="print-page" data-page={index + 1}>
                          <div 
                            className="print-content"
                            dangerouslySetInnerHTML={{ __html: pageContent }}
                          />
                          {/* Page number - only show in screen view */}
                          <div className="absolute bottom-6 right-6 text-xs text-gray-400 print:hidden">
                            Page {index + 1} of {pages.length}
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              )}
            </div>
          ) : loading && showSpinner ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <svg className="animate-spin h-8 w-8 text-gray-400 mb-4 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="text-gray-500">{result ? 'Converting document to Markdown...' : 'Loading document...'}</p>
              </div>
            </div>
          ) : (
            // Show nothing instead of "No document loaded" since we always have a default document
            null
          )}
        </div>
      </div>
    </div>
  );
};

export default App;