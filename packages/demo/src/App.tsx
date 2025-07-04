import { useState, useEffect } from 'react';
import { renderPdf, renderPdfStream } from '@pandapage/pandapage';
import { Stream, Effect } from 'effect';

// Get base path for GitHub Pages deployment
const getBasePath = () => {
  return process.env.NODE_ENV === 'production' ? '/PandaPage' : '';
};

const App = () => {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [showSpinner, setShowSpinner] = useState(false);
  const [processingTime, setProcessingTime] = useState<number | null>(null);
  const [mode, setMode] = useState<'promise' | 'stream' | null>(null);
  const [selectedPdf, setSelectedPdf] = useState<string>(`${getBasePath()}/sample1.pdf`);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  // Show spinner only after 500ms delay
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (loading) {
      timer = setTimeout(() => {
        setShowSpinner(true);
      }, 500);
    } else {
      setShowSpinner(false);
    }
    return () => clearTimeout(timer);
  }, [loading]);

  const handlePromiseLoad = async () => {
    const startTime = performance.now();
    setLoading(true);
    // Don't clear result immediately - keep showing previous content
    setProcessingTime(null);
    setMode('promise');
    try {
      let pdfSource: string | Blob;
      if (uploadedFile) {
        pdfSource = uploadedFile;
      } else {
        pdfSource = selectedPdf;
      }
      const newResult = await renderPdf(pdfSource);
      setResult(newResult);  // Only update when new content is ready
      setProcessingTime(performance.now() - startTime);
    } catch (error) {
      setResult(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleStreamLoad = () => {
    const startTime = performance.now();
    setLoading(true);
    setResult('');
    setProcessingTime(null);
    setMode('stream');
    const chunks: string[] = [];
    
    let pdfSource: string | Blob;
    if (uploadedFile) {
      pdfSource = uploadedFile;
    } else {
      pdfSource = selectedPdf;
    }
    
    Effect.runPromise(
      renderPdfStream(pdfSource).pipe(
        Stream.runForEach((chunk) => Effect.sync(() => {
          chunks.push(chunk);
          setResult(chunks.join(''));
        }))
      )
    ).then(() => {
      setLoading(false);
      setProcessingTime(performance.now() - startTime);
    }).catch((error) => {
      setResult(`Error: ${error}`);
      setLoading(false);
    });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setUploadedFile(file);
      setResult('');
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-14 w-14 bg-white rounded-xl border border-gray-200 flex items-center justify-center shadow-sm">
                  <svg className="h-12 w-12" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* Panda ears */}
                    <circle cx="14" cy="12" r="6" fill="#2d3748"/>
                    <circle cx="34" cy="12" r="6" fill="#2d3748"/>
                    <circle cx="14" cy="12" r="3.5" fill="#f7fafc"/>
                    <circle cx="34" cy="12" r="3.5" fill="#f7fafc"/>
                    
                    {/* Main head */}
                    <circle cx="24" cy="26" r="14" fill="#f7fafc"/>
                    <circle cx="24" cy="26" r="13" fill="white"/>
                    
                    {/* Eye patches - softer and rounder */}
                    <ellipse cx="19" cy="23" rx="3.5" ry="4.5" fill="#2d3748" transform="rotate(-10 19 23)"/>
                    <ellipse cx="29" cy="23" rx="3.5" ry="4.5" fill="#2d3748" transform="rotate(10 29 23)"/>
                    
                    {/* Large friendly eyes */}
                    <circle cx="19" cy="22" r="2" fill="white"/>
                    <circle cx="29" cy="22" r="2" fill="white"/>
                    <circle cx="19.5" cy="21.5" r="1.2" fill="#2d3748"/>
                    <circle cx="28.5" cy="21.5" r="1.2" fill="#2d3748"/>
                    
                    {/* Eye shine for extra friendliness */}
                    <circle cx="19.8" cy="21" r="0.4" fill="white"/>
                    <circle cx="28.8" cy="21" r="0.4" fill="white"/>
                    
                    {/* Cute nose */}
                    <ellipse cx="24" cy="28" rx="2" ry="1.5" fill="#2d3748"/>
                    
                    {/* Happy smile */}
                    <path d="M18 32 Q24 36 30 32" stroke="#2d3748" strokeWidth="2" strokeLinecap="round" fill="none"/>
                    
                    {/* Cute cheek blush */}
                    <circle cx="13" cy="28" r="2" fill="#fed7d7" opacity="0.6"/>
                    <circle cx="35" cy="28" r="2" fill="#fed7d7" opacity="0.6"/>
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <h1 className="text-xl font-semibold text-gray-900">PandaPage</h1>
                <p className="text-sm text-gray-500">Document Text Extraction Demo</p>
              </div>
            </div>
            <a
              href="https://github.com/aaronshaf/pandapage"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-gray-500 transition-colors"
            >
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Controls */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-8">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Document Source</h2>
              
              {/* File Upload */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Document
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-gray-400 transition-colors">
                  <div className="space-y-1 text-center">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                      aria-hidden="true"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                      >
                        <span>Upload a file</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          accept=".pdf"
                          className="sr-only"
                          onChange={handleFileUpload}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">PDF, DOCX, or Pages up to 10MB</p>
                  </div>
                </div>
                {uploadedFile && (
                  <div className="mt-3 flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                    <div className="flex items-center">
                      <svg className="h-5 w-5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="text-sm text-gray-700 truncate">{uploadedFile.name}</span>
                    </div>
                    <button
                      onClick={() => setUploadedFile(null)}
                      className="text-sm text-red-600 hover:text-red-800 ml-2"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              {/* Sample PDFs */}
              <div className="mb-6">
                <label htmlFor="sample-pdf" className="block text-sm font-medium text-gray-700 mb-2">
                  Or select a sample
                </label>
                <div className="relative">
                  <select
                    id="sample-pdf"
                    value={selectedPdf}
                    onChange={(e) => setSelectedPdf(e.target.value)}
                    disabled={!!uploadedFile}
                    className="block appearance-none w-full bg-white border border-gray-300 hover:border-gray-400 px-4 py-3 pr-8 rounded-lg shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-50 disabled:text-gray-500 disabled:border-gray-200 transition-colors"
                  >
                    <option value={`${getBasePath()}/sample1.pdf`}>Sample 1 - Dummy PDF file</option>
                    <option value={`${getBasePath()}/sample2.pdf`}>Sample 2 - Hello World</option>
                    <option value={`${getBasePath()}/sample3.pdf`}>Sample 3 - Multi-page Lorem Ipsum</option>
                    <option value={`${getBasePath()}/guide-footnotes.pdf`}>Guide - Footnotes</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handlePromiseLoad}
                  disabled={loading}
                  className="w-full flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Load via Promise
                </button>
                
                <button
                  onClick={handleStreamLoad}
                  disabled={loading}
                  className="w-full flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Load via Stream
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Results */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {mode ? (
                <>
                  <div className={`px-6 py-4 border-b ${mode === 'stream' ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {mode === 'stream' ? (
                          <svg className="h-5 w-5 text-green-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        ) : (
                          <svg className="h-5 w-5 text-indigo-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        )}
                        <h3 className={`text-lg font-medium ${mode === 'stream' ? 'text-green-900' : 'text-gray-900'}`}>
                          {mode === 'stream' ? 'Stream-based Result' : 'Promise-based Result'}
                        </h3>
                      </div>
                      {result && (
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-gray-500">
                            {result.length} characters
                          </span>
                          {processingTime && (
                            <span className="text-sm text-gray-500">
                              {processingTime.toFixed(0)}ms
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="p-6">
                    {result && (
                      <div className="relative">
                        <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono bg-gray-50 rounded-lg p-4 overflow-auto max-h-[600px]">
                          {result}
                        </pre>
                      </div>
                    )}
                    {!result && showSpinner && (
                      <div className="text-center py-12">
                        <div className="flex flex-col items-center">
                          <svg className="animate-spin h-8 w-8 text-gray-400 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <p className="text-gray-500">Processing document...</p>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="p-12 text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No document loaded</h3>
                  <p className="text-gray-500">Select a document source and click one of the load buttons to extract text</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;