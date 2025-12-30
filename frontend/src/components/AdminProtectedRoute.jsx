import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

const AdminProtectedRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminAuth = async () => {
      try {
        const res = await fetch("http://localhost:5000/auth/check-admin", {
          method: "GET",
          credentials: "include",
        });
        if (!res.ok) {
          const data = await res.json();
          if (res.status === 403) {
            // User is authenticated but not admin
            setAuthenticated(true);
            setIsAdmin(false);
          } else {
            // User is not authenticated
            setAuthenticated(false);
            setIsAdmin(false);
          }
          throw new Error(data.message || "Not authorized");
        }
        setAuthenticated(true);
        setIsAdmin(true);
      } catch (error) {
        console.error("Admin auth check failed:", error);
      } finally {
        setLoading(false);
      }
    };

    checkAdminAuth();
  }, []);

  if (loading) return <p className="text-center mt-20">Checking authentication...</p>;
  if (!authenticated) return <Navigate to="/login" replace />;
  if (!isAdmin) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
        <p className="text-gray-700 mb-4">You do not have permission to access this page.</p>
        <p className="text-gray-600">Admin role required.</p>
        <button 
          onClick={() => window.location.href = '/'} 
          className="mt-6 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Go to Home
        </button>
      </div>
    </div>
  );

  return children;
};

export default AdminProtectedRoute;
