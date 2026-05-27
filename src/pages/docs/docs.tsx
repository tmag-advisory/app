import {
    LucideBookOpen,
    LucideCode,
    LucideArrowRight,
    LucideTerminal,
    LucideDatabase,
} from "lucide-react";
import { motion } from "framer-motion";
import AnimateIn from "../../components/animations/AnimateIn";
import StaggerGroup, { staggerItem } from "../../components/animations/StaggerGroup";
import Button from "../../components/ui/Button";
import SEOHead from "../../lib/seo";
import SectionEyebrow from "../../components/ui/SectionEyebrow";

const docSections = [
    {
        icon: <LucideBookOpen className="w-6 h-6" />,
        title: "Quickstart guide",
        description:
            "Get up and running with TMAG in under 5 minutes. Create your account, configure your profile, and generate your first plan.",
    },
    {
        icon: <LucideTerminal className="w-6 h-6" />,
        title: "API reference",
        description:
            "Full REST API documentation for corporate integrations. Authenticate, create plans, manage users, and retrieve health data programmatically.",
    },
    {
        icon: <LucideCode className="w-6 h-6" />,
        title: "Webhooks",
        description:
            "Configure real-time notifications for plan generation, outbreak alerts, and compliance events via webhook endpoints.",
    },
    {
        icon: <LucideDatabase className="w-6 h-6" />,
        title: "Data sources",
        description:
            "Learn about the health authorities and databases that power TMAG recommendations, including WHO, CDC, ECDC, and local ministries.",
    },
];

const codeExample = `// Generate a travel health plan
const response = await fetch('https://api.tmag.health/v1/plans', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    destination: 'TH',
    departure_date: '2026-04-15',
    return_date: '2026-04-30',
  }),
});

const plan = await response.json();`;

const Documentation = () => {
    return (
        <main>
            <SEOHead title="Documentation — Travel Medicine Advisory Global" description="Developer documentation, API reference, and integration guides for TMAG platform." path="/docs" />
            {/* Hero */}
            <AnimateIn as="section" className="flex flex-col items-center text-center pt-20 pb-12 px-6">
                <SectionEyebrow className="mb-6">Documentation</SectionEyebrow>
                <h1 className="text-5xl md:text-6xl lg:text-7xl leading-[0.9] text-heading font-serif max-w-3xl">
                    Build with{" "}
                    <span className="italic">TMAG.</span>
                </h1>
                <p className="sm:text-lg text-body mt-6 max-w-xl leading-relaxed">
                    Guides, API reference, and resources for integrating TMAG
                    into your workflow.
                </p>
            </AnimateIn>

            {/* Doc sections */}
            <section className="px-8 lg:px-16 py-24 max-w-7xl mx-auto">
                <StaggerGroup stagger={0.12} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {docSections.map((doc) => (
                        <motion.div
                            key={doc.title}
                            variants={staggerItem}
                            className="bg-button-secondary rounded-2xl p-8 md:p-10 cursor-pointer hover:ring-1 hover:ring-border-light transition-all duration-200 group"
                        >
                            <div className="w-12 h-12 rounded-xl bg-dark text-background-primary flex items-center justify-center mb-6">
                                {doc.icon}
                            </div>
                            <h3 className="text-xl font-serif text-heading mb-3 group-hover:text-accent transition-colors duration-200">
                                {doc.title}
                            </h3>
                            <p className="text-sm text-body leading-relaxed">
                                {doc.description}
                            </p>
                        </motion.div>
                    ))}
                </StaggerGroup>
            </section>

            {/* Code example */}
            <div className="bg-background-secondary">
                <section className="px-8 lg:px-16 py-24 max-w-4xl mx-auto">
                    <AnimateIn className="mb-10">
                        <SectionEyebrow className="mb-6">Quick example</SectionEyebrow>
                        <h2 className="text-4xl md:text-5xl text-heading leading-[1.1] font-serif">
                            One API call.{" "}
                            <span className="italic">Full plan.</span>
                        </h2>
                    </AnimateIn>
                    <AnimateIn type="fade" delay={0.1}>
                        <div className="bg-dark rounded-2xl p-6 md:p-8 overflow-x-auto">
                            <pre className="text-sm text-white/70 leading-relaxed font-mono">
                                <code>{codeExample}</code>
                            </pre>
                        </div>
                    </AnimateIn>
                </section>
            </div>

            {/* CTA */}
            <section className="px-8 lg:px-16 py-24 max-w-4xl mx-auto text-center">
                <AnimateIn type="fade">
                    <h2 className="text-3xl md:text-4xl text-heading leading-[1.1] font-serif mb-4">
                        Ready to integrate?
                    </h2>
                    <p className="text-sm text-body leading-relaxed max-w-md mx-auto mb-8">
                        Get your API key and start building. Our team is
                        available to help with custom integrations.
                    </p>
                    <div className="flex items-center justify-center gap-4 flex-wrap">
                        <Button variant="primary">Get API key</Button>
                        <Button variant="secondary" icon={<LucideArrowRight />}>
                            Contact sales
                        </Button>
                    </div>
                </AnimateIn>
            </section>
        </main>
    );
};

export default Documentation;
