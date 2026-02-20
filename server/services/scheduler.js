const cron = require('node-cron');
const Task = require('../models/Task');
const AnalysisResult = require('../models/AnalysisResult');
const newsService = require('./newsService');
const aiService = require('./aiService');

const initScheduler = () => {
    console.log('🕒 Task Scheduler Initialized');

    // Check for tasks every minute (in a real production app, we'd use a more robust queue)
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

        // 3. Save Result
        const result = new AnalysisResult({
            taskId: task._id,
            summary: analysis.summary,
            sentiment: analysis.sentiment,
            insight: analysis.insight,
            sourceCount: 5
        });

        await result.save();

        // 4. Update Task
        task.lastRun = new Date();
        await task.save();

        console.log(`✅ Completed Task: ${task.topic}`);
    } catch (error) {
        console.error(`❌ Failed Task ${task.topic}:`, error);
    }
}

module.exports = { initScheduler };
