import { useState, useEffect } from "react";
import { LucideCheck, LucideArrowRight, LucideTag } from "lucide-react";
import { motion } from "framer-motion";
import Button from "../ui/Button";
import AnimateIn from "../animations/AnimateIn";
import StaggerGroup, { staggerItem } from "../animations/StaggerGroup";
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
import { getStoredAffiliateDiscountRate, refreshAffiliateDiscount } from "../../lib/affiliateTracking";

type Audience = "individual" | "family" | "company";

function formatPrice(priceUsd: number, priceNgn: number, currency: string, discountRate = 0): string {
    if (priceUsd === 0) return "Free";
    const basePrice = currency === "NGN" ? priceNgn : priceUsd;
    const discountedPrice = discountRate > 0 ? basePrice * (1 - discountRate / 100) : basePrice;
    const displayPrice = currency === "NGN" ? Math.round(discountedPrice) : discountedPrice;
    if (currency === "NGN") return `₦${displayPrice.toLocaleString()}`;
    return `$${displayPrice.toLocaleString(undefined, {
        maximumFractionDigits: displayPrice % 1 === 0 ? 0 : 2,
        minimumFractionDigits: displayPrice % 1 === 0 ? 0 : 2,
    })}`;
}

const PricingSection = () => {
    const [audience, setAudience] = useState<Audience>("individual");
    const [signupRange, setSignupRange] = useState<SignupRange>("0-100");
    const { selectedCurrency, setCurrency } = useCurrencyStore();
    const [affiliateDiscountRate, setAffiliateDiscountRate] = useState(getStoredAffiliateDiscountRate);

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
        <div className="bg-background-secondary">
            <section className="px-8 lg:px-16 pt-24 pb-16 max-w-7xl mx-auto">
                <AnimateIn className="text-center mb-14">
                    <span className="inline-block text-sm text-muted bg-button-secondary font-semibold rounded-xl px-4 py-1.5 mb-6">
                        Pricing
                    </span>
                    <h2 className="text-4xl md:text-5xl lg:text-6xl text-heading leading-[1.1] font-serif">
                        Simple, <span className="italic">transparent</span> pricing.
                    </h2>
                    <p className="text-sm text-muted mt-4 max-w-md mx-auto leading-relaxed">
                        No hidden fees, no surprise charges. Whether you&apos;re traveling solo
                        or managing a team, pick the option that fits.
                    </p>
                </AnimateIn>

                {/* Controls row — audience tabs + currency toggle */}
                <AnimateIn className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-10">
                    {/* Audience pill */}
                    <div className="inline-flex items-center bg-button-secondary rounded-2xl p-1 gap-1">
                        {(["individual", "family", "company"] as Audience[]).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setAudience(tab)}
                                className={`px-5 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${audience === tab
                                    ? "bg-white shadow-sm text-heading"
                                    : "text-muted hover:text-heading"
                                    }`}
                            >
                                {tab === "individual" ? "Individuals" : tab === "family" ? "Family" : "Company"}
                            </button>
                        ))}
                    </div>

                    {/* Currency toggle */}
                    <div className="inline-flex items-center bg-button-secondary rounded-2xl p-1 gap-1">
                        {(["USD", "NGN"] as const).map((cur) => (
                            <button
                                key={cur}
                                onClick={() => setCurrency(cur)}
                                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${selectedCurrency === cur
                                    ? "bg-white shadow-sm text-heading"
                                    : "text-muted hover:text-heading"
                                    }`}
                            >
                                {cur === "USD" ? "$ USD" : "₦ NGN"}
                            </button>
                        ))}
                    </div>
                </AnimateIn>

                {affiliateDiscountRate > 0 && (
                    <div className="max-w-5xl mx-auto rounded-2xl border border-accent/20 bg-accent/10 px-5 py-3 text-sm font-semibold text-accent text-center mb-10">
                        Affiliate discount active — {affiliateDiscountRate}% off paid plans at checkout.
                    </div>
                )}

                {/* Individual plans */}
                {audience === "individual" && (
                    <StaggerGroup className="grid grid-cols-1 md:grid-cols-3 max-w-5xl mx-auto" stagger={0.12}>
                        {individualPlans.map((plan) => {
                            const isHighlighted = plan.highlighted;
                            const isPremium = plan.tier === "premium";
                            const isEssential = plan.tier === "essential";
                            return (
                                <motion.div
                                    variants={staggerItem}
                                    key={plan.name}
                                    className={`relative p-8 flex flex-col justify-between overflow-hidden ${isEssential
                                        ? "bg-white border border-stone-200"
                                        : isHighlighted
                                            ? "border border-[#2a7a6a]/25"
                                            : "border border-[#c4953a]/35"
                                        }`}
                                >
                                    {(isHighlighted || isPremium) && (
                                        <div
                                            className="absolute inset-0"
                                            style={{
                                                background: isHighlighted
                                                    ? "linear-gradient(145deg, #eaf7f4 0%, #dff2ee 45%, #e6f5f1 100%)"
                                                    : "linear-gradient(145deg, #fdf8f0 0%, #faf3e4 45%, #fdf7ee 100%)",
                                            }}
                                        />
                                    )}
                                    {isHighlighted && (
                                        <div className="absolute top-0 left-0 w-full h-0.5 bg-[#2a7a6a]" />
                                    )}
                                    {isHighlighted && (
                                        <span className="absolute top-6 right-6 text-xs font-semibold text-white bg-[#2a7a6a] px-3 py-1 rounded-full">
                                            Most popular
                                        </span>
                                    )}
                                    {isPremium && (
                                        <span className="absolute top-6 right-6 text-xs font-semibold text-[#9a7020] bg-[#c4953a]/15 px-3 py-1 rounded-full">
                                            Best report
                                        </span>
                                    )}
                                    <div className="relative z-10">
                                        <h3 className={`text-lg font-semibold mb-1 ${isHighlighted ? "text-[#1a3c38]" : "text-stone-800"
                                            }`}>
                                            {plan.name}
                                        </h3>
                                        <p className={`text-sm mb-6 ${isHighlighted ? "text-[#2a5858]/80" : "text-stone-500"
                                            }`}>
                                            {plan.description}
                                        </p>
                                        <div className="flex items-baseline gap-1.5 mb-1">
                                            <span className={`text-4xl font-serif ${isHighlighted ? "text-[#1a5c52]" : isPremium ? "text-[#9a7020]" : "text-stone-800"
                                                }`}>
                                                {formatPrice(plan.priceUsd, plan.priceNgn, selectedCurrency, affiliateDiscountRate)}
                                            </span>
                                        </div>

                                        {affiliateDiscountRate > 0 && (() => {
                                            const currencySymbol = selectedCurrency === "NGN" ? "₦" : "$";
                                            const basePrice = selectedCurrency === "NGN" ? plan.priceNgn : plan.priceUsd;
                                            const discountAmt = Math.round(basePrice * affiliateDiscountRate / 100);
                                            return (
                                                <div className="flex items-center gap-1.5 text-xs text-green-700 bg-green-50 rounded-lg px-2.5 py-1 w-fit mb-1">
                                                    <LucideTag className="w-3 h-3" />
                                                    <span className="font-medium">{affiliateDiscountRate}% off — <span className="line-through text-muted">{currencySymbol}{basePrice.toLocaleString()}</span> → {currencySymbol}{(basePrice - discountAmt).toLocaleString()}</span>
                                                </div>
                                            );
                                        })()}
                                        <p className={`text-xs mb-8 ${isHighlighted ? "text-[#2a5858]/60" : "text-stone-400"
                                            }`}>
                                            {plan.priceNote}
                                        </p>
                                        <ul className="space-y-3 mb-8">
                                            {plan.features.map((f) => (
                                                <li
                                                    key={f}
                                                    className={`flex items-start gap-3 text-sm ${isHighlighted ? "text-[#1a3c38]" : "text-stone-700"
                                                        }`}
                                                >
                                                    <LucideCheck className={`w-4 h-4 mt-0.5 shrink-0 ${isEssential ? "text-emerald-600" : isPremium ? "text-[#c4953a]" : "text-[#2a7a6a]"
                                                        }`} />
                                                    {f}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    {isHighlighted ? (
                                        <Button
                                            variant="primary"
                                            link={`/register?plan=${plan.code}`}
                                            className="relative z-10 self-stretch bg-[#2a7a6a] text-white! hover:bg-[#246858] text-center justify-center flex"
                                        >
                                            {plan.cta}
                                        </Button>
                                    ) : isPremium ? (
                                        <Button
                                            variant="secondary"
                                            icon={<LucideArrowRight />}
                                            link={`/register?plan=${plan.code}`}
                                            className="relative z-10 self-start border-[#c4953a]/60 text-[#9a7020] hover:bg-[#c4953a]/10"
                                        >
                                            {plan.cta}
                                        </Button>
                                    ) : (
                                        <Button
                                            variant="secondary"
                                            icon={<LucideArrowRight />}
                                            link={`/register?plan=${plan.code}`}
                                            className="relative z-10 self-start"
                                        >
                                            {plan.cta}
                                        </Button>
                                    )}
                                </motion.div>
                            );
                        })}
                    </StaggerGroup>
                )}

                {/* Family plans */}
                {audience === "family" && (
                    <StaggerGroup className="max-w-md mx-auto" stagger={0.12}>
                        {familyPlans.map((plan) => (
                            <motion.div
                                variants={staggerItem}
                                key={plan.id}
                                className="relative p-8 flex flex-col justify-between overflow-hidden border border-[#2a7a6a]/25"
                            >
                                <div
                                    className="absolute inset-0"
                                    style={{
                                        background: "linear-gradient(145deg, #eaf7f4 0%, #dff2ee 45%, #e6f5f1 100%)",
                                    }}
                                />
                                <div className="absolute top-0 left-0 w-full h-1 bg-[#2a7a6a]" />
                                <span className="absolute top-6 right-6 text-xs font-semibold text-white bg-[#2a7a6a] px-3 py-1 rounded-full">
                                    Best value
                                </span>
                                <div className="relative z-10">
                                    <h3 className="text-xl font-semibold mb-2 text-[#1a3c38]">
                                        {plan.name}
                                    </h3>
                                    <p className="text-sm mb-6 text-[#2a5858]/80">
                                        {plan.description}
                                    </p>
                                    <div className="flex items-baseline gap-1.5 mb-1">
                                        <span className="text-4xl font-serif text-[#1a5c52]">
                                            {formatPrice(plan.priceUsd, plan.priceNgn, selectedCurrency, affiliateDiscountRate)}
                                        </span>
                                    </div>

                                    {affiliateDiscountRate > 0 && (() => {
                                        const currencySymbol = selectedCurrency === "NGN" ? "₦" : "$";
                                        const basePrice = selectedCurrency === "NGN" ? plan.priceNgn : plan.priceUsd;
                                        const discountAmt = Math.round(basePrice * affiliateDiscountRate / 100);
                                        return (
                                            <div className="flex items-center gap-1.5 text-xs text-green-700 bg-green-50 rounded-lg px-2.5 py-1 w-fit mb-1">
                                                <LucideTag className="w-3 h-3" />
                                                <span className="font-medium">{affiliateDiscountRate}% off — <span className="line-through text-muted">{currencySymbol}{basePrice.toLocaleString()}</span> → {currencySymbol}{(basePrice - discountAmt).toLocaleString()}</span>
                                            </div>
                                        );
                                    })()}
                                    <p className="text-xs mb-8 text-[#2a5858]/60">
                                        {plan.priceNote}
                                    </p>
                                    <ul className="space-y-3 mb-8">
                                        {plan.features.map((f) => (
                                            <li
                                                key={f}
                                                className="flex items-start gap-3 text-sm text-[#1a3c38]"
                                            >
                                                <LucideCheck className="w-4 h-4 mt-0.5 shrink-0 text-[#2a7a6a]" />
                                                {f}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <Button
                                    variant="primary"
                                    link={`/family-checkout?plan=FAMILY_${plan.id}`}
                                    className="relative z-10 self-stretch text-center justify-center flex bg-[#2a7a6a] text-white! hover:bg-[#246858]"
                                >
                                    {plan.cta}
                                </Button>
                            </motion.div>
                        ))}
                    </StaggerGroup>
                )}

                {/* Company plans — matrix */}
                {audience === "company" && (
                    <div>
                        {/* Signup-range selector */}
                        <div className="flex justify-center mb-10">
                            <div className="inline-flex items-center bg-button-secondary rounded-2xl p-1 gap-1">
                                {signupRanges.map((r) => (
                                    <button
                                        key={r.value}
                                        onClick={() => setSignupRange(r.value)}
                                        className={`px-5 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${signupRange === r.value
                                            ? "bg-white shadow-sm text-heading"
                                            : "text-muted hover:text-heading"
                                            }`}
                                    >
                                        {r.label} <span className="text-muted font-normal">signups</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Two enterprise cards */}
                        <StaggerGroup className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto" stagger={0.12}>
                            {(["standard", "premium"] as ServiceLevel[]).map((level) => {
                                const tierName = enterpriseTiers[signupRange][level];
                                const colors = enterpriseTierColors[signupRange][level];
                                const features = level === "standard"
                                    ? individualPlanFeatures.standard
                                    : individualPlanFeatures.premium;
                                const basePlan = creditPlans.find((p) => p.tier === level)!;

                                return (
                                    <motion.div
                                        variants={staggerItem}
                                        key={level}
                                        className={`relative p-8 flex flex-col justify-between overflow-hidden ${colors.border}`}
                                    >
                                        <div
                                            className="absolute inset-0"
                                            style={{ background: colors.gradient }}
                                        />
                                        <div
                                            className={`absolute top-0 left-0 w-1 h-full ${colors.sideAccent}`}
                                        />
                                        <span className={`absolute top-6 right-6 text-xs font-semibold ${colors.badgeBg} ${colors.badgeText} px-3 py-1 rounded-full`}>
                                            {level === "standard" ? "Most popular" : "Best report"}
                                        </span>
                                        <div className="relative z-10">
                                            <h3 className={`text-lg font-semibold mb-0.5 ${colors.textPrimary}`}>
                                                {tierName}
                                            </h3>
                                            <p className={`text-xs mb-6 font-medium uppercase tracking-wide ${colors.textMuted}`}>
                                                {level === "standard" ? "Standard service" : "Premium service"}
                                            </p>
                                            <p className={`text-sm mb-6 ${colors.textSecondary}`}>
                                                {basePlan.description}
                                            </p>
                                            <div className="flex items-baseline gap-1.5 mb-1">
                                                <span className={`text-4xl font-serif ${colors.textPrimary}`}>
                                                    {formatPrice(basePlan.priceUsd, basePlan.priceNgn, selectedCurrency, affiliateDiscountRate)}
                                                </span>
                                            </div>

                                            {affiliateDiscountRate > 0 && (() => {
                                                const currencySymbol = selectedCurrency === "NGN" ? "₦" : "$";
                                                const basePrice = selectedCurrency === "NGN" ? basePlan.priceNgn : basePlan.priceUsd;
                                                const discountAmt = Math.round(basePrice * affiliateDiscountRate / 100);
                                                return (
                                                    <div className="flex items-center gap-1.5 text-xs text-green-700 bg-green-50 rounded-lg px-2.5 py-1 w-fit mb-1">
                                                        <LucideTag className="w-3 h-3" />
                                                        <span className="font-medium">{affiliateDiscountRate}% off — <span className="line-through text-muted">{currencySymbol}{basePrice.toLocaleString()}</span> → {currencySymbol}{(basePrice - discountAmt).toLocaleString()} per credit</span>
                                                    </div>
                                                );
                                            })()}
                                            <p className={`text-xs mb-8 ${colors.textMuted}`}>
                                                per credit
                                            </p>
                                            <ul className="space-y-3 mb-8">
                                                {features.map((f) => (
                                                    <li
                                                        key={f}
                                                        className={`flex items-start gap-3 text-sm ${colors.textPrimary}`}
                                                    >
                                                        <LucideCheck className={`w-4 h-4 mt-0.5 shrink-0 ${colors.checkColor}`} />
                                                        {f}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                        <Button
                                            variant="primary"
                                            link={`/company-onboarding?plan=${enterprisePlanCodes[signupRange][level]}`}
                                            className={`relative z-10 self-stretch text-center justify-center flex ${level === "premium"
                                                ? "bg-[#c4953a] text-white! hover:bg-[#b07a22]"
                                                : "bg-stone-900 text-white! hover:bg-stone-800"
                                                }`}
                                        >
                                            Get started
                                        </Button>
                                    </motion.div>
                                );
                            })}
                        </StaggerGroup>

                        {/* Premium extras callout */}
                        <AnimateIn className="mt-10 max-w-3xl mx-auto">
                            <div className="bg-[#fdf9f0] border border-[#c4953a]/30 p-8">
                                <h3 className="text-xl font-serif text-heading mb-5">Exclusive to Premium</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {premiumFeatures.map((feature) => (
                                        <div key={feature} className="flex items-start gap-3 text-sm text-heading">
                                            <LucideCheck className="w-4 h-4 mt-0.5 text-amber-600 shrink-0" />
                                            {feature}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </AnimateIn>
                    </div>
                )}
            </section>
        </div>
    );
};

export default PricingSection;
