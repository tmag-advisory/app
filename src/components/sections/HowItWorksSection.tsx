import { LucideMapPin, LucideShieldCheck, LucideBriefcaseMedical } from "lucide-react";
import { motion } from "framer-motion";
import type { ReactNode } from "react";
import AnimateIn from "../animations/AnimateIn";
import StaggerGroup, { staggerItem } from "../animations/StaggerGroup";

const steps: { number: string; icon: ReactNode; title: string; description: string }[] = [
    {
        number: "01",
        icon: <LucideMapPin className="w-6 h-6" />,
        title: "Tell us where you're going",
        description:
            "Enter your destination, travel dates, and any existing health conditions. It takes less than a minute.",
    },
    {
        number: "02",
        icon: <LucideBriefcaseMedical className="w-6 h-6" />,
        title: "Get your personalized plan",
        description:
            "Our AI cross-references WHO, CDC, and local health data to generate a medical advisory tailored to you.",
    },
    {
        number: "03",
        icon: <LucideShieldCheck className="w-6 h-6" />,
        title: "Travel with confidence",
        description:
            "Download your plan, share it with your doctor, and depart knowing exactly what to pack and prepare.",
    },
];

const HowItWorksSection = () => {
    return (
        <section className="px-8 lg:px-16 pt-24 pb-16 max-w-7xl mx-auto">
            <AnimateIn className="text-center mb-16">
                <span className="inline-block text-sm text-muted bg-button-secondary font-semibold rounded-xl px-4 py-1.5 mb-6">
                    How it works
                </span>
                <h2 className="text-4xl md:text-5xl lg:text-6xl text-heading leading-[1.1] font-serif">
                    Three steps to a <span className="italic">safer</span> trip.
                </h2>
            </AnimateIn>

            <StaggerGroup className="grid grid-cols-1 md:grid-cols-3 gap-6" stagger={0.15}>
                {steps.map((step) => (
                    <motion.div
                        variants={staggerItem}
                        key={step.number}
                        className="relative bg-button-secondary rounded-2xl p-8 flex flex-col gap-5"
                    >
                        <div className="flex items-center justify-between">
                            <div className="w-12 h-12 rounded-xl bg-heading text-background-primary flex items-center justify-center">
                                {step.icon}
                            </div>
                            <span className="text-4xl font-serif text-border">
                                {step.number}
                            </span>
                        </div>
                        <h3 className="text-lg font-semibold text-heading">
                            {step.title}
                        </h3>
                        <p className="text-sm text-body leading-relaxed">
                            {step.description}
                        </p>
                    </motion.div>
                ))}
            </StaggerGroup>
        </section>
    );
};

export default HowItWorksSection;
