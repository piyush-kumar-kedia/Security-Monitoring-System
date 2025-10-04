// frontend/src/pages/AlertsPageSkeleton.jsx
import React from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { AlertTriangle } from "lucide-react";
import AlertCardSkeleton from "../components/AlertCardSkeleton";

const AlertsPageSkeleton = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <h1 className="text-3xl font-bold flex items-center gap-3 text-gray-400">
          <AlertTriangle size={32} /> <Skeleton width={300} />
        </h1>
        <p className="text-gray-600 mb-6">
          <Skeleton width={400} />
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Display several skeleton cards to simulate loading */}
          {Array(6)
            .fill(0)
            .map((_, index) => (
              <AlertCardSkeleton key={index} />
            ))}
        </div>
      </div>
    </div>
  );
};

export default AlertsPageSkeleton;