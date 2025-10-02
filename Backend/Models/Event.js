const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
    entityId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Entity', // Links this event to a specific entity
        required: true,
    },
    eventType: {
        type: String,
        enum: ['card_swipe', 'wifi_log', 'library_checkout', 'booking'],
        required: true,
    },
    location: {
        type: String,
        required: true,
    },
    timestamp: {
        type: Date,
        required: true,
    },
    // Optional field for any extra data associated with the event
    metadata: {
        type: Map,
        of: String,
    },
}, { timestamps: true });

module.exports = mongoose.model('Event', EventSchema);