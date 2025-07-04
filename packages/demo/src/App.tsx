import { useState } from 'react';
import { renderPdf, renderPdfStream } from '@pandapage/pandapage';
import { Stream, Effect } from 'effect';

const App = () => {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'promise' | 'stream' | null>(null);
  const [selectedPdf, setSelectedPdf] = useState<string>('/sample1.pdf');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const handlePromiseLoad = async () => {
    setLoading(true);
    setResult('');
    setMode('promise');
    try {
      let pdfSource: string | Blob;
      if (uploadedFile) {
        pdfSource = uploadedFile;
      } else {
        pdfSource = selectedPdf;
      }
      const result = await renderPdf(pdfSource);
      setResult(result);
    } catch (error) {
      setResult(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleStreamLoad = () => {
    setLoading(true);
    setResult('');
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
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="mx-auto bg-white rounded-lg shadow-md p-8 w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">PandaPage Demo</h1>
        <p className="text-gray-600 mb-6">Load PDF content using different methods:</p>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            PDF Source:
          </label>
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Upload your own PDF:</label>
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileUpload}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {uploadedFile && (
                <p className="text-sm text-green-600 mt-1">
                  ✓ Uploaded: {uploadedFile.name}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Or select a sample PDF:</label>
              <select
                value={selectedPdf}
                onChange={(e) => setSelectedPdf(e.target.value)}
                disabled={!!uploadedFile}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              >
                <option value="/sample1.pdf">Sample 1 - Dummy PDF file</option>
                <option value="/sample2.pdf">Sample 2 - Hello World</option>
                <option value="/sample3.pdf">Sample 3 - Multi-page Lorem Ipsum</option>
                <option value="/guide-footnotes.pdf">Guide - Footnotes</option>
              </select>
            </div>
            {uploadedFile && (
              <button
                onClick={() => setUploadedFile(null)}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Clear uploaded file
              </button>
            )}
          </div>
        </div>
        
        <div className="flex gap-4 mb-6">
          <button
            onClick={handlePromiseLoad}
            disabled={loading}
            className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-semibold py-2 px-4 rounded transition-colors"
          >
            {loading && mode === 'promise' ? 'Loading...' : 'Load via Promise'}
          </button>
          
          <button
            onClick={handleStreamLoad}
            disabled={loading}
            className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white font-semibold py-2 px-4 rounded transition-colors"
          >
            {loading && mode === 'stream' ? 'Streaming...' : 'Load via Stream'}
          </button>
        </div>
        
        {mode && (
          <div className={`${mode === 'stream' ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'} p-4 rounded border min-h-[150px]`}>
            <p className={`text-sm font-semibold ${mode === 'stream' ? 'text-green-600' : 'text-gray-600'} mb-2`}>
              {mode === 'stream' ? 'Stream-based result:' : 'Promise-based result:'}
            </p>
            <div className="min-h-[100px]">
              {result ? (
                <pre className={`text-sm ${mode === 'stream' ? 'text-green-800' : 'text-gray-800'} whitespace-pre-wrap font-mono`}>{result}</pre>
              ) : (
                <p className={`${mode === 'stream' ? 'text-green-400' : 'text-gray-400'} text-sm`}>
                  {loading ? 'Loading...' : 'Click a button to see results'}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
