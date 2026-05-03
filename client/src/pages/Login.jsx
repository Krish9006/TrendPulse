import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Activity, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';

export default function Login() {
    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPass, setShowPass] = useState(false);
    const [success, setSuccess] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        if (searchParams.get('verified') === 'true') {
            setSuccess('Email verified successfully! Welcome to the premium club.');
        }
    }, [searchParams]);

    const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await api.post('/auth/login', form);
            login(res.data.user, res.data.token);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        setLoading(true);
        try {
            const res = await api.post('/auth/google-login', { idToken: credentialResponse.credential });
            login(res.data.user, res.data.token);
            navigate('/');
        } catch (err) {
            setError('Google sign-in failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 selection:bg-emerald-500/30">
            {/* Background effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[120px]" />
            </div>

            <div className="w-full max-w-md relative">
                {/* Logo Section */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 border border-emerald-500/20 mb-6 shadow-xl shadow-emerald-500/10">
                        <Activity size={32} className="text-emerald-400" />
                    </div>
                    <h1 className="text-4xl font-bold text-white tracking-tight">TrendPulse</h1>
                    <p className="text-gray-400 mt-2 font-medium">Intelligence at your fingertips</p>
                </div>

                {/* Main Card */}
                <div className="bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-3xl p-8 shadow-2xl overflow-hidden relative group">
                    <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                    
                    {/* Google Login Section */}
                    <div className="mb-8">
                        <div className="flex justify-center">
                            <GoogleLogin
                                onSuccess={handleGoogleSuccess}
                                onError={() => setError('Google Sign-In was unsuccessful.')}
                                theme="filled_black"
                                shape="pill"
                                width="100%"
                                text="continue_with"
                            />
                        </div>
                        
                        <div className="relative my-8">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-white/5"></div>
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-slate-900 px-4 text-gray-500 font-semibold tracking-wider">Or continue with</span>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">Email</label>
                            <div className="relative group">
                                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-emerald-400 transition-colors" />
                                <input
                                    type="email"
                                    name="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    required
                                    placeholder="name@company.com"
                                    className="w-full bg-slate-800/50 border border-white/5 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">Password</label>
                            <div className="relative group">
                                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-emerald-400 transition-colors" />
                                <input
                                    type={showPass ? 'text' : 'password'}
                                    name="password"
                                    value={form.password}
                                    onChange={handleChange}
                                    required
                                    placeholder="••••••••"
                                    className="w-full bg-slate-800/50 border border-white/5 rounded-xl pl-12 pr-12 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPass(v => !v)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-emerald-400 transition-colors"
                                >
                                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm font-medium flex items-center gap-3 animate-shake">
                                <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                {error}
                            </div>
                        )}
                        {success && (
                            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3 text-emerald-400 text-sm font-medium flex items-center gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                {success}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-500/50 text-slate-950 font-bold py-4 rounded-xl transition-all shadow-lg shadow-emerald-500/20 active:scale-[0.98] disabled:active:scale-100"
                        >
                            {loading ? 'Authenticating...' : 'Sign in to Dashboard'}
                        </button>
                    </form>

                    <p className="text-center text-gray-500 text-sm mt-8 font-medium">
                        New to TrendPulse?{' '}
                        <Link to="/signup" className="text-emerald-400 hover:text-emerald-300 underline underline-offset-4 decoration-emerald-500/30 transition-colors">
                            Create account
                        </Link>
                    </p>
                </div>
                
                {/* Footer link */}
                <div className="text-center mt-8">
                    <p className="text-xs text-gray-600 font-bold uppercase tracking-widest">Built for the future of trends</p>
                </div>
            </div>
        </div>
    );
}
