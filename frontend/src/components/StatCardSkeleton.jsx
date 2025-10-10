// frontend/src/components/StatCardSkeleton.jsx
import React from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const StatCardSkeleton = () => {
  return (
    <div className="bg-white p-6 rounded-xl shadow flex items-center gap-4">
      <Skeleton circle height={36} width={36} />
      <div>
        <h2 className="text-lg font-semibold">
          <Skeleton width={120} />
        </h2>
        <p>
          <Skeleton width={30} />
        </p>
      </div>
    </div>
  );
};

export default StatCardSkeleton;