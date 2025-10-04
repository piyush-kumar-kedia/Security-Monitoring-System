// frontend/src/pages/HomePageSkeleton.jsx
import React from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import StatCardSkeleton from '../components/StatCardSkeleton';
import DashboardCardSkeleton from '../components/DashboardCardSkeleton';

const HomePageSkeleton = () => {
  return (
    <>
      {/* Stats Section */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>

      {/* Alerts Section */}
      <div className="p-6">
        <h2 className="text-xl font-bold text-gray-400 mb-4">
          <Skeleton width={200} />
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(3).fill(0).map((_, i) => <DashboardCardSkeleton key={i} />)}
        </div>
      </div>

      {/* Entities Section */}
      <div className="p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          <Skeleton width={150} />
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(6).fill(0).map((_, i) => <DashboardCardSkeleton key={i} />)}
        </div>
      </div>
    </>
  );
};

export default HomePageSkeleton;