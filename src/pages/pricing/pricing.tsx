import { LucideCheck, LucideArrowRight } from "lucide-react";
import Button from "../../components/ui/Button";

const PricingPage = () => {
    return (
        <main>
            {/* Hero */}
            <section className="flex flex-col items-center text-center pt-20 pb-12 px-6">
                <span className="inline-block text-sm text-muted bg-button-secondary font-semibold rounded-xl px-4 py-1.5 mb-6">
                    Pricing
                </span>
                <h1 className="text-5xl md:text-6xl lg:text-7xl leading-[0.9] text-heading font-serif max-w-3xl">
                    Simple, <span className="italic">honest</span> pricing.
                </h1>
                <p className="sm:text-lg text-body mt-6 max-w-xl leading-relaxed">
                    No subscriptions, no hidden fees. Buy credits, generate
                    plans, travel safely. That's it.
                </p>
            </section>

            {/* Pricing cards */}
            <section className="px-8 lg:px-16 pb-24 max-w-5xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Individual */}
                    <div className="bg-button-secondary rounded-3xl p-8 md:p-10 flex flex-col justify-between">
                        <div>
                            <h3 className="text-2xl font-serif text-heading mb-1">
                                Individual
                            </h3>
                            <p className="text-sm text-body mb-6">
                                For solo travelers, families, and anyone planning
                                a trip.
                            </p>
                            <div className="flex items-baseline gap-1 mb-2">
                                <span className="text-5xl font-serif text-heading">
                                    $9
                                </span>
                                <span className="text-sm text-body">
                                    / credit
                                </span>
                            </div>
                            <p className="text-xs text-muted mb-8">
                                1 credit = 1 full travel health plan. First plan free.
                            </p>

                            <div className="border-t border-border pt-6 mb-8">
                                <p className="text-xs uppercase tracking-wider text-muted font-semibold mb-4">
                                    Credit packs
                                </p>
                                <div className="space-y-3">
                                    {[
                                        { credits: "1 credit", price: "$9" },
                                        { credits: "5 credits", price: "$39", save: "Save 13%" },
                                        { credits: "10 credits", price: "$69", save: "Save 23%" },
                                    ].map((pack) => (
                                        <div
                                            key={pack.credits}
                                            className="flex items-center justify-between bg-background-primary rounded-xl px-4 py-3"
                                        >
                                            <span className="text-sm font-medium text-heading">
                                                {pack.credits}
                                            </span>
                                            <div className="flex items-center gap-2">
                                                {pack.save && (
                                                    <span className="text-xs font-semibold text-accent bg-accent/10 px-2 py-0.5 rounded-full">
                                                        {pack.save}
                                                    </span>
                                                )}
                                                <span className="text-sm font-semibold text-heading">
                                                    {pack.price}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <ul className="space-y-3 mb-8">
                                {[
                                    "Full personalized health plan per credit",
                                    "Unlimited destinations per plan",
                                    "Downloadable PDF report",
                                    "Doctor-ready summary",
                                    "Pre-existing condition support",
                                    "Emergency contacts & clinic finder",
                                    "Credits never expire",
                                ].map((f) => (
                                    <li
                                        key={f}
                                        className="flex items-start gap-3 text-sm text-heading"
                                    >
                                        <LucideCheck className="w-4 h-4 mt-0.5 text-accent shrink-0" />
                                        {f}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <Button variant="primary" className="self-stretch text-center justify-center flex">
                            Get started free
                        </Button>
                    </div>

                    {/* Corporate */}
                    <div className="relative rounded-3xl p-8 md:p-10 flex flex-col justify-between overflow-hidden">
                        <div
                            className="absolute inset-0"
                            style={{
                                background:
                                    "linear-gradient(135deg, #2a7a6a 0%, #1a6a7a 30%, #187080 55%, #1a6878 80%, #246858 100%)",
                            }}
                        />
                        <span className="absolute top-6 right-6 text-xs font-semibold text-white/80 bg-white/15 px-3 py-1 rounded-full z-10">
                            Volume pricing
                        </span>

                        <div className="relative z-10">
                            <h3 className="text-2xl font-serif text-white mb-1">
                                Corporate
                            </h3>
                            <p className="text-sm text-white/60 mb-6">
                                For organizations sending employees abroad.
                            </p>
                            <div className="flex items-baseline gap-1 mb-2">
                                <span className="text-5xl font-serif text-white">
                                    Custom
                                </span>
                            </div>
                            <p className="text-xs text-white/40 mb-8">
                                Credit-based pricing scaled to your team size and travel volume.
                            </p>

                            <div className="border-t border-white/10 pt-6 mb-8">
                                <p className="text-xs uppercase tracking-wider text-white/30 font-semibold mb-4">
                                    Starts at
                                </p>
                                <div className="space-y-3">
                                    {[
                                        { credits: "50 credits", price: "from $5/credit" },
                                        { credits: "200 credits", price: "from $4/credit" },
                                        { credits: "500+ credits", price: "Custom rate" },
                                    ].map((pack) => (
                                        <div
                                            key={pack.credits}
                                            className="flex items-center justify-between rounded-xl px-4 py-3"
                                            style={{ background: "rgba(255,255,255,0.08)" }}
                                        >
                                            <span className="text-sm font-medium text-white">
                                                {pack.credits}
                                            </span>
                                            <span className="text-sm font-semibold text-white/80">
                                                {pack.price}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <ul className="space-y-3 mb-8">
                                {[
                                    "Everything in Individual",
                                    "HR & compliance dashboard",
                                    "Bulk plan generation",
                                    "Duty-of-care documentation",
                                    "Risk reports per destination",
                                    "API access & travel platform integrations",
                                    "Dedicated account manager",
                                ].map((f) => (
                                    <li
                                        key={f}
                                        className="flex items-start gap-3 text-sm text-white"
                                    >
                                        <LucideCheck className="w-4 h-4 mt-0.5 text-white/50 shrink-0" />
                                        {f}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <Button
                            variant="primary"
                            className="relative z-10 self-stretch bg-white !text-dark hover:bg-white/90 text-center justify-center flex"
                            link="/for-companies"
                        >
                            Talk to sales
                        </Button>
                    </div>
                </div>
            </section>

            {/* FAQ-like section */}
            <div className="bg-background-secondary">
                <section className="px-8 lg:px-16 py-24 max-w-5xl mx-auto">
                    <h2 className="text-3xl md:text-4xl text-heading leading-[1.1] font-serif mb-10 text-center">
                        Common questions about pricing.
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[
                            {
                                q: "Is the first plan really free?",
                                a: "Yes. Sign up and generate your first travel health plan at no cost. No credit card required.",
                            },
                            {
                                q: "What counts as one credit?",
                                a: "One credit generates one complete travel health plan for one trip—regardless of how many destinations that trip includes.",
                            },
                            {
                                q: "Do credits expire?",
                                a: "Never. Your credits stay in your account until you use them, whether that's next week or next year.",
                            },
                            {
                                q: "Can I upgrade to Corporate later?",
                                a: "Absolutely. Contact our sales team and we'll migrate your account. Any unused individual credits transfer over.",
                            },
                        ].map((item) => (
                            <div key={item.q} className="bg-background-primary rounded-2xl p-6">
                                <h4 className="text-sm font-semibold text-heading mb-2">
                                    {item.q}
                                </h4>
                                <p className="text-sm text-body leading-relaxed">
                                    {item.a}
                                </p>
                            </div>
                        ))}
                    </div>
                    <div className="text-center mt-10">
                        <Button variant="secondary" icon={<LucideArrowRight />} link="/faq">
                            View all FAQs
                        </Button>
                    </div>
                </section>
            </div>
        </main>
    );
};

export default PricingPage;
