interface ErrorDisplayProps {
  error: string;
  onRetry?: () => void;
  onClear?: () => void;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error, onRetry, onClear }) => {
  const isNotImplementedError = error.includes('currently in development') || 
                                error.includes('not yet implemented');

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className={`rounded-lg border-l-4 p-6 shadow-sm ${
        isNotImplementedError 
          ? 'bg-blue-50 border-blue-400' 
          : 'bg-red-50 border-red-400'
      }`}>
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {isNotImplementedError ? (
              <svg className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            )}
          </div>
          <div className="ml-3 flex-1">
            <h3 className={`text-sm font-medium ${
              isNotImplementedError ? 'text-blue-800' : 'text-red-800'
            }`}>
              {isNotImplementedError ? 'Feature In Development' : 'Document Processing Error'}
            </h3>
            <div className={`mt-2 text-sm ${
              isNotImplementedError ? 'text-blue-700' : 'text-red-700'
            }`}>
              <p>{error}</p>
            </div>
            
            {isNotImplementedError && (
              <div className="mt-4 p-4 bg-blue-100 rounded-md">
                <h4 className="text-sm font-medium text-blue-800 mb-2">Currently Supported Formats:</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>✅ <strong>DOCX files</strong> - Full support with formatting, tables, and lists</li>
                  <li>🚧 <strong>Pages files</strong> - Coming soon</li>
                </ul>
              </div>
            )}
            
            <div className="mt-4 flex space-x-3">
              {onRetry && (
                <button
                  onClick={onRetry}
                  className={`text-sm font-medium rounded-md px-3 py-2 transition-colors ${
                    isNotImplementedError
                      ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                      : 'bg-red-100 text-red-800 hover:bg-red-200'
                  }`}
                >
                  Try Again
                </button>
              )}
              {onClear && (
                <button
                  onClick={onClear}
                  className="text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Dismiss
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};