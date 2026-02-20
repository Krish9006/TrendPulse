const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const aiservice = require('../services/aiService'); // Use consistent casing

// Get all tasks
router.get('/', async (req, res) => {
    try {
        const tasks = await Task.find().sort({ createdAt: -1 });
        res.json(tasks);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Chat Endpoint - Parse intent and create/preview task
router.post('/chat', async (req, res) => {
    const { message } = req.body;
    if (!message) return res.status(400).json({ message: "Message is required" });

    try {
        // Use the AI service to parse the intent
        const aiResponse = await aiservice.parseIntent(message);

        // Check if aiResponse is valid
        if (aiResponse && aiResponse.topic) {
            // ✅ Duplicate check: same topic (case-insensitive) already exists?
            const existingTask = await Task.findOne({
                topic: { $regex: new RegExp(`^${aiResponse.topic}$`, 'i') }
            });

            if (existingTask) {
                return res.json({
                    reply: `I'm already tracking **${existingTask.topic}** for you! Check your dashboard to see the latest insights.`,
                    action: "ALREADY_EXISTS"
                });
            }

            const newTask = new Task({
                topic: aiResponse.topic,
                frequency: aiResponse.frequency || '0 * * * *' // Default if missing
            });
            await newTask.save();

            res.json({
                reply: aiResponse.confirmation,
                task: newTask,
                action: "TASK_CREATED"
            });
        } else {
            res.json({
                reply: aiResponse ? aiResponse.confirmation : "I didn't understand that. Try 'Track Bitcoin'.",
                action: "CHAT_ONLY"
            });
        }
    } catch (err) {
        console.error("Chat Error:", err);
        res.status(500).json({ message: err.message });
    }
});

// Toggle Task Status
router.patch('/:id/toggle', async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
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
        const task = await Task.findByIdAndDelete(req.params.id);
        if (!task) return res.status(404).json({ message: 'Task not found' });
        res.json({ message: 'Task deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;

