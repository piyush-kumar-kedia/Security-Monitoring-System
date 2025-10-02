// src/pages/AlertsPage.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AlertsPage = () => {
  const [alerts, setAlerts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/alerts");
        setAlerts(res.data.alerts);
      } catch (err) {
        console.error(err);
      }
    };
    fetchAlerts();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <h1 className="text-3xl font-bold flex items-center gap-3 text-red-600">
          <AlertTriangle size={32} /> Inactive Entities (Alerts)
        </h1>
        <p className="text-gray-600 mb-6">
          Entities that haven’t logged any activity in the last 12 hours.
        </p>

        {alerts.length === 0 ? (
          <div className="bg-green-50 p-6 rounded-lg border border-green-200 text-green-700 text-center shadow">
            ✅ All entities are active. No alerts at this time.
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {alerts.map((entity) => (
              <div
                key={entity._id}
                className="bg-white rounded-lg shadow p-5 hover:shadow-lg border-l-4 border-red-500"
              >
                <h3 className="text-xl font-bold text-gray-800">
                  {entity.name}
                </h3>
                <p className="text-gray-600">{entity.entityType}</p>
                <p className="text-gray-500">{entity.department || "No Dept"}</p>
                <button
                  onClick={() => navigate(`/timeline/${entity._id}`)}
                  className="mt-3 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  View Timeline →
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AlertsPage;
