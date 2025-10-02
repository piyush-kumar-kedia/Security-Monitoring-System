// src/components/AlertCard.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

export default function AlertCard({ alert }) {
  const navigate = useNavigate();

  // Color coding based on severity
  const severityColors = {
    high: "bg-red-100 text-red-800",
    medium: "bg-yellow-100 text-yellow-800",
    low: "bg-green-100 text-green-800",
  };

  return (
    <div
      className={`p-4 rounded-lg shadow mb-3 cursor-pointer hover:shadow-lg transition ${severityColors[alert.severity]}`}
      onClick={() => navigate(`/entity/${alert.entityId}`)}
    >
      <div className="flex justify-between items-center">
        <h2 className="font-bold">{alert.entityName || alert.entityId}</h2>
        <span className="text-sm font-semibold">{alert.severity.toUpperCase()}</span>
      </div>
      <p className="mt-1">{alert.description}</p>
      <p className="text-sm text-gray-500 mt-1">{new Date(alert.timestamp).toLocaleString()}</p>
    </div>
  );
}
