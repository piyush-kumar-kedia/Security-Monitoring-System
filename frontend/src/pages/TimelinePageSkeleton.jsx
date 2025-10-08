import React from 'react';

const TimelinePageSkeleton = () => {
  return (
    <div className="p-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="mb-6">
        <div className="h-9 bg-gray-300 rounded-md w-3/4 mb-3"></div>
        <div className="h-4 bg-gray-300 rounded-md w-1/2"></div>
      </div>

      {/* Timeline Events Skeleton */}
      <div className="space-y-6">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow p-5 border-l-4 border-gray-200"
          >
            {/* Event Type Skeleton */}
            <div className="h-6 bg-gray-300 rounded-md w-1/3 mb-3"></div>
            {/* Details Skeleton */}
            <div className="h-4 bg-gray-200 rounded-md w-full mb-1"></div>
            <div className="h-4 bg-gray-200 rounded-md w-5/6"></div>
            {/* Location & Timestamp Skeleton */}
            <div className="mt-3">
              <div className="h-4 bg-gray-200 rounded-md w-2/3 mb-1"></div>
              <div className="h-4 bg-gray-200 rounded-md w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TimelinePageSkeleton;