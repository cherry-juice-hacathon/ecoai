"use client";

import { Field, ErrorMessage, useFormikContext } from "formik";
import { Globe2 } from "lucide-react";
import React from "react";
import type { FormValues } from "./types";

const countries = [
    { value: "Poland", label: "Poland" },
    { value: "Germany", label: "Germany" },
    { value: "France", label: "France" },
    { value: "Italy", label: "Italy" },
    { value: "Norway", label: "Norway" },
    { value: "USA", label: "United States" },
    { value: "Japan", label: "Japan" },
];

export function CountrySelect() {
    const { values, setFieldValue } = useFormikContext<FormValues>();
    const selectedCountry = values.country;

    return (
        <div className="glass-panel rounded-3xl p-6 md:p-8 border border-eco-500/20 bg-slate-900/50 backdrop-blur-xl shadow-2xl">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Globe2 size={18} className="text-eco-400" />
                Select country
            </h3>

            <p className="text-xs md:text-sm text-slate-400 mb-4 max-w-lg">
                Different countries have different energy mixes and emission factors. Start by selecting
                where your company primarily operates.
            </p>

            <div className="space-y-4">
                <label className="block text-sm font-medium text-slate-200">Country</label>
                <div className="relative group">
                    <Field
                        as="select"
                        name="country"
                        className="w-full bg-slate-950/70 border border-slate-700/80 rounded-2xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-eco-500 focus:border-eco-500 transition shadow-inner appearance-none pr-10"
                    >
                        {countries.map((c) => (
                            <option key={c.value} value={c.value}>
                                {c.label}
                            </option>
                        ))}
                    </Field>
                    <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-500 text-xs transition-transform duration-150 ease-out group-hover:scale-110 group-hover:text-eco-400">
                        <Globe2 className="w-4 h-4" />
                    </span>
                </div>
                <ErrorMessage
                    name="country"
                    component="div"
                    className="mt-2 text-xs text-red-400"
                />
            </div>
        </div>
    );
}
