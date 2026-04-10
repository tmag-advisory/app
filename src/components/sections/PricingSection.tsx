import { LucideCheck, LucideArrowRight, LucideUsers } from "lucide-react";
import { motion } from "framer-motion";
import Button from "../ui/Button";
import AnimateIn from "../animations/AnimateIn";
import StaggerGroup, { staggerItem } from "../animations/StaggerGroup";
import { companyPlans } from "../../constants/companyPlans";

const individualPlans = [
    {
        name: "Explorer",
        price: "Free",
        period: "",
        description: "Quick guidance for a single destination.",
        features: [
            "1 destination report",
            "Basic vaccine checklist",
            "General risk overview",
            "Email delivery",
        ],
        cta: "Start free",
        highlighted: false,
    },
    {
        name: "Credits",
        price: "Pay as you go",
        period: "",
        description: "Buy credits and generate full travel health plans on demand.",
        features: [
            "Full vaccine & medication plan",
            "Emergency contacts & clinics",
            "Downloadable PDF reports",
            "Buy as many credits as you want",
            "Credits never expire",
        ],
        cta: "Get started",
        highlighted: true,
    },
];

const PricingSection = () => {
    return (
        <div className="bg-background-secondary">
            <section className="px-8 lg:px-16 pt-24 pb-16 max-w-7xl mx-auto">
                <AnimateIn className="text-center mb-14">
                    <span className="inline-block text-sm text-muted bg-button-secondary font-semibold rounded-xl px-4 py-1.5 mb-6">
                        Pricing
                    </span>
                    <h2 className="text-4xl md:text-5xl lg:text-6xl text-heading leading-[1.1] font-serif">
                        Simple, <span className="italic">transparent</span>{" "}
                        pricing.
                    </h2>
                    <p className="text-sm text-muted mt-4 max-w-md mx-auto leading-relaxed">
                        No hidden fees, no surprise charges. Whether you're traveling solo
                        or managing a team, pick the option that fits.
                    </p>
                </AnimateIn>

                {/* Individual plans */}
                <AnimateIn className="text-center mb-8">
                    <h3 className="text-2xl md:text-3xl text-heading leading-[1.1] font-serif mb-2">
                        For individuals
                    </h3>
                </AnimateIn>
                <StaggerGroup className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto mb-16" stagger={0.15}>
                    {individualPlans.map((plan) => (
                        <motion.div
                            variants={staggerItem}
                            key={plan.name}
                            className={`relative rounded-3xl p-8 flex flex-col justify-between overflow-hidden ${
                                plan.highlighted ? "" : "bg-background-primary"
                            }`}
                        >
                            {plan.highlighted && (
                                <div
                                    className="absolute inset-0"
                                    style={{
                                        background:
                                            "linear-gradient(135deg, #2a7a6a 0%, #1a6a7a 30%, #187080 55%, #1a6878 80%, #246858 100%)",
                                    }}
                                />
                            )}
                            {plan.highlighted && (
                                <span className="absolute top-6 right-6 text-xs font-semibold text-white/80 bg-white/15 px-3 py-1 rounded-full">
                                    Most popular
                                </span>
                            )}
                            <div className="relative z-10">
                                <h3 className={`text-lg font-semibold mb-1 ${plan.highlighted ? "text-white" : "text-heading"}`}>
                                    {plan.name}
                                </h3>
                                <p className={`text-sm mb-6 ${plan.highlighted ? "text-white/60" : "text-body"}`}>
                                    {plan.description}
                                </p>
                                <div className="flex items-baseline gap-1 mb-8">
                                    <span className={`text-4xl font-serif ${plan.highlighted ? "text-white" : "text-heading"}`}>
                                        {plan.price}
                                    </span>
                                    {plan.period && (
                                        <span className={`text-sm ${plan.highlighted ? "text-white/60" : "text-body"}`}>
                                            {plan.period}
                                        </span>
                                    )}
                                </div>
                                <ul className="space-y-3 mb-8">
                                    {plan.features.map((f) => (
                                        <li key={f} className={`flex items-start gap-3 text-sm ${plan.highlighted ? "text-white" : "text-heading"}`}>
                                            <LucideCheck className={`w-4 h-4 mt-0.5 shrink-0 ${plan.highlighted ? "text-white/60" : "text-accent"}`} />
                                            {f}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            {plan.highlighted ? (
                                <Button
                                    variant="primary"
                                    link="/pricing"
                                    className="relative z-10 self-stretch bg-white !text-dark hover:bg-white/90 text-center justify-center flex"
                                >
                                    {plan.cta}
                                </Button>
                            ) : (
                                <Button variant="secondary" icon={<LucideArrowRight />} link="/pricing" className="self-start relative z-10">
                                    {plan.cta}
                                </Button>
                            )}
                        </motion.div>
                    ))}
                </StaggerGroup>

                {/* Company plans */}
                <AnimateIn className="text-center mb-8">
                    <h3 className="text-2xl md:text-3xl text-heading leading-[1.1] font-serif mb-2">
                        For companies
                    </h3>
                </AnimateIn>
                <StaggerGroup className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6" stagger={0.15}>
                    {companyPlans.map((plan) => (
                        <motion.div
                            variants={staggerItem}
                            key={plan.tier}
                            className={`relative rounded-3xl p-8 flex flex-col justify-between overflow-hidden ${
                                plan.tier === "diamond" ? "" : "bg-background-primary"
                            }`}
                        >
                            {plan.tier === "diamond" && (
                                <div
                                    className="absolute inset-0"
                                    style={{
                                        background:
                                            "linear-gradient(135deg, #2a7a6a 0%, #1a6a7a 30%, #187080 55%, #1a6878 80%, #246858 100%)",
                                    }}
                                />
                            )}
                            {plan.tier === "diamond" && (
                                <span className="absolute top-6 right-6 text-xs font-semibold text-white/80 bg-white/15 px-3 py-1 rounded-full">
                                    Best for API teams
                                </span>
                            )}
                            <div className="relative z-10">
                                <h3 className={`text-lg font-semibold mb-1 ${plan.tier === "diamond" ? "text-white" : "text-heading"}`}>
                                    {plan.name}
                                </h3>
                                <p className={`text-sm mb-6 ${plan.tier === "diamond" ? "text-white/60" : "text-body"}`}>
                                    {plan.description}
                                </p>
                                <div className="flex items-baseline gap-1 mb-8">
                                    <span className={`text-4xl font-serif ${plan.tier === "diamond" ? "text-white" : "text-heading"}`}>
                                        {plan.signupCredits}
                                    </span>
                                    <span className={`text-sm ${plan.tier === "diamond" ? "text-white/60" : "text-body"}`}>
                                        signup credits
                                    </span>
                                </div>
                                <ul className="space-y-3 mb-8">
                                    {[
                                        plan.employeeLimit,
                                        `API access: ${plan.apiAccess ? "Included" : "Not included"}`,
                                        `Custom support: ${plan.customSupport ? "Included" : "Not included"}`,
                                        `Multiple admins: ${plan.multipleAdminAccounts ? "Included" : "Not included"}`,
                                    ].map((f, i) => (
                                        <li
                                            key={f}
                                            className={`flex items-start gap-3 text-sm ${plan.tier === "diamond" ? "text-white" : "text-heading"}`}
                                        >
                                            {i === 0 ? (
                                                <LucideUsers className={`w-4 h-4 mt-0.5 shrink-0 ${plan.tier === "diamond" ? "text-white/60" : "text-accent"}`} />
                                            ) : (
                                                <LucideCheck className={`w-4 h-4 mt-0.5 shrink-0 ${plan.tier === "diamond" ? "text-white/60" : "text-accent"}`} />
                                            )}
                                            {f}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            {plan.tier === "diamond" ? (
                                <Button
                                    variant="primary"
                                    link="/contact?type=SALES"
                                    className="relative z-10 self-stretch bg-white !text-dark hover:bg-white/90 text-center justify-center flex"
                                >
                                    Talk to sales
                                </Button>
                            ) : (
                                <Button variant="secondary" icon={<LucideArrowRight />} link="/pricing" className="self-start relative z-10">
                                    View plans
                                </Button>
                            )}
                        </motion.div>
                    ))}
                </StaggerGroup>
            </section>
        </div>
    );
};

export default PricingSection;
