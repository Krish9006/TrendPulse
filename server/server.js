require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cron = require('node-cron');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: [
        'http://localhost:5173',
        process.env.CLIENT_URL, // Set this to your Vercel URL on Render
    ].filter(Boolean),
    credentials: true
}));
app.use(express.json());


// Database Connection
// For now, allow running without DB for testing if MONGO_URI is missing, but warn.
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/trendpulse';

mongoose.connect(MONGO_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error('MongoDB Connection Error:', err));

// Routes (Placeholder)
app.get('/', (req, res) => {
    res.send('TrendPulse API is running');
});

// Diagnostic route for Render config (Securely check if keys exist)
app.get('/api/debug/env', (req, res) => {
    res.json({
        gemini: !!process.env.GEMINI_API_KEY,
        geminiPrefix: process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.substring(0, 5) : null,
        news: !!process.env.NEWS_API_KEY,
        mongo: !!process.env.MONGO_URI,
        jwt: !!process.env.JWT_SECRET,
        client: process.env.CLIENT_URL || 'Not Set',
        nodeEnv: process.env.NODE_ENV || 'Not Set'
    });
});

const aiService = require('./services/aiService');

app.get('/api/debug/test-ai', async (req, res) => {
    try {
        const testResult = await aiService.parseIntent("hi track test");
        res.json({
            status: "success",
            result: testResult,
            lastServiceError: aiService.lastError
        });
    } catch (err) {
        res.status(500).json({
            status: "failed",
            error: err.message,
            stack: err.stack
        });
    }
});


// Import Routes
const taskRoutes = require('./routes/tasks');
const analysisRoutes = require('./routes/analysis');
const authRoutes = require('./routes/auth');

// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/analysis', analysisRoutes);


const { initScheduler } = require('./services/scheduler');
// Start Scheduler
initScheduler();

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
