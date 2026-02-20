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

// Import Routes
const taskRoutes = require('./routes/tasks');
const analysisRoutes = require('./routes/analysis');

// Use Routes
app.use('/api/tasks', taskRoutes);
app.use('/api/analysis', analysisRoutes);

const { initScheduler } = require('./services/scheduler');
// Start Scheduler
initScheduler();

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
