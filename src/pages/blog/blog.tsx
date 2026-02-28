import { LucideArrowRight, LucideClock } from "lucide-react";
import { motion } from "framer-motion";
import AnimateIn from "../../components/animations/AnimateIn";
import StaggerGroup, { staggerItem } from "../../components/animations/StaggerGroup";
import Button from "../../components/ui/Button";

const featuredPost = {
    title: "How AI Is Changing Travel Health Preparation",
    excerpt:
        "From outbreak tracking to personalized vaccination schedules, artificial intelligence is transforming how travelers prepare for trips abroad.",
    category: "Product",
    date: "Feb 20, 2026",
    readTime: "6 min read",
};

const posts = [
    {
        title: "Understanding Yellow Fever Zones: A 2026 Update",
        category: "Travel Health",
        date: "Feb 14, 2026",
        readTime: "4 min read",
    },
    {
        title: "Why Your Company Needs a Travel Health Policy",
        category: "Corporate",
        date: "Feb 8, 2026",
        readTime: "5 min read",
    },
    {
        title: "Malaria Prevention: What Every Traveler Should Know",
        category: "Travel Health",
        date: "Jan 30, 2026",
        readTime: "7 min read",
    },
    {
        title: "TMAG's Approach to Responsible AI in Healthcare",
        category: "Engineering",
        date: "Jan 22, 2026",
        readTime: "8 min read",
    },
    {
        title: "Traveler's Diarrhea: Prevention Beats Cure",
        category: "Travel Health",
        date: "Jan 15, 2026",
        readTime: "4 min read",
    },
    {
        title: "How We Built Our Health Data Pipeline",
        category: "Engineering",
        date: "Jan 8, 2026",
        readTime: "10 min read",
    },
];

const Blog = () => {
    return (
        <main>
            {/* Hero */}
            <AnimateIn as="section" className="flex flex-col items-center text-center pt-20 pb-12 px-6">
                <span className="inline-block text-sm text-muted bg-button-secondary font-semibold rounded-xl px-4 py-1.5 mb-6">
                    Blog
                </span>
                <h1 className="text-5xl md:text-6xl lg:text-7xl leading-[0.9] text-heading font-serif max-w-3xl">
                    Insights &{" "}
                    <span className="italic">updates.</span>
                </h1>
                <p className="sm:text-lg text-body mt-6 max-w-xl leading-relaxed">
                    Travel health tips, product updates, and behind-the-scenes
                    from the TMAG team.
                </p>
            </AnimateIn>

            {/* Featured post */}
            <section className="px-8 lg:px-16 pb-16 max-w-4xl mx-auto">
                <AnimateIn type="fade">
                    <div className="bg-button-secondary rounded-2xl p-8 md:p-10">
                        <span className="inline-block text-xs text-muted bg-background-primary font-semibold rounded-lg px-3 py-1 mb-4">
                            {featuredPost.category}
                        </span>
                        <h2 className="text-2xl md:text-3xl font-serif text-heading leading-tight mb-3">
                            {featuredPost.title}
                        </h2>
                        <p className="text-sm text-body leading-relaxed mb-6 max-w-2xl">
                            {featuredPost.excerpt}
                        </p>
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <div className="flex items-center gap-2 text-xs text-muted">
                                <LucideClock className="w-3.5 h-3.5" />
                                <span>{featuredPost.date} · {featuredPost.readTime}</span>
                            </div>
                            <Button variant="secondary" icon={<LucideArrowRight />}>
                                Read article
                            </Button>
                        </div>
                    </div>
                </AnimateIn>
            </section>

            {/* All posts */}
            <div className="bg-background-secondary">
                <section className="px-8 lg:px-16 py-24 max-w-4xl mx-auto">
                    <AnimateIn className="mb-10">
                        <h2 className="text-2xl font-serif text-heading">
                            All posts
                        </h2>
                    </AnimateIn>
                    <StaggerGroup stagger={0.08} className="space-y-3">
                        {posts.map((post) => (
                            <motion.div
                                key={post.title}
                                variants={staggerItem}
                                className="bg-background-primary rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group cursor-pointer hover:ring-1 hover:ring-border-light transition-all duration-200"
                            >
                                <div>
                                    <span className="inline-block text-xs text-muted bg-button-secondary font-semibold rounded-lg px-2.5 py-0.5 mb-2">
                                        {post.category}
                                    </span>
                                    <h3 className="text-sm font-semibold text-heading group-hover:text-accent transition-colors duration-200">
                                        {post.title}
                                    </h3>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-muted shrink-0">
                                    <LucideClock className="w-3.5 h-3.5" />
                                    <span>{post.date} · {post.readTime}</span>
                                </div>
                            </motion.div>
                        ))}
                    </StaggerGroup>
                </section>
            </div>

            {/* Newsletter CTA */}
            <section className="px-8 lg:px-16 py-24 max-w-4xl mx-auto text-center">
                <AnimateIn type="fade">
                    <h2 className="text-3xl md:text-4xl text-heading leading-[1.1] font-serif mb-4">
                        Stay in the loop.
                    </h2>
                    <p className="text-sm text-body leading-relaxed max-w-md mx-auto mb-8">
                        Get the latest travel health insights delivered to your
                        inbox every week.
                    </p>
                    <Button variant="primary">Subscribe to newsletter</Button>
                </AnimateIn>
            </section>
        </main>
    );
};

export default Blog;
