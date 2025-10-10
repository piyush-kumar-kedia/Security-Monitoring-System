// frontend/src/components/DashboardCardSkeleton.jsx
import React from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const DashboardCardSkeleton = () => {
  return (
    <div className="bg-white rounded-lg shadow p-4 border-l-4 border-gray-200">
      <h3 className="text-lg font-bold">
        <Skeleton width="80%" />
      </h3>
      <p className="text-gray-600">
        <Skeleton width="60%" />
      </p>
      <p className="text-gray-500">
        <Skeleton width="40%" />
      </p>
      <div className="mt-2">
        <Skeleton width={120} height={24} />
      </div>
    </div>
  );
};

export default DashboardCardSkeleton;