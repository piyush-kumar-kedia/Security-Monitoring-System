// src/pages/TimelinePage.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { Activity, User, Menu, Building, Mail, Phone, Calendar, MapPin, Clock, FileText, TrendingUp, AlertCircle, Loader } from "lucide-react";
import EventTimelineGraph from "../components/EventTimelineGraph";
import { useNavigate } from "react-router-dom";

const TimelinePage = () => {
  const { entityId } = useParams();
  const [timeline, setTimeline] = useState([]);
  const [entity, setEntity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [prediction, setPrediction] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Predictor states
  const [timestamp, setTimestamp] = useState("");
  const [result, setResult] = useState(null);
  const [predictionLoading, setPredictionLoading] = useState(false);
  const [predictionError, setPredictionError] = useState(null);
  const [training, setTraining] = useState(false);
  const [trained, setTrained] = useState(false);

  const navigate = useNavigate()

  const [timeFilter, setTimeFilter] = useState({
    startTime: '',
    endTime: '',
  });
  const [filteredTimeline, setFilteredTimeline] = useState([]);

  useEffect(() => {
    const fetchTimeline = async () => {
      try {
        setLoading(true);
        console.log("Fetching timeline for entityId:", entityId);

        const resTimeline = await axios.post("http://localhost:5000/api/run-script", { entityId });
        setTimeline(resTimeline.data.timeline);

        const resEntity = await axios.get(`http://localhost:5000/api/entities/${entityId}`);
        setEntity(resEntity.data.details);

      } catch (err) {
        console.error("Error fetching timeline:", err);
      } finally {
        setLoading(false);
      }
    };

    if (entityId) fetchTimeline();
  }, [entityId]);

  const filterTimeline = () => {
    if (!timeFilter.startTime || !timeFilter.endTime) {
      setFilteredTimeline(timeline);
      return;
    }

    const filtered = timeline.filter((event) => {
      const eventTime = new Date(event.timestamp);
      const startTime = new Date(timeFilter.startTime);
      const endTime = new Date(timeFilter.endTime);
      return eventTime >= startTime && eventTime <= endTime;
    });

    setFilteredTimeline(filtered);
  };

    const handleLogout = async () => {
    try {
      const res = await fetch("http://localhost:5000/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) {
        navigate("/login");
      } else {
        const data = await res.json();
        alert(data.message || "Logout failed");
      }
    } catch (err) {
      console.error("Logout error:", err);
      alert("Something went wrong during logout");
    }
  };

  useEffect(() => {
    filterTimeline();
  }, [timeline, timeFilter]);

  // Predictor functions
  const trainModel = async () => {
    setTraining(true);
    setPredictionError(null);
    try {
      const res = await axios.post("http://localhost:5000/api/train", {
        data_dir: "data",
        time_window_hours: 2,
        n_clusters: null,
        decay_half_life_hours: 2.0,
        nearby_window_radius: 2
      });
      console.log("Training response:", res.data);
      setTrained(true);
    } catch (err) {
      console.error("Training failed:", err);
      setPredictionError(err.response?.data?.detail || "Failed to train model.");
    } finally {
      setTraining(false);
    }
  };

  const predictLocation = async (entityId, timestamp) => {
    if (!entityId) {
      throw new Error("Entity ID is required");
    }

    console.log('Predicting for EntityId:', entityId, 'at timestamp:', timestamp);

    try {
      const res = await axios.post("http://localhost:5000/api/predict", {
        entity_id: entityId,
        timestamp: timestamp,
      });
      return res.data;
    } catch (err) {
      console.error("Prediction failed:", err);
      throw err;
    }
  };

  const handlePredict = async () => {
    if (!entityId) {
      setPredictionError("Entity ID is missing. Cannot make prediction.");
      return;
    }

    if (!trained) {
      setPredictionError("Model not trained yet. Training now...");
      await trainModel();
    }

    if (!timestamp) {
      setPredictionError("Please enter a timestamp");
      return;
    }

    setPredictionLoading(true);
    setPredictionError(null);
    setResult(null);

    try {
      const res = await predictLocation(entityId, timestamp);
      setResult(res);
    } catch (err) {
      setPredictionError(err.response?.data?.detail || err.message || "Failed to predict location. Please try again.");
    } finally {
      setPredictionLoading(false);
    }
  };

  const handleSetCurrentTime = () => {
    const now = new Date();
    const formatted = now.toISOString().slice(0, 19).replace('T', ' ');
    setTimestamp(formatted);
  };

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
      

      <nav className="bg-blue-600 text-white p-4 flex justify-between items-center shadow-md fixed top-0 w-full z-50">
        <h1 className="text-2xl font-bold">Campus Security-Monitoring-System</h1>

        <div className="hidden md:flex gap-6">
          <button
            onClick={handleLogout}
            className="hover:underline"
          >
            Logout
          </button>
          <Link to="/" className="hover:underline">Home</Link>
          <Link to="/alerts" className="hover:underline">Alerts</Link>
          <Link to="/entity" className="hover:underline">Entities</Link>
        </div>

        <div className="md:hidden">
          <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </nav>

      {isMenuOpen && (
        <div className="md:hidden bg-blue-700 text-white p-4 fixed w-full top-16 z-40">
          <Link to="/" className="block py-2 hover:bg-blue-600 rounded" onClick={() => setIsMenuOpen(false)}>Home</Link>
          <Link to="/alerts" className="block py-2 hover:bg-blue-600 rounded" onClick={() => setIsMenuOpen(false)}>Alerts</Link>
          <Link to="/entity" className="block py-2 hover:bg-blue-600 rounded" onClick={() => setIsMenuOpen(false)}>Entities</Link>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-6 py-8 mt-14">
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

        {/* Predictor Section (Integrated) */}
        <div className="bg-gradient-to-br from-purple-50 via-white to-indigo-50 rounded-2xl shadow-lg p-8 mb-12 border border-purple-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg">
              <TrendingUp size={24} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Location Predictor</h2>
          </div>

          <p className="text-gray-600 mb-6">
            Predict where this entity is likely to be at a specific time based on historical patterns.
          </p>

          

          {/* Input Section */}
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Calendar size={16} className="inline mr-2" />
                Timestamp
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={timestamp}
                  onChange={(e) => setTimestamp(e.target.value)}
                  placeholder="YYYY-MM-DD HH:MM:SS"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                  disabled={training || predictionLoading}
                />
                <button
                  onClick={handleSetCurrentTime}
                  disabled={training || predictionLoading}
                  className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Now
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Example: 2024-03-15 14:30:00
              </p>
            </div>

            <button
              onClick={handlePredict}
              disabled={training || predictionLoading || !timestamp || !entityId}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {training ? (
                <>
                  <Loader size={20} className="animate-spin" />
                  Training Model...
                </>
              ) : predictionLoading ? (
                <>
                  <Loader size={20} className="animate-spin" />
                  Predicting...
                </>
              ) : (
                <>
                  <MapPin size={20} />
                  Predict Location
                </>
              )}
            </button>
          </div>

          {/* Error Message */}
          {predictionError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <AlertCircle size={20} className="text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-red-800 mb-1">Error</h4>
                  <p className="text-red-700 text-sm">{predictionError}</p>
                </div>
              </div>
            </div>
          )}

          {/* Results Section */}
          {result && (
            <div className="bg-white rounded-xl border-2 border-purple-200 p-6 shadow-md">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <MapPin size={20} className="text-purple-600" />
                Prediction Results
              </h3>

              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg">
                  <p className="text-sm font-semibold text-gray-600 mb-1">Predicted Location</p>
                  <p className="text-2xl font-bold text-purple-700">
                    {/* {result.predicted_location || "Unknown"} */}
                    {result?.predicted_location
                      ? result.predicted_location
                        .replace(/_/g, " ")          // replace underscores with spaces
                        .replace(/\b\w/g, char => char.toUpperCase()) // capitalize each word
                      : "Unknown"}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                      Confidence
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${(result.confidence || 0) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-lg font-bold text-gray-800">
                        {((result.confidence || 0) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                      Method
                    </p>
                    <p className="text-lg font-bold text-gray-800 capitalize">
                      {result?.method
                        ? result.method
                          .replace(/_/g, " ") // replace underscores with spaces
                          .replace(/\b\w/g, (char) => char.toUpperCase()) // capitalize each word
                        : "N/A"}
                    </p>
                  </div>

                  
                </div>

                {result.explanation && (
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-900">
                      <span className="font-semibold">Explanation: </span>
                      {result.explanation}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Timeline Header */}
        <div className="flex items-center gap-3 mb-8">
          <Calendar size={28} className="text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-800">Activity Timeline</h2>
          <span className="ml-auto bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold">
            {timeline.length} Events
          </span>
        </div>


        {/* Time Filter Section */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock size={20} className="text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Time Filter</h3>
                <p className="text-sm text-gray-500">Filter events by time range</p>
              </div>
            </div>

            {/* Quick Filter Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  const now = new Date();
                  const dayStart = new Date(now.setHours(0, 0, 0, 0));
                  setTimeFilter({
                    startTime: dayStart.toISOString().slice(0, 16),
                    endTime: new Date().toISOString().slice(0, 16)
                  });
                }}
                className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                Today
              </button>
              <button
                onClick={() => {
                  const now = new Date();
                  const weekStart = new Date(now.setDate(now.getDate() - 7));
                  setTimeFilter({
                    startTime: weekStart.toISOString().slice(0, 16),
                    endTime: new Date().toISOString().slice(0, 16)
                  });
                }}
                className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                Last 7 Days
              </button>
              <button
                onClick={() => {
                  const now = new Date();
                  const monthStart = new Date(now.setDate(now.getDate() - 30));
                  setTimeFilter({
                    startTime: monthStart.toISOString().slice(0, 16),
                    endTime: new Date().toISOString().slice(0, 16)
                  });
                }}
                className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                Last 30 Days
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Start Time
              </label>
              <div className="relative">
                <input
                  type="datetime-local"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  value={timeFilter.startTime}
                  onChange={(e) => setTimeFilter(prev => ({ ...prev, startTime: e.target.value }))}
                />
                
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                End Time
              </label>
              <div className="relative">
                <input
                  type="datetime-local"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  value={timeFilter.endTime}
                  onChange={(e) => setTimeFilter(prev => ({ ...prev, endTime: e.target.value }))}
                />
                
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between border-t pt-4">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${filteredTimeline.length ? 'bg-green-500' : 'bg-gray-400'}`}></div>
              <span className="text-sm text-gray-600">
                Showing <span className="font-semibold text-gray-900">{filteredTimeline.length}</span> of <span className="font-semibold text-gray-900">{timeline.length}</span> events
              </span>
            </div>

            <button
              onClick={() => setTimeFilter({ startTime: '', endTime: '' })}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
              Reset Filter
            </button>
          </div>
        </div>

        <EventTimelineGraph timeline={filteredTimeline} />

        {/* Timeline */}
        
        {filteredTimeline.length === 0 ? (
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-8 rounded-2xl border-2 border-yellow-200 text-center shadow-md">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-xl font-bold text-yellow-800 mb-2">No Events Found</h3>
            <p className="text-yellow-700">
              {timeline.length > 0
                ? "No events found in the selected time range."
                : "No activity records found for this entity."}
            </p>
          </div>
        ) : (
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-200 via-purple-200 to-pink-200"></div>

            <div className="space-y-8">
              {filteredTimeline.map((event, index) => (
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

        {/* Prediction Card */}
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