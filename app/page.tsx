// app/page.tsx (or any other route, e.g. app/(marketing)/page.tsx)

import { ArrowRight, Cpu, Globe, TrendingUp, BarChart3, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

type Region = {
    name: string;
    id: string;
};

const SUPPORTED_REGIONS: Region[] = [
    { name: 'Poland', id: 'PL' },
    { name: 'Germany', id: 'DE' },
    { name: 'France', id: 'FR' },
    { name: 'Italy', id: 'IT' },
    { name: 'Norway', id: 'NO' },
    { name: 'USA', id: 'US' },
    { name: 'Japan', id: 'JP' },
];

const Flag: React.FC<{ country: string }> = ({ country }) => {
    const className =
        'w-8 h-5 rounded shadow-sm overflow-hidden inline-block object-cover relative box-border border border-white/10';

    switch (country) {
        case 'PL':
            return (
                <svg viewBox="0 0 32 20" className={className}>
                    <rect width="32" height="10" fill="#ffffff" />
                    <rect y="10" width="32" height="10" fill="#DC143C" />
                </svg>
            );
        case 'DE':
            return (
                <svg viewBox="0 0 32 20" className={className}>
                    <rect width="32" height="7" fill="#000000" />
                    <rect y="7" width="32" height="7" fill="#DD0000" />
                    <rect y="14" width="32" height="6" fill="#FFCE00" />
                </svg>
            );
        case 'FR':
            return (
                <svg viewBox="0 0 32 20" className={className}>
                    <rect width="11" height="20" fill="#0055A4" />
                    <rect x="11" width="10" height="20" fill="#ffffff" />
                    <rect x="21" width="11" height="20" fill="#EF4135" />
                </svg>
            );
        case 'IT':
            return (
                <svg viewBox="0 0 32 20" className={className}>
                    <rect width="11" height="20" fill="#009246" />
                    <rect x="11" width="10" height="20" fill="#ffffff" />
                    <rect x="21" width="11" height="20" fill="#CE2B37" />
                </svg>
            );
        case 'NO':
            return (
                <svg viewBox="0 0 32 20" className={className}>
                    <rect width="32" height="20" fill="#BA0C2F" />
                    <rect x="6" width="6" height="20" fill="#ffffff" />
                    <rect y="8" width="32" height="4" fill="#ffffff" />
                    <rect x="7.5" width="3" height="20" fill="#00205B" />
                    <rect y="9.5" width="32" height="1" fill="#00205B" />
                </svg>
            );
        case 'US':
            return (
                <svg viewBox="0 0 32 20" className={className}>
                    <rect width="32" height="20" fill="#B22234" />
                    <path
                        d="M0,2 L32,2 M0,6 L32,6 M0,10 L32,10 M0,14 L32,14 M0,18 L32,18"
                        stroke="white"
                        strokeWidth="2"
                    />
                    <rect width="14" height="11" fill="#3C3B6E" />
                    <circle cx="2" cy="2" r="0.5" fill="white" />
                    <circle cx="5" cy="2" r="0.5" fill="white" />
                    <circle cx="8" cy="2" r="0.5" fill="white" />
                    <circle cx="11" cy="2" r="0.5" fill="white" />
                    <circle cx="3.5" cy="4" r="0.5" fill="white" />
                    <circle cx="6.5" cy="4" r="0.5" fill="white" />
                    <circle cx="9.5" cy="4" r="0.5" fill="white" />
                    <circle cx="2" cy="6" r="0.5" fill="white" />
                    <circle cx="5" cy="6" r="0.5" fill="white" />
                    <circle cx="8" cy="6" r="0.5" fill="white" />
                    <circle cx="11" cy="6" r="0.5" fill="white" />
                    <circle cx="3.5" cy="8" r="0.5" fill="white" />
                    <circle cx="6.5" cy="8" r="0.5" fill="white" />
                    <circle cx="9.5" cy="8" r="0.5" fill="white" />
                </svg>
            );
        case 'JP':
            return (
                <svg viewBox="0 0 32 20" className={className}>
                    <rect width="32" height="20" fill="#ffffff" />
                    <circle cx="16" cy="10" r="6" fill="#BC002D" />
                </svg>
            );
        default:
            return null;
    }
};

export default function Page() {
    return (
        <div className="min-h-screen flex flex-col justify-center items-center relative overflow-hidden py-20">
            {/* Background Gradient Orbs */}
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-eco-500/10 rounded-full blur-[150px] -translate-x-1/3 -translate-y-1/3"></div>
            <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[150px] translate-x-1/4 translate-y-1/4"></div>

            <div className="z-10 text-center max-w-5xl px-6">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-panel border-eco-500/30 text-eco-400 text-sm font-semibold mb-8 animate-fade-in-up shadow-[0_0_20px_-5px_rgba(34,197,94,0.3)]">
                    <TrendingUp size={16} />
                    <span>Next-Gen Enterprise Sustainability</span>
                </div>

                <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-6 leading-tight">
                    Forecast your Company&apos;s <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-eco-400 via-teal-400 to-indigo-400 animate-pulse-slow">
            Carbon Trajectory
          </span>
                    .
                </h1>

                <p className="text-xl md:text-2xl text-slate-400 mb-12 max-w-3xl mx-auto leading-relaxed font-light">
                    Calculate your entire IT infrastructure&apos;s footprint and visualize a path to Net Zero with
                    AI-powered predictive modeling.
                </p>

                <div className="flex flex-col sm:flex-row gap-5 justify-center items-center mb-20">
                    <Link
                        href="/analysis"
                        className="group relative px-10 py-5 bg-eco-600 hover:bg-eco-500 text-white font-bold text-lg rounded-2xl transition-all duration-300 shadow-xl shadow-eco-900/40 flex items-center gap-3"
                    >
                        Start Strategic Analysis
                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </Link>

                    <button className="px-10 py-5 glass-panel hover:bg-white/5 text-white font-medium rounded-2xl transition-colors text-lg border border-white/10">
                        View Methodology
                    </button>
                </div>

                {/* Global Support Section */}
                <div className="w-full border-t border-b border-white/5 py-8 mb-20 backdrop-blur-sm bg-slate-900/30">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-[0.3em] mb-6 flex items-center justify-center gap-2">
                        <ShieldCheck size={14} /> Optimized for Global Regulations
                    </p>
                    <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-4">
                        {SUPPORTED_REGIONS.map((region) => (
                            <div
                                key={region.id}
                                className="flex items-center gap-3 group cursor-default"
                            >
                                <div
                                    className="filter grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-200 ease-out transform group-hover:scale-125 group-hover:-translate-y-0.5 flex items-center drop-shadow-[0_0_12px_rgba(56,189,248,0.45)]"
                                >
                                    <Flag country={region.id} />
                                </div>
                                <span className="text-slate-400 font-medium group-hover:text-white transition-colors duration-200 ease-out">
                                    {region.name}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Feature Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                    <div className="glass-panel p-8 rounded-3xl hover:border-eco-500/50 transition-colors cursor-default group">
                        <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <Cpu className="text-eco-400" size={24} />
                        </div>
                        <h3 className="text-xl text-white font-bold mb-3">Full Stack Audit</h3>
                        <p className="text-slate-400 leading-relaxed">
                            Analyze hardware, cloud, and network emissions in one unified dashboard.
                        </p>
                    </div>

                    <div className="glass-panel p-8 rounded-3xl hover:border-teal-500/50 transition-colors cursor-default group">
                        <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <BarChart3 className="text-teal-400" size={24} />
                        </div>
                        <h3 className="text-xl text-white font-bold mb-3">5-Year Forecasting</h3>
                        <p className="text-slate-400 leading-relaxed">
                            Visualize &quot;Business as Usual&quot; vs. &quot;Optimized&quot; scenarios to guide decision
                            making.
                        </p>
                    </div>

                    <div className="glass-panel p-8 rounded-3xl hover:border-indigo-500/50 transition-colors cursor-default group">
                        <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <Globe className="text-indigo-400" size={24} />
                        </div>
                        <h3 className="text-xl text-white font-bold mb-3">AI CSO Strategy</h3>
                        <p className="text-slate-400 leading-relaxed">
                            Get an executive roadmap generated by Gemini 2.5 to reduce your carbon liability.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
