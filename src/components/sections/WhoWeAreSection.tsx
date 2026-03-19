import { LucideArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import Button from "../ui/Button";
import AnimateIn from "../animations/AnimateIn";
import StaggerGroup, { staggerItem } from "../animations/StaggerGroup";

const stats = [
    { value: "1,500+", label: "Travelers advised monthly" },
    { value: "35%", label: "Fewer travel health incidents" },
    { value: "45 days", label: "Average prep-to-departure time" },
];

const WhoWeAreSection = () => {
    return (
        <div className="bg-background-secondary">
            <section className="px-8 lg:px-16 pt-24 pb-16 max-w-7xl mx-auto">
                {/* Header area */}
                <AnimateIn className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-14">
                    <div>
                        <span className="inline-block text-sm text-muted bg-button-secondary font-semibold rounded-xl px-4 py-1.5 mb-6">
                            Who we are
                        </span>
                        <h2 className="text-4xl md:text-5xl lg:text-6xl text-heading leading-[1.1] font-serif">
                            The travel health advisory
                            <br />
                            built for <span className="italic">you.</span>
                        </h2>
                    </div>
                    <p className="text-sm text-muted leading-relaxed max-w-sm md:mt-10 font-medium">
                        Founded by a travel medicine physician with 15 years of clinical experience, 
                        TMAG combines medical expertise with AI to deliver evidence-based travel health guidance. 
                        We listen first, recommend only what works, and build personalized plans you'll actually use—without the confusion or complexity.
                    </p>
                </AnimateIn>

                {/* Stats banner with background image */}
                <div className="relative rounded-3xl overflow-hidden min-h-95 md:h-75">
                    {/* Gradient background */}
                    <div
                        className="absolute inset-0"
                        style={{
                            background:
                                "linear-gradient(135deg, #2a7a6a 0%, #1a6a7a 30%, #187080 55%, #1a6878 80%, #246858 100%)",
                        }}
                    />

                    {/* Warm glow accent */}
                    <div
                        className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-75 h-75 rounded-full"
                        style={{
                            background:
                                "radial-gradient(circle, rgba(240,160,96,0.7) 0%, rgba(232,120,80,0.3) 40%, transparent 70%)",
                            filter: "blur(40px)",
                        }}
                    />

                    {/* Stat cards */}
                    <div className="relative z-10 h-full flex items-center justify-center px-4">
                        <StaggerGroup className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 w-full max-w-4xl" stagger={0.15}>
                            {stats.map((stat) => (
                                <motion.div
                                    variants={staggerItem}
                                    key={stat.value}
                                    className="flex flex-col items-center justify-center aspect-video w-2xs rounded-2xl text-center"
                                    style={{
                                        background: "rgba(255,255,255,0.102)",
                                        backdropFilter: "blur(16px)",
                                        WebkitBackdropFilter: "blur(16px)",
                                        border: "1px solid rgba(255,255,255,0.18)",
                                    }}
                                >
                                    <span className="text-4xl md:text-5xl font-serif text-white leading-none mb-2">
                                        {stat.value}
                                    </span>
                                    <span className="text-sm text-white/70">
                                        {stat.label}
                                    </span>
                                </motion.div>
                            ))}
                        </StaggerGroup>
                    </div>
                </div>

                {/* Recruitment banner */}
                <AnimateIn delay={0.2} className="mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-button-secondary rounded-2xl px-6 md:px-8 py-5">
                    <div>
                        <div className="flex items-center gap-3 mb-1 flex-wrap">
                            <h3 className="text-base font-semibold text-heading">
                                Want to be part of the team?
                            </h3>
                            <span className="text-xs text-muted border border-border rounded-full px-3 py-0.5">
                                3 vacancies available
                            </span>
                        </div>
                        <p className="text-sm text-body max-w-2xl">
                            We're always looking for talented people who want to help
                            travelers cut through health confusion and build plans
                            that work.
                        </p>
                    </div>
                    <Button variant="primary" className="shrink-0 border" icon={<LucideArrowRight />}>
                        Apply now
                    </Button>
                </AnimateIn>
            </section >
        </div >
    );
};

export default WhoWeAreSection;
