const axios = require('axios');
const path = require('path');
require('dotenv').config();

const MOCK_NEWS = [
    "Market data shows a significant uptrend due to recent global events.",
    "Public sentiment is mixed, with concerns over privacy regulations.",
    "The technology sector is rallying behind the new AI advancements.",
    "Supply chain disruptions are causing minor delays in production."
];

class NewsService {
    constructor() {
        console.log("✅ News Service: Initialized (Using NewsData.io API)");
        this.apiKey = process.env.NEWS_API_KEY;
    }

    async fetchNews(topic) {
        try {
            if (!this.apiKey) {
                console.warn("⚠️ No NEWS_API_KEY found. Falling back to mock.");
                return this.mockFetchNews(topic);
            }
            
            const query = encodeURIComponent(topic);
            // Fetch live news from NewsData.io
            const response = await axios.get(`https://newsdata.io/api/1/news?apikey=${this.apiKey}&q=${query}&language=en`);
            
            const articles = response.data.results;
            
            if (articles && articles.length > 0) {
                const topItems = articles.slice(0, 5); 
                // Return context WITH Source Name and URL so AI can extract it
                return topItems.map(a => `Title: ${a.title}\nDesc: ${a.description || a.content}\nSource: ${a.source_id}\nURL: ${a.link}`).join("\n\n---\n\n");
            } else {
                return `No recent news found for ${topic}.`;
            }
        } catch (error) {
            console.error("NewsData.io API Error:", error.response?.data || error.message);
            return this.mockFetchNews(topic);
        }
    }

    mockFetchNews(topic) {
        return Promise.resolve(
            `Latest sample news for ${topic}:\n` + MOCK_NEWS.join("\n")
        );
    }
}

module.exports = new NewsService();
