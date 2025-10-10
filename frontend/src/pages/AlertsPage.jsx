import React, { useEffect, useState } from "react";
import axios from "axios";
import { AlertTriangle, Clock, CheckCircle, Eye, TrendingDown } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AlertsPage = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/alerts/inactive");
        setAlerts(res.data.alerts);
        console.log
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAlerts();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading alerts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-red-50 to-orange-50">
      {/* Header Section */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-red-100 rounded-xl">
                  <AlertTriangle className="text-red-600" size={32} />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-gray-900">
                    Activity Alerts
                  </h1>
                  <p className="text-gray-500 mt-1">
                    Monitoring entity activity status
                  </p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 rounded-lg border border-red-200">
                <TrendingDown className="text-red-600" size={20} />
                <div className="text-left">
                  <p className="text-xs text-gray-600 font-medium">Inactive Entities</p>
                  <p className="text-2xl font-bold text-red-600">{alerts.length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8 flex items-start gap-3">
          <Clock className="text-blue-600 mt-0.5 flex-shrink-0" size={20} />
          <div>
            <p className="text-blue-900 font-medium">Inactivity Threshold: 12 Hours</p>
            <p className="text-blue-700 text-sm mt-1">
              Entities listed below haven't logged any activity in the last 12 hours and may require attention.
            </p>
          </div>
        </div>

        {/* Alerts Grid or Success State */}
        {alerts.length === 0 ? (
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border-2 border-green-200 p-12 text-center shadow-lg">
            <div className="inline-flex p-4 bg-green-100 rounded-full mb-4">
              <CheckCircle className="text-green-600" size={48} />
            </div>
            <h2 className="text-3xl font-bold text-green-900 mb-2">
              All Systems Active
            </h2>
            <p className="text-green-700 text-lg">
              Great news! All entities are actively logging data. No alerts at this time.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {alerts.map((entity) => (
              <div
                key={entity._id}
                className="group bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-200 hover:border-red-300"
              >
                {/* Alert Indicator Bar */}
                <div className="h-2 bg-gradient-to-r from-red-500 to-orange-500"></div>
                
                <div className="p-6">
                  {/* Alert Icon */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-2 bg-red-50 rounded-lg">
                      <AlertTriangle className="text-red-600" size={24} />
                    </div>
                    <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
                      INACTIVE
                    </span>
                  </div>

                  {/* Entity Info */}
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-red-600 transition-colors">
                    {entity.name}
                  </h3>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                      <span className="text-sm font-medium">{entity.role}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-500">
                      <span className="w-2 h-2 bg-gray-300 rounded-full"></span>
                      <span className="text-sm">{entity.department || "No Department"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-blue-500">
                      <span className="w-2 h-2 bg-gray-300 rounded-full"></span>
                      <span className="text-sm">{entity.last_activity || "No Last Activity"}</span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => navigate(`/timeline/${entity.card_id}`)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium shadow-md hover:shadow-lg"
                  >
                    <Eye size={18} />
                    View Timeline
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AlertsPage;