const axios = require('axios');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const MOCK_NEWS = [
    "Market data shows a significant uptrend due to recent global events.",
    "Public sentiment is mixed, with concerns over privacy regulations.",
    "The technology sector is rallying behind the new AI advancements.",
    "Supply chain disruptions are causing minor delays in production."
];

class NewsService {
    constructor() {
        this.apiKey = process.env.NEWS_API_KEY;
        if (!this.apiKey) {
            console.warn("⚠️ No NEWS_API_KEY found. Using Mock News Service.");
        }
    }

    async fetchNews(topic) {
        if (!this.apiKey) {
            return this.mockFetchNews(topic);
        }

        try {
            const response = await axios.get(`https://newsapi.org/v2/everything`, {
                params: {
                    q: topic,
                    apiKey: this.apiKey,
                    language: 'en',
                    sortBy: 'publishedAt',
                    pageSize: 5
                }
            });

            if (response.data.articles && response.data.articles.length > 0) {
                return response.data.articles.map(a => `${a.title}. ${a.description}`).join(" ");
            } else {
                return `No recent news found for ${topic}.`;
            }
        } catch (error) {
            console.error("NewsAPI Error:", error.message);
            return this.mockFetchNews(topic);
        }
    }

    mockFetchNews(topic) {
        return Promise.resolve(
            `Latest sample news for ${topic}: ` + MOCK_NEWS.join(" ")
        );
    }
}

module.exports = new NewsService();
