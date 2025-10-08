import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import EntitiesPageSkeleton from "./EntitiesPageSkeleton";

const EntitiesPage = () => {
  const [entities, setEntities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchName, setSearchName] = useState("");
  const [searchRoll, setSearchRoll] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [entitiesPerPage] = useState(10);
  const [timelines, setTimelines] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEntities = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/entity");
        setEntities(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
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
    if (searchRoll && !(entity.identifiers?.studentId?.toString().includes(searchRoll) ||
                        entity.identifiers?.cardId?.toString().includes(searchRoll))) return false;
    if (categoryFilter && entity.entityType !== categoryFilter) return false;

    if (startDate || endDate) {
      const timeline = timelines[entity._id] || [];
      const hasEventInRange = timeline.some((event) => {
        const eventDate = new Date(event.timestamp);
        if (startDate && endDate)
          return eventDate >= startDate && eventDate <= new Date(endDate.getTime() + 86400000 - 1);
        if (startDate) return eventDate >= startDate;
        if (endDate) return eventDate <= new Date(endDate.getTime() + 86400000 - 1);
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

  useEffect(() => {
    currentEntities.forEach((entity) => {
      if (!timelines[entity._id]) fetchTimeline(entity._id);
    });
  }, [currentEntities]);

  const entityColors = {
    student: "bg-blue-100 text-blue-800",
    staff: "bg-green-100 text-green-800",
    asset: "bg-yellow-100 text-yellow-800",
    device: "bg-purple-100 text-purple-800",
  };

  if (loading) return <EntitiesPageSkeleton />;

  return (
    <>
      {/* Navbar */}
      <nav className="bg-blue-600 text-white p-4 flex justify-between items-center shadow-md fixed top-0 w-full z-50">
        <h1 className="text-2xl font-bold tracking-wide">Campus Security Dashboard</h1>
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

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-blue-700 text-white p-4 fixed w-full top-16 z-40">
          <Link to="/" className="block py-2 hover:bg-blue-600 rounded" onClick={() => setIsMenuOpen(false)}>Home</Link>
          <Link to="/alerts" className="block py-2 hover:bg-blue-600 rounded" onClick={() => setIsMenuOpen(false)}>Alerts</Link>
          <Link to="/entities" className="block py-2 hover:bg-blue-600 rounded" onClick={() => setIsMenuOpen(false)}>Entities</Link>
        </div>
      )}

      {/* Page Content */}
      <main className="pt-24 pb-10 px-3 sm:px-6 md:px-8 lg:px-12 max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b-4 border-blue-500 inline-block pb-2">
          Entities
        </h2>

        {/* Filters */}
        <div className="bg-white p-6 rounded-2xl shadow-md mb-6 flex flex-wrap gap-4 items-center justify-between">
          <input
            type="text"
            placeholder="Search by Name"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            className="border p-3 rounded-lg flex-1 min-w-[150px] focus:ring-2 focus:ring-blue-400 focus:outline-none shadow-sm"
          />
          <input
            type="text"
            placeholder="Search by Identity Number"
            value={searchRoll}
            onChange={(e) => setSearchRoll(e.target.value)}
            className="border p-3 rounded-lg flex-1 min-w-[150px] focus:ring-2 focus:ring-blue-400 focus:outline-none shadow-sm"
          />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="border p-3 rounded-lg min-w-[150px] focus:ring-2 focus:ring-blue-400 focus:outline-none shadow-sm"
          >
            <option value="">All Categories</option>
            <option value="student">Student</option>
            <option value="staff">Staff</option>
            <option value="asset">Asset</option>
            <option value="device">Device</option>
          </select>

          <div className="flex flex-wrap gap-2 items-center">
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              selectsStart
              startDate={startDate}
              endDate={endDate}
              placeholderText="From Date"
              className="border p-2 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none shadow-sm w-[140px]"
            />
            <DatePicker
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              minDate={startDate}
              placeholderText="To Date"
              className="border p-2 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none shadow-sm w-[140px]"
            />
            {(startDate || endDate) && (
              <button
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition shadow"
                onClick={() => {
                  setStartDate(null);
                  setEndDate(null);
                }}
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl shadow-lg border border-gray-200">
          <table className="min-w-full border border-gray-300 rounded-lg overflow-hidden">
            <thead className="bg-gradient-to-r from-blue-100 to-purple-100 text-sm sm:text-base">
              <tr>
                <th className="p-3 text-left font-semibold text-gray-800 border-b border-gray-300">Name</th>
                <th className="p-3 text-left font-semibold text-gray-800 border-b border-gray-300">Identity Number</th>
                <th className="p-3 text-left font-semibold text-gray-800 border-b border-gray-300">Category</th>
                <th className="p-3 text-center font-semibold text-gray-800 border-b border-gray-300">Timeline</th>
              </tr>
            </thead>
            <tbody>
              {currentEntities.length > 0 ? (
                currentEntities.map((entity, idx) => (
                  <tr
                    key={entity._id}
                    className={`${idx % 2 === 0 ? "bg-gray-50" : "bg-white"} hover:bg-gray-100 transition`}
                  >
                    <td className="p-3 border-b border-gray-200 text-gray-900 font-medium text-sm sm:text-base">
                      {entity.name || "-"}
                    </td>
                    <td className="p-3 border-b border-gray-200 text-gray-700 text-sm sm:text-base">
                      {entity.entityType === "student"
                        ? entity.identifiers?.studentId || "-"
                        : entity.identifiers?.cardId || "-"}
                    </td>
                    <td className="p-3 border-b border-gray-200 text-sm sm:text-base">
                      <span
                        className={`px-3 py-1 rounded-full text-xs sm:text-sm font-semibold ${
                          entityColors[entity.entityType] || "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {entity.entityType || "-"}
                      </span>
                    </td>
                    <td className="p-3 border-b border-gray-200 text-center">
                      <button
                        className="bg-blue-500 text-white text-xs sm:text-sm px-3 sm:px-4 py-2 rounded-lg hover:bg-blue-600 transition font-medium shadow-sm whitespace-nowrap"
                        onClick={() => navigate(`/timeline/${entity._id}`)}
                      >
                        View Timeline →
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center p-6 text-gray-500">
                    No entities found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-6 gap-2 flex-wrap">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  page === currentPage
                    ? "bg-blue-500 text-white"
                    : "border bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                {page}
              </button>
            ))}
          </div>
        )}
      </main>
    </>
  );
};

export default EntitiesPage;
