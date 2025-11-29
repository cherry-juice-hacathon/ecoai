'use client';
import { useState } from "react";
import { Formik, Form, FormikHelpers } from "formik";
import * as Yup from "yup";
import { Sparkles } from "lucide-react";
import { CountrySelect } from "./CountrySelect";
import { EnergyConsumptionCard } from "./EnergyConsumptionCard";

interface FormValues {
    country: string;
    annualKwh: number | '';
}

const validationSchema = Yup.object({
    country: Yup.string().required("Please select a country"),
    annualKwh: Yup.number()
        .typeError("Please enter a valid number")
        .min(0, "Value must be zero or greater")
        .required("Please provide annual electricity consumption"),
});

const INITIAL_VALUES: FormValues = {
    country: "",
    annualKwh: "",
};

const TOTAL_STEPS = 2;

export default function Page() {
    const [activeStep, setActiveStep] = useState(0);

    const handleSubmit = (values: FormValues, helpers: FormikHelpers<FormValues>) => {
        // Final submit on last step
        console.log("Selected country:", values.country, "Annual kWh:", values.annualKwh);
        helpers.setSubmitting(false);
    };

    const handleNextFromStep0 = async (
        validateForm: (values?: any) => Promise<Record<string, string>>,
        setFieldTouched: (field: string, isTouched?: boolean, shouldValidate?: boolean) => void,
        values: FormValues
    ) => {
        // Validate only the country before going to step 2
        setFieldTouched("country", true, false);
        const errors = await validateForm(values);
        if (!errors.country) {
            setActiveStep(1);
        }
    };

    const handleBack = () => {
        setActiveStep((prev) => Math.max(0, prev - 1));
    };

    return (
        <div className="max-w-5xl mx-auto px-6 py-12 pb-24 pt-25">
            {/* Header */}
            <div className="mb-10 border-b border-white/10 pb-6 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
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
                        Start with the country and annual electricity usage. You can always come back and adjust
                        these values later.
                    </p>
                </div>

                {/* Simple step indicator */}
                <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span>Step {activeStep + 1} of {TOTAL_STEPS}</span>
                    <div className="flex gap-1">
                        {[0, 1].map((step) => (
                            <span
                                key={step}
                                className={`h-1.5 w-6 rounded-full transition-all ${
                                    step <= activeStep
                                        ? 'bg-emerald-400'
                                        : 'bg-slate-600'
                                }`}
                            />
                        ))}
                    </div>
                </div>
            </div>

            <Formik
                initialValues={INITIAL_VALUES}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
            >
                {({ isSubmitting, validateForm, setFieldTouched, values }) => (
                    <Form className="space-y-8">
                        {/* Step content */}
                        <div className="relative min-h-[260px]">
                            {activeStep === 0 && (
                                <div className="transition-all duration-300 ease-out opacity-100 translate-x-0">
                                    <CountrySelect />
                                </div>
                            )}
                            {activeStep === 1 && (
                                <div className="transition-all duration-300 ease-out opacity-100 translate-x-0">
                                    <EnergyConsumptionCard />
                                </div>
                            )}
                        </div>

                        {/* Footer buttons: Back / Next / Calculate */}
                        <div className="flex justify-between items-center pt-4">
                            <div>
                                {activeStep > 0 && (
                                    <button
                                        type="button"
                                        onClick={handleBack}
                                        className="px-4 py-2 rounded-xl border border-slate-600 text-slate-200 text-xs md:text-sm bg-slate-900/60 hover:bg-slate-800/80 transition-colors"
                                    >
                                        Back
                                    </button>
                                )}
                            </div>

                            <div className="flex gap-3">
                                {activeStep === 0 && (
                                    <button
                                        type="button"
                                        onClick={() => handleNextFromStep0(validateForm, setFieldTouched, values)}
                                        className="px-6 py-3 bg-eco-500 hover:bg-eco-400 rounded-2xl text-xs md:text-sm font-semibold text-slate-900 flex items-center gap-2 transition-all shadow-lg hover:shadow-eco-500/30"
                                    >
                                        Next
                                    </button>
                                )}

                                {activeStep === 1 && (
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="px-8 py-3 bg-eco-500 hover:bg-eco-400 disabled:bg-slate-600 rounded-2xl text-xs md:text-sm font-semibold text-slate-900 flex items-center gap-2 transition-all shadow-lg hover:shadow-eco-500/30"
                                    >
                                        <Sparkles size={16} />
                                        {isSubmitting ? 'Calculating...' : 'Calculate'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </Form>
                )}
            </Formik>
        </div>
    );
}
