# TrendPulse AI — Task Design Document

## 1. Overview & Problem Statement

**Problem:** Staying updated on fast-moving topics (crypto, stocks, tech news, competitors) requires constant manual effort — checking news sites, reading articles, forming opinions.

**Solution:** TrendPulse is a natural-language-driven AI agent. Users describe what they want to track in plain English. The system automatically schedules data fetching, runs AI analysis, and surfaces structured insights — all without further user input.

---

## 2. System Architecture

```
User (Browser)
    │
    ▼
┌─────────────────────────────┐
│   React Frontend (Vite)     │
│  ┌─────────┐ ┌───────────┐  │
│  │  Chat   │ │ Dashboard │  │
│  │  Page   │ │   Page    │  │
│  └────┬────┘ └─────┬─────┘  │
└───────┼────────────┼────────┘
        │ REST API   │ REST API
        ▼            ▼
┌─────────────────────────────┐
│   Express.js Backend        │
│  ┌────────┐  ┌───────────┐  │
│  │ /tasks │  │ /analysis │  │
│  └────┬───┘  └─────┬─────┘  │
│       │            │         │
│  ┌────▼────────────▼──────┐  │
│  │    Service Layer        │  │
│  │  ┌──────────────────┐  │  │
│  │  │   AI Service     │  │  │
│  │  │ (Gemini / Mock)  │  │  │
│  │  ├──────────────────┤  │  │
│  │  │   News Service   │  │  │
│  │  │ (NewsAPI / Mock) │  │  │
│  │  ├──────────────────┤  │  │
│  │  │   Scheduler      │  │  │
│  │  │  (node-cron)     │  │  │
│  │  └──────────────────┘  │  │
│  └────────────────────────┘  │
└─────────────┬───────────────┘
              │
              ▼
        MongoDB Atlas
    (Tasks + AnalysisResults)
```

---

## 3. Core Task Flow

### Step 1: Intent Parsing (Chat → Task Creation)
```
User types: "Track AI news every day"
        │
        ▼
POST /api/tasks/chat
        │
        ▼
Gemini AI (parseIntent prompt):
  → Extracts: { topic: "AI news", frequency: "0 9 * * *" }
  → Confirms: "AI news tracking set daily."
        │
        ▼
MongoDB: Task document created
  { topic, frequency, isActive: true, createdAt }
```

### Step 2: Automated Execution (Scheduler)
```
node-cron runs every 60 seconds
        │
        ▼
Checks: Is any task's lastRun older than its frequency interval?
        │
        ▼
For each due task:
  1. NewsAPI.fetchNews(topic)     → Raw news articles (max 5)
  2. Gemini.analyzeContent(news)  → Structured analysis
  3. MongoDB.save(AnalysisResult) → Persisted result
  4. Task.lastRun = now           → Update timestamp
```

### Step 3: Dashboard Feedback Loop
```
Dashboard polls GET /api/analysis every 30 seconds
        │
        ▼
Renders AnalysisResults sorted by timestamp (newest first)
  → Card: Topic | Sentiment Badge | Summary | Insight | Time
```

---

## 4. AI Integration Details

### Model Used
- **Primary:** Google Gemini (`gemini-2.5-flash`) — free tier, high quality
- **Fallback:** OpenAI `gpt-3.5-turbo` (if `OPENAI_API_KEY` is set)
- **Mock Mode:** Regex-based intent parser + randomized insights (no API key needed)

### Prompt 1 — Intent Parsing
```
You are a task-tracking assistant. Extract the tracking topic and frequency.
Rules:
- If message is a greeting/small talk, return topic: null
- Only set topic for meaningful trackable subjects
- frequency must be a valid cron string (default: '0 * * * *' hourly)
- Return ONLY valid JSON: { "topic": "string", "frequency": "cron", "confirmation": "string" }

User message: "Track Bitcoin every hour"
```
**Response:** `{ "topic": "Bitcoin", "frequency": "0 * * * *", "confirmation": "Bitcoin tracking set to hourly." }`

### Prompt 2 — Content Analysis
```
Analyze this news about '{topic}':
"{news text}"

Return JSON ONLY: {
  "summary": "2-3 sentence concise summary",
  "sentiment": "Positive | Neutral | Negative",
  "insight": "One actionable strategic insight"
}
```

---

## 5. Database Schema

### Task
```json
{
  "_id": "ObjectId",
  "topic": "Bitcoin",
  "frequency": "0 * * * *",
  "isActive": true,
  "lastRun": "2026-02-20T09:00:00Z",
  "createdAt": "2026-02-20T08:00:00Z"
}
```

### AnalysisResult
```json
{
  "_id": "ObjectId",
  "taskId": "ObjectId (ref: Task)",
  "summary": "Bitcoin hit a new high as Goldman Sachs...",
  "sentiment": "Positive",
  "insight": "Institutional adoption signals long-term stability...",
  "sourceCount": 5,
  "timestamp": "2026-02-20T09:00:00Z"
}
```

---

## 6. Innovation Highlights

| Feature | Why It's Innovative |
|---|---|
| **🔐 Secure Auth** | JWT-based per-user isolation — tasks and insights are strictly private |
| **Natural Language → Cron** | Users say "daily" or "every 2 hours" — Gemini converts to exact cron format |
| **Duplicate Prevention** | Scoped per user — same topic detected and skipped |
| **Sentiment Trends** | Track how sentiment changes over time for the same topic |
| **Mock-First Design** | Zero-config demo mode for core AI features |
| **Modular AI Layer** | Swap Gemini → OpenAI → DeepSeek with one env variable change |

---

## 7. Authentication & Security
- **JWT Architecture:** Stateless authentication using JSON Web Tokens.
- **Password Security:** Hashed using `bcryptjs` with 12 salt rounds.
- **Data Isolation:** All database queries are filtered by `userId` in the middle layer.
- **Frontend Protection:** React context-based private routes ensure only logged-in users access the dashboard.

---

## 8. Resilience & Error Handling
- **Invalid Tokens:** Automatic logout on 401 response from backend.
- **No AI Key:** Falls back to regex-based mock intent parser and template insights.
- **No News Key:** Falls back to pre-defined sample news templates per topic.
- **DB Unavailable:** Server boots and serves API (MongoDB error is logged, not fatal).
- **Gemini Rate Limit:** Catches error, returns mock response, logs warning.

---

## 9. Scalability Considerations
- **Queue-based execution:** Currently synchronous; can be upgraded to Bull/BullMQ queue.
- **Horizontal scaling:** Stateless Express server — easily containerized with Docker.
- **Multi-user ready:** Full authentication system allows multi-tenant scaling out of the box.

