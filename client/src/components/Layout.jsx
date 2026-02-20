import React from 'react';
import { Bot, LayoutDashboard, Database } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import clsx from 'clsx';

const NavItem = ({ to, icon: Icon, label }) => {
    const location = useLocation();
    const isActive = location.pathname === to;

    return (
        <Link
            to={to}
            className={clsx(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300",
                isActive
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
            )}
        >
            <Icon size={20} />
            <span className="font-medium">{label}</span>
            {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            )}
        </Link>
    );
};

const Layout = ({ children }) => {
    return (
        <div className="flex min-h-screen bg-slate-950 text-white overflow-hidden selection:bg-emerald-500/30">

            {/* Sidebar */}
            <aside className="w-64 border-r border-white/10 p-6 flex flex-col bg-slate-900/50 backdrop-blur-xl">
                <div className="flex items-center gap-3 mb-10 px-2">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                        <Bot className="text-slate-900" size={24} />
                    </div>
                    <h1 className="text-xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                        TrendPulse
                    </h1>
                </div>

                <nav className="space-y-2 flex-1">
                    <NavItem to="/" icon={LayoutDashboard} label="Dashboard" />
                    <NavItem to="/chat" icon={Bot} label="AI Assistant" />
                    {/* <NavItem to="/data" icon={Database} label="Data & Logs" /> */}
                </nav>

                <div className="mt-auto pt-6 border-t border-white/10">
                    <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-white/5">
                        <h4 className="text-xs font-semibold text-indigo-300 mb-1">Status</h4>
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            Backend Active
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto relative">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-slate-950 to-slate-950 pointer-events-none" />
                <div className="relative z-10 p-8 max-w-7xl mx-auto">
                    {children}
                </div>
            </main>

        </div>
    );
};

export default Layout;
