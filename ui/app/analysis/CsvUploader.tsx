"use client";

import {useState, ChangeEvent} from "react";
import {useFormikContext} from "formik";
import type {FormValues, YearlyEntry} from "./types";
import {UploadCloud, Info} from "lucide-react";

const REQUIRED_COLUMNS = [
    "year",
    "annualKwh",
    "laptops",
    "monitors",
    "servers",
    "cloudCo2",
    "fuelPetrol",
    "fuelDiesel",
    "fuelLpg",
    "flightMiles",
] as const;

type CsvRow = Record<string, string>;

const parseNumber = (value: string): number => {
    if (!value) return 0;
    const normalized = value.replace(/\s+/g, "").replace(/,/g, ".");
    const num = Number(normalized);
    return Number.isFinite(num) ? num : 0;
};

const sanitizeYear = (value: string): number | null => {
    const year = Number(value.trim());
    if (!Number.isFinite(year)) return null;
    if (year < 1900 || year > 2100) return null;
    return year;
};

const toCsvRows = (text: string): CsvRow[] => {
    const lines = text
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line.length > 0);

    if (lines.length < 2) {
        throw new Error("CSV must contain a header row and at least one data row.");
    }

    const headers = lines[0]
        .split(",")
        .map((h) => h.trim());

    const missing = REQUIRED_COLUMNS.filter((col) => !headers.includes(col));
    if (missing.length > 0) {
        throw new Error(`Missing required columns: ${missing.join(", ")}`);
    }

    return lines.slice(1).map((line) => {
        const parts = line.split(",");
        const row: CsvRow = {};
        headers.forEach((header, idx) => {
            row[header] = parts[idx]?.trim() ?? "";
        });
        return row;
    });
};

export const CsvUploader = () => {
    const {values, setFieldValue} = useFormikContext<FormValues>();
    const [status, setStatus] = useState<{type: "success" | "error"; message: string} | null>(null);

    const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        event.target.value = "";
        if (!file) return;

        try {
            const text = await file.text();
            const rows = toCsvRows(text);

            const nextYearlyData = {...values.yearlyData};
            const importedYears: number[] = [];

            rows.forEach((row) => {
                const year = sanitizeYear(row.year);
                if (year === null) {
                    throw new Error(`Invalid year value: "${row.year}".`);
                }
                const entry: YearlyEntry = {
                    annualKwh: parseNumber(row.annualKwh),
                    laptops: parseNumber(row.laptops),
                    monitors: parseNumber(row.monitors),
                    servers: parseNumber(row.servers),
                    cloudCo2: parseNumber(row.cloudCo2),
                    fuelPetrol: parseNumber(row.fuelPetrol),
                    fuelDiesel: parseNumber(row.fuelDiesel),
                    fuelLpg: parseNumber(row.fuelLpg),
                    flightMiles: parseNumber(row.flightMiles),
                };
                nextYearlyData[String(year)] = entry;
                importedYears.push(year);
            });

            if (importedYears.length === 0) {
                throw new Error("No valid data rows found in CSV.");
            }

            const mergedYears = Array.from(new Set([...(values.selectedYears || []), ...importedYears])).sort((a, b) => a - b);

            setFieldValue("yearlyData", nextYearlyData);
            setFieldValue("selectedYears", mergedYears);

            setStatus({
                type: "success",
                message: `Loaded ${importedYears.length} year${importedYears.length === 1 ? "" : "s"} from ${file.name}.`,
            });
        } catch (error) {
            setStatus({
                type: "error",
                message: error instanceof Error ? error.message : "Failed to parse CSV.",
            });
        }
    };

    return (
        <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5 shadow-inner">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                <UploadCloud className="h-4 w-4" />
                Bulk import via CSV
            </div>
            <p className="mt-2 text-xs text-slate-400">
                Provide a file with columns: {REQUIRED_COLUMNS.join(", ")}. Values should be numeric; the first row must be the header.
            </p>

            <label className="mt-4 flex flex-col items-center justify-center rounded-2xl border border-dashed border-emerald-400/40 bg-emerald-400/5 px-4 py-10 text-center text-slate-200 cursor-pointer hover:border-emerald-300">
                <input type="file" accept=".csv" className="hidden" onChange={handleFileChange} />
                <UploadCloud className="h-8 w-8 text-emerald-300" />
                <span className="mt-2 text-sm font-semibold">Drop CSV or click to browse</span>
                <span className="text-[11px] text-emerald-200/70">We will merge data into selected years automatically.</span>
            </label>

            <div className="mt-4 flex items-start gap-2 text-xs text-slate-400">
                <Info className="mt-0.5 h-3.5 w-3.5 text-slate-500" />
                <p>
                    Tip: you can export from spreadsheets with commas as separators. The importer is case-sensitive, so double-check column names.
                </p>
            </div>

            {status && (
                <div
                    className={`mt-4 rounded-xl px-3 py-2 text-xs font-semibold ${
                        status.type === "success"
                            ? "border border-emerald-400/40 bg-emerald-400/10 text-emerald-100"
                            : "border border-rose-400/40 bg-rose-400/10 text-rose-100"
                    }`}
                >
                    {status.message}
                </div>
            )}
        </div>
    );
};

