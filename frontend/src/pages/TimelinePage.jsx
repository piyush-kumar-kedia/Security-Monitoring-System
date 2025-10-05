// src/pages/TimelinePage.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Activity } from "lucide-react";

const TimelinePage = () => {
  // 👇 use the same param name as backend route (entityId)
  const { entityId } = useParams();
  const [timeline, setTimeline] = useState([]);
  const [entity, setEntity] = useState(null);

  useEffect(() => {
    const fetchTimeline = async () => {
      try {
        // Fetch timeline
        console.log("Fetching timeline for entityId fend:", entityId);
        const resTimeline = await axios.post("http://localhost:5000/api/run-script", { entityId });
        setTimeline(resTimeline.data.timeline);

        // Fetch entity details
        const resEntity = await axios.get(
          `http://localhost:5000/api/entities/${entityId}`
        );
        setEntity(resEntity.data);
      } catch (err) {
        console.error("Error fetching timeline:", err);
      }
    };

    if (entityId) fetchTimeline();
  }, [entityId]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        {/* Header */}
        <h1 className="text-3xl font-bold flex items-center gap-3 text-blue-600">
          <Activity size={32} /> Timeline for {entity?.name || "Entity"}
        </h1>
        <p className="text-gray-600 mb-6">
          Detailed chronological activity log for{" "}
          <span className="font-semibold">{entity?.role || "this entity"}</span>.
        </p>

        {/* Timeline */}
        {timeline.length === 0 ? (
          <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200 text-yellow-700 text-center shadow">
            ⚠️ No timeline events found for this entity.
          </div>
        ) : (
          <div className="space-y-6">
            {timeline.map((event, index) => (
              <div
                key={event.event_id || index}
                className="bg-white rounded-lg shadow p-5 hover:shadow-md border-l-4 border-blue-500"
              >
                <h3 className="text-lg font-semibold text-gray-800">
                  {event.source.replace("_", " ").toUpperCase()}
                </h3>
                <p className="text-gray-600">
                  {event.summary || "No extra details"}
                </p>
                <p className="text-gray-500 text-sm mt-2">
                  📍 {event.location_id} <br />
                  ⏰ {new Date(event.timestamp).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TimelinePage;
