import {
    LucideShieldCheck,
    LucideUsers,
    LucideBarChart3,
    LucideArrowRight,
    LucideCheck,
    LucideFileText,
    LucidePlug,
} from "lucide-react";
import { motion } from "framer-motion";
import Button from "../../components/ui/Button";
import AnimateIn from "../../components/animations/AnimateIn";
import StaggerGroup, { staggerItem } from "../../components/animations/StaggerGroup";
import { useCurrencyStore } from "../../stores/currencyStore";
import {
    creditPlans,
    enterprisePlanCodes,
    enterpriseTierColors,
    enterpriseTiers,
    individualPlanFeatures,
    premiumFeatures,
    signupRanges,
    type ServiceLevel,
    type SignupRange,
} from "../../constants/companyPlans";
import SEOHead from "../../lib/seo";
import { useLaunchDiscount } from "../../api";
import { applyLaunchToBase } from "../../lib/launchDiscount";
import LaunchDiscountBanner from "../../components/sections/LaunchDiscountBanner";

function formatPrice(priceUsd: number, priceNgn: number, currency: string, launchPct = 0): string {
    if (priceUsd === 0 && currency !== "NGN") return "Free";
    if (priceNgn === 0 && currency === "NGN") return "Free";
    const base = currency === "NGN" ? priceNgn : priceUsd;
    const discounted = launchPct > 0 ? applyLaunchToBase(base, launchPct) : base;
    return currency === "NGN" ? `₦${discounted.toLocaleString()}` : `$${discounted.toLocaleString()}`;
}

const workflowSteps = [
    {
        icon: <LucideUsers className="w-5 h-5" />,
        title: "Add travelers",
        description:
            "Upload your employee roster or add travelers individually. Set destinations, dates, and any known health requirements.",
    },
    {
        icon: <LucideFileText className="w-5 h-5" />,
        title: "Generate plans in bulk",
        description:
            "One click generates personalized health plans for every traveler. Each plan is tailored to their profile and destination.",
    },
    {
        icon: <LucideBarChart3 className="w-5 h-5" />,
        title: "Track compliance",
        description:
            "Your dashboard shows who has received their plan, who's reviewed it, and where gaps exist giving HR full visibility.",
    },
    {
        icon: <LucideShieldCheck className="w-5 h-5" />,
        title: "Export reports",
        description:
            "Download duty-of-care documentation and risk reports per trip, per employee, or per destination for your compliance records.",
    },
];

const features = [
    "Centralized traveler health dashboard",
    "Bulk plan generation (CSV upload)",
    "Per-employee and per-destination risk reports",
    "Duty-of-care audit trail",
    "Credit allocation across departments",
    "Role-based access (HR, travel managers, admins)",
    ...premiumFeatures,
];

const ForCompanies = () => {
    const { selectedCurrency } = useCurrencyStore();
    const { data: launchDiscount } = useLaunchDiscount();
    const launchPct = launchDiscount?.active ? launchDiscount.percentage : 0;

    return (
        <main>
 <SEOHead title="For Companies — Travel Medicine Advisory Global" description="Protect your employees with corporate travel health plans. HR dashboard, compliance reporting, and bulk plan management." path="/for-companies" />
            {/* Hero */}
            <AnimateIn as="section" className="flex flex-col items-center text-center pt-20 pb-12 px-6">
                <span className="inline-block text-sm text-muted bg-button-secondary font-semibold rounded-xl px-4 py-1.5 mb-6">
                    For companies
                </span>
                <h1 className="text-5xl md:text-6xl lg:text-7xl leading-[0.9] text-heading font-serif max-w-4xl">
                    Protect your people.{" "}
                    <span className="italic">Prove</span> it.
                </h1>
                <p className="sm:text-lg text-body mt-6 max-w-xl leading-relaxed">
                    Travel health compliance shouldn't take weeks. Generate
                    personalized health plans for your entire team in minutes.
                </p>
                <div className="flex items-center gap-4 mt-8 flex-wrap justify-center">
                    <Button variant="primary" link="/company-onboarding">Get started</Button>
                    <Button variant="secondary" icon={<LucideArrowRight />} link="/pricing">
                        View pricing
                    </Button>
                </div>
            </AnimateIn>

            {/* Social proof bar */}
            <section className="px-8 lg:px-16 pb-16 max-w-5xl mx-auto">
                <StaggerGroup className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                        { value: "500+", label: "Companies onboarded" },
                        { value: "98%", label: "Compliance rate achieved" },
                        { value: "< 2 min", label: "Average plan generation" },
                    ].map((stat) => (
                        <motion.div
                            variants={staggerItem}
                            key={stat.label}
                            className="bg-button-secondary rounded-2xl py-6 px-4 text-center"
                        >
                            <span className="text-3xl font-serif text-heading block mb-1">
                                {stat.value}
                            </span>
                            <span className="text-xs text-muted">
                                {stat.label}
                            </span>
                        </motion.div>
                    ))}
                </StaggerGroup>
            </section>

            {/* Company plans */}
            <section className="px-8 lg:px-16 pb-20 max-w-7xl mx-auto">
                <AnimateIn className="text-center mb-12">
                    <span className="inline-block text-sm text-muted bg-button-secondary font-semibold rounded-xl px-4 py-1.5 mb-6">
                        Company plans
                    </span>
                    <h2 className="text-4xl md:text-5xl text-heading leading-[1.1] font-serif">
                        Enterprise tiers matched to your <span className="italic">team size</span>.
                    </h2>
                </AnimateIn>

                <LaunchDiscountBanner variant="page" className="max-w-5xl mx-auto mb-8" />
                <div className="space-y-12 max-w-5xl mx-auto">
                    {signupRanges.map((range) => (
                        <div key={range.value}>
                            <h3 className="text-sm font-semibold text-muted text-center mb-5">
                                {range.label} signups
                            </h3>
                            <StaggerGroup className="grid grid-cols-1 md:grid-cols-2 gap-6" stagger={0.12}>
                                {(["standard", "premium"] as ServiceLevel[]).map((level) => {
                                    const colors = enterpriseTierColors[range.value as SignupRange][level];
                                    const basePlan = creditPlans.find((p) => p.tier === level)!;
                                    const features = level === "standard" ? individualPlanFeatures.standard : individualPlanFeatures.premium;

                                    return (
                                        <motion.div
                                            variants={staggerItem}
                                            key={`${range.value}-${level}`}
                                            className={`relative p-6 border flex flex-col overflow-hidden ${colors.border}`}
                                        >
                                            <div className="absolute inset-0" style={{ background: colors.gradient }} />
                                            <div className={`absolute top-0 left-0 w-1 h-full ${colors.sideAccent}`} />
                                            <span className={`absolute top-6 right-6 text-xs font-semibold ${colors.badgeBg} ${colors.badgeText} px-3 py-1 rounded-full`}>
                                                {level === "standard" ? "Most popular" : "Best report"}
                                            </span>
                                            <div className="relative z-10 flex flex-col flex-1">
                                                <h3 className={`text-xl font-serif mb-1 ${colors.textPrimary}`}>
                                                    {enterpriseTiers[range.value as SignupRange][level]}
                                                </h3>
                                                <p className={`text-xs mb-4 ${colors.textSecondary}`}>
                                                    {basePlan.description}
                                                </p>
                                                <div className="flex items-baseline gap-1.5 mb-1">
                                                    <p className={`text-3xl font-serif ${colors.textPrimary}`}>
                                                        {formatPrice(basePlan.priceUsd, basePlan.priceNgn, selectedCurrency, launchPct)}
                                                    </p>
                                                    {launchPct > 0 && (() => {
                                                        const base = selectedCurrency === "NGN" ? basePlan.priceNgn : basePlan.priceUsd;
                                                        if (base === 0) return null;
                                                        const symbol = selectedCurrency === "NGN" ? "₦" : "$";
                                                        return (
                                                            <span className="ml-2 text-sm">
                                                                <span className="line-through text-muted">
                                                                    {symbol}{base.toLocaleString()}
                                                                </span>
                                                            </span>
                                                        );
                                                    })()}
                                                </div>
                                                <span className={`text-xs mb-5 ${colors.textMuted}`}>per credit</span>
                                                <ul className="space-y-2.5 flex-1">
                                                    {features.map((f) => (
                                                        <li key={f} className={`flex items-start gap-2 text-xs ${colors.textPrimary}`}>
                                                            <LucideCheck className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${colors.checkColor}`} />
                                                            {f}
                                                        </li>
                                                    ))}
                                                </ul>
                                                <Button
                                                    variant="primary"
                                                    link={`/company-onboarding?plan=${enterprisePlanCodes[range.value as SignupRange][level]}`}
                                                    className={`mt-6 text-center justify-center flex ${level === "premium" ? "bg-gold text-white! hover:bg-[#b07a22]" : "bg-stone-900 text-white! hover:bg-stone-800"}`}
                                                >
                                                    Get started
                                                </Button>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </StaggerGroup>
                        </div>
                    ))}
                </div>
            </section>

            {/* HR workflow */}
            <div className="bg-background-secondary">
                <section className="px-8 lg:px-16 py-24 max-w-7xl mx-auto">
                    <AnimateIn className="text-center mb-14">
                        <span className="inline-block text-sm text-muted bg-button-secondary font-semibold rounded-xl px-4 py-1.5 mb-6">
                            How it works for HR
                        </span>
                        <h2 className="text-4xl md:text-5xl text-heading leading-[1.1] font-serif">
                            Four steps to full{" "}
                            <span className="italic">compliance.</span>
                        </h2>
                    </AnimateIn>
                    <StaggerGroup stagger={0.1} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {workflowSteps.map((step) => (
                            <motion.div
                                variants={staggerItem}
                                key={step.title}
                                className="bg-background-primary rounded-2xl p-6 flex flex-col gap-4"
                            >
                                <div className="w-10 h-10 rounded-xl bg-dark text-background-primary flex items-center justify-center">
                                    {step.icon}
                                </div>
                                <h3 className="text-base font-semibold text-heading">
                                    {step.title}
                                </h3>
                                <p className="text-sm text-body leading-relaxed">
                                    {step.description}
                                </p>
                            </motion.div>
                        ))}
                    </StaggerGroup>
                </section>
            </div>

            {/* Credit allocation */}
            <div className="bg-background-secondary">
                <section className="px-8 lg:px-16 py-24 max-w-7xl mx-auto">
                    <AnimateIn className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-14">
                        <div>
                            <span className="inline-block text-sm text-muted bg-button-secondary font-semibold rounded-xl px-4 py-1.5 mb-6">
                                Credit allocation
                            </span>
                            <h2 className="text-4xl md:text-5xl text-heading leading-[1.1] font-serif max-w-lg">
                                Allocate credits across{" "}
                                <span className="italic">teams.</span>
                            </h2>
                        </div>
                        <p className="text-sm text-muted leading-relaxed max-w-sm md:mt-10 font-medium">
                            Purchase credits centrally and distribute them across
                            departments, offices, or individual travelers.
                            Admins control the budget managers use the credits.
                        </p>
                    </AnimateIn>
                    <AnimateIn delay={0.15} className="bg-background-primary rounded-2xl p-8">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-4">
                            {features.map((f) => (
                                <div key={f} className="flex items-start gap-3 py-2">
                                    <LucideCheck className="w-4 h-4 mt-0.5 text-accent shrink-0" />
                                    <span className="text-sm text-heading">
                                        {f}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </AnimateIn>
                </section>
            </div>

            {/* Integration */}
            <section className="px-8 lg:px-16 py-24 max-w-7xl mx-auto">
                <AnimateIn className="text-center mb-14">
                    <span className="inline-block text-sm text-muted bg-button-secondary font-semibold rounded-xl px-4 py-1.5 mb-6">
                        Integrations
                    </span>
                    <h2 className="text-4xl md:text-5xl text-heading leading-[1.1] font-serif">
                        Fits into your{" "}
                        <span className="italic">existing</span> stack.
                    </h2>
                </AnimateIn>
                <StaggerGroup stagger={0.12} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        {
                            icon: <LucidePlug className="w-5 h-5" />,
                            title: "REST API",
                            desc: "Trigger plan generation from your travel booking platform or HRIS with a simple API call.",
                        },
                        {
                            icon: <LucideFileText className="w-5 h-5" />,
                            title: "CSV & bulk upload",
                            desc: "Upload a spreadsheet of travelers and destinations. Plans are generated and delivered automatically.",
                        },
                        {
                            icon: <LucideBarChart3 className="w-5 h-5" />,
                            title: "Reporting webhooks",
                            desc: "Get notified when plans are generated, delivered, and reviewed. Pipe events to your BI tools.",
                        },
                    ].map((item) => (
                        <motion.div
                            variants={staggerItem}
                            key={item.title}
                            className="bg-button-secondary rounded-2xl p-8 flex flex-col gap-4"
                        >
                            <div className="w-10 h-10 rounded-xl bg-dark text-background-primary flex items-center justify-center">
                                {item.icon}
                            </div>
                            <h3 className="text-base font-semibold text-heading">
                                {item.title}
                            </h3>
                            <p className="text-sm text-body leading-relaxed">
                                {item.desc}
                            </p>
                        </motion.div>
                    ))}
                </StaggerGroup>
            </section>

            {/* Demo CTA */}
            <section className="px-8 lg:px-16 pt-8 pb-24 max-w-7xl mx-auto">
                <div className="relative rounded-3xl overflow-hidden px-8 py-20 md:py-24 text-center">
                    <div
                        className="absolute inset-0"
                        style={{
                            background:
                                "linear-gradient(135deg, #2a7a6a 0%, #1a6a7a 30%, #187080 55%, #1a6878 80%, #246858 100%)",
                        }}
                    />
                    <div
                        className="absolute top-[-30%] left-1/2 -translate-x-1/2 w-80 h-80 rounded-full"
                        style={{
                            background:
                                "radial-gradient(circle, rgba(240,160,96,0.6) 0%, rgba(232,120,80,0.2) 40%, transparent 70%)",
                            filter: "blur(50px)",
                        }}
                    />
                    <AnimateIn type="scaleUp" className="relative z-10 max-w-xl mx-auto">
                        <h2 className="text-4xl md:text-5xl text-white leading-[1.1] font-serif mb-4">
                            Ready to get started?
                        </h2>
                        <p className="text-sm text-white/70 leading-relaxed max-w-md mx-auto mb-8">
                            Choose a plan, set up your team, and start generating
                            travel health plans for your employees in minutes.
                        </p>
                        <Button
                            variant="primary"
                            link="/pricing?tab=company"
                            className="bg-white text-dark! hover:bg-white/90 mx-auto"
                        >
                            Start Onboarding
                        </Button>
                    </AnimateIn>
                </div>
            </section>
        </main>
    );
};

export default ForCompanies;
