const Entity = require('../Models/Entity');
const Event = require('../Models/Event');

// @desc    Get the complete timeline for a specific entity
// @route   GET /api/timeline/:entityId
exports.getTimeline = async (req, res) => {
    try {
        const { entityId } = req.params;
        
        // Find all events for the given entity, sorted by time
        const events = await Event.find({ entityId }).sort({ timestamp: -1 });
        
        if (!events) {
            return res.status(404).json({ message: 'No events found for this entity.' });
        }

        // --- TODO ---
        // Add logic here to detect time gaps and call the Python ML service for prediction.
        // Add logic for timeline summarization.

        res.status(200).json({
            message: 'Timeline retrieved successfully.',
            count: events.length,
            timeline: events,
        });

    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Get entities that have not been seen in the last 12 hours
// @route   GET /api/alerts
exports.getAlerts = async (req, res) => {
    try {
        const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);

        // Find entities whose most recent event is older than 12 hours
        // This is a simplified query; a more robust solution might use aggregation pipelines.
        const recentEvents = await Event.find({ timestamp: { $gte: twelveHoursAgo } }).distinct('entityId');
        
        const inactiveEntities = await Entity.find({ _id: { $nin: recentEvents } });
        
        res.status(200).json({
            message: 'Alerts checked successfully.',
            count: inactiveEntities.length,
            alerts: inactiveEntities,
        });

    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};


//for testing

// Create a new entity
exports.createEntity = async (req, res) => {
  try {
    const { entityType, name, identifiers, department } = req.body;

    // Simple validation
    if (!entityType || !name) {
      return res.status(400).json({ message: "entityType and name are required" });
    }

    const newEntity = new Entity({
      entityType,
      name,
      identifiers,
      department,
    });

    const savedEntity = await newEntity.save();
    return res.status(201).json(savedEntity);
  } catch (err) {
    console.error("Error creating entity:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Get all entities
exports.getAllEntities = async (req, res) => {
  try {
    const entities = await Entity.find();
    return res.status(200).json(entities);
  } catch (err) {
    console.error("Error fetching entities:", err);
    return res.status(500).json({ message: "Server error" });
  }
};


// Create a new event
exports.createEvent = async (req, res) => {
  try {
    const { entityId, eventType, location, timestamp, metadata } = req.body;

    // Basic validation
    if (!entityId || !eventType || !location || !timestamp) {
      return res.status(400).json({ message: "entityId, eventType, location, and timestamp are required" });
    }

    // Optional: check if entity exists
    const entity = await Entity.findById(entityId);
    if (!entity) {
      return res.status(404).json({ message: "Entity not found" });
    }

    const newEvent = new Event({
      entityId,
      eventType,
      location,
      timestamp,
      metadata,
    });

    const savedEvent = await newEvent.save();
    return res.status(201).json(savedEvent);

  } catch (err) {
    console.error("Error creating event:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Get all events
exports.getAllEvents = async (req, res) => {
  try {
    const events = await Event.find().populate("entityId");
    return res.status(200).json(events);
  } catch (err) {
    console.error("Error fetching events:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Get events by entityId
exports.getEventsByEntity = async (req, res) => {
  try {
    const { entityId } = req.params;

    const entity = await Entity.findById(entityId);
    if (!entity) return res.status(404).json({ message: "Entity not found" });

    const events = await Event.find({ entityId }).sort({ timestamp: 1 }); // chronological
    return res.status(200).json(events);

  } catch (err) {
    console.error("Error fetching events by entity:", err);
    return res.status(500).json({ message: "Server error" });
  }
};