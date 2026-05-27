import {
    LucideMapPin,
    LucideShieldCheck,
    LucideStethoscope,
    LucideFileCheck,
    LucideArrowRight,
} from "lucide-react";
import type { ReactNode } from "react";
import AnimateIn from "../animations/AnimateIn";
import { motion } from "framer-motion";
import StaggerGroup, { staggerItem } from "../animations/StaggerGroup";
import SectionEyebrow from "../ui/SectionEyebrow";

const steps: {
    number: string;
    icon: ReactNode;
    title: string;
    description: string;
}[] = [
    {
        number: "01",
        icon: <LucideMapPin className="w-6 h-6" />,
        title: "Enter your destination",
        description:
            "Share your destination, travel dates, and health history. It takes under a minute to get started.",
    },
    {
        number: "02",
        icon: <LucideStethoscope className="w-6 h-6" />,
        title: "AI risk assessment",
        description:
            "Our engine analyses WHO, CDC, and country-specific health data to surface the exact risks for your itinerary.",
    },
    {
        number: "03",
        icon: <LucideFileCheck className="w-6 h-6" />,
        title: "Clinical review",
        description:
            "Every high-risk plan is flagged for physician review, ensuring recommendations are clinically sound and personalised.",
    },
    {
        number: "04",
        icon: <LucideShieldCheck className="w-6 h-6" />,
        title: "Personalised guidance",
        description:
            "Receive a downloadable health plan with vaccinations, medications, packing lists, and emergency contacts \u2014 ready to share with your doctor.",
    },
];

const HowItWorksSection = () => {
    return (
        <section className="px-8 lg:px-16 pt-24 pb-16 max-w-7xl mx-auto">
            <AnimateIn className="text-center mb-16">
                <SectionEyebrow className="mb-6">How it works</SectionEyebrow>
                <h2 className="text-4xl md:text-5xl lg:text-6xl text-heading leading-[1.1] font-serif">
                    Four steps to a <span className="italic">safer</span> trip.
                </h2>
            </AnimateIn>

            <div className="relative">
                {/* Dashed flow connector — passes through icon centers on lg */}
                <div
                    aria-hidden
                    className="hidden lg:block absolute top-[3.5rem] left-0 right-0 border-t border-dashed border-border z-0"
                />

                <StaggerGroup
                    className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                    stagger={0.12}
                >
                    {steps.map((step, i) => (
                        <motion.div
                            variants={staggerItem}
                            key={step.number}
                            className="relative bg-button-secondary rounded-2xl p-8 flex flex-col gap-5 z-10"
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
                            {i < steps.length - 1 && (
                                <LucideArrowRight
                                    aria-hidden
                                    className="hidden lg:block absolute top-12 -right-4 w-7 h-7 text-accent bg-background-primary border border-border rounded-full p-1"
                                    strokeWidth={2.25}
                                />
                            )}
                        </motion.div>
                    ))}
                </StaggerGroup>
            </div>
        </section>
    );
};

export default HowItWorksSection;
