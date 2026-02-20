const mongoose = require('mongoose');

const AnalysisResultSchema = new mongoose.Schema({
    taskId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    topic: {
        type: String,
        required: true
    },

    summary: {
        type: String,
        required: true
    },
    sentiment: {
        type: String,
        enum: ['Positive', 'Negative', 'Neutral', 'Unknown'],
        default: 'Unknown'
    },
    insight: {
        type: String
    },
    sourceCount: {
        type: Number,
        default: 0
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('AnalysisResult', AnalysisResultSchema);
