"use client";

import React from "react";
import { Field, ErrorMessage } from "formik";
import { Zap } from "lucide-react";

export function EnergyConsumptionCard() {
    return (
        <div className="glass-panel rounded-3xl p-6 md:p-8 border border-yellow-400/20 bg-slate-900/50 backdrop-blur-xl shadow-2xl">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Zap size={18} className="text-yellow-400" />
                Annual electricity consumption
            </h3>

            <p className="text-xs md:text-sm text-slate-400 mb-4 max-w-lg">
                Provide your estimated total annual electricity usage for IT infrastructure and offices.
                This helps refine your CO₂ baseline.
            </p>

            <div className="grid md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-slate-200 mb-2">
                        Annual consumption (kWh)
                    </label>
                    <Field
                        type="number"
                        name="annualKwh"
                        min={0}
                        className="w-full bg-slate-950/70 border border-slate-700/80 rounded-2xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-eco-500 focus:border-eco-500 transition shadow-inner"
                        placeholder="e.g. 250000"
                    />
                    <ErrorMessage
                        name="annualKwh"
                        component="div"
                        className="mt-2 text-xs text-red-400"
                    />
                </div>
            </div>
        </div>
    );
}
