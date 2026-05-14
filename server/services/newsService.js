const axios = require('axios');
const path = require('path');
require('dotenv').config();

const Parser = require('rss-parser');
const parser = new Parser();

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
            const query = encodeURIComponent(topic);
            const feed = await parser.parseURL(`https://news.google.com/rss/search?q=${query}&hl=en-US&gl=US&ceid=US:en`);
            
            const articles = feed.items;
            
            if (articles && articles.length > 0) {
                const topItems = articles.slice(0, 5); 
                // Return context WITH Source Name and URL so AI can extract it
                return topItems.map(a => `Title: ${a.title}\nDesc: ${a.contentSnippet || a.content}\nSource: Google News\nURL: ${a.link}`).join("\n\n---\n\n");
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
            `Latest sample news for ${topic}:\n` + MOCK_NEWS.join("\n")
        );
    }
}

module.exports = new NewsService();
