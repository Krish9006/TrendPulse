import React, { useState } from 'react';
import { Bot, LayoutDashboard, LogOut, Menu, X, CreditCard } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { useAuth } from '../context/AuthContext';

const NavItem = ({ to, icon: Icon, label, onClick }) => {
    const location = useLocation();
    const isActive = location.pathname === to;

    return (
        <Link
            to={to}
            onClick={onClick}
            className={clsx(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                isActive
                    ? "bg-white/10 text-white font-semibold"
                    : "text-zinc-400 hover:text-white hover:bg-white/5"
            )}
        >
            <Icon size={20} className={isActive ? "text-blue-400" : ""} />
            <span className="text-sm">{label}</span>
            {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
            )}
        </Link>
    );
};

const Layout = ({ children }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="flex flex-col md:flex-row min-h-screen bg-[#f4f4f5] text-zinc-900 overflow-hidden">
            
            {/* Mobile Header (Dark) */}
            <div className="md:hidden flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-950 relative z-20">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-md">
                        <Bot className="text-white" size={18} />
                    </div>
                    <span className="text-lg font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                        TrendPulse
                    </span>
                </div>
                <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-gray-400 hover:text-white focus:outline-none">
                    {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Sidebar Overlay */}
            {mobileMenuOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm transition-opacity"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar (Dark) */}
            <aside className={clsx(
                "fixed md:static inset-y-0 left-0 z-40 w-64 border-r border-zinc-800/50 p-6 flex flex-col bg-zinc-950 text-white transform transition-transform duration-300 ease-in-out md:translate-x-0 shadow-2xl md:shadow-none",
                mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="hidden md:flex items-center gap-3 mb-10 px-2">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <Bot className="text-white" size={22} />
                    </div>
                    <h1 className="text-2xl font-extrabold tracking-tight text-white">
                        TrendPulse
                    </h1>
                </div>

                <div className="md:hidden flex justify-between items-center mb-8 px-2">
                     <span className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Navigation</span>
                     <button onClick={() => setMobileMenuOpen(false)} className="text-gray-400 hover:text-white focus:outline-none">
                         <X size={20} />
                     </button>
                </div>

                <nav className="space-y-2 flex-1">
                    <NavItem to="/" icon={LayoutDashboard} label="Dashboard" onClick={() => setMobileMenuOpen(false)} />
                    <NavItem to="/pricing" icon={CreditCard} label="Upgrade to Pro" onClick={() => setMobileMenuOpen(false)} />
                </nav>

                <div className="mt-auto pt-6 border-t border-white/10 space-y-3">
                    {/* User Info */}
                    {user && (
                        <div className="px-2">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                    {user.name?.charAt(0).toUpperCase()}
                                </div>
                                <div className="overflow-hidden">
                                    <p className="text-sm font-medium text-white truncate">{user.name}</p>
                                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Logout */}
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
                    >
                        <LogOut size={18} />
                        <span className="text-sm font-medium">Sign out</span>
                    </button>

                    {/* Status */}
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                        <div className="flex items-center gap-2 text-xs font-medium text-zinc-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)] animate-pulse"></span>
                            Backend Active
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content (Light) */}
            <main className="flex-1 overflow-y-auto relative h-[calc(100vh-73px)] md:h-screen w-full">
                <div className="relative z-10 p-4 sm:p-6 md:p-10 max-w-7xl mx-auto">
                    {children}
                </div>
            </main>

        </div>
    );
};

export default Layout;
