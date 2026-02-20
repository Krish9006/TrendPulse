const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const aiService = require('../services/aiService');
const authMiddleware = require('../middleware/auth');

// All routes require auth
router.use(authMiddleware);

// Get all tasks for logged-in user
router.get('/', async (req, res) => {
    try {
        const tasks = await Task.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.json(tasks);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Chat Endpoint - Parse intent and create task
router.post('/chat', async (req, res) => {
    const { message } = req.body;
    if (!message) return res.status(400).json({ message: 'Message is required' });

    try {
        const aiResponse = await aiService.parseIntent(message);

        if (aiResponse && aiResponse.topic) {
            // Duplicate check per user
            const existingTask = await Task.findOne({
                userId: req.user.id,
                topic: { $regex: new RegExp(`^${aiResponse.topic}$`, 'i') }
            });

            if (existingTask) {
                return res.json({
                    reply: `I'm already tracking **${existingTask.topic}** for you! Check your dashboard to see the latest insights.`,
                    action: 'ALREADY_EXISTS'
                });
            }

            const newTask = new Task({
                userId: req.user.id,
                topic: aiResponse.topic,
                frequency: aiResponse.frequency || '0 * * * *'
            });
            await newTask.save();

            res.json({
                reply: aiResponse.confirmation,
                task: newTask,
                action: 'TASK_CREATED'
            });
        } else {
            res.json({
                reply: aiResponse ? aiResponse.confirmation : "I didn't understand that. Try 'Track Bitcoin'.",
                action: 'CHAT_ONLY'
            });
        }
    } catch (err) {
        console.error('Chat Error:', err);
        res.status(500).json({ message: err.message });
    }
});

// Toggle Task Status
router.patch('/:id/toggle', async (req, res) => {
    try {
        const task = await Task.findOne({ _id: req.params.id, userId: req.user.id });
        if (!task) return res.status(404).json({ message: 'Task not found' });
        task.isActive = !task.isActive;
        await task.save();
        res.json(task);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Delete Task
router.delete('/:id', async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
        if (!task) return res.status(404).json({ message: 'Task not found' });
        res.json({ message: 'Task deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
