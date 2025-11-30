'use client';

import React, { useEffect } from 'react';
import { FormikErrors, FormikTouched, useFormikContext } from 'formik';
import { Zap, Laptop, Monitor, Server, Cloud, Car, Plane } from 'lucide-react';

interface YearData {
  annualKwh: number | '';
  laptops: number | '';
  monitors: number | '';
  servers: number | '';
  cloudCo2: number | '';
  fuelPetrol: number | '';
  fuelDiesel: number | '';
  fuelLpg: number | '';
  flightMiles: number | '';
}

interface FormValues {
  yearlyData: Record<string, YearData>;
}

const createEmptyYearData = (): YearData => ({
  annualKwh: 0,
  laptops: 0,
  monitors: 0,
  servers: 0,
  cloudCo2: 0,
  fuelPetrol: 0,
  fuelDiesel: 0,
  fuelLpg: 0,
  flightMiles: 0,
});

type YearField = keyof YearData;

const YearDataForm: React.FC<{ year: number }> = ({ year }) => {
  const { values, setFieldValue, errors, touched, setFieldTouched } = useFormikContext<FormValues>();

  const key = String(year);
  const entry: YearData = values.yearlyData?.[key] ?? createEmptyYearData();

  useEffect(() => {
    if (!values.yearlyData?.[key]) {
      setFieldValue("yearlyData", {
        ...(values.yearlyData || {}),
        [key]: createEmptyYearData(),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setNumeric = (field: YearField, value: string | number) => {
    const parsed =
      value === ""
        ? ""
        : typeof value === "number"
        ? value
        : Number(value);

    const safeValue = typeof parsed === "number" && Number.isNaN(parsed) ? "" : parsed;

    setFieldValue("yearlyData", {
      ...(values.yearlyData || {}),
      [key]: {
        ...(values.yearlyData?.[key] || {}),
        [field]: safeValue,
      },
    });

    setFieldTouched?.(`yearlyData.${key}.${field}`, true, false);
  };

  const adjustBy = (field: YearField, delta: number) => {
    const current = values.yearlyData?.[key]?.[field];
    const base = current === "" || current === undefined ? 0 : Number(current);
    setNumeric(field, Math.max(0, base + delta));
  };

  const inc = (field: YearField, step = 1) => adjustBy(field, step);
  const dec = (field: YearField, step = 1) => adjustBy(field, -step);

  const valueOrZero = (val: number | '') => (typeof val === 'number' ? val : 0);
  const totalDevices = valueOrZero(entry.laptops) + valueOrZero(entry.monitors) + valueOrZero(entry.servers);
  const cloudImpact = valueOrZero(entry.cloudCo2);
  const flightTotal = valueOrZero(entry.flightMiles);

  const yearErrors = errors?.yearlyData?.[key] as FormikErrors<YearData> | undefined;
  const yearTouched = touched?.yearlyData?.[key] as FormikTouched<YearData> | undefined;

  const getFieldError = (field: YearField): string | undefined => {
    if (!yearTouched?.[field]) return undefined;
    const errVal = yearErrors?.[field];
    return typeof errVal === 'string' ? errVal : undefined;
  };

  const hasError = (field: YearField) => Boolean(getFieldError(field));

  const smallBtn = 'shrink-0 w-10 h-10 rounded-md flex items-center justify-center text-sm transition-transform transform-gpu hover:scale-105';
  const actionBtn = `${smallBtn} bg-emerald-500 text-slate-900 font-semibold`;
  const decBtn = `${smallBtn} bg-slate-700 text-slate-100`;
  const inputBase = 'flex-1 py-3 min-w-0 h-10 px-3 rounded-md bg-slate-900 text-white border focus:ring-2 text-right';
  const inputClass = `${inputBase} border-slate-700`;
  const fuelInputClass = `${inputBase} border-slate-700 focus:ring-sky-400 w-full text-base font-semibold`;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/5 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 shadow-[0_25px_100px_rgba(8,15,40,0.65)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.18),_transparent)] pointer-events-none" />
      <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-emerald-500/20 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] uppercase tracking-[0.2em] text-slate-300">Annual purchase log</p>
            <h3 className="mt-3 text-2xl font-semibold text-white">New acquisitions in <span className="text-emerald-300">{year}</span></h3>
            <p className="text-sm text-slate-400">Capture how many assets were purchased and how much extra electricity those additions consumed that year.</p>
          </div>

          <div className="flex flex-wrap gap-3 text-xs">
            <div className="px-4 py-2 rounded-2xl bg-white/5 border border-white/10 text-white/80">
              Added load: <span className="text-white font-semibold">{valueOrZero(entry.annualKwh).toLocaleString()} kWh</span>
            </div>
            <div className="px-4 py-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-200">
              Devices purchased: <span className="text-emerald-300 font-semibold">{totalDevices}</span>
            </div>
            <div className="px-4 py-2 rounded-2xl bg-sky-500/10 border border-sky-400/30 text-sky-200">
              Cloud CO₂: <span className="text-sky-100 font-semibold">{cloudImpact.toLocaleString()} kg</span>
            </div>
            <div className="px-4 py-2 rounded-2xl bg-indigo-500/10 border border-indigo-400/30 text-indigo-200">
              Air miles: <span className="text-indigo-100 font-semibold">{flightTotal.toLocaleString()} mi</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Annual kWh */}
          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-emerald-400/30 transition-all backdrop-blur">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-2xl bg-amber-500/15 text-amber-300 border border-amber-500/20">
                <Zap size={18} />
              </div>
              <div>
                <p className="text-xs text-slate-400">Electricity impact</p>
                <p className="text-sm font-semibold text-white">Additional load (kWh)</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 mb-3">Extra electricity consumed by the new purchases made in {year}. Enter the total incremental kWh.</p>
            <div className="flex flex-col gap-2">
              <label className="text-xs text-slate-400" htmlFor={`annual-kwh-${year}`}>
                Input the value in kWh (e.g. 12,500,000)
              </label>
              <input
                id={`annual-kwh-${year}`}
                inputMode="numeric"
                pattern="[0-9]*"
                value={entry.annualKwh}
                onChange={(e) => setNumeric('annualKwh', e.target.value)}
                className={`${inputClass} ${hasError('annualKwh') ? 'border-rose-500 focus:ring-rose-400' : 'focus:ring-amber-400'} w-full text-base sm:text-lg font-semibold`}
                aria-label="Roczne zużycie kWh"
                aria-invalid={hasError('annualKwh')}
                placeholder="0"
              />
              {getFieldError('annualKwh') && (
                <p className="text-xs text-rose-300 mt-1">{getFieldError('annualKwh')}</p>
              )}
            </div>
          </div>

          {/* Laptops */}
          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-blue-400/30 transition-all backdrop-blur">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-2xl bg-blue-500/15 text-blue-300 border border-blue-500/20">
                <Laptop size={18} />
              </div>
              <div>
                <p className="text-xs text-slate-400">Mobile fleet</p>
                <p className="text-sm font-semibold text-white">Laptops purchased</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 mb-3">How many laptops were added to the inventory in {year}.</p>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => dec('laptops')} className={decBtn} aria-label="zmniejsz laptopy">-</button>
              <input
                inputMode="numeric"
                pattern="[0-9]*"
                value={entry.laptops}
                onChange={(e) => setNumeric('laptops', e.target.value)}
                className={`${inputClass} ${hasError('laptops') ? 'border-rose-500 focus:ring-rose-400' : 'focus:ring-blue-400'} max-w-[10rem]`}
                aria-label="Laptopy"
                aria-invalid={hasError('laptops')}
              />
              <button type="button" onClick={() => inc('laptops')} className={actionBtn} aria-label="zwiększ laptopy">+</button>
            </div>
            {getFieldError('laptops') && (
              <p className="text-xs text-rose-300 mt-1">{getFieldError('laptops')}</p>
            )}
          </div>

          {/* Monitors */}
          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-indigo-400/30 transition-all backdrop-blur">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-2xl bg-indigo-500/15 text-indigo-300 border border-indigo-500/20">
                <Monitor size={18} />
              </div>
              <div>
                <p className="text-xs text-slate-400">Workstations</p>
                <p className="text-sm font-semibold text-white">Monitors purchased</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 mb-3">How many monitors were bought during {year}.</p>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => dec('monitors')} className={decBtn} aria-label="zmniejsz monitory">-</button>
              <input
                inputMode="numeric"
                pattern="[0-9]*"
                value={entry.monitors}
                onChange={(e) => setNumeric('monitors', e.target.value)}
                className={`${inputClass} ${hasError('monitors') ? 'border-rose-500 focus:ring-rose-400' : 'focus:ring-indigo-400'} max-w-[10rem]`}
                aria-label="Monitory"
                aria-invalid={hasError('monitors')}
              />
              <button type="button" onClick={() => inc('monitors')} className={actionBtn} aria-label="zwiększ monitory">+</button>
            </div>
            {getFieldError('monitors') && (
              <p className="text-xs text-rose-300 mt-1">{getFieldError('monitors')}</p>
            )}
          </div>

          {/* Servers */}
          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-rose-400/30 transition-all backdrop-blur">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-2xl bg-rose-500/15 text-rose-300 border border-rose-500/20">
                <Server size={18} />
              </div>
              <div>
                <p className="text-xs text-slate-400">Infrastructure</p>
                <p className="text-sm font-semibold text-white">Servers purchased</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 mb-3">Count the physical or virtual servers acquired in {year}.</p>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => dec('servers', 1)} className={decBtn} aria-label="zmniejsz serwery">-</button>
              <input
                inputMode="numeric"
                pattern="[0-9]*"
                value={entry.servers}
                onChange={(e) => setNumeric('servers', e.target.value)}
                className={`${inputClass} ${hasError('servers') ? 'border-rose-500 focus:ring-rose-400' : 'focus:ring-rose-400'} max-w-[10rem]`}
                aria-label="Serwery"
                aria-invalid={hasError('servers')}
              />
              <button type="button" onClick={() => inc('servers', 1)} className={actionBtn} aria-label="zwiększ serwery">+</button>
            </div>
            {getFieldError('servers') && (
              <p className="text-xs text-rose-300 mt-1">{getFieldError('servers')}</p>
            )}
          </div>

          {/* Cloud CO₂ */}
          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-sky-400/30 transition-all backdrop-blur">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-2xl bg-sky-500/15 text-sky-200 border border-sky-500/20">
                <Cloud size={18} />
              </div>
              <div>
                <p className="text-xs text-slate-400">Cloud footprint</p>
                <p className="text-sm font-semibold text-white">Cloud CO₂ emissions (kg)</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 mb-3">Use the sustainability dashboard from your cloud operator (AWS, Azure, GCP, etc.) to obtain this year&apos;s CO₂ figure.</p>
            <div className="flex flex-col gap-2">
              <label className="text-xs text-slate-400" htmlFor={`cloud-co2-${year}`}>
                Enter total kilograms of CO₂ reported for {year}
              </label>
              <input
                id={`cloud-co2-${year}`}
                inputMode="numeric"
                pattern="[0-9]*"
                value={entry.cloudCo2}
                onChange={(e) => setNumeric('cloudCo2', e.target.value)}
                className={`${inputClass} ${hasError('cloudCo2') ? 'border-rose-500 focus:ring-rose-400' : 'focus:ring-sky-400'} w-full text-base font-semibold`}
                aria-label="Cloud CO2 emissions"
                aria-invalid={hasError('cloudCo2')}
                placeholder="0"
              />
              {getFieldError('cloudCo2') && (
                <p className="text-xs text-rose-300 mt-1">{getFieldError('cloudCo2')}</p>
              )}
            </div>
          </div>

          {/* Air travel */}
          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-indigo-400/30 transition-all backdrop-blur">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-2xl bg-indigo-500/15 text-indigo-200 border border-indigo-500/20">
                <Plane size={18} />
              </div>
              <div>
                <p className="text-xs text-slate-400">Business trips (air)</p>
                <p className="text-sm font-semibold text-white">Miles flown in {year}</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 mb-3">Sum every mile flown on business itineraries this year (pull from your travel management or booking reports).</p>
            <div className="flex flex-col gap-2">
              <label className="text-xs text-slate-400" htmlFor={`flight-miles-${year}`}>Miles (all cabin classes combined)</label>
              <input
                id={`flight-miles-${year}`}
                inputMode="numeric"
                pattern="[0-9]*"
                value={entry.flightMiles}
                onChange={(e) => setNumeric('flightMiles', e.target.value)}
                className={`${inputClass} ${hasError('flightMiles') ? 'border-rose-500 focus:ring-rose-400' : 'focus:ring-indigo-400'} w-full text-base font-semibold`}
                aria-label="Flight miles"
                aria-invalid={hasError('flightMiles')}
                placeholder="0"
              />
              {getFieldError('flightMiles') && (
                <p className="text-xs text-rose-300 mt-1">{getFieldError('flightMiles')}</p>
              )}
            </div>
          </div>

          {/* Fleet fuel consumption */}
          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-amber-400/30 transition-all backdrop-blur lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-2xl bg-amber-500/15 text-amber-300 border border-amber-500/20">
                <Car size={18} />
              </div>
              <div>
                <p className="text-xs text-slate-400">Company cars</p>
                <p className="text-sm font-semibold text-white">Fuel consumed in {year} (liters)</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 mb-3">Track how much fuel was bought for the corporate fleet this year. Data usually comes from fuel cards or accounting statements.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs text-slate-400" htmlFor={`fuel-petrol-${year}`}>Petrol (gasoline)</label>
                <input
                  id={`fuel-petrol-${year}`}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={entry.fuelPetrol}
                  onChange={(e) => setNumeric('fuelPetrol', e.target.value)}
                  className={`${fuelInputClass} ${hasError('fuelPetrol') ? 'border-rose-500 focus:ring-rose-400' : ''}`}
                  aria-label="Petrol fuel consumption"
                  aria-invalid={hasError('fuelPetrol')}
                  placeholder="0"
                />
                {getFieldError('fuelPetrol') && (
                  <p className="text-xs text-rose-300 mt-1">{getFieldError('fuelPetrol')}</p>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs text-slate-400" htmlFor={`fuel-diesel-${year}`}>Diesel</label>
                <input
                  id={`fuel-diesel-${year}`}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={entry.fuelDiesel}
                  onChange={(e) => setNumeric('fuelDiesel', e.target.value)}
                  className={`${fuelInputClass} ${hasError('fuelDiesel') ? 'border-rose-500 focus:ring-rose-400' : ''}`}
                  aria-label="Diesel fuel consumption"
                  aria-invalid={hasError('fuelDiesel')}
                  placeholder="0"
                />
                {getFieldError('fuelDiesel') && (
                  <p className="text-xs text-rose-300 mt-1">{getFieldError('fuelDiesel')}</p>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs text-slate-400" htmlFor={`fuel-lpg-${year}`}>LPG</label>
                <input
                  id={`fuel-lpg-${year}`}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={entry.fuelLpg}
                  onChange={(e) => setNumeric('fuelLpg', e.target.value)}
                  className={`${fuelInputClass} ${hasError('fuelLpg') ? 'border-rose-500 focus:ring-rose-400' : ''}`}
                  aria-label="LPG fuel consumption"
                  aria-invalid={hasError('fuelLpg')}
                  placeholder="0"
                />
                {getFieldError('fuelLpg') && (
                  <p className="text-xs text-rose-300 mt-1">{getFieldError('fuelLpg')}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="text-[11px] text-slate-500 uppercase tracking-[0.3em]">All entries are saved automatically.</div>
      </div>
    </div>
  );
};

export default YearDataForm;
