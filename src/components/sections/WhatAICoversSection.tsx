import {
    LucideSyringe,
    LucidePill,
    LucideThermometer,
    LucideDroplets,
    LucideApple,
    LucideAlertTriangle,
    LucideHeart,
    LucideGlobe,
} from "lucide-react";
import { motion } from "framer-motion";
import type { ReactNode } from "react";
import AnimateIn from "../animations/AnimateIn";
import StaggerGroup, { staggerItem } from "../animations/StaggerGroup";

const topics: { icon: ReactNode; title: string; description: string }[] = [
    {
        icon: <LucideSyringe className="w-5 h-5" />,
        title: "Vaccinations",
        description: "Required and recommended vaccines for your destination.",
    },
    {
        icon: <LucidePill className="w-5 h-5" />,
        title: "Medications",
        description: "Prophylactics, prescriptions, and what to pack in your kit.",
    },
    {
        icon: <LucideThermometer className="w-5 h-5" />,
        title: "Disease risks",
        description: "Malaria zones, dengue hotspots, and seasonal outbreaks.",
    },
    {
        icon: <LucideDroplets className="w-5 h-5" />,
        title: "Water & sanitation",
        description: "Safe drinking water guidance and hygiene precautions.",
    },
    {
        icon: <LucideApple className="w-5 h-5" />,
        title: "Food safety",
        description: "What to eat, what to avoid, and how to stay well-nourished.",
    },
    {
        icon: <LucideAlertTriangle className="w-5 h-5" />,
        title: "Emergency protocols",
        description: "Nearest clinics, emergency contacts, and evacuation plans.",
    },
    {
        icon: <LucideHeart className="w-5 h-5" />,
        title: "Pre-existing conditions",
        description: "Tailored advice for chronic conditions and special needs.",
    },
    {
        icon: <LucideGlobe className="w-5 h-5" />,
        title: "Country regulations",
        description: "Entry health requirements, insurance mandates, and local laws.",
    },
];

const WhatAICoversSection = () => {
    return (
        <div className="bg-background-secondary">
            <section className="px-8 lg:px-16 pt-24 pb-16 max-w-7xl mx-auto">
                <AnimateIn className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-14">
                    <div>
                        <span className="inline-block text-sm text-muted bg-button-secondary font-semibold rounded-xl px-4 py-1.5 mb-6">
                            What the AI covers
                        </span>
                        <h2 className="text-4xl md:text-5xl lg:text-6xl text-heading leading-[1.1] font-serif max-w-lg">
                            Everything you need,{" "}
                            <span className="italic">nothing</span> you don't.
                        </h2>
                    </div>
                    <p className="text-sm text-muted leading-relaxed max-w-sm md:mt-10 font-medium">
                        Our AI analyzes real-time data from WHO, CDC, and local
                        health authorities to give you comprehensive, up-to-date
                        medical guidance—all in one place.
                    </p>
                </AnimateIn>

                <StaggerGroup className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" stagger={0.08}>
                    {topics.map((topic) => (
                        <motion.div
                            variants={staggerItem}
                            key={topic.title}
                            className="bg-background-primary rounded-2xl p-6 flex flex-col gap-3 hover:shadow-sm transition-shadow duration-200"
                        >
                            <div className="w-10 h-10 rounded-xl bg-button-secondary flex items-center justify-center text-heading">
                                {topic.icon}
                            </div>
                            <h3 className="text-base font-semibold text-heading">
                                {topic.title}
                            </h3>
                            <p className="text-sm text-body leading-relaxed">
                                {topic.description}
                            </p>
                        </motion.div>
                    ))}
                </StaggerGroup>
            </section>
        </div>
    );
};

export default WhatAICoversSection;
