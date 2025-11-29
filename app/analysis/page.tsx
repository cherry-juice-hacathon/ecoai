'use client';
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { Sparkles } from "lucide-react";
import { CountrySelect } from "./CountrySelect";

const validationSchema = Yup.object({
    country: Yup.string().required("Please select a country"),
});

export default function Page() {
    const handleSubmit = (values: { country: string }) => {
        console.log("Selected country:", values.country);
    };

    return (
        <div className="max-w-5xl mx-auto px-6 py-12 pb-24 pt-25">
            <Formik
                initialValues={{ country: "" }}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
            >
                {({ isSubmitting }) => (
                    <Form className="space-y-8">
                        {/* Country section */}
                        <CountrySelect />

                        {/* Submit */}
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="px-8 py-3 bg-eco-500 hover:bg-eco-400 disabled:bg-slate-600 rounded-2xl text-sm font-semibold text-slate-900 flex items-center gap-2 transition-all shadow-lg hover:shadow-eco-500/30"
                            >
                                <Sparkles size={16} />
                                {isSubmitting ? "Saving..." : "Calculate"}
                            </button>
                        </div>
                    </Form>
                )}
            </Formik>
        </div>
    );
}
