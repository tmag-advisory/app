import { LucideCheck, LucideArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import Button from "../ui/Button";
import AnimateIn from "../animations/AnimateIn";
import StaggerGroup, { staggerItem } from "../animations/StaggerGroup";
import { creditPlans } from "../../constants/companyPlans";


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
                <StaggerGroup className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-16" stagger={0.12}>
                    {creditPlans.map((plan) => (
                        <motion.div
                            variants={staggerItem}
                            key={plan.tier}
                            className={`relative rounded-3xl p-8 flex flex-col justify-between overflow-hidden ${
                                plan.tier === "standard" ? "" :
                                plan.tier === "premium" ? "bg-background-primary border border-amber-200/60" :
                                "bg-background-primary"
                            }`}
                        >
                            {plan.tier === "standard" && (
                                <div
                                    className="absolute inset-0"
                                    style={{
                                        background:
                                            "linear-gradient(135deg, #2a7a6a 0%, #1a6a7a 30%, #187080 55%, #1a6878 80%, #246858 100%)",
                                    }}
                                />
                            )}
                            {plan.tier === "standard" && (
                                <span className="absolute top-6 right-6 text-xs font-semibold text-white/80 bg-white/15 px-3 py-1 rounded-full">
                                    Most popular
                                </span>
                            )}
                            {plan.tier === "premium" && (
                                <span className="absolute top-6 right-6 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
                                    Best report
                                </span>
                            )}
                            <div className="relative z-10">
                                <h3 className={`text-lg font-semibold mb-1 ${plan.tier === "standard" ? "text-white" : "text-heading"}`}>
                                    {plan.name}
                                </h3>
                                <p className={`text-sm mb-6 ${plan.tier === "standard" ? "text-white/60" : "text-body"}`}>
                                    {plan.description}
                                </p>
                                <div className="flex items-baseline gap-1 mb-1">
                                    <span className={`text-4xl font-serif ${plan.tier === "standard" ? "text-white" : plan.tier === "premium" ? "text-amber-700" : "text-heading"}`}>
                                        {plan.priceUsd === 0 ? "Free" : `$${plan.priceUsd}`}
                                    </span>
                                </div>
                                <p className={`text-xs mb-8 ${plan.tier === "standard" ? "text-white/50" : "text-muted"}`}>
                                    {plan.priceUsd === 0 ? "1 credit included at signup" : "per credit (USD)"}
                                </p>
                                <ul className="space-y-3 mb-8">
                                    {plan.features.map((f) => (
                                        <li
                                            key={f}
                                            className={`flex items-start gap-3 text-sm ${plan.tier === "standard" ? "text-white" : "text-heading"}`}
                                        >
                                            <LucideCheck className={`w-4 h-4 mt-0.5 shrink-0 ${plan.tier === "standard" ? "text-white/60" : plan.tier === "premium" ? "text-amber-600" : "text-accent"}`} />
                                            {f}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            {plan.tier === "standard" ? (
                                <Button
                                    variant="primary"
                                    link="/register"
                                    className="relative z-10 self-stretch bg-white text-dark! hover:bg-white/90 text-center justify-center flex"
                                >
                                    Get started
                                </Button>
                            ) : (
                                <Button
                                    variant="secondary"
                                    icon={<LucideArrowRight />}
                                    link="/register"
                                    className={`self-start relative z-10 ${plan.tier === "premium" ? "border-amber-300 text-amber-700 hover:bg-amber-50" : ""}`}
                                >
                                    {plan.priceUsd === 0 ? "Start free" : "Get started"}
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
                <StaggerGroup className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto" stagger={0.12}>
                    {creditPlans.filter((plan) => plan.tier === "standard" || plan.tier === "premium").map((plan) => (
                        <motion.div
                            variants={staggerItem}
                            key={plan.tier}
                            className={`relative rounded-3xl p-8 flex flex-col justify-between overflow-hidden ${
                                plan.tier === "standard" ? "" :
                                plan.tier === "premium" ? "bg-background-primary border border-amber-200/60" :
                                "bg-background-primary"
                            }`}
                        >
                            {plan.tier === "standard" && (
                                <div
                                    className="absolute inset-0"
                                    style={{
                                        background:
                                            "linear-gradient(135deg, #2a7a6a 0%, #1a6a7a 30%, #187080 55%, #1a6878 80%, #246858 100%)",
                                    }}
                                />
                            )}
                            {plan.tier === "standard" && (
                                <span className="absolute top-6 right-6 text-xs font-semibold text-white/80 bg-white/15 px-3 py-1 rounded-full">
                                    Most popular
                                </span>
                            )}
                            {plan.tier === "premium" && (
                                <span className="absolute top-6 right-6 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
                                    Best report
                                </span>
                            )}
                            <div className="relative z-10">
                                <h3 className={`text-lg font-semibold mb-1 ${plan.tier === "standard" ? "text-white" : "text-heading"}`}>
                                    {plan.name}
                                </h3>
                                <p className={`text-sm mb-6 ${plan.tier === "standard" ? "text-white/60" : "text-body"}`}>
                                    {plan.description}
                                </p>
                                <div className="flex items-baseline gap-1 mb-1">
                                    <span className={`text-4xl font-serif ${plan.tier === "standard" ? "text-white" : plan.tier === "premium" ? "text-amber-700" : "text-heading"}`}>
                                        {plan.priceUsd === 0 ? "Free" : `$${plan.priceUsd}`}
                                    </span>
                                </div>
                                <p className={`text-xs mb-8 ${plan.tier === "standard" ? "text-white/50" : "text-muted"}`}>
                                    {plan.priceUsd === 0 ? "included at signup" : "per credit (USD)"}
                                </p>
                                <ul className="space-y-3 mb-8">
                                    {plan.features.map((f) => (
                                        <li
                                            key={f}
                                            className={`flex items-start gap-3 text-sm ${plan.tier === "standard" ? "text-white" : "text-heading"}`}
                                        >
                                            <LucideCheck className={`w-4 h-4 mt-0.5 shrink-0 ${plan.tier === "standard" ? "text-white/60" : plan.tier === "premium" ? "text-amber-600" : "text-accent"}`} />
                                            {f}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            {plan.tier === "standard" ? (
                                <Button
                                    variant="primary"
                                    link="/company-onboarding"
                                    className="relative z-10 self-stretch bg-white text-dark! hover:bg-white/90 text-center justify-center flex"
                                >
                                    Get started
                                </Button>
                            ) : (
                                <Button
                                    variant="secondary"
                                    icon={<LucideArrowRight />}
                                    link="/pricing"
                                    className={`self-start relative z-10 ${plan.tier === "premium" ? "border-amber-300 text-amber-700 hover:bg-amber-50" : ""}`}
                                >
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
