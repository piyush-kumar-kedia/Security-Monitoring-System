// src/pages/TimelinePage.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Activity, User, Building, Mail, Phone, Calendar, MapPin, Clock, FileText } from "lucide-react";
import EventTimelineGraph from "../components/EventTimelineGraph";
// import EventChronoTimeline from "../components/EventChronoTimeline";



const TimelinePage = () => {
  const { entityId } = useParams();
  const [timeline, setTimeline] = useState([]);
  const [entity, setEntity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [prediction, setPrediction] = useState(null); // new state

  useEffect(() => {
    const fetchTimeline = async () => {
      try {
        setLoading(true);
        console.log("Fetching timeline for entityId:", entityId);

        const resTimeline = await axios.post("http://localhost:5000/api/run-script", { entityId });
        setTimeline(resTimeline.data.timeline);

        const resEntity = await axios.get(`http://localhost:5000/api/entities/${entityId}`);
        setEntity(resEntity.data.details);

        // 🧠 Fetch predictions (new)
        // const resPrediction = await axios.get(`http://localhost:5000/api/predict/${entityId}`);
        // setPrediction(resPrediction.data);
        // console.log("Prediction:", resPrediction.data);

      } catch (err) {
        console.error("Error fetching timeline:", err);
      } finally {
        setLoading(false);
      }
    };

    if (entityId) fetchTimeline();
  }, [entityId]);

  const getSourceColor = (source) => {
    const colors = {
      access_logs: "bg-blue-500",
      email: "bg-green-500",
      meeting: "bg-purple-500",
      security: "bg-red-500",
      default: "bg-gray-500"
    };
    return colors[source] || colors.default;
  };

  const getSourceIcon = (source) => {
    const icons = {
      access_logs: "🚪",
      email: "✉️",
      meeting: "📅",
      security: "🔒",
      default: "📋"
    };
    return icons[source] || icons.default;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading timeline...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header Section */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Activity size={32} className="text-blue-600" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">
                {entity?.name || "Entity"}'s Timeline
              </h1>
              <p className="text-gray-500 mt-1">Comprehensive activity history and events</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Entity Details Card */}
        {entity && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-12 border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg">
                <User size={24} className="text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Entity Profile</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <User size={20} className="text-blue-600 mt-1" />
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Name</p>
                  <p className="text-gray-900 font-medium mt-1">{entity.name}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <Building size={20} className="text-purple-600 mt-1" />
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Department</p>
                  <p className="text-gray-900 font-medium mt-1">{entity.department}</p>
                </div>
              </div>

              {entity.role && (
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <FileText size={20} className="text-green-600 mt-1" />
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Role</p>
                    <p className="text-gray-900 font-medium mt-1">{entity.role}</p>
                  </div>
                </div>
              )}

              {entity.email && (
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <Mail size={20} className="text-red-600 mt-1" />
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</p>
                    <p className="text-gray-900 font-medium mt-1">{entity.email}</p>
                  </div>
                </div>
              )}

              {entity.phone && (
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <Phone size={20} className="text-orange-600 mt-1" />
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Phone</p>
                    <p className="text-gray-900 font-medium mt-1">{entity.phone}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Timeline Header */}
        <div className="flex items-center gap-3 mb-8">
          <Calendar size={28} className="text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-800">Activity Timeline</h2>
          <span className="ml-auto bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold">
            {timeline.length} Events
          </span>
        </div>

        <EventTimelineGraph timeline={timeline} />

        {/* Timeline */}
        {timeline.length === 0 ? (
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-8 rounded-2xl border-2 border-yellow-200 text-center shadow-md">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-xl font-bold text-yellow-800 mb-2">No Timeline Events</h3>
            <p className="text-yellow-700">No activity records found for this entity.</p>
          </div>
        ) : (
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-200 via-purple-200 to-pink-200"></div>

            <div className="space-y-8">
              {timeline.map((event, index) => (
                <div key={event.event_id || index} className="relative pl-20">
                  {/* Timeline Dot */}
                  <div className={`absolute left-5 top-6 w-7 h-7 rounded-full ${getSourceColor(event.source)} shadow-lg flex items-center justify-center text-white text-xs font-bold border-4 border-white`}>
                    {index + 1}
                  </div>

                  {/* Event Card */}
                  <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 group">
                    {/* Card Header */}
                    <div className={`${getSourceColor(event.source)} px-6 py-4`}>
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{getSourceIcon(event.source)}</span>
                        <h3 className="text-xl font-bold text-white">
                          {event.source.replace("_", " ").toUpperCase()}
                        </h3>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-6">
                      <p className="text-gray-700 text-base leading-relaxed mb-4">
                        {event.summary || "No additional details available"}
                      </p>

                      {/* Meta Information */}
                      <div className="flex flex-wrap gap-4 pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin size={16} className="text-purple-500" />
                          <span className="font-medium">{event.location_id}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock size={16} className="text-blue-500" />
                          <span>{new Date(event.timestamp).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 🔮 Prediction Card */}
        {prediction && (
          <div className="bg-gradient-to-br from-indigo-50 via-white to-blue-50 rounded-2xl shadow-md p-8 mb-10 border border-indigo-100">
            <div className="flex items-center gap-3 mb-4">
              <Activity size={26} className="text-indigo-600" />
              <h2 className="text-xl font-bold text-indigo-800">Predicted Next Event</h2>
            </div>

            {prediction.predicted_next_location ? (
              <div>
                <p className="text-gray-800 text-lg font-medium">
                  Most likely next location:{" "}
                  <span className="font-semibold text-indigo-700">{prediction.predicted_next_location}</span>
                </p>
                <p className="text-gray-600 mt-1">
                  Confidence: {(prediction.confidence * 100).toFixed(1)}%
                </p>
                <p className="text-gray-500 text-sm mt-1">{prediction.explanation}</p>
              </div>
            ) : (
              <p className="text-gray-600">No prediction available for this entity.</p>
            )}

            {/* Predicted Missing Events */}
            {prediction.missing_event_predictions?.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-indigo-800 mb-4 flex items-center gap-2">
                  🕓 Missing Interval Predictions
                </h3>
                <div className="space-y-4">
                  {prediction.missing_event_predictions.map((pred, idx) => (
                    <div key={idx} className="p-4 bg-white border border-indigo-100 rounded-xl shadow-sm hover:shadow-md transition">
                      <p className="text-gray-700 font-medium mb-1">
                        ⏳ Between {new Date(pred.missing_start).toLocaleString()} and{" "}
                        {new Date(pred.missing_end).toLocaleString()}
                      </p>
                      <p className="text-gray-800">
                        Likely location:{" "}
                        <span className="font-semibold text-indigo-700">{pred.predicted_state}</span>{" "}
                        ({(pred.confidence * 100).toFixed(1)}%)
                      </p>
                      <p className="text-gray-500 text-sm mt-1">{pred.reason}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default TimelinePage;