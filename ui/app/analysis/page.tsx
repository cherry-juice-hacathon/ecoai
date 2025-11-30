'use client';

import { useState, useRef, useEffect } from "react";
import { Formik, Form, FormikHelpers, FormikErrors } from "formik";
import * as Yup from "yup";
import { Sparkles } from "lucide-react";
import { CountrySelect } from "./CountrySelect";
import { YearSelector } from "./YearSelector";
import YearDataForm from "./YearDataForm";
import YearTrendsChart from "./YearTrendsChart";
import { CsvUploader } from "./CsvUploader";
import type { FormValues, YearEntry, YearHistoryPoint } from "./types";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperClass } from "swiper";
import "swiper/css";

const yearEntrySchema = Yup.object({
    annualKwh: Yup.number()
        .typeError("Enter a valid number")
        .min(0, "Must be zero or greater")
        .required("Required"),
    laptops: Yup.number()
        .typeError("Enter a valid number")
        .min(0, "Must be zero or greater")
        .required("Required"),
    monitors: Yup.number()
        .typeError("Enter a valid number")
        .min(0, "Must be zero or greater")
        .required("Required"),
    servers: Yup.number()
        .typeError("Enter a valid number")
        .min(0, "Must be zero or greater")
        .required("Required"),
    cloudCo2: Yup.number()
        .typeError("Enter a valid number")
        .min(0, "Must be zero or greater")
        .required("Required"),
    fuelPetrol: Yup.number()
        .typeError("Enter a valid number")
        .min(0, "Must be zero or greater")
        .required("Required"),
    fuelDiesel: Yup.number()
        .typeError("Enter a valid number")
        .min(0, "Must be zero or greater")
        .required("Required"),
    fuelLpg: Yup.number()
        .typeError("Enter a valid number")
        .min(0, "Must be zero or greater")
        .required("Required"),
    flightMiles: Yup.number()
        .typeError("Enter a valid number")
        .min(0, "Must be zero or greater")
        .required("Required"),
});

const validationSchema = Yup.object({
    country: Yup.string().required("Please select a country"),
    model: Yup.mixed<"linear" | "poly2" | "arima">()
        .oneOf(["linear", "poly2", "arima"], "Choose a model")
        .required("Choose a model"),
    predictionYears: Yup.number()
        .min(1)
        .max(5)
        .required("Select prediction length"),
    selectedYears: Yup.array().of(Yup.number()).optional(),
    yearlyData: Yup.object().test(
        "valid-years",
        "Please fill in all fields for every selected year",
        function (obj) {
            const { selectedYears } = this.parent as FormValues;
            if (!selectedYears || selectedYears.length === 0) return true;
            const data = (obj || {}) as Record<string, YearEntry>;
            // wszystkie wybrane lata muszą przejść walidację schematu
            return selectedYears.every((yr) => {
                const entry = data[String(yr)];
                return yearEntrySchema.isValidSync(entry);
            });
        }
    ),
});

const INITIAL_VALUES: FormValues = {
    country: "Poland",
    model: "linear",
    predictionYears: 3,
    selectedYears: [],
    yearlyData: {},
};

export default function Page() {
    const [activeStep, setActiveStep] = useState(0);
    const swiperRef = useRef<SwiperClass | null>(null);
    const sliderRef = useRef<HTMLDivElement>(null);
    const headerRef = useRef<HTMLDivElement>(null);
    const [shouldShowChart, setShouldShowChart] = useState(false);
    const [chartHistory, setChartHistory] = useState<YearHistoryPoint[]>([]);

    const scrollToHeader = () => {
        const el = headerRef.current;
        if (!el) return;
        const top = el.getBoundingClientRect().top + window.scrollY - 400;
        window.scrollTo({ top, behavior: "smooth" });
    };

    const scrollToSlideTop = () => {
        const el = sliderRef.current;
        if (!el) return;
        const top = el.getBoundingClientRect().top + window.scrollY - 200;
        window.scrollTo({ top, behavior: "smooth" });
    };

    useEffect(() => {
        scrollToHeader();
    }, [activeStep]);

    useEffect(() => {
        scrollToSlideTop();
    }, [activeStep]);

    const goNext = () => {
        swiperRef.current?.slideNext();
        scrollToHeader();
    };

    const goBack = () => {
        swiperRef.current?.slidePrev();
        scrollToHeader();
    };

    const handleSubmit = async (
        values: FormValues,
        helpers: FormikHelpers<FormValues>
    ) => {
        helpers.setSubmitting(false);

        const history: YearHistoryPoint[] = (values.selectedYears || [])
            .slice()
            .sort((a, b) => a - b)
            .map((year) => {
                const entry = values.yearlyData?.[String(year)];
                const toNumber = (val: number | "") =>
                    typeof val === "number" && Number.isFinite(val) ? val : 0;

                return {
                    year,
                    annualKwh: entry ? toNumber(entry.annualKwh) : 0,
                    laptops: entry ? toNumber(entry.laptops) : 0,
                    monitors: entry ? toNumber(entry.monitors) : 0,
                    servers: entry ? toNumber(entry.servers) : 0,
                    deviceCount: entry
                        ? toNumber(entry.laptops) +
                        toNumber(entry.monitors) +
                        toNumber(entry.servers)
                        : 0,
                    cloudCo2: entry ? toNumber(entry.cloudCo2) : 0,
                    flightMiles: entry ? toNumber(entry.flightMiles) : 0,
                    fuelPetrol: entry ? toNumber(entry.fuelPetrol) : 0,
                    fuelDiesel: entry ? toNumber(entry.fuelDiesel) : 0,
                    fuelLpg: entry ? toNumber(entry.fuelLpg) : 0,
                } as YearHistoryPoint;
            });

        setChartHistory(history);
        setShouldShowChart(history.length > 0);

        // przejście na ostatni slajd z wykresem
        setTimeout(() => {
            const lastSlideIndex = swiperRef.current
                ? swiperRef.current.slides.length - 1
                : 0;
            swiperRef.current?.slideTo(lastSlideIndex);
            scrollToHeader();
        }, 0);
    };

    const handleNextFromStep0 = async (
        validateForm: (values?: FormValues) => Promise<FormikErrors<FormValues>>,
        setFieldTouched: (
            field: string,
            isTouched?: boolean,
            shouldValidate?: boolean
        ) => void,
        values: FormValues
    ) => {
        // walidujemy tylko country zanim przejdziemy dalej
        setFieldTouched("country", true, false);
        const errors = await validateForm(values);
        if (!errors.country) {
            swiperRef.current?.slideNext();
        }
    };

    return (
        <div className="max-w-5xl mx-auto px-6 py-12 pb-24 pt-24">
            {/* Header */}
            <div
                ref={headerRef}
                className="mb-10 border-b border-white/10 pb-6 flex flex-col md:flex-row md:items-end md:justify-between gap-4"
            >
                <div>
                    <div
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-400/40 text-emerald-300 text-xs font-semibold tracking-wide mb-3">
                        <Sparkles className="w-3 h-3"/>
                        <span>CO₂ Calculator</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 leading-tight">
                        Model your company&apos;s
                        <span
                            className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-sky-400">
              carbon footprint step by step

            </span>
                    </h1>
                    <p className="text-slate-400 text-sm md:text-base max-w-xl">
                        One guided workflow to collect operational data, forecast future usage, and translate everything into a clear carbon footprint story for your company.
                    </p>
                </div>
            </div>

            <Formik<FormValues>
                initialValues={INITIAL_VALUES}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
            >
                {({
                      validateForm,
                      setFieldTouched,
                      values,
                      errors,
                      setFieldValue,
                      touched,
                  }) => {
                    const sortedYears = (values.selectedYears || [])
                        .slice()
                        .sort((a, b) => a - b);
                    const totalSlides =
                        2 + sortedYears.length + (shouldShowChart ? 1 : 0);
                    const canProceedPastYearSelect = sortedYears.length > 0;

                    const handleYearSlideNext = async (targetYear: number) => {
                        const validationErrors = await validateForm();
                        const yearErrors =
                            (validationErrors.yearlyData as Record<
                                string,
                                FormikErrors<YearEntry>
                            > | undefined)?.[String(targetYear)];
                        if (!yearErrors || Object.keys(yearErrors).length === 0) {
                            goNext();
                        }
                    };

                    return (
                        <Form className="space-y-8">
                            {/* Model & horizon switch */}
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-3">
                                    <div className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                                        Analysis mode
                                    </div>
                                    <div className="inline-flex overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-1 text-xs font-semibold">
                                        {["linear", "poly2", "arima"].map((option) => (
                                            <button
                                                key={option}
                                                type="button"
                                                onClick={() => setFieldValue("model", option)}
                                                className={`px-4 py-2 transition-all rounded-lg ${
                                                    values.model === option
                                                        ? "bg-emerald-400 text-slate-900 shadow"
                                                        : "text-slate-300"
                                                }`}
                                            >
                                                {option === "linear" ? "Linear" : option === "poly2" ? "Polynomial" : "ARIMA"}
                                            </button>
                                        ))}
                                    </div>
                                    {touched.model && errors.model && (
                                        <p className="text-xs text-rose-400">{errors.model}</p>
                                    )}
                                </div>

                                <div className="space-y-3">
                                    <div className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                                        Prediction window (years)
                                    </div>
                                    <div className="flex gap-2">
                                        {[1, 2, 3, 4, 5].map((yearOption) => (
                                            <button
                                                key={yearOption}
                                                type="button"
                                                onClick={() => setFieldValue("predictionYears", yearOption)}
                                                className={`flex-1 rounded-2xl border px-4 py-2 text-xs font-semibold transition-all ${
                                                    values.predictionYears === yearOption
                                                        ? "border-emerald-400 bg-emerald-500/20 text-white"
                                                        : "border-white/10 text-slate-300"
                                                }`}
                                            >
                                                {yearOption}y
                                            </button>
                                        ))}
                                    </div>
                                    {touched.predictionYears && errors.predictionYears && (
                                        <p className="text-xs text-rose-400">{errors.predictionYears}</p>
                                    )}
                                </div>
                            </div>

                            {/* Step indicator */}
                            <div className="flex items-center gap-3 text-xs text-slate-400">
                <span>
                  Step {activeStep + 1} of {totalSlides}
                </span>
                            </div>

                            {/* Steps */}
                            <div ref={sliderRef} className="relative min-h-[260px]">
                                <Swiper
                                    onSwiper={(sw: SwiperClass) => (swiperRef.current = sw)}
                                    onSlideChange={(sw: SwiperClass) =>
                                        setActiveStep(sw.activeIndex)
                                    }
                                    spaceBetween={50}
                                    slidesPerView={1}
                                    speed={500}
                                    allowTouchMove={false}
                                    className="!h-auto"
                                >
                                    {/* Step 1: Country */}
                                    <SwiperSlide>
                                        <div className="transition-all duration-300 ease-out opacity-100 translate-x-0 space-y-6">
                                            <CountrySelect />
                                            <div className="flex justify-end">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleNextFromStep0(
                                                            validateForm,
                                                            setFieldTouched,
                                                            values
                                                        )
                                                    }
                                                    className="px-6 py-3 bg-eco-500 hover:bg-eco-400 rounded-2xl text-xs md:text-sm font-semibold text-slate-900 flex items-center gap-2 transition-all shadow-lg hover:shadow-eco-500/30"
                                                >
                                                    Next
                                                </button>
                                            </div>
                                        </div>
                                    </SwiperSlide>

                                    {/* Step 2: Year selector */}
                                    <SwiperSlide>
                                        <div className="transition-all duration-300 ease-out opacity-100 translate-x-0 space-y-6">
                                            <div className="grid gap-6 lg:grid-cols-2">
                                                <YearSelector />
                                                <CsvUploader />
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <div className="flex justify-between">
                                                    <button
                                                        type="button"
                                                        onClick={goBack}
                                                        className="px-4 py-2 rounded-xl border border-slate-600 text-slate-200 text-xs md:text-sm bg-slate-900/60 hover:bg-slate-800/80 transition-colors"
                                                    >
                                                        Back
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            canProceedPastYearSelect && goNext()
                                                        }
                                                        disabled={!canProceedPastYearSelect}
                                                        className="px-6 py-3 bg-eco-500 hover:bg-eco-400 disabled:bg-slate-700/60 disabled:text-slate-400 rounded-2xl text-xs md:text-sm font-semibold text-slate-900 flex items-center gap-2 transition-all shadow-lg hover:shadow-eco-500/30"
                                                    >
                                                        Next
                                                    </button>
                                                </div>
                                                {!canProceedPastYearSelect && (
                                                    <p className="text-xs text-rose-300">
                                                        Select at least one year to continue.
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </SwiperSlide>

                                    {/* Steps 3+: per-year data */}
                                    {sortedYears.length > 0 &&
                                        sortedYears.map((yr, idx) => {
                                            const isLastDataSlide = idx === sortedYears.length - 1;
                                            const entry = values.yearlyData?.[String(yr)];
                                            const entryErrors = (errors?.yearlyData as
                                                | Record<string, FormikErrors<YearEntry>>
                                                | undefined)?.[String(yr)];
                                            const entryHasErrors = Boolean(
                                                entryErrors &&
                                                Object.values(entryErrors).some(
                                                    (val) => Boolean(val)
                                                )
                                            );

                                            return (
                                                <SwiperSlide key={`year-${yr}`}>
                                                    <div className="transition-all duration-300 ease-out opacity-100 translate-x-0 space-y-6">
                                                        <YearDataForm year={yr} />
                                                        <div className="flex flex-col gap-2">
                                                            <div className="flex justify-between">
                                                                <button
                                                                    type="button"
                                                                    onClick={goBack}
                                                                    className="px-4 py-2 rounded-xl border border-slate-600 text-slate-200 text-xs md:text-sm bg-slate-900/60 hover:bg-slate-800/80 transition-colors"
                                                                >
                                                                    Back
                                                                </button>
                                                                <button
                                                                    type={isLastDataSlide ? "submit" : "button"}
                                                                    onClick={() => {
                                                                        if (!isLastDataSlide) {
                                                                            handleYearSlideNext(yr);
                                                                        }
                                                                    }}
                                                                    disabled={!entry || entryHasErrors}
                                                                    className="px-6 py-3 bg-eco-500 hover:bg-eco-400 disabled:bg-slate-700/60 disabled:text-slate-400 rounded-2xl text-xs md:text-sm font-semibold text-slate-900 flex items-center gap-2 transition-all shadow-lg hover:shadow-eco-500/30"
                                                                >
                                                                    <Sparkles size={16} />
                                                                    {isLastDataSlide ? "Calculate" : "Next"}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </SwiperSlide>
                                            );
                                        })}

                                    {/* Chart Slide */}
                                    {shouldShowChart && chartHistory.length > 0 && (
                                        <SwiperSlide>
                                            <div className="transition-all duration-300 ease-out space-y-6">
                                                <YearTrendsChart
                                                    country={values.country}
                                                    selectedModel={values.model}
                                                    predictionYears={values.predictionYears}
                                                    historyData={chartHistory}
                                                    onBack={goBack}
                                                />
                                            </div>
                                        </SwiperSlide>
                                    )}
                                </Swiper>
                            </div>
                        </Form>
                    );
                }}
            </Formik>
        </div>
    );
}
