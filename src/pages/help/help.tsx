import {
    LucideBookOpen,
    LucideMessageCircle,
    LucideLifeBuoy,
    LucideMail,
    LucideArrowRight,
    LucideSearch,
} from "lucide-react";
import { motion } from "framer-motion";
import AnimateIn from "../../components/animations/AnimateIn";
import StaggerGroup, { staggerItem } from "../../components/animations/StaggerGroup";
import Button from "../../components/ui/Button";
import { Link } from "react-router-dom";
import SEOHead from "../../lib/seo";
import SectionEyebrow from "../../components/ui/SectionEyebrow";

const helpCategories = [
    {
        icon: <LucideBookOpen className="w-6 h-6" />,
        title: "Getting started",
        description:
            "Learn how to create your account, set up your health profile, and generate your first travel health plan.",
        articleCount: 8,
    },
    {
        icon: <LucideLifeBuoy className="w-6 h-6" />,
        title: "Plans & credits",
        description:
            "Understand how credits work, what's included in a plan, and how to manage your billing.",
        articleCount: 12,
    },
    {
        icon: <LucideMessageCircle className="w-6 h-6" />,
        title: "Account & privacy",
        description:
            "Manage your account settings, data privacy preferences, and learn how we protect your information.",
        articleCount: 6,
    },
    {
        icon: <LucideMail className="w-6 h-6" />,
        title: "Corporate accounts",
        description:
            "Set up your HR dashboard, manage member travel, and configure compliance reporting.",
        articleCount: 10,
    },
];

const popularArticles = [
    "How do I generate my first travel health plan?",
    "What's included in a TMAG plan?",
    "How do credits work?",
    "Can I share my plan with my doctor?",
    "How do I delete my account and data?",
    "What data sources does TMAG use?",
];

const HelpCenter = () => {
    return (
        <main>
            <SEOHead title="Help Center — Travel Medicine Advisory Global" description="Find answers, guides, and support for TMAG travel health plans, account management, and billing." path="/help" />
            {/* Hero */}
            <AnimateIn as="section" className="flex flex-col items-center text-center pt-20 pb-12 px-6">
                <SectionEyebrow className="mb-6">Help Center</SectionEyebrow>
                <h1 className="text-5xl md:text-6xl lg:text-7xl leading-[0.9] text-heading font-serif max-w-3xl">
                    How can we{" "}
                    <span className="italic">help?</span>
                </h1>
                <p className="sm:text-lg text-body mt-6 max-w-xl leading-relaxed">
                    Find answers, guides, and resources to get the most out of
                    TMAG.
                </p>

                {/* Search */}
                <div className="flex items-stretch gap-3 mt-8 w-full max-w-lg">
                    <div className="flex-1 flex items-center bg-button-secondary border border-border-light rounded-xl px-4 py-3 gap-3">
                        <LucideSearch className="w-4 h-4 text-muted shrink-0" />
                        <input
                            type="text"
                            placeholder="Search help articles..."
                            className="flex-1 bg-transparent text-sm text-heading placeholder:text-muted outline-none"
                        />
                    </div>
                </div>
            </AnimateIn>

            {/* Categories */}
            <section className="px-8 lg:px-16 py-24 max-w-7xl mx-auto">
                <StaggerGroup stagger={0.12} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {helpCategories.map((cat) => (
                        <motion.div
                            key={cat.title}
                            variants={staggerItem}
                            className="bg-button-secondary rounded-2xl p-8 md:p-10 cursor-pointer hover:ring-1 hover:ring-border-light transition-all duration-200 group"
                        >
                            <div className="w-12 h-12 rounded-xl bg-dark text-background-primary flex items-center justify-center mb-6">
                                {cat.icon}
                            </div>
                            <h3 className="text-xl font-serif text-heading mb-3 group-hover:text-accent transition-colors duration-200">
                                {cat.title}
                            </h3>
                            <p className="text-sm text-body leading-relaxed mb-4">
                                {cat.description}
                            </p>
                            <span className="text-xs text-muted">
                                {cat.articleCount} articles
                            </span>
                        </motion.div>
                    ))}
                </StaggerGroup>
            </section>

            {/* Popular articles */}
            <div className="bg-background-secondary">
                <section className="px-8 lg:px-16 py-24 max-w-4xl mx-auto">
                    <AnimateIn className="mb-10">
                        <h2 className="text-2xl font-serif text-heading">
                            Popular articles
                        </h2>
                    </AnimateIn>
                    <StaggerGroup stagger={0.06} className="space-y-3">
                        {popularArticles.map((article) => (
                            <motion.div
                                key={article}
                                variants={staggerItem}
                                className="bg-background-primary rounded-2xl p-5 flex items-center justify-between gap-4 cursor-pointer group hover:ring-1 hover:ring-border-light transition-all duration-200"
                            >
                                <span className="text-sm font-semibold text-heading group-hover:text-accent transition-colors duration-200">
                                    {article}
                                </span>
                                <LucideArrowRight className="w-4 h-4 text-muted shrink-0 group-hover:text-accent transition-colors duration-200" />
                            </motion.div>
                        ))}
                    </StaggerGroup>
                </section>
            </div>

            {/* Contact CTA */}
            <section className="px-8 lg:px-16 py-24 max-w-4xl mx-auto text-center">
                <AnimateIn type="fade">
                    <h2 className="text-3xl md:text-4xl text-heading leading-[1.1] font-serif mb-4">
                        Still need help?
                    </h2>
                    <p className="text-sm text-body leading-relaxed max-w-md mx-auto mb-8">
                        Our support team typically responds within 24 hours.
                        Check our{" "}
                        <Link to="/faq" className="text-accent underline">
                            FAQ
                        </Link>{" "}
                        for quick answers.
                    </p>
                    <Button variant="primary" link="/contact?type=SUPPORT">Contact support</Button>
                </AnimateIn>
            </section>
        </main>
    );
};

export default HelpCenter;
1