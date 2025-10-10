import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate,Link } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import {
  Search,
  Filter,
  Calendar,
  Users,
  ChevronRight,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  X,
  Eye,
  GraduationCap,
  Briefcase,
  Package,
  Smartphone,
  Menu
} from "lucide-react";

const EntitiesPage = () => {
  const [entities, setEntities] = useState([]);
  const [searchName, setSearchName] = useState("");
  const [searchRoll, setSearchRoll] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [entitiesPerPage] = useState(10);
  const [timelines, setTimelines] = useState({});
  const navigate = useNavigate();
  const[isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const fetchEntities = async () => {
      try {
        console.log("Fetching entities...");
        const res = await axios.get("http://localhost:5000/api/entity");
        setEntities(res.data);
        console.log(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchEntities();
  }, []);

  const fetchTimeline = async (entityId) => {
    if (timelines[entityId]) return timelines[entityId];
    try {
      const res = await axios.get(`http://localhost:5000/api/timeline/${entityId}`);
      const timelineEvents = res.data.timeline || [];
      setTimelines((prev) => ({ ...prev, [entityId]: timelineEvents }));
      return timelineEvents;
    } catch (err) {
      console.error(err);
      return [];
    }
  };

  const filteredEntities = entities.filter((entity) => {
    if (searchName && !(entity.name?.toLowerCase().includes(searchName.toLowerCase()))) return false;
    if (searchRoll && !(entity.card_id.includes(searchRoll))) return false;
    if (categoryFilter && entity.role !== categoryFilter) return false;

    // Date filtering
    if (startDate || endDate) {
      const timeline = timelines[entity.card_id];

      // If timeline is not loaded yet, skip this entity for now
      if (!timeline) return true;

      const hasEventInRange = timeline.some((event) => {
        const eventDate = new Date(event.timestamp);
        if (startDate && endDate) return eventDate >= startDate && eventDate <= endDate;
        if (startDate) return eventDate >= startDate;
        if (endDate) return eventDate <= endDate;
        return true;
      });

      if (!hasEventInRange) return false;
    }

    return true;
});

const indexOfLastEntity = currentPage * entitiesPerPage;
const indexOfFirstEntity = indexOfLastEntity - entitiesPerPage;
const currentEntities = filteredEntities.slice(indexOfFirstEntity, indexOfLastEntity);
const totalPages = Math.ceil(filteredEntities.length / entitiesPerPage);

const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

// useEffect(() => {
//   currentEntities.forEach((entity) => {
//     if (!timelines[entity.card_id]) fetchTimeline(entity.card_id);
//   });
//   console.log('timeline: ', timelines);
// }, [currentEntities]);

const entityConfig = {
  student: {
    color: "bg-blue-500",
    lightColor: "bg-blue-50",
    textColor: "text-blue-700",
    borderColor: "border-blue-200",
    icon: GraduationCap
  },
  staff: {
    color: "bg-green-500",
    lightColor: "bg-green-50",
    textColor: "text-green-700",
    borderColor: "border-green-200",
    icon: Briefcase
  },
  faculty: {
    color: "bg-amber-500",
    lightColor: "bg-amber-50",
    textColor: "text-amber-700",
    borderColor: "border-amber-200",
    icon: Package
  },
  
};

const hasActiveFilters = searchName || searchRoll || categoryFilter || startDate || endDate;

const clearAllFilters = () => {
  setSearchName("");
  setSearchRoll("");
  setCategoryFilter("");
  setStartDate(null);
  setEndDate(null);
  setCurrentPage(1);
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


return (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
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
    <div className="max-w-7xl mx-auto p-6 mt-10">
      {/* Header Section */}
      
      <div className="mb-8">
        {/* Header */}
      

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <p className="text-gray-500 text-sm font-medium">Total Entities</p>
            <p className="text-2xl font-bold text-gray-900">{entities.length}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <p className="text-gray-500 text-sm font-medium">Filtered Results</p>
            <p className="text-2xl font-bold text-blue-600">{filteredEntities.length}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <p className="text-gray-500 text-sm font-medium">Current Page</p>
            <p className="text-2xl font-bold text-gray-900">{currentPage} of {totalPages || 1}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <p className="text-gray-500 text-sm font-medium">Active Filters</p>
            <p className="text-2xl font-bold text-purple-600">
              {[searchName, searchRoll, categoryFilter, startDate, endDate].filter(Boolean).length}
            </p>
          </div>
        </div>
      </div>

      {/* Search & Filters Card */}
      <div className="bg-white rounded-2xl shadow-lg mb-6 overflow-hidden border border-gray-100">
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-white">
              <Filter size={24} />
              <h2 className="text-xl font-bold">Search & Filter</h2>
            </div>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="flex items-center gap-2 bg-white bg-opacity-20 hover:bg-opacity-30 text-blue px-4 py-2 rounded-lg transition font-medium"
              >
                <X size={16} />
                Clear All
              </button>
            )}
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            {/* Name Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by name..."
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition"
              />
            </div>

            {/* Roll Number Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by Roll/ID..."
                value={searchRoll}
                onChange={(e) => setSearchRoll(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition"
              />
            </div>

            {/* Category Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition appearance-none bg-white cursor-pointer"
              >
                <option value="">All Categories</option>
                <option value="student">Student</option>
                <option value="staff">Staff</option>
                <option value="faculty">Faculty</option>
              </select>
            </div>
          </div>

          
        </div>
      </div>

      {/* Entities Table */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gradient-to-r from-gray-50 to-blue-50 border-b-2 border-gray-200">
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                  Entity Details
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                  Card ID
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-4 text-center text-sm font-bold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {currentEntities.length > 0 ? (
                currentEntities.map((entity, idx) => {
                  const config = entityConfig[entity.role] || entityConfig.student;
                  const Icon = config.icon;

                  return (
                    <tr
                      key={entity._id}
                      className="hover:bg-blue-50 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 ${config.lightColor} rounded-lg`}>
                            <Icon size={24} className={config.textColor} />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{entity.name || "-"}</p>
                            <p className="text-sm text-gray-500">{entity.department || "No department"}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <p className="font-mono text-sm font-medium text-gray-700">
                          {/* {entity.role === "student"
                              ? entity.student_id || "-"
                              : entity.card_id || "-"} */}
                          {entity.card_id || '-'}
                        </p>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${config.lightColor} ${config.textColor} border ${config.borderColor}`}
                        >
                          <Icon size={14} />
                          {entity.role || "-"}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-center">
                        <button
                          className="inline-flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition font-medium shadow-sm group-hover:shadow-md"
                          onClick={() => navigate(`/timeline/${entity.entity_id}`)}
                        >
                          <Eye size={16} />
                          View Timeline
                          <ChevronRight size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="p-4 bg-gray-100 rounded-full">
                        <Users size={48} className="text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-700">No entities found</h3>
                      <p className="text-gray-500">Try adjusting your search or filter criteria</p>
                      {hasActiveFilters && (
                        <button
                          onClick={clearAllFilters}
                          className="mt-2 text-blue-600 hover:text-blue-700 font-medium"
                        >
                          Clear all filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Enhanced Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 bg-white rounded-xl shadow-md p-4 border border-gray-100">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing <span className="font-semibold">{indexOfFirstEntity + 1}</span> to{" "}
              <span className="font-semibold">{Math.min(indexOfLastEntity, filteredEntities.length)}</span> of{" "}
              <span className="font-semibold">{filteredEntities.length}</span> results
            </p>

            <div className="flex gap-2">
              {/* First Page */}
              <button
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
                className={`p-2 rounded-lg transition ${currentPage === 1
                    ? "text-gray-300 cursor-not-allowed"
                    : "text-gray-700 hover:bg-gray-100"
                  }`}
              >
                <ChevronsLeft size={20} />
              </button>

              {/* Previous Page */}
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`p-2 rounded-lg transition ${currentPage === 1
                    ? "text-gray-300 cursor-not-allowed"
                    : "text-gray-700 hover:bg-gray-100"
                  }`}
              >
                <ChevronLeft size={20} />
              </button>

              {/* Page Numbers */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-4 py-2 rounded-lg font-medium transition ${pageNum === currentPage
                        ? "bg-blue-500 text-white shadow-md"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              {/* Next Page */}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`p-2 rounded-lg transition ${currentPage === totalPages
                    ? "text-gray-300 cursor-not-allowed"
                    : "text-gray-700 hover:bg-gray-100"
                  }`}
              >
                <ChevronRight size={20} />
              </button>

              {/* Last Page */}
              <button
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
                className={`p-2 rounded-lg transition ${currentPage === totalPages
                    ? "text-gray-300 cursor-not-allowed"
                    : "text-gray-700 hover:bg-gray-100"
                  }`}
              >
                <ChevronsRight size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
);
};

export default EntitiesPage;