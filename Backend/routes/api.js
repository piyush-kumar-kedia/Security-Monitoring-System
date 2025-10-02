const express = require('express');
const router = express.Router();
const { getTimeline, getAlerts } = require('../controllers/monitoringController');

// Define the routes
router.get('/timeline/:entityId', getTimeline);
router.get('/alerts', getAlerts);

module.exports = router;