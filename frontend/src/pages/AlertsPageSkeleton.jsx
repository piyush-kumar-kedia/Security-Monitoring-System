import React from 'react';

const AlertsPageSkeleton = () => {
  return (
    <div className="p-4 md:p-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="mb-6">
        <div className="h-9 bg-gray-300 rounded-md w-3/4 mb-3"></div>
        <div className="h-4 bg-gray-300 rounded-md w-1/2"></div>
      </div>

      {/* Filter Section Skeleton */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6 border border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="h-6 bg-gray-300 rounded-md w-24"></div>
          <div className="h-10 bg-gray-200 rounded-md flex-1"></div>
          <div className="h-10 bg-gray-200 rounded-md flex-1"></div>
          <div className="h-10 bg-gray-300 rounded-md w-20"></div>
        </div>
      </div>
      
      {/* Results Count Skeleton */}
      <div className="h-4 bg-gray-300 rounded-md w-1/3 mb-4"></div>

      {/* Alerts Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Create an array and map over it to generate multiple skeleton cards */}
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md p-5 border-l-4 border-gray-200">
            <div className="flex justify-between items-start mb-2">
              {/* Name Skeleton */}
              <div className="h-6 bg-gray-300 rounded-md w-1/2"></div>
              {/* Badge Skeleton */}
              <div className="h-5 bg-gray-200 rounded-full w-16"></div>
            </div>
            
            {/* Department Skeleton */}
            <div className="h-4 bg-gray-300 rounded-md w-1/3 mb-4"></div>
            
            {/* Button Skeleton */}
            <div className="h-10 bg-gray-300 rounded-lg w-full"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AlertsPageSkeleton;