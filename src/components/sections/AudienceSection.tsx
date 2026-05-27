import {
    LucideUser,
    LucideBuilding2,
    LucideUsers,
    LucideArrowRight,
    LucideCheck,
} from "lucide-react";
import Button from "../ui/Button";
import AnimateIn from "../animations/AnimateIn";
import StaggerGroup, { staggerItem } from "../animations/StaggerGroup";
import { motion } from "framer-motion";
import SectionEyebrow from "../ui/SectionEyebrow";

const audiences = [
    {
        icon: <LucideUser className="w-6 h-6" />,
        title: "Individual Travellers",
        description:
            "Solo adventurers, digital nomads, and vacationers get a plan built for your exact trip and health profile.",
        features: [
            "Personalized vaccine checklist",
            "Medication & supply packing list",
            "Risk alerts for your exact itinerary",
            "Downloadable PDF health plan",
            "Doctor-ready summary you can share",
        ],
        link: "/pricing",
        cta: "Get Started",
        variant: "light" as const,
    },
    {
        icon: <LucideBuilding2 className="w-6 h-6" />,
        title: "Corporate Teams",
        description:
            "Protect your people at scale. Meet duty-of-care obligations and keep every traveler informed.",
        features: [
            "Bulk employee travel assessments",
            "Compliance-ready health reports",
            "Dashboard for HR & travel managers",
            "Duty-of-care documentation",
            "API integration with travel platforms",
        ],
        link: "/pricing?tab=company",
        cta: "Get Started",
        variant: "dark" as const,
    },

    {
        icon: <LucideUsers className="w-6 h-6" />,
        title: "Families",
        description:
            "Multi-generational trips made simple. Plans tailored for children, seniors, and everyone in between.",
        features: [
            "Age-specific vaccination guidance",
            "Family medication packing lists",
            "Paediatric and geriatric risk flags",
            "Shared family health dashboard",
        ],
        link: "/pricing",
        cta: "Get Started",
        variant: "light" as const,
    },
];

const AudienceSection = () => {
    return (
        <section className="px-8 lg:px-16 pt-24 pb-16 max-w-7xl mx-auto">
            <AnimateIn className="text-center mb-14">
                <SectionEyebrow className="mb-6">Built for everyone</SectionEyebrow>
                <h2 className="text-4xl md:text-5xl lg:text-6xl text-heading leading-[1.1] font-serif">
                    Wherever you&apos;re <span className="italic">going.</span>
                </h2>
            </AnimateIn>

            <StaggerGroup
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                stagger={0.1}
            >
                {audiences.map((a) => {
                    const isDark = a.variant === "dark";
                    return (
                        <motion.div
                            variants={staggerItem}
                            key={a.title}
                            className={`relative rounded-3xl p-8 md:p-10 flex flex-col justify-between overflow-hidden ${isDark ? "" : "bg-button-secondary"}`}
                        >
                            {isDark && (
                                <div
                                    className="absolute inset-0"
                                    style={{
                                        background:
                                            "linear-gradient(135deg, #2a7a6a 0%, #1a6a7a 30%, #187080 55%, #1a6878 80%, #246858 100%)",
                                    }}
                                />
                            )}
                            <div className="relative z-10">
                                <div
                                    className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 ${isDark ? "" : "bg-heading text-background-primary"}`}
                                    style={
                                        isDark
                                            ? {
                                                background:
                                                    "rgba(255,255,255,0.15)",
                                            }
                                            : undefined
                                    }
                                >
                                    <span
                                        className={
                                            isDark ? "text-white" : ""
                                        }
                                    >
                                        {a.icon}
                                    </span>
                                </div>
                                <h3
                                    className={`text-2xl font-serif mb-2 ${isDark ? "text-white" : "text-heading"}`}
                                >
                                    {a.title}
                                </h3>
                                <p
                                    className={`text-sm leading-relaxed mb-6 ${isDark ? "text-white/70" : "text-body"}`}
                                >
                                    {a.description}
                                </p>
                                <ul className="space-y-3 mb-8">
                                    {a.features.map((f) => (
                                        <li
                                            key={f}
                                            className={`flex items-start gap-3 text-sm ${isDark ? "text-white" : "text-heading"}`}
                                        >
                                            <LucideCheck
                                                className={`w-4 h-4 mt-0.5 shrink-0 ${isDark ? "text-white/60" : "text-accent"}`}
                                            />
                                            {f}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <Button
                                variant={isDark ? "primary" : "secondary"}
                                link={a.link}
                                icon={<LucideArrowRight />}
                                className={`relative z-10 self-start ${isDark ? "bg-white text-dark! hover:bg-white/90" : ""}`}
                            >
                                {a.cta}
                            </Button>
                        </motion.div>
                    );
                })}
            </StaggerGroup>
        </section>
    );
};

export default AudienceSection;
