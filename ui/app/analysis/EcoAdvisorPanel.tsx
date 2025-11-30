'use client';

import {useState, useMemo} from "react";
import {Loader2, MessageSquareDot} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type {YearHistoryPoint} from "./types";

interface AdvisorEntry {
    title: string;
    action: string;
    benefit: string;
    priority: "high" | "medium" | "low";
}

interface AdvisorPayload {
    entries?: AdvisorEntry[];
    summary?: string;
}

interface EcoAdvisorPanelProps {
    country: string;
    model: "linear" | "poly2" | "arima";
    historyData: YearHistoryPoint[];
    footprintSeries: Array<{ year: number; carbonFootprint?: number }>;
}

const EcoAdvisorPanel: React.FC<EcoAdvisorPanelProps> = ({country, model, historyData, footprintSeries}) => {
    const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
    const [message, setMessage] = useState<string>("");
    const [errorText, setErrorText] = useState<string>("");
    const [structured, setStructured] = useState<AdvisorPayload | null>(null);

    const canRun = historyData.length > 0;
    const normalizedFootprint = useMemo(
        () =>
            footprintSeries
                .filter((entry) => typeof entry.carbonFootprint === "number")
                .map((entry) => ({ year: entry.year, value: entry.carbonFootprint as number })),
        [footprintSeries]
    );

    const runAdvisor = async () => {
        if (!canRun) {
            return;
        }
        setStatus("loading");
        setErrorText("");
        try {
            const res = await fetch("/api/eco-advisor", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    country,
                    model,
                    historyData,
                    footprintSeries: normalizedFootprint,
                }),
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "EcoAdvisor failed");
            }

            const data = await res.json();
            const recommendation = data.recommendation;
            if (typeof recommendation === "string") {
                setMessage(recommendation);
                setStructured(null);
            } else {
                setStructured(recommendation as AdvisorPayload);
                setMessage("");
            }
            setStatus("ready");
        } catch (error) {
            setErrorText(error instanceof Error ? error.message : "Unknown error");
            setStatus("error");
        }
    };

    return (
        <div className="rounded-3xl mt-5 border border-white/15 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
            <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-amber-500/15 border border-amber-400/40 p-3 text-amber-200">
                    <MessageSquareDot className="h-5 w-5" />
                </div>
                <div>
                    <p className="text-xs uppercase tracking-[0.4em] text-slate-400">EcoAdvisor</p>
                    <h4 className="text-xl font-semibold text-white">Opportunities to cut emissions</h4>
                </div>
            </div>
            <p className="mt-2 text-sm text-slate-300">
                Generate targeted recommendations based on the latest historical inputs and forecast.
            </p>

            <div className="mt-4 flex flex-wrap gap-3">
                <button
                    type="button"
                    onClick={runAdvisor}
                    disabled={!canRun || status === "loading"}
                    className={`rounded-2xl px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] border transition ${
                        status === "loading"
                            ? "border-amber-200/50 bg-amber-400/10 text-amber-100"
                            : canRun
                                ? "border-amber-400/60 bg-amber-400/15 text-amber-100 hover:bg-amber-400/25"
                                : "border-white/15 bg-white/5 text-white/40 cursor-not-allowed"
                    }`}
                >
                    {status === "loading" ? (
                        <span className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Generating
                        </span>
                    ) : (
                        "Generate recommendation"
                    )}
                </button>
                {!canRun && (
                    <span className="text-xs text-slate-400">
                        Add at least one year of data to enable EcoAdvisor.
                    </span>
                )}
            </div>

            <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-100 whitespace-pre-line min-h-[120px]">
                {status === "idle" && "Awaiting your request."}
                {status === "loading" && (
                    <div className="flex items-center gap-2 text-amber-200">
                        <Loader2 className="h-4 w-4 animate-spin" /> Crunching the numbers…
                    </div>
                )}
                {status === "ready" && structured && structured.entries?.length ? (
                    <div className="space-y-4">
                        {structured.entries.map((entry, idx) => (
                            <div
                                key={`${entry.title}-${idx}`}
                                className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 shadow-[0_15px_40px_rgba(15,23,42,0.45)]"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <h5 className="text-base font-semibold text-white">{entry.title}</h5>
                                    <span
                                        className={`rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.3em] ${
                                            entry.priority === "high"
                                                ? "bg-rose-500/20 text-rose-200"
                                                : entry.priority === "medium"
                                                    ? "bg-amber-500/20 text-amber-200"
                                                    : "bg-sky-500/20 text-sky-200"
                                        }`}
                                    >
                                        {entry.priority}
                                    </span>
                                </div>
                                <p className="text-sm text-slate-200/90">{entry.action}</p>
                                <p className="mt-2 text-xs text-slate-300/80">
                                    <span className="font-semibold text-white">Benefit:</span> {entry.benefit}
                                </p>
                            </div>
                        ))}
                        {structured.summary && (
                            <div className="rounded-2xl border border-amber-400/40 bg-amber-400/10 p-4 text-sm text-amber-100">
                                {structured.summary}
                            </div>
                        )}
                    </div>
                ) : status === "ready" && message ? (
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                            a: (props) => (
                                <a
                                    {...props}
                                    className="text-amber-200 underline"
                                    target="_blank"
                                    rel="noreferrer"
                                />
                            ),
                            li: (props) => <li className="ml-4 list-disc" {...props} />,
                        }}
                    >
                        {message}
                    </ReactMarkdown>
                ) : null}
                {status === "error" && (
                    <div className="text-rose-200">
                        Could not load tips ({errorText}).
                        <button
                            type="button"
                            onClick={runAdvisor}
                            className="ml-2 text-amber-200 underline"
                        >
                            Retry
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EcoAdvisorPanel;
