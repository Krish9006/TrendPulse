import React from 'react';
import { SignIn } from '@clerk/clerk-react';
import { Activity } from 'lucide-react';

export default function Login() {
    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
            {/* Logo Section */}
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 border border-emerald-500/20 mb-6 shadow-xl shadow-emerald-500/10">
                    <Activity size={32} className="text-emerald-400" />
                </div>
                <h1 className="text-4xl font-bold text-white tracking-tight">TrendPulse</h1>
            </div>

            <SignIn 
                appearance={{
                    elements: {
                        rootBox: "mx-auto",
                        card: "bg-slate-900 border border-white/5 shadow-2xl rounded-3xl",
                        headerTitle: "text-white text-2xl font-bold",
                        headerSubtitle: "text-gray-400",
                        socialButtonsBlockButton: "bg-slate-800 border-white/10 text-white hover:bg-slate-700 transition-all",
                        socialButtonsBlockButtonText: "text-white font-medium",
                        formButtonPrimary: "bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3 rounded-xl transition-all shadow-lg shadow-emerald-500/20",
                        formFieldLabel: "text-gray-400 font-bold uppercase tracking-widest text-[10px]",
                        formFieldInput: "bg-slate-800 border-white/5 text-white rounded-xl focus:ring-emerald-500/20 focus:border-emerald-500/50",
                        footerActionLink: "text-emerald-400 hover:text-emerald-300",
                        identityPreviewText: "text-white",
                        identityPreviewEditButtonIcon: "text-emerald-400",
                    }
                }}
                routing="path" 
                path="/login" 
                signUpUrl="/signup"
                afterSignInUrl="/"
            />
        </div>
    );
}
