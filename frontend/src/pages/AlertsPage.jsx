// src/pages/AlertsPage.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { AlertTriangle, Menu, X } from "lucide-react"; // Import Menu and X icons
import { useNavigate, Link } from "react-router-dom"; // Import Link
import AlertsPageSkeleton from "./AlertsPageSkeleton";

const AlertsPage = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false); // Add state for mobile menu
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/alerts");
        setAlerts(res.data.alerts);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    // The setTimeout is not strictly necessary but can help ensure the skeleton appears
    setTimeout(() => {
      fetchAlerts();
    }, 0);
  }, []);

  const navbarHeight = 'pt-16'; 
  const mobileMenuTop = 'top-16';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-blue-600 text-white p-4 flex justify-between items-center shadow-md fixed top-0 w-full z-50">
        <h1 className="text-2xl font-bold">Campus Security Dashboard</h1>
        {/* Desktop Menu */}
        <div className="hidden md:flex gap-6">
          <Link to="/" className="hover:underline">Home</Link>
          <Link to="/alerts" className="hover:underline">Alerts</Link>
          <Link to="/entities" className="hover:underline">Entities</Link>
        </div>

        {/* Mobile Menu Button */}
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
          <Link to="/entities" className="block py-2 px-3 hover:bg-blue-600 rounded" onClick={() => setIsMenuOpen(false)}>Entities</Link>
        </div>
      )}

      {/* Main Content with Padding */}
      <main className={navbarHeight}>
        {loading ? (
          <AlertsPageSkeleton />
        ) : (
          <div className="p-6">
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3 text-red-600">
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
        )}
      </main>
    </div>
  );
};

export default AlertsPage;