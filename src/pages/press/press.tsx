import { LucideArrowRight, LucideDownload, LucideMail } from "lucide-react";
import { motion } from "framer-motion";
import AnimateIn from "../../components/animations/AnimateIn";
import StaggerGroup, { staggerItem } from "../../components/animations/StaggerGroup";
import Button from "../../components/ui/Button";

const pressReleases = [
    {
        title: "TMAG Launches AI-Powered Travel Health Platform",
        date: "Feb 2026",
        excerpt:
            "TMAG announces the public launch of its AI-powered travel health advisory platform, making personalized travel health plans accessible to individuals and companies worldwide.",
    },
    {
        title: "TMAG Raises Seed Round to Expand Global Health Coverage",
        date: "Jan 2026",
        excerpt:
            "TMAG secures seed funding to expand its health data sources and bring travel medicine guidance to underserved markets.",
    },
    {
        title: "Partnership with WHO Data Services Announced",
        date: "Dec 2025",
        excerpt:
            "TMAG integrates real-time WHO health alert data into its platform, providing travelers with the most current outbreak information available.",
    },
];

const stats = [
    { value: "190+", label: "Countries covered" },
    { value: "50K+", label: "Plans generated" },
    { value: "99.9%", label: "Uptime" },
    { value: "4.9★", label: "User rating" },
];

const Press = () => {
    return (
        <main>
            {/* Hero */}
            <AnimateIn as="section" className="flex flex-col items-center text-center pt-20 pb-12 px-6">
                <span className="inline-block text-sm text-muted bg-button-secondary font-semibold rounded-xl px-4 py-1.5 mb-6">
                    Press
                </span>
                <h1 className="text-5xl md:text-6xl lg:text-7xl leading-[0.9] text-heading font-serif max-w-3xl">
                    TMAG in the{" "}
                    <span className="italic">news.</span>
                </h1>
                <p className="sm:text-lg text-body mt-6 max-w-xl leading-relaxed">
                    Press releases, media resources, and company milestones.
                </p>
            </AnimateIn>

            {/* Stats */}
            <section className="px-8 lg:px-16 pb-16 max-w-4xl mx-auto">
                <StaggerGroup stagger={0.1} className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {stats.map((stat) => (
                        <motion.div
                            key={stat.label}
                            variants={staggerItem}
                            className="bg-button-secondary rounded-2xl p-6 text-center"
                        >
                            <p className="text-3xl font-serif text-heading mb-1">
                                {stat.value}
                            </p>
                            <p className="text-xs text-muted">{stat.label}</p>
                        </motion.div>
                    ))}
                </StaggerGroup>
            </section>

            {/* Press releases */}
            <div className="bg-background-secondary">
                <section className="px-8 lg:px-16 py-24 max-w-4xl mx-auto">
                    <AnimateIn className="mb-10">
                        <h2 className="text-2xl font-serif text-heading">
                            Press releases
                        </h2>
                    </AnimateIn>
                    <StaggerGroup stagger={0.1} className="space-y-4">
                        {pressReleases.map((pr) => (
                            <motion.div
                                key={pr.title}
                                variants={staggerItem}
                                className="bg-background-primary rounded-2xl p-6 md:p-8"
                            >
                                <p className="text-xs text-muted mb-2">{pr.date}</p>
                                <h3 className="text-lg font-serif text-heading mb-2">
                                    {pr.title}
                                </h3>
                                <p className="text-sm text-body leading-relaxed mb-4">
                                    {pr.excerpt}
                                </p>
                                <Button variant="secondary"  icon={<LucideArrowRight />}>
                                    Read more
                                </Button>
                            </motion.div>
                        ))}
                    </StaggerGroup>
                </section>
            </div>

            {/* Media kit & contact */}
            <section className="px-8 lg:px-16 py-24 max-w-4xl mx-auto">
                <div className="flex flex-col md:flex-row gap-6">
                    <AnimateIn type="fadeLeft" className="flex-1">
                        <div className="bg-button-secondary rounded-2xl p-8 h-full">
                            <div className="w-12 h-12 rounded-xl bg-dark text-background-primary flex items-center justify-center mb-6">
                                <LucideDownload className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-serif text-heading mb-3">
                                Media kit
                            </h3>
                            <p className="text-sm text-body leading-relaxed mb-6">
                                Download logos, brand guidelines, and product
                                screenshots for editorial use.
                            </p>
                            <Button variant="secondary"  icon={<LucideDownload />}>
                                Download media kit
                            </Button>
                        </div>
                    </AnimateIn>
                    <AnimateIn type="fadeRight" delay={0.1} className="flex-1">
                        <div className="bg-button-secondary rounded-2xl p-8 h-full">
                            <div className="w-12 h-12 rounded-xl bg-dark text-background-primary flex items-center justify-center mb-6">
                                <LucideMail className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-serif text-heading mb-3">
                                Press inquiries
                            </h3>
                            <p className="text-sm text-body leading-relaxed mb-6">
                                For interviews, quotes, or media inquiries, reach
                                out to our communications team.
                            </p>
                            <Button variant="secondary"  icon={<LucideArrowRight />}>
                                press@tmag.health
                            </Button>
                        </div>
                    </AnimateIn>
                </div>
            </section>
        </main>
    );
};

export default Press;
