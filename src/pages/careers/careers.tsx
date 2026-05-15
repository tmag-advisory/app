import { motion } from "framer-motion";
import {
    LucideStethoscope,
    LucideHandshake,
    LucideArrowRight,
    LucideShieldCheck,
    LucideStar,
    LucideFileText,
    LucidePercent,
    LucideTrendingUp,
    LucideUsers,
} from "lucide-react";
import { Link } from "react-router-dom";
import AnimateIn from "../../components/animations/AnimateIn";
import StaggerGroup, { staggerItem } from "../../components/animations/StaggerGroup";
import Button from "../../components/ui/Button";
import SEOHead from "../../lib/seo";

const doctorBenefits = [
    {
        icon: <LucideShieldCheck className="w-5 h-5" />,
        title: "Validate Travel Plans",
        description:
            "Review and approve AI-generated travel medicine recommendations with your medical expertise.",
    },
    {
        icon: <LucideStar className="w-5 h-5" />,
        title: "Impact Global Health",
        description:
            "Help millions of travellers stay safe by providing professional medical oversight on every plan.",
    },
    {
        icon: <LucideFileText className="w-5 h-5" />,
        title: "Structured Onboarding",
        description:
            "Get up to speed quickly with platform guides, review protocols, and clear SLAs.",
    },
];

const affiliateBenefits = [
    {
        icon: <LucidePercent className="w-5 h-5" />,
        title: "Competitive Commission",
        description:
            "Earn recurring commissions on every traveller you refer to TMAG.",
    },
    {
        icon: <LucideTrendingUp className="w-5 h-5" />,
        title: "Real-Time Analytics",
        description:
            "Track referrals, conversions, and payouts from your affiliate dashboard.",
    },
    {
        icon: <LucideUsers className="w-5 h-5" />,
        title: "Grow Your Audience",
        description:
            "Offer your community a trusted travel health resource they'll appreciate.",
    },
];

const Careers = () => {
    return (
 <main>
             <SEOHead
                 title="Careers — Travel Medicine Advisory Global"
                 description="Join the TMAG team and help make travel health advice accessible to everyone."
                 path="/careers"
             />
            {/* Hero */}
            <AnimateIn
                as="section"
                className="flex flex-col items-center text-center pt-20 pb-12 px-6"
            >
                <span className="inline-block text-sm text-muted bg-button-secondary font-semibold rounded-xl px-4 py-1.5 mb-6">
                    Careers
                </span>
                <h1 className="text-5xl md:text-6xl lg:text-7xl leading-[0.9] text-heading font-serif max-w-3xl">
                    Join the TMAG{" "}
                    <span className="italic">team.</span>
                </h1>
                <p className="sm:text-lg text-body mt-6 max-w-xl leading-relaxed">
                    Whether you're a medical professional or a content creator,
                    there's a way to partner with us and make travel health
                    accessible to everyone.
                </p>
            </AnimateIn>

            {/* Doctor pathway */}
            <section className="px-8 lg:px-16 py-16 max-w-7xl mx-auto">
                <div className="bg-background-secondary rounded-3xl p-8 md:p-12 lg:p-16">
                    <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-center">
                        <div className="lg:w-1/2">
                            <AnimateIn>
                                <div className="w-14 h-14 rounded-2xl bg-accent/10 text-accent flex items-center justify-center mb-5">
                                    <LucideStethoscope className="w-7 h-7" />
                                </div>
                                <h2 className="text-3xl md:text-4xl text-heading leading-[1.1] font-serif mb-4">
                                    Apply as a{" "}
                                    <span className="italic">Doctor</span>
                                </h2>
                                <p className="text-sm text-body leading-relaxed mb-6">
                                    Use your medical expertise to review and
                                    validate AI-generated travel health plans.
                                    Help travellers worldwide get reliable,
                                    professional sign-off on their health
                                    preparations.
                                </p>
                                <Link to="/apply-as-doctor">
                                    <Button variant="primary" icon={<LucideArrowRight />}>
                                        Apply as a Doctor
                                    </Button>
                                </Link>
                            </AnimateIn>
                        </div>
                        <div className="lg:w-1/2 w-full">
                            <StaggerGroup
                                stagger={0.1}
                                className="grid grid-cols-1 sm:grid-cols-3 gap-4"
                            >
                                {doctorBenefits.map((benefit) => (
                                    <motion.div
                                        key={benefit.title}
                                        variants={staggerItem}
                                        className="bg-background-primary rounded-2xl p-5"
                                    >
                                        <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center mb-3">
                                            {benefit.icon}
                                        </div>
                                        <h3 className="text-sm font-semibold text-heading mb-1.5">
                                            {benefit.title}
                                        </h3>
                                        <p className="text-xs text-body leading-relaxed">
                                            {benefit.description}
                                        </p>
                                    </motion.div>
                                ))}
                            </StaggerGroup>
                        </div>
                    </div>
                </div>
            </section>

            {/* Affiliate pathway */}
            <section className="px-8 lg:px-16 py-16 max-w-7xl mx-auto">
                <div className="bg-button-secondary rounded-3xl p-8 md:p-12 lg:p-16">
                    <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-center">
                        <div className="lg:w-1/2">
                            <AnimateIn>
                                <div className="w-14 h-14 rounded-2xl bg-dark text-background-primary flex items-center justify-center mb-5">
                                    <LucideHandshake className="w-7 h-7" />
                                </div>
                                <h2 className="text-3xl md:text-4xl text-heading leading-[1.1] font-serif mb-4">
                                    Apply as an{" "}
                                    <span className="italic">Affiliate</span>
                                </h2>
                                <p className="text-sm text-body leading-relaxed mb-6">
                                    Partner with TMAG and earn commissions by
                                    sharing travel health advice with your
                                    audience. Whether you run a blog, newsletter,
                                    or social channel, we make it easy to
                                    promote a service your followers will love.
                                </p>
                                <Link to="/apply-as-affiliate">
                                    <Button variant="primary" icon={<LucideArrowRight />}>
                                        Apply as an Affiliate
                                    </Button>
                                </Link>
                            </AnimateIn>
                        </div>
                        <div className="lg:w-1/2 w-full">
                            <StaggerGroup
                                stagger={0.1}
                                className="grid grid-cols-1 sm:grid-cols-3 gap-4"
                            >
                                {affiliateBenefits.map((benefit) => (
                                    <motion.div
                                        key={benefit.title}
                                        variants={staggerItem}
                                        className="bg-background-primary rounded-2xl p-5"
                                    >
                                        <div className="w-10 h-10 rounded-xl bg-dark text-background-primary flex items-center justify-center mb-3">
                                            {benefit.icon}
                                        </div>
                                        <h3 className="text-sm font-semibold text-heading mb-1.5">
                                            {benefit.title}
                                        </h3>
                                        <p className="text-xs text-body leading-relaxed">
                                            {benefit.description}
                                        </p>
                                    </motion.div>
                                ))}
                            </StaggerGroup>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="px-8 lg:px-16 py-24 max-w-4xl mx-auto text-center">
                <AnimateIn type="fade">
                    <h2 className="text-3xl md:text-4xl text-heading leading-[1.1] font-serif mb-4">
                        Not sure which path fits?
                    </h2>
                    <p className="text-sm text-body leading-relaxed max-w-md mx-auto mb-8">
                        Reach out to our team and we'll help you find the right
                        way to partner with TMAG.
                    </p>
                    <Link to="/contact">
                        <Button variant="secondary" icon={<LucideArrowRight />}>
                            Contact us
                        </Button>
                    </Link>
                </AnimateIn>
            </section>
        </main>
    );
};

export default Careers;
