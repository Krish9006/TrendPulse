import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import api from '../services/api';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

const MessageBubble = ({ message }) => {
    const isUser = message.role === 'user';

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={clsx("flex gap-4 mb-6", isUser ? "flex-row-reverse" : "flex-row")}
        >
            <div className={clsx(
                "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                isUser ? "bg-indigo-500/20 text-indigo-400" : "bg-emerald-500/20 text-emerald-400"
            )}>
                {isUser ? <User size={16} /> : <Bot size={16} />}
            </div>

            <div className={clsx(
                "max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm",
                isUser ? "bg-indigo-600 text-white rounded-tr-none" : "bg-slate-800 text-gray-200 border border-white/5 rounded-tl-none"
            )}>
                {message.content}
                {message.task && (
                    <div className="mt-3 p-3 bg-slate-900/50 rounded-lg border border-emerald-500/20">
                        <div className="text-xs font-semibold text-emerald-400 mb-1 flex items-center gap-1">
                            <Sparkles size={12} /> Task Created
                        </div>
                        <div className="text-xs text-gray-400">
                            Topic: <span className="text-white">{message.task.topic}</span>
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default function Chat() {
    const [messages, setMessages] = useState([
        { role: 'assistant', content: "Hello! I'm TrendPulse AI. Tell me what topics you want to track (e.g., 'Track Bitcoin every hour')." }
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMsg = { role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setLoading(true);

        try {
            const res = await api.post('/tasks/chat', { message: userMsg.content });

            const botMsg = {
                role: 'assistant',
                content: res.data.reply,
                task: res.data.task
            };

            setMessages(prev => [...prev, botMsg]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I encountered an error connecting to the server." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col max-w-3xl mx-auto">
            <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar">
                {messages.map((msg, i) => <MessageBubble key={i} message={msg} />)}
                {loading && (
                    <div className="flex gap-4 mb-6">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                            <Bot size={16} />
                        </div>
                        <div className="bg-slate-800 p-4 rounded-2xl rounded-tl-none border border-white/5 flex items-center gap-2">
                            <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSend} className="mt-4 relative">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask me to track a topic..."
                    className="w-full bg-slate-800 border-none rounded-xl py-4 pl-6 pr-14 text-white placeholder-gray-500 focus:ring-2 focus:ring-emerald-500/50 shadow-lg"
                />
                <button
                    type="submit"
                    disabled={loading || !input.trim()}
                    className="absolute right-2 top-2 p-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Send size={20} />
                </button>
            </form>
        </div>
    );
}
