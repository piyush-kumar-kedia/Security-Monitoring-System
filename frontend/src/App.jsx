import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import AlertsPage from "./pages/AlertsPage";
import TimelinePage from "./pages/TimelinePage";
import EntitiesPage from "./pages/EntitiesPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/alerts" element={<AlertsPage />} />
        <Route path="/timeline/:entityId" element={<TimelinePage />} />
        <Route path="/entity" element={<EntitiesPage />} />
      </Routes>
    </Router>
  );
}

export default App;
