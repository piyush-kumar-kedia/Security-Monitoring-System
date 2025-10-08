import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Bell, Users, Menu, X, Calendar, Clock } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import HomePageSkeleton from "./HomePageSkeleton";

const HomePage = () => {
  const [entities, setEntities] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const [assetType, setAssetType] = useState("All");
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const navigate = useNavigate();

  const typeColors = {
    student: "bg-blue-100 text-blue-800",
    staff: "bg-green-100 text-green-800",
    asset: "bg-yellow-100 text-yellow-800",
    device: "bg-purple-100 text-purple-800",
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [entitiesRes, alertsRes] = await Promise.all([
          axios.get("http://localhost:5000/api/entity"),
          axios.get("http://localhost:5000/api/alerts"),
        ]);
        setEntities(entitiesRes.data || []);
        setAlerts(alertsRes.data?.alerts ?? alertsRes.data ?? []);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getItemDateCandidates = (item) => {
    const keys = ["lastSeen", "last_seen", "createdAt", "updatedAt", "timestamp"];
    for (const k of keys) if (item?.[k]) return item[k];
    return null;
  };

  const toDate = (val) => {
    if (!val) return null;
    const d = new Date(val);
    return isNaN(d.getTime()) ? null : d;
  };
  const endOfDay = (d) => {
    if (!d) return null;
    const c = new Date(d);
    c.setHours(23, 59, 59, 999);
    return c;
  };

  const matchesType = (i) => {
    if (assetType === "All") return true;
    return (i?.entityType || i?.type || "").toLowerCase() === assetType.toLowerCase();
  };
  const matchesSearch = (i) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (i?.name || "").toLowerCase().includes(q) ||
      Object.values(i?.identifiers || {}).some((v) =>
        (v || "").toString().toLowerCase().includes(q)
      )
    );
  };
  const matchesDateRange = (i) => {
    if (!startDate && !endDate) return true;
    const d = toDate(getItemDateCandidates(i));
    if (!d) return false;
    if (startDate && endDate) return d >= startDate && d <= endOfDay(endDate);
    if (startDate) return d >= startDate;
    if (endDate) return d <= endOfDay(endDate);
    return true;
  };

  const filteredEntities = entities.filter(
    (e) => matchesType(e) && matchesSearch(e) && matchesDateRange(e)
  );
  const filteredAlerts = alerts.filter(
    (a) => matchesType(a) && matchesSearch(a) && matchesDateRange(a)
  );

  const clearFilters = () => {
    setAssetType("All");
    setSearch("");
    setStartDate(null);
    setEndDate(null);
  };

  const anyFilterActive = () => assetType !== "All" || search || startDate || endDate;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-blue-600 text-white p-4 flex justify-between items-center shadow-md fixed top-0 w-full z-50">
        <h1 className="text-2xl font-bold">Campus Security Dashboard</h1>

        <div className="hidden md:flex gap-6">
          <Link to="/" className="hover:underline">Home</Link>
          <Link to="/alerts" className="hover:underline">Alerts</Link>
          <Link to="/entities" className="hover:underline">Entities</Link>
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
          <Link to="/entities" className="block py-2 hover:bg-blue-600 rounded" onClick={() => setIsMenuOpen(false)}>Entities</Link>
        </div>
      )}

      <main className="pt-20">
        {loading ? (
          <HomePageSkeleton />
        ) : (
          <div className="p-6 space-y-8 max-w-7xl mx-auto">
            {/* Stats Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl shadow flex items-center gap-4 border-l-4 border-blue-500 hover:shadow-lg transition">
                <Users className="text-blue-600" size={36} />
                <div>
                  <h2 className="text-lg font-semibold">Total Entities</h2>
                  <p className="text-gray-500 text-lg font-medium">{filteredEntities.length} (filtered)</p>
                  <p className="text-sm text-gray-400">{entities.length} total</p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow flex items-center gap-4 border-l-4 border-red-500 hover:shadow-lg transition">
                <Bell className="text-red-500" size={36} />
                <div>
                  <h2 className="text-lg font-semibold">Active Alerts</h2>
                  <p className="text-gray-500 text-lg font-medium">{filteredAlerts.length} (filtered)</p>
                  <p className="text-sm text-gray-400">{alerts.length} total</p>
                </div>
              </div>
            </div>

            {/* Filters Section */}
<div className="bg-white p-4 rounded-xl shadow flex flex-wrap gap-3 items-center justify-between">
  <div className="flex flex-wrap gap-3 items-center w-full sm:w-auto">
    <select
      value={assetType}
      onChange={(e) => setAssetType(e.target.value)}
      className="border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
    >
      <option value="All">All Entities</option>
      <option value="Student">Student</option>
      <option value="Staff">Staff</option>
      <option value="Asset">Asset</option>
      <option value="Device">Device</option>
    </select>

    <input
      type="text"
      placeholder="Search by name or ID"
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      className="border border-gray-300 p-2 rounded-lg min-w-[150px] sm:min-w-[180px] w-full sm:w-auto focus:ring-2 focus:ring-blue-500"
    />

    <div className="flex flex-wrap gap-2 w-full sm:w-auto">
      <div className="flex items-center gap-2 border border-gray-300 rounded-lg p-2 bg-white w-full sm:w-auto">
        <Calendar size={18} className="text-gray-500" />
        <DatePicker
          selected={startDate}
          onChange={(date) => setStartDate(date)}
          selectsStart
          startDate={startDate}
          endDate={endDate}
          placeholderText="Start date"
          className="outline-none w-full sm:w-auto"
          isClearable
        />
      </div>

      <div className="flex items-center gap-2 border border-gray-300 rounded-lg p-2 bg-white w-full sm:w-auto">
        <DatePicker
          selected={endDate}
          onChange={(date) => setEndDate(date)}
          selectsEnd
          startDate={startDate}
          endDate={endDate}
          minDate={startDate}
          placeholderText="End date"
          className="outline-none w-full sm:w-auto"
          isClearable
        />
      </div>
    </div>
  </div>

  <button
    onClick={clearFilters}
    disabled={!anyFilterActive()}
    className={`px-4 py-2 rounded-lg text-white font-medium transition mt-2 sm:mt-0 ${
      anyFilterActive()
        ? "bg-red-500 hover:bg-red-600"
        : "bg-gray-300 cursor-not-allowed"
    }`}
  >
    Clear
  </button>
</div>


            {/* Alerts Section */}
            <div className="bg-white p-6 rounded-xl shadow">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-red-600 flex items-center gap-2">
                  <Bell size={24} /> Recent Alerts
                </h2>
                <Link to="/alerts" className="text-blue-600 hover:underline font-medium">
                  View All →
                </Link>
              </div>
              {filteredAlerts.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No alerts found.</p>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredAlerts.slice(0, 6).map((a) => {
                    const tagClass = typeColors[(a.entityType || a.type || "").toLowerCase()] || "bg-gray-100 text-gray-800";
                    return (
                      <div
                        key={a._id}
                        className="p-4 bg-red-50 border border-red-200 rounded-xl hover:shadow-md transition"
                      >
                        <h3 className="font-semibold text-gray-800 truncate">{a.name || a.title || "Unnamed Alert"}</h3>
                        <span className={`inline-block px-2 py-1 mt-1 rounded-full text-xs font-medium ${tagClass}`}>
                          {(a.entityType || a.type || "Unknown")}
                        </span>
                        <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                          <Clock size={14} /> Updated on: {toDate(getItemDateCandidates(a))?.toLocaleString() || ""}
                        </p>
                        <div className="mt-3 flex justify-end">
                          <button
                            onClick={() => navigate(`/timeline/${a._id}`)}
                            className="text-blue-600 text-sm font-medium hover:underline"
                          >
                            View Timeline →
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Entities Section */}
<div className="bg-white p-6 rounded-xl shadow">
  <div className="flex justify-between items-center mb-4">
    <h2 className="text-xl font-bold text-blue-700 flex items-center gap-2">
      <Users size={24} /> Active Entities
    </h2>
    <Link to="/entities" className="text-blue-600 hover:underline font-medium">
      View All →
    </Link>
  </div>
  {filteredEntities.length === 0 ? (
    <p className="text-gray-500 text-center py-4">No entities found.</p>
  ) : (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {filteredEntities.slice(0, 6).map((e) => {
        const tagClass = typeColors[(e.entityType || "").toLowerCase()] || "bg-gray-100 text-gray-800";
        return (
          <div
            key={e._id}
            className={`p-4 bg-blue-50 border border-gray-200 rounded-xl hover:shadow-md transition`}
          >
            <h3 className="font-semibold text-gray-800 truncate">{e.name}</h3>
            <span className={`inline-block px-2 py-1 mt-1 rounded-full text-xs font-medium ${tagClass}`}>
              {e.entityType || "Unknown"}
            </span>
            <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
              <Clock size={14} /> Updated on: {toDate(getItemDateCandidates(e))?.toLocaleString() || ""}
            </p>
            <div className="mt-3 flex justify-end">
              <button
                onClick={() => navigate(`/timeline/${e._id}`)}
                className="text-blue-600 text-sm font-medium hover:underline"
              >
                View Timeline →
              </button>
            </div>
          </div>
        );
      })}
    </div>
  )}
</div>

          </div>
        )}
      </main>
    </div>
  );
};

export default HomePage;
