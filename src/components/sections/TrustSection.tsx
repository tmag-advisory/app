import {
    LucideStethoscope,
} from "lucide-react";
import { motion } from "framer-motion";
import StarRating from "../ui/StarRating";
import AnimateIn from "../animations/AnimateIn";
import StaggerGroup, { staggerItem } from "../animations/StaggerGroup";
import SectionEyebrow from "../ui/SectionEyebrow";


const testimonials = [
    {
        quote: "TMAG gave me a complete malaria prevention plan in under two minutes. My doctor was impressed I came so prepared.",
        name: "Sarah K.",
        role: "Backpacker · Southeast Asia trip",
        initials: "SK",
        color: "bg-emerald-100 text-emerald-700",
    },
    {
        quote: "We rolled this out to 200+ employees traveling across Africa. The compliance reports alone saved us weeks of work.",
        name: "James L.",
        role: "Head of Global Mobility · TechCorp",
        initials: "JL",
        color: "bg-blue-100 text-blue-700",
    },
    {
        quote: "I have a chronic condition and was nervous about traveling to South America. The personalized plan addressed every concern I had.",
        name: "Maria R.",
        role: "Solo traveler · Brazil & Peru",
        initials: "MR",
        color: "bg-amber-100 text-amber-700",
    },
];

const TrustSection = () => {
    return (
        <div className="bg-background-secondary">
            <section className="px-8 lg:px-16 pt-24 pb-16 max-w-7xl mx-auto">
                <AnimateIn className="text-center mb-14">
                    <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
                        <SectionEyebrow>Clinically grounded</SectionEyebrow>
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-accent bg-accent/10 border border-accent/20 rounded-full px-3 py-1">
                            <LucideStethoscope
                                width={12}
                                height={12}
                                strokeWidth={2.25}
                            />
                            Physician-reviewed
                        </span>
                    </div>
                    <h2 className="text-4xl md:text-5xl lg:text-6xl text-heading leading-[1.1] font-serif max-w-2xl mx-auto">
                        Trusted by physicians.{" "}
                        <span className="italic">Globally aligned.</span>
                    </h2>
                </AnimateIn>

                {/* Testimonials */}
                <StaggerGroup
                    className="grid grid-cols-1 md:grid-cols-3 gap-6"
                    stagger={0.12}
                >
                    {testimonials.map((t) => (
                        <motion.div
                            variants={staggerItem}
                            key={t.name}
                            className="bg-background-primary rounded-2xl p-8 flex flex-col justify-between shadow-sm border border-border-light"
                        >
                            <div>
                                <StarRating count={5} />
                                <p className="text-base font-medium text-heading leading-relaxed mt-4 mb-6">
                                    &ldquo;{t.quote}&rdquo;
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <div
                                    className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold ${t.color}`}
                                >
                                    {t.initials}
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-heading">
                                        {t.name}
                                    </p>
                                    <p className="text-xs text-body mt-0.5">
                                        {t.role}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </StaggerGroup>
            </section>
        </div>
    );
};

export default TrustSection;
