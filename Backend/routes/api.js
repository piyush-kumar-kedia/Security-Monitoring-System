const express = require('express');
const router = express.Router();
const { getTimeline, getAlerts, createEntity, getAllEntities, createEvent, getAllEvents, getEventsByEntity, runPythonScript, getEntity, predict, train } = require('../Controller/MonitorController.js');

// Define the routes
router.get('/timeline/:entityId', getTimeline);
router.get('/alerts/inactive', getAlerts);
router.get('/entities/:entityId', getEntity);
router.post("/run-script", runPythonScript);
router.post("/predict", predict);
router.post("/train", train)

//for testing
router.get('/entity',getAllEntities);
router.post('/entity', createEntity);
router.post("/events", createEvent);
router.get("/events", getAllEvents);
router.get("/events/:entityId",getEventsByEntity);

module.exports = router;