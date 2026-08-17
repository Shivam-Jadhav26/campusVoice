import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ 
  fullPage = false, 
  size = 'md', 
  text = 'Loading...' 
}) => {
  
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const spinner = (
    <div className="flex flex-col items-center justify-center gap-3">
      <Loader2 className={`animate-spin text-primary-600 ${sizeClasses[size]}`} />
      {text && (
        <p className="text-sm font-medium text-gray-500 animate-pulse">
          {text}
        </p>
      )}
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-50/80 backdrop-blur-sm">
        {spinner}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-8 w-full">
      {spinner}
    </div>
  );
};

export default LoadingSpinner;
