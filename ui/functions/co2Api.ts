"use server";

import type { RequestInit } from "next/dist/server/web/spec-extension/request";

const BASE_URL = process.env.NEXT_PUBLIC_CO2_API_BASE?.replace(/\/$/, "") || "http://localhost:5000";
const JSON_HEADERS: HeadersInit = { "Content-Type": "application/json" };

export interface FootprintRequest {
    country: string;
    year: number;
    model?: "linear" | "poly2" | "arima";
    energy_kwh: number;
    laptops_count: number;
    monitors_count: number;
    servers_count: number;
    fuel_type?: string;
    fuel_consumption?: number;
    cloud_emission: number;
}

export interface FootprintResponse {
    rok_kalkulacji: number;
    kraj: string;
    model_ai: string;
    szczegoly: {
        energia_lokalna: {
            zuzycie_kwh: number;
            prognozowany_wspolczynnik: number;
            emisja_kg: number;
        };
        chmura: {
            opis: string;
            emisja_kg: number;
        };
        sprzet_produkcja: {
            suma_sprzet_kg: number;
        };
        transport: {
            paliwo: string | null;
            emisja_kg: number;
        };
    };
    WYNIK_KONCOWY: {
        TOTAL_FOOTPRINT_KG: number;
    };
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
    const res = await fetch(`${BASE_URL}${path}`, {
        ...init,
        headers: {
            ...JSON_HEADERS,
            ...(init?.headers || {}),
        },
    });

    if (!res.ok) {
        const message = await safeReadError(res);
        throw new Error(`CO2 API error (${res.status}): ${message}`);
    }

    return res.json() as Promise<T>;
}

async function safeReadError(res: Response): Promise<string> {
    try {
        const data = await res.json();
        return (data as { error?: string })?.error || JSON.stringify(data);
    } catch {
        return await res.text();
    }
}

export async function calculateTotalFootprint(payload: FootprintRequest): Promise<FootprintResponse> {
    return request<FootprintResponse>("/calculate_total_footprint", {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

