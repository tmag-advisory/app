import { useState } from "react";
import api from "../../api/axios";

interface Props {
    onClose: () => void;
}

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

export default function AffiliateApplicationModal({ onClose }: Props) {
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

    // Validation per step
    const step1Valid = form.fullName.trim() !== "" && form.email.trim() !== "";
    const step2Valid = form.promotionPlan.trim() !== "";
    const step3Valid = form.agreedToTerms;

    const handleNext = () => {
        if (step === 1 && !step1Valid) return;
        if (step === 2 && !step2Valid) return;
        setStep((s) => s + 1);
    };

    const handleBack = () => setStep((s) => s - 1);

    const handleSubmit = async () => {
        if (!step3Valid) return;
        setLoading(true);
        setError(null);
        try {
            await api.post("/public/affiliate/apply", {
                fullName: form.fullName,
                companyName: form.companyName || undefined,
                email: form.email,
                phone: form.phone || undefined,
                websiteUrl: form.websiteUrl || undefined,
                socialMediaLinks: form.socialLinks || undefined,
                estimatedMonthlyReach: form.monthlyReach || undefined,
                promoDescription: form.promotionPlan,
                agreedToTerms: form.agreedToTerms,
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
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div className="relative w-full max-w-lg bg-background-primary rounded-2xl shadow-2xl p-6 sm:p-8">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-muted hover:text-heading transition-colors duration-150 p-1 rounded-lg hover:bg-button-secondary"
                    aria-label="Close"
                >
                    <svg
                        width="18"
                        height="18"
                        viewBox="0 0 18 18"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                    >
                        <line x1="2" y1="2" x2="16" y2="16" />
                        <line x1="16" y1="2" x2="2" y2="16" />
                    </svg>
                </button>

                {/* Header */}
                <div className="mb-6 pr-6">
                    <h2 className="text-xl font-semibold text-heading font-serif">
                        Apply as Affiliate
                    </h2>
                    <p className="text-xs text-muted mt-1">
                        Partner with TMAG and earn commissions on referrals.
                    </p>
                </div>

                {submitted ? (
                    <SuccessState onClose={onClose} />
                ) : (
                    <>
                        {/* Step indicator */}
                        <StepIndicator current={step} total={3} />

                        {/* Step content */}
                        <div className="mt-6">
                            {step === 1 && (
                                <StepOne form={form} set={set} />
                            )}
                            {step === 2 && (
                                <StepTwo form={form} set={set} />
                            )}
                            {step === 3 && (
                                <StepThree
                                    form={form}
                                    set={set}
                                    error={error}
                                />
                            )}
                        </div>

                        {/* Navigation */}
                        <div className="mt-6 flex items-center justify-between gap-3">
                            {step > 1 ? (
                                <button
                                    onClick={handleBack}
                                    className="flex items-center gap-2 px-4 py-2.5 bg-button-secondary text-heading rounded-xl text-sm font-semibold hover:bg-border-light transition-colors duration-150"
                                >
                                    <svg
                                        width="14"
                                        height="14"
                                        viewBox="0 0 14 14"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <polyline points="9,2 4,7 9,12" />
                                    </svg>
                                    Back
                                </button>
                            ) : (
                                <div />
                            )}

                            {step < 3 ? (
                                <button
                                    onClick={handleNext}
                                    disabled={
                                        (step === 1 && !step1Valid) ||
                                        (step === 2 && !step2Valid)
                                    }
                                    className="px-5 py-2.5 bg-dark text-background-primary rounded-xl text-sm font-semibold hover:bg-darkest transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    Continue
                                    <svg
                                        width="14"
                                        height="14"
                                        viewBox="0 0 14 14"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <polyline points="5,2 10,7 5,12" />
                                    </svg>
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
        </div>
    );
}

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
                                    <svg
                                        width="10"
                                        height="10"
                                        viewBox="0 0 10 10"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <polyline points="1.5,5 4,7.5 8.5,2.5" />
                                    </svg>
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
                <label className={labelClass}>Estimated Monthly Referral Reach</label>
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
    error,
}: {
    form: FormData;
    set: (f: keyof FormData, v: string | boolean) => void;
    error: string | null;
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
                        onChange={(e) =>
                            set("agreedToTerms", e.target.checked)
                        }
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
                            <svg
                                width="10"
                                height="10"
                                viewBox="0 0 10 10"
                                fill="none"
                                stroke="white"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <polyline points="1.5,5 4,7.5 8.5,2.5" />
                            </svg>
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

            {/* Error message */}
            {error && (
                <p className="text-xs text-danger bg-danger/10 border border-danger/20 rounded-xl px-3 py-2.5">
                    {error}
                </p>
            )}
        </div>
    );
}

// ─── Success State ───────────────────────────────────────────────────────────

function SuccessState({ onClose }: { onClose: () => void }) {
    return (
        <div className="py-6 flex flex-col items-center text-center gap-4">
            <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center">
                <svg
                    width="28"
                    height="28"
                    viewBox="0 0 28 28"
                    fill="none"
                    stroke="#2a7a6a"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <circle cx="14" cy="14" r="11" />
                    <polyline points="8,14 12,18 20,10" />
                </svg>
            </div>
            <div>
                <h3 className="text-base font-semibold text-heading">
                    Application submitted!
                </h3>
                <p className="text-sm text-muted mt-1.5 max-w-xs">
                    We'll review it and reach out within 2–3 business days.
                </p>
            </div>
            <button
                onClick={onClose}
                className="mt-2 px-5 py-2.5 bg-dark text-background-primary rounded-xl text-sm font-semibold hover:bg-darkest transition-colors duration-150"
            >
                Close
            </button>
        </div>
    );
}
