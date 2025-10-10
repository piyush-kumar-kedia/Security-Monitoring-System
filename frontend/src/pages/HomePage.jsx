// src/pages/HomePage.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Bell, Users, Database, Activity, AlertTriangle, TrendingUp, Shield, Search, Filter, ChevronRight } from "lucide-react";

const HomePage = () => {
  const [entities, setEntities] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
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
        const res = await axios.get("http://localhost:5000/api/alerts/inactive");
        setAlerts(res.data.alerts);
      } catch (err) {
        console.error(err);
      }
    };

    fetchEntities();
    fetchAlerts();
  }, []);

  // useEffect(() => {
  //   const fetchAlerts = async () => {
  //     try {
  //       const res = await axios.get("http://localhost:5000/api/alerts/inactive");
  //       setAlerts(res.data.alerts);
  //     } catch (err) {
  //       console.error(err);
  //     }
  //   };

  //   fetchAlerts();
  // }, []);


  const filteredEntities = entities.filter(entity => {
    const matchesSearch = entity.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === "all" || entity.entityType === filterType;
    return matchesSearch && matchesFilter;
  });

  const entityTypes = [...new Set(entities.map(e => e.entityType))];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Modern Navbar */}
      <nav className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white bg-opacity-20 rounded-lg backdrop-blur-sm">
                <Shield size={28} />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Campus Security Hub</h1>
                <p className="text-blue-100 text-sm">Real-time monitoring & analytics</p>
              </div>
            </div>
            <div className="flex gap-6 items-center">
              <Link to="/" className="hover:text-blue-200 transition font-medium flex items-center gap-2">
                <Activity size={18} />
                Dashboard
              </Link>
              <Link to="/alerts" className="hover:text-blue-200 transition font-medium flex items-center gap-2">
                <Bell size={18} />
                Alerts
                {alerts.length > 0 && (
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                    {alerts.length}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Hero Stats Section */}
        <div className="mb-10">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3">
            <TrendingUp className="text-blue-600" size={32} />
            Overview
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link to="/entity" className="group">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <Users size={48} className="opacity-80" />
                  <div className="p-3 bg-white bg-opacity-20 rounded-xl backdrop-blur-sm">
                    <ChevronRight size={24} />
                  </div>
                </div>
                <p className="text-5xl font-bold mb-2">{entities.length}</p>
                <p className="text-blue-100 text-lg font-medium">Total Entities</p>
                <p className="text-blue-200 text-sm mt-2">Registered in system</p>
              </div>
            </Link>

            <Link to="/alerts" className="group">
              <div className="bg-gradient-to-br from-red-500 to-rose-600 text-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <AlertTriangle size={48} className="opacity-80" />
                  <div className="p-3 bg-white bg-opacity-20 rounded-xl backdrop-blur-sm">
                    <ChevronRight size={24} />
                  </div>
                </div>
                <p className="text-5xl font-bold mb-2">{alerts.length}</p>
                <p className="text-red-100 text-lg font-medium">Active Alerts</p>
                <p className="text-red-200 text-sm mt-2">Require attention</p>
              </div>
            </Link>

            <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <Database size={48} className="opacity-80" />
                <div className="p-3 bg-white bg-opacity-20 rounded-xl backdrop-blur-sm">
                  <Activity size={24} />
                </div>
              </div>
              <p className="text-5xl font-bold mb-2">{alerts.length + entities.length}</p>
              <p className="text-green-100 text-lg font-medium">Total Events</p>
              <p className="text-green-200 text-sm mt-2">Logged activities</p>
            </div>
          </div>
        </div>

        {/* Alerts Section */}
        {/* {alerts.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {alerts.map((entity) => (
              <div
                key={entity.entity_id}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border-l-4 border-red-500 group"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-red-50 rounded-lg">
                      <Bell className="text-red-600" size={24} />
                    </div>
                    <span className="bg-red-100 text-red-700 text-xs px-3 py-1 rounded-full font-semibold">
                      INACTIVE
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{entity.name}</h3>
                  <p className="text-gray-600 text-sm">
                    <span className="font-medium">Last Activity:</span> {entity.last_activity || "No records"}
                  </p>
                  <button
                    className="w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 group-hover:gap-3 transition-all mt-4"
                    onClick={() => navigate(`/timeline/${entity.entity_id}`)}
                  >
                    View Timeline
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )} */}


        {/* {alerts.length === 0 && (
          <div className="mb-10 bg-gradient-to-r from-green-50 to-emerald-50 p-8 rounded-2xl border-2 border-green-200">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-green-100 rounded-full">
                <Shield className="text-green-600" size={32} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-green-800">All Clear!</h3>
                <p className="text-green-700">No alerts detected. All entities are functioning normally.</p>
              </div>
            </div>
          </div>
        )} */}

        {/* Search and Filter Section */}
        {/* <div className="mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="text-blue-600" size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">All Entities</h2>
              <p className="text-gray-600">Browse and manage registered entities</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search entities by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition"
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="pl-12 pr-8 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition appearance-none bg-white cursor-pointer"
                >
                  <option value="all">All Types</option>
                  {entityTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div> */}

        {/* Entities Grid */}
        {/* {filteredEntities.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl shadow-md text-center">
            <div className="text-gray-300 mb-4">
              <Users size={64} className="mx-auto" />
            </div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">No Entities Found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEntities.map((entity) => (
              <div
                key={entity._id}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border-l-4 border-blue-500 group cursor-pointer"
                onClick={() => navigate(`/timeline/${entity._id}`)}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <Users className="text-blue-600" size={24} />
                    </div>
                    <span className="bg-blue-100 text-blue-700 text-xs px-3 py-1 rounded-full font-semibold">
                      ACTIVE
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition">
                    {entity.name}
                  </h3>
                  <div className="space-y-1 mb-4">
                    <p className="text-gray-600 text-sm">
                      <span className="font-medium">Type:</span> {entity.entityType}
                    </p>
                    <p className="text-gray-600 text-sm">
                      <span className="font-medium">Dept:</span> {entity.department || "Not specified"}
                    </p>
                  </div>
                  <button
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 group-hover:gap-3 transition-all"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/timeline/${entity.card_id}`);
                    }}
                  >
                    View Timeline
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )} */}
      </div>
    </div>
  );
};

export default HomePage;