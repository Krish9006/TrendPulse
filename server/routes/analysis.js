const express = require('express');
const router = express.Router();
const AnalysisResult = require('../models/AnalysisResult');
const Task = require('../models/Task');
const newsService = require('../services/newsService');
const aiService = require('../services/aiService');

// Get analysis history
router.get('/', async (req, res) => {
    try {
        const results = await AnalysisResult.find()
            .populate('taskId', 'topic')
            .sort({ timestamp: -1 });
        res.json(results);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Manual Trigger for a Task Analysis (for testing/demo)
router.post('/:taskId/run', async (req, res) => {
    try {
        const task = await Task.findById(req.params.taskId);
        if (!task) return res.status(404).json({ message: 'Task not found' });

        // 1. Fetch News
        const newsContent = await newsService.fetchNews(task.topic);

        // 2. Analyze with AI
        const analysis = await aiService.analyzeContent(newsContent, task.topic);

        // 3. Save Result
        const result = new AnalysisResult({
            taskId: task._id,
            summary: analysis.summary,
            sentiment: analysis.sentiment,
            insight: analysis.insight,
            sourceCount: 5 // Mock/placeholder
        });

        await result.save();

        // Update task lastRun
        task.lastRun = new Date();
        await task.save();

        res.json(result);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
