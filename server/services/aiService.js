const OpenAI = require('openai');
const { GoogleGenerativeAI } = require('@google/generative-ai');
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

        if (this.openaiKey) {
            this.openai = new OpenAI({ apiKey: this.openaiKey });
            console.log("✅ AI Service: Using OpenAI");
        } else if (this.geminiKey) {
            this.genAI = new GoogleGenerativeAI(this.geminiKey);
            // Use gemini-1.5-flash (standard stable model)
            this.geminiModel = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            console.log("✅ AI Service: Using Google Gemini (gemini-1.5-flash)");
        } else {
            console.warn("⚠️ No AI API Key found (OpenAI or Gemini). Using Mock AI Service.");
        }
    }

    async parseIntent(userMessage) {
        if (this.openaiKey) return this.parseIntentOpenAI(userMessage);
        if (this.geminiKey) return this.parseIntentGemini(userMessage);
        return this.mockParseIntent(userMessage);
    }

    async analyzeContent(textData, topic) {
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

    // --- Gemini Methods ---

    async parseIntentGemini(userMessage) {
        try {
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

            const result = await this.geminiModel.generateContent(prompt);
            const response = result.response;
            const text = response.text();

            // Clean markdown code blocks if present
            const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(jsonStr);
        } catch (error) {
            console.error("Gemini Intent Error Details:", JSON.stringify(error, null, 2));
            console.error("Gemini Intent Message:", error.message);
            return this.mockParseIntent(userMessage);
        }
    }

    async analyzeContentGemini(textData, topic) {
        try {
            const prompt = `
        Analyze this news about '${topic}':
        "${textData.substring(0, 4000)}"
        
        Return JSON ONLY: { "summary": "concise summary", "sentiment": "Positive/Neutral/Negative", "insight": "one key strategic insight" }
      `;

            const result = await this.geminiModel.generateContent(prompt);
            const response = result.response;
            const text = response.text();

            const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(jsonStr);
        } catch (error) {
            console.error("Gemini Analysis Error:", error);
            return this.mockAnalyzeContent(topic);
        }
    }

    // --- Mocks ---

    mockParseIntent(message) {
        const lower = message.toLowerCase();

        // Simulating AI processing delay
        return new Promise(resolve => {
            setTimeout(() => {
                let response = {
                    topic: null,
                    frequency: null,
                    confirmation: "I'm running in **Offline Mode** (AI Key issue detected). Try saying 'Track Bitcoin' to see how I work!"
                };

                if (lower.includes("track") || lower.includes("monitor") || lower.includes("watch") || lower.includes("follow")) {
                    const words = message.split(' ');
                    // improved extraction logic
                    const trackIndex = words.findIndex(w => ['track', 'monitor', 'watch', 'follow'].some(k => w.toLowerCase().includes(k)));

                    if (trackIndex !== -1 && trackIndex < words.length - 1) {
                        let topic = words.slice(trackIndex + 1).join(" ").replace("every", "").replace("hour", "").replace("minute", "").trim();
                        // Basic cleanup
                        if (topic.length > 25) topic = topic.substring(0, 25) + "...";

                        response = {
                            topic: topic,
                            frequency: "0 * * * *", // Default to hourly
                            confirmation: `(Offline AI) I've set up a tracker for **${topic}**. I'll check for updates every hour.`
                        };
                    }
                }
                resolve(response);
            }, 1000); // 1.5s delay for realism
        });
    }

    mockAnalyzeContent(topic) {
        const sentiments = ['Positive', 'Neutral', 'Negative'];
        const randomSentiment = sentiments[Math.floor(Math.random() * sentiments.length)];


        const insights = [
            `Market data shows a significant uptrend for ${topic} due to recent global events.`,
            `Public sentiment around ${topic} is mixed, with rising concerns over regulatory changes.`,
            `The technology sector is rallying behind new advancements in ${topic}.`,
            `Supply chain disruptions are causing minor delays, impacting ${topic} availability.`,
            `Analysts predict a volatile week for ${topic} as earnings reports approach.`
        ];
        const randomInsight = insights[Math.floor(Math.random() * insights.length)];

        return new Promise(resolve => {
            setTimeout(() => {
                resolve({
                    summary: `Recent analyst reports regarding **${topic}** highlight increased activity and interest. Key market indicators suggest a potential shift in momentum.`,
                    sentiment: randomSentiment,
                    insight: randomInsight
                });
            }, 1500); // 1.5s delay for realism
        });
    }
}

module.exports = new AIService();
