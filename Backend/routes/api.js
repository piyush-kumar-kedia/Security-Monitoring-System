import express from 'express';
import { getTimeline, getAlerts, getAllEntities, runPythonScript, getEntity, predict, train } from '../Controller/MonitorController.js';
import { authenticateToken } from '../middleware/authController.js';

const router = express.Router();

router.use(authenticateToken);

// Define the routes
router.get('/timeline/:entityId', getTimeline);
router.get('/alerts/inactive', getAlerts);
router.get('/entities/:entityId', getEntity);
router.post("/run-script", runPythonScript);
router.post("/predict", predict);
router.post("/train", train)
router.get('/entity',getAllEntities);


export default router;