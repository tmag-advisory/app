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
    familyPlans,
    seatPackages,
    seatPricePerSeat,
    INCLUDED_PLANS_PER_SEAT,
} from "../../constants/companyPlans";
import { getAffiliateReferralCode, getStoredAffiliateDiscountRate, refreshAffiliateDiscount } from "../../lib/affiliateTracking";
import SEOHead from "../../lib/seo";
import PriceDiscountBadge from "../../components/pricing/PriceDiscountBadge";
import IndividualPlanCard from "../../components/pricing/IndividualPlanCard";
import SeatPlanCard from "../../components/pricing/SeatPlanCard";
import { formatStackedPrice as formatPrice, formatCurrencyAmount } from "../../lib/launchDiscount";
import SectionEyebrow from "../../components/ui/SectionEyebrow";

type Audience = "individual" | "family" | "company";

// Seat tiers mirror the backend OrganizationSeatPricingService ($99/$89/$79/$69 per seat/year).
function resolvePricingSelection(searchParams: URLSearchParams): { audience: Audience } {
    const plan = searchParams.get("plan")?.trim().toUpperCase();
    if (plan) {
        if (plan.startsWith("FAMILY")) {
            return { audience: "family" };
        }
        if (plan.startsWith("ENTERPRISE") || plan.startsWith("SEAT") || plan.startsWith("COMPANY")) {
            return { audience: "company" };
        }
        if (individualPlans.some((p) => p.code === plan)) {
            return { audience: "individual" };
        }
    }

    const tab = searchParams.get("tab");
    return {
        audience: tab === "company" ? "company" : tab === "family" ? "family" : "individual",
    };
}


const PricingPage = () => {
    const [searchParams] = useSearchParams();
    const initialSelection = resolvePricingSelection(searchParams);
    const [audience, setAudience] = useState<Audience>(initialSelection.audience);
    const [affiliateDiscountRate, setAffiliateDiscountRate] = useState(getStoredAffiliateDiscountRate);
    const { selectedCurrency, setCurrency } = useCurrencyStore();
    const launchPct = 0;

    useEffect(() => {
        const selection = resolvePricingSelection(searchParams);
        setAudience(selection.audience);
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
            <SEOHead title="Plans — Travel Medicine Advisory Global" description="Choose the right travel health plan for your needs. Individual, family, and organization plans available." path="/pricing" />
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
                                        : "Organization"}
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

            {/* Soft launch banner */}
            <div className="px-8 lg:px-16 max-w-5xl mx-auto mb-10">
                <div className="relative isolate overflow-hidden rounded-2xl bg-linear-to-r from-emerald-500 via-emerald-600 to-amber-500 px-5 py-4 text-white sm:px-7">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                            <span className="text-xl" aria-hidden="true">🎉</span>
                            <p className="text-sm sm:text-base font-semibold tracking-wide">
                                Soft Launch Now Live
                            </p>
                        </div>
                        <p className="text-sm sm:text-base font-medium text-emerald-50">
                            From July 1–31, selected users can unlock complimentary access to Standard and Premium plans using an exclusive promo code.
                        </p>
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

            {/* Company plans — seat packages (mirrors individual card chrome) */}
            {audience === "company" && (
                <section className="px-8 lg:px-16 pb-24 max-w-7xl mx-auto">
                    <AnimateIn className="text-center mb-8">
                        <p className="text-sm text-body max-w-xl mx-auto leading-relaxed">
                            Buy one seat per traveller, billed annually. Every seat includes{" "}
                            <strong>{INCLUDED_PLANS_PER_SEAT} travel plans per year</strong>. Pick a starting
                            size your per-seat rate drops automatically as you scale.
                        </p>
                    </AnimateIn>

                    <StaggerGroup
                        className="grid grid-cols-1 md:grid-cols-3 max-w-5xl mx-auto items-stretch"
                        stagger={0.12}
                    >
                        {seatPackages.map((seats, i) => (
                            <SeatPlanCard
                                key={seats}
                                seats={seats}
                                currency={selectedCurrency}
                                variant={(["essential", "standard", "premium"] as const)[i] ?? "standard"}
                            />
                        ))}
                    </StaggerGroup>

                    {/* Custom size */}
                    <AnimateIn delay={0.1} className="mt-6 max-w-5xl mx-auto">
                        <div className="rounded-2xl border border-border-light bg-button-secondary/40 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h3 className="text-base font-semibold text-heading">Need a different team size?</h3>
                                <p className="text-sm text-muted mt-1">
                                    Enter any number of seats from{" "}
                                    {formatCurrencyAmount(seatPricePerSeat(500, selectedCurrency), selectedCurrency)}/seat at 500+.
                                    Every seat still includes {INCLUDED_PLANS_PER_SEAT} plans a year.
                                </p>
                            </div>
                            <Button variant="primary" link="/company-onboarding" icon={<LucideArrowRight />} className="shrink-0">
                                Choose seats
                            </Button>
                        </div>
                    </AnimateIn>

                    <p className="text-center text-xs text-muted mt-6">
                        You'll confirm seats, currency and total at checkout.{" "}
                        <a href="/for-companies" className="text-accent font-medium hover:underline">Learn how it works →</a>
                    </p>
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
