import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import AlertsPage from "./pages/AlertsPage";
import TimelinePage from "./pages/TimelinePage";
import EntitiesPage from "./pages/EntitiesPage";
import Login from "./pages/LoginPage";
import ProtectedRoute from "./components/ProtectedRoute";
import Register from "./pages/RegisterPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/"element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          } />
        <Route path="/login" element={<Login />} />
        <Route path="/alerts" element={
            <ProtectedRoute>
              <AlertsPage />
            </ProtectedRoute>
          } />
        <Route path="/timeline/:entityId" element={
            <ProtectedRoute>
              <TimelinePage />
            </ProtectedRoute>
          } />
        <Route path="/entity" element={
            <ProtectedRoute>
              <EntitiesPage />
            </ProtectedRoute>
          } />
          <Route path="/admin" element={
            <ProtectedRoute>
              <Register />
            </ProtectedRoute>
          }/>
      </Routes>
    </Router>
  );
}

export default App;