const express = require('express');
const router = express.Router();
const { getTimeline, getAlerts, createEntity, getAllEntities, createEvent, getAllEvents, getEventsByEntity } = require('../Controller/MonitorController.js');
const authController= require('../middleware/authController.js')

// Define the routes
router.get('/timeline/:entityId', getTimeline);
router.get('/alerts', getAlerts);

//for testing
router.get('/entity',getAllEntities);
router.post('/entity', createEntity);
router.post("/events",createEvent);
router.get("/events", getAllEvents);
router.get("/events/:entityId",getEventsByEntity);

module.exports = router;