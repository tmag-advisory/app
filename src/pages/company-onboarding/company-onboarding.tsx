import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "react-router-dom";
import {
    LucideCheck,
    LucideArrowRight,
    LucideArrowLeft,
    LucideBuilding2,
    LucideCreditCard,
    LucideLoader2,
    LucidePlus,
    LucideX,
    LucideUsers,
} from "lucide-react";
import Button from "../../components/ui/Button";
import AnimateIn from "../../components/animations/AnimateIn";
import { useCreditPlans, useSubmitCompanyOnboarding, useInitiateOnboardingPayment } from "../../api/hooks";
import type { TeamMember, CompanyOnboardingResponse } from "../../api/types";
import { useCurrencyStore } from "../../stores/currencyStore";
import { featuresByServiceLevel, signupRanges, type SignupRange } from "../../constants/companyPlans";
import toast, { Toaster } from "react-hot-toast";
import Navbar from "../../components/sections/Navbar";

const steps = [
    { id: 1, title: "Plan & Needs", icon: <LucideBuilding2 className="w-4 h-4" /> },
    { id: 2, title: "Team Setup", icon: <LucideUsers className="w-4 h-4" /> },
    { id: 3, title: "Review & Submit", icon: <LucideCheck className="w-4 h-4" /> },
    { id: 4, title: "Payment", icon: <LucideCreditCard className="w-4 h-4" /> },
];

const industries = [
    "Technology",
    "Finance & Banking",
    "Healthcare",
    "Oil & Gas",
    "Manufacturing",
    "Consulting",
    "Education",
    "Government",
    "Logistics & Transportation",
    "Other",
];

function getRangeFromPlanCode(code: string): SignupRange {
    if (code.includes("GOLD") || code.includes("ELITE")) return "100-500";
    if (code.includes("PLATINUM") || code.includes("SIGNATURE")) return ">500";
    return "0-100";
}

const CompanyOnboarding = () => {
    const [searchParams] = useSearchParams();
    const planFromUrl = searchParams.get("plan") ?? "";

    const [currentStep, setCurrentStep] = useState(1);
    const [direction, setDirection] = useState(1);
    const [submitting, setSubmitting] = useState(false);
    const [onboardingResult, setOnboardingResult] = useState<CompanyOnboardingResponse | null>(null);

    // Step 1 state
    const [selectedPlan, setSelectedPlan] = useState<string>(planFromUrl);
    const [selectedRange, setSelectedRange] = useState<SignupRange>(() =>
        planFromUrl ? getRangeFromPlanCode(planFromUrl) : "0-100"
    );
    const [creditCount, setCreditCount] = useState<string>("10");
    const [sampleRequest, setSampleRequest] = useState("");
    const [billingCurrency, setBillingCurrency] = useState("USD");

    // Step 2 state
    const [companyName, setCompanyName] = useState("");
    const [industry, setIndustry] = useState("");
    const [contactEmail, setContactEmail] = useState("");
    const [contactPhone, setContactPhone] = useState("");
    const [website, setWebsite] = useState("");
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
        { name: "", email: "", role: "admin" },
    ]);

    const { data: plans, isLoading: plansLoading } = useCreditPlans();
    const submitOnboarding = useSubmitCompanyOnboarding();
    const initiatePayment = useInitiateOnboardingPayment();
    const { selectedCurrency } = useCurrencyStore();

    useEffect(() => {
        setBillingCurrency(selectedCurrency || "USD");
    }, [selectedCurrency]);

    const enterprisePlans = useMemo(
        () => plans?.filter((p) => p.isCompanyPlan) ?? [],
        [plans]
    );

    const rangeEnterprisePlans = useMemo(
        () =>
            enterprisePlans
                .filter((p) => p.signupRangeLabel === selectedRange)
                .sort((a, b) => a.basePriceUsd - b.basePriceUsd),
        [enterprisePlans, selectedRange]
    );

    const getCurrencySymbol = () => {
        switch (billingCurrency.toUpperCase()) {
            case "NGN": return "₦";
            case "EUR": return "€";
            case "GBP": return "£";
            default: return "$";
        }
    };

    const getSelectedPlanData = () => plans?.find((p) => p.code === selectedPlan) ?? null;
    const numericCreditCount = creditCount === "" ? 0 : Number(creditCount);

    const getEstimatedTotal = () => {
        const plan = getSelectedPlanData();
        if (!plan || plan.basePriceUsd === 0) return null;
        if (billingCurrency === "NGN") return (plan.basePriceNgn ?? 0) * numericCreditCount;
        return plan.basePriceUsd * numericCreditCount;
    };

    const formatTotal = (total: number | null) => {
        if (total === null) return "Free";
        if (billingCurrency === "NGN") return `₦${total.toLocaleString()} NGN`;
        return `$${total.toLocaleString()} USD`;
    };

    const formatPricePerCredit = (plan: ReturnType<typeof getSelectedPlanData>) => {
        if (!plan) return "";
        if (plan.basePriceUsd === 0) return "Free tier";
        if (billingCurrency === "NGN")
            return `₦${(plan.basePriceNgn ?? 0).toLocaleString()} NGN/credit × ${numericCreditCount} credits`;
        return `$${plan.basePriceUsd} USD/credit × ${numericCreditCount} credits`;
    };

    const addTeamMember = () => {
        setTeamMembers([...teamMembers, { name: "", email: "", role: "hr" }]);
    };

    const removeTeamMember = (index: number) => {
        if (teamMembers.length > 1) {
            setTeamMembers(teamMembers.filter((_, i) => i !== index));
        }
    };

    const updateTeamMember = (index: number, field: keyof TeamMember, value: string) => {
        const updated = [...teamMembers];
        updated[index] = { ...updated[index], [field]: value };
        setTeamMembers(updated);
    };

    const selectedPlanData = getSelectedPlanData();
    const canProceedStep1 =
        selectedPlan &&
        sampleRequest.trim().length > 0 &&
        (selectedPlanData?.basePriceUsd === 0 || numericCreditCount > 0);
    const canProceedStep2 =
        companyName.trim() &&
        contactEmail.trim() &&
        teamMembers.every((m) => m.name.trim() && m.email.trim());

    const goToStep = (step: number) => {
        setDirection(step > currentStep ? 1 : -1);
        setCurrentStep(step);
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            const result = await submitOnboarding.mutateAsync({
                companyName,
                industry,
                contactEmail,
                contactPhone,
                website,
                billingCurrency,
                selectedPlanCode: selectedPlan,
                creditCount: numericCreditCount,
                sampleRequest,
                teamMembers,
            });
            setOnboardingResult(result);
            goToStep(4);
        } catch (err) {
            console.error("Submit failed:", err);
            alert("Failed to submit. Please check your inputs and try again.");
        } finally {
            setSubmitting(false);
        }
    };

    const handlePay = async () => {
        if (!onboardingResult) return;
        try {
            const payment = await initiatePayment.mutateAsync(onboardingResult.id);
            window.location.href = payment.paymentLink;
        } catch (err) {
            console.error("Payment initiation failed:", err);
            alert("Failed to initiate payment. Please try again.");
        }
    };

    const slideVariants = {
        enter: (dir: number) => ({ x: dir > 0 ? 200 : -200, opacity: 0 }),
        center: { x: 0, opacity: 1 },
        exit: (dir: number) => ({ x: dir > 0 ? -200 : 200, opacity: 0 }),
    };

    return (
        <main className="min-h-screen bg-background-primary">
            <Navbar />
            <Toaster position="top-right" containerStyle={{ fontSize: "14px" }} />
            <AnimateIn as="section" className="flex flex-col items-center text-center pt-16 pb-8 px-6">
                <span className="inline-block text-sm text-muted bg-button-secondary font-semibold rounded-xl px-4 py-1.5 mb-6">
                    Company Onboarding
                </span>
                <h1 className="text-4xl md:text-5xl lg:text-6xl leading-[0.9] text-heading font-serif max-w-3xl">
                    Get your team <span className="italic">protected.</span>
                </h1>
                <p className="text-sm text-body mt-4 max-w-lg leading-relaxed">
                    Choose a plan, set up your team, and start generating travel health plans in minutes.
                </p>
            </AnimateIn>

            {/* Step indicator */}
            <div className="px-8 max-w-3xl mx-auto mb-10">
                <div className="flex items-center justify-between">
                    {steps.map((step, i) => (
                        <div key={step.id} className="flex items-center">
                            <button
                                onClick={() => { if (step.id < currentStep) goToStep(step.id); }}
                                disabled={step.id > currentStep}
                                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${step.id === currentStep
                                        ? "bg-dark text-white"
                                        : step.id < currentStep
                                            ? "bg-accent/10 text-accent cursor-pointer hover:bg-accent/20"
                                            : "bg-button-secondary text-muted cursor-not-allowed"
                                    }`}
                            >
                                {step.id < currentStep ? <LucideCheck className="w-3.5 h-3.5" /> : step.icon}
                                <span className="hidden sm:inline">{step.title}</span>
                            </button>
                            {i < steps.length - 1 && (
                                <div className={`w-8 sm:w-16 h-0.5 mx-1 ${step.id < currentStep ? "bg-accent" : "bg-border-light/50"}`} />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Step content */}
            <div className="px-8 max-w-4xl mx-auto pb-20">
                <AnimatePresence mode="wait" custom={direction}>
                    <motion.div
                        key={currentStep}
                        custom={direction}
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                        {/* Step 1: Plan Selection */}
                        {currentStep === 1 && (
                            <div className="space-y-8">
                                <div>
                                    <h2 className="text-2xl font-serif text-heading mb-2">Select your plan</h2>
                                    <p className="text-sm text-body">Choose the plan that best fits your team size and reporting needs.</p>
                                </div>

                                {plansLoading ? (
                                    <div className="flex justify-center py-12">
                                        <LucideLoader2 className="w-8 h-8 animate-spin text-muted" />
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {/* Signup-range selector */}
                                        <div>
                                            <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">
                                                How many employees will sign up?
                                            </p>
                                            <div className="inline-flex items-center bg-button-secondary rounded-2xl p-1 gap-1">
                                                {signupRanges.map((r) => (
                                                    <button
                                                        key={r.value}
                                                        onClick={() => {
                                                            setSelectedRange(r.value);
                                                            setSelectedPlan("");
                                                        }}
                                                        className={`px-5 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${selectedRange === r.value
                                                                ? "bg-white shadow-sm text-heading"
                                                                : "text-muted hover:text-heading"
                                                            }`}
                                                    >
                                                        {r.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Enterprise plan cards for the selected range */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            {rangeEnterprisePlans.map((plan) => {
                                                const isPremium = plan.serviceLevel === "PREMIUM";
                                                const isSelected = selectedPlan === plan.code;
                                                const features = featuresByServiceLevel[plan.serviceLevel ?? "STANDARD"];
                                                const displayPrice =
                                                    billingCurrency === "NGN"
                                                        ? `₦${(plan.basePriceNgn ?? 0).toLocaleString()}`
                                                        : `$${plan.basePriceUsd}`;

                                                return (
                                                    <button
                                                        key={plan.code}
                                                        onClick={() => setSelectedPlan(plan.code)}
                                                        className={`text-left rounded-2xl p-6 border-2 transition-all ${isSelected
                                                                ? isPremium
                                                                    ? "border-amber-400 bg-amber-50"
                                                                    : "border-accent bg-accent/5"
                                                                : isPremium
                                                                    ? "border-amber-200/60 bg-background-primary hover:border-amber-300"
                                                                    : "border-border-light/50 bg-background-primary hover:border-border-light"
                                                            }`}
                                                    >
                                                        <div className="flex items-start justify-between mb-1">
                                                            <h3 className={`text-lg font-serif ${isPremium ? "text-amber-700" : "text-heading"}`}>
                                                                {plan.displayName}
                                                            </h3>
                                                            {isSelected && (
                                                                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ml-2 ${isPremium ? "bg-amber-500" : "bg-accent"}`}>
                                                                    <LucideCheck className="w-3.5 h-3.5 text-white" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <p className={`text-xs font-medium uppercase tracking-wide mb-3 ${isPremium ? "text-amber-500" : "text-muted"}`}>
                                                            {isPremium ? "Premium service" : "Standard service"}
                                                        </p>
                                                        <p className={`text-2xl font-serif mb-0.5 ${isPremium ? "text-amber-700" : "text-heading"}`}>
                                                            {displayPrice}
                                                        </p>
                                                        <p className="text-xs text-muted mb-4">per credit</p>
                                                        <ul className="space-y-2 mb-4">
                                                            {features.map((f) => (
                                                                <li key={f} className="flex items-start gap-2 text-xs text-body">
                                                                    <LucideCheck className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${isPremium ? "text-amber-500" : "text-accent"}`} />
                                                                    {f}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Credit count input */}
                                {selectedPlan && (() => {
                                    const plan = getSelectedPlanData();
                                    return plan && plan.basePriceUsd > 0 ? (
                                        <div>
                                            <label className="block text-sm font-semibold text-heading mb-2">
                                                How many credits to purchase upfront?
                                            </label>
                                            <p className="text-xs text-muted mb-3">
                                                Each credit generates one travel health plan for one employee trip.
                                            </p>
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="number"
                                                    min={1}
                                                    max={10000}
                                                    value={creditCount}
                                                    onChange={(e) => {
                                                        const rawValue = e.target.value;
                                                        if (rawValue === "") { setCreditCount(""); return; }
                                                        const value = Number(rawValue);
                                                        if (!Number.isFinite(value) || value < 0) return;
                                                        if (value > 10000) {
                                                            toast.error("Maximum credit count is 10,000");
                                                            setCreditCount("10000");
                                                            return;
                                                        }
                                                        setCreditCount(rawValue);
                                                    }}
                                                    onBlur={() => {
                                                        if (creditCount === "" || Number(creditCount) < 1) setCreditCount("1");
                                                    }}
                                                    className="w-32 bg-background-primary border border-heading/50 rounded-xl px-4 py-3 text-sm text-heading outline-none focus:border-accent transition-colors"
                                                />
                                                <span className="text-sm text-muted">credits</span>
                                                <span className="text-sm font-semibold text-heading ml-auto">
                                                    {getCurrencySymbol()}{(getEstimatedTotal() ?? 0).toLocaleString()} {billingCurrency} estimated
                                                </span>
                                            </div>
                                        </div>
                                    ) : null;
                                })()}

                                <div>
                                    <label className="block text-sm font-semibold text-heading mb-2">
                                        Describe your typical travel health needs
                                    </label>
                                    <textarea
                                        value={sampleRequest}
                                        onChange={(e) => setSampleRequest(e.target.value)}
                                        placeholder="E.g., We send 50+ employees to Southeast Asia and Africa quarterly. We need vaccination plans, medication guidance, and emergency contact info for each destination..."
                                        rows={4}
                                        className="w-full bg-background-primary border border-heading/50 rounded-xl px-4 py-3 text-sm text-heading placeholder:text-muted outline-none focus:border-accent transition-colors resize-none"
                                    />
                                </div>

                                <div className="flex justify-end">
                                    <Button
                                        variant="primary"
                                        onClick={() => goToStep(2)}
                                        disabled={!canProceedStep1}
                                        icon={<LucideArrowRight />}
                                    >
                                        Continue
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Company Info & Team Setup */}
                        {currentStep === 2 && (
                            <div className="space-y-8">
                                <div>
                                    <h2 className="text-2xl font-serif text-heading mb-2">Company & team details</h2>
                                    <p className="text-sm text-body">Tell us about your company and who should have access.</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-heading mb-1.5">Company name *</label>
                                        <input
                                            type="text"
                                            value={companyName}
                                            onChange={(e) => setCompanyName(e.target.value)}
                                            placeholder="Acme Corp"
                                            className="w-full bg-background-primary border border-border-light/50 rounded-xl px-4 py-3 text-sm text-heading placeholder:text-muted outline-none focus:border-accent transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-heading mb-1.5">Industry</label>
                                        <select
                                            value={industry}
                                            onChange={(e) => setIndustry(e.target.value)}
                                            className="w-full bg-background-primary border border-border-light/50 rounded-xl px-4 py-3 text-sm text-heading outline-none focus:border-accent transition-colors cursor-pointer"
                                        >
                                            <option value="">Select industry</option>
                                            {industries.map((ind) => (
                                                <option key={ind} value={ind}>{ind}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-heading mb-1.5">Contact email *</label>
                                        <input
                                            type="email"
                                            value={contactEmail}
                                            onChange={(e) => setContactEmail(e.target.value)}
                                            placeholder="hr@acmecorp.com"
                                            className="w-full bg-background-primary border border-border-light/50 rounded-xl px-4 py-3 text-sm text-heading placeholder:text-muted outline-none focus:border-accent transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-heading mb-1.5">Contact phone</label>
                                        <input
                                            type="tel"
                                            value={contactPhone}
                                            onChange={(e) => setContactPhone(e.target.value)}
                                            placeholder="+1 555 000 0000"
                                            className="w-full bg-background-primary border border-border-light/50 rounded-xl px-4 py-3 text-sm text-heading placeholder:text-muted outline-none focus:border-accent transition-colors"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-semibold text-heading mb-1.5">Website</label>
                                        <input
                                            type="url"
                                            value={website}
                                            onChange={(e) => setWebsite(e.target.value)}
                                            placeholder="https://acmecorp.com"
                                            className="w-full bg-background-primary border border-border-light/50 rounded-xl px-4 py-3 text-sm text-heading placeholder:text-muted outline-none focus:border-accent transition-colors"
                                        />
                                    </div>
                                </div>

                                {/* Team members */}
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <label className="text-sm font-semibold text-heading">Team members *</label>
                                        <button
                                            onClick={addTeamMember}
                                            className="flex items-center gap-1 text-xs font-semibold text-accent hover:text-accent/80 transition-colors"
                                        >
                                            <LucidePlus className="w-3.5 h-3.5" />
                                            Add another
                                        </button>
                                    </div>
                                    <div className="space-y-3">
                                        {teamMembers.map((member, index) => (
                                            <div key={index} className="flex gap-3 items-start">
                                                <input
                                                    type="text"
                                                    value={member.name}
                                                    onChange={(e) => updateTeamMember(index, "name", e.target.value)}
                                                    placeholder="Full name"
                                                    className="flex-1 bg-background-primary border border-border-light/50 rounded-xl px-4 py-3 text-sm text-heading placeholder:text-muted outline-none focus:border-accent transition-colors"
                                                />
                                                <input
                                                    type="email"
                                                    value={member.email}
                                                    onChange={(e) => updateTeamMember(index, "email", e.target.value)}
                                                    placeholder="Email address"
                                                    className="flex-1 bg-background-primary border border-border-light/50 rounded-xl px-4 py-3 text-sm text-heading placeholder:text-muted outline-none focus:border-accent transition-colors"
                                                />
                                                <select
                                                    value={member.role}
                                                    onChange={(e) => updateTeamMember(index, "role", e.target.value)}
                                                    className="w-28 bg-background-primary border border-border-light/50 rounded-xl px-3 py-3 text-sm text-heading outline-none focus:border-accent transition-colors cursor-pointer"
                                                >
                                                    <option value="admin">Admin</option>
                                                    <option value="hr">HR</option>
                                                </select>
                                                {teamMembers.length > 1 && (
                                                    <button
                                                        onClick={() => removeTeamMember(index)}
                                                        className="p-3 rounded-xl text-muted hover:text-red-500 hover:bg-red-50 transition-colors"
                                                    >
                                                        <LucideX className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-xs text-muted mt-2">
                                        Admin users have full dashboard access. HR users can manage employees and travel plans.
                                    </p>
                                </div>

                                <div className="flex justify-between">
                                    <Button variant="secondary" onClick={() => goToStep(1)} icon={<LucideArrowLeft />}>
                                        Back
                                    </Button>
                                    <Button
                                        variant="primary"
                                        onClick={() => goToStep(3)}
                                        disabled={!canProceedStep2}
                                        icon={<LucideArrowRight />}
                                    >
                                        Review
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Review & Submit */}
                        {currentStep === 3 && (
                            <div className="space-y-8">
                                <div>
                                    <h2 className="text-2xl font-serif text-heading mb-2">Review your order</h2>
                                    <p className="text-sm text-body">Please verify all details before proceeding to payment.</p>
                                </div>

                                {/* Plan summary */}
                                <div className="bg-button-secondary rounded-2xl p-6">
                                    <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Selected Plan</h3>
                                    {(() => {
                                        const plan = getSelectedPlanData();
                                        if (!plan) return null;
                                        const total = getEstimatedTotal();
                                        return (
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <p className="text-lg font-serif text-heading">{plan.displayName}</p>
                                                    <p className="text-sm text-body">{formatPricePerCredit(plan)}</p>
                                                </div>
                                                <p className="text-2xl font-serif text-heading">{formatTotal(total)}</p>
                                            </div>
                                        );
                                    })()}
                                </div>

                                {/* Company info summary */}
                                <div className="bg-button-secondary rounded-2xl p-6">
                                    <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Company Information</h3>
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div>
                                            <p className="text-muted">Company</p>
                                            <p className="text-heading font-medium">{companyName}</p>
                                        </div>
                                        {industry && (
                                            <div>
                                                <p className="text-muted">Industry</p>
                                                <p className="text-heading font-medium">{industry}</p>
                                            </div>
                                        )}
                                        <div>
                                            <p className="text-muted">Contact Email</p>
                                            <p className="text-heading font-medium">{contactEmail}</p>
                                        </div>
                                        {contactPhone && (
                                            <div>
                                                <p className="text-muted">Phone</p>
                                                <p className="text-heading font-medium">{contactPhone}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Sample request */}
                                <div className="bg-button-secondary rounded-2xl p-6">
                                    <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Sample Request</h3>
                                    <p className="text-sm text-body leading-relaxed">{sampleRequest}</p>
                                </div>

                                {/* Team members summary */}
                                <div className="bg-button-secondary rounded-2xl p-6">
                                    <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">
                                        Team Members ({teamMembers.length})
                                    </h3>
                                    <div className="space-y-2">
                                        {teamMembers.map((member, i) => (
                                            <div key={i} className="flex items-center justify-between text-sm">
                                                <div>
                                                    <span className="text-heading font-medium">{member.name}</span>
                                                    <span className="text-muted ml-2">({member.email})</span>
                                                </div>
                                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${member.role === "admin" ? "bg-accent/10 text-accent" : "bg-blue-50 text-blue-600"
                                                    }`}>
                                                    {member.role === "admin" ? "Admin" : "HR"}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex justify-between">
                                    <Button variant="secondary" onClick={() => goToStep(2)} icon={<LucideArrowLeft />}>
                                        Back
                                    </Button>
                                    <Button variant="primary" onClick={handleSubmit} disabled={submitting}>
                                        {submitting ? (
                                            <span className="flex items-center gap-2">
                                                <LucideLoader2 className="w-4 h-4 animate-spin" />
                                                Submitting...
                                            </span>
                                        ) : (
                                            "Submit & Proceed to Payment"
                                        )}
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Step 4: Payment */}
                        {currentStep === 4 && (
                            <div className="space-y-8 max-w-lg mx-auto text-center">
                                {onboardingResult ? (
                                    <>
                                        <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto">
                                            <LucideCreditCard className="w-8 h-8 text-accent" />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-serif text-heading mb-2">Complete your payment</h2>
                                            <p className="text-sm text-body">
                                                Your registration for <strong>{onboardingResult.companyName}</strong> has been saved.
                                                Complete payment to submit it for approval.
                                            </p>
                                        </div>

                                        <div className="bg-button-secondary rounded-2xl p-6 text-left">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm text-muted">Plan</span>
                                                <span className="text-sm font-semibold text-heading">
                                                    {selectedPlanData?.displayName ?? onboardingResult.selectedPlanCode}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-muted">Credits</span>
                                                <span className="text-sm font-semibold text-heading">
                                                    {onboardingResult.creditCount ?? numericCreditCount}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between mt-2">
                                                <span className="text-sm text-muted">Amount</span>
                                                <span className="text-lg font-serif text-heading">
                                                    {(() => {
                                                        const estimated = getEstimatedTotal();
                                                        if (estimated !== null && estimated > 0) return formatTotal(estimated);
                                                        if (onboardingResult.paymentAmount != null && onboardingResult.paymentAmount > 0)
                                                            return `${getCurrencySymbol()}${onboardingResult.paymentAmount.toLocaleString()}`;
                                                        return "Free";
                                                    })()}
                                                </span>
                                            </div>
                                        </div>

                                        <Button
                                            variant="primary"
                                            onClick={handlePay}
                                            disabled={initiatePayment.isPending}
                                            className="w-full"
                                        >
                                            {initiatePayment.isPending ? (
                                                <span className="flex items-center gap-2">
                                                    <LucideLoader2 className="w-4 h-4 animate-spin" />
                                                    Processing...
                                                </span>
                                            ) : (
                                                "Pay Now"
                                            )}
                                        </Button>

                                        <p className="text-xs text-muted">
                                            You will be redirected to our secure payment partner (Flutterwave) to complete the
                                            transaction. After payment, your registration will be reviewed by our team.
                                        </p>
                                    </>
                                ) : (
                                    <div className="py-12">
                                        <LucideLoader2 className="w-8 h-8 animate-spin text-muted mx-auto mb-4" />
                                        <p className="text-sm text-muted">Loading...</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </main>
    );
};

export default CompanyOnboarding;
