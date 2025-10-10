// const Entity = require('../Models/Entity');
// const Event = require('../Models/Event');
const pool = require('../config/db');
const axios = require('axios');

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
// exports.getAlerts = async (req, res) => {
//     try {
//         const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);

//         // Find entities whose most recent event is older than 12 hours
//         // This is a simplified query; a more robust solution might use aggregation pipelines.
//         const recentEvents = await Event.find({ timestamp: { $gte: twelveHoursAgo } }).distinct('entityId');
        
//         const inactiveEntities = await Entity.find({ _id: { $nin: recentEvents } });
        
//         res.status(200).json({
//             message: 'Alerts checked successfully.',
//             count: inactiveEntities.length,
//             alerts: inactiveEntities,
//         });

//     } catch (error) {
//         res.status(500).json({ message: 'Server Error', error: error.message });
//     }
// };

exports.getAlerts = async (req, res) => {
  try {
    // Call FastAPI endpoint
    const response = await axios.get("http://127.0.0.1:8000/alerts/inactive");
    const data = response.data;

    // Optional: you can format or filter data here before sending to frontend
    res.status(200).json({
      status: "success",
      alerts: data.alerts,
      count: data.count
    });
  } catch (error) {
    console.error("Error fetching inactive alerts:", error.message);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch inactive alerts",
      error: error.message
    });
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
    console.log("Fetching from pool");
    const entities = await pool.query("SELECT * FROM student_or_staff_profiles");
    return res.status(200).json(entities.rows);
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


exports.runPythonScript = async (req, res) => {
  const { entityId } = req.body;

  try {
    console.log("Calling FastAPI for entityId:", entityId);
    const response = await axios.post("http://127.0.0.1:8000/run-query", {
      identifier_type: 'card_id',
      identifier_value: entityId,
      start_time: '',
      end_time: '',
      location: ''
    });

    res.status(200).json(response.data);
  } catch (error) {
    console.error("Error calling FastAPI:", error.message);
    res.status(500).json({
      message: "Error running Python script",
      error: error.message
    });
  }
};

exports.getEntity = async(req, res)=>{
  const {entityId} = req.params;

  try {
    console.log("Calling FastAPI getDetails for entityId:", entityId);
    const response = await axios.post("http://127.0.0.1:8000/details", {
      identifier_type: 'card_id',
      identifier_value: entityId,
      start_time: '',
      end_time: '',
      location: ''
    });

    res.status(200).json(response.data);
  } catch (error) {
    console.error("Error calling FastAPI:", error.message);
    res.status(500).json({
      message: "Error running Python script",
      error: error.message
    });
  }
};


exports.predict = async(req, res) => {
  const {entity_id, timestamp} = req.body;
  
  try {
    console.log('starting predicting...')
    console.log('card_id: ', entity_id);
    // First get the entity_id from the database using card_id
    const entityQuery = await pool.query(
      `SELECT entity_id FROM student_or_staff_profiles WHERE card_id = $1`,
      [entity_id]
    );

    console.log(entityQuery);

    if (entityQuery.rows.length === 0) {
      console.log('no entiyQuery found')
      return res.status(404).json({ 
        error: `No entity found with card_id: ${entity_id}` 
      });
    }

    // Get the actual entity_id
    const actualEntityId = entityQuery.rows[0].entity_id;

    console.log('entity_id: ', actualEntityId);

    // Modify request body with actual entity_id
    const predictionBody = {
      ...req.body,
      entity_id: actualEntityId
    };

    console.log(predictionBody);

    // Make prediction request with actual entity_id
    const response = await axios.post(
      `http://127.0.0.1:8000/predict`, 
      predictionBody
    );

    res.json(response.data);
  } catch (err) {
    console.error("Prediction error:", err.message);
    res.status(500).json({ 
      error: "Failed to make prediction",
      details: err.message 
    });
  }
};

exports.train = async(req, res)=>{
  try {
    const response = await axios.post(`http://127.0.0.1:8000/train`, req.body);
    res.json(response.data);
  } catch (err) {
    console.error("Train failed:", err.response?.data || err.message);
    res.status(err.response?.status || 500).json({
      message: err.response?.data?.detail || "Training failed",
    });
  }
};