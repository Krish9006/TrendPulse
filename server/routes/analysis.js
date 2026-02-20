const express = require('express');
const router = express.Router();
const AnalysisResult = require('../models/AnalysisResult');
const Task = require('../models/Task');
const newsService = require('../services/newsService');
const aiService = require('../services/aiService');
const authMiddleware = require('../middleware/auth');

// All routes require auth
router.use(authMiddleware);

// Get analysis results for logged-in user's tasks
router.get('/', async (req, res) => {
    try {
        // Query results directly by userId for better performance
        const results = await AnalysisResult.find({ userId: req.user.id })
            .populate('taskId', 'topic')
            .sort({ timestamp: -1 })
            .limit(20);

        res.json(results);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Manual trigger for a task analysis
router.post('/:taskId/run', async (req, res) => {
    try {
        const task = await Task.findOne({ _id: req.params.taskId, userId: req.user.id });
        if (!task) return res.status(404).json({ message: 'Task not found' });

        const newsContent = await newsService.fetchNews(task.topic);
        const analysis = await aiService.analyzeContent(newsContent, task.topic);

        const result = new AnalysisResult({
            taskId: task._id,
            userId: req.user.id,
            summary: analysis.summary,
            sentiment: analysis.sentiment,
            insight: analysis.insight,
            sourceCount: 5
        });

        await result.save();

        task.lastRun = new Date();
        await task.save();

        res.json(result);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
