import { useState, useEffect } from 'react';

interface LoadingSpinnerProps {
  result: string | null;
  startTime?: number;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ result, startTime }) => {
  const [showText, setShowText] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowText(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <svg className="animate-spin h-8 w-8 text-gray-400 mb-4 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 818-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        {showText && (
          <p className="text-gray-500">{result ? 'Converting document to Markdown...' : 'Loading document...'}</p>
        )}
      </div>
    </div>
  );
};