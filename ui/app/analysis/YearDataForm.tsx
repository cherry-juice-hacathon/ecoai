'use client';

import React, { useEffect } from 'react';
import { Field, FieldProps, useFormikContext } from 'formik';
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

const baseInput = 'flex-1 py-3 min-w-0 h-10 px-3 rounded-md bg-slate-900 text-white border focus:ring-2 text-right';
const numericInput = `${baseInput} border-slate-700`;
const textBlock = 'text-xs text-slate-400 mb-3';

const YearDataForm: React.FC<{ year: number }> = ({ year }) => {
    const { values, setFieldValue, setFieldTouched } = useFormikContext<FormValues>();

    const key = String(year);
    const entry: YearData = values.yearlyData?.[key] ?? createEmptyYearData();

    useEffect(() => {
        if (!values.yearlyData?.[key]) {
            setFieldValue('yearlyData', {
                ...(values.yearlyData || {}),
                [key]: createEmptyYearData(),
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const pathFor = (field: YearField) => `yearlyData.${key}.${field}`;

    const setNumeric = (field: YearField, value: string | number) => {
        const parsed = value === '' ? '' : typeof value === 'number' ? value : Number(value);
        const safeValue = typeof parsed === 'number' && Number.isNaN(parsed) ? '' : parsed;
        const fieldPath = pathFor(field);
        setFieldValue(fieldPath, safeValue);
        setFieldTouched?.(fieldPath, true, false);
    };

    const adjustBy = (field: YearField, delta: number) => {
        const current = values.yearlyData?.[key]?.[field];
        const base = current === '' || current === undefined ? 0 : Number(current);
        setNumeric(field, Math.max(0, base + delta));
    };

    const inc = (field: YearField, step = 1) => adjustBy(field, step);
    const dec = (field: YearField, step = 1) => adjustBy(field, -step);

    const valueOrZero = (val: number | '') => (typeof val === 'number' ? val : 0);
    const totalDevices = valueOrZero(entry.laptops) + valueOrZero(entry.monitors) + valueOrZero(entry.servers);
    const cloudImpact = valueOrZero(entry.cloudCo2);
    const flightTotal = valueOrZero(entry.flightMiles);

    const renderField = (
        fieldKey: YearField,
        props: { id?: string; className?: string; placeholder?: string }
    ) => (
        <Field name={pathFor(fieldKey)}>
            {({ field, meta }: FieldProps<number | ''>) => (
                <>
                    <input
                        {...field}
                        id={props.id}
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={field.value ?? ''}
                        onChange={(e) => setNumeric(fieldKey, e.target.value)}
                        className={`${props.className || numericInput} ${meta.touched && meta.error ? 'border-rose-500 focus:ring-rose-400' : ''}`}
                        placeholder={props.placeholder ?? '0'}
                        aria-invalid={Boolean(meta.touched && meta.error)}
                    />
                    {meta.touched && meta.error && (
                        <p className="text-xs text-rose-300 mt-1">{meta.error}</p>
                    )}
                </>
            )}
        </Field>
    );

    const smallBtn =
        'shrink-0 w-10 h-10 rounded-md flex items-center justify-center text-sm transition-transform transform-gpu hover:scale-105';
    const actionBtn = `${smallBtn} bg-emerald-500 text-slate-900 font-semibold`;
    const decBtn = `${smallBtn} bg-slate-700 text-slate-100`;
    const fuelInput = `${baseInput} border-slate-700 focus:ring-sky-400 w-full text-base font-semibold`;

    return (
        <div className="relative overflow-hidden rounded-3xl border border-white/5 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 shadow-[0_25px_100px_rgba(8,15,40,0.65)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.18),_transparent)] pointer-events-none" />
            <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-emerald-500/20 blur-[120px] rounded-full pointer-events-none" />

            <div className="relative flex flex-col gap-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <p className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] uppercase tracking-[0.2em] text-slate-300">
                            Annual purchase log
                        </p>
                        <h3 className="mt-3 text-2xl font-semibold text-white">
                            New acquisitions in <span className="text-emerald-300">{year}</span>
                        </h3>
                        <p className="text-sm text-slate-400">
                            Capture how many assets were purchased and how much extra electricity those additions consumed that year.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3 text-xs">
                        <div className="px-4 py-2 rounded-2xl bg-white/5 border border-white/10 text-white/80">
                            Annual usage: <span className="text-white font-semibold">{valueOrZero(entry.annualKwh).toLocaleString()} kWh</span>
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
                        <p className={textBlock}>Extra electricity consumed by the new purchases made in {year}. Enter the total incremental kWh.</p>
                        <div className="flex flex-col gap-2">
                            <label className="text-xs text-slate-400" htmlFor={`annual-kwh-${year}`}>
                                Input the value in kWh (e.g. 12,500,000)
                            </label>
                            {renderField('annualKwh', {
                                id: `annual-kwh-${year}`,
                                className: `${numericInput} focus:ring-amber-400 w-full text-base sm:text-lg font-semibold`,
                            })}
                        </div>
                    </div>

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
                        <p className={textBlock}>How many laptops were added to the inventory in {year}.</p>
                        <div className="flex items-center gap-2">
                            <button type="button" onClick={() => dec('laptops')} className={decBtn} aria-label="Decrease laptops">
                                -
                            </button>
                            {renderField('laptops', {
                                className: `${numericInput} focus:ring-blue-400 max-w-[10rem]`,
                            })}
                            <button type="button" onClick={() => inc('laptops')} className={actionBtn} aria-label="Increase laptops">
                                +
                            </button>
                        </div>
                    </div>

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
                        <p className={textBlock}>How many monitors were bought during {year}.</p>
                        <div className="flex items-center gap-2">
                            <button type="button" onClick={() => dec('monitors')} className={decBtn} aria-label="Decrease monitors">
                                -
                            </button>
                            {renderField('monitors', {
                                className: `${numericInput} focus:ring-indigo-400 max-w-[10rem]`,
                            })}
                            <button type="button" onClick={() => inc('monitors')} className={actionBtn} aria-label="Increase monitors">
                                +
                            </button>
                        </div>
                    </div>

                    <div className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-rose-400/30 transition-all backdrop-blur">
                        <div className="flex itemsCenter gap-3 mb-4">
                            <div className="p-3 rounded-2xl bg-rose-500/15 text-rose-300 border border-rose-500/20">
                                <Server size={18} />
                            </div>
                            <div>
                                <p className="text-xs text-slate-400">Infrastructure</p>
                                <p className="text-sm font-semibold text-white">Servers purchased</p>
                            </div>
                        </div>
                        <p className={textBlock}>Count the physical or virtual servers acquired in {year}.</p>
                        <div className="flex items-center gap-2">
                            <button type="button" onClick={() => dec('servers')} className={decBtn} aria-label="Decrease servers">
                                -
                            </button>
                            {renderField('servers', {
                                className: `${numericInput} focus:ring-rose-400 max-w-[10rem]`,
                            })}
                            <button type="button" onClick={() => inc('servers')} className={actionBtn} aria-label="Increase servers">
                                +
                            </button>
                        </div>
                    </div>

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
                        <p className={textBlock}>Use the sustainability dashboard from your cloud provider to provide this year&apos;s CO₂ figure.</p>
                        <div className="flex flex-col gap-2">
                            <label className="text-xs text-slate-400" htmlFor={`cloud-co2-${year}`}>
                                Enter total kilograms reported for {year}
                            </label>
                            {renderField('cloudCo2', {
                                id: `cloud-co2-${year}`,
                                className: `${numericInput} focus:ring-sky-400 w-full text-base font-semibold`,
                            })}
                        </div>
                    </div>

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
                        <p className={textBlock}>Sum every mile flown on business itineraries this year.</p>
                        <div className="flex flex-col gap-2">
                            <label className="text-xs text-slate-400" htmlFor={`flight-miles-${year}`}>
                                Miles (all cabin classes combined)
                            </label>
                            {renderField('flightMiles', {
                                id: `flight-miles-${year}`,
                                className: `${numericInput} focus:ring-indigo-400 w-full text-base font-semibold`,
                            })}
                        </div>
                    </div>

                    <div className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-amber-400/30 transition-all backdrop-blur lg:col-span-2">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 rounded-2xl bg-amber-500/15 text-amber-300 border border-amber-500/20">
                                <Car size={18} />
                            </div>
                            <div>
                                <p className="text-xs text-slate-400">Company cars</p>
                                <p className="text-sm font-semibold text-white">Fuel consumed in {year} (litres)</p>
                            </div>
                        </div>
                        <p className={textBlock}>Track how much fuel was bought for the corporate fleet this year.</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="flex flex-col gap-2">
                                <label className="text-xs text-slate-400" htmlFor={`fuel-petrol-${year}`}>
                                    Petrol (gasoline)
                                </label>
                                {renderField('fuelPetrol', {
                                    id: `fuel-petrol-${year}`,
                                    className: fuelInput,
                                })}
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-xs text-slate-400" htmlFor={`fuel-diesel-${year}`}>
                                    Diesel
                                </label>
                                {renderField('fuelDiesel', {
                                    id: `fuel-diesel-${year}`,
                                    className: fuelInput,
                                })}
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-xs text-slate-400" htmlFor={`fuel-lpg-${year}`}>
                                    LPG
                                </label>
                                {renderField('fuelLpg', {
                                    id: `fuel-lpg-${year}`,
                                    className: fuelInput,
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="text-[11px] text-slate-500 uppercase tracking-[0.3em]">
                    All entries are saved automatically.
                </div>
            </div>
        </div>
    );
};

export default YearDataForm;
