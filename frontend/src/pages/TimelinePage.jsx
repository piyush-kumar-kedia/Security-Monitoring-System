// src/pages/TimelinePage.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom"; // Import Link
import axios from "axios";
import { Activity, Menu, X } from "lucide-react"; // Import Menu and X icons

const TimelinePage = () => {
  const { entityId } = useParams();
  const [timeline, setTimeline] = useState([]);
  const [entity, setEntity] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false); // Add state for mobile menu

  useEffect(() => {
    const fetchTimeline = async () => {
      try {
        const resTimeline = await axios.get(
          `http://localhost:5000/api/timeline/${entityId}`
        );
        setTimeline(resTimeline.data.timeline);

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

  const navbarHeight = 'pt-16'; 
  const mobileMenuTop = 'top-16';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-blue-600 text-white p-4 flex justify-between items-center shadow-md fixed top-0 w-full z-50">
        <h1 className="text-2xl font-bold">Campus Security Dashboard</h1>
        <div className="hidden md:flex gap-6">
          <Link to="/" className="hover:underline">Home</Link>
          <Link to="/alerts" className="hover:underline">Alerts</Link>
        </div>
        <div className="md:hidden">
          <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu (Dropdown) */}
      {isMenuOpen && (
        <div className={`md:hidden bg-blue-700 text-white p-4 fixed w-full z-40 ${mobileMenuTop}`}>
          <Link to="/" className="block py-2 hover:bg-blue-600 rounded" onClick={() => setIsMenuOpen(false)}>Home</Link>
          <Link to="/alerts" className="block py-2 hover:bg-blue-600 rounded" onClick={() => setIsMenuOpen(false)}>Alerts</Link>
        </div>
      )}

      {/* Main Content with Padding */}
      <main className={navbarHeight}>
        <div className="p-6">
          {/* Header */}
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3 text-blue-600">
            <Activity size={32} /> Timeline for {entity?.name || "Entity"}
          </h1>
          <p className="text-gray-600 mb-6">
            Detailed chronological activity log for{" "}
            <span className="font-semibold">{entity?.entityType || "this entity"}</span>.
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
                  key={event._id || index}
                  className="bg-white rounded-lg shadow p-5 hover:shadow-md border-l-4 border-blue-500"
                >
                  <h3 className="text-lg font-semibold text-gray-800">
                    {event.eventType.replace("_", " ").toUpperCase()}
                  </h3>
                  <p className="text-gray-600">
                    {event.metadata?.details || "No extra details"}
                  </p>
                  <p className="text-gray-500 text-sm mt-2">
                    📍 {event.location} <br />
                    ⏰ {new Date(event.timestamp).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default TimelinePage;