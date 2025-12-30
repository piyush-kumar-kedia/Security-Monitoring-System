import React, { useState, useEffect } from "react";
import axios from "axios";
import { MapPin, Calendar, TrendingUp, AlertCircle, Loader } from "lucide-react";

function Predictor({ entityId }) {
    console.log("Predictor received entityId:", entityId);

    const [eid, setEid] = useState(entityId);

    const [timestamp, setTimestamp] = useState("");
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [training, setTraining] = useState(false);
    const [trained, setTrained] = useState(false);

    useEffect(() => {
        console.log("Predictor received entityId:", entityId);
        if (!entityId) {
            setError("No entity ID provided");
        }
    }, [entityId]);

    const trainModel = async () => {
        setTraining(true);
        setError(null);
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
            setError(err.response?.data?.detail || "Failed to train model.");
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
            setError("Entity ID is missing. Cannot make prediction.");
            return;
        }

        if (!trained) {
            setError("Model not trained yet. Training now...");
            await trainModel();
        }

        if (!timestamp) {
            setError("Please enter a timestamp");
            return;
        }

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const res = await predictLocation(entityId, timestamp);
            setResult(res);
        } catch (err) {
            setError(err.response?.data?.detail || err.message || "Failed to predict location. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleSetCurrentTime = () => {
        const now = new Date();
        const formatted = now.toISOString().slice(0, 19).replace('T', ' ');
        setTimestamp(formatted);
    };

    return (
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

            <div className="text-xs text-gray-500 mb-4 p-2 bg-gray-100 rounded">
                Entity ID: {entityId || "Not provided"}
            </div>

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
                        />
                        <button
                            onClick={handleSetCurrentTime}
                            className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
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
                    disabled={loading || !timestamp || !entityId}
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {loading ? (
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
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <div className="flex items-start gap-3">
                        <AlertCircle size={20} className="text-red-600 mt-0.5 flex-shrink-0" />
                        <div>
                            <h4 className="font-semibold text-red-800 mb-1">Error</h4>
                            <p className="text-red-700 text-sm">{error}</p>
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
                                {result.predicted_location || "Unknown"}
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
                                    {result.method || "N/A"}
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
    );
}

export default Predictor;