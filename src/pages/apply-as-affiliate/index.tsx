import { useState } from "react";
import { motion } from "framer-motion";
import {
    LucideCheck,
    LucideArrowRight,
    LucideArrowLeft,
    LucideHandshake,
    LucideTrendingUp,
    LucideUsers,
    LucidePercent,
    LucideCheckCircle2,
    LucideGlobe,
} from "lucide-react";
import api from "../../api/axios";

interface FormData {
    fullName: string;
    companyName: string;
    email: string;
    phone: string;
    websiteUrl: string;
    socialLinks: string;
    monthlyReach: string;
    promotionPlan: string;
    agreedToTerms: boolean;
}

const REACH_OPTIONS = [
    { value: "", label: "Select estimated reach" },
    { value: "under_500", label: "Under 500" },
    { value: "500_2000", label: "500–2,000" },
    { value: "2000_10000", label: "2,000–10,000" },
    { value: "10000_50000", label: "10,000–50,000" },
    { value: "50000_plus", label: "50,000+" },
];

const REACH_LABELS: Record<string, string> = {
    under_500: "Under 500",
    "500_2000": "500–2,000",
    "2000_10000": "2,000–10,000",
    "10000_50000": "10,000–50,000",
    "50000_plus": "50,000+",
};

const inputClass =
    "w-full border border-border-light rounded-xl px-3 py-2.5 text-sm text-heading placeholder:text-muted bg-background-secondary focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-colors duration-150";

const labelClass = "block text-xs font-semibold text-heading mb-1.5";

const benefits = [
    {
        icon: <LucidePercent className="w-5 h-5" />,
        title: "Competitive Commission",
        desc: "Earn recurring commissions on every traveller you refer to TMAG.",
    },
    {
        icon: <LucideUsers className="w-5 h-5" />,
        title: "Grow Your Audience",
        desc: "Offer your community a valuable travel health resource they'll thank you for.",
    },
    {
        icon: <LucideTrendingUp className="w-5 h-5" />,
        title: "Real-Time Analytics",
        desc: "Track referrals, conversions, and payouts from your affiliate dashboard.",
    },
    {
        icon: <LucideGlobe className="w-5 h-5" />,
        title: "Global Reach",
        desc: "Partner with a platform serving travellers worldwide across 200+ destinations.",
    },
];

const ApplyAsAffiliate = () => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [form, setForm] = useState<FormData>({
        fullName: "",
        companyName: "",
        email: "",
        phone: "",
        websiteUrl: "",
        socialLinks: "",
        monthlyReach: "",
        promotionPlan: "",
        agreedToTerms: false,
    });

    const set = (field: keyof FormData, value: string | boolean) =>
        setForm((prev) => ({ ...prev, [field]: value }));

    const step1Valid = form.fullName.trim() !== "" && form.email.trim() !== "";
    const step2Valid = form.promotionPlan.trim() !== "";
    const step3Valid = form.agreedToTerms;

    const goTo = (next: number) => {
        setStep(next);
    };

    const handleSubmit = async () => {
        if (!step3Valid) return;
        setLoading(true);
        setError(null);
        try {
            await api.post("/v1/public/affiliate/apply", {
                full_name: form.fullName,
                company_name: form.companyName || undefined,
                email: form.email,
                phone: form.phone || undefined,
                website_url: form.websiteUrl || undefined,
                social_links: form.socialLinks || undefined,
                monthly_reach: form.monthlyReach || undefined,
                promotion_plan: form.promotionPlan,
            });
            setSubmitted(true);
        } catch {
            setError(
                "Something went wrong. Please try again or contact support.",
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-background-primary">
            <section className="pt-24 pb-20 px-4 max-w-5xl mx-auto">
                {/* Hero */}
                <motion.div
                    initial={{ opacity: 0, y: -12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    <span className="inline-block text-sm text-muted bg-button-secondary font-semibold rounded-xl px-4 py-1.5 mb-5">
                        Affiliate Programme
                    </span>
                    <h1 className="text-4xl md:text-5xl font-serif text-heading mb-4 leading-tight">
                        Partner with TMAG
                    </h1>
                    <p className="text-body text-lg max-w-xl mx-auto">
                        Earn commissions by sharing travel health advice with
                        your audience. Join a growing network of affiliates
                        worldwide.
                    </p>
                </motion.div>

                {/* Benefits */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.08 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-16 max-w-5xl"
                >
                    {benefits.map((b) => (
                        <div
                            key={b.title}
                            className="p-6 rounded-2xl border border-border-light/50 bg-background-primary"
                        >
                            <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center mb-4">
                                {b.icon}
                            </div>
                            <h3 className="font-medium text-heading mb-1.5">
                                {b.title}
                            </h3>
                            <p className="text-sm text-body">{b.desc}</p>
                        </div>
                    ))}
                </motion.div>

                {/* Application form */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.14 }}
                    className="max-w-5xl mx-auto"
                >
                    <div className="p-8 rounded-2xl border border-border-light/50 bg-white">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                                <LucideHandshake className="w-4.5 h-4.5" />
                            </div>
                            <h2 className="text-lg font-serif text-heading">
                                {submitted
                                    ? "Application Submitted"
                                    : "Apply to Become an Affiliate"}
                            </h2>
                        </div>

                        {submitted ? (
                            <div className="py-6 flex flex-col items-center text-center gap-4">
                                <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center">
                                    <LucideCheckCircle2 className="w-7 h-7 text-accent" />
                                </div>
                                <div>
                                    <h3 className="text-base font-semibold text-heading">
                                        Application submitted!
                                    </h3>
                                    <p className="text-sm text-muted mt-1.5 max-w-xs">
                                        We'll review it and reach out within
                                        2–3 business days.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* Step indicator */}
                                <StepIndicator current={step} total={3} />

                                {error && (
                                    <div className="mt-5 mb-0 px-4 py-3.5 rounded-2xl bg-red-50 border border-red-200 text-sm text-red-700">
                                        {error}
                                    </div>
                                )}

                                <div className="mt-6">
                                    {step === 1 && (
                                        <StepOne form={form} set={set} />
                                    )}
                                    {step === 2 && (
                                        <StepTwo form={form} set={set} />
                                    )}
                                    {step === 3 && (
                                        <StepThree form={form} set={set} />
                                    )}
                                </div>

                                {/* Navigation */}
                                <div className="mt-6 flex items-center justify-between gap-3">
                                    {step > 1 ? (
                                        <button
                                            onClick={() => goTo(step - 1)}
                                            className="flex items-center gap-2 px-4 py-2.5 bg-button-secondary text-heading rounded-xl text-sm font-semibold hover:bg-border-light transition-colors duration-150"
                                        >
                                            <LucideArrowLeft className="w-3.5 h-3.5" />
                                            Back
                                        </button>
                                    ) : (
                                        <div />
                                    )}

                                    {step < 3 ? (
                                        <button
                                            onClick={() => goTo(step + 1)}
                                            disabled={
                                                (step === 1 && !step1Valid) ||
                                                (step === 2 && !step2Valid)
                                            }
                                            className="px-5 py-2.5 bg-dark text-background-primary rounded-xl text-sm font-semibold hover:bg-darkest transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                                        >
                                            Continue
                                            <LucideArrowRight className="w-3.5 h-3.5" />
                                        </button>
                                    ) : (
                                        <button
                                            onClick={handleSubmit}
                                            disabled={!step3Valid || loading}
                                            className="px-5 py-2.5 bg-accent text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity duration-150 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                                        >
                                            {loading ? (
                                                <>
                                                    <svg
                                                        className="animate-spin"
                                                        width="14"
                                                        height="14"
                                                        viewBox="0 0 14 14"
                                                        fill="none"
                                                    >
                                                        <circle
                                                            cx="7"
                                                            cy="7"
                                                            r="5"
                                                            stroke="currentColor"
                                                            strokeWidth="2"
                                                            strokeDasharray="20"
                                                            strokeDashoffset="10"
                                                            strokeLinecap="round"
                                                        />
                                                    </svg>
                                                    Submitting…
                                                </>
                                            ) : (
                                                "Submit Application"
                                            )}
                                        </button>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </motion.div>
            </section>
        </main>
    );
};

// ─── Step Indicator ──────────────────────────────────────────────────────────

function StepIndicator({
    current,
    total,
}: {
    current: number;
    total: number;
}) {
    const stepLabels = ["About You", "Your Reach", "Review & Agree"];
    return (
        <div className="flex items-center gap-2">
            {Array.from({ length: total }, (_, i) => {
                const n = i + 1;
                const done = n < current;
                const active = n === current;
                return (
                    <div key={n} className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5">
                            <div
                                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors duration-200 ${
                                    done
                                        ? "bg-accent text-white"
                                        : active
                                          ? "bg-dark text-background-primary"
                                          : "bg-button-secondary text-muted"
                                }`}
                            >
                                {done ? (
                                    <LucideCheck className="w-3 h-3" />
                                ) : (
                                    n
                                )}
                            </div>
                            <span
                                className={`text-xs font-medium hidden sm:block ${active ? "text-heading" : "text-muted"}`}
                            >
                                {stepLabels[i]}
                            </span>
                        </div>
                        {n < total && (
                            <div
                                className={`h-px w-6 sm:w-10 transition-colors duration-200 ${done ? "bg-accent" : "bg-border-light"}`}
                            />
                        )}
                    </div>
                );
            })}
        </div>
    );
}

// ─── Step 1: About You ───────────────────────────────────────────────────────

function StepOne({
    form,
    set,
}: {
    form: FormData;
    set: (f: keyof FormData, v: string | boolean) => void;
}) {
    return (
        <div className="space-y-4">
            <div>
                <label className={labelClass}>
                    Full Name <span className="text-danger">*</span>
                </label>
                <input
                    type="text"
                    className={inputClass}
                    placeholder="Jane Smith"
                    value={form.fullName}
                    onChange={(e) => set("fullName", e.target.value)}
                    autoFocus
                />
            </div>
            <div>
                <label className={labelClass}>Company Name</label>
                <input
                    type="text"
                    className={inputClass}
                    placeholder="Acme Health Co."
                    value={form.companyName}
                    onChange={(e) => set("companyName", e.target.value)}
                />
            </div>
            <div>
                <label className={labelClass}>
                    Email <span className="text-danger">*</span>
                </label>
                <input
                    type="email"
                    className={inputClass}
                    placeholder="jane@example.com"
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                />
            </div>
            <div>
                <label className={labelClass}>Phone</label>
                <input
                    type="tel"
                    className={inputClass}
                    placeholder="+1 (555) 000-0000"
                    value={form.phone}
                    onChange={(e) => set("phone", e.target.value)}
                />
            </div>
        </div>
    );
}

// ─── Step 2: Your Reach ──────────────────────────────────────────────────────

function StepTwo({
    form,
    set,
}: {
    form: FormData;
    set: (f: keyof FormData, v: string | boolean) => void;
}) {
    return (
        <div className="space-y-4">
            <div>
                <label className={labelClass}>Website URL</label>
                <input
                    type="url"
                    className={inputClass}
                    placeholder="https://yourwebsite.com"
                    value={form.websiteUrl}
                    onChange={(e) => set("websiteUrl", e.target.value)}
                />
            </div>
            <div>
                <label className={labelClass}>Social Media Links</label>
                <textarea
                    className={`${inputClass} resize-none`}
                    rows={3}
                    placeholder="Instagram: @handle, Twitter: @handle, etc."
                    value={form.socialLinks}
                    onChange={(e) => set("socialLinks", e.target.value)}
                />
            </div>
            <div>
                <label className={labelClass}>
                    Estimated Monthly Referral Reach
                </label>
                <select
                    className={inputClass}
                    value={form.monthlyReach}
                    onChange={(e) => set("monthlyReach", e.target.value)}
                >
                    {REACH_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
            </div>
            <div>
                <label className={labelClass}>
                    How do you plan to promote TMAG?{" "}
                    <span className="text-danger">*</span>
                </label>
                <textarea
                    className={`${inputClass} resize-none`}
                    rows={4}
                    placeholder="Describe your approach — blog posts, newsletters, social content, speaking events, etc."
                    value={form.promotionPlan}
                    onChange={(e) => set("promotionPlan", e.target.value)}
                />
            </div>
        </div>
    );
}

// ─── Step 3: Review & Agree ──────────────────────────────────────────────────

function StepThree({
    form,
    set,
}: {
    form: FormData;
    set: (f: keyof FormData, v: string | boolean) => void;
}) {
    const rows: Array<[string, string]> = [
        ["Full Name", form.fullName],
        ["Company", form.companyName || "—"],
        ["Email", form.email],
        ["Phone", form.phone || "—"],
        ["Website", form.websiteUrl || "—"],
        ["Social Links", form.socialLinks || "—"],
        [
            "Monthly Reach",
            form.monthlyReach ? REACH_LABELS[form.monthlyReach] : "—",
        ],
        ["Promotion Plan", form.promotionPlan],
    ];

    return (
        <div className="space-y-5">
            {/* Summary card */}
            <div className="bg-background-secondary border border-border-light rounded-xl p-4 space-y-2.5">
                {rows.map(([label, value]) => (
                    <div key={label} className="flex gap-3 text-sm">
                        <span className="min-w-[110px] text-muted font-medium shrink-0">
                            {label}
                        </span>
                        <span className="text-heading break-words min-w-0">
                            {value}
                        </span>
                    </div>
                ))}
            </div>

            {/* Terms checkbox */}
            <label className="flex items-start gap-3 cursor-pointer group">
                <div className="relative mt-0.5 shrink-0">
                    <input
                        type="checkbox"
                        className="sr-only"
                        checked={form.agreedToTerms}
                        onChange={(e) => set("agreedToTerms", e.target.checked)}
                    />
                    <div
                        className={`w-4.5 h-4.5 rounded border-2 flex items-center justify-center transition-colors duration-150 ${
                            form.agreedToTerms
                                ? "bg-accent border-accent"
                                : "bg-background-primary border-border group-hover:border-muted"
                        }`}
                        style={{ width: "18px", height: "18px" }}
                    >
                        {form.agreedToTerms && (
                            <LucideCheck className="w-2.5 h-2.5 text-white" />
                        )}
                    </div>
                </div>
                <span className="text-xs text-muted leading-relaxed">
                    I agree to the{" "}
                    <a
                        href="https://tmag.health/affiliate-terms"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent underline underline-offset-2 hover:opacity-80"
                    >
                        TMAG Affiliate Terms &amp; Conditions
                    </a>
                </span>
            </label>
        </div>
    );
}

export default ApplyAsAffiliate;
