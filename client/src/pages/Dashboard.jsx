import React, { useEffect, useState } from 'react';
import { Activity, Clock, TrendingUp, TrendingDown, Minus, Play, Pause, Trash2, ExternalLink } from 'lucide-react';
import api from '../services/api';
import clsx from 'clsx';
import { formatDistanceToNow } from 'date-fns';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';

const SentimentBadge = ({ sentiment }) => {
    const styles = {
        Positive: 'bg-emerald-50 text-emerald-600 border-emerald-200',
        Negative: 'bg-rose-50 text-rose-600 border-rose-200',
        Neutral: 'bg-zinc-100 text-zinc-600 border-zinc-200',
        Unknown: 'bg-zinc-100 text-zinc-500 border-zinc-200'
    };

    const Icon = {
        Positive: TrendingUp,
        Negative: TrendingDown,
        Neutral: Minus,
        Unknown: Activity
    }[sentiment] || Activity;

    return (
        <div className={clsx("flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border", styles[sentiment] || styles.Unknown)}>
            <Icon size={12} />
            {sentiment}
        </div>
    );
};

const TaskCard = ({ task, onToggle, onDelete, onRun }) => {
    const [running, setRunning] = useState(false);

    const handleRun = async () => {
        setRunning(true);
        await onRun(task._id);
        setRunning(false);
    };

    return (
        <div className="bg-white border border-zinc-200 rounded-2xl p-6 hover:border-blue-400 transition-all duration-200 shadow-sm hover:shadow-md">
            <div className="flex justify-between items-start mb-4">
                <h3 className="font-bold text-lg text-zinc-900 tracking-tight">{task.topic}</h3>
                <div className="flex items-center gap-1.5">
                    <button
                        onClick={handleRun}
                        disabled={running || !task.isActive}
                        title="Run analysis now"
                        className={clsx(
                            "p-1.5 rounded-lg transition-all",
                            running ? "bg-indigo-500/20 text-indigo-400 animate-spin" : "bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 disabled:opacity-30"
                        )}
                    >
                        <Activity size={16} />
                    </button>
                    <button
                        onClick={() => onToggle(task._id)}
                        title={task.isActive ? 'Pause tracker' : 'Resume tracker'}
                        className={clsx("p-1.5 rounded-lg transition-colors", task.isActive ? "bg-blue-50 text-blue-600 hover:bg-blue-100" : "bg-zinc-100 text-zinc-500 hover:text-zinc-700")}
                    >
                        {task.isActive ? <Pause size={16} /> : <Play size={16} />}
                    </button>
                    <button
                        onClick={() => onDelete(task._id)}
                        title="Delete tracker"
                        className="p-1.5 rounded-lg bg-rose-50 text-rose-500 hover:bg-rose-100 transition-colors"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>

            <div className="space-y-2 text-sm text-zinc-500">
                <div className="flex items-center gap-2">
                    <Clock size={14} />
                    <span>{task.frequency === '0 * * * *' ? 'Hourly Updates' : task.frequency}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Activity size={14} />
                    <span>Last Run: {task.lastRun ? formatDistanceToNow(new Date(task.lastRun), { addSuffix: true }) : 'Never'}</span>
                </div>
            </div>
        </div>
    );
};


const AnalysisCard = ({ result }) => {
    return (
        <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
                <div className="flex flex-col">
                    <span className="text-xs font-bold text-blue-600 tracking-wide uppercase mb-1">{result.topic || result.taskId?.topic || 'Trend Insight'}</span>
                    <span className="text-xs text-gray-500">{formatDistanceToNow(new Date(result.timestamp), { addSuffix: true })}</span>
                </div>

                <SentimentBadge sentiment={result.sentiment} />
            </div>

            <p className="text-zinc-600 text-sm leading-relaxed mb-4">
                {result.summary}
            </p>

            {result.insight && (
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-4">
                    <p className="text-xs text-blue-700 font-bold mb-1 flex items-center gap-1">💡 Key Insight</p>
                    <p className="text-xs text-blue-800 leading-relaxed">{result.insight}</p>
                </div>
            )}

            {/* Render Graph if metrics exist */}
            {result.metrics && result.metrics.length > 0 && (
                <div className="mt-5 mb-5 p-5 bg-zinc-50 rounded-xl border border-zinc-100">
                    <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider mb-4">Data Visualization</p>
                    <div className="h-40 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={result.metrics}>
                                <XAxis dataKey="label" stroke="#a1a1aa" fontSize={10} tickLine={false} axisLine={false} />
                                <Tooltip 
                                    cursor={{ fill: '#f4f4f5' }}
                                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e4e4e7', borderRadius: '8px', color: '#18181b' }}
                                    itemStyle={{ color: '#2563eb' }}
                                />
                                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* Render Sources if exist */}
            {result.sources && result.sources.length > 0 && (
                <div className="mt-5 border-t border-zinc-100 pt-5">
                    <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider mb-3">Sources</p>
                    <div className="flex flex-wrap gap-2">
                        {result.sources.map((source, idx) => (
                            <a 
                                key={idx} 
                                href={source.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-3 py-1.5 bg-white border border-zinc-200 hover:border-blue-400 hover:bg-zinc-50 rounded-lg text-xs font-medium text-zinc-600 transition-all"
                            >
                                <span className="truncate max-w-[150px]">{source.publisher || 'Source'}</span>
                                <ExternalLink size={12} className="text-blue-500" />
                            </a>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const CreateTracker = ({ onTaskAdded }) => {
    const [topic, setTopic] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!topic.trim()) return;
        setLoading(true);
        try {
            await api.post('/tasks/chat', { message: `Track ${topic} every hour` });
            setTopic('');
            onTaskAdded();
        } catch (error) {
            console.error(error);
            const message = error.response?.data?.message || 'Failed to add tracker';
            alert(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="mb-12 flex gap-3">
            <input 
                value={topic} 
                onChange={(e) => setTopic(e.target.value)} 
                placeholder="Enter a topic to track (e.g., Apple Stocks, Startup News)" 
                className="flex-1 bg-white border border-zinc-200 rounded-2xl px-6 py-4 text-base text-zinc-900 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-zinc-400 shadow-sm" 
            />
            <button disabled={loading} className="bg-zinc-900 hover:bg-zinc-800 text-white px-8 py-4 rounded-2xl font-bold text-base shadow-sm disabled:opacity-50 transition-all">
                {loading ? 'Setting up...' : '+ Add Tracker'}
            </button>
        </form>
    );
};

export default function Dashboard() {
    const [tasks, setTasks] = useState([]);
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const [tasksRes, resultsRes] = await Promise.all([
                api.get('/tasks'),
                api.get('/analysis')
            ]);
            setTasks(tasksRes.data);
            setResults(resultsRes.data);
        } catch (error) {
            console.error("Failed to fetch data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, []);

    const handleRunTask = async (id) => {
        try {
            await api.post(`/analysis/${id}/run`);
            await fetchData(); // Refresh both tasks (lastRun) and insights
        } catch (error) {
            console.error("Run failed", error);
            alert("Analysis failed. Please check your API keys or try again later.");
        }
    };

    const handleToggleTask = async (id) => {
        try {
            await api.patch(`/tasks/${id}/toggle`);
            setTasks(tasks.map(t => t._id === id ? { ...t, isActive: !t.isActive } : t));
        } catch (error) {
            console.error("Toggle failed", error);
        }
    };

    const handleDeleteTask = async (id) => {
        if (!window.confirm('Delete this tracker?')) return;
        try {
            await api.delete(`/tasks/${id}`);
            setTasks(tasks.filter(t => t._id !== id));
        } catch (error) {
            console.error("Delete failed", error);
        }
    };

    if (loading) return <div className="text-emerald-400 animate-pulse p-8">Loading dashboard...</div>;


    return (
        <div className="space-y-8">

            {/* Header */}
            <div className="mb-10">
                <h2 className="text-4xl md:text-5xl font-extrabold text-zinc-900 tracking-tight mb-4">Analytics Dashboard</h2>
                <p className="text-lg text-zinc-500">Add trackers, monitor trends, and get AI-driven data visualizations.</p>
            </div>

            <CreateTracker onTaskAdded={fetchData} />

            {/* Active Tasks Grid */}
            <section className="mb-14">
                <h3 className="text-xl font-bold text-zinc-900 mb-6 flex items-center gap-3">
                    <Activity className="text-blue-500" size={22} />
                    Active Trackers
                </h3>
                {tasks.length === 0 ? (
                    <div className="p-10 bg-white border border-dashed border-zinc-300 rounded-2xl text-center text-zinc-500 text-base shadow-sm">
                        No active tasks. Create a tracker above.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {tasks.map(task => (
                            <TaskCard
                                key={task._id}
                                task={task}
                                onToggle={handleToggleTask}
                                onDelete={handleDeleteTask}
                                onRun={handleRunTask}
                            />
                        ))}
                    </div>

                )}
            </section>

            {/* Analysis Feed */}
            <section>
                <h3 className="text-xl font-bold text-zinc-900 mb-6 flex items-center gap-3">
                    <TrendingUp className="text-blue-500" size={22} />
                    Latest Insights
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {results.length === 0 ? (
                        <p className="text-zinc-500 text-base col-span-full">No analysis results yet. Wait for the scheduler or trigger a task manually.</p>
                    ) : (
                        results.map(res => <AnalysisCard key={res._id} result={res} />)
                    )}
                </div>
            </section>

        </div>
    );
}
