// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { AlertTriangle, Clock, CheckCircle, Eye, TrendingDown } from "lucide-react";
// import { useNavigate } from "react-router-dom";

// const AlertsPage = () => {
//   const [alerts, setAlerts] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const fetchAlerts = async () => {
//       try {
//         const res = await axios.get("http://localhost:5000/api/alerts/inactive");
//         setAlerts(res.data.alerts);
//         console.log
//       } catch (err) {
//         console.error(err);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchAlerts();
//   }, []);

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-red-600 mx-auto mb-4"></div>
//           <p className="text-gray-600 font-medium">Loading alerts...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-50 via-red-50 to-orange-50">
//       {/* Header Section */}
//       <div className="bg-white shadow-sm border-b border-gray-200">
//         <div className="max-w-7xl mx-auto px-6 py-8">
//           <div className="flex items-center justify-between">
//             <div>
//               <div className="flex items-center gap-3 mb-2">
//                 <div className="p-3 bg-red-100 rounded-xl">
//                   <AlertTriangle className="text-red-600" size={32} />
//                 </div>
//                 <div>
//                   <h1 className="text-4xl font-bold text-gray-900">
//                     Activity Alerts
//                   </h1>
//                   <p className="text-gray-500 mt-1">
//                     Monitoring entity activity status
//                   </p>
//                 </div>
//               </div>
//             </div>
//             <div className="text-right">
//               <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 rounded-lg border border-red-200">
//                 <TrendingDown className="text-red-600" size={20} />
//                 <div className="text-left">
//                   <p className="text-xs text-gray-600 font-medium">Inactive Entities</p>
//                   <p className="text-2xl font-bold text-red-600">{alerts.length}</p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Content Section */}
//       <div className="max-w-7xl mx-auto px-6 py-8">
//         {/* Info Banner */}
//         <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8 flex items-start gap-3">
//           <Clock className="text-blue-600 mt-0.5 flex-shrink-0" size={20} />
//           <div>
//             <p className="text-blue-900 font-medium">Inactivity Threshold: 12 Hours</p>
//             <p className="text-blue-700 text-sm mt-1">
//               Entities listed below haven't logged any activity in the last 12 hours and may require attention.
//             </p>
//           </div>
//         </div>

//         {/* Alerts Grid or Success State */}
//         {alerts.length === 0 ? (
//           <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border-2 border-green-200 p-12 text-center shadow-lg">
//             <div className="inline-flex p-4 bg-green-100 rounded-full mb-4">
//               <CheckCircle className="text-green-600" size={48} />
//             </div>
//             <h2 className="text-3xl font-bold text-green-900 mb-2">
//               All Systems Active
//             </h2>
//             <p className="text-green-700 text-lg">
//               Great news! All entities are actively logging data. No alerts at this time.
//             </p>
//           </div>
//         ) : (
//           <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
//             {alerts.map((entity) => (
//               <div
//                 key={entity._id}
//                 className="group bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-200 hover:border-red-300"
//               >
//                 {/* Alert Indicator Bar */}
//                 <div className="h-2 bg-gradient-to-r from-red-500 to-orange-500"></div>
                
//                 <div className="p-6">
//                   {/* Alert Icon */}
//                   <div className="flex items-start justify-between mb-4">
//                     <div className="p-2 bg-red-50 rounded-lg">
//                       <AlertTriangle className="text-red-600" size={24} />
//                     </div>
//                     <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
//                       INACTIVE
//                     </span>
//                   </div>

//                   {/* Entity Info */}
//                   <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-red-600 transition-colors">
//                     {entity.name}
//                   </h3>
                  
//                   <div className="space-y-2 mb-4">
//                     <div className="flex items-center gap-2 text-gray-600">
//                       <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
//                       <span className="text-sm font-medium">{entity.role}</span>
//                     </div>
//                     <div className="flex items-center gap-2 text-gray-500">
//                       <span className="w-2 h-2 bg-gray-300 rounded-full"></span>
//                       <span className="text-sm">{entity.department || "No Department"}</span>
//                     </div>
//                     <div className="flex items-center gap-2 text-blue-500">
//                       <span className="w-2 h-2 bg-gray-300 rounded-full"></span>
//                       <span className="text-sm">{entity.last_activity || "No Last Activity"}</span>
//                     </div>
//                   </div>

//                   {/* Action Button */}
//                   <button
//                     onClick={() => navigate(`/timeline/${entity.card_id}`)}
//                     className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium shadow-md hover:shadow-lg"
//                   >
//                     <Eye size={18} />
//                     View Timeline
//                   </button>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default AlertsPage;














// src/pages/AlertsPage.jsx
import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { AlertTriangle, Menu, X, Filter, Building } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import AlertsPageSkeleton from "./AlertsPageSkeleton";

const AlertsPage = () => {
  // --- STATE MANAGEMENT ---
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  // New state for filters
  const [entityTypeFilter, setEntityTypeFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [filteredAlerts, setFilteredAlerts] = useState([]);

  // --- DATA FETCHING ---
  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/alerts/inactive");
        setAlerts(res.data.alerts);
        setFilteredAlerts(res.data.alerts); // Initialize filtered list
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    // Timeout helps ensure the skeleton appears on fast connections
    setTimeout(() => {
      fetchAlerts();
    }, 150); // Small delay to see skeleton
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

  // --- DERIVED STATE FOR FILTER OPTIONS (prevents recalculation on every render) ---
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
              <h1 className="text-2xl font-bold">Campus Security Dashboard</h1>
      
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
                        onClick={() => navigate(`/timeline/${entity.card_id}`)}
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