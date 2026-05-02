const OpenAI = require('openai');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Groq = require('groq-sdk');
require('dotenv').config();

// Mock Data for fallback
const MOCK_INSIGHTS = [
    "Market data shows a significant uptrend due to recent global events.",
    "Public sentiment is mixed, with concerns over privacy regulations.",
    "The technology sector is rallying behind the new AI advancements.",
    "Supply chain disruptions are causing minor delays in production."
];

class AIService {
    constructor() {
        this.openaiKey = process.env.OPENAI_API_KEY;
        this.geminiKey = process.env.GEMINI_API_KEY;
        this.groqKey = process.env.GROQ_API_KEY;
        this.lastError = null;
        this.isRateLimited = false;

        if (this.groqKey) {
            this.groq = new Groq({ apiKey: this.groqKey });
            console.log("✅ AI Service: Using Groq");
        } else if (this.openaiKey) {
            this.openai = new OpenAI({ apiKey: this.openaiKey });
            console.log("✅ AI Service: Using OpenAI");
        } else if (this.geminiKey) {
            this.genAI = new GoogleGenerativeAI(this.geminiKey);
            console.log("✅ AI Service: Gemini Base Initialized.");
        } else {
            console.warn("⚠️ AI Service: No API Key found in process.env. Using Mock AI Service.");
        }
    }

    async listModels() {
        if (!this.geminiKey) return { error: "No Gemini Key" };
        try {
            // Using raw axios to bypass library limitations and see exactly what models are available
            const axios = require('axios');
            const response = await axios.get(`https://generativelanguage.googleapis.com/v1beta/models?key=${this.geminiKey}`);
            return response.data;
        } catch (err) {
            console.error("List Models Error:", err.response?.data || err.message);
            return {
                error: err.message,
                details: err.response?.data || "No extra details"
            };
        }
    }

    // Helper to get a working model with fallback
    async getActiveModel() {
        if (this.geminiModel) return this.geminiModel;

        // Models discovered to be working for this specific API Key (Step 803)
        const modelsToTry = [
            "gemini-2.0-flash",
            "gemini-flash-latest",
            "gemini-1.5-flash",
            "gemini-pro",
            "gemini-pro-latest"
        ];



        for (const modelName of modelsToTry) {
            try {
                // Try v1 first, then fallback to v1beta (default)
                const model = this.genAI.getGenerativeModel({ model: modelName }, { apiVersion: 'v1' });
                // Do a lightweight verification call
                await model.generateContent("ping");
                this.geminiModel = model;
                console.log(`✅ AI Service: Connected using model: ${modelName} (v1)`);
                return this.geminiModel;
            } catch (err) {
                try {
                    const model = this.genAI.getGenerativeModel({ model: modelName }); // Default v1beta
                    await model.generateContent("ping");
                    this.geminiModel = model;
                    console.log(`✅ AI Service: Connected using model: ${modelName} (v1beta)`);
                    return this.geminiModel;
                } catch (err2) {
                    console.warn(`⚠️ AI Service: Model ${modelName} failed on both v1/v1beta`);
                    const errMsg = `${err.message} | ${err2.message}`;
                    this.lastError = `Last tried ${modelName}: ${errMsg}`;

                    // Prioritize keeping the rate limit error info
                    if (errMsg.includes('429') || errMsg.toLowerCase().includes('quota')) {
                        this.isRateLimited = true;
                    }
                }
            }
        }

        console.error("❌ AI Service: All Gemini models failed. Temporarily falling back to Mock.");
        return null;
    }



    async parseIntent(userMessage) {
        if (this.groqKey) return this.parseIntentGroq(userMessage);
        if (this.openaiKey) return this.parseIntentOpenAI(userMessage);
        if (this.geminiKey) return this.parseIntentGemini(userMessage);
        return this.mockParseIntent(userMessage);
    }

    async analyzeContent(textData, topic) {
        if (this.groqKey) return this.analyzeContentGroq(textData, topic);
        if (this.openaiKey) return this.analyzeContentOpenAI(textData, topic);
        if (this.geminiKey) return this.analyzeContentGemini(textData, topic);
        return this.mockAnalyzeContent(topic);
    }

    // --- OpenAI Methods ---

    async parseIntentOpenAI(userMessage) {
        try {
            const response = await this.openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content: `You are a helpful assistant that helps users configure trend tracking tasks. 
            Extract the 'topic' and 'frequency' (in cron format, default to '0 * * * *' for hourly) from the user's message.
            Return ONLY a valid JSON object: { "topic": "string", "frequency": "cron_string", "confirmation": "string" }.
            If the request is not about a task, return { "topic": null, "confirmation": "I can help you track trends. Try saying 'Track Bitcoin every hour'." }`
                    },
                    { role: "user", content: userMessage }
                ]
            });
            return JSON.parse(response.choices[0].message.content);
        } catch (error) {
            console.error("OpenAI Error:", error);
            return this.mockParseIntent(userMessage);
        }
    }

    async analyzeContentOpenAI(textData, topic) {
        try {
            const response = await this.openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content: `Analyze the provided news text about '${topic}'. 
            Return a JSON object: { "summary": "concise summary", "sentiment": "Positive/Neutral/Negative", "insight": "one key strategic insight" }.`
                    },
                    { role: "user", content: textData.substring(0, 2000) }
                ]
            });
            return JSON.parse(response.choices[0].message.content);
        } catch (error) {
            console.error("OpenAI Analysis Error:", error);
            return this.mockAnalyzeContent(topic);
        }
    }

    // --- Groq Methods ---

    async parseIntentGroq(userMessage) {
        try {
            const completion = await this.groq.chat.completions.create({
                model: "llama-3.1-8b-instant",
                messages: [
                    {
                        role: "system",
                        content: `You are a helpful assistant configuring trend tracking. 
            Extract 'topic' and 'frequency' (cron format, default '0 * * * *') from user messages.
            Return exactly JSON: { "topic": "string", "frequency": "string", "confirmation": "string" }.
            If the user types a noun, single word, or entity (e.g., "bitcoin", "MS Dhoni", "AI"), ASSUME they want to track it and extract it as the topic.
            ONLY reject true conversational greetings like "hi" or "hello" or nonsense. If rejected, return { "topic": null, "confirmation": "I can track trends. E.g., 'Track Virat Kohli news'." }.
            NEVER return a boolean for confirmation, it MUST be string.`
                    },
                    { role: "user", content: userMessage }
                ],
                response_format: { type: "json_object" },
                temperature: 0.2
            });
            let result = JSON.parse(completion.choices[0].message.content);
            if (typeof result.confirmation === 'boolean') {
                result.confirmation = result.confirmation ? `I've set up tracking for ${result.topic}.` : "I didn't quite get that. What should I track?";
            }
            if (!result.confirmation) {
                result.confirmation = "Got it! Tracking is setup.";
            }
            return result;
        } catch (error) {
            console.error("Groq Intent Error:", error);
            return this.mockParseIntent(userMessage);
        }
    }

    async analyzeContentGroq(textData, topic) {
        try {
            const completion = await this.groq.chat.completions.create({
                model: "llama-3.1-8b-instant",
                messages: [
                    {
                        role: "system",
                        content: `Analyze the provided real-time news about '${topic}'. 
            You must return ONLY a JSON object with this exact structure:
            {
              "summary": "concise executive summary",
              "sentiment": "Positive/Neutral/Negative",
              "insight": "one key strategic insight",
              "metrics": [ {"label": "Growth Rate", "value": 15} ], // Extract 2-4 numerical metrics or percentages. If none, infer reasonable dummy data.
              "sources": [ {"publisher": "NewsName", "url": "http..."} ] // Extract publisher and URL from the text
            }`
                    },
                    { role: "user", content: textData.substring(0, 4000) }
                ],
                response_format: { type: "json_object" }
            });
            return JSON.parse(completion.choices[0].message.content);
        } catch (error) {
            console.error("Groq Analysis Error:", error);
            return this.mockAnalyzeContent(topic);
        }
    }

    // --- Gemini Methods ---

    async parseIntentGemini(userMessage) {
        try {
            const model = await this.getActiveModel();
            if (!model) return this.mockParseIntent(userMessage);

            const prompt = `
You are a task-tracking assistant. Extract the tracking topic and frequency from the user's message.

Rules:
- If the message is a greeting (hi, hello, hey, thanks, ok, yeah, etc.) or small talk, return topic as null.
- If the message is NOT clearly about tracking/monitoring a real topic (news, stock, crypto, company, technology, etc.), return topic as null.
- Only set topic if the user clearly wants to track something meaningful.
- frequency must be a valid cron string (default: '0 * * * *' for hourly, '0 9 * * *' for daily).
- confirmation should be a short, friendly reply (1 sentence).

User message: "${userMessage}"

Return ONLY valid JSON, no markdown, no explanation:
{ "topic": "string or null", "frequency": "cron_string", "confirmation": "string" }
      `;

            const result = await model.generateContent(prompt);
            const response = result.response;
            const text = response.text();

            // Clean markdown code blocks if present
            const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(jsonStr);
        } catch (error) {
            this.lastError = error.message;
            console.error("Gemini Intent Error Details:", JSON.stringify(error, null, 2));
            console.error("Gemini Intent Message:", error.message);
            return this.mockParseIntent(userMessage);
        }
    }

    async analyzeContentGemini(textData, topic) {
        try {
            const model = await this.getActiveModel();
            if (!model) return this.mockAnalyzeContent(topic);

            const prompt = `
        Analyze this news about '${topic}':
        "${textData.substring(0, 4000)}"
        
        Return JSON ONLY: { 
            "summary": "concise summary", 
            "sentiment": "Positive/Neutral/Negative", 
            "insight": "one key strategic insight",
            "metrics": [ {"label": "Volume", "value": 75}, {"label": "Momentum", "value": 45} ] 
        }
      `;

            const result = await model.generateContent(prompt);
            const response = result.response;
            const text = response.text();

            const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(jsonStr);
        } catch (error) {
            this.lastError = error.message;
            console.error("Gemini Analysis Error:", error);
            return this.mockAnalyzeContent(topic);
        }
    }

    // --- Mocks ---

    mockParseIntent(message) {
        const lower = message.toLowerCase();

        return new Promise(resolve => {
            setTimeout(() => {
                let topic = null;
                let confirmation = "It looks like the AI service timed out briefly. Could you try saying that again?";

                const keywords = ['track', 'monitor', 'watch', 'follow', 'bitcoin', 'crypto', 'news', 'stock'];
                const hasTopic = keywords.some(k => lower.includes(k));

                if (hasTopic) {
                    // Try to extract topic even if no "track" keyword
                    const words = message.split(' ').filter(w => !['track', 'monitor', 'watch', 'follow', 'every', 'hour', 'minute', 'day', 'the', 'a', 'an'].includes(w.toLowerCase()));
                    topic = words.join(" ");
                    if (topic.length > 25) topic = topic.substring(0, 25);

                    confirmation = `(Offline Mode) I've set up a tracker for **${topic || 'your topic'}**. Check the dashboard for insights!`;
                }

                resolve({
                    topic: topic,
                    frequency: "0 * * * *",
                    confirmation: confirmation
                });
            }, 1000);
        });
    }

    mockAnalyzeContent(topic) {
        const sentiments = ['Positive', 'Neutral', 'Negative'];
        const randomSentiment = sentiments[Math.floor(Math.random() * sentiments.length)];

        const insights = [
            `Market data shows a significant uptrend for ${topic} due to recent global events.`,
            `Public sentiment around ${topic} is mixed, with rising concerns over regulatory changes.`,
            `The technology sector is rallying behind new advancements in ${topic}.`
        ];
        const randomInsight = insights[Math.floor(Math.random() * insights.length)];

        return new Promise(resolve => {
            setTimeout(() => {
                resolve({
                    summary: `Recent analyst reports regarding **${topic}** highlight increased activity and interest. Key market indicators suggest a potential shift in momentum.`,
                    sentiment: randomSentiment,
                    insight: randomInsight,
                    metrics: [
                        { label: 'Market Sentiment', value: Math.floor(Math.random() * 40) + 60 },
                        { label: 'Social Buzz', value: Math.floor(Math.random() * 30) + 40 },
                        { label: 'Media Coverage', value: Math.floor(Math.random() * 50) + 20 }
                    ]
                });
            }, 1500); // 1.5s delay for realism
        });
    }
}

module.exports = new AIService();
