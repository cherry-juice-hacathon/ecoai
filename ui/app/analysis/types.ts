export interface YearlyEntry {
    annualKwh: number | "";
    laptops: number | "";
    monitors: number | "";
    servers: number | "";
    cloudCo2: number | "";
    fuelPetrol: number | "";
    fuelDiesel: number | "";
    fuelLpg: number | "";
    flightMiles: number | "";
}

export interface FormValues {
    country: string;
    model: "linear" | "poly2" | "arima";
    predictionYears: number;
    selectedYears: number[];
    yearlyData: Record<string, YearlyEntry>;
}

export type YearEntry = FormValues["yearlyData"][string];

export interface YearHistoryPoint {
    year: number;
    annualKwh: number;
    laptops: number;
    monitors: number;
    servers: number;
    deviceCount: number;
    cloudCo2: number;
    flightMiles: number;
    fuelPetrol: number;
    fuelDiesel: number;
    fuelLpg: number;
    carbonFootprint?: number;
}

export interface YearTrendsChartProps {
    country: string;
    selectedModel: "linear" | "poly2" | "arima";
    predictionYears: number;
    historyData: YearHistoryPoint[];
    onBack: () => void;
}
