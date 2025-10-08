import React from "react";

const EntitiesPageSkeleton = () => {
  return (
    <div className="pt-24 pb-10 px-3 sm:px-6 md:px-8 lg:px-12 max-w-7xl mx-auto animate-pulse">
      {/* Header Skeleton */}
      <div className="h-8 bg-gray-300 rounded-md w-1/2 mb-6"></div>

      {/* Filter Section Skeleton */}
      <div className="mb-6 p-6 bg-white rounded-2xl shadow-md flex flex-wrap gap-4 items-center justify-between">
        {Array.from({ length: 5 }).map((_, idx) => (
          <div key={idx} className="h-10 bg-gray-200 rounded-lg flex-1 min-w-[150px]"></div>
        ))}
      </div>

      {/* Table Skeleton */}
      <div className="overflow-x-auto rounded-xl shadow-lg border border-gray-200">
        <table className="min-w-full border border-gray-300 rounded-lg overflow-hidden">
          <thead className="bg-gradient-to-r from-blue-100 to-purple-100">
            <tr>
              <th className="p-3 text-left font-semibold text-gray-800 border-b border-gray-300">
                <div className="h-4 bg-gray-300 rounded w-1/3"></div>
              </th>
              <th className="p-3 text-left font-semibold text-gray-800 border-b border-gray-300">
                <div className="h-4 bg-gray-300 rounded w-1/3"></div>
              </th>
              <th className="p-3 text-left font-semibold text-gray-800 border-b border-gray-300">
                <div className="h-4 bg-gray-300 rounded w-1/4"></div>
              </th>
              <th className="p-3 text-center font-semibold text-gray-800 border-b border-gray-300">
                <div className="h-4 bg-gray-300 rounded w-1/4 mx-auto"></div>
              </th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 10 }).map((_, index) => (
              <tr key={index} className="border-b border-gray-200">
                <td className="p-3">
                  <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                </td>
                <td className="p-3">
                  <div className="h-5 bg-gray-200 rounded w-2/3"></div>
                </td>
                <td className="p-3 text-center">
                  <div className="h-6 bg-gray-200 rounded-full w-24 mx-auto"></div>
                </td>
                <td className="p-3 text-center">
                  <div className="h-9 bg-gray-300 rounded-lg w-32 mx-auto"></div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Skeleton */}
      <div className="flex justify-center mt-6 gap-2 flex-wrap">
        {Array.from({ length: 3 }).map((_, idx) => (
          <div key={idx} className="h-10 w-10 bg-gray-200 rounded-lg"></div>
        ))}
      </div>
    </div>
  );
};

export default EntitiesPageSkeleton;
