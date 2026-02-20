const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
    topic: {
        type: String,
        required: true,
        trim: true
    },
    frequency: {
        type: String, // e.g., "every 1 hour", "0 * * * *"
        default: '0 * * * *' // Default hourly
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastRun: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Task', TaskSchema);
