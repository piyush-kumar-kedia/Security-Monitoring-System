import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import EntitiesPageSkeleton from "./EntitiesPageSkeleton"; // Import the skeleton component

const EntitiesPage = () => {
  const [entities, setEntities] = useState([]);
  const [loading, setLoading] = useState(true); // Add loading state
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchName, setSearchName] = useState("");
  const [searchRoll, setSearchRoll] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [entitiesPerPage] = useState(10);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEntities = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/entity");
        setEntities(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false); // Set loading to false after fetch completes
      }
    };
    fetchEntities();
  }, []);

  // The filtering logic now includes the roll number search
  const filteredEntities = entities.filter(entity => {
    return (
      entity.name.toLowerCase().includes(searchName.toLowerCase()) &&
      // Check for roll number if the field exists on the entity
      (entity.rollNumber ? entity.rollNumber.toLowerCase().includes(searchRoll.toLowerCase()) : searchRoll === '') &&
      (categoryFilter ? entity.entityType === categoryFilter : true)
    );
  });

  const totalPages = Math.ceil(filteredEntities.length / entitiesPerPage);
  const currentEntities = filteredEntities.slice((currentPage - 1) * entitiesPerPage, currentPage * entitiesPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  
  const entityColors = {
    student: "bg-blue-100 text-blue-800",
    faculty: "bg-green-100 text-green-800",
    staff: "bg-yellow-100 text-yellow-800",
  };

  const navbarHeight = 'pt-16';
  const mobileMenuTop = 'top-16';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
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

      {/* Mobile Menu (Dropdown) */}
      {isMenuOpen && (
        <div className={`md:hidden bg-blue-700 text-white p-4 fixed w-full z-40 ${mobileMenuTop}`}>
          <Link to="/" className="block py-2 hover:bg-blue-600 rounded" onClick={() => setIsMenuOpen(false)}>Home</Link>
          <Link to="/alerts" className="block py-2 hover:bg-blue-600 rounded" onClick={() => setIsMenuOpen(false)}>Alerts</Link>
          <Link to="/entities" className="block py-2 hover:bg-blue-600 rounded" onClick={() => setIsMenuOpen(false)}>Entities</Link>
        </div>
      )}

      {/* Main content with padding */}
      <main className={navbarHeight}>
        {loading ? (
          <EntitiesPageSkeleton />
        ) : (
          <div className="p-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">
              Manage Entities
            </h1>

            {/* Filter Section */}
            <div className="mb-6 p-4 bg-white rounded-lg shadow-md grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-center">
              <input
                type="text"
                placeholder="Search by name..."
                className="p-2 border rounded-lg"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
              />
              <input
                type="text"
                placeholder="Search by roll no..."
                className="p-2 border rounded-lg"
                value={searchRoll}
                onChange={(e) => setSearchRoll(e.target.value)}
              />
              <select
                className="p-2 border rounded-lg"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="">All Categories</option>
                <option value="student">Student</option>
                <option value="faculty">Faculty</option>
                <option value="staff">Staff</option>
              </select>
              <div className="flex gap-2 lg:col-span-2">
                <DatePicker
                  selected={startDate}
                  onChange={(date) => setStartDate(date)}
                  selectsStart
                  startDate={startDate}
                  endDate={endDate}
                  placeholderText="Start Date"
                  className="p-2 border rounded-lg w-full"
                />
                <DatePicker
                  selected={endDate}
                  onChange={(date) => setEndDate(date)}
                  selectsEnd
                  startDate={startDate}
                  endDate={endDate}
                  minDate={startDate}
                  placeholderText="End Date"
                  className="p-2 border rounded-lg w-full"
                />
              </div>
            </div>

            {/* Entities Table */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
               <table className="min-w-full bg-white">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-3 text-left font-semibold text-gray-600">Name</th>
                    <th className="p-3 text-left font-semibold text-gray-600">Department</th>
                    <th className="p-3 text-center font-semibold text-gray-600">Category</th>
                    <th className="p-3 text-center font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentEntities.length > 0 ? (
                    currentEntities.map((entity) => (
                      <tr key={entity._id} className="hover:bg-gray-50 transition">
                        <td className="p-3 border-b border-gray-200">{entity.name}</td>
                        <td className="p-3 border-b border-gray-200">{entity.department || "-"}</td>
                        <td className="p-3 border-b border-gray-200 text-center">
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
                        No entities found for the current filters.
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
                        ? "bg-blue-500 text-white shadow"
                        : "bg-white hover:bg-gray-100"
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default EntitiesPage;