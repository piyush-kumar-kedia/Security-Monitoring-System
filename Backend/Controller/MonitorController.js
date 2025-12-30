import pool from '../config/db.js';
import axios from 'axios';

export const getTimeline = async (req, res) => {
    try {
        const { entityId } = req.params;
      
        const events = await Event.find({ entityId }).sort({ timestamp: -1 });
        
        if (!events) {
            return res.status(404).json({ message: 'No events found for this entity.' });
        }

        res.status(200).json({
            message: 'Timeline retrieved successfully.',
            count: events.length,
            timeline: events,
        });

    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};


export const getAlerts = async (req, res) => {
  try {
    const response = await axios.get("http://127.0.0.1:8000/alerts/inactive");
    const data = response.data;

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


export const getAllEntities = async (req, res) => {
  try {
    console.log("Fetching from pool");
    const entities = await pool.query("SELECT * FROM student_or_staff_profiles");
    return res.status(200).json(entities.rows);
  } catch (err) {
    console.error("Error fetching entities:", err);
    return res.status(500).json({ message: "Server error" });
  }
};


export const runPythonScript = async (req, res) => {
  const { entityId } = req.body;

  try {
    console.log("Calling FastAPI for entityId:", entityId);
    const response = await axios.post("http://127.0.0.1:8000/run-query", {
      identifier_type: 'entity_id',
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

export const getEntity = async(req, res)=>{
  const {entityId} = req.params;

  try {
    console.log("Calling FastAPI getDetails for entityId:", entityId);
    const response = await axios.post("http://127.0.0.1:8000/details", {
      identifier_type: 'entity_id',
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


export const predict = async(req, res) => {
  const {entity_id, timestamp} = req.body;
  
  try {
    console.log('starting predicting...')
    console.log('entity_id: ', entity_id);

    console.log('payload: ', req.body);
    const response = await axios.post(
      `http://127.0.0.1:8000/predict`, 
      req.body
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

export const train = async(req, res)=>{
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