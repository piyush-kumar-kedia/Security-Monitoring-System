// frontend/src/components/ProtectedRoute.jsx
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("http://localhost:5000/auth/check", {
          method: "GET",
          credentials: "include", // send cookie
        });
        if (!res.ok) throw new Error("Not authenticated");
        setAuthenticated(true);
      } catch {
        setAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) return <p className="text-center mt-20">⏳ Checking authentication...</p>;
  if (!authenticated) return <Navigate to="/login" replace />;

  return children;
};

export default ProtectedRoute;