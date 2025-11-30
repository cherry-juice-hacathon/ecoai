import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Fragment, useMemo, useState, useEffect, useCallback } from "react";
import type { YearHistoryPoint } from "./types";
import { fetchTrendsForecast } from "../../functions/trendsApi";
import { calculateTotalFootprint } from "../../functions/co2Api";
import { Loader2, Sparkles, MessageSquareDot } from "lucide-react";
import EcoAdvisorPanel from "./EcoAdvisorPanel";

const METRICS = [
    { key: "annualKwh", label: "Electricity (kWh)", color: "#22c55e" },
    { key: "laptops", label: "Laptops", color: "#60a5fa" },
    { key: "monitors", label: "Monitors", color: "#34d399" },
    { key: "servers", label: "Servers", color: "#f472b6" },
    { key: "cloudCo2", label: "Cloud CO₂", color: "#38bdf8" },
    { key: "flightMiles", label: "Flight miles", color: "#a855f7" },
    { key: "fuelPetrol", label: "Petrol (L)", color: "#fb7185" },
    { key: "fuelDiesel", label: "Diesel (L)", color: "#eab308" },
    { key: "fuelLpg", label: "LPG (L)", color: "#2dd4bf" },
] as const;

interface YearTrendsChartProps {
    country: string;
    selectedModel: "linear" | "poly2" | "arima";
    predictionYears: number;
    historyData: YearHistoryPoint[];
    onBack: () => void;
}

const YearTrendsChart: React.FC<YearTrendsChartProps> = ({
                                                             country,
                                                             selectedModel,
                                                             predictionYears,
                                                             historyData,
                                                             onBack,
                                                         }) => {
    const [forecastData, setForecastData] = useState<YearHistoryPoint[]>([]);
    const [predicting, setPredicting] = useState(false);
    const [footprintByYear, setFootprintByYear] = useState<Record<number, number>>({});
    const [perMetricFootprint, setPerMetricFootprint] = useState<Record<string, Record<number, number>>>({});
    const [perMetricLoading, setPerMetricLoading] = useState(false);
    const [modelWarning, setModelWarning] = useState<string | null>(null);

    const predictSeries = useCallback(
        async (): Promise<YearHistoryPoint[]> => {
            if (historyData.length < 2) {
                return [];
            }

            const stepsAhead = Math.min(Math.max(predictionYears, 1), 5);
            const payload = await Promise.all(
                METRICS.map(async (metric) => {
                    const response = await fetchTrendsForecast({
                        years: historyData.map((d) => d.year),
                        values: historyData.map((d) => d[metric.key] as number),
                        stepsAhead,
                        model: selectedModel,
                    });
                    return {
                        key: metric.key,
                        forecast: response.forecast.map((point) => {
                            const raw = point.predicted_value ?? 0;
                            if (!Number.isFinite(raw) || raw < 0) {
                                return 0;
                            }
                            return Math.ceil(raw);
                        }),
                    };
                })
            );

            const baseYear = historyData[historyData.length - 1]?.year ?? new Date().getFullYear();
            return Array.from({ length: stepsAhead }).map((_, idx) => {
                const futureYear = baseYear + idx + 1;
                const next: Partial<YearHistoryPoint> = { year: futureYear };
                for (const item of payload) {
                    next[item.key] = item.forecast[idx] ?? 0;
                }
                return next as YearHistoryPoint;
            });
        },
        [historyData, selectedModel, predictionYears]
    );

    const countCarbonFootprint = useCallback(
        async (dataset: YearHistoryPoint[]): Promise<Record<number, number>> => {
            if (!country || dataset.length === 0) {
                return {};
            }

            const entries = await Promise.all(
                dataset.map(async (entry) => {
                    try {
                        const response = await calculateTotalFootprint({
                            country,
                            year: entry.year,
                            energy_kwh: entry.annualKwh ?? 0,
                            laptops_count: entry.laptops ?? 0,
                            monitors_count: entry.monitors ?? 0,
                            servers_count: entry.servers ?? 0,
                            cloud_emission: entry.cloudCo2 ?? 0,
                            fuel_type: "mixed",
                            fuel_consumption:
                                (entry.fuelPetrol ?? 0) +
                                (entry.fuelDiesel ?? 0) +
                                (entry.fuelLpg ?? 0),
                            model: selectedModel,
                        });
                        const total = response.WYNIK_KONCOWY?.TOTAL_FOOTPRINT_KG ?? 0;
                        return { year: entry.year, total: Math.max(0, Math.ceil(total)) };
                    } catch (error) {
                        console.error(`Footprint calculation failed for ${entry.year}`, error);
                        return { year: entry.year, total: 0 };
                    }
                })
            );

            return entries.reduce<Record<number, number>>((acc, item) => {
                acc[item.year] = item.total;
                return acc;
            }, {});
        },
        [country, selectedModel]
    );

    useEffect(() => {
        let cancel = false;

        const runPrediction = async () => {
            if (historyData.length < 2) {
                setForecastData([]);
                setModelWarning(null);
                return;
            }

            if (selectedModel === "poly2" && historyData.length < 3) {
                setModelWarning(
                    `Polynomial regression needs at least 3 historical years. Currently only ${historyData.length} entered.`
                );
                setForecastData([]);
                return;
            }

            if (selectedModel === "arima" && historyData.length < 8) {
                setModelWarning(
                    `ARIMA needs at least 8 historical years. Currently only ${historyData.length} year${
                        historyData.length === 1 ? "" : "s"
                    } entered.`
                );
                setForecastData([]);
                return;
            }

            setModelWarning(null);

            setPredicting(true);
            try {
                const nextPoints = await predictSeries();
                if (!cancel) {
                    setForecastData(nextPoints);
                }
            } catch (error) {
                console.error("Prediction failed", error);
                if (!cancel) {
                    setForecastData([]);
                }
            } finally {
                if (!cancel) {
                    setPredicting(false);
                }
            }
        };

        runPrediction();
        return () => {
            cancel = true;
        };
    }, [historyData, predictSeries, selectedModel]);

    useEffect(() => {
        let cancel = false;
        const dataset = [...historyData, ...forecastData];
        if (dataset.length === 0 || predicting) {
            if (!predicting) {
                setFootprintByYear({});
            }
            return () => {
                cancel = true;
            };
        }

        const run = async () => {
            const result = await countCarbonFootprint(dataset);
            if (!cancel) {
                setFootprintByYear(result);
            }
        };
        run();
        return () => {
            cancel = true;
        };
    }, [countCarbonFootprint, historyData, forecastData, predicting]);

    useEffect(() => {
        let cancel = false;
        const dataset = [...historyData, ...forecastData];
        if (dataset.length === 0 || predicting) {
            setPerMetricFootprint({});
            setPerMetricLoading(false);
            return () => {
                cancel = true;
            };
        }

        const activeMetrics = METRICS.filter((metric) =>
            dataset.some((point) => (point[metric.key] ?? 0) !== 0)
        );
        if (activeMetrics.length === 0) {
            setPerMetricFootprint({});
            setPerMetricLoading(false);
            return () => {
                cancel = true;
            };
        }

        const buildPayload = (
            entry: YearHistoryPoint,
            metricKey: (typeof METRICS)[number]["key"]
        ) => ({
            country,
            year: entry.year,
            energy_kwh: metricKey === "annualKwh" ? entry.annualKwh : 0,
            laptops_count: metricKey === "laptops" ? entry.laptops : 0,
            monitors_count: metricKey === "monitors" ? entry.monitors : 0,
            servers_count: metricKey === "servers" ? entry.servers : 0,
            cloud_emission: metricKey === "cloudCo2" ? entry.cloudCo2 : 0,
            fuel_type:
                metricKey === "fuelPetrol"
                    ? "petrol"
                    : metricKey === "fuelDiesel"
                        ? "diesel"
                        : metricKey === "fuelLpg"
                            ? "lpg"
                            : "mixed",
            fuel_consumption:
                metricKey === "fuelPetrol"
                    ? entry.fuelPetrol
                    : metricKey === "fuelDiesel"
                        ? entry.fuelDiesel
                        : metricKey === "fuelLpg"
                            ? entry.fuelLpg
                            : 0,
            model: selectedModel,
        });

        const run = async () => {
            setPerMetricLoading(true);
            const result: Record<string, Record<number, number>> = {};

            for (const metric of activeMetrics) {
                const metricEntries = await Promise.all(
                    dataset.map(async (entry) => {
                        try {
                            const response = await calculateTotalFootprint(
                                buildPayload(entry, metric.key)
                            );
                            const total = response.WYNIK_KONCOWY?.TOTAL_FOOTPRINT_KG ?? 0;
                            return {
                                year: entry.year,
                                total: Math.max(0, Math.ceil(total)),
                            };
                        } catch (error) {
                            console.error(
                                `Footprint calc failed for ${metric.key} ${entry.year}`,
                                error
                            );
                            return { year: entry.year, total: 0 };
                        }
                    })
                );

                result[metric.key] = metricEntries.reduce<Record<number, number>>(
                    (acc, item) => {
                        acc[item.year] = item.total;
                        return acc;
                    },
                    {}
                );
            }

            if (!cancel) {
                setPerMetricFootprint(result);
                setPerMetricLoading(false);
            }
        };

        run();
        return () => {
            cancel = true;
        };
    }, [historyData, forecastData, predicting, country, selectedModel]);

    const combinedSeries = useMemo(() => {
        return [...historyData, ...forecastData].map((entry) => ({
            ...entry,
            carbonFootprint: footprintByYear[entry.year],
        }));
    }, [historyData, forecastData, footprintByYear]);

    const carbonDataAvailable = Object.keys(footprintByYear).length > 0;

    const forecastChartSeries = useMemo(() => {
        if (!forecastData.length || !historyData.length) return [] as YearHistoryPoint[];
        return [historyData[historyData.length - 1], ...forecastData];
    }, [historyData, forecastData]);

    const summaryRows = useMemo(() => {
        const rows: Array<{
            label: string;
            color: string;
            firstYear?: number;
            firstVal: number;
            latestYear?: number;
            latestVal: number;
            changePct: number | null;
        }> = [];

        if (carbonDataAvailable) {
            const nonZero = combinedSeries.filter(
                (entry) => typeof entry.carbonFootprint === "number"
            );
            if (nonZero.length) {
                const first = nonZero[0];
                const last = nonZero[nonZero.length - 1];
                const change = first.carbonFootprint
                    ? ((last.carbonFootprint! - first.carbonFootprint!) /
                        first.carbonFootprint!) *
                    100
                    : null;
                rows.push({
                    label: "Total footprint",
                    color: "#fde047",
                    firstYear: first.year,
                    firstVal: first.carbonFootprint || 0,
                    latestYear: last.year,
                    latestVal: last.carbonFootprint || 0,
                    changePct: change,
                });
            }
        }

        METRICS.forEach((metric) => {
            const series = combinedSeries
                .map((entry) => ({
                    year: entry.year,
                    value: perMetricFootprint[metric.key]?.[entry.year] ?? 0,
                }))
                .filter((item) => item.value > 0);
            if (!series.length) return;
            const first = series[0];
            const last = series[series.length - 1];
            const change = first.value
                ? ((last.value - first.value) / first.value) * 100
                : null;
            rows.push({
                label: metric.label,
                color: metric.color,
                firstYear: first.year,
                firstVal: first.value,
                latestYear: last.year,
                latestVal: last.value,
                changePct: change,
            });
        });

        return rows;
    }, [carbonDataAvailable, combinedSeries, perMetricFootprint]);

    const ChartLoader = ({ label }: { label?: string }) => (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-2xl bg-slate-950/80 ">
            <div className="relative flex h-16 w-16 items-center justify-center ">
                <div className="absolute h-16 w-16 animate-ping rounded-full bg-emerald-400/40" />
                <div className="absolute h-10 w-10 animate-spin rounded-full border-2 border-emerald-400/30 border-t-emerald-200" />
                <Loader2 className="relative z-10 h-6 w-6 text-emerald-200 animate-spin" />
            </div>
            <p className="mt-3 text-xs font-semibold tracking-[0.3em] text-emerald-100/80 uppercase">
                {label || "Loading"}
            </p>
        </div>
    );

    return (
        <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-6 shadow-[0_25px_75px_rgba(2,6,23,0.6)]">
            <p className="text-xs text-slate-400 uppercase tracking-[0.3em]">
                Carbon analytics
            </p>
            <h3 className="mt-2 text-2xl font-semibold text-white">Focus on emissions</h3>
            <p className="text-sm text-slate-400">
                We forecast your operational data first, then translate everything into carbon
                footprint estimates per component.
            </p>

            {modelWarning && (
                <div className="mt-4 rounded-2xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-xs text-amber-100">
                    {modelWarning}
                </div>
            )}

            <div className="mt-6 space-y-4">
                <div className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                    Total footprint
                </div>
                <div className="relative h-56">
                    {predicting && <ChartLoader label="Predicting" />}
                    {carbonDataAvailable ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                                data={combinedSeries}
                                margin={{ top: 5, right: 32, left: 32, bottom: 5 }}
                            >
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    stroke="rgba(148,163,184,0.25)"
                                />
                                <XAxis dataKey="year" tick={{ fill: "#94a3b8" }} />
                                <YAxis
                                    tick={{ fill: "#94a3b8" }}
                                    tickFormatter={(val) => `${val}`}
                                />
                                <Tooltip
                                    contentStyle={{
                                        background: "#0f172a",
                                        borderColor: "#334155",
                                    }}
                                    labelFormatter={(label) => `Year ${label}`}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="carbonFootprint"
                                    stroke="#fde047"
                                    strokeWidth={4}
                                    dot={{
                                        r: 5,
                                        stroke: "#facc15",
                                        strokeWidth: 2,
                                        fill: "#0f172a",
                                    }}
                                    activeDot={{
                                        r: 7,
                                        stroke: "#facc15",
                                        strokeWidth: 3,
                                        fill: "#0f172a",
                                    }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex h-full items-center justify-center text-xs text-slate-500">
                            Feed at least one year to compute the footprint.
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-10 space-y-4">
                <div className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                    Component footprints
                </div>
                {perMetricLoading && (
                    <div className="relative mb-4 h-20 rounded-2xl border border-emerald-400/30 bg-emerald-400/10">
                        <ChartLoader label="Crunching components" />
                    </div>
                )}
                <div className="grid gap-4 md:grid-cols-2">
                    {METRICS.map((metric) => {
                        const series = combinedSeries.map((entry) => ({
                            year: entry.year,
                            value: perMetricFootprint[metric.key]?.[entry.year] ?? 0,
                        }));
                        const hasSignal = series.some((point) => point.value > 0);
                        if (!hasSignal) {
                            return null;
                        }
                        return (
                            <div
                                key={metric.key}
                                className="rounded-2xl border border-white/5 bg-white/5 p-4"
                                style={{
                                    boxShadow: `0 8px 25px rgba(15,23,42,0.45), 0 0 20px ${metric.color}40`,
                                }}
                            >
                                <div className="mb-2 text-sm font-semibold text-white">
                                    Carbon footprint – {metric.label}
                                </div>
                                <div className="h-40">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart
                                            data={series}
                                            margin={{
                                                top: 5,
                                                right: 10,
                                                left: -10,
                                                bottom: 5,
                                            }}
                                        >
                                            <CartesianGrid
                                                strokeDasharray="3 3"
                                                stroke="rgba(148,163,184,0.15)"
                                            />
                                            <XAxis
                                                dataKey="year"
                                                tick={{
                                                    fill: "#94a3b8",
                                                    fontSize: 11,
                                                }}
                                            />
                                            <YAxis
                                                tick={{
                                                    fill: "#94a3b8",
                                                    fontSize: 11,
                                                }}
                                            />
                                            <Tooltip
                                                contentStyle={{
                                                    background: "#0f172a",
                                                    borderColor: "#334155",
                                                }}
                                                formatter={(value: number) => [
                                                    `${value} kg`,
                                                    metric.label,
                                                ]}
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="value"
                                                stroke={metric.color}
                                                strokeWidth={2.5}
                                                dot={{
                                                    r: 4,
                                                    stroke: metric.color,
                                                    strokeWidth: 2,
                                                    fill: "#0f172a",
                                                }}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {summaryRows.length > 0 && (
                <div className="mt-10 rounded-3xl border border-white/10 bg-slate-950/70 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                                Executive summary
                            </p>
                            <h4 className="text-lg font-semibold text-white">
                                Carbon footprint scoreboard
                            </h4>
                        </div>
                        <Sparkles className="text-amber-300" size={18} />
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-300">
                            <thead>
                            <tr className="text-xs uppercase tracking-widest text-slate-400">
                                <th className="pb-3">Metric</th>
                                <th className="pb-3">Baseline</th>
                                <th className="pb-3">Latest</th>
                                <th className="pb-3 text-right">Δ %</th>
                            </tr>
                            </thead>
                            <tbody>
                            {summaryRows.map((row) => (
                                <tr key={row.label} className="border-t border-white/5">
                                    <td className="py-3">
                                            <span
                                                className="mr-2 inline-block h-2.5 w-2.5 rounded-full"
                                                style={{ backgroundColor: row.color }}
                                            />
                                        <span className="font-semibold text-white">
                                                {row.label}
                                            </span>
                                    </td>
                                    <td className="py-3">
                                        {row.firstYear ? (
                                            <span className="text-slate-100">
                                                    {row.firstVal.toLocaleString()} kg
                                                </span>
                                        ) : (
                                            <span className="text-slate-500">n/a</span>
                                        )}
                                        {row.firstYear && (
                                            <span className="ml-2 text-xs text-slate-500">
                                                    ({row.firstYear})
                                                </span>
                                        )}
                                    </td>
                                    <td className="py-3">
                                        {row.latestYear ? (
                                            <span className="text-slate-100">
                                                    {row.latestVal.toLocaleString()} kg
                                                </span>
                                        ) : (
                                            <span className="text-slate-500">n/a</span>
                                        )}
                                        {row.latestYear && (
                                            <span className="ml-2 text-xs text-slate-500">
                                                    ({row.latestYear})
                                                </span>
                                        )}
                                    </td>
                                    <td
                                        className="py-3 text-right font-semibold"
                                        style={{
                                            color:
                                                row.changePct !== null &&
                                                row.changePct > 0
                                                    ? "#f97316"
                                                    : "#22c55e",
                                        }}
                                    >
                                        {row.changePct === null
                                            ? "–"
                                            : `${row.changePct > 0 ? "+" : ""}${row.changePct.toFixed(
                                                1
                                            )}%`}
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <EcoAdvisorPanel
                country={country}
                model={selectedModel}
                historyData={historyData}
                footprintSeries={combinedSeries}
            />

            <div className="mt-8 flex justify-between">
                <button
                    type="button"
                    onClick={onBack}
                    className="px-4 py-2 rounded-xl border border-slate-600 text-slate-200 text-xs md:text-sm bg-slate-900/60 hover:bg-slate-800/80 transition-colors"
                >
                    Back
                </button>
            </div>
        </div>
    );
};

export default YearTrendsChart;
