// frontend/src/components/AlertCardSkeleton.jsx
import React from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const AlertCardSkeleton = () => {
  return (
    <div className="bg-white rounded-lg shadow p-5 border-l-4 border-gray-200">
      <h3 className="text-xl font-bold text-gray-800">
        <Skeleton width={`80%`} />
      </h3>
      <p className="text-gray-600">
        <Skeleton width={`60%`} />
      </p>
      <p className="text-gray-500">
        <Skeleton width={`40%`} />
      </p>
      <div className="mt-3">
        <Skeleton width={110} height={30} />
      </div>
    </div>
  );
};

export default AlertCardSkeleton;