import React from 'react';

export function UploadProgress({ progress }) {
  if (progress <= 0) return null;
  
  return (
    <div className="w-full mt-2">
      <div className="text-xs text-gray-500 mb-1">Uploading... {Math.round(progress)}%</div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
        <div 
          className="bg-primary h-1.5 rounded-full transition-all duration-300" 
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
