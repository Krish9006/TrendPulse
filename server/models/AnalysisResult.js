const mongoose = require('mongoose');

const AnalysisResultSchema = new mongoose.Schema({
    taskId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task',
        required: true
    },
    userId: {
        type: String, // Support Clerk string IDs
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
    metrics: [{
        label: String,
        value: mongoose.Schema.Types.Mixed // Flexible to handle AI noise
    }],
    sources: [{
        publisher: String,
        url: String
    }],
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
