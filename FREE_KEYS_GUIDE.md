# Free API Keys Guide

OpenAI free nahi hai, isliye maine **Google Gemini (Free Tier)** ka support add kar diya hai. NewsAPI development ke liye free hai.

## 1. Get NewsAPI Key (Free)
1.  Go to [NewsAPI.org/register](https://newsapi.org/register).
2.  Fill form (Name, Email, Password).
3.  "I am an individual" select karein.
4.  Submit karein.
5.  Screen par **API Key** dikhegi. Copy karein.

## 2. Get Google Gemini Key (Free for 60 req/min)
*OpenAI ki jagah hum Google ka AI use karenge jo free hai.*

1.  Go to [Google AI Studio](https://aistudio.google.com/app/apikey).
2.  "Create API key" click karein.
3.  Apne Google account se login karein (agar nahi kiya hai).
4.  "Create API key in new project" select karein.
5.  Key copy karein.

---

## 3. Update Project
Apne project ke `server/.env` file mein ye paste karein:

\`\`\`env
PORT=5000
# MongoDB aapne pehle hi set kar liya hai!
MONGO_URI=mongodb+srv://guptashanu341_db_user:f7cItaColmlNVEga@cluster0.wmrjofm.mongodb.net/trendpulse?retryWrites=true&w=majority

# NewsAPI Key Yahan Dalein
NEWS_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxx

# Google Gemini Key Yahan Dalein (OpenAI ki jagah)
GEMINI_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxx
\`\`\`

File save karein aur server restart karein (`npm start`).
