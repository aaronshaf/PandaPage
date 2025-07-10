interface DocumentUploadProps {
  isDragging: boolean;
}

export const DocumentUpload: React.FC<DocumentUploadProps> = ({ isDragging }) => {
  if (!isDragging) return null;

  return (
    <div className="absolute inset-0 bg-blue-50 bg-opacity-90 flex items-center justify-center z-50 border-4 border-dashed border-blue-400">
      <div className="text-center">
        <svg className="mx-auto h-12 w-12 text-blue-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        <p className="text-lg font-medium text-blue-900">Drop your DOCX or Pages file here</p>
        <p className="text-sm text-blue-700 mt-1">We'll convert it to Markdown instantly</p>
      </div>
    </div>
  );
};