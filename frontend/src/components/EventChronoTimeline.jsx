import React from "react";
import { Chrono } from "react-chrono";

const EventChronoTimeline = ({ timeline }) => {
  // Transform your events into Chrono items
  const items = timeline.map(event => ({
    title: new Date(event.timestamp).toLocaleString(),
    cardTitle: event.source.replace(/_/g, " ").toUpperCase(),
    cardSubtitle: event.location_id || "Unknown Location",
    cardDetailedText: event.summary || "No additional details available",
    media: {
      type: "IMAGE",
      source: {
        url:
          event.source === "cctv_frames"
            ? "/icons/cctv.png"
            : event.source === "campus_card_swipes"
            ? "/icons/card.png"
            : event.source === "wifi_associations_logs"
            ? "/icons/wifi.png"
            : event.source === "lab_bookings"
            ? "/icons/lab.png"
            : "/icons/note.png"
      }
    }
  }));

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mt-12">
      <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        📅 Chronological Event Flow
      </h2>

      <div style={{ width: "100%", height: "600px" }}>
        <Chrono
          items={items}
          mode="VERTICAL_ALTERNATING"
          scrollable
          cardHeight={130}
          hideControls
          theme={{
            primary: "#2563eb",
            secondary: "#e0f2fe",
            cardBgColor: "#ffffff",
            titleColor: "#1e3a8a",
            titleColorActive: "#1d4ed8",
          }}
        />
      </div>
    </div>
  );
};

export default EventChronoTimeline;
