import React from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import StatCardSkeleton from '../components/StatCardSkeleton';
import DashboardCardSkeleton from '../components/DashboardCardSkeleton';

const HomePageSkeleton = () => {
  return (
    <>
      {/* Stats Section */}
      <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>

      {/* Filters Section */}
      <div className="p-6">
        <div className="bg-white p-4 rounded-xl shadow flex flex-wrap gap-3 items-center justify-between">
          <Skeleton width={200} height={40} />
        </div>
      </div>

      {/* Alerts Section */}
      <div className="p-6 bg-white rounded-xl shadow">
        <h2 className="text-xl font-bold text-gray-400 mb-4">
          <Skeleton width={200} />
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(6).fill(0).map((_, i) => <DashboardCardSkeleton key={i} />)}
        </div>
      </div>

      {/* Entities Section */}
      <div className="p-6 bg-white rounded-xl shadow">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          <Skeleton width={180} />
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(6).fill(0).map((_, i) => <DashboardCardSkeleton key={i} />)}
        </div>
      </div>
    </>
  );
};

export default HomePageSkeleton;
