'use client';

import React from 'react';

interface OptimizedSkeletonProps {
  className?: string;
  variant?: 'text' | 'card' | 'avatar' | 'button';
  count?: number;
}

const OptimizedSkeleton = React.memo<OptimizedSkeletonProps>(function OptimizedSkeleton({ 
  className = '', 
  variant = 'text',
  count = 1 
}) {
  const baseClasses = 'animate-pulse bg-gray-200 dark:bg-gray-700 rounded';
  
  const variantClasses = {
    text: 'h-4 w-full',
    card: 'h-48 w-full',
    avatar: 'h-12 w-12 rounded-full',
    button: 'h-10 w-24'
  };

  if (count === 1) {
    return (
      <div className={`${baseClasses} ${variantClasses[variant]} ${className}`} />
    );
  }

  return (
    <>
      {Array.from({ length: count }, (_, index) => (
        <div
          key={index}
          className={`${baseClasses} ${variantClasses[variant]} ${className}`}
        />
      ))}
    </>
  );
});

export const OptimizedSkeletonCard = React.memo(function OptimizedSkeletonCard() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <OptimizedSkeleton className="h-6 w-3/4" />
          <OptimizedSkeleton className="h-6 w-16" />
        </div>
        <OptimizedSkeleton className="h-4 w-full mb-2" />
        <OptimizedSkeleton className="h-4 w-2/3 mb-3" />
        <div className="flex items-center justify-between">
          <OptimizedSkeleton className="h-3 w-1/3" />
          <OptimizedSkeleton className="h-3 w-1/4" />
        </div>
      </div>
      <div className="p-4 bg-gray-50 dark:bg-gray-700">
        <div className="flex items-center justify-between">
          <OptimizedSkeleton className="h-4 w-1/2" />
          <OptimizedSkeleton className="h-4 w-1/4" />
        </div>
      </div>
    </div>
  );
});

export const OptimizedSkeletonGrid = React.memo<{ count?: number }>(function OptimizedSkeletonGrid({ count = 6 }) {
  return (
    <>
      {Array.from({ length: count }, (_, index) => (
        <OptimizedSkeletonCard key={index} />
      ))}
    </>
  );
});

export default OptimizedSkeleton;
