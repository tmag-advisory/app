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
    LucideTag,
    LucidePhone,
    LucideUpload,
} from "lucide-react";
import Button from "../../components/ui/Button";
import AnimateIn from "../../components/animations/AnimateIn";
import { useCreditPlans, useSubmitCompanyOnboarding, useInitiateOnboardingPayment, useOnboardingPricingPreview } from "../../api/hooks";
import LaunchDiscountBanner from "../../components/sections/LaunchDiscountBanner";
import type { TeamMember, PlatformEmployee, CompanyOnboardingResponse, PublicPricingPreview } from "../../api/types";
import { useCurrencyStore } from "../../stores/currencyStore";
import {
    enterpriseTierColors,
    featuresByServiceLevel,
    signupRanges,
    type SignupRange,
} from "../../constants/companyPlans";
import toast, { Toaster } from "react-hot-toast";
import Navbar from "../../components/sections/Navbar";
import { getAffiliateReferralCode, getStoredAffiliateDiscountRate, refreshAffiliateDiscount } from "../../lib/affiliateTracking";

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

const teamMembersCsvSample = "firstName,lastName,email\nJane,Doe,jane@example.com\nJohn,Smith,john@example.com\n";

const parseTeamMembersCsv = (csv: string): TeamMember[] => {
    const rows = csv
        .split(/\r?\n/)
        .map((row) => row.trim())
        .filter(Boolean);

    if (rows.length === 0) return [];

    const headers = rows[0].toLowerCase().split(",").map((h) => h.trim());
    const hasHeader = headers.some((column) => ["firstname", "first_name", "name", "email"].includes(column));

    return rows.slice(hasHeader ? 1 : 0).map((row, index) => {
        const cols = row.split(",").map((value) => value.trim());
        let firstName = "";
        let lastName = "";
        let email = "";

        if (cols.length >= 3) {
            firstName = cols[0];
            lastName = cols[1];
            email = cols[2];
        } else {
            const [rawName = "", rawEmail = ""] = cols;
            const nameParts = rawName.split(/\s+/);
            firstName = nameParts[0] || "";
            lastName = nameParts.slice(1).join(" ") || "";
            email = rawEmail;
        }

        if (!firstName || !email) {
            throw new Error(`Row ${index + (hasHeader ? 2 : 1)} must include first name and email.`);
        }

        return {
            firstName,
            lastName,
            email,
            role: "admin" as const,
        };
    });
};

function getRangeFromPlanCode(code: string): SignupRange {
    if (code.includes("GOLD") || code.includes("ELITE")) return "100-500";
    if (code.includes("PLATINUM") || code.includes("SIGNATURE")) return ">500";
    return "0-100";
}

const fieldClassName =
    "w-full rounded-xl border border-slate-300 bg-white/50 px-4 py-3 text-sm text-slate-950 placeholder:text-slate-400 outline-none transition-colors focus:ring-4 focus:ring-accent/15";
const selectClassName = `${fieldClassName} cursor-pointer`;
const compactFieldClassName =
    "rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 placeholder:text-slate-400 outline-none transition-colors focus:border-accent focus:ring-4 focus:ring-accent/15";
const panelClassName = "rounded-2xl border border-slate-200 bg-white p-6";
const actionButtonClassName =
    "inline-flex items-center gap-2 rounded-xl border border-accent bg-accent px-3.5 py-2 text-xs font-bold text-white transition-colors hover:bg-accent/90";
const secondaryActionClassName =
    "inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-800 transition-colors hover:border-accent hover:text-accent";

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
    const [affiliateDiscountRate, setAffiliateDiscountRate] = useState(getStoredAffiliateDiscountRate);

    // Step 2 state
    const [companyName, setCompanyName] = useState("");
    const [industry, setIndustry] = useState("");
    const [contactEmail, setContactEmail] = useState("");
    const [contactPhone, setContactPhone] = useState("");
    const [website, setWebsite] = useState("");
    const [teamMembersCsv, setTeamMembersCsv] = useState<File | null>(null);
    const [teamMembersCsvError, setTeamMembersCsvError] = useState("");
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
        { firstName: "", lastName: "", email: "", role: "admin" },
    ]);
    const [platformEmployees, setPlatformEmployees] = useState<PlatformEmployee[]>([
        { email: "", firstName: "", lastName: "" },
    ]);

    const { data: plans, isLoading: plansLoading } = useCreditPlans();
    const submitOnboarding = useSubmitCompanyOnboarding();
    const initiatePayment = useInitiateOnboardingPayment();
    const { selectedCurrency } = useCurrencyStore();

    const numericCreditCount = creditCount === "" ? 0 : Number(creditCount);
    const { data: pricingPreviews } = useOnboardingPricingPreview(numericCreditCount);

    useEffect(() => {
        setBillingCurrency(selectedCurrency || "USD");
    }, [selectedCurrency]);

    useEffect(() => {
        let cancelled = false;
        void refreshAffiliateDiscount()
            .then((discount) => {
                if (!cancelled && discount?.active) {
                    setAffiliateDiscountRate(Number(discount.discount_rate));
                }
            })
            .catch(() => undefined);
        return () => {
            cancelled = true;
        };
    }, []);

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

    const getVolumePricing = (): PublicPricingPreview | null => {
        if (!pricingPreviews || !selectedPlanData) return null;
        const serviceLevel = selectedPlanData.serviceLevel ?? "STANDARD";
        return pricingPreviews.find(
            (p) => p.serviceLevel === serviceLevel && p.currency === billingCurrency
        ) ?? null;
    };

    const getDiscountInfo = () => {
        const vp = getVolumePricing();
        if (!vp || vp.contactSales) return null;
        if (vp.appliedTier === "TIER_3") return { label: "20% volume discount", pct: 20 };
        if (vp.appliedTier === "TIER_2") return { label: "10% volume discount", pct: 10 };
        return null;
    };

    const getAffiliateDiscountInfo = () => {
        if (affiliateDiscountRate <= 0) return null;
        return { label: `${affiliateDiscountRate}% affiliate discount`, pct: affiliateDiscountRate };
    };

    const getEstimatedTotal = () => {
        const plan = getSelectedPlanData();
        if (!plan || plan.basePriceUsd === 0) return null;
        const volumePricing = getVolumePricing();
        let baseTotal: number;
        if (volumePricing) {
            baseTotal = volumePricing.totalAmount;
        } else {
            baseTotal = billingCurrency === "NGN" ? (plan.basePriceNgn ?? 0) * numericCreditCount : plan.basePriceUsd * numericCreditCount;
        }
        // Apply affiliate discount on top of volume pricing
        if (affiliateDiscountRate > 0) {
            return Math.round(baseTotal * (1 - affiliateDiscountRate / 100));
        }
        return baseTotal;
    };

    const formatTotal = (total: number | null) => {
        if (total === null) return "Free";
        if (billingCurrency === "NGN") return `₦${total.toLocaleString()} NGN`;
        return `$${total.toLocaleString()} USD`;
    };

    const formatPricePerCredit = (plan: ReturnType<typeof getSelectedPlanData>) => {
        if (!plan) return "";
        if (plan.basePriceUsd === 0) return "Free tier";
        const volumePricing = getVolumePricing();
        if (volumePricing) {
            const sym = billingCurrency === "NGN" ? "₦" : "$";
            const suffix = billingCurrency === "NGN" ? " NGN" : " USD";
            if (volumePricing.contactSales) return "Contact sales for pricing";
            return `${sym}${volumePricing.pricePerCredit.toLocaleString()}${suffix}/credit × ${numericCreditCount} credits`;
        }
        if (billingCurrency === "NGN")
            return `₦${(plan.basePriceNgn ?? 0).toLocaleString()} NGN/credit × ${numericCreditCount} credits`;
        return `$${plan.basePriceUsd} USD/credit × ${numericCreditCount} credits`;
    };

    const addTeamMember = () => {
        setTeamMembers([...teamMembers, { firstName: "", lastName: "", email: "", role: "admin" }]);
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

    const addPlatformEmployee = () => {
        setPlatformEmployees([...platformEmployees, { email: "", firstName: "", lastName: "" }]);
    };

    const removePlatformEmployee = (index: number) => {
        if (platformEmployees.length > 1) {
            setPlatformEmployees(platformEmployees.filter((_, i) => i !== index));
        }
    };

    const updatePlatformEmployee = (index: number, field: keyof PlatformEmployee, value: string) => {
        const updated = [...platformEmployees];
        updated[index] = { ...updated[index], [field]: value };
        setPlatformEmployees(updated);
    };

    const handleTeamMembersCsvUpload = async (file: File | null) => {
        setTeamMembersCsvError("");
        if (!file) return;

        if (!file.name.toLowerCase().endsWith(".csv")) {
            setTeamMembersCsv(null);
            setTeamMembersCsvError("Please upload a CSV file.");
            return;
        }

        try {
            const importedMembers = parseTeamMembersCsv(await file.text());
            if (importedMembers.length === 0) {
                setTeamMembersCsvError("The CSV did not include any employees.");
                return;
            }

            const imported: PlatformEmployee[] = importedMembers.map((m) => ({ email: m.email, firstName: m.firstName, lastName: m.lastName }));
            const hasOnlyEmptyStarter = platformEmployees.length === 1 && !platformEmployees[0].email.trim();
            setPlatformEmployees(hasOnlyEmptyStarter ? imported : [...platformEmployees, ...imported]);
            setTeamMembersCsv(file);
        } catch (err) {
            setTeamMembersCsv(null);
            setTeamMembersCsvError(err instanceof Error ? err.message : "Failed to read CSV file.");
        }
    };

    const selectedPlanData = getSelectedPlanData();
    const isContactSalesRequired = numericCreditCount >= 500 && !!selectedPlanData && selectedPlanData.basePriceUsd > 0;
    const canProceedStep1 =
        selectedPlan &&
        (selectedPlanData?.basePriceUsd === 0 || numericCreditCount > 0) &&
        !isContactSalesRequired;
    const canProceedStep2 =
        companyName.trim() &&
        contactEmail.trim() &&
        teamMembers.every((m) => m.firstName.trim() && m.email.trim());

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
                teamMembersCsv,
                platformEmployees: platformEmployees.filter((e) => e.email.trim()),
                affiliate_referral_code: affiliateDiscountRate > 0 ? getAffiliateReferralCode() : undefined,
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
            <Toaster
                position="top-right"
                containerStyle={{ fontSize: "14px" }}
            />
            <AnimateIn
                as="section"
                className="flex flex-col items-center text-center pt-16 pb-8 px-6"
            >
                <span className="inline-block text-xs text-accent bg-accent/20 font-semibold rounded-xl px-4 py-1.5 mb-6">
                    Company Onboarding
                </span>
                <h1 className="text-4xl md:text-5xl lg:text-6xl leading-[0.9] text-heading font-serif max-w-3xl">
                    Get your team <span className="italic">protected.</span>
                </h1>
                <p className="text-sm text-body mt-4 max-w-lg leading-relaxed">
                    Choose a plan, set up your team, and start generating travel
                    health plans in minutes.
                </p>
            </AnimateIn>

            {/* Step indicator */}
            <div className="px-8 max-w-3xl mx-auto mb-10">
                <div className="flex items-center justify-between">
                    {steps.map((step, i) => (
                        <div key={step.id} className="flex items-center">
                            <button
                                onClick={() => {
                                    if (step.id < currentStep)
                                        goToStep(step.id);
                                }}
                                disabled={step.id > currentStep}
                                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                                    step.id === currentStep ?
                                        "bg-dark text-white"
                                    : step.id < currentStep ?
                                        "bg-accent/10 text-accent cursor-pointer hover:bg-accent/20"
                                    :   "bg-button-secondary text-muted cursor-not-allowed"
                                }`}
                            >
                                {step.id < currentStep ?
                                    <LucideCheck className="w-3.5 h-3.5" />
                                :   step.icon}
                                <span className="hidden sm:inline">
                                    {step.title}
                                </span>
                            </button>
                            {i < steps.length - 1 && (
                                <div className="relative mx-1 flex w-8 sm:w-16 items-center">
                                    <div className={`h-0.5 flex-1 ${step.id < currentStep ? "bg-accent" : "bg-border-light/50"}`} />
                                    <LucideArrowRight className={`absolute left-1/2 h-3.5 w-3.5 -translate-x-1/2 ${step.id < currentStep ? "text-accent" : "text-border"}`} />
                                </div>
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
                                    <h2 className="text-2xl font-serif text-heading mb-2">
                                        Select your plan
                                    </h2>
                                    <p className="text-sm text-body">
                                        Choose the plan that best fits your team
                                        size and reporting needs.
                                    </p>
                                </div>

                                <LaunchDiscountBanner variant="page" />

                                {plansLoading ?
                                    <div className="flex justify-center py-12">
                                        <LucideLoader2 className="w-8 h-8 animate-spin text-muted" />
                                    </div>
                                :   <div className="space-y-6">
                                        {/* Signup-range selector */}
                                        <div>
                                            <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">
                                                How many employees will sign up?
                                            </p>
                                            <div className="inline-flex items-center bg-white border border-slate-200 rounded-2xl p-1 gap-1 shadow-sm">
                                                {signupRanges.map((r) => (
                                                    <button
                                                        key={r.value}
                                                        onClick={() => {
                                                            setSelectedRange(
                                                                r.value,
                                                            );
                                                            setSelectedPlan("");
                                                        }}
                                                        className={`px-5 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                                                            (
                                                                selectedRange ===
                                                                r.value
                                                            ) ?
                                                                "bg-accent shadow-sm text-white"
                                                            :   "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                                                        }`}
                                                    >
                                                        {r.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Enterprise plan cards for the selected range */}
                                        <div className="grid grid-cols-1 min-h-125 md:grid-cols-2 gap-5">
                                            {rangeEnterprisePlans.map(
                                                (plan) => {
                                                    const isPremium =
                                                        plan.serviceLevel ===
                                                        "PREMIUM";
                                                    const isSelected =
                                                        selectedPlan ===
                                                        plan.code;
                                                    const serviceLevel =
                                                        (
                                                            plan.serviceLevel ===
                                                            "PREMIUM"
                                                        ) ?
                                                            "premium"
                                                        :   "standard";
                                                    const colors =
                                                        enterpriseTierColors[
                                                            selectedRange
                                                        ][serviceLevel];
                                                    const features =
                                                        featuresByServiceLevel[
                                                            plan.serviceLevel ??
                                                                "STANDARD"
                                                        ];
                                                    const displayPrice =
                                                        (
                                                            billingCurrency ===
                                                            "NGN"
                                                        ) ?
                                                            `₦${(plan.basePriceNgn ?? 0).toLocaleString()}`
                                                        :   `$${plan.basePriceUsd}`;

                                                    return (
                                                        <button
                                                            key={plan.code}
                                                            onClick={() =>
                                                                setSelectedPlan(
                                                                    plan.code,
                                                                )
                                                            }
                                                            className={`relative overflow-hidden text-left p-6 transition-all hover:-translate-y-0.5 ${colors.border} ${
                                                                isSelected ?
                                                                    "ring-2 ring-offset-2 ring-stone-900/20"
                                                                :   ""
                                                            }`}
                                                        >
                                                            <div
                                                                className="absolute inset-0"
                                                                style={{
                                                                    background:
                                                                        colors.gradient,
                                                                }}
                                                            />
                                                            <div
                                                                className={`absolute top-0 left-0 w-1 h-full ${colors.sideAccent}`}
                                                            />
                                                            <span
                                                                className={`absolute top-6 right-6 text-xs font-semibold ${colors.badgeBg} ${colors.badgeText} px-3 py-1 rounded-full`}
                                                            >
                                                                {isPremium ?
                                                                    "Best report"
                                                                :   "Most popular"
                                                                }
                                                            </span>
                                                            <div className="relative z-10 flex items-start justify-between mb-1 pr-28">
                                                                <h3
                                                                    className={`text-lg font-serif ${colors.textPrimary}`}
                                                                >
                                                                    {
                                                                        plan.displayName
                                                                    }
                                                                </h3>
                                                                {isSelected && (
                                                                    <div
                                                                        className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ml-2 ${isPremium ? "bg-gold" : "bg-stone-900"}`}
                                                                    >
                                                                        <LucideCheck className="w-3.5 h-3.5 text-white" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <p
                                                                className={`relative z-10 text-xs font-medium uppercase tracking-wide mb-3 ${colors.textMuted}`}
                                                            >
                                                                {isPremium ?
                                                                    "Premium service"
                                                                :   "Standard service"
                                                                }
                                                            </p>
                                                            <p
                                                                className={`relative z-10 text-2xl font-serif mb-0.5 ${colors.textPrimary}`}
                                                            >
                                                                {displayPrice}
                                                            </p>
                                                            <p
                                                                className={`relative z-10 text-xs mb-4 ${colors.textMuted}`}
                                                            >
                                                                per credit
                                                            </p>
                                                            <ul className="relative z-10 space-y-2 mb-4">
                                                                {features.map(
                                                                    (f) => (
                                                                        <li
                                                                            key={
                                                                                f
                                                                            }
                                                                            className={`flex items-start gap-2 text-xs ${colors.textPrimary}`}
                                                                        >
                                                                            <LucideCheck
                                                                                className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${colors.checkColor}`}
                                                                            />
                                                                            {f}
                                                                        </li>
                                                                    ),
                                                                )}
                                                            </ul>
                                                        </button>
                                                    );
                                                },
                                            )}
                                        </div>
                                    </div>
                                }

                                {/* Credit count input */}
                                {selectedPlan &&
                                    (() => {
                                        const plan = getSelectedPlanData();
                                        const discountInfo = getDiscountInfo();
                                        return plan && plan.basePriceUsd > 0 ?
                                                <div>
                                                    <label className="block text-sm font-semibold text-heading mb-2">
                                                        How many credits to
                                                        purchase upfront?
                                                    </label>
                                                    <p className="text-xs text-muted mb-3">
                                                        Each credit generates
                                                        one travel health plan
                                                        for one employee trip.
                                                        Volume discounts apply
                                                        automatically.
                                                    </p>
                                                    <div className="flex items-center gap-3">
                                                        <input
                                                            type="number"
                                                            min={1}
                                                            max={10000}
                                                            value={creditCount}
                                                            onChange={(e) => {
                                                                const rawValue =
                                                                    e.target
                                                                        .value;
                                                                if (
                                                                    rawValue ===
                                                                    ""
                                                                ) {
                                                                    setCreditCount(
                                                                        "",
                                                                    );
                                                                    return;
                                                                }
                                                                const value =
                                                                    Number(
                                                                        rawValue,
                                                                    );
                                                                if (
                                                                    !Number.isFinite(
                                                                        value,
                                                                    ) ||
                                                                    value < 0
                                                                )
                                                                    return;
                                                                if (
                                                                    value >
                                                                    10000
                                                                ) {
                                                                    toast.error(
                                                                        "Maximum credit count is 10,000",
                                                                    );
                                                                    setCreditCount(
                                                                        "10000",
                                                                    );
                                                                    return;
                                                                }
                                                                setCreditCount(
                                                                    rawValue,
                                                                );
                                                            }}
                                                            onBlur={() => {
                                                                if (
                                                                    creditCount ===
                                                                        "" ||
                                                                    Number(
                                                                        creditCount,
                                                                    ) < 1
                                                                )
                                                                    setCreditCount(
                                                                        "1",
                                                                    );
                                                            }}
                                                            className={`w-32 ${compactFieldClassName} ${
                                                                (
                                                                    isContactSalesRequired
                                                                ) ?
                                                                    "border-amber-400 bg-amber-50 focus:border-amber-500 focus:ring-amber-200"
                                                                :   ""
                                                            }`}
                                                        />
                                                        <span className="text-sm text-muted">
                                                            credits
                                                        </span>
                                                        {(
                                                            isContactSalesRequired
                                                        ) ?
                                                            <span className="text-sm font-semibold text-amber-700 ml-auto">
                                                                Contact sales
                                                                for custom
                                                                pricing
                                                            </span>
                                                        :   <span className="text-sm font-semibold text-heading ml-auto flex items-center gap-2">
                                                                {getCurrencySymbol()}
                                                                {(
                                                                    getEstimatedTotal() ??
                                                                    0
                                                                ).toLocaleString()}{" "}
                                                                {
                                                                    billingCurrency
                                                                }{" "}
                                                                estimated
                                                                {discountInfo && (
                                                                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full animate-pulse">
                                                                        <LucideTag className="w-3 h-3" />
                                                                        {
                                                                            discountInfo.label
                                                                        }
                                                                    </span>
                                                                )}
                                                                {getAffiliateDiscountInfo() && (
                                                                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                                                                        <LucideTag className="w-3 h-3" />
                                                                        {getAffiliateDiscountInfo()!.label}
                                                                    </span>
                                                                )}
                                                            </span>
                                                        }
                                                    </div>

                                                    {/* Discount tier progress indicator */}
                                                    {!isContactSalesRequired &&
                                                        selectedPlanData && (
                                                            <div className="mt-3">
                                                                <div className="flex items-center gap-1 mb-1.5">
                                                                    {[
                                                                        {
                                                                            min: 1,
                                                                            max: 49,
                                                                            label: "1–49",
                                                                        },
                                                                        {
                                                                            min: 50,
                                                                            max: 99,
                                                                            label: "50–99",
                                                                        },
                                                                        {
                                                                            min: 100,
                                                                            max: 499,
                                                                            label: "100–499",
                                                                        },
                                                                    ].map(
                                                                        (
                                                                            tier,
                                                                        ) => {
                                                                            const isActive =
                                                                                numericCreditCount >=
                                                                                    tier.min &&
                                                                                numericCreditCount <=
                                                                                    tier.max;
                                                                            const isPast =
                                                                                numericCreditCount >
                                                                                tier.max;
                                                                            return (
                                                                                <div
                                                                                    key={
                                                                                        tier.label
                                                                                    }
                                                                                    className="flex-1"
                                                                                >
                                                                                    <div
                                                                                        className={`h-1.5 rounded-full transition-colors duration-300 ${
                                                                                            (
                                                                                                isActive
                                                                                            ) ?
                                                                                                "bg-accent"
                                                                                            : (
                                                                                                isPast
                                                                                            ) ?
                                                                                                "bg-accent/40"
                                                                                            :   "bg-border-light"
                                                                                        }`}
                                                                                    />
                                                                                    <p
                                                                                        className={`text-[10px] mt-0.5 text-center transition-colors ${
                                                                                            (
                                                                                                isActive
                                                                                            ) ?
                                                                                                "text-accent font-semibold"
                                                                                            :   "text-muted"
                                                                                        }`}
                                                                                    >
                                                                                        {
                                                                                            tier.label
                                                                                        }
                                                                                    </p>
                                                                                </div>
                                                                            );
                                                                        },
                                                                    )}
                                                                    <div className="flex-1">
                                                                        <div
                                                                            className={`h-1.5 rounded-full transition-colors duration-300 ${
                                                                                (
                                                                                    numericCreditCount >=
                                                                                    500
                                                                                ) ?
                                                                                    "bg-amber-400"
                                                                                :   "bg-border-light"
                                                                            }`}
                                                                        />
                                                                        <p
                                                                            className={`text-[10px] mt-0.5 text-center transition-colors ${
                                                                                (
                                                                                    numericCreditCount >=
                                                                                    500
                                                                                ) ?
                                                                                    "text-amber-600 font-semibold"
                                                                                :   "text-muted"
                                                                            }`}
                                                                        >
                                                                            500+
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}

                                                    {/* Contact sales CTA for 500+ */}
                                                    {isContactSalesRequired && (
                                                        <div className="mt-4 p-5 bg-amber-50 border-2 border-amber-300 rounded-2xl">
                                                            <div className="flex items-start gap-3">
                                                                <div className="p-2 bg-amber-100 rounded-xl shrink-0">
                                                                    <LucidePhone className="w-5 h-5 text-amber-600" />
                                                                </div>
                                                                <div className="flex-1">
                                                                    <p className="text-sm font-semibold text-amber-800 mb-1">
                                                                        Custom
                                                                        pricing
                                                                        available
                                                                        for{" "}
                                                                        {numericCreditCount.toLocaleString()}{" "}
                                                                        credits
                                                                    </p>
                                                                    <p className="text-xs text-amber-700 mb-3">
                                                                        For
                                                                        orders
                                                                        of 500+
                                                                        credits,
                                                                        our
                                                                        sales
                                                                        team can
                                                                        offer
                                                                        tailored
                                                                        packages
                                                                        with
                                                                        deeper
                                                                        discounts.
                                                                        Contact
                                                                        us for a
                                                                        personalized
                                                                        quote.
                                                                    </p>
                                                                    <a
                                                                        href="/contact"
                                                                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-500 text-white text-sm font-semibold rounded-xl hover:bg-amber-600 transition-colors"
                                                                    >
                                                                        <LucidePhone className="w-4 h-4" />
                                                                        Contact
                                                                        Sales
                                                                    </a>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Discount applied celebration for 50-499 */}
                                                    {discountInfo &&
                                                        !isContactSalesRequired && (
                                                            <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3">
                                                                <div className="p-1.5 bg-emerald-100 rounded-lg shrink-0">
                                                                    <LucideTag className="w-4 h-4 text-emerald-600" />
                                                                </div>
                                                                <div>
                                                                    <p className="text-xs font-semibold text-emerald-800">
                                                                        {
                                                                            discountInfo.label
                                                                        }{" "}
                                                                        applied!
                                                                    </p>
                                                                    <p className="text-xs text-emerald-600">
                                                                        You're
                                                                        saving{" "}
                                                                        {
                                                                            discountInfo.pct
                                                                        }
                                                                        % per
                                                                        credit
                                                                        at{" "}
                                                                        {
                                                                            numericCreditCount
                                                                        }{" "}
                                                                        credits
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        )}

                                                    {/* Affiliate discount celebration */}
                                                    {getAffiliateDiscountInfo() &&
                                                        !isContactSalesRequired && (
                                                            <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3">
                                                                <div className="p-1.5 bg-emerald-100 rounded-lg shrink-0">
                                                                    <LucideTag className="w-4 h-4 text-emerald-600" />
                                                                </div>
                                                                <div>
                                                                    <p className="text-xs font-semibold text-emerald-800">
                                                                        {getAffiliateDiscountInfo()!.label} applied!
                                                                    </p>
                                                                    <p className="text-xs text-emerald-600">
                                                                        Referral discount on top of any volume pricing
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        )}
                                                </div>
                                            :   null;
                                    })()}

                                <div>
                                    <label className="block text-sm font-semibold text-heading mb-2">
                                        Describe your typical travel health
                                        needs (optional)
                                    </label>
                                    <textarea
                                        value={sampleRequest}
                                        onChange={(e) =>
                                            setSampleRequest(e.target.value)
                                        }
                                        placeholder="E.g., We send 50+ employees to Southeast Asia and Africa quarterly. We need vaccination plans, medication guidance, and emergency contact info for each destination..."
                                        rows={4}
                                        className={`${fieldClassName} resize-none`}
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
                                    <h2 className="text-2xl font-serif text-heading mb-2">
                                        Company & team details
                                    </h2>
                                    <p className="text-sm text-body">
                                        Tell us about your company and who
                                        should have access.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-heading mb-1.5">
                                            Company name *
                                        </label>
                                        <input
                                            type="text"
                                            value={companyName}
                                            onChange={(e) =>
                                                setCompanyName(e.target.value)
                                            }
                                            placeholder="Acme Corp"
                                            className={fieldClassName}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-heading mb-1.5">
                                            Industry
                                        </label>
                                        <select
                                            value={industry}
                                            onChange={(e) =>
                                                setIndustry(e.target.value)
                                            }
                                            className={selectClassName}
                                        >
                                            <option value="">
                                                Select industry
                                            </option>
                                            {industries.map((ind) => (
                                                <option key={ind} value={ind}>
                                                    {ind}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-heading mb-1.5">
                                            Contact email *
                                        </label>
                                        <input
                                            type="email"
                                            value={contactEmail}
                                            onChange={(e) =>
                                                setContactEmail(e.target.value)
                                            }
                                            placeholder="hr@acmecorp.com"
                                            className={fieldClassName}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-heading mb-1.5">
                                            Contact phone
                                        </label>
                                        <input
                                            type="tel"
                                            value={contactPhone}
                                            onChange={(e) =>
                                                setContactPhone(e.target.value)
                                            }
                                            placeholder="+1 555 000 0000"
                                            className={fieldClassName}
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-semibold text-heading mb-1.5">
                                            Website
                                        </label>
                                        <input
                                            type="url"
                                            value={website}
                                            onChange={(e) =>
                                                setWebsite(e.target.value)
                                            }
                                            placeholder="https://acmecorp.com"
                                            className={fieldClassName}
                                        />
                                    </div>
                                </div>

                                {/* Team members */}
                                <div>
                                    <div className="flex items-start md:items-center justify-between mb-3">
                                        <label className="text-sm font-semibold text-heading">
                                            Admin team members *
                                        </label>
                                        <button
                                            onClick={addTeamMember}
                                            className={secondaryActionClassName}
                                        >
                                            <LucidePlus className="w-3.5 h-3.5" />
                                            Add another
                                        </button>
                                    </div>
                                    <div className="space-y-3">
                                        {teamMembers.map((member, index) => (
                                            <div
                                                key={index}
                                                className="flex gap-3 items-start"
                                            >
                                                <span className="inline-flex items-center px-3 py-3 rounded-xl border border-accent/30 bg-accent/10 text-xs font-bold text-accent whitespace-nowrap">
                                                    Admin
                                                </span>
                                                <input
                                                    type="text"
                                                    value={member.firstName}
                                                    onChange={(e) =>
                                                        updateTeamMember(
                                                            index,
                                                            "firstName",
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="First name"
                                                    className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white/50 px-4 py-3 text-sm text-slate-950 placeholder:text-slate-400 outline-none transition-colors focus:border-accent focus:ring-4 focus:ring-accent/15"
                                                />
                                                <input
                                                    type="text"
                                                    value={member.lastName}
                                                    onChange={(e) =>
                                                        updateTeamMember(
                                                            index,
                                                            "lastName",
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="Last name"
                                                    className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white/50 px-4 py-3 text-sm text-slate-950 placeholder:text-slate-400 outline-none transition-colors focus:border-accent focus:ring-4 focus:ring-accent/15"
                                                />
                                                <input
                                                    type="email"
                                                    value={member.email}
                                                    onChange={(e) =>
                                                        updateTeamMember(
                                                            index,
                                                            "email",
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="Email address"
                                                    className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white/50 px-4 py-3 text-sm text-slate-950 placeholder:text-slate-400 outline-none transition-colors focus:border-accent focus:ring-4 focus:ring-accent/15"
                                                />

                                                {teamMembers.length > 1 && (
                                                    <button
                                                        onClick={() =>
                                                            removeTeamMember(
                                                                index,
                                                            )
                                                        }
                                                        className="p-3 rounded-xl border border-transparent text-slate-500 hover:border-red-200 hover:text-red-600 hover:bg-red-50 transition-colors"
                                                    >
                                                        <LucideX className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-xs text-muted mt-2">
                                        Admin users have full dashboard access and can manage employees and travel plans.
                                    </p>
                                </div>

                                {/* Platform employees */}
                                <div>
                                    <div className="flex items-start md:items-center justify-between mb-3">
                                        <div>
                                            <label className="text-sm font-semibold text-heading">
                                                Platform Employees
                                            </label>
                                            <p className="text-xs text-muted mt-0.5">
                                                Add existing TMAG users by email to link them as employees of this company.
                                            </p>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-3">
                                            <label className={`${actionButtonClassName} cursor-pointer`}>
                                                <LucideUpload className="w-3.5 h-3.5" />
                                                Upload CSV
                                                <input
                                                    type="file"
                                                    accept=".csv,text/csv"
                                                    className="hidden"
                                                    onChange={(e) =>
                                                        void handleTeamMembersCsvUpload(
                                                            e.target.files?.[0] ?? null,
                                                        )
                                                    }
                                                />
                                            </label>
                                            <a
                                                href={`data:text/csv;charset=utf-8,${encodeURIComponent(teamMembersCsvSample)}`}
                                                download="employees-template.csv"
                                                className={secondaryActionClassName}
                                            >
                                                Download sample
                                            </a>
                                            <button
                                                onClick={addPlatformEmployee}
                                                className={secondaryActionClassName}
                                            >
                                                <LucidePlus className="w-3.5 h-3.5" />
                                                Add employee
                                            </button>
                                        </div>
                                    </div>
                                    <div className="mb-3 rounded-xl bg-white/50 px-4 py-3 text-xs text-slate-600">
                                        CSV columns:{" "}
                                        <span className="font-semibold text-heading">name,email</span>
                                        . Each row links an existing platform user to this company.
                                        {teamMembersCsv && (
                                            <span className="block mt-1 text-accent">
                                                Uploaded: {teamMembersCsv.name}
                                            </span>
                                        )}
                                        {teamMembersCsvError && (
                                            <span className="block mt-1 text-red-500">
                                                {teamMembersCsvError}
                                            </span>
                                        )}
                                    </div>
                                    <div className="space-y-3">
                                        {platformEmployees.map((emp, index) => (
                                            <div key={index} className="flex gap-3 items-start">
                                                <input
                                                    type="text"
                                                    value={emp.firstName ?? ""}
                                                    onChange={(e) =>
                                                        updatePlatformEmployee(index, "firstName", e.target.value)
                                                    }
                                                    placeholder="First name (optional)"
                                                    className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white/50 px-4 py-3 text-sm text-slate-950 placeholder:text-slate-400 outline-none transition-colors focus:border-accent focus:ring-4 focus:ring-accent/15"
                                                />
                                                <input
                                                    type="text"
                                                    value={emp.lastName ?? ""}
                                                    onChange={(e) =>
                                                        updatePlatformEmployee(index, "lastName", e.target.value)
                                                    }
                                                    placeholder="Last name (optional)"
                                                    className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white/50 px-4 py-3 text-sm text-slate-950 placeholder:text-slate-400 outline-none transition-colors focus:border-accent focus:ring-4 focus:ring-accent/15"
                                                />
                                                <input
                                                    type="email"
                                                    value={emp.email}
                                                    onChange={(e) =>
                                                        updatePlatformEmployee(index, "email", e.target.value)
                                                    }
                                                    placeholder="Platform user email"
                                                    className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white/50 px-4 py-3 text-sm text-slate-950 placeholder:text-slate-400 outline-none transition-colors focus:border-accent focus:ring-4 focus:ring-accent/15"
                                                />
                                                {platformEmployees.length > 1 && (
                                                    <button
                                                        onClick={() => removePlatformEmployee(index)}
                                                        className="p-3 rounded-xl border border-transparent text-slate-500 hover:border-red-200 hover:text-red-600 hover:bg-red-50 transition-colors"
                                                    >
                                                        <LucideX className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-xs text-muted mt-2">
                                        Leave empty to skip. Linked users will be associated with this company upon approval.
                                    </p>
                                </div>

                                <div className="flex justify-between">
                                    <Button
                                        variant="secondary"
                                        onClick={() => goToStep(1)}
                                        icon={<LucideArrowLeft />}
                                    >
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
                                    <h2 className="text-2xl font-serif text-heading mb-2">
                                        Review your order
                                    </h2>
                                    <p className="text-sm text-body">
                                        Please verify all details before
                                        proceeding to payment.
                                    </p>
                                </div>

                                {/* Plan summary */}
                                <div className={panelClassName}>
                                    <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">
                                        Selected Plan
                                    </h3>
                                    {(() => {
                                        const plan = getSelectedPlanData();
                                        if (!plan) return null;
                                        const total = getEstimatedTotal();
                                        const discountInfo = getDiscountInfo();
                                        return (
                                            <>
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <p className="text-lg font-serif text-heading">
                                                            {plan.displayName}
                                                        </p>
                                                        <p className="text-sm text-body">
                                                            {formatPricePerCredit(
                                                                plan,
                                                            )}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-2xl font-serif text-heading">
                                                            {formatTotal(total)}
                                                        </p>
                                                        {discountInfo && (
                                                            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full mt-1">
                                                                <LucideTag className="w-3 h-3" />
                                                                {
                                                                    discountInfo.label
                                                                }
                                                            </span>
                                                        )}
                                                        {getAffiliateDiscountInfo() && (
                                                            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full mt-1">
                                                                <LucideTag className="w-3 h-3" />
                                                                {getAffiliateDiscountInfo()!.label}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                {isContactSalesRequired && (
                                                    <div className="mt-4 p-4 bg-amber-50 border-2 border-amber-300 rounded-xl">
                                                        <div className="flex items-start gap-3">
                                                            <LucidePhone className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                                                            <div>
                                                                <p className="text-sm font-semibold text-amber-800">
                                                                    Custom
                                                                    pricing for{" "}
                                                                    {numericCreditCount.toLocaleString()}{" "}
                                                                    credits
                                                                </p>
                                                                <p className="text-xs text-amber-700 mt-1">
                                                                    Orders of
                                                                    500+ credits
                                                                    qualify for
                                                                    tailored
                                                                    packages
                                                                    with deeper
                                                                    discounts.
                                                                    Please
                                                                    contact our
                                                                    sales team
                                                                    before
                                                                    proceeding.
                                                                </p>
                                                                <a
                                                                    href="/contact"
                                                                    className="inline-flex items-center gap-2 mt-2 px-4 py-2 bg-amber-500 text-white text-xs font-semibold rounded-xl hover:bg-amber-600 transition-colors"
                                                                >
                                                                    <LucidePhone className="w-3.5 h-3.5" />
                                                                    Contact
                                                                    Sales
                                                                </a>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </>
                                        );
                                    })()}
                                </div>

                                {/* Volume pricing table */}
                                {selectedPlanData &&
                                    selectedPlanData.basePriceUsd > 0 &&
                                    pricingPreviews &&
                                    pricingPreviews.length > 0 && (
                                        <div className={panelClassName}>
                                            <div className="flex items-center justify-between mb-3">
                                                <h3 className="text-xs font-semibold text-muted uppercase tracking-wider">
                                                    Volume Pricing
                                                </h3>
                                                {getDiscountInfo() && (
                                                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                                                        <LucideTag className="w-3 h-3" />
                                                        {
                                                            getDiscountInfo()!
                                                                .label
                                                        }{" "}
                                                        active
                                                    </span>
                                                )}
                                            </div>
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-sm">
                                                    <thead>
                                                        <tr className="text-left text-muted border-b border-border-light/50">
                                                            <th className="pb-2 pr-4">
                                                                Credits
                                                            </th>
                                                            <th className="pb-2 pr-4">
                                                                Standard
                                                            </th>
                                                            <th className="pb-2 pr-4">
                                                                Premium
                                                            </th>
                                                            <th className="pb-2">
                                                                Savings
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="text-heading">
                                                        <tr
                                                            className={`border-b border-border-light/30 ${getVolumePricing()?.appliedTier === "TIER_1" ? "bg-accent/5" : ""}`}
                                                        >
                                                            <td className="py-2.5 pr-4">
                                                                1–49
                                                            </td>
                                                            <td className="py-2.5 pr-4">
                                                                {(
                                                                    billingCurrency ===
                                                                    "NGN"
                                                                ) ?
                                                                    "₦50,000"
                                                                :   "$50"}
                                                            </td>
                                                            <td className="py-2.5 pr-4">
                                                                {(
                                                                    billingCurrency ===
                                                                    "NGN"
                                                                ) ?
                                                                    "₦100,000"
                                                                :   "$100"}
                                                            </td>
                                                            <td className="py-2.5 text-muted">
                                                                —
                                                            </td>
                                                        </tr>
                                                        <tr
                                                            className={`border-b border-border-light/30 ${getVolumePricing()?.appliedTier === "TIER_2" ? "bg-accent/5" : ""}`}
                                                        >
                                                            <td className="py-2.5 pr-4">
                                                                50–99
                                                            </td>
                                                            <td className="py-2.5 pr-4">
                                                                {(
                                                                    billingCurrency ===
                                                                    "NGN"
                                                                ) ?
                                                                    "₦45,000"
                                                                :   "$45"}
                                                            </td>
                                                            <td className="py-2.5 pr-4">
                                                                {(
                                                                    billingCurrency ===
                                                                    "NGN"
                                                                ) ?
                                                                    "₦90,000"
                                                                :   "$90"}
                                                            </td>
                                                            <td className="py-2.5 text-emerald-600 font-medium">
                                                                10%
                                                            </td>
                                                        </tr>
                                                        <tr
                                                            className={`border-b border-border-light/30 ${getVolumePricing()?.appliedTier === "TIER_3" ? "bg-accent/5" : ""}`}
                                                        >
                                                            <td className="py-2.5 pr-4">
                                                                100–499
                                                            </td>
                                                            <td className="py-2.5 pr-4">
                                                                {(
                                                                    billingCurrency ===
                                                                    "NGN"
                                                                ) ?
                                                                    "₦40,000"
                                                                :   "$40"}
                                                            </td>
                                                            <td className="py-2.5 pr-4">
                                                                {(
                                                                    billingCurrency ===
                                                                    "NGN"
                                                                ) ?
                                                                    "₦80,000"
                                                                :   "$80"}
                                                            </td>
                                                            <td className="py-2.5 text-emerald-600 font-medium">
                                                                20%
                                                            </td>
                                                        </tr>
                                                        <tr
                                                            className={
                                                                (
                                                                    numericCreditCount >=
                                                                    500
                                                                ) ?
                                                                    "bg-amber-50"
                                                                :   ""
                                                            }
                                                        >
                                                            <td className="py-2.5 pr-4">
                                                                500+
                                                            </td>
                                                            <td
                                                                colSpan={2}
                                                                className="py-2.5 text-amber-600 italic font-medium"
                                                            >
                                                                Contact sales
                                                            </td>
                                                            <td className="py-2.5 text-amber-600 font-medium">
                                                                Custom
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                            {getDiscountInfo() &&
                                                (() => {
                                                    const vp =
                                                        getVolumePricing();
                                                    if (!vp) return null;
                                                    const tier1Price =
                                                        (
                                                            vp.serviceLevel ===
                                                            "PREMIUM"
                                                        ) ?
                                                            (
                                                                billingCurrency ===
                                                                "NGN"
                                                            ) ?
                                                                100000
                                                            :   100
                                                        : (
                                                            billingCurrency ===
                                                            "NGN"
                                                        ) ?
                                                            50000
                                                        :   50;
                                                    const savingsPerCredit =
                                                        tier1Price -
                                                        vp.pricePerCredit;
                                                    const totalSavings =
                                                        savingsPerCredit *
                                                        numericCreditCount;
                                                    return (
                                                        <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                                                            <div className="flex items-center gap-2">
                                                                <LucideTag className="w-4 h-4 text-emerald-600" />
                                                                <span className="text-xs font-semibold text-emerald-800">
                                                                    {
                                                                        getDiscountInfo()!
                                                                            .label
                                                                    }{" "}
                                                                    applied
                                                                </span>
                                                            </div>
                                                            <span className="text-sm font-bold text-emerald-700">
                                                                You save{" "}
                                                                {(
                                                                    billingCurrency ===
                                                                    "NGN"
                                                                ) ?
                                                                    "₦"
                                                                :   "$"}
                                                                {totalSavings.toLocaleString()}
                                                            </span>
                                                        </div>
                                                    );
                                                })()}
                                        </div>
                                    )}

                                {/* Company info summary */}
                                <div className={panelClassName}>
                                    <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">
                                        Company Information
                                    </h3>
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div>
                                            <p className="text-muted">
                                                Company
                                            </p>
                                            <p className="text-heading font-medium">
                                                {companyName}
                                            </p>
                                        </div>
                                        {industry && (
                                            <div>
                                                <p className="text-muted">
                                                    Industry
                                                </p>
                                                <p className="text-heading font-medium">
                                                    {industry}
                                                </p>
                                            </div>
                                        )}
                                        <div>
                                            <p className="text-muted">
                                                Contact Email
                                            </p>
                                            <p className="text-heading font-medium">
                                                {contactEmail}
                                            </p>
                                        </div>
                                        {contactPhone && (
                                            <div>
                                                <p className="text-muted">
                                                    Phone
                                                </p>
                                                <p className="text-heading font-medium">
                                                    {contactPhone}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Sample request */}
                                {sampleRequest.trim() && (
                                    <div className={panelClassName}>
                                        <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">
                                            Sample Request
                                        </h3>
                                        <p className="text-sm text-body leading-relaxed">
                                            {sampleRequest}
                                        </p>
                                    </div>
                                )}

                                {/* Team members summary */}
                                <div className={panelClassName}>
                                    <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">
                                        Team Members ({teamMembers.length})
                                    </h3>
                                    <div className="space-y-2">
                                        {teamMembers.map((member, i) => (
                                            <div
                                                key={i}
                                                className="flex items-center justify-between text-sm"
                                            >
                                                <div>
                                                    <span className="text-heading font-medium">
                                                        {member.firstName} {member.lastName}
                                                    </span>
                                                    <span className="text-muted ml-2">
                                                        ({member.email})
                                                    </span>
                                                </div>
                                                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-accent/10 text-accent">
                                                    Admin
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Platform employees summary */}
                                {platformEmployees.some((e) => e.email.trim()) && (
                                    <div className={panelClassName}>
                                        <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">
                                            Platform Employees ({platformEmployees.filter((e) => e.email.trim()).length})
                                        </h3>
                                        <div className="space-y-2">
                                            {platformEmployees.filter((e) => e.email.trim()).map((emp, i) => (
                                                <div key={i} className="flex items-center justify-between text-sm">
                                                    <div>
                                                        {(emp.firstName || emp.lastName) && (
                                                            <span className="text-heading font-medium">{emp.firstName} {emp.lastName}</span>
                                                        )}
                                                        <span className="text-muted">({emp.email})</span>
                                                    </div>
                                                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">
                                                        Employee
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="flex justify-between">
                                    <Button
                                        variant="secondary"
                                        onClick={() => goToStep(2)}
                                        icon={<LucideArrowLeft />}
                                    >
                                        Back
                                    </Button>
                                    <Button
                                        variant="primary"
                                        onClick={handleSubmit}
                                        disabled={
                                            submitting || isContactSalesRequired
                                        }
                                    >
                                        {submitting ?
                                            <span className="flex items-center gap-2">
                                                <LucideLoader2 className="w-4 h-4 animate-spin" />
                                                Submitting...
                                            </span>
                                        : isContactSalesRequired ?
                                            "Contact sales to proceed"
                                        :   "Submit & Proceed to Payment"}
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Step 4: Payment */}
                        {currentStep === 4 && (
                            <div className="space-y-8 max-w-lg mx-auto text-center">
                                {onboardingResult ?
                                    <>
                                        <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto">
                                            <LucideCreditCard className="w-8 h-8 text-accent" />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-serif text-heading mb-2">
                                                Complete your payment
                                            </h2>
                                            <p className="text-sm text-body">
                                                Your registration for{" "}
                                                <strong>
                                                    {
                                                        onboardingResult.companyName
                                                    }
                                                </strong>{" "}
                                                has been saved. Complete payment
                                                to submit it for approval.
                                            </p>
                                        </div>

                                        <LaunchDiscountBanner variant="page" />

                                        <div
                                            className={`${panelClassName} text-left`}
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm text-muted">
                                                    Plan
                                                </span>
                                                <span className="text-sm font-semibold text-heading">
                                                    {selectedPlanData?.displayName ??
                                                        onboardingResult.selectedPlanCode}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-muted">
                                                    Credits
                                                </span>
                                                <span className="text-sm font-semibold text-heading">
                                                    {onboardingResult.creditCount ??
                                                        numericCreditCount}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between mt-2">
                                                <span className="text-sm text-muted">
                                                    Amount
                                                </span>
                                                <span className="text-lg font-serif text-heading">
                                                    {(() => {
                                                        const estimated =
                                                            getEstimatedTotal();
                                                        if (
                                                            estimated !==
                                                                null &&
                                                            estimated > 0
                                                        )
                                                            return formatTotal(
                                                                estimated,
                                                            );
                                                        if (
                                                            onboardingResult.paymentAmount !=
                                                                null &&
                                                            onboardingResult.paymentAmount >
                                                                0
                                                        )
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
                                            {initiatePayment.isPending ?
                                                <span className="flex items-center gap-2">
                                                    <LucideLoader2 className="w-4 h-4 animate-spin" />
                                                    Processing...
                                                </span>
                                            :   "Pay Now"}
                                        </Button>

                                        <p className="text-xs text-muted">
                                            You will be redirected to our secure
                                            payment partner (Flutterwave) to
                                            complete the transaction. After
                                            payment, your registration will be
                                            reviewed by our team.
                                        </p>
                                    </>
                                :   <div className="py-12">
                                        <LucideLoader2 className="w-8 h-8 animate-spin text-muted mx-auto mb-4" />
                                        <p className="text-sm text-muted">
                                            Loading...
                                        </p>
                                    </div>
                                }
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </main>
    );
};

export default CompanyOnboarding;
