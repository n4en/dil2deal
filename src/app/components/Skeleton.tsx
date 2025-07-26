import React from 'react';

export default function Skeleton() {
  return (
    <div className="card w-full max-w-md sm:max-w-full p-4 sm:p-6 flex flex-col animate-pulse">
      <div className="flex items-center justify-between mb-3">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-16" />
      </div>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20" />
      </div>
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mb-3" />
      <div className="space-y-2 flex-1">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
      </div>
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-12" />
      </div>
    </div>
  );
} 