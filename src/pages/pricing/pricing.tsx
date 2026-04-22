import { useState } from "react";
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
    type SignupRange,
    type ServiceLevel,
} from "../../constants/companyPlans";

type Audience = "individual" | "company";

function formatPrice(priceUsd: number, priceNgn: number, currency: string): string {
    if (priceUsd === 0) return "Free";
    if (currency === "NGN") return `₦${priceNgn.toLocaleString()}`;
    return `$${priceUsd}`;
}

const PricingPage = () => {
    const [audience, setAudience] = useState<Audience>("individual");
    const [signupRange, setSignupRange] = useState<SignupRange>("0-100");
    const { selectedCurrency, setCurrency } = useCurrencyStore();

    return (
        <main>
            {/* Hero */}
            <AnimateIn as="section" className="flex flex-col items-center text-center pt-20 pb-12 px-6">
                <span className="inline-block text-sm text-muted bg-button-secondary font-semibold rounded-xl px-4 py-1.5 mb-6">
                    Pricing
                </span>
                <h1 className="text-5xl md:text-6xl lg:text-7xl leading-[0.9] text-heading font-serif max-w-3xl">
                    Simple, <span className="italic">honest</span> pricing.
                </h1>
                <p className="sm:text-lg text-body mt-6 max-w-xl leading-relaxed">
                    Whether you&apos;re planning a single trip or managing travel for an entire company,
                    we&apos;ve got a plan for you.
                </p>
            </AnimateIn>

            {/* Controls row — audience tabs + currency toggle */}
            <div className="px-8 lg:px-16 max-w-7xl mx-auto mb-10">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    {/* Audience pill */}
                    <div className="inline-flex items-center bg-button-secondary rounded-2xl p-1 gap-1">
                        {(["individual", "company"] as Audience[]).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setAudience(tab)}
                                className={`px-5 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${audience === tab
                                    ? "bg-white shadow-sm text-heading"
                                    : "text-muted hover:text-heading"
                                    }`}
                            >
                                {tab === "individual" ? "Individuals" : "Company"}
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
                </div>
            </div>

            {/* Individual plans */}
            {audience === "individual" && (
                <section className="px-8 lg:px-16 pb-24 max-w-7xl mx-auto">
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
                                            ? "border border-accent/25"
                                            : "border border-gold/35"
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
                                        <div className="absolute top-0 left-0 w-full h-0.5 bg-accent" />
                                    )}
                                    {isHighlighted && (
                                        <span className="absolute top-6 right-6 text-xs font-semibold text-white bg-accent px-3 py-1 rounded-full">
                                            Most popular
                                        </span>
                                    )}
                                    {isPremium && (
                                        <span className="absolute top-6 right-6 text-xs font-semibold text-[#9a7020] bg-gold/15 px-3 py-1 rounded-full">
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
                                                {formatPrice(plan.priceUsd, plan.priceNgn, selectedCurrency)}
                                            </span>
                                        </div>
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
                                                    <LucideCheck className={`w-4 h-4 mt-0.5 shrink-0 ${isEssential ? "text-emerald-600" : isPremium ? "text-gold" : "text-accent"
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
                                            className="relative z-10 self-stretch bg-accent text-white! hover:bg-[#246858] text-center justify-center flex"
                                        >
                                            {plan.cta}
                                        </Button>
                                    ) : isPremium ? (
                                        <Button
                                            variant="secondary"
                                            icon={<LucideArrowRight />}
                                            link={`/register?plan=${plan.code}`}
                                            className="relative z-10 self-start border-gold/60 text-[#9a7020] hover:bg-gold/10"
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
                                                {formatPrice(basePlan.priceUsd, basePlan.priceNgn, selectedCurrency)}
                                            </span>
                                        </div>
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
                                            ? "bg-gold text-white! hover:bg-[#b07a22]"
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
                        <div className="bg-[#fdf9f0] border border-gold/30 p-8">
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
                </section>
            )}

            {/* FAQ section */}
            <div className="bg-background-secondary">
                <section className="px-8 lg:px-16 py-24 max-w-5xl mx-auto">
                    <AnimateIn>
                        <h2 className="text-3xl md:text-4xl text-heading leading-[1.1] font-serif mb-10 text-center">
                            Common questions about pricing.
                        </h2>
                    </AnimateIn>
                    <StaggerGroup className="grid grid-cols-1 md:grid-cols-2 gap-6" stagger={0.1}>
                        {[
                            {
                                q: "How do credits work?",
                                a: "One credit generates one complete travel health plan for one trip. Individual users can buy credits directly. Company plans include signup credits that are distributed to employees.",
                            },
                            {
                                q: "Can I buy more credits later?",
                                a: "Yes. Individual users can purchase credits anytime. Company admins can top up credits or request additional allocations from their dashboard.",
                            },
                            {
                                q: "What's the difference between Standard and Premium?",
                                a: "Standard generates a fully personalised travel health report covering vaccines, medications, risks, and emergency contacts. Premium adds a Pre-Travel Checklist, Medication Packing List, and a Doctor-Ready Clinical Summary Letter for your GP.",
                            },
                            {
                                q: "Can I upgrade my company plan?",
                                a: "Yes. Contact our sales team and we'll migrate your account to a higher tier. Any unused credits transfer over.",
                            },
                            {
                                q: "Do credits expire?",
                                a: "Never. Your credits stay in your account until you use them, whether that's next week or next year.",
                            },
                            {
                                q: "Is there a free tier?",
                                a: "Yes. Every new account receives 1 free Essential credit — a destination health education report with no personal data required. Upgrade to Standard or Premium for a fully personalised plan.",
                            },
                        ].map((item) => (
                            <motion.div variants={staggerItem} key={item.q} className="bg-background-primary rounded-2xl p-6">
                                <h4 className="text-sm font-semibold text-heading mb-2">
                                    {item.q}
                                </h4>
                                <p className="text-sm text-body leading-relaxed">
                                    {item.a}
                                </p>
                            </motion.div>
                        ))}
                    </StaggerGroup>
                    <div className="text-center mt-10">
                        <Button variant="secondary" icon={<LucideArrowRight />} link="/faq">
                            View all FAQs
                        </Button>
                    </div>
                </section>
            </div>
        </main>
    );
};

export default PricingPage;
