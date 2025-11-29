'use client';
import React from "react";
import { Formik, Form, Field } from "formik";

export default function UsageForm() {
    // Współczynniki emisji
    const perComputerKwh = 300;
    const gridKgPerKwh = 0.4;
    const perComputerKg = perComputerKwh * gridKgPerKwh;
    const perEmployeeKg = 1500;
    const carKgPerKm = 0.192;
    const flightKgPerKm = 0.254;

    return (
        <div className="mx-auto max-w-xl p-6 bg-white dark:bg-zinc-900 rounded-lg shadow">
            <h2 className="text-2xl font-semibold mb-4 text-black dark:text-zinc-50">Kalkulator emisji CO2</h2>
            <Formik
                initialValues={{
                    computers: 0,
                    employees: 0,
                    carKm: 0,
                    flightKm: 0
                }}
                onSubmit={() => {}}
            >
                {({ values, resetForm }) => {
                    const compEmissions = values.computers * perComputerKg;
                    const employeeEmissions = values.employees * perEmployeeKg;
                    const carEmissions = values.carKm * carKgPerKm;
                    const flightEmissions = values.flightKm * flightKgPerKm;
                    const totalKg = compEmissions + employeeEmissions + carEmissions + flightEmissions;
                    const totalT = totalKg / 1000;

                    return (
                        <Form>
                            <label className="block mb-2 text-sm text-zinc-700 dark:text-zinc-300">
                                Liczba komputerów
                                <Field
                                    type="number"
                                    name="computers"
                                    min={0}
                                    className="mt-1 w-full rounded border px-3 py-2"
                                />
                            </label>
                            <label className="block mb-2 text-sm text-zinc-700 dark:text-zinc-300">
                                Liczba pracowników
                                <Field
                                    type="number"
                                    name="employees"
                                    min={0}
                                    className="mt-1 w-full rounded border px-3 py-2"
                                />
                            </label>
                            <label className="block mb-2 text-sm text-zinc-700 dark:text-zinc-300">
                                Przejazdy służbowe - samochód (suma km/rok)
                                <Field
                                    type="number"
                                    name="carKm"
                                    min={0}
                                    className="mt-1 w-full rounded border px-3 py-2"
                                />
                            </label>
                            <label className="block mb-4 text-sm text-zinc-700 dark:text-zinc-300">
                                Przejazdy służbowe - loty (suma km/rok)
                                <Field
                                    type="number"
                                    name="flightKm"
                                    min={0}
                                    className="mt-1 w-full rounded border px-3 py-2"
                                />
                            </label>

                            <div className="space-y-2 mb-4">
                                <div className="text-sm text-zinc-600 dark:text-zinc-300">Komputery: {compEmissions.toFixed(1)} kg CO2</div>
                                <div className="text-sm text-zinc-600 dark:text-zinc-300">Pracownicy: {employeeEmissions.toFixed(1)} kg CO2</div>
                                <div className="text-sm text-zinc-600 dark:text-zinc-300">Samochód: {carEmissions.toFixed(1)} kg CO2</div>
                                <div className="text-sm text-zinc-600 dark:text-zinc-300">Loty: {flightEmissions.toFixed(1)} kg CO2</div>
                            </div>

                            <div className="mb-4">
                                <div className="text-lg font-medium text-black dark:text-zinc-50">Razem: {totalKg.toFixed(1)} kg CO2 ({totalT.toFixed(2)} tCO2)</div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => resetForm()}
                                    className="px-4 py-2 rounded bg-gray-200 dark:bg-zinc-800 text-black dark:text-zinc-50"
                                >
                                    Reset
                                </button>
                                <button
                                    type="button"
                                    onClick={() => navigator.clipboard?.writeText(`Całkowita emisja: ${totalT.toFixed(2)} tCO2`)}
                                    className="px-4 py-2 rounded bg-foreground text-background"
                                >
                                    Kopiuj wynik
                                </button>
                            </div>

                            <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
                                Uwaga: wartości są przybliżone i służą do szybkiej oceny. Dla raportów użyj lokalnych współczynników emisji.
                            </p>
                        </Form>
                    );
                }}
            </Formik>
        </div>
    );
}
