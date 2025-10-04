// src/pages/HomePage.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Bell, Users, Database, Menu, X } from "lucide-react"; // modern icons
import HomePageSkeleton from "./HomePageSkeleton";

const HomePage = () => {
  const [entities, setEntities] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false); // State for mobile menu
  const [loading, setLoading] = useState(true); 
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEntities = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/entity");
        setEntities(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    const fetchAlerts = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/alerts");
        setAlerts(res.data.alerts);
      } catch (err) {
        console.error(err);
      }
      finally{
        setLoading(false); // Set loading to false after data is fetched or on error
      }
    };

    fetchEntities();
    fetchAlerts();
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
          <Link to="/" className="block py-2 px-3 hover:bg-blue-600 rounded" onClick={() => setIsMenuOpen(false)}>Home</Link>
          <Link to="/alerts" className="block py-2 px-3 hover:bg-blue-600 rounded" onClick={() => setIsMenuOpen(false)}>Alerts</Link>
          <Link to="/entities" className="block py-2 px-3 hover:bg-blue-600 rounded" onClick={() => setIsMenuOpen(false)}>Entities</Link>
        </div>
      )}

      <main className={navbarHeight}>
      {/* Stats Section */}
      {loading ? (
          <HomePageSkeleton />
        ) : (
    <>
      <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg flex items-center gap-4">
          <Users className="text-blue-600" size={36} />
          <div>
            <h2 className="text-lg font-semibold">Total Entities</h2>
            <p className="text-gray-500">{entities.length}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg flex items-center gap-4">
          <Bell className="text-red-500" size={36} />
          <div>
            <h2 className="text-lg font-semibold">Active Alerts</h2>
            <p className="text-gray-500">{alerts.length}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg flex items-center gap-4">
          <Database className="text-green-600" size={36} />
          <div>
            <h2 className="text-lg font-semibold">Recent Logs</h2>
            <p className="text-gray-500">{alerts.length + entities.length}</p>
          </div>
        </div>
      </div>

      {/* Alerts Section */}
      <div className="p-6">
        <h2 className="text-xl font-bold text-red-600 mb-4">🚨 Inactive Entities</h2>
        {alerts.length === 0 ? (
          <p className="text-gray-500">✅ No alerts, everything looks good!</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {alerts.map((entity) => (
              <div
                key={entity._id}
                className="bg-white rounded-lg shadow p-4 hover:shadow-lg border-l-4 border-red-500"
              >
                <h3 className="text-lg font-bold text-gray-800">{entity.name}</h3>
                <p className="text-gray-600">{entity.entityType}</p>
                <p className="text-gray-500">{entity.department || "No Dept"}</p>
                <button
                  className="mt-2 text-blue-600 hover:underline"
                  onClick={() => navigate(`/timeline/${entity._id}`)}
                >
                  View Timeline →
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Entities Section */}
      <div className="p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">👥 All Entities</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {entities.map((entity) => (
            <div
              key={entity._id}
              className="bg-white rounded-lg shadow p-4 hover:shadow-lg border-l-4 border-blue-500"
            >
              <h3 className="text-lg font-bold text-gray-800">{entity.name}</h3>
              <p className="text-gray-600">{entity.entityType}</p>
              <p className="text-gray-500">{entity.department || "No Dept"}</p>
              <button
                className="mt-2 text-blue-600 hover:underline"
                onClick={() => navigate(`/timeline/${entity._id}`)}
              >
                View Timeline →
              </button>
            </div>
          ))}
        </div>
      </div>
      </>)}
      </main>
    </div>
  );
};

export default HomePage;
