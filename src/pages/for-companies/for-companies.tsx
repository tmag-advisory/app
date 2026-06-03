import { useState } from "react";
import {
    LucideShieldCheck,
    LucideUsers,
    LucideBarChart3,
    LucideArrowRight,
    LucideCheck,
    LucideFileText,
    LucideUserPlus,
    LucideCalendarClock,
    LucidePlusCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import Button from "../../components/ui/Button";
import AnimateIn from "../../components/animations/AnimateIn";
import StaggerGroup, { staggerItem } from "../../components/animations/StaggerGroup";
import SEOHead from "../../lib/seo";
import SectionEyebrow from "../../components/ui/SectionEyebrow";
import { seatTiers, INCLUDED_PLANS_PER_SEAT } from "../../constants/companyPlans";

const onboardingSteps = [
    {
        icon: <LucideUsers className="w-5 h-5" />,
        title: "Choose your seats",
        description:
            "Enter how many travellers you need to cover. We instantly show your per-seat price and total annual cost no quotes, no back-and-forth.",
    },
    {
        icon: <LucideFileText className="w-5 h-5" />,
        title: "Upload your roster",
        description:
            "Add members individually or upload a CSV. Download and submit your signed MSA and documentation right inside the flow.",
    },
    {
        icon: <LucideShieldCheck className="w-5 h-5" />,
        title: "Checkout once a year",
        description:
            "Pay your annual subscription securely at checkout. One payment covers every seat for the full year.",
    },
    {
        icon: <LucideBarChart3 className="w-5 h-5" />,
        title: "Manage from your dashboard",
        description:
            "Track per-member usage, assign extra plans, add seats, and renew all from your organization admin dashboard.",
    },
];

const manageFeatures = [
    "Centralized traveller health dashboard",
    "Per-member plan usage tracking (X of 4 used)",
    "Bulk member onboarding via CSV upload",
    "Assign extra travel plans to specific members",
    "Buy additional seats anytime at your current tier",
    "Duty-of-care reports and compliance audit trail",
];

const ForCompanies = () => {
    const includedPlans = INCLUDED_PLANS_PER_SEAT;
    const [tableCurrency, setTableCurrency] = useState<"USD" | "NGN">("USD");
    const seatSymbol = tableCurrency === "NGN" ? "₦" : "$";
    const seatPrice = (priceUsd: number) => (tableCurrency === "NGN" ? priceUsd * 1000 : priceUsd);

    return (
        <main>
            <SEOHead
                title="For Companies — Travel Medicine Advisory Global"
                description="Cover your whole team with seat-based travel health plans. Each seat includes 4 travel plans per year. Simple annual pricing, CSV onboarding, and an organization admin dashboard."
                path="/for-companies"
            />

            {/* Hero */}
            <AnimateIn as="section" className="flex flex-col items-center text-center pt-20 pb-12 px-6">
                <SectionEyebrow className="mb-6">For companies</SectionEyebrow>
                <h1 className="text-5xl md:text-6xl lg:text-7xl leading-[0.9] text-heading font-serif max-w-4xl">
                    Protect your people.{" "}
                    <span className="italic">Prove</span> it.
                </h1>
                <p className="sm:text-lg text-body mt-6 max-w-xl leading-relaxed">
                    Buy a seat for each traveller. Every seat includes{" "}
                    <strong>{includedPlans} travel plans per year</strong> personalised,
                    physician-grade health plans generated in minutes.
                </p>
                <div className="flex items-center gap-4 mt-8 flex-wrap justify-center">
                    <Button variant="secondary" icon={<LucideArrowRight />} link="/pricing?tab=company">
                        View Plans
                    </Button>
                </div>
            </AnimateIn>

            {/* How onboarding works */}
            <div className="bg-background-secondary">
                <section className="px-8 lg:px-16 py-24 max-w-7xl mx-auto">
                    <AnimateIn className="text-center mb-14">
                        <SectionEyebrow className="mb-6">How onboarding works</SectionEyebrow>
                        <h2 className="text-4xl md:text-5xl text-heading leading-[1.1] font-serif">
                            From sign-up to covered in{" "}
                            <span className="italic">one sitting.</span>
                        </h2>
                    </AnimateIn>
                    <StaggerGroup stagger={0.1} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {onboardingSteps.map((step, i) => (
                            <motion.div
                                variants={staggerItem}
                                key={step.title}
                                className="bg-background-primary rounded-2xl p-6 flex flex-col gap-4 relative"
                            >
                                <span className="absolute top-6 right-6 text-xs font-semibold text-muted/50">
                                    0{i + 1}
                                </span>
                                <div className="w-10 h-10 rounded-xl bg-dark text-background-primary flex items-center justify-center">
                                    {step.icon}
                                </div>
                                <h3 className="text-base font-semibold text-heading">{step.title}</h3>
                                <p className="text-sm text-body leading-relaxed">{step.description}</p>
                            </motion.div>
                        ))}
                    </StaggerGroup>
                </section>
            </div>

            {/* How seat pricing works — informational */}
            <section className="px-8 lg:px-16 py-24 max-w-3xl mx-auto">
                <AnimateIn className="text-center mb-10">
                    <SectionEyebrow className="mb-6">How seat pricing works</SectionEyebrow>
                    <h2 className="text-4xl md:text-5xl text-heading leading-[1.1] font-serif">
                        The bigger your team, the <span className="italic">lower the rate.</span>
                    </h2>
                    <p className="text-sm text-body mt-5 max-w-xl mx-auto leading-relaxed">
                        You buy one seat per traveller, billed once a year. Every seat includes{" "}
                        <strong>{includedPlans} travel plans per year</strong>. Your volume tier is
                        applied automatically you confirm seats, currency and total at checkout.
                    </p>
                </AnimateIn>

                <AnimateIn delay={0.1}>
                    {/* Currency toggle */}
                    <div className="flex justify-center mb-5">
                        <div className="inline-flex items-center bg-button-secondary rounded-xl p-1 gap-1">
                            {(["USD", "NGN"] as const).map((c) => (
                                <button
                                    key={c}
                                    type="button"
                                    onClick={() => setTableCurrency(c)}
                                    className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                                        tableCurrency === c ? "bg-white shadow-sm text-heading" : "text-muted hover:text-heading"
                                    }`}
                                >
                                    {c === "USD" ? "$ USD" : "₦ NGN"}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-2xl border border-border-light bg-background-primary">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border-light bg-button-secondary/50 text-left">
                                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted">Team size</th>
                                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted">Price / seat / year</th>
                                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted">Plans included</th>
                                </tr>
                            </thead>
                            <tbody>
                                {seatTiers.map((t) => (
                                    <tr key={t.tier} className="border-b border-border-light/60 last:border-0">
                                        <td className="px-5 py-4 text-heading font-medium">{t.label}</td>
                                        <td className="px-5 py-4">
                                            <span className="font-serif text-lg text-heading">{seatSymbol}{seatPrice(t.priceUsd).toLocaleString()}</span>
                                            <span className="text-xs text-muted"> / seat / yr</span>
                                        </td>
                                        <td className="px-5 py-4 text-body">{includedPlans} plans per seat</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <p className="text-center text-xs text-muted mt-5">
                        Need more plans for one person? Admins can buy and assign extra plans anytime
                        from the dashboard.
                    </p>
                    <div className="flex justify-center mt-8">
                        <Button variant="primary" link="/company-onboarding">Get your price &amp; start</Button>
                    </div>
                </AnimateIn>
            </section>

            {/* Manage employees */}
            <div className="bg-background-secondary">
                <section className="px-8 lg:px-16 py-24 max-w-7xl mx-auto">
                    <AnimateIn className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-14">
                        <div>
                            <SectionEyebrow className="mb-6">Manage your team</SectionEyebrow>
                            <h2 className="text-4xl md:text-5xl text-heading leading-[1.1] font-serif max-w-lg">
                                Everything HR needs,{" "}
                                <span className="italic">in one place.</span>
                            </h2>
                        </div>
                        <p className="text-sm text-muted leading-relaxed max-w-sm md:mt-10 font-medium">
                            Upload employees by CSV, watch each person's usage against their included
                            plans, top up with extra plans where needed, and add seats as your team grows.
                        </p>
                    </AnimateIn>
                    <AnimateIn delay={0.15} className="bg-background-primary rounded-2xl p-8">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-4">
                            {manageFeatures.map((f) => (
                                <div key={f} className="flex items-start gap-3 py-2">
                                    <LucideCheck className="w-4 h-4 mt-0.5 text-accent shrink-0" />
                                    <span className="text-sm text-heading">{f}</span>
                                </div>
                            ))}
                        </div>
                    </AnimateIn>
                </section>
            </div>

            {/* Growth & billing */}
            <section className="px-8 lg:px-16 py-24 max-w-7xl mx-auto">
                <AnimateIn className="text-center mb-14">
                    <SectionEyebrow className="mb-6">Grow & renew</SectionEyebrow>
                    <h2 className="text-4xl md:text-5xl text-heading leading-[1.1] font-serif">
                        Built to scale with{" "}
                        <span className="italic">your team.</span>
                    </h2>
                </AnimateIn>
                <StaggerGroup stagger={0.12} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        {
                            icon: <LucideUserPlus className="w-5 h-5" />,
                            title: "Add seats anytime",
                            desc: "Hiring more travellers mid-year? Buy additional seats at your organization's current tier price — each one adds 4 plans.",
                        },
                        {
                            icon: <LucidePlusCircle className="w-5 h-5" />,
                            title: "Buy & assign extra plans",
                            desc: "Need more than 4 plans for one person? Purchase extra plans at your organization rate and assign them to specific members.",
                        },
                        {
                            icon: <LucideCalendarClock className="w-5 h-5" />,
                            title: "Simple annual renewal",
                            desc: "Billing is once a year. When your term ends, renew in a click and every seat's included plans reset for the new year.",
                        },
                    ].map((item) => (
                        <motion.div
                            variants={staggerItem}
                            key={item.title}
                            className="bg-button-secondary rounded-2xl p-8 flex flex-col gap-4"
                        >
                            <div className="w-10 h-10 rounded-xl bg-dark text-background-primary flex items-center justify-center">
                                {item.icon}
                            </div>
                            <h3 className="text-base font-semibold text-heading">{item.title}</h3>
                            <p className="text-sm text-body leading-relaxed">{item.desc}</p>
                        </motion.div>
                    ))}
                </StaggerGroup>
            </section>

            {/* CTA */}
            <section className="px-8 lg:px-16 pt-8 pb-24 max-w-7xl mx-auto">
                <div className="relative rounded-3xl overflow-hidden px-8 py-20 md:py-24 text-center">
                    <div
                        className="absolute inset-0"
                        style={{
                            background:
                                "linear-gradient(135deg, #2a7a6a 0%, #1a6a7a 30%, #187080 55%, #1a6878 80%, #246858 100%)",
                        }}
                    />
                    <div
                        className="absolute top-[-30%] left-1/2 -translate-x-1/2 w-80 h-80 rounded-full"
                        style={{
                            background:
                                "radial-gradient(circle, rgba(240,160,96,0.6) 0%, rgba(232,120,80,0.2) 40%, transparent 70%)",
                            filter: "blur(50px)",
                        }}
                    />
                    <AnimateIn type="scaleUp" className="relative z-10 max-w-xl mx-auto">
                        <h2 className="text-4xl md:text-5xl text-white leading-[1.1] font-serif mb-4">
                            Ready to cover your team?
                        </h2>
                        <p className="text-sm text-white/70 leading-relaxed max-w-md mx-auto mb-8">
                            Choose your seats, upload your roster, and start generating travel
                            health plans for your employees today.
                        </p>
                        <Button
                            variant="primary"
                            link="/company-onboarding"
                            className="bg-white text-dark! hover:bg-white/90 mx-auto"
                        >
                            Start onboarding
                        </Button>
                    </AnimateIn>
                </div>
            </section>
        </main>
    );
};

export default ForCompanies;
