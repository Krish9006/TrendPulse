# TrendPulse AI 🚀
> **Intelligent Trend Tracking Agent** — Chat to configure, AI to analyze, dashboard to review.

TrendPulse lets users define tracking tasks via natural language. The backend autonomously schedules news fetching, runs AI analysis using **Google Gemini**, and surfaces structured insights on a real-time dashboard.

---

## ✨ Features

| Feature | Description |
|---|---|
| 💬 **Conversational Config** | Type `"Track Bitcoin every hour"` → AI creates the scheduled task automatically |
| 🤖 **AI-Powered Analysis** | Google Gemini analyzes fetched news → returns `summary`, `sentiment`, and `insight` |
| 📅 **Auto Scheduled Tasks** | `node-cron` runs tasks at user-defined frequencies (hourly, daily, custom cron) |
| 📊 **Real-time Dashboard** | Live view of active trackers and all incoming AI insights |
| 🗑️ **Task Management** | Delete tasks directly from the dashboard |
| 🛡️ **Resilient Architecture** | Full Mock Mode fallback — works without API keys for demo/testing |

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, TailwindCSS, Framer Motion |
| Backend | Node.js, Express.js |
| Database | MongoDB (Atlas cloud) |
| AI | Google Gemini API (`gemini-2.5-flash`) |
| News | NewsAPI.org |
| Scheduler | node-cron |

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- A free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account
- A free [Google Gemini API Key](https://aistudio.google.com/app/apikey)
- A free [NewsAPI Key](https://newsapi.org/register)

### 1. Clone & Install
```bash
git clone <your-repo-url>
cd TrendPulse
npm run install:all
```

### 2. Configure Environment
Create `server/.env`:
```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/trendpulse
GEMINI_API_KEY=your_gemini_api_key_here
NEWS_API_KEY=your_newsapi_key_here
```

> **No API keys?** The app auto-switches to **Mock Mode** — full UI/UX works without any keys.

### 3. Run
```bash
npm start
```
- **Frontend** → http://localhost:5173
- **Backend API** → http://localhost:5000

---

## 📂 Project Structure

```
TrendPulse/
├── client/                   # React frontend (Vite)
│   └── src/
│       ├── pages/
│       │   ├── Dashboard.jsx  # Live tracker & insights view
│       │   └── Chat.jsx       # AI chat interface
│       └── services/api.js    # Axios API client
│
├── server/                   # Express backend
│   ├── routes/
│   │   ├── tasks.js           # Task CRUD + chat endpoint
│   │   └── analysis.js        # Analysis trigger + history
│   ├── services/
│   │   ├── aiService.js       # Gemini/OpenAI + Mock AI
│   │   ├── newsService.js     # NewsAPI + Mock News
│   │   └── scheduler.js       # node-cron task runner
│   └── models/
│       ├── Task.js            # MongoDB task schema
│       └── AnalysisResult.js  # MongoDB results schema
│
├── TASK_DESIGN.md            # Full architecture & design doc
└── README.md
```

---

## 🧪 Testing the App

1. Open http://localhost:5173
2. Go to **AI Assistant** tab
3. Type: `"Track Tesla stock every hour"`
4. See the task appear in **Dashboard**
5. Wait for the scheduler OR trigger manually:
```bash
curl -X POST http://localhost:5000/api/analysis/<task-id>/run
```
6. Refresh Dashboard → AI insights appear with Sentiment, Summary, and Insight

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/tasks` | List all tasks |
| `POST` | `/api/tasks/chat` | Parse natural language → create task |
| `DELETE` | `/api/tasks/:id` | Delete a task |
| `GET` | `/api/analysis` | Get all analysis history |
| `POST` | `/api/analysis/:id/run` | Manually trigger analysis for a task |
