import React, { useEffect, useState } from 'react';
import { Activity, Clock, TrendingUp, TrendingDown, Minus, Play, Pause, Trash2 } from 'lucide-react';
import api from '../services/api';
import clsx from 'clsx';
import { formatDistanceToNow } from 'date-fns';

const SentimentBadge = ({ sentiment }) => {
    const styles = {
        Positive: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        Negative: 'bg-red-500/10 text-red-400 border-red-500/20',
        Neutral: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        Unknown: 'bg-gray-500/10 text-gray-400 border-gray-500/20'
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

const TaskCard = ({ task, onToggle, onDelete }) => {
    return (
        <div className="bg-slate-900/50 backdrop-blur-md border border-white/5 rounded-xl p-5 hover:border-emerald-500/30 transition-colors group">
            <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold text-lg text-white group-hover:text-emerald-400 transition-colors">{task.topic}</h3>
                <div className="flex items-center gap-1.5">
                    <button
                        onClick={() => onToggle(task._id)}
                        title={task.isActive ? 'Pause tracker' : 'Resume tracker'}
                        className={clsx("p-1.5 rounded-lg transition-colors", task.isActive ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20" : "bg-white/5 text-gray-400 hover:bg-white/10")}
                    >
                        {task.isActive ? <Pause size={16} /> : <Play size={16} />}
                    </button>
                    <button
                        onClick={() => onDelete(task._id)}
                        title="Delete tracker"
                        className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>

            <div className="space-y-2 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                    <Clock size={14} />
                    <span>{task.frequency === '0 * * * *' ? 'Hourly' : task.frequency === '0 9 * * *' ? 'Daily' : task.frequency}</span>
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
        <div className="bg-slate-800/40 border border-white/5 rounded-xl p-5 hover:bg-slate-800/60 transition-colors">
            <div className="flex justify-between items-start mb-3">
                <div className="flex flex-col">
                    <span className="text-xs font-medium text-emerald-400 mb-1">{result.taskId?.topic || 'Unknown Topic'}</span>
                    <span className="text-xs text-gray-500">{formatDistanceToNow(new Date(result.timestamp), { addSuffix: true })}</span>
                </div>
                <SentimentBadge sentiment={result.sentiment} />
            </div>

            <p className="text-gray-300 text-sm leading-relaxed mb-4">
                {result.summary}
            </p>

            {result.insight && (
                <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-3">
                    <p className="text-xs text-indigo-300 font-medium mb-1">💡 Key Insight</p>
                    <p className="text-xs text-indigo-200/80">{result.insight}</p>
                </div>
            )}
        </div>
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

    if (loading) return <div className="text-emerald-400 animate-pulse">Loading dashboard...</div>;

    return (
        <div className="space-y-8">

            {/* Header */}
            <div>
                <h2 className="text-3xl font-bold text-white mb-2">Dashboard</h2>
                <p className="text-gray-400">Overview of your active trackers and latest insights.</p>
            </div>

            {/* Active Tasks Grid */}
            <section>
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <Activity className="text-emerald-400" size={20} />
                    Active Trackers
                </h3>
                {tasks.length === 0 ? (
                    <div className="p-8 border border-dashed border-white/10 rounded-xl text-center text-gray-500">
                        No active tasks. Go to "AI Assistant" to create one.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {tasks.map(task => (
                            <TaskCard key={task._id} task={task} onToggle={handleToggleTask} onDelete={handleDeleteTask} />
                        ))}
                    </div>
                )}
            </section>

            {/* Analysis Feed */}
            <section>
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <TrendingUp className="text-indigo-400" size={20} />
                    Latest Insights
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {results.length === 0 ? (
                        <p className="text-gray-500 col-span-full">No analysis results yet. Wait for the scheduler or trigger a task manually.</p>
                    ) : (
                        results.map(res => <AnalysisCard key={res._id} result={res} />)
                    )}
                </div>
            </section>

        </div>
    );
}
