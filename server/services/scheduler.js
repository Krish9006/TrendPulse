const cron = require('node-cron');
const Task = require('../models/Task');
const AnalysisResult = require('../models/AnalysisResult');
const newsService = require('./newsService');
const aiService = require('./aiService');

const initScheduler = () => {
    console.log('🕒 Task Scheduler Initialized');

    // One-time cleanup: Remove orphaned analysis results where task no longer exists
    cleanupOrphanedResults();

    // Check for tasks every minute
    cron.schedule('* * * * *', async () => {
        try {
            // Find active tasks that need to run
            // For simplicity in this demo, we'll run any task that hasn't run in the last hour
            // OR we can parse the specific cron string. 
            // To keep it simple for the assessment: We run "Hourly" tasks if they haven't run in 60 mins.

            const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

            const tasksToRun = await Task.find({
                isActive: true,
                $or: [
                    { lastRun: { $exists: false } },
                    { lastRun: { $lt: oneHourAgo } }
                ]
            });

            if (tasksToRun.length > 0) {
                console.log(`🚀 Running ${tasksToRun.length} scheduled tasks...`);
            }

            for (const task of tasksToRun) {
                processTask(task);
            }
        } catch (err) {
            console.error("Scheduler Error:", err);
        }
    });
};

async function processTask(task) {
    try {
        console.log(`Processing Task: ${task.topic}`);

        // 1. Fetch News
        const newsContent = await newsService.fetchNews(task.topic);

        // 2. Analyze
        const analysis = await aiService.analyzeContent(newsContent, task.topic);

        // 3. Save Result (Only if userId exists, to prevent ValidationError on legacy tasks without userId)
        if (task.userId) {
            const result = new AnalysisResult({
                taskId: task._id,
                userId: task.userId,
                topic: task.topic, // Denormalize topic name
                summary: analysis.summary,
                sentiment: analysis.sentiment,
                insight: analysis.insight,
                sourceCount: 5
            });
            await result.save();
        } else {
            console.warn(`⚠️ Skipped saving result for task ${task.topic} because it has no userId.`);
        }

        // 4. Update Task
        task.lastRun = new Date();
        await task.save();

        console.log(`✅ Completed Task: ${task.topic}`);
    } catch (error) {
        console.error(`❌ Failed Task ${task.topic}:`, error);
    }
}

async function cleanupOrphanedResults() {
    try {
        const results = await AnalysisResult.find().populate('taskId');
        const orphanedIds = results
            .filter(r => !r.taskId) // taskId populated as null means task is deleted
            .map(r => r._id);

        if (orphanedIds.length > 0) {
            console.log(`🧹 Cleaning up ${orphanedIds.length} orphaned analysis results...`);
            await AnalysisResult.deleteMany({ _id: { $in: orphanedIds } });
        }
    } catch (err) {
        console.error("Cleanup Error:", err);
    }
}

module.exports = { initScheduler };

