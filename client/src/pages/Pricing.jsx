import React from 'react';
import { Check, Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const PricingCard = ({ title, price, features, isPro, onUpgrade }) => {
    return (
        <div className={`p-8 rounded-2xl border ${isPro ? 'bg-white border-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.15)] relative' : 'bg-white border-zinc-200 shadow-sm'}`}>
            {isPro && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                    <Star size={12} fill="currentColor" /> Most Popular
                </div>
            )}
            <h3 className="text-xl font-bold text-zinc-900 mb-2">{title}</h3>
            <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-bold text-zinc-900">${price}</span>
                <span className="text-zinc-500">/mo</span>
            </div>
            
            <ul className="space-y-4 mb-8">
                {features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                        <Check size={20} className={isPro ? "text-blue-500 shrink-0" : "text-zinc-400 shrink-0"} />
                        <span className="text-zinc-600 text-sm">{feature}</span>
                    </li>
                ))}
            </ul>

            <button 
                onClick={onUpgrade}
                className={`w-full py-3 rounded-xl font-bold transition-colors ${
                    isPro 
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md' 
                        : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-900 border border-zinc-200'
                }`}
            >
                {isPro ? 'Upgrade to Pro' : 'Current Plan'}
            </button>
        </div>
    );
};

export default function Pricing() {
    const { user } = useAuth();

    const handleUpgrade = () => {
        // Here we would redirect to Stripe Checkout
        alert("Redirecting to Stripe Checkout...");
    };

    return (
        <div className="max-w-5xl mx-auto py-12 px-4 sm:px-6">
            <div className="text-center mb-16">
                <h1 className="text-3xl md:text-5xl font-extrabold text-zinc-900 mb-4 tracking-tight">Simple, transparent pricing</h1>
                <p className="text-lg text-zinc-500 max-w-2xl mx-auto">Get the exact data insights you need. Start for free, upgrade when you need more power.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                <PricingCard 
                    title="Free Tier" 
                    price="0" 
                    features={[
                        "Track up to 2 active topics",
                        "Basic AI Summaries",
                        "Live Google News Data",
                        "Manual refresh only"
                    ]}
                />
                
                <PricingCard 
                    title="TrendPulse Pro" 
                    price="15" 
                    isPro={true}
                    onUpgrade={handleUpgrade}
                    features={[
                        "Unlimited Topic Trackers",
                        "Advanced Data Visualization (Graphs)",
                        "Clickable Source URLs",
                        "Daily Email Reports",
                        "Automated background scheduling"
                    ]}
                />
            </div>
        </div>
    );
}
