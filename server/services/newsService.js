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
        console.log("✅ News Service: Initialized (Using Google News RSS)");
    }

    async fetchNews(topic) {
        try {
            const Parser = require('rss-parser');
            const parser = new Parser();
            
            // Format google news search url safely
            const query = encodeURIComponent(topic);
            const feed = await parser.parseURL(`https://news.google.com/rss/search?q=${query}&hl=en-US&gl=US&ceid=US:en`);
            
            if (feed.items && feed.items.length > 0) {
                const topItems = feed.items.slice(0, 8); // Send up to 8 top news snippets to Llama-3 
                return topItems.map(a => `${a.title}.`).join(" ");
            } else {
                return `No recent news found for ${topic}.`;
            }
        } catch (error) {
            console.error("Google News RSS Error:", error.message);
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
