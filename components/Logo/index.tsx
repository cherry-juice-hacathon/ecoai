import React from "react";

export default function Logo() {
    return (
        <div className={'flex gap-2'}>
            <div className="w-12 h-12 relative flex items-center justify-center">
                <svg
                    viewBox="0 0 64 64"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-full h-full"
                    aria-hidden="true"
                >
                    <defs>
                        <linearGradient
                            id="logo-gradient"
                            x1="0"
                            y1="0"
                            x2="64"
                            y2="64"
                            gradientUnits="userSpaceOnUse"
                        >
                            <stop offset="0%" stopColor="#2dd4bf" />
                            <stop offset="100%" stopColor="#22c55e" />
                        </linearGradient>
                    </defs>

                    {/* Hexagon */}
                    <path
                        d="M32 4 L58 19 V45 L32 60 L6 45 V19 Z"
                        stroke="#475569"
                        strokeWidth="2"
                        fill="rgba(30, 41, 59, 0.4)"
                        className="transition-colors group-hover:stroke-slate-500"
                    />

                    {/* CG Text */}
                    <text
                        x="32"
                        y="35"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        style={{
                            fontFamily: 'Inter, sans-serif',
                            fontWeight: 800,
                            fontSize: '26px',
                            letterSpacing: '-1px',
                        }}
                        className="transition-all select-none group-hover:filter group-hover:drop-shadow-[0_0_5px_rgba(34,197,94,0.5)]"
                    >
                        {/* C – białe */}
                        <tspan fill="#ffffff">C</tspan>

                        {/* G – gradient */}
                        <tspan fill="url(#logo-gradient)">G</tspan>
                    </text>
                </svg>


            </div>

            <div className="flex flex-col justify-center">
              <span className="font-bold text-2xl tracking-tighter text-white leading-none">
                Carbon<span
                  className="text-transparent bg-clip-text bg-gradient-to-r from-eco-400 to-teal-400">Genius</span>
              </span>
                <span
                    className="text-[10px] pl-0.5 tracking-[0.2em] text-slate-500 font-bold uppercase">Enterprise</span>
            </div>
        </div>
    )
}