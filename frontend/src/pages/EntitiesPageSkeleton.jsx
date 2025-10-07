import React from 'react';

const EntitiesPageSkeleton = () => {
  return (
    <div className="p-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="h-8 bg-gray-300 rounded-md w-1/2 mb-6"></div>

      {/* Filter Section Skeleton */}
      <div className="mb-6 p-4 bg-white rounded-lg shadow-md grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-center">
        <div className="h-10 bg-gray-200 rounded-lg"></div>
        <div className="h-10 bg-gray-200 rounded-lg"></div>
        <div className="h-10 bg-gray-200 rounded-lg"></div>
        <div className="h-10 bg-gray-200 rounded-lg"></div>
        <div className="h-10 bg-gray-200 rounded-lg"></div>
      </div>

      {/* Table Skeleton */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3"><div className="h-4 bg-gray-300 rounded w-1/3"></div></th>
              <th className="p-3"><div className="h-4 bg-gray-300 rounded w-1/3"></div></th>
              <th className="p-3"><div className="h-4 bg-gray-300 rounded w-1/4 mx-auto"></div></th>
              <th className="p-3"><div className="h-4 bg-gray-300 rounded w-1/4 mx-auto"></div></th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 10 }).map((_, index) => (
              <tr key={index} className="border-b border-gray-200">
                <td className="p-3"><div className="h-5 bg-gray-200 rounded w-3/4"></div></td>
                <td className="p-3"><div className="h-5 bg-gray-200 rounded w-2/3"></div></td>
                <td className="p-3">
                  <div className="h-6 bg-gray-200 rounded-full w-24 mx-auto"></div>
                </td>
                <td className="p-3">
                  <div className="h-9 bg-gray-300 rounded-lg w-32 mx-auto"></div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Skeleton */}
      <div className="flex justify-center mt-6 gap-2">
        <div className="h-10 w-10 bg-gray-200 rounded-lg"></div>
        <div className="h-10 w-10 bg-gray-200 rounded-lg"></div>
        <div className="h-10 w-10 bg-gray-200 rounded-lg"></div>
      </div>
    </div>
  );
};

export default EntitiesPageSkeleton;