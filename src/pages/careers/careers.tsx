import {
    LucideGlobe,
    LucideHeart,
    LucideRocket,
    LucideShieldCheck,
    LucideArrowRight,
} from "lucide-react";
import { motion } from "framer-motion";
import AnimateIn from "../../components/animations/AnimateIn";
import StaggerGroup, { staggerItem } from "../../components/animations/StaggerGroup";
import Button from "../../components/ui/Button";

const perks = [
    {
        icon: <LucideGlobe className="w-6 h-6" />,
        title: "Remote-first",
        description:
            "Work from anywhere in the world. We're a distributed team across multiple time zones.",
    },
    {
        icon: <LucideHeart className="w-6 h-6" />,
        title: "Health-first culture",
        description:
            "Comprehensive health coverage, mental health support, and generous PTO—because we practice what we preach.",
    },
    {
        icon: <LucideRocket className="w-6 h-6" />,
        title: "Growth budget",
        description:
            "Annual learning stipend for conferences, courses, and books. We invest in your professional development.",
    },
    {
        icon: <LucideShieldCheck className="w-6 h-6" />,
        title: "Meaningful work",
        description:
            "Help millions of travelers stay safe. Your work directly impacts people's health and well-being.",
    },
];

const openings = [
    {
        title: "Senior Full-Stack Engineer",
        team: "Engineering",
        location: "Remote",
    },
    {
        title: "ML Engineer — Health Data",
        team: "Data & Intelligence",
        location: "Remote",
    },
    {
        title: "Product Designer",
        team: "Design",
        location: "Remote",
    },
    {
        title: "Head of Partnerships",
        team: "Business",
        location: "Remote / San Francisco",
    },
    {
        title: "Technical Writer",
        team: "Content",
        location: "Remote",
    },
];

const Careers = () => {
    return (
        <main>
            {/* Hero */}
            <AnimateIn as="section" className="flex flex-col items-center text-center pt-20 pb-12 px-6">
                <span className="inline-block text-sm text-muted bg-button-secondary font-semibold rounded-xl px-4 py-1.5 mb-6">
                    Careers
                </span>
                <h1 className="text-5xl md:text-6xl lg:text-7xl leading-[0.9] text-heading font-serif max-w-3xl">
                    Build the future of{" "}
                    <span className="italic">travel health.</span>
                </h1>
                <p className="sm:text-lg text-body mt-6 max-w-xl leading-relaxed">
                    Join a mission-driven team making travel health advice
                    accessible to everyone, everywhere.
                </p>
            </AnimateIn>

            {/* Perks */}
            <section className="px-8 lg:px-16 py-24 max-w-7xl mx-auto">
                <AnimateIn className="text-center mb-14">
                    <span className="inline-block text-sm text-muted bg-button-secondary font-semibold rounded-xl px-4 py-1.5 mb-6">
                        Why TMAG
                    </span>
                    <h2 className="text-4xl md:text-5xl text-heading leading-[1.1] font-serif">
                        Perks that <span className="italic">matter.</span>
                    </h2>
                </AnimateIn>
                <StaggerGroup stagger={0.12} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {perks.map((perk) => (
                        <motion.div
                            key={perk.title}
                            variants={staggerItem}
                            className="bg-button-secondary rounded-2xl p-8 md:p-10"
                        >
                            <div className="w-12 h-12 rounded-xl bg-dark text-background-primary flex items-center justify-center mb-6">
                                {perk.icon}
                            </div>
                            <h3 className="text-xl font-serif text-heading mb-3">
                                {perk.title}
                            </h3>
                            <p className="text-sm text-body leading-relaxed">
                                {perk.description}
                            </p>
                        </motion.div>
                    ))}
                </StaggerGroup>
            </section>

            {/* Open positions */}
            <div className="bg-background-secondary">
                <section className="px-8 lg:px-16 py-24 max-w-4xl mx-auto">
                    <AnimateIn className="text-center mb-14">
                        <span className="inline-block text-sm text-muted bg-button-secondary font-semibold rounded-xl px-4 py-1.5 mb-6">
                            Open roles
                        </span>
                        <h2 className="text-4xl md:text-5xl text-heading leading-[1.1] font-serif">
                            Current <span className="italic">openings.</span>
                        </h2>
                    </AnimateIn>
                    <StaggerGroup stagger={0.08} className="space-y-3">
                        {openings.map((job) => (
                            <motion.div
                                key={job.title}
                                variants={staggerItem}
                                className="bg-background-primary rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                            >
                                <div>
                                    <h3 className="text-sm font-semibold text-heading">
                                        {job.title}
                                    </h3>
                                    <p className="text-xs text-muted mt-1">
                                        {job.team} · {job.location}
                                    </p>
                                </div>
                                <Button variant="secondary"  icon={<LucideArrowRight />}>
                                    View role
                                </Button>
                            </motion.div>
                        ))}
                    </StaggerGroup>
                </section>
            </div>

            {/* CTA */}
            <section className="px-8 lg:px-16 py-24 max-w-4xl mx-auto text-center">
                <AnimateIn type="fade">
                    <h2 className="text-3xl md:text-4xl text-heading leading-[1.1] font-serif mb-4">
                        Don't see the right role?
                    </h2>
                    <p className="text-sm text-body leading-relaxed max-w-md mx-auto mb-8">
                        We're always looking for talented people. Send us your resume
                        and we'll keep you in mind for future openings.
                    </p>
                    <Button variant="primary">
                        Send open application
                    </Button>
                </AnimateIn>
            </section>
        </main>
    );
};

export default Careers;
