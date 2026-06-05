import {
    LucideAlertTriangle,
    LucideGlobe,
    LucideUsers,
    LucideBriefcase,
} from "lucide-react";
import AnimateIn from "../animations/AnimateIn";
import StaggerGroup, { staggerItem } from "../animations/StaggerGroup";
import { motion } from "framer-motion";
import SectionEyebrow from "../ui/SectionEyebrow";

const stats = [
    {
        icon: <LucideGlobe className="w-5 h-5" />,
        value: "120+",
        label: "Countries with unique health risks",
    },
    {
        icon: <LucideAlertTriangle className="w-5 h-5" />,
        value: "1 in 3",
        label: "Travellers face preventable illness",
    },
    {
        icon: <LucideUsers className="w-5 h-5" />,
        value: "70%",
        label: "Don't seek pre-travel health advice",
    },
    {
        icon: <LucideBriefcase className="w-5 h-5" />,
        value: "50%",
        label: "Organizations lack duty-of-care plans",
    },
];

const RiskMapCard = () => (
    <div className="relative rounded-3xl border border-border bg-background-secondary overflow-hidden">
        {/* Image */}
        <div className="relative aspect-[3/3] bg-background-primary">
            <img
                src="/hero-image.jpg"
                alt="Stylized global health risk map showing outbreak, dengue, and yellow fever hotspots across continents"
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover"
            />
        </div>
    </div>
);

const ProblemSection = () => {
    return (
        <section className="px-8 lg:px-16 pt-24 pb-16 max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-[1fr_1.05fr] lg:gap-16 items-center">
                {/* Narrative left */}
                <AnimateIn type="fadeLeft">
                    <div className="flex flex-wrap items-center gap-2 mb-5">
                        <SectionEyebrow>The problem</SectionEyebrow>
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-accent bg-accent/10 border border-accent/20 rounded-full px-3 py-1">
                            <LucideAlertTriangle
                                width={12}
                                height={12}
                                strokeWidth={2.25}
                            />
                            Underprepared
                        </span>
                    </div>
                    <h2 className="text-4xl md:text-5xl lg:text-6xl text-heading leading-[1.1] font-serif mb-6">
                        Most travellers <span className="italic">underestimate</span>{" "}
                        the health risks they face.
                    </h2>
                    <p className="text-body leading-relaxed mb-4 max-w-md">
                        Every year, millions of people travel without adequate health
                        preparation. Outbreaks shift. Vaccination requirements change.
                        Local hospital quality varies dramatically.
                    </p>
                    <p className="text-body leading-relaxed max-w-md">
                        For organisations, the stakes are even higher. Without a
                        systematic travel health programme, duty-of-care obligations go
                        unmet, and preventable incidents become costly liabilities.
                    </p>
                </AnimateIn>

                {/* Risk map card with image */}
                <AnimateIn type="fadeRight" delay={0.1}>
                    <div className="relative mt-12 lg:mt-0">
                        <div
                            aria-hidden
                            className="pointer-events-none absolute -inset-6 rounded-[2rem]"
                            style={{
                                background:
                                    "radial-gradient(circle at 60% 40%, rgba(196,149,58,0.18) 0%, rgba(232,120,80,0.06) 45%, transparent 70%)",
                                filter: "blur(40px)",
                            }}
                        />
                        <div className="relative">
                            <RiskMapCard />
                        </div>
                    </div>
                </AnimateIn>
            </div>

            {/* Stats strip — full width below */}
            <StaggerGroup
                className="mt-16 lg:mt-20 grid grid-cols-2 lg:grid-cols-4 gap-4"
                stagger={0.1}
            >
                {stats.map((s, i) => (
                    <motion.div
                        variants={staggerItem}
                        key={s.label}
                        className={`${i % 2 === 0
                                ? "bg-background-secondary"
                                : "bg-button-secondary"
                            } rounded-2xl p-6 border border-border shadow-sm`}
                    >
                        <div className="w-10 h-10 rounded-xl bg-background-primary border border-border flex items-center justify-center text-accent mb-4">
                            {s.icon}
                        </div>
                        <p className="text-3xl font-serif text-heading mb-1">
                            {s.value}
                        </p>
                        <p className="text-sm text-body leading-relaxed">
                            {s.label}
                        </p>
                    </motion.div>
                ))}
            </StaggerGroup>
        </section>
    );
};

export default ProblemSection;
