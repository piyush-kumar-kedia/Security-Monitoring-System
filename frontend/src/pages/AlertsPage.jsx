import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { AlertTriangle, Menu, X, Filter, Building } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import AlertsPageSkeleton from "./AlertsPageSkeleton";

const AlertsPage = () => {

  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const [entityTypeFilter, setEntityTypeFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [filteredAlerts, setFilteredAlerts] = useState([]);

  // --- DATA FETCHING ---
  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/alerts/inactive");
        setAlerts(res.data.alerts);
        setFilteredAlerts(res.data.alerts); 
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    setTimeout(() => {
      fetchAlerts();
    }, 150); 
  }, []);

  // --- FILTERING LOGIC ---
  useEffect(() => {
    let tempAlerts = alerts;

    if (entityTypeFilter) {
      tempAlerts = tempAlerts.filter(
        (alert) => alert.role === entityTypeFilter
      );
    }

    if (departmentFilter) {
      tempAlerts = tempAlerts.filter(
        (alert) => alert.department === departmentFilter
      );
    }

    setFilteredAlerts(tempAlerts);
  }, [entityTypeFilter, departmentFilter, alerts]);

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


  const entityTypes = useMemo(
    () => Array.from(new Set(alerts.map((a) => a.role))),
    [alerts]
  );
  const departments = useMemo(
    () => Array.from(new Set(alerts.map((a) => a.department).filter(Boolean))),
    [alerts]
  );

  const handleClearFilters = () => {
    setEntityTypeFilter("");
    setDepartmentFilter("");
  };

  // --- UI CONSTANTS ---
  const navbarHeight = 'mt-16';
  const mobileMenuTop = 'top-16';

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar (Unchanged) */}
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

      {/* Main Content */}
      <main className={`${navbarHeight} p-4 md:p-8 `}>
        {loading ? (
          <AlertsPageSkeleton />
        ) : (
          <div>
            {/* Header Section */}
            <div className="mb-6">
              <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-3 text-red-600">
                <AlertTriangle size={36} /> Inactive Entities (Alerts)
              </h1>
              <p className="text-gray-600 mt-1">
                Entities that haven’t logged any activity in the last 12 hours.
              </p>
            </div>
            
            {/* Filter Section - only shown if there are alerts to filter */}
            {alerts.length > 0 && (
              <div className="bg-white p-4 rounded-lg shadow-md mb-6 border border-gray-200">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                    <Filter size={20} /> Filter By:
                  </h3>
                  {/* Entity Type Filter */}
                  <div className="flex-1">
                    <label htmlFor="entityType" className="sr-only">Entity Type</label>
                    <select
                      id="entityType"
                      value={entityTypeFilter}
                      onChange={(e) => setEntityTypeFilter(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All Entity Types</option>
                      {entityTypes.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  {/* Department Filter */}
                  <div className="flex-1">
                    <label htmlFor="department" className="sr-only">Department</label>
                    <select
                      id="department"
                      value={departmentFilter}
                      onChange={(e) => setDepartmentFilter(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All Departments</option>
                      {departments.map((dept) => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>
                  {/* Clear Button */}
                  <button
                    onClick={handleClearFilters}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                  >
                    Clear
                  </button>
                </div>
              </div>
            )}
            
            {/* Conditional Rendering for Alerts */}
            {alerts.length === 0 ? (
              <div className="bg-green-100 p-6 rounded-lg border border-green-300 text-green-800 text-center shadow-sm">
                ✅ All entities are active. No alerts at this time.
              </div>
            ) : filteredAlerts.length === 0 ? (
              <div className="bg-yellow-100 p-6 rounded-lg border border-yellow-300 text-yellow-800 text-center shadow-sm">
                ℹ️ No alerts match the current filter criteria.
              </div>
            ) : (
              <>
                <p className="text-gray-600 mb-4">
                  Showing <span className="font-bold text-gray-800">{filteredAlerts.length}</span> of <span className="font-bold text-gray-800">{alerts.length}</span> total alerts.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredAlerts.map((entity) => (
                    <div
                      key={entity.card_id}
                      className="bg-white rounded-lg shadow-md p-5 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-l-4 border-red-500"
                    >
                      <div className="flex justify-between items-start">
                        <h3 className="text-xl font-bold text-gray-800 mb-1">
                          {entity.name}
                        </h3>
                        <span className="text-xs font-semibold uppercase px-2 py-1 bg-red-100 text-red-700 rounded-full">
                          {entity.role}
                        </span>
                      </div>
                      
                      {entity.department && (
                        <p className="flex items-center gap-2 text-gray-600 text-sm mt-1">
                          <Building size={14} />
                          {entity.department}
                        </p>
                      )}
                      
                      <button
                        onClick={() => navigate(`/timeline/${entity.entity_id}`)}
                        className="mt-4 w-full text-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      >
                        View Timeline →
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default AlertsPage;