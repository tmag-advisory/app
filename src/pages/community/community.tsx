import {
    LucideUsers,
    LucideMessageCircle,
    LucideGlobe,
    LucideHeart,
    LucideArrowRight,
} from "lucide-react";
import { motion } from "framer-motion";
import AnimateIn from "../../components/animations/AnimateIn";
import StaggerGroup, { staggerItem } from "../../components/animations/StaggerGroup";
import Button from "../../components/ui/Button";

const channels = [
    {
        icon: <LucideMessageCircle className="w-6 h-6" />,
        title: "Discussion forum",
        description:
            "Ask questions, share trip reports, and exchange travel health tips with fellow travelers.",
        cta: "Join discussions",
    },
    {
        icon: <LucideUsers className="w-6 h-6" />,
        title: "Community meetups",
        description:
            "Virtual and in-person meetups for travelers, health professionals, and TMAG enthusiasts.",
        cta: "View events",
    },
    {
        icon: <LucideGlobe className="w-6 h-6" />,
        title: "Destination guides",
        description:
            "Community-curated health guides for popular destinations, maintained by experienced travelers.",
        cta: "Browse guides",
    },
    {
        icon: <LucideHeart className="w-6 h-6" />,
        title: "Ambassador program",
        description:
            "Help spread the word about travel health. Get early access to features, swag, and credits.",
        cta: "Learn more",
    },
];

const communityStats = [
    // { value: "12K+", label: "Community members" },
    // { value: "3K+", label: "Trip reports shared" },
    // { value: "85+", label: "Destination guides" },
    { value: "24", label: "Countries represented" },
];

const Community = () => {
    return (
        <main>
            {/* Hero */}
            <AnimateIn as="section" className="flex flex-col items-center text-center pt-20 pb-12 px-6">
                <span className="inline-block text-sm text-muted bg-button-secondary font-semibold rounded-xl px-4 py-1.5 mb-6">
                    Community
                </span>
                <h1 className="text-5xl md:text-6xl lg:text-7xl leading-[0.9] text-heading font-serif max-w-3xl">
                    Travel healthy,{" "}
                    <span className="italic">together.</span>
                </h1>
                <p className="sm:text-lg text-body mt-6 max-w-xl leading-relaxed">
                    Connect with fellow travelers, share experiences, and help
                    each other stay safe abroad.
                </p>
            </AnimateIn>

            {/* Stats */}
            <section className="px-8 lg:px-16 pb-16 max-w-4xl mx-auto">
                <StaggerGroup stagger={0.1} className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {communityStats.map((stat) => (
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

            {/* Channels */}
            <div className="bg-background-secondary">
                <section className="px-8 lg:px-16 py-24 max-w-7xl mx-auto">
                    <AnimateIn className="text-center mb-14">
                        <span className="inline-block text-sm text-muted bg-button-secondary font-semibold rounded-xl px-4 py-1.5 mb-6">
                            Get involved
                        </span>
                        <h2 className="text-4xl md:text-5xl text-heading leading-[1.1] font-serif">
                            Ways to <span className="italic">connect.</span>
                        </h2>
                    </AnimateIn>
                    <StaggerGroup stagger={0.12} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {channels.map((channel) => (
                            <motion.div
                                key={channel.title}
                                variants={staggerItem}
                                className="bg-background-primary rounded-2xl p-8 md:p-10"
                            >
                                <div className="w-12 h-12 rounded-xl bg-dark text-background-primary flex items-center justify-center mb-6">
                                    {channel.icon}
                                </div>
                                <h3 className="text-xl font-serif text-heading mb-3">
                                    {channel.title}
                                </h3>
                                <p className="text-sm text-body leading-relaxed mb-6">
                                    {channel.description}
                                </p>
                                <Button variant="secondary"  icon={<LucideArrowRight />}>
                                    {channel.cta}
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
                        Join the community.
                    </h2>
                    <p className="text-sm text-body leading-relaxed max-w-md mx-auto mb-8">
                        Free to join. Connect with travelers, share tips, and
                        stay informed about travel health worldwide.
                    </p>
                    <Button variant="primary" link="/register">Get started</Button>
                </AnimateIn>
            </section>
        </main>
    );
};

export default Community;
