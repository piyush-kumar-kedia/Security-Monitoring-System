const mongoose = require('mongoose');

const EntitySchema = new mongoose.Schema({
    entityType: {
        type: String,
        enum: ['student', 'staff', 'asset'],
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    // Collection of all known identifiers for this entity
    identifiers: {
        studentId: String,
        email: String,
        cardId: String,
        deviceHashes: [String],
        faceId: String,
    },
    department: String,
}, { timestamps: true });

module.exports = mongoose.model('Entity', EntitySchema);