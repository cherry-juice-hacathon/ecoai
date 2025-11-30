'use client';

import { useState, useRef, useEffect } from "react";
import { Formik, Form, FormikHelpers, FormikErrors } from "formik";
import * as Yup from "yup";
import { Sparkles } from "lucide-react";
import { CountrySelect } from "./CountrySelect";
import { YearSelector } from "./YearSelector";
import YearDataForm from "./YearDataForm";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperClass } from "swiper";
import "swiper/css";
import YearTrendsChart from "./YearTrendsChart";

interface YearlyEntry {
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

interface FormValues {
    country: string;
    annualKwh: number | "";
    selectedYears: number[];
    yearlyData: Record<string, YearlyEntry>;
}

type YearEntry = FormValues["yearlyData"][string];

// Yup schema for a single year entry
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
    annualKwh: Yup.number()
        .typeError("Please enter a valid number")
        .min(0, "Value must be zero or greater")
        .required("Please provide annual electricity consumption"),
    selectedYears: Yup.array().of(Yup.number()).optional(),
    yearlyData: Yup.object().test(
        "valid-years",
        "Please fill in all fields for every selected year",
        function (obj) {
            const { selectedYears } = this.parent as FormValues;
            if (!selectedYears || selectedYears.length === 0) return true;
            const data = (obj || {}) as Record<string, YearEntry>;
            // all selected years must satisfy schema
            return selectedYears.every((yr) => {
                const entry = data[String(yr)];
                return yearEntrySchema.isValidSync(entry);
            });
        }
    ),
});

const INITIAL_VALUES: FormValues = {
    country: "polska",
    annualKwh: "",
    selectedYears: [],
    yearlyData: {},
};

export default function Page() {
    const [activeStep, setActiveStep] = useState(0);
    const swiperRef = useRef<SwiperClass | null>(null);
    const sliderRef = useRef<HTMLDivElement>(null);
    const headerRef = useRef<HTMLDivElement>(null);

    const scrollToHeader = () => {
        const el = headerRef.current;
        if (!el) return;
        el.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    useEffect(() => {
        scrollToHeader();
    }, [activeStep]);

    const goNext = () => {
        swiperRef.current?.slideNext();
        scrollToHeader();
    };
    const goBack = () => {
        swiperRef.current?.slidePrev();
        scrollToHeader();
    };

    const handleSubmit = (
        values: FormValues,
        helpers: FormikHelpers<FormValues>
    ) => {
        console.log(
            "Selected country:",
            values.country,
            "Annual kWh:",
            values.annualKwh,
            "Selected years:",
            values.selectedYears,
            "Yearly data:",
            values.yearlyData
        );
        helpers.setSubmitting(false);
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
            <div ref={headerRef} className="mb-10 border-b border-white/10 pb-6 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-400/40 text-emerald-300 text-xs font-semibold tracking-wide mb-3">
                        <Sparkles className="w-3 h-3" />
                        <span>CO₂ Calculator</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 leading-tight">
                        Model your company&apos;s
                        <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-sky-400">
              carbon footprint step by step
            </span>
                    </h1>
                    <p className="text-slate-400 text-sm md:text-base max-w-xl">
                        Start with the country and annual electricity usage. You can always
                        come back and adjust these values later.
                    </p>
                </div>
            </div>

            <Formik<FormValues>
                initialValues={INITIAL_VALUES}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
            >
                {({ isSubmitting, validateForm, setFieldTouched, values, errors }) => {
                    const sortedYears = (values.selectedYears || [])
                        .slice()
                        .sort((a, b) => a - b);
                    const totalSlides = 2 + sortedYears.length;
                    const canProceedPastYearSelect = sortedYears.length > 0;

                    const hasYearData = sortedYears.length > 0;
                    const totalSlidesWithChart = totalSlides + (hasYearData ? 1 : 0);

                    const normalizeValue = (val: number | "") =>
                        typeof val === "number" && Number.isFinite(val) ? val : 0;
                    const trendData = sortedYears.map((yr) => {
                        const entry = values.yearlyData?.[String(yr)];
                        return {
                            year: yr,
                            annualKwh: entry ? normalizeValue(entry.annualKwh) : 0,
                            cloudCo2: entry ? normalizeValue(entry.cloudCo2) : 0,
                            flightMiles: entry ? normalizeValue(entry.flightMiles) : 0,
                            deviceCount: entry
                                ? normalizeValue(entry.laptops) + normalizeValue(entry.monitors) + normalizeValue(entry.servers)
                                : 0,
                        };
                    });

                     return (
                        <Form className="space-y-8">
                            {/* Step indicator */}
                            <div className="flex items-center gap-3 text-xs text-slate-400">
                <span>
                  Step {activeStep + 1} of {totalSlidesWithChart}
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
                                            <YearSelector />
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
                                                        onClick={() => canProceedPastYearSelect && goNext()}
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
                                            const entryErrors = (errors?.yearlyData?.[String(yr)] as FormikErrors<YearlyEntry> | undefined);
                                            const entryValid = !!entry && yearEntrySchema.isValidSync(entry) && !(entryErrors && Object.values(entryErrors).some(Boolean));

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
                                                                    type="button"
                                                                    onClick={() => entryValid && goNext()}
                                                                    disabled={!entryValid}
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

                                    {hasYearData && (
                                        <SwiperSlide key="year-trends">
                                            <div className="transition-all duration-300 ease-out opacity-100 translate-x-0 space-y-6">
                                                <YearTrendsChart data={trendData} isSubmitting={isSubmitting} onBack={goBack} />
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
