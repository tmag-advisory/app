import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { LucideCheck, LucideArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import Button from "../../components/ui/Button";
import AnimateIn from "../../components/animations/AnimateIn";
import StaggerGroup, { staggerItem } from "../../components/animations/StaggerGroup";
import { useCurrencyStore } from "../../stores/currencyStore";
import {
    individualPlans,
    creditPlans,
    premiumFeatures,
    enterpriseTiers,
    enterprisePlanCodes,
    signupRanges,
    enterpriseTierColors,
    individualPlanFeatures,
    familyPlans,
    type SignupRange,
    type ServiceLevel,
} from "../../constants/companyPlans";
import { getAffiliateReferralCode, getStoredAffiliateDiscountRate, refreshAffiliateDiscount } from "../../lib/affiliateTracking";
import SEOHead from "../../lib/seo";
import PriceDiscountBadge from "../../components/pricing/PriceDiscountBadge";
import IndividualPlanCard from "../../components/pricing/IndividualPlanCard";
import { formatStackedPrice as formatPrice } from "../../lib/launchDiscount";
import { useLaunchDiscount } from "../../api";
import SectionEyebrow from "../../components/ui/SectionEyebrow";

type Audience = "individual" | "family" | "company";

function resolvePricingSelection(searchParams: URLSearchParams): { audience: Audience; signupRange: SignupRange } {
    const plan = searchParams.get("plan")?.trim().toUpperCase();
    if (plan) {
        if (plan.startsWith("FAMILY")) {
            return { audience: "family", signupRange: "0-100" };
        }

        for (const range of Object.keys(enterprisePlanCodes) as SignupRange[]) {
            const codes = enterprisePlanCodes[range];
            if (Object.values(codes).includes(plan)) {
                return { audience: "company", signupRange: range };
            }
        }

        if (individualPlans.some((p) => p.code === plan)) {
            return { audience: "individual", signupRange: "0-100" };
        }
    }

    const tab = searchParams.get("tab");
    return {
        audience: tab === "company" ? "company" : tab === "family" ? "family" : "individual",
        signupRange: "0-100",
    };
}


const PricingPage = () => {
    const [searchParams] = useSearchParams();
    const initialSelection = resolvePricingSelection(searchParams);
    const [audience, setAudience] = useState<Audience>(initialSelection.audience);
    const [signupRange, setSignupRange] = useState<SignupRange>(initialSelection.signupRange);
    const [affiliateDiscountRate, setAffiliateDiscountRate] = useState(getStoredAffiliateDiscountRate);
    const { selectedCurrency, setCurrency } = useCurrencyStore();
    const { data: launchDiscount } = useLaunchDiscount();
    const launchPct = launchDiscount?.active ? launchDiscount.percentage : 0;

    useEffect(() => {
        const selection = resolvePricingSelection(searchParams);
        setAudience(selection.audience);
        setSignupRange(selection.signupRange);
    }, [searchParams]);

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

    return (
        <main>
            <SEOHead title="Plans — Travel Medicine Advisory Global" description="Choose the right travel health plan for your needs. Individual, family, and company plans available." path="/pricing" />
            {/* Hero */}
            <AnimateIn
                as="section"
                className="flex flex-col items-center text-center pt-20 pb-12 px-6"
            >
                <SectionEyebrow className="mb-6">Pricing</SectionEyebrow>
                <h1 className="text-5xl md:text-6xl lg:text-7xl leading-[0.9] text-heading font-serif max-w-3xl">
                    Simple, <span className="italic">honest</span> pricing.
                </h1>
            </AnimateIn>

            {/* Controls row — audience tabs + currency toggle */}
            <div className="px-8 lg:px-16 max-w-6xl mx-auto mb-10">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    {/* Audience pill */}
                    <div className="inline-flex items-center bg-button-secondary rounded p-1 gap-1">
                        {(
                            ["individual", "family", "company"] as Audience[]
                        ).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setAudience(tab)}
                                className={`px-5 py-2 rounded text-sm font-medium transition-all duration-200 ${audience === tab ?
                                    "bg-white shadow-sm text-heading"
                                    : "text-muted hover:text-heading"
                                    }`}
                            >
                                {tab === "individual" ?
                                    "Individuals"
                                    : tab === "family" ?
                                        "Family"
                                        : "Company"}
                            </button>
                        ))}
                    </div>

                    {/* Currency toggle */}
                    <div className="inline-flex items-center bg-button-secondary rounded p-1 gap-1">
                        {(["NGN", "USD"] as const).map((cur) => (
                            <button
                                key={cur}
                                onClick={() => setCurrency(cur)}
                                className={`px-4 py-2 rounded text-sm font-medium transition-all duration-200 ${selectedCurrency === cur ?
                                    "bg-white shadow-sm text-heading"
                                    : "text-muted hover:text-heading"
                                    }`}
                            >
                                {cur === "USD" ? "$ USD" : "₦ NGN"}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Individual plans */}
            {audience === "individual" && (
                <section className="px-8 lg:px-16 pb-24 max-w-7xl mx-auto">
                    <StaggerGroup
                        className="grid grid-cols-1 md:grid-cols-3 max-w-5xl mx-auto items-stretch"
                        stagger={0.12}
                    >
                        {individualPlans.map((plan) => (
                            <IndividualPlanCard
                                key={plan.name}
                                plan={plan}
                                currency={selectedCurrency}
                                affiliatePct={affiliateDiscountRate}
                                launchPct={launchPct}
                            />
                        ))}
                    </StaggerGroup>
                </section>
            )}

            {/* Family plans */}
            {audience === "family" && (
                <section className="px-8 lg:px-16 pb-24 max-w-7xl mx-auto">
                    <StaggerGroup
                        className="max-w-md mx-auto"
                        stagger={0.12}
                    >
                        {familyPlans.map((plan) => (
                            <motion.div
                                variants={staggerItem}
                                key={plan.id}
                                className="relative p-8 flex flex-col justify-between overflow-hidden border border-accent/25"
                            >
                                <div
                                    className="absolute inset-0"
                                    style={{
                                        background:
                                            "linear-gradient(145deg, #eaf7f4 0%, #dff2ee 45%, #e6f5f1 100%)",
                                    }}
                                />
                                <div className="absolute top-0 left-0 w-full h-0.5 bg-accent" />
                                <span className="absolute top-6 right-6 text-xs font-semibold text-white bg-accent px-3 py-1 rounded-full">
                                    Best value
                                </span>
                                <div className="relative z-10">
                                    <h3 className="text-lg font-semibold mb-1 text-[#1a3c38]">
                                        {plan.name}
                                    </h3>
                                    <p className="text-sm mb-6 text-[#2a5858]/80">
                                        {plan.description}
                                    </p>
                                    <div className="flex items-baseline gap-1.5 mb-1">
                                        <span className="text-4xl font-serif text-[#1a5c52]">
                                            {formatPrice(
                                                plan.priceUsd,
                                                plan.priceNgn,
                                                selectedCurrency,
                                                affiliateDiscountRate,
                                                launchPct,
                                            )}
                                        </span>
                                    </div>

                                    <PriceDiscountBadge
                                        priceUsd={plan.priceUsd}
                                        priceNgn={plan.priceNgn}
                                        currency={selectedCurrency}
                                        affiliatePct={affiliateDiscountRate}
                                        launchPct={launchPct}
                                    />
                                    <p className="text-xs mb-8 text-[#2a5858]/60">
                                        {plan.priceNote}
                                    </p>
                                    <ul className="space-y-3 mb-8">
                                        {plan.features.map((f) => (
                                            <li
                                                key={f}
                                                className="flex items-start gap-3 text-sm text-[#1a3c38]"
                                            >
                                                <LucideCheck className="w-4 h-4 mt-0.5 shrink-0 text-accent" />
                                                {f}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <Button
                                    variant="primary"
                                    link={(() => {
                                        const referralCode = getAffiliateReferralCode();
                                        const base = `/family-checkout?plan=FAMILY_${plan.id}`;
                                        return referralCode ? `${base}&ref=${encodeURIComponent(referralCode)}` : base;
                                    })()}
                                    className="relative z-10 self-stretch bg-accent text-white! hover:bg-[#246858] text-center justify-center flex"
                                >
                                    {plan.cta}
                                </Button>
                            </motion.div>
                        ))}
                    </StaggerGroup>
                </section>
            )}

            {/* Company plans — matrix */}
            {audience === "company" && (
                <section className="px-8 lg:px-16 pb-16 max-w-7xl mx-auto">
                    {/* Signup-range selector */}
                    <div className="flex justify-center mb-10">
                        <div className="inline-flex items-center bg-button-secondary rounded-2xl p-1 gap-1">
                            {signupRanges.map((r) => (
                                <button
                                    key={r.value}
                                    onClick={() => setSignupRange(r.value)}
                                    className={`px-5 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${signupRange === r.value ?
                                        "bg-white shadow-sm text-heading"
                                        : "text-muted hover:text-heading"
                                        }`}
                                >
                                    {r.label}{" "}
                                    <span className="text-muted font-normal">
                                        signups
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Two enterprise cards */}
                    <StaggerGroup
                        className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto"
                        stagger={0.12}
                    >
                        {(["standard", "premium"] as ServiceLevel[]).map(
                            (level) => {
                                const tierName =
                                    enterpriseTiers[signupRange][level];
                                const colors =
                                    enterpriseTierColors[signupRange][level];
                                const features =
                                    level === "standard" ?
                                        individualPlanFeatures.standard
                                        : individualPlanFeatures.premium;
                                const basePlan = creditPlans.find(
                                    (p) => p.tier === level,
                                )!;

                                return (
                                    <motion.div
                                        variants={staggerItem}
                                        key={level}
                                        className={`relative p-8 flex flex-col justify-between overflow-hidden ${colors.border}`}
                                    >
                                        <div
                                            className="absolute inset-0"
                                            style={{
                                                background: colors.gradient,
                                            }}
                                        />
                                        <div
                                            className={`absolute top-0 left-0 w-1 h-full ${colors.sideAccent}`}
                                        />
                                        <span
                                            className={`absolute top-6 right-6 text-xs font-semibold ${colors.badgeBg} ${colors.badgeText} px-3 py-1 rounded-full`}
                                        >
                                            {level === "standard" ?
                                                "Most popular"
                                                : "Best report"}
                                        </span>
                                        <div className="relative z-10">
                                            <h3
                                                className={`text-lg font-semibold mb-0.5 ${colors.textPrimary}`}
                                            >
                                                {tierName}
                                            </h3>
                                            <p
                                                className={`text-xs mb-6 font-medium uppercase tracking-wide ${colors.textMuted}`}
                                            >
                                                {level === "standard" ?
                                                    "Standard service"
                                                    : "Premium service"}
                                            </p>
                                            <p
                                                className={`text-sm mb-6 ${colors.textSecondary}`}
                                            >
                                                {basePlan.description}
                                            </p>
                                            <div className="flex items-baseline gap-1.5 mb-1">
                                                <span
                                                    className={`text-4xl font-serif ${colors.textPrimary}`}
                                                >
                                                    {formatPrice(
                                                        basePlan.priceUsd,
                                                        basePlan.priceNgn,
                                                        selectedCurrency,
                                                        affiliateDiscountRate,
                                                        launchPct,
                                                    )}
                                                </span>
                                            </div>

                                            <PriceDiscountBadge
                                                priceUsd={basePlan.priceUsd}
                                                priceNgn={basePlan.priceNgn}
                                                currency={selectedCurrency}
                                                affiliatePct={affiliateDiscountRate}
                                                launchPct={launchPct}
                                                unit="per credit"
                                            />
                                            <p
                                                className={`text-xs mb-8 ${colors.textMuted}`}
                                            >
                                                per credit
                                            </p>
                                            <ul className="space-y-3 mb-8">
                                                {features.map((f) => (
                                                    <li
                                                        key={f}
                                                        className={`flex items-start gap-3 text-sm ${colors.textPrimary}`}
                                                    >
                                                        <LucideCheck
                                                            className={`w-4 h-4 mt-0.5 shrink-0 ${colors.checkColor}`}
                                                        />
                                                        {f}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                        <Button
                                            variant="primary"
                                            link={`/company-onboarding?plan=${enterprisePlanCodes[signupRange][level]}`}
                                            className={`relative z-10 self-stretch text-center justify-center flex ${level === "premium" ?
                                                "bg-gold text-white! hover:bg-[#b07a22]"
                                                : "bg-stone-900 text-white! hover:bg-stone-800"
                                                }`}
                                        >
                                            Get started
                                        </Button>
                                    </motion.div>
                                );
                            },
                        )}
                    </StaggerGroup>

                    {/* Premium extras callout */}
                    <AnimateIn className="mt-10 max-w-3xl mx-auto">
                        <div className="bg-[#fdf9f0] border border-gold/30 p-8">
                            <h3 className="text-xl font-serif text-heading mb-5">
                                Exclusive to Premium
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {premiumFeatures.map((feature) => (
                                    <div
                                        key={feature}
                                        className="flex items-start gap-3 text-sm text-heading"
                                    >
                                        <LucideCheck className="w-4 h-4 mt-0.5 text-amber-600 shrink-0" />
                                        {feature}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </AnimateIn>
                </section>
            )}

            {/* FAQ CTA — full questions moved to /faq */}
            <div className="bg-background-secondary">
                <section className="px-8 lg:px-16 py-20 max-w-3xl mx-auto text-center">
                    <AnimateIn>
                        <h2 className="text-2xl md:text-3xl text-heading leading-[1.1] font-serif mb-4">
                            Have pricing questions?
                        </h2>
                        <p className="text-sm text-body mb-8 max-w-lg mx-auto">
                            Credits, plan tiers, refunds, and more — all answered in one place.
                        </p>
                        <div className="flex items-center justify-center">

                            <Button
                                variant="secondary"
                                icon={<LucideArrowRight />}
                                link="/faq"
                            >
                                See our FAQ
                            </Button>
                        </div>
                    </AnimateIn>
                </section>
            </div>
        </main>
    );
};

export default PricingPage;
