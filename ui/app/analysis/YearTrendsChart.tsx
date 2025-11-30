import { Sparkles } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";

interface TrendPoint {
  year: number;
  annualKwh: number;
  cloudCo2: number;
  flightMiles: number;
  deviceCount: number;
}

interface YearTrendsChartProps {
  data: TrendPoint[];
  isSubmitting: boolean;
  onBack: () => void;
}

const YearTrendsChart: React.FC<YearTrendsChartProps> = ({ data, isSubmitting, onBack }) => {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-6 shadow-[0_25px_75px_rgba(2,6,23,0.6)]">
      <p className="text-xs text-slate-400 uppercase tracking-[0.3em]">Trends overview</p>
      <h3 className="mt-2 text-2xl font-semibold text-white">Year-on-year evolution</h3>
      <p className="text-sm text-slate-400">See how electricity, devices, cloud emissions, and travel changed across the selected years.</p>

      <div className="mt-6 h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 10, left: -16, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.35)" />
            <XAxis dataKey="year" tick={{ fill: "#94a3b8" }} />
            <YAxis tick={{ fill: "#94a3b8" }} />
            <Tooltip contentStyle={{ background: "#0f172a", borderColor: "#334155" }} labelFormatter={(label) => `Year ${label}`} />
            <Legend wrapperStyle={{ color: "#94a3b8" }} />
            <Line type="monotone" dataKey="annualKwh" stroke="#22c55e" name="Electricity (kWh)" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="deviceCount" stroke="#f97316" name="Device additions" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="cloudCo2" stroke="#38bdf8" name="Cloud CO₂ (kg)" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="flightMiles" stroke="#a855f7" name="Flight miles" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 flex justify-between">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 rounded-xl border border-slate-600 text-slate-200 text-xs md:text-sm bg-slate-900/60 hover:bg-slate-800/80 transition-colors"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-8 py-3 bg-eco-500 hover:bg-eco-400 disabled:bg-slate-500 rounded-2xl text-xs md:text-sm font-semibold text-slate-900 flex items-center gap-2 transition-all shadow-lg hover:shadow-eco-500/30"
        >
          <Sparkles size={16} />
          {isSubmitting ? "Calculating..." : "Calculate"}
        </button>
      </div>
    </div>
  );
};

export default YearTrendsChart;

