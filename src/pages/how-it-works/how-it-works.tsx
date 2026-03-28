import {
    LucideSearch,
    LucideDatabase,
    LucideBrain,
    LucideFileText,
    LucideArrowRight,
    LucideCheck,
    LucideCoins,
} from "lucide-react";
import { motion } from "framer-motion";
import Button from "../../components/ui/Button";
import AnimateIn from "../../components/animations/AnimateIn";
import StaggerGroup, { staggerItem } from "../../components/animations/StaggerGroup";

const processSteps = [
    {
        icon: <LucideSearch className="w-6 h-6" />,
        title: "1. You share your trip details",
        description:
            "Enter your destination(s), travel dates, activities planned, and any health conditions or medications. The more you share, the more precise your plan.",
    },
    {
        icon: <LucideDatabase className="w-6 h-6" />,
        title: "2. We pull real-time health data",
        description:
            "Our system queries live data from the WHO, CDC, ECDC, and local health ministries. We cross-reference outbreak alerts, seasonal disease patterns, and entry requirements.",
    },
    {
        icon: <LucideBrain className="w-6 h-6" />,
        title: "3. Our system builds your personalized plan",
        description:
            "The platform analyzes your profile against the destination data—factoring in your conditions, medications, and itinerary—to produce a plan that's medically relevant to you, not generic.",
    },
    {
        icon: <LucideFileText className="w-6 h-6" />,
        title: "4. You get a downloadable advisory",
        description:
            "Your plan is delivered as a clean, shareable PDF. Bring it to your doctor, share it with travel companions, or keep it on your phone for quick reference abroad.",
    },
];

const planIncludes = [
    "Required & recommended vaccinations",
    "Prescription medication recommendations",
    "Malaria, dengue, and regional disease risk alerts",
    "Water and food safety guidance",
    "Altitude, climate, and environmental risks",
    "Emergency contacts & nearest clinics at destination",
    "Insurance and evacuation considerations",
    "Pre-existing condition-specific adjustments",
    "Entry health requirements and local regulations",
    "Packing checklist for your medical kit",
];

const HowItWorks = () => {
    return (
        <main>
            {/* Hero */}
            <AnimateIn as="section" className="flex flex-col items-center text-center pt-20 pb-12 px-6">
                <span className="inline-block text-sm text-muted bg-button-secondary font-semibold rounded-xl px-4 py-1.5 mb-6">
                    How it works
                </span>
                <h1 className="text-5xl md:text-6xl lg:text-7xl leading-[0.9] text-heading font-serif max-w-3xl">
                    From question to{" "}
                    <span className="italic">plan</span> in minutes.
                </h1>
                <p className="sm:text-lg text-body mt-6 max-w-xl leading-relaxed">
                    No appointments, no waiting rooms. Tell us where you're
                    going and we'll tell you how to stay healthy.
                </p>
            </AnimateIn>

            {/* Process steps */}
            <section className="px-8 lg:px-16 pb-24 max-w-7xl mx-auto">
                <StaggerGroup stagger={0.12} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {processSteps.map((step) => (
                        <motion.div
                            key={step.title}
                            variants={staggerItem}
                            className="bg-button-secondary rounded-2xl p-8 md:p-10"
                        >
                            <div className="w-12 h-12 rounded-xl bg-dark text-background-primary flex items-center justify-center mb-6">
                                {step.icon}
                            </div>
                            <h3 className="text-xl font-serif text-heading mb-3">
                                {step.title}
                            </h3>
                            <p className="text-sm text-body leading-relaxed">
                                {step.description}
                            </p>
                        </motion.div>
                    ))}
                </StaggerGroup>
            </section>

            {/* Data sources */}
            <div className="bg-background-secondary">
                <section className="px-8 lg:px-16 py-24 max-w-7xl mx-auto">
                    <AnimateIn className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-14">
                        <div>
                            <span className="inline-block text-sm text-muted bg-button-secondary font-semibold rounded-xl px-4 py-1.5 mb-6">
                                Our data sources
                            </span>
                            <h2 className="text-4xl md:text-5xl text-heading leading-[1.1] font-serif max-w-lg">
                                Backed by the world's{" "}
                                <span className="italic">best</span> health data.
                            </h2>
                        </div>
                        <p className="text-sm text-muted leading-relaxed max-w-sm md:mt-10 font-medium">
                            We don't guess. Every recommendation is sourced from
                            established global health authorities and updated
                            continuously.
                        </p>
                    </AnimateIn>
                    <StaggerGroup stagger={0.1} className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            "World Health Organization (WHO)",
                            "U.S. Centers for Disease Control (CDC)",
                            "European Centre for Disease Prevention (ECDC)",
                            "Local health ministries & embassies",
                        ].map((source) => (
                            <motion.div
                                key={source}
                                variants={staggerItem}
                                className="bg-background-primary rounded-2xl p-6 text-center"
                            >
                                <p className="text-sm font-semibold text-heading">
                                    {source}
                                </p>
                            </motion.div>
                        ))}
                    </StaggerGroup>
                </section>
            </div>

            {/* What's in a plan */}
            <section className="px-8 lg:px-16 py-24 max-w-7xl mx-auto">
                <AnimateIn className="text-center mb-14">
                    <span className="inline-block text-sm text-muted bg-button-secondary font-semibold rounded-xl px-4 py-1.5 mb-6">
                        What's included
                    </span>
                    <h2 className="text-4xl md:text-5xl text-heading leading-[1.1] font-serif">
                        Everything in your{" "}
                        <span className="italic">plan.</span>
                    </h2>
                </AnimateIn>
                <AnimateIn delay={0.15} className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
                    {planIncludes.map((item) => (
                        <div key={item} className="flex items-start gap-3 py-2">
                            <LucideCheck className="w-4 h-4 mt-0.5 text-accent shrink-0" />
                            <span className="text-sm text-heading">
                                {item}
                            </span>
                        </div>
                    ))}
                </AnimateIn>
            </section>

            {/* How credits work */}
            <div className="bg-background-secondary">
                <section className="px-8 lg:px-16 py-24 max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row gap-12 md:gap-20">
                        <AnimateIn type="fadeLeft" className="md:w-1/2">
                            <span className="inline-block text-sm text-muted bg-button-secondary font-semibold rounded-xl px-4 py-1.5 mb-6">
                                Credits
                            </span>
                            <h2 className="text-4xl md:text-5xl text-heading leading-[1.1] font-serif mb-4">
                                How credits{" "}
                                <span className="italic">work.</span>
                            </h2>
                            <p className="text-sm text-body leading-relaxed mb-6">
                                Credits are the simple way we meter plan
                                generation. No subscriptions, no recurring
                                charges—just pay for what you use.
                            </p>
                        </AnimateIn>
                        <AnimateIn type="fadeRight" delay={0.1} className="md:w-1/2 space-y-4">
                            {[
                                {
                                    q: "What uses a credit?",
                                    a: "Generating one full travel health plan for one trip consumes one credit. Viewing or downloading an existing plan is always free.",
                                },
                                {
                                    q: "Do credits expire?",
                                    a: "No. Credits never expire. Use them whenever you're ready to travel.",
                                },
                                {
                                    q: "Can I buy more?",
                                    a: "Yes. You can purchase additional credits at any time from your dashboard. Volume discounts are available for 10+ credits.",
                                },
                            ].map((item) => (
                                <div
                                    key={item.q}
                                    className="bg-background-primary rounded-2xl p-6"
                                >
                                    <div className="flex items-center gap-3 mb-2">
                                        <LucideCoins className="w-4 h-4 text-accent" />
                                        <h4 className="text-sm font-semibold text-heading">
                                            {item.q}
                                        </h4>
                                    </div>
                                    <p className="text-sm text-body leading-relaxed ml-7">
                                        {item.a}
                                    </p>
                                </div>
                            ))}
                        </AnimateIn>
                    </div>
                </section>
            </div>

            {/* CTA */}
            <AnimateIn as="section" type="fade" className="px-8 lg:px-16 py-24 max-w-7xl mx-auto text-center">
                <h2 className="text-4xl md:text-5xl text-heading leading-[1.1] font-serif mb-4">
                    Ready to try it?
                </h2>
                <p className="text-sm text-body leading-relaxed max-w-md mx-auto mb-8">
                    Your first plan is free—no credit card required. See exactly
                    what you'll get before you pay for anything.
                </p>
                <div className="flex items-center justify-center gap-4 flex-wrap">
                    <Button variant="primary">Get your free plan</Button>
                    <Button variant="secondary" icon={<LucideArrowRight />} link="/pricing">
                        View pricing
                    </Button>
                </div>
            </AnimateIn>
        </main>
    );
};

export default HowItWorks;
