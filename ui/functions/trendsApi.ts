'use server';
import type { RequestInit } from 'next/dist/server/web/spec-extension/request';

const BASE_URL = process.env.NEXT_PUBLIC_TRENDS_API_BASE?.replace(/\/$/, '') || 'http://localhost:5000';
const JSON_HEADERS: HeadersInit = { 'Content-Type': 'application/json' };

export type TrendsModel = 'linear' | 'poly2' | 'arima';

export interface TrendsRequest {
  years: number[];
  values: number[];
  stepsAhead?: number;
  model?: TrendsModel;
}

export interface TrendsHistoryPoint {
  year: number;
  value: number;
}

export interface TrendsForecastPoint {
  year: number;
  predicted_value: number;
}

export interface TrendsResponse {
  model: TrendsModel;
  history: TrendsHistoryPoint[];
  forecast: TrendsForecastPoint[];
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: { ...JSON_HEADERS, ...(init?.headers || {}) },
  });

  if (!res.ok) {
    const message = await safeReadError(res);
    throw new Error(`Trends API error (${res.status}): ${message}`);
  }

  return res.json() as Promise<T>;
}

async function safeReadError(res: Response): Promise<string> {
  try {
    const data = await res.json();
    return (data?.error as string) || JSON.stringify(data);
  } catch (e) {
    return await res.text();
  }
}

export async function fetchTrendsForecast(payload: TrendsRequest): Promise<TrendsResponse> {
  if (!payload.years?.length || !payload.values?.length) {
    throw new Error('years and values arrays are required');
  }
  console.log(payload)

  return request<TrendsResponse>('/predict', {
    method: 'POST',
    body: JSON.stringify({
      years: payload.years,
      values: payload.values,
      steps_ahead: payload.stepsAhead ?? 3,
      model: payload.model ?? 'linear',
    }),
  });
}

export async function fetchTrendsHealth(): Promise<{ status: string }> {
  return request<{ status: string }>('/health');
}

