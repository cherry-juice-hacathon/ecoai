import React from "react";

export default function Footer() {
    return (
        <footer className="border-t border-slate-800 bg-slate-900 py-12 mt-12 relative overflow-hidden">
            <div
                className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-eco-500/50 to-transparent"></div>
            <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
                <p className="text-slate-500 text-sm">
                    © {new Date().getFullYear()} CarbonGenius Enterprise. All rights reserved.
                </p>
                <div className="flex gap-4">
                    <div
                        className="w-2 h-2 rounded-full bg-eco-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse"></div>
                    <div
                        className="w-2 h-2 rounded-full bg-teal-500 shadow-[0_0_8px_rgba(20,184,166,0.6)] animate-pulse delay-75"></div>
                    <div
                        className="w-2 h-2 rounded-full bg-sky-500 shadow-[0_0_8px_rgba(14,165,233,0.6)] animate-pulse delay-150"></div>
                </div>
            </div>
        </footer>
    )
}