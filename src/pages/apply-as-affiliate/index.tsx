import { useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
    LucideLink2,
    LucideMessageSquare,
    LucideBarChart3,
    LucideUser,
    LucideBuilding2,
    LucideMail,
    LucidePhone,
} from "lucide-react";
import api from "../../api/axios";

// ─── Types ──────────────────────────────────────────────────────────────────

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

type SetField = (field: keyof FormData, value: string | boolean) => void;

// ─── Constants ───────────────────────────────────────────────────────────────

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

const STEPS = [
    { label: "About You", icon: LucideUser },
    { label: "Your Reach", icon: LucideBarChart3 },
    { label: "Review & Agree", icon: LucideCheck },
] as const;

// ─── Animations ──────────────────────────────────────────────────────────────

const stepVariants = {
    enter: (dir: number) => ({
        x: dir > 0 ? 80 : -80,
        opacity: 0,
        scale: 0.96,
    }),
    center: {
        x: 0,
        opacity: 1,
        scale: 1,
        transition: { type: "spring" as const, stiffness: 300, damping: 30 },
    },
    exit: (dir: number) => ({
        x: dir > 0 ? -80 : 80,
        opacity: 0,
        scale: 0.96,
        transition: { duration: 0.2, ease: "easeIn" as const },
    }),
};

const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: {
            delay: i * 0.08,
            type: "spring" as const,
            stiffness: 300,
            damping: 28,
        },
    }),
};

// ─── Benefits ────────────────────────────────────────────────────────────────

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

// ─── Input components ────────────────────────────────────────────────────────

const Input = ({
    label,
    required,
    placeholder,
    value,
    onChange,
    type = "text",
    icon,
    autoFocus,
}: {
    label: string;
    required?: boolean;
    placeholder?: string;
    value: string;
    onChange: (v: string) => void;
    type?: string;
    icon?: ReactNode;
    autoFocus?: boolean;
}) => (
    <div>
        <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="relative">
            {icon && (
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted/50 pointer-events-none">
                    {icon}
                </div>
            )}
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                autoFocus={autoFocus}
                className={`w-full bg-white border-2 border-border-light/60 rounded-2xl px-5 py-3.5 text-base text-heading placeholder:text-muted/40 outline-none focus:border-accent transition-colors duration-200 ${
                    icon ? "pl-12" : ""
                }`}
            />
        </div>
    </div>
);

const Textarea = ({
    label,
    required,
    placeholder,
    value,
    onChange,
    rows = 4,
}: {
    label: string;
    required?: boolean;
    placeholder?: string;
    value: string;
    onChange: (v: string) => void;
    rows?: number;
}) => (
    <div>
        <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={rows}
            className="w-full bg-white border-2 border-border-light/60 rounded-2xl px-5 py-3.5 text-base text-heading placeholder:text-muted/40 outline-none focus:border-accent transition-colors duration-200 resize-none"
        />
    </div>
);

const Select = ({
    label,
    value,
    onChange,
    options,
}: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    options: Array<{ value: string; label: string }>;
}) => (
    <div>
        <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
            {label}
        </label>
        <div className="relative">
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full bg-white border-2 border-border-light/60 rounded-2xl px-5 py-3.5 text-base text-heading placeholder:text-muted/40 outline-none focus:border-accent transition-colors duration-200 appearance-none cursor-pointer"
            >
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-muted/50 pointer-events-none">
                <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <polyline points="2,4 6,8 10,4" />
                </svg>
            </div>
        </div>
    </div>
);

// ─── Step Progress ───────────────────────────────────────────────────────────

const StepProgress = ({ current }: { current: number }) => (
    <div className="mb-10 w-full">
        <div className="grid grid-cols-3 gap-2">
            {STEPS.map((step, i) => {
                const done = i < current - 1;
                const active = i === current - 1;
                const Icon = step.icon;
                return (
                    <div
                        key={step.label}
                        className={`flex min-w-0 items-center justify-center gap-1.5 rounded-xl px-2 py-2 text-xs font-semibold transition-colors ${
                            done ? "bg-accent/10 text-accent"
                            : active ? "bg-dark text-white"
                            : "bg-button-secondary text-muted"
                        }`}
                    >
                        {done ?
                            <LucideCheck className="h-3.5 w-3.5 shrink-0" />
                        :   <Icon className="h-3.5 w-3.5 shrink-0" />}
                        <span className="hidden truncate sm:inline">
                            {step.label}
                        </span>
                    </div>
                );
            })}
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-border-light/50">
            <div
                className="h-full rounded-full bg-accent transition-all duration-300"
                style={{ width: `${(current / STEPS.length) * 100}%` }}
            />
        </div>
    </div>
);

// ─── Step 1: About You ───────────────────────────────────────────────────────

function StepOne({ form, set }: { form: FormData; set: SetField }) {
    return (
        <motion.div
            custom={0}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="space-y-5"
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Input
                    label="Full Name"
                    required
                    placeholder="Jane Smith"
                    value={form.fullName}
                    onChange={(v) => set("fullName", v)}
                    icon={<LucideUser className="w-4 h-4" />}
                    autoFocus
                />
                <Input
                    label="Company Name"
                    placeholder="Acme Health Co."
                    value={form.companyName}
                    onChange={(v) => set("companyName", v)}
                    icon={<LucideBuilding2 className="w-4 h-4" />}
                />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Input
                    label="Email"
                    required
                    type="email"
                    placeholder="jane@example.com"
                    value={form.email}
                    onChange={(v) => set("email", v)}
                    icon={<LucideMail className="w-4 h-4" />}
                />
                <Input
                    label="Phone"
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={form.phone}
                    onChange={(v) => set("phone", v)}
                    icon={<LucidePhone className="w-4 h-4" />}
                />
            </div>
        </motion.div>
    );
}

// ─── Step 2: Your Reach ──────────────────────────────────────────────────────

function StepTwo({ form, set }: { form: FormData; set: SetField }) {
    return (
        <motion.div
            custom={0}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="space-y-5"
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Input
                    label="Website URL"
                    type="url"
                    placeholder="https://yourwebsite.com"
                    value={form.websiteUrl}
                    onChange={(v) => set("websiteUrl", v)}
                    icon={<LucideLink2 className="w-4 h-4" />}
                />
                <Select
                    label="Estimated Monthly Referral Reach"
                    value={form.monthlyReach}
                    onChange={(v) => set("monthlyReach", v)}
                    options={REACH_OPTIONS}
                />
            </div>
            <Textarea
                label="Social Media Links"
                placeholder="Instagram: @handle, Twitter: @handle, etc."
                value={form.socialLinks}
                onChange={(v) => set("socialLinks", v)}
                rows={3}
            />
            <Textarea
                label="How do you plan to promote TMAG?"
                required
                placeholder="Describe your approach — blog posts, newsletters, social content, speaking events, etc."
                value={form.promotionPlan}
                onChange={(v) => set("promotionPlan", v)}
                rows={4}
            />
        </motion.div>
    );
}

// ─── Step 3: Review & Agree ──────────────────────────────────────────────────

function StepThree({ form, set }: { form: FormData; set: SetField }) {
    const rows: Array<{ label: string; value: string; icon?: ReactNode }> = [
        {
            label: "Full Name",
            value: form.fullName,
            icon: <LucideUser className="w-3.5 h-3.5" />,
        },
        {
            label: "Company",
            value: form.companyName || "—",
            icon: <LucideBuilding2 className="w-3.5 h-3.5" />,
        },
        {
            label: "Email",
            value: form.email,
            icon: <LucideMail className="w-3.5 h-3.5" />,
        },
        {
            label: "Phone",
            value: form.phone || "—",
            icon: <LucidePhone className="w-3.5 h-3.5" />,
        },
        {
            label: "Website",
            value: form.websiteUrl || "—",
            icon: <LucideLink2 className="w-3.5 h-3.5" />,
        },
        {
            label: "Social Links",
            value: form.socialLinks || "—",
            icon: <LucideMessageSquare className="w-3.5 h-3.5" />,
        },
        {
            label: "Monthly Reach",
            value: form.monthlyReach ? REACH_LABELS[form.monthlyReach] : "—",
            icon: <LucideBarChart3 className="w-3.5 h-3.5" />,
        },
    ];

    return (
        <motion.div
            custom={0}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="space-y-6"
        >
            {/* Summary card */}
            <div className="bg-background-secondary border border-border-light/60 rounded-2xl p-5 divide-y divide-border-light/60">
                {rows.map(({ label, value, icon }) => (
                    <div
                        key={label}
                        className="flex items-start gap-3 py-3 first:pt-0 last:pb-0"
                    >
                        <div className="w-7 h-7 rounded-lg bg-accent/10 text-accent flex items-center justify-center shrink-0 mt-0.5">
                            {icon}
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs font-semibold text-muted uppercase tracking-wider">
                                {label}
                            </p>
                            <p className="text-sm text-heading font-medium mt-0.5 truncate">
                                {value}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Promotion plan excerpt */}
            {form.promotionPlan && (
                <div className="bg-background-secondary border border-border-light/60 rounded-2xl p-5">
                    <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                        Promotion Plan
                    </p>
                    <p className="text-sm text-heading leading-relaxed whitespace-pre-wrap line-clamp-4">
                        {form.promotionPlan}
                    </p>
                </div>
            )}

            {/* Terms checkbox */}
            <label className="flex items-start gap-3 cursor-pointer group rounded-2xl border border-border-light/60 bg-background-primary p-4 transition-colors duration-200 hover:border-accent/30">
                <div className="relative mt-0.5 shrink-0">
                    <input
                        type="checkbox"
                        className="sr-only"
                        checked={form.agreedToTerms}
                        onChange={(e) => set("agreedToTerms", e.target.checked)}
                    />
                    <div
                        className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all duration-200 ${
                            form.agreedToTerms ?
                                "bg-accent border-accent scale-105"
                            :   "bg-white border-border-light group-hover:border-muted/50"
                        }`}
                    >
                        {form.agreedToTerms && (
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{
                                    type: "spring",
                                    stiffness: 400,
                                    damping: 25,
                                }}
                            >
                                <LucideCheck className="w-3 h-3 text-white" />
                            </motion.div>
                        )}
                    </div>
                </div>
                <span className="text-sm text-muted leading-relaxed">
                    I agree to the{" "}
                    <a
                        href="https://tmag.health/affiliate-terms"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent font-medium underline underline-offset-2 hover:opacity-80 transition-opacity"
                    >
                        TMAG Affiliate Terms &amp; Conditions
                    </a>
                </span>
            </label>
        </motion.div>
    );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

const ApplyAsAffiliate = () => {
    const [step, setStep] = useState(1);
    const [direction, setDirection] = useState(1);
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

    const step1Valid =
        form.fullName.trim().length > 0 && form.email.trim().length > 0;
    const step2Valid = form.promotionPlan.trim().length > 0;

    const goTo = (next: number) => {
        setDirection(next > step ? 1 : -1);
        setStep(next);
    };

    const handleSubmit = async () => {
        if (!form.agreedToTerms) return;
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
                    className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-16"
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
                    <div className="p-8 md:p-10 rounded-3xl border border-border-light/50 bg-white ">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 rounded-2xl bg-accent/10 flex items-center justify-center text-accent">
                                <LucideHandshake className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-xl font-serif text-heading">
                                    {submitted ?
                                        "Application Submitted"
                                    :   "Apply to Become an Affiliate"}
                                </h2>
                                <p className="text-xs text-muted mt-0.5">
                                    {submitted ?
                                        "We'll be in touch soon"
                                    :   "Complete the form below to get started"
                                    }
                                </p>
                            </div>
                        </div>

                        {submitted ?
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="py-10 flex flex-col items-center text-center gap-5"
                            >
                                <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center">
                                    <LucideCheckCircle2 className="w-8 h-8 text-accent" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-heading">
                                        Application submitted!
                                    </h3>
                                    <p className="text-sm text-muted mt-1.5 max-w-sm">
                                        Thanks for your interest in partnering
                                        with TMAG. We'll review your application
                                        and reach out within 2–3 business days.
                                    </p>
                                </div>
                            </motion.div>
                        :   <>
                                {/* Step indicator */}
                                <StepProgress current={step} />

                                {/* Error banner */}
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="mb-6 px-5 py-4 rounded-2xl bg-red-50 border border-red-200 text-sm text-red-700"
                                    >
                                        {error}
                                    </motion.div>
                                )}

                                {/* Step content with animated transitions */}
                                <AnimatePresence mode="wait" custom={direction}>
                                    {step === 1 && (
                                        <motion.div
                                            key="step1"
                                            custom={direction}
                                            variants={stepVariants}
                                            initial="enter"
                                            animate="center"
                                            exit="exit"
                                        >
                                            <motion.h3
                                                custom={0}
                                                variants={fadeUp}
                                                initial="hidden"
                                                animate="visible"
                                                className="text-2xl font-serif text-heading mb-1 leading-tight"
                                            >
                                                About You
                                            </motion.h3>
                                            <motion.p
                                                custom={1}
                                                variants={fadeUp}
                                                initial="hidden"
                                                animate="visible"
                                                className="text-sm text-body mb-6"
                                            >
                                                Tell us a bit about yourself.
                                            </motion.p>
                                            <StepOne form={form} set={set} />
                                        </motion.div>
                                    )}
                                    {step === 2 && (
                                        <motion.div
                                            key="step2"
                                            custom={direction}
                                            variants={stepVariants}
                                            initial="enter"
                                            animate="center"
                                            exit="exit"
                                        >
                                            <motion.h3
                                                custom={0}
                                                variants={fadeUp}
                                                initial="hidden"
                                                animate="visible"
                                                className="text-2xl font-serif text-heading mb-1 leading-tight"
                                            >
                                                Your Reach
                                            </motion.h3>
                                            <motion.p
                                                custom={1}
                                                variants={fadeUp}
                                                initial="hidden"
                                                animate="visible"
                                                className="text-sm text-body mb-6"
                                            >
                                                Help us understand your audience
                                                and how you'd promote TMAG.
                                            </motion.p>
                                            <StepTwo form={form} set={set} />
                                        </motion.div>
                                    )}
                                    {step === 3 && (
                                        <motion.div
                                            key="step3"
                                            custom={direction}
                                            variants={stepVariants}
                                            initial="enter"
                                            animate="center"
                                            exit="exit"
                                        >
                                            <motion.h3
                                                custom={0}
                                                variants={fadeUp}
                                                initial="hidden"
                                                animate="visible"
                                                className="text-2xl font-serif text-heading mb-1 leading-tight"
                                            >
                                                Review &amp; Agree
                                            </motion.h3>
                                            <motion.p
                                                custom={1}
                                                variants={fadeUp}
                                                initial="hidden"
                                                animate="visible"
                                                className="text-sm text-body mb-6"
                                            >
                                                Double-check your info before
                                                submitting.
                                            </motion.p>
                                            <StepThree form={form} set={set} />
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Navigation */}
                                <div className="mt-8 flex items-center justify-between gap-3">
                                    {step > 1 ?
                                        <button
                                            onClick={() => goTo(step - 1)}
                                            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-button-secondary text-muted text-sm font-medium hover:text-heading transition-colors duration-150"
                                        >
                                            <LucideArrowLeft className="w-4 h-4" />
                                            Back
                                        </button>
                                    :   <div />}

                                    {step < 3 ?
                                        <button
                                            onClick={() => goTo(step + 1)}
                                            disabled={
                                                (step === 1 && !step1Valid) ||
                                                (step === 2 && !step2Valid)
                                            }
                                            className="flex-1 max-w-50 py-3.5 rounded-2xl bg-dark text-background-primary font-semibold text-sm cursor-pointer hover:bg-darkest disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
                                        >
                                            Continue
                                            <LucideArrowRight className="w-4 h-4" />
                                        </button>
                                    :   <button
                                            onClick={handleSubmit}
                                            disabled={loading}
                                            className={`flex-1 max-w-55 py-3.5 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200 ${
                                                form.agreedToTerms ?
                                                    "bg-accent text-white hover:opacity-90 cursor-pointer"
                                                :   "bg-button-secondary text-muted cursor-not-allowed"
                                            }`}
                                        >
                                            {loading ?
                                                <>
                                                    <svg
                                                        className="animate-spin"
                                                        width="16"
                                                        height="16"
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
                                            :   <>
                                                    Submit Application
                                                    <LucideArrowRight className="w-4 h-4" />
                                                </>
                                            }
                                        </button>
                                    }
                                </div>
                            </>
                        }
                    </div>
                </motion.div>
            </section>
        </main>
    );
};

export default ApplyAsAffiliate;
