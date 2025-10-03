import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

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

  useEffect(() => {
    const fetchEntities = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/entity");
        setEntities(res.data);
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
    if (searchRoll && !(entity.identifiers?.studentId?.toString().includes(searchRoll))) return false;
    if (categoryFilter && entity.entityType !== categoryFilter) return false;

    if (startDate || endDate) {
      const timeline = timelines[entity._id] || [];
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

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Page Heading */}
      <h1 className="text-5xl font-extrabold mb-8 text-gray-900 border-b-4 border-blue-500 inline-block pb-2">
        Entities
      </h1>

      {/* Search & Filters */}
      <div className="bg-white p-6 rounded-2xl shadow-md mb-6 flex flex-wrap gap-4 items-center">
        <input
          type="text"
          placeholder="Search by name"
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          className="border p-3 rounded-lg flex-1 focus:ring-2 focus:ring-blue-400 focus:outline-none shadow-sm"
        />
        <input
          type="text"
          placeholder="Search by Roll Number"
          value={searchRoll}
          onChange={(e) => setSearchRoll(e.target.value)}
          className="border p-3 rounded-lg flex-1 focus:ring-2 focus:ring-blue-400 focus:outline-none shadow-sm"
        />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="border p-3 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none shadow-sm"
        >
          <option value="">All Categories</option>
          <option value="student">Student</option>
          <option value="staff">Staff</option>
          <option value="asset">Asset</option>
          <option value="device">Device</option>
        </select>

        <div className="flex gap-2 items-center">
          <DatePicker
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            selectsStart
            startDate={startDate}
            endDate={endDate}
            placeholderText="From Date"
            className="border p-2 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none shadow-sm"
          />
          <DatePicker
            selected={endDate}
            onChange={(date) => setEndDate(date)}
            selectsEnd
            startDate={startDate}
            endDate={endDate}
            minDate={startDate}
            placeholderText="To Date"
            className="border p-2 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none shadow-sm"
          />
          {(startDate || endDate) && (
            <button
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition shadow"
              onClick={() => {
                setStartDate(null);
                setEndDate(null);
              }}
            >
              Clear Dates
            </button>
          )}
        </div>
      </div>

      {/* Entities Table */}
      <div className="overflow-x-auto rounded-xl shadow-lg border border-gray-200">
        <table className="min-w-full border-collapse">
          <thead className="bg-gradient-to-r from-blue-100 to-purple-100">
            <tr>
              <th className="p-3 text-left font-semibold text-gray-800 border-b border-gray-300">Name</th>
              <th className="p-3 text-left font-semibold text-gray-800 border-b border-gray-300">Roll Number</th>
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
  <td className="p-3 border-b border-gray-200 text-gray-900 font-medium">{entity.name || "-"}</td>

  <td className="p-3 border-b border-gray-200 text-gray-700">
    {entity.entityType === "student"
      ? entity.identifiers?.studentId || "-"
      : entity.identifiers?.cardId || "-"}
  </td>

  <td className="p-3 border-b border-gray-200">
    <span
      className={`px-3 py-1 rounded-full text-sm font-semibold ${
        entityColors[entity.entityType] || "bg-gray-100 text-gray-800"
      }`}
    >
      {entity.entityType || "-"}
    </span>
  </td>

  <td className="p-3 border-b border-gray-200 text-center">
    <button
      className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition font-medium shadow-sm"
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
        <div className="flex justify-center mt-6 gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
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
    </div>
  );
};

export default EntitiesPage;
