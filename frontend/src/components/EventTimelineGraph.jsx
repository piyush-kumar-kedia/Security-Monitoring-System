import React, { useState, useRef, useEffect } from 'react';
import { Clock, MapPin, Calendar } from 'lucide-react';

const EventTimelineGraph = ({ timeline }) => {
  const [hoveredEvent, setHoveredEvent] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const svgRef = useRef(null);

  // Graph dimensions
  const width = 1000;
  const height = 500;
  const padding = { top: 40, right: 40, bottom: 80, left: 100 };
  const graphWidth = width - padding.left - padding.right;
  const graphHeight = height - padding.top - padding.bottom;

  if (!timeline || timeline.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 text-center border border-gray-200">
        <p className="text-gray-500">No timeline data available to display</p>
      </div>
    );
  }

  // Get unique locations and sort timeline by timestamp
  const sortedTimeline = [...timeline].sort((a, b) => 
    new Date(a.timestamp) - new Date(b.timestamp)
  );
  
  const uniqueLocations = [...new Set(sortedTimeline.map(e => e.location_id))];
  const locationMap = Object.fromEntries(
    uniqueLocations.map((loc, idx) => [loc, idx])
  );

  // Time scale
  const timestamps = sortedTimeline.map(e => new Date(e.timestamp).getTime());
  const minTime = Math.min(...timestamps);
  const maxTime = Math.max(...timestamps);
  const timeRange = maxTime - minTime || 1;

  // Convert timestamp to x coordinate
  const getX = (timestamp) => {
    const time = new Date(timestamp).getTime();
    return padding.left + ((time - minTime) / timeRange) * graphWidth;
  };

  // Convert location to y coordinate
  const getY = (location) => {
    const index = locationMap[location];
    return padding.top + (index / Math.max(uniqueLocations.length - 1, 1)) * graphHeight;
  };

  // Get color based on source
  const getSourceColor = (source) => {
    const colors = {
      access_logs: '#3b82f6',
      email: '#10b981',
      meeting: '#8b5cf6',
      security: '#ef4444',
      default: '#6b7280'
    };
    return colors[source] || colors.default;
  };

  // Generate time axis labels
  const generateTimeLabels = () => {
    const labels = [];
    const labelCount = 6;
    for (let i = 0; i < labelCount; i++) {
      const time = minTime + (timeRange * i) / (labelCount - 1);
      const date = new Date(time);
      labels.push({
        x: padding.left + (graphWidth * i) / (labelCount - 1),
        text: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
      });
    }
    return labels;
  };

  const timeLabels = generateTimeLabels();

  // Handle mouse move for tooltip positioning
  const handleMouseMove = (e, event) => {
    if (svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect();
      setTooltipPos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
    setHoveredEvent(event);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 mb-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg">
          <Calendar size={24} className="text-white" />
        </div>
        <h3 className="text-2xl font-bold text-gray-800">Timeline Visualization</h3>
      </div>

      <div className="relative overflow-x-auto overflow-y-visible">
        <div style={{ overflowX: 'auto', overflowY: 'visible' }}>
          <svg
            ref={svgRef}
            width={width}
            height={height}
            className="mx-auto"
            style={{ minWidth: '800px', display: 'block' }}
          >
          {/* Grid lines */}
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#f0f0f0" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect 
            x={padding.left} 
            y={padding.top} 
            width={graphWidth} 
            height={graphHeight} 
            fill="url(#grid)" 
          />

          {/* Axes */}
          <line
            x1={padding.left}
            y1={padding.top + graphHeight}
            x2={padding.left + graphWidth}
            y2={padding.top + graphHeight}
            stroke="#374151"
            strokeWidth="2"
          />
          <line
            x1={padding.left}
            y1={padding.top}
            x2={padding.left}
            y2={padding.top + graphHeight}
            stroke="#374151"
            strokeWidth="2"
          />

          {/* Y-axis labels (locations) */}
          {uniqueLocations.map((location, idx) => (
            <g key={location}>
              <line
                x1={padding.left - 5}
                y1={getY(location)}
                x2={padding.left}
                y2={getY(location)}
                stroke="#374151"
                strokeWidth="2"
              />
              <text
                x={padding.left - 10}
                y={getY(location)}
                textAnchor="end"
                alignmentBaseline="middle"
                className="text-sm font-medium"
                fill="#374151"
              >
                {location}
              </text>
              {/* Horizontal grid line */}
              <line
                x1={padding.left}
                y1={getY(location)}
                x2={padding.left + graphWidth}
                y2={getY(location)}
                stroke="#e5e7eb"
                strokeWidth="1"
                strokeDasharray="4,4"
              />
            </g>
          ))}

          {/* X-axis labels (time) */}
          {timeLabels.map((label, idx) => (
            <g key={idx}>
              <line
                x1={label.x}
                y1={padding.top + graphHeight}
                x2={label.x}
                y2={padding.top + graphHeight + 5}
                stroke="#374151"
                strokeWidth="2"
              />
              <text
                x={label.x}
                y={padding.top + graphHeight + 20}
                textAnchor="middle"
                className="text-xs"
                fill="#374151"
              >
                {label.text.split(' ')[0]}
              </text>
              <text
                x={label.x}
                y={padding.top + graphHeight + 35}
                textAnchor="middle"
                className="text-xs"
                fill="#6b7280"
              >
                {label.text.split(' ').slice(1).join(' ')}
              </text>
            </g>
          ))}

          {/* Axis labels */}
          <text
            x={width / 2}
            y={height - 10}
            textAnchor="middle"
            className="text-sm font-semibold"
            fill="#1f2937"
          >
            Time
          </text>
          <text
            x={20}
            y={height / 2}
            textAnchor="middle"
            transform={`rotate(-90, 20, ${height / 2})`}
            className="text-sm font-semibold"
            fill="#1f2937"
          >
            Location / Event
          </text>

          {/* Connection lines */}
          {sortedTimeline.slice(0, -1).map((event, idx) => {
            const nextEvent = sortedTimeline[idx + 1];
            return (
              <line
                key={`line-${idx}`}
                x1={getX(event.timestamp)}
                y1={getY(event.location_id)}
                x2={getX(nextEvent.timestamp)}
                y2={getY(nextEvent.location_id)}
                stroke="#cbd5e1"
                strokeWidth="2"
                strokeDasharray="5,5"
                opacity="0.5"
              />
            );
          })}

          {/* Data points */}
          {sortedTimeline.map((event, idx) => {
            const x = getX(event.timestamp);
            const y = getY(event.location_id);
            const color = getSourceColor(event.source);
            
            return (
              <g key={event.event_id || idx}>
                {/* Glow effect on hover */}
                {hoveredEvent === event && (
                  <circle
                    cx={x}
                    cy={y}
                    r="12"
                    fill={color}
                    opacity="0.3"
                    className="animate-pulse"
                  />
                )}
                
                {/* Main point */}
                <circle
                  cx={x}
                  cy={y}
                  r="8"
                  fill={color}
                  stroke="white"
                  strokeWidth="3"
                  className="cursor-pointer transition-all duration-200"
                  style={{
                    filter: hoveredEvent === event ? 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))' : 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
                    transform: hoveredEvent === event ? 'scale(1.2)' : 'scale(1)',
                    transformOrigin: `${x}px ${y}px`
                  }}
                  onMouseEnter={(e) => handleMouseMove(e, event)}
                  onMouseMove={(e) => handleMouseMove(e, event)}
                  onMouseLeave={() => setHoveredEvent(null)}
                />
                
                {/* Event number */}
                <text
                  x={x}
                  y={y}
                  textAnchor="middle"
                  alignmentBaseline="middle"
                  className="text-xs font-bold pointer-events-none"
                  fill="white"
                >
                  {idx + 1}
                </text>
              </g>
            );
          })}
          </svg>
        </div>

        {/* Tooltip - Outside the scrollable area */}
        {hoveredEvent && (
          <div
            className="fixed bg-white rounded-lg shadow-2xl border-2 border-gray-200 p-4 pointer-events-none z-50"
            style={{
              left: `${tooltipPos.x + 15}px`,
              top: `${tooltipPos.y - 10}px`,
              minWidth: '280px',
              maxWidth: '350px',
              transform: tooltipPos.x > width - 300 ? 'translateX(-100%) translateX(-30px)' : 'none'
            }}
          >
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-200">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: getSourceColor(hoveredEvent.source) }}
              />
              <span className="font-bold text-gray-800 uppercase text-sm">
                {hoveredEvent.source.replace('_', ' ')}
              </span>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <MapPin size={16} className="text-purple-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-500 font-medium">Location</p>
                  <p className="text-sm text-gray-800 font-semibold">{hoveredEvent.location_id}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <Clock size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-500 font-medium">Timestamp</p>
                  <p className="text-sm text-gray-800">{new Date(hoveredEvent.timestamp).toLocaleString()}</p>
                </div>
              </div>
              
              {hoveredEvent.summary && (
                <div className="pt-2 border-t border-gray-100">
                  <p className="text-xs text-gray-500 font-medium mb-1">Details</p>
                  <p className="text-sm text-gray-700 leading-relaxed">{hoveredEvent.summary}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <p className="text-sm font-semibold text-gray-700 mb-3">Event Sources:</p>
        <div className="flex flex-wrap gap-4">
          {['access_logs', 'email', 'meeting', 'security'].map(source => (
            <div key={source} className="flex items-center gap-2">
              <div 
                className="w-4 h-4 rounded-full border-2 border-white shadow"
                style={{ backgroundColor: getSourceColor(source) }}
              />
              <span className="text-sm text-gray-600 capitalize">
                {source.replace('_', ' ')}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EventTimelineGraph;