const Entity = require('../Models/Entity');
const Event = require('../Models/Event');

// @desc    Get the complete timeline for a specific entity
// @route   GET /api/timeline/:entityId
exports.getTimeline = async (req, res) => {
    try {
        const { entityId } = req.params;
        
        // Find all events for the given entity, sorted by time
        const events = await Event.find({ entityId }).sort({ timestamp: 'asc' });
        
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