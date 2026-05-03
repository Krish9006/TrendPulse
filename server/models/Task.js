const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    topic: {
        type: String,
        required: true,
        trim: true
    },
    frequency: {
        type: String,
        default: '0 * * * *'
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

