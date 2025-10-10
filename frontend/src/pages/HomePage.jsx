// // src/pages/HomePage.jsx
// import React, { useEffect, useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import axios from "axios";
// import { Bell, Users, Database, Activity, AlertTriangle, TrendingUp, Shield, Search, Filter, ChevronRight, X, Menu } from "lucide-react";
// import HomePageSkeleton from "./HomePageSkeleton";

// const HomePage = () => {
//   const [entities, setEntities] = useState([]);
//   const [searchName, setSearchName] = useState("");
//   const [searchRoll, setSearchRoll] = useState("");
//   const [categoryFilter, setCategoryFilter] = useState("");
//   const [startDate, setStartDate] = useState(null);
//   const [endDate, setEndDate] = useState(null);
//   const [alerts, setAlerts] = useState([]);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [filterType, setFilterType] = useState("all");
//   const navigate = useNavigate();
//   const [loading, setLoading] = useState(true);
//   const [isMenuOpen, setIsMenuOpen] = useState(false);

//   useEffect(() => {
//     const fetchEntities = async () => {
//       try {
//         const res = await axios.get("http://localhost:5000/api/entity");
//         setEntities(res.data);
//       } catch (err) {
//         console.error(err);
//       }
//     };

//     const fetchAlerts = async () => {
//       try {
//         const res = await axios.get("http://localhost:5000/api/alerts/inactive");
//         setAlerts(res.data.alerts);
//       } catch (err) {
//         console.error(err);
//       }
//     };

//     fetchEntities();
//     fetchAlerts();
//   }, []);

//   const hasActiveFilters = searchName || searchRoll || categoryFilter || startDate || endDate;

//   const clearAllFilters = () => {
//     setSearchName("");
//     setSearchRoll("");
//     setCategoryFilter("");
//     setStartDate(null);
//     setEndDate(null);
//     setCurrentPage(1);
//   };


//   const filteredEntities = entities.filter((entity) => {
//     if (searchName && !(entity.name?.toLowerCase().includes(searchName.toLowerCase()))) return false;
//     if (searchRoll && !(entity.card_id.includes(searchRoll))) return false;
//     if (categoryFilter && entity.role !== categoryFilter) return false;

//     // Date filtering
//     if (startDate || endDate) {
//       const timeline = timelines[entity.card_id];

//       // If timeline is not loaded yet, skip this entity for now
//       if (!timeline) return true;

//       const hasEventInRange = timeline.some((event) => {
//         const eventDate = new Date(event.timestamp);
//         if (startDate && endDate) return eventDate >= startDate && eventDate <= endDate;
//         if (startDate) return eventDate >= startDate;
//         if (endDate) return eventDate <= endDate;
//         return true;
//       });

//       if (!hasEventInRange) return false;
//     }

//     return true;
//   });

//   const entityTypes = [...new Set(entities.map(e => e.entityType))];

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
//       {/* Modern Navbar */}
//       {/* Header */}
//       <nav className="bg-blue-600 text-white p-4 flex justify-between items-center shadow-md fixed top-0 w-full z-50">
//         <h1 className="text-2xl font-bold">Campus Security Dashboard</h1>

//         <div className="hidden md:flex gap-6">
//           <Link to="/" className="hover:underline">Home</Link>
//           <Link to="/alerts" className="hover:underline">Alerts</Link>
//           <Link to="/entity" className="hover:underline">Entities</Link>
//         </div>

//         <div className="md:hidden">
//           <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
//             {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
//           </button>
//         </div>
//       </nav>

//       {isMenuOpen && (
//         <div className="md:hidden bg-blue-700 text-white p-4 fixed w-full top-16 z-40">
//           <Link to="/" className="block py-2 hover:bg-blue-600 rounded" onClick={() => setIsMenuOpen(false)}>Home</Link>
//           <Link to="/alerts" className="block py-2 hover:bg-blue-600 rounded" onClick={() => setIsMenuOpen(false)}>Alerts</Link>
//           <Link to="/entity" className="block py-2 hover:bg-blue-600 rounded" onClick={() => setIsMenuOpen(false)}>Entities</Link>
//         </div>
//       )}


//       <div className="max-w-7xl mx-auto px-6 py-8">
//         {/* Hero Stats Section */}
//         <div className="mb-10">
//           <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
//             <TrendingUp className="text-blue-600" size={24} />
//             Overview
//           </h2>
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//             <Link to="/entity" className="group">
//               <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
//                 <div className="flex items-center justify-between mb-3">
//                   <div className="p-2 bg-white bg-opacity-20 rounded-lg backdrop-blur-sm">
//                     <Users size={24} className="opacity-90" />
//                   </div>
//                   <ChevronRight size={20} className="opacity-60 group-hover:opacity-100 transition" />
//                 </div>
//                 <p className="text-3xl font-bold mb-1">{entities.length}</p>
//                 <p className="text-blue-100 text-sm font-medium">Total Entities</p>
//               </div>
//             </Link>

//             <Link to="/alerts" className="group">
//               <div className="bg-gradient-to-br from-red-500 to-rose-600 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
//                 <div className="flex items-center justify-between mb-3">
//                   <div className="p-2 bg-white bg-opacity-20 rounded-lg backdrop-blur-sm">
//                     <AlertTriangle size={24} className="opacity-90" />
//                   </div>
//                   <ChevronRight size={20} className="opacity-60 group-hover:opacity-100 transition" />
//                 </div>
//                 <p className="text-3xl font-bold mb-1">{alerts.length}</p>
//                 <p className="text-red-100 text-sm font-medium">Active Alerts</p>
//               </div>
//             </Link>

//             <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white p-6 rounded-xl shadow-lg">
//               <div className="flex items-center justify-between mb-3">
//                 <div className="p-2 bg-white bg-opacity-20 rounded-lg backdrop-blur-sm">
//                   <Activity size={24} className="opacity-90" />
//                 </div>
//               </div>
//               <p className="text-3xl font-bold mb-1">{filteredEntities.length}</p>
//               <p className="text-indigo-100 text-sm font-medium">Filtered Results</p>
//             </div>
//           </div>
//         </div>

//         {/* Search and Filter Section */}
//         <div className="bg-white rounded-2xl shadow-lg mb-6 overflow-hidden border border-gray-100">
//           <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4">
//             <div className="flex items-center justify-between">
//               <div className="flex items-center gap-3 text-white">
//                 <Filter size={24} />
//                 <h2 className="text-xl font-bold">Search & Filter</h2>
//               </div>
//               {hasActiveFilters && (
//                 <button
//                   onClick={clearAllFilters}
//                   className="flex items-center gap-2 bg-white bg-opacity-20 hover:bg-opacity-30 text-blue px-4 py-2 rounded-lg transition font-medium"
//                 >
//                   <X size={16} />
//                   Clear All
//                 </button>
//               )}
//             </div>
//           </div>

//           <div className="p-6">
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
//               {/* Name Search */}
//               <div className="relative">
//                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
//                 <input
//                   type="text"
//                   placeholder="Search by name..."
//                   value={searchName}
//                   onChange={(e) => setSearchName(e.target.value)}
//                   className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition"
//                 />
//               </div>

//               {/* Roll Number Search */}
//               <div className="relative">
//                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
//                 <input
//                   type="text"
//                   placeholder="Search by Roll/ID..."
//                   value={searchRoll}
//                   onChange={(e) => setSearchRoll(e.target.value)}
//                   className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition"
//                 />
//               </div>

//               {/* Category Filter */}
//               <div className="relative">
//                 <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
//                 <select
//                   value={categoryFilter}
//                   onChange={(e) => setCategoryFilter(e.target.value)}
//                   className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition appearance-none bg-white cursor-pointer"
//                 >
//                   <option value="">All Categories</option>
//                   <option value="student">Student</option>
//                   <option value="staff">Staff</option>
//                   <option value="asset">Asset</option>
//                   <option value="device">Device</option>
//                 </select>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Entities Grid */}
//         {filteredEntities.length === 0 ? (
//           <div className="bg-white p-12 rounded-2xl shadow-md text-center">
//             <div className="text-gray-300 mb-4">
//               <Users size={64} className="mx-auto" />
//             </div>
//             <h3 className="text-xl font-bold text-gray-700 mb-2">No Entities Found</h3>
//             <p className="text-gray-500">Try adjusting your search or filter criteria</p>
//           </div>
//         ) : (
//           <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
//             {filteredEntities.slice(0, 6).map((entity) => (
//               <div
//                 key={entity._id}
//                 className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border-l-4 border-blue-500 group cursor-pointer"
//                 onClick={() => navigate(`/timeline/${entity._id}`)}
//               >
//                 <div className="p-6">
//                   <div className="flex items-start justify-between mb-4">
//                     <div className="p-3 bg-blue-50 rounded-lg">
//                       <Users className="text-blue-600" size={24} />
//                     </div>
//                     <span className="bg-blue-100 text-blue-700 text-xs px-3 py-1 rounded-full font-semibold">
//                       ACTIVE
//                     </span>
//                   </div>
//                   <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition">
//                     {entity.name}
//                   </h3>
//                   <div className="space-y-1 mb-4">
//                     <p className="text-gray-600 text-sm">
//                       <span className="font-medium">Type:</span> {entity.role}
//                     </p>
//                     <p className="text-gray-600 text-sm">
//                       <span className="font-medium">Dept:</span> {entity.department || "Not specified"}
//                     </p>
//                   </div>
//                   <button
//                     className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 group-hover:gap-3 transition-all"
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       navigate(`/timeline/${entity.card_id}`);
//                     }}
//                   >
//                     View Timeline
//                     <ChevronRight size={18} />
//                   </button>

//                 </div>
//               </div>
//             ))}
//             <div className="mt-3 flex ">
//               <button
//                 onClick={() => navigate(`/entity`)}
//                 className="text-blue-600 text-sm font-medium hover:underline"
//               >
//                 View All →
//               </button>
//             </div>
//           </div>
//         )}

//         <br />
//         <br />

//         {/* Alerts Section */}
//         {alerts.length > 0 && (
//           <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
//             {alerts.slice(0, 6).map((entity) => (
//               <div
//                 key={entity.entity_id}
//                 className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border-l-4 border-red-500 group"
//               >
//                 <div className="p-6">
//                   <div className="flex items-start justify-between mb-4">
//                     <div className="p-3 bg-red-50 rounded-lg">
//                       <Bell className="text-red-600" size={24} />
//                     </div>
//                     <span className="bg-red-100 text-red-700 text-xs px-3 py-1 rounded-full font-semibold">
//                       INACTIVE
//                     </span>
//                   </div>
//                   <h3 className="text-xl font-bold text-gray-800 mb-2">{entity.name}</h3>
//                   <p className="text-gray-600 text-sm">
//                     <span className="font-medium">Last Activity:</span> {entity.last_activity || "No records"}
//                   </p>
//                   <button
//                     className="w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 group-hover:gap-3 transition-all mt-4"
//                     onClick={() => navigate(`/timeline/${entity.entity_id}`)}
//                   >
//                     View Timeline
//                     <ChevronRight size={18} />
//                   </button>
//                 </div>
//               </div>
//             ))}

//             <div className="mt-3 flex ">
//               <button
//                 onClick={() => navigate(`/alerts`)}
//                 className="text-blue-600 text-sm font-medium hover:underline"
//               >
//                 View All →
//               </button>
//             </div>
//           </div>
//         )}


//         {alerts.length === 0 && (
//           <div className="mb-10 bg-gradient-to-r from-green-50 to-emerald-50 p-8 rounded-2xl border-2 border-green-200">
//             <div className="flex items-center gap-4">
//               <div className="p-4 bg-green-100 rounded-full">
//                 <Shield className="text-green-600" size={32} />
//               </div>
//               <div>
//                 <h3 className="text-xl font-bold text-green-800">All Clear!</h3>
//                 <p className="text-green-700">No alerts detected. All entities are functioning normally.</p>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default HomePage;






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
          axios.get("http://localhost:5000/api/alerts/inactive"),
        ]);
        console.log('entities: ', entitiesRes);
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
    return (i?.role || i?.type || "").toLowerCase() === assetType.toLowerCase();
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

  const anyFilterActive = () => assetType !== "All" || search || startDate || endDate;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
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
                  className="border border-gray-300 p-2 rounded-lg focus:ring-2 min-w-[150px] sm:min-w-[200px] focus:ring-blue-500 w-full sm:w-auto"
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
                  className="border border-gray-300 p-2 rounded-lg min-w-[150px] sm:min-w-[600px] w-full sm:w-auto focus:ring-2 focus:ring-blue-500"
                />

                {/* <div className="flex flex-wrap gap-2 w-full sm:w-auto">
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
                </div> */}
              </div>

              <button
                onClick={clearFilters}
                disabled={!anyFilterActive()}
                className={`px-4 py-2 rounded-lg text-white font-medium transition mt-2 sm:mt-0 ${anyFilterActive()
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
                    const tagClass = typeColors[(a.role || a.type || "").toLowerCase()] || "bg-gray-100 text-gray-800";
                    return (
                      <div
                        key={a.card_id}
                        className="p-4 bg-red-50 border border-red-200 rounded-xl hover:shadow-md transition"
                      >
                        <h3 className="font-semibold text-gray-800 truncate">{a.name || a.title || "Unnamed Alert"}</h3>
                        <span className={`inline-block px-2 py-1 mt-1 rounded-full text-xs font-medium ${tagClass}`}>
                          {(a.role || a.type || "Unknown")}
                        </span>
                        <p className="text-xs text-gray-500 mt-2 ml-1 flex items-center gap-1">
                          <h3 className="font-semibold text-gray-800 truncate">{a.card_id|| 'None'}</h3>
                        </p>
                        <p className="text-xs text-gray-500 mt-2 ml-1 flex items-center gap-1">
                          <h3 className="font-semibold text-gray-800 truncate">{a.department|| 'None'}</h3>
                        </p>
                        <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                          <Clock size={14} /> Updated on: {a.last_activity.toLocaleString() || ""}
                        </p>
                        <div className="mt-3 flex justify-end">
                          <button
                            onClick={() => navigate(`/timeline/${a.card_id}`)}
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
                <Link to="/entity" className="text-blue-600 hover:underline font-medium">
                  View All →
                </Link>
              </div>
              {filteredEntities.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No entities found.</p>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredEntities.slice(0, 6).map((e) => {
                    const tagClass = typeColors[(e.role || "").toLowerCase()] || "bg-gray-100 text-gray-800";
                    return (
                      <div
                        key={e.card_id}
                        className={`p-4 bg-blue-50 border border-gray-200 rounded-xl hover:shadow-md transition`}
                      >
                        <h3 className="font-semibold text-gray-800 truncate">{e.name}</h3>
                        <span className={`inline-block px-2 py-1 mt-1 rounded-full text-xs font-medium ${tagClass}`}>
                          {e.role || "Unknown"}
                        </span>
                        <p className="text-xs text-gray-500 mt-2 ml-1 flex items-center gap-1">
                          Roll no: <h3 className="font-semibold text-gray-800 truncate">{e.student_id|| e.staff_id|| 'None'}</h3>
                        </p>
                        <p className="text-xs text-gray-500 mt-2 ml-1 flex items-center gap-1">
                          <h3 className="font-semibold text-gray-800 truncate">{e.department|| 'None'}</h3>
                        </p>
                        
                        <div className="mt-3 flex justify-end">
                          <button
                            onClick={() => navigate(`/timeline/${e.card_id}`)}
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