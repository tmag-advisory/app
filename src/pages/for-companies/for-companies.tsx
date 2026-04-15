import {
    LucideBuilding2,
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
import { creditPlans, premiumFeatures } from "../../constants/companyPlans";

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
    return (
        <main>
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
                        Essential, Standard, and <span className="italic">Premium</span>.
                    </h2>
                </AnimateIn>
                <StaggerGroup className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto" stagger={0.12}>
                    {creditPlans.map((plan) => (
                        <motion.div
                            variants={staggerItem}
                            key={plan.tier}
                            className={`relative rounded-2xl p-6 border flex flex-col overflow-hidden ${
                                plan.tier === "standard"
                                    ? "bg-dark border-dark text-white"
                                    : plan.tier === "premium"
                                    ? "bg-background-primary border-amber-200/60"
                                    : "bg-background-primary border-border-light/50"
                            }`}
                        >
                            {plan.tier === "essential" && (
                                <span className="self-start text-xs font-semibold text-accent bg-accent/10 border border-accent/20 px-3 py-1 rounded-full mb-4">
                                    Free to start
                                </span>
                            )}
                            {plan.tier === "standard" && (
                                <span className="self-start text-xs font-semibold text-white/80 bg-white/15 px-3 py-1 rounded-full mb-4">
                                    Most popular
                                </span>
                            )}
                            {plan.tier === "premium" && (
                                <span className="self-start text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full mb-4">
                                    Best report
                                </span>
                            )}
                            <h3 className={`text-xl font-serif mb-1 ${plan.tier === "standard" ? "text-white" : "text-heading"}`}>
                                {plan.name}
                            </h3>
                            <p className={`text-xs mb-4 ${plan.tier === "standard" ? "text-white/60" : "text-muted"}`}>
                                {plan.description}
                            </p>
                            <div className="flex items-baseline gap-1.5 mb-1">
                                <p className={`text-3xl font-serif ${plan.tier === "standard" ? "text-white" : plan.tier === "premium" ? "text-amber-700" : "text-heading"}`}>
                                    {plan.priceUsd === 0 ? "Free" : `$${plan.priceUsd}`}
                                </p>
                            </div>
                            <span className={`text-xs mb-5 ${plan.tier === "standard" ? "text-white/50" : "text-muted"}`}>
                                {plan.priceUsd === 0 ? "included at signup" : "per credit"}
                            </span>
                            <ul className="space-y-2.5 flex-1">
                                {plan.features.map((f) => (
                                    <li key={f} className={`flex items-start gap-2 text-xs ${plan.tier === "standard" ? "text-white/80" : "text-body"}`}>
                                        <LucideCheck className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${plan.tier === "standard" ? "text-white/60" : plan.tier === "premium" ? "text-amber-600" : "text-accent"}`} />
                                        {f}
                                    </li>
                                ))}
                            </ul>
                            <Button
                                variant={plan.tier === "standard" ? "primary" : "secondary"}
                                link="/company-onboarding"
                                icon={plan.tier !== "standard" ? <LucideArrowRight /> : undefined}
                                className={`mt-6 ${plan.tier === "standard" ? "bg-white !text-dark hover:bg-white/90 w-full text-center justify-center flex" : plan.tier === "premium" ? "border-amber-300 text-amber-700 hover:bg-amber-50" : ""}`}
                            >
                                Get started
                            </Button>
                        </motion.div>
                    ))}
                </StaggerGroup>
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

            {/* Compliance angle */}
            <section className="px-8 lg:px-16 py-24 max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row gap-12 md:gap-20">
                    <AnimateIn type="fadeLeft" className="md:w-1/2">
                        <span className="inline-block text-sm text-muted bg-button-secondary font-semibold rounded-xl px-4 py-1.5 mb-6">
                            Compliance
                        </span>
                        <h2 className="text-4xl md:text-5xl text-heading leading-[1.1] font-serif mb-4">
                            Duty of care,{" "}
                            <span className="italic">handled.</span>
                        </h2>
                        <p className="text-sm text-body leading-relaxed mb-6">
                            Employers have a legal obligation to inform employees
                            about health risks when traveling for work. TMAG
                            automates this process with auditable, timestamped
                            documentation that proves you did your part.
                        </p>
                        <div className="space-y-3">
                            {[
                                "ISO 31030 travel risk management alignment",
                                "Timestamped plan delivery and read receipts",
                                "Exportable compliance reports per trip",
                                "HIPAA-compliant data handling",
                            ].map((item) => (
                                <div key={item} className="flex items-start gap-3">
                                    <LucideCheck className="w-4 h-4 mt-0.5 text-accent shrink-0" />
                                    <span className="text-sm text-heading">
                                        {item}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </AnimateIn>
                    <AnimateIn type="fadeRight" delay={0.1} className="md:w-1/2">
                        <div className="relative rounded-3xl overflow-hidden p-8 md:p-10 h-full flex flex-col justify-center"
                            style={{
                                background:
                                    "linear-gradient(135deg, #2a7a6a 0%, #1a6a7a 30%, #187080 55%, #1a6878 80%, #246858 100%)",
                            }}
                        >
                            <LucideBuilding2 className="w-10 h-10 text-white/30 mb-6" />
                            <blockquote className="text-lg text-white leading-relaxed font-serif italic mb-6">
                                "We reduced our travel health compliance process
                                from 3 weeks to 20 minutes. The audit trail alone
                                justified the cost."
                            </blockquote>
                            <div>
                                <p className="text-sm font-semibold text-white">
                                    James L.
                                </p>
                                <p className="text-xs text-white/50">
                                    Head of Global Mobility · TechCorp
                                </p>
                            </div>
                        </div>
                    </AnimateIn>
                </div>
            </section>

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
                            link="/company-onboarding"
                            className="bg-white !text-dark hover:bg-white/90 mx-auto"
                        >
                            Start onboarding
                        </Button>
                    </AnimateIn>
                </div>
            </section>
        </main>
    );
};

export default ForCompanies;
