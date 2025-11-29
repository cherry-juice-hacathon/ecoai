import React from "react";
import Link from "next/link";
import Logo from "@/components/Logo";

export default function NavBar() {
    return (
        <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-slate-900/80 backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                <Link href={'/'}
                    className="flex items-center gap-4 cursor-pointer group"
                >
               <Logo />
                </Link>

                <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
                    <span
                        className="hover:text-white transition-colors cursor-pointer hover:text-eco-400">Methodology</span>
                    <span
                        className="hover:text-white transition-colors cursor-pointer hover:text-eco-400">Enterprise</span>
                    <span className="hover:text-white transition-colors cursor-pointer hover:text-eco-400">About</span>
                    <button
                        className="px-5 py-2 rounded-full border border-slate-700 hover:border-eco-500 hover:bg-eco-500/10 text-white transition-all">
                        Contact Sales
                    </button>
                </div>
            </div>
        </nav>
    )
}