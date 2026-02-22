import { LucideShieldCheck, LucideGraduationCap, LucideLock, LucideRefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import StarRating from "../ui/StarRating";
import AnimateIn from "../animations/AnimateIn";
import StaggerGroup, { staggerItem } from "../animations/StaggerGroup";

const badges = [
    {
        icon: <LucideShieldCheck className="w-5 h-5" />,
        label: "WHO & CDC aligned",
    },
    {
        icon: <LucideGraduationCap className="w-5 h-5" />,
        label: "Reviewed by physicians",
    },
    {
        icon: <LucideLock className="w-5 h-5" />,
        label: "HIPAA-compliant",
    },
    {
        icon: <LucideRefreshCw className="w-5 h-5" />,
        label: "Updated in real time",
    },
];

const testimonials = [
    {
        quote: "TMAG gave me a complete malaria prevention plan in under two minutes. My doctor was impressed I came so prepared.",
        name: "Sarah K.",
        role: "Backpacker · Southeast Asia trip",
    },
    {
        quote: "We rolled this out to 200+ employees traveling across Africa. The compliance reports alone saved us weeks of work.",
        name: "James L.",
        role: "Head of Global Mobility · TechCorp",
    },
    {
        quote: "I have a chronic condition and was nervous about traveling to South America. The personalized plan addressed every concern I had.",
        name: "Maria R.",
        role: "Solo traveler · Brazil & Peru",
    },
];

const TrustSection = () => {
    return (
        <div className="bg-background-secondary">
            <section className="px-8 lg:px-16 pt-24 pb-16 max-w-7xl mx-auto">
                <AnimateIn className="text-center mb-14">
                    <span className="inline-block text-sm text-muted bg-button-secondary font-semibold rounded-xl px-4 py-1.5 mb-6">
                        Trusted & verified
                    </span>
                    <h2 className="text-4xl md:text-5xl lg:text-6xl text-heading leading-[1.1] font-serif max-w-2xl mx-auto">
                        Your health data is in{" "}
                        <span className="italic">safe</span> hands.
                    </h2>
                </AnimateIn>

                {/* Trust badges */}
                <StaggerGroup className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-14" stagger={0.1}>
                    {badges.map((b) => (
                        <motion.div
                            variants={staggerItem}
                            key={b.label}
                            className="flex flex-col items-center gap-3 bg-background-primary rounded-2xl py-6 px-4 text-center"
                        >
                            <div className="w-10 h-10 rounded-xl bg-button-secondary flex items-center justify-center text-heading">
                                {b.icon}
                            </div>
                            <span className="text-sm font-semibold text-heading">
                                {b.label}
                            </span>
                        </motion.div>
                    ))}
                </StaggerGroup>

                {/* Testimonials */}
                <StaggerGroup className="grid grid-cols-1 md:grid-cols-3 gap-6" stagger={0.12}>
                    {testimonials.map((t) => (
                        <motion.div
                            variants={staggerItem}
                            key={t.name}
                            className="bg-background-primary rounded-2xl p-8 flex flex-col justify-between"
                        >
                            <div>
                                <StarRating count={5} />
                                <p className="text-sm text-heading leading-relaxed mt-4 mb-6">
                                    "{t.quote}"
                                </p>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-heading">
                                    {t.name}
                                </p>
                                <p className="text-xs text-body mt-0.5">
                                    {t.role}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </StaggerGroup>
            </section>
        </div>
    );
};

export default TrustSection;
