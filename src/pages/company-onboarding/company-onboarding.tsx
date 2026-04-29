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
import type { TeamMember, CompanyOnboardingResponse, PublicPricingPreview } from "../../api/types";
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

const teamMembersCsvSample = "name,email,role\nJane Doe,jane@example.com,admin\nJohn Smith,john@example.com,hr\n";

const parseTeamMembersCsv = (csv: string): TeamMember[] => {
    const rows = csv
        .split(/\r?\n/)
        .map((row) => row.trim())
        .filter(Boolean);

    if (rows.length === 0) return [];

    const hasHeader = rows[0]
        .toLowerCase()
        .split(",")
        .some((column) => ["name", "email", "role"].includes(column.trim()));

    return rows.slice(hasHeader ? 1 : 0).map((row, index) => {
        const [name = "", email = "", role = "hr"] = row.split(",").map((value) => value.trim());
        if (!name || !email) {
            throw new Error(`Row ${index + (hasHeader ? 2 : 1)} must include name and email.`);
        }

        return {
            name,
            email,
            role: role.toLowerCase() === "admin" ? "admin" : "hr",
        };
    });
};

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
    const [teamMembersCsv, setTeamMembersCsv] = useState<File | null>(null);
    const [teamMembersCsvError, setTeamMembersCsvError] = useState("");
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
        { name: "", email: "", role: "admin" },
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

    const getEstimatedTotal = () => {
        const plan = getSelectedPlanData();
        if (!plan || plan.basePriceUsd === 0) return null;
        const volumePricing = getVolumePricing();
        if (volumePricing) return volumePricing.totalAmount;
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
                setTeamMembersCsvError("The CSV did not include any team members.");
                return;
            }

            const hasOnlyEmptyStarter = teamMembers.length === 1 && !teamMembers[0].name.trim() && !teamMembers[0].email.trim();
            setTeamMembers(hasOnlyEmptyStarter ? importedMembers : [...teamMembers, ...importedMembers]);
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
                teamMembersCsv,
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
                                    const discountInfo = getDiscountInfo();
                                    return plan && plan.basePriceUsd > 0 ? (
                                        <div>
                                            <label className="block text-sm font-semibold text-heading mb-2">
                                                How many credits to purchase upfront?
                                            </label>
                                            <p className="text-xs text-muted mb-3">
                                                Each credit generates one travel health plan for one employee trip. Volume discounts apply automatically.
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
                                                    className={`w-32 bg-background-primary border rounded-xl px-4 py-3 text-sm text-heading outline-none focus:border-accent transition-colors ${
                                                        isContactSalesRequired ? "border-amber-400 bg-amber-50/30" : "border-heading/50"
                                                    }`}
                                                />
                                                <span className="text-sm text-muted">credits</span>
                                                {isContactSalesRequired ? (
                                                    <span className="text-sm font-semibold text-amber-700 ml-auto">
                                                        Contact sales for custom pricing
                                                    </span>
                                                ) : (
                                                    <span className="text-sm font-semibold text-heading ml-auto flex items-center gap-2">
                                                        {getCurrencySymbol()}{(getEstimatedTotal() ?? 0).toLocaleString()} {billingCurrency} estimated
                                                        {discountInfo && (
                                                            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full animate-pulse">
                                                                <LucideTag className="w-3 h-3" />
                                                                {discountInfo.label}
                                                            </span>
                                                        )}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Discount tier progress indicator */}
                                            {!isContactSalesRequired && selectedPlanData && (
                                                <div className="mt-3">
                                                    <div className="flex items-center gap-1 mb-1.5">
                                                        {[{ min: 1, max: 49, label: "1–49" }, { min: 50, max: 99, label: "50–99" }, { min: 100, max: 499, label: "100–499" }].map((tier) => {
                                                            const isActive = numericCreditCount >= tier.min && numericCreditCount <= tier.max;
                                                            const isPast = numericCreditCount > tier.max;
                                                            return (
                                                                <div key={tier.label} className="flex-1">
                                                                    <div className={`h-1.5 rounded-full transition-colors duration-300 ${
                                                                        isActive ? "bg-accent" : isPast ? "bg-accent/40" : "bg-border-light"
                                                                    }`} />
                                                                    <p className={`text-[10px] mt-0.5 text-center transition-colors ${
                                                                        isActive ? "text-accent font-semibold" : "text-muted"
                                                                    }`}>{tier.label}</p>
                                                                </div>
                                                            );
                                                        })}
                                                        <div className="flex-1">
                                                            <div className={`h-1.5 rounded-full transition-colors duration-300 ${
                                                                numericCreditCount >= 500 ? "bg-amber-400" : "bg-border-light"
                                                            }`} />
                                                            <p className={`text-[10px] mt-0.5 text-center transition-colors ${
                                                                numericCreditCount >= 500 ? "text-amber-600 font-semibold" : "text-muted"
                                                            }`}>500+</p>
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
                                                                Custom pricing available for {numericCreditCount.toLocaleString()} credits
                                                            </p>
                                                            <p className="text-xs text-amber-700 mb-3">
                                                                For orders of 500+ credits, our sales team can offer tailored packages with deeper discounts. Contact us for a personalized quote.
                                                            </p>
                                                            <a
                                                                href="/contact"
                                                                className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-500 text-white text-sm font-semibold rounded-xl hover:bg-amber-600 transition-colors"
                                                            >
                                                                <LucidePhone className="w-4 h-4" />
                                                                Contact Sales
                                                            </a>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Discount applied celebration for 50-499 */}
                                            {discountInfo && !isContactSalesRequired && (
                                                <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3">
                                                    <div className="p-1.5 bg-emerald-100 rounded-lg shrink-0">
                                                        <LucideTag className="w-4 h-4 text-emerald-600" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-semibold text-emerald-800">
                                                            {discountInfo.label} applied!
                                                        </p>
                                                        <p className="text-xs text-emerald-600">
                                                            You're saving {discountInfo.pct}% per credit at {numericCreditCount} credits
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ) : null;
                                })()}

                                <div>
                                    <label className="block text-sm font-semibold text-heading mb-2">
                                        Describe your typical travel health needs (optional)
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
                                        <div className="flex items-center gap-3">
                                            <label className="flex items-center gap-1 text-xs font-semibold text-accent hover:text-accent/80 transition-colors cursor-pointer">
                                                <LucideUpload className="w-3.5 h-3.5" />
                                                Upload CSV
                                                <input
                                                    type="file"
                                                    accept=".csv,text/csv"
                                                    className="hidden"
                                                    onChange={(e) => void handleTeamMembersCsvUpload(e.target.files?.[0] ?? null)}
                                                />
                                            </label>
                                            <a
                                                href={`data:text/csv;charset=utf-8,${encodeURIComponent(teamMembersCsvSample)}`}
                                                download="team-members-template.csv"
                                                className="text-xs font-semibold text-muted hover:text-accent transition-colors"
                                            >
                                                Download sample
                                            </a>
                                            <button
                                                onClick={addTeamMember}
                                                className="flex items-center gap-1 text-xs font-semibold text-accent hover:text-accent/80 transition-colors"
                                            >
                                                <LucidePlus className="w-3.5 h-3.5" />
                                                Add another
                                            </button>
                                        </div>
                                    </div>
                                    <div className="mb-3 rounded-xl border border-border-light/50 bg-background-primary px-4 py-3 text-xs text-muted">
                                        CSV columns: <span className="font-semibold text-heading">name,email,role</span>. Role is optional and defaults to HR.
                                        {teamMembersCsv && <span className="block mt-1 text-accent">Uploaded: {teamMembersCsv.name}</span>}
                                        {teamMembersCsvError && <span className="block mt-1 text-red-500">{teamMembersCsvError}</span>}
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
                                        const discountInfo = getDiscountInfo();
                                        return (
                                            <>
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <p className="text-lg font-serif text-heading">{plan.displayName}</p>
                                                        <p className="text-sm text-body">{formatPricePerCredit(plan)}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-2xl font-serif text-heading">{formatTotal(total)}</p>
                                                        {discountInfo && (
                                                            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full mt-1">
                                                                <LucideTag className="w-3 h-3" />
                                                                {discountInfo.label}
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
                                                                    Custom pricing for {numericCreditCount.toLocaleString()} credits
                                                                </p>
                                                                <p className="text-xs text-amber-700 mt-1">
                                                                    Orders of 500+ credits qualify for tailored packages with deeper discounts. Please contact our sales team before proceeding.
                                                                </p>
                                                                <a
                                                                    href="/contact"
                                                                    className="inline-flex items-center gap-2 mt-2 px-4 py-2 bg-amber-500 text-white text-xs font-semibold rounded-xl hover:bg-amber-600 transition-colors"
                                                                >
                                                                    <LucidePhone className="w-3.5 h-3.5" />
                                                                    Contact Sales
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
                                {selectedPlanData && selectedPlanData.basePriceUsd > 0 && pricingPreviews && pricingPreviews.length > 0 && (
                                    <div className="bg-button-secondary rounded-2xl p-6">
                                        <div className="flex items-center justify-between mb-3">
                                            <h3 className="text-xs font-semibold text-muted uppercase tracking-wider">Volume Pricing</h3>
                                            {getDiscountInfo() && (
                                                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                                                    <LucideTag className="w-3 h-3" />
                                                    {getDiscountInfo()!.label} active
                                                </span>
                                            )}
                                        </div>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-sm">
                                                <thead>
                                                    <tr className="text-left text-muted border-b border-border-light/50">
                                                        <th className="pb-2 pr-4">Credits</th>
                                                        <th className="pb-2 pr-4">Standard</th>
                                                        <th className="pb-2 pr-4">Premium</th>
                                                        <th className="pb-2">Savings</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="text-heading">
                                                    <tr className={`border-b border-border-light/30 ${getVolumePricing()?.appliedTier === "TIER_1" ? "bg-accent/5" : ""}`}>
                                                        <td className="py-2.5 pr-4">1–49</td>
                                                        <td className="py-2.5 pr-4">{billingCurrency === "NGN" ? "₦50,000" : "$50"}</td>
                                                        <td className="py-2.5 pr-4">{billingCurrency === "NGN" ? "₦100,000" : "$100"}</td>
                                                        <td className="py-2.5 text-muted">—</td>
                                                    </tr>
                                                    <tr className={`border-b border-border-light/30 ${getVolumePricing()?.appliedTier === "TIER_2" ? "bg-accent/5" : ""}`}>
                                                        <td className="py-2.5 pr-4">50–99</td>
                                                        <td className="py-2.5 pr-4">{billingCurrency === "NGN" ? "₦45,000" : "$45"}</td>
                                                        <td className="py-2.5 pr-4">{billingCurrency === "NGN" ? "₦90,000" : "$90"}</td>
                                                        <td className="py-2.5 text-emerald-600 font-medium">10%</td>
                                                    </tr>
                                                    <tr className={`border-b border-border-light/30 ${getVolumePricing()?.appliedTier === "TIER_3" ? "bg-accent/5" : ""}`}>
                                                        <td className="py-2.5 pr-4">100–499</td>
                                                        <td className="py-2.5 pr-4">{billingCurrency === "NGN" ? "₦40,000" : "$40"}</td>
                                                        <td className="py-2.5 pr-4">{billingCurrency === "NGN" ? "₦80,000" : "$80"}</td>
                                                        <td className="py-2.5 text-emerald-600 font-medium">20%</td>
                                                    </tr>
                                                    <tr className={numericCreditCount >= 500 ? "bg-amber-50" : ""}>
                                                        <td className="py-2.5 pr-4">500+</td>
                                                        <td colSpan={2} className="py-2.5 text-amber-600 italic font-medium">Contact sales</td>
                                                        <td className="py-2.5 text-amber-600 font-medium">Custom</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                        {getDiscountInfo() && (() => {
                                            const vp = getVolumePricing();
                                            if (!vp) return null;
                                            const tier1Price = vp.serviceLevel === "PREMIUM"
                                                ? (billingCurrency === "NGN" ? 100000 : 100)
                                                : (billingCurrency === "NGN" ? 50000 : 50);
                                            const savingsPerCredit = tier1Price - vp.pricePerCredit;
                                            const totalSavings = savingsPerCredit * numericCreditCount;
                                            return (
                                                <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <LucideTag className="w-4 h-4 text-emerald-600" />
                                                        <span className="text-xs font-semibold text-emerald-800">
                                                            {getDiscountInfo()!.label} applied
                                                        </span>
                                                    </div>
                                                    <span className="text-sm font-bold text-emerald-700">
                                                        You save {billingCurrency === "NGN" ? "₦" : "$"}{totalSavings.toLocaleString()}
                                                    </span>
                                                </div>
                                            );
                                        })()}
                                    </div>
                                )}

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
                                {sampleRequest.trim() && (
                                    <div className="bg-button-secondary rounded-2xl p-6">
                                        <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Sample Request</h3>
                                        <p className="text-sm text-body leading-relaxed">{sampleRequest}</p>
                                    </div>
                                )}

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
                                    <Button variant="primary" onClick={handleSubmit} disabled={submitting || isContactSalesRequired}>
                                        {submitting ? (
                                            <span className="flex items-center gap-2">
                                                <LucideLoader2 className="w-4 h-4 animate-spin" />
                                                Submitting...
                                            </span>
                                        ) : isContactSalesRequired ? (
                                            "Contact sales to proceed"
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
