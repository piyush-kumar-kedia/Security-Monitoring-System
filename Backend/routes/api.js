const express = require('express');
const router = express.Router();
const { getTimeline, getAlerts,  getAllEntities, runPythonScript, getEntity, predict, train } = require('../Controller/MonitorController.js');

// Define the routes
router.get('/timeline/:entityId', getTimeline);
router.get('/alerts/inactive', getAlerts);
router.get('/entities/:entityId', getEntity);
router.post("/run-script", runPythonScript);
router.post("/predict", predict);
router.post("/train", train)
router.get('/entity',getAllEntities);


module.exports = router;