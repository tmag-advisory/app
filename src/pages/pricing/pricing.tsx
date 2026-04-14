import { LucideCheck, LucideArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import Button from "../../components/ui/Button";
import AnimateIn from "../../components/animations/AnimateIn";
import StaggerGroup, { staggerItem } from "../../components/animations/StaggerGroup";
import { creditPlans, premiumFeatures } from "../../constants/companyPlans";

const individualPlans = [
  {
    name: "Essential",
    code: "ESSENTIAL",
    price: "Free",
    priceNote: "1 credit included at signup",
    description: "Generic destination health education for casual travellers.",
    features: [
      "Destination health risk overview",
      "General food & water safety",
      "Environmental considerations",
      "Post-return awareness note",
      "WHO & CDC validated guidance",
    ],
    cta: "Start free",
    highlighted: false,
    tier: "free",
  },
  {
    name: "Standard",
    code: "STANDARD",
    price: "$50",
    priceNote: "per credit",
    description: "Fully personalised travel health report across 14 clinical decision trees.",
    features: [
      "Trip at a glance summary",
      "Personalised health risk overview",
      "Vaccination gap analysis",
      "Activity & destination-specific guidance",
      "Emergency contacts & local clinics",
      "After-return symptom timeline",
      "Next steps checklist",
    ],
    cta: "Get started",
    highlighted: true,
    tier: "standard",
  },
  {
    name: "Premium",
    code: "PREMIUM",
    price: "$100",
    priceNote: "per credit",
    description: "Everything in Standard plus clinical-grade extras for high-risk or complex trips.",
    features: [
      "All Standard plan features",
      "Pre-travel preparation checklist",
      "Medication & supplies packing list",
      "Doctor-ready clinical summary letter",
      "Priority physician review flag",
    ],
    cta: "Get Premium",
    highlighted: false,
    tier: "premium",
  },
];

const PricingPage = () => {
  return (
    <main>
      {/* Hero */}
      <AnimateIn as="section" className="flex flex-col items-center text-center pt-20 pb-12 px-6">
        <span className="inline-block text-sm text-muted bg-button-secondary font-semibold rounded-xl px-4 py-1.5 mb-6">
          Pricing
        </span>
        <h1 className="text-5xl md:text-6xl lg:text-7xl leading-[0.9] text-heading font-serif max-w-3xl">
          Simple, <span className="italic">honest</span> pricing.
        </h1>
        <p className="sm:text-lg text-body mt-6 max-w-xl leading-relaxed">
          Whether you're planning a single trip or managing travel for an entire company,
          we've got a plan for you.
        </p>
      </AnimateIn>

      {/* Individual plans */}
      <section className="px-8 lg:px-16 pb-8 max-w-7xl mx-auto">
        <AnimateIn className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl text-heading leading-[1.1] font-serif mb-3">
            For <span className="italic">individuals</span>
          </h2>
          <p className="text-sm text-muted max-w-md mx-auto">
            One credit = one travel health plan. Choose the depth of report that fits your trip.
          </p>
        </AnimateIn>

        <StaggerGroup className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto" stagger={0.12}>
          {individualPlans.map((plan) => (
            <motion.div
              variants={staggerItem}
              key={plan.name}
              className={`relative rounded-3xl p-8 flex flex-col justify-between overflow-hidden ${
                plan.highlighted ? "" : plan.tier === "premium" ? "bg-button-secondary border border-amber-200/60" : "bg-button-secondary"
              }`}
            >
              {plan.highlighted && (
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(135deg, #2a7a6a 0%, #1a6a7a 30%, #187080 55%, #1a6878 80%, #246858 100%)",
                  }}
                />
              )}
              {plan.highlighted && (
                <span className="absolute top-6 right-6 text-xs font-semibold text-white/80 bg-white/15 px-3 py-1 rounded-full">
                  Most popular
                </span>
              )}
              {plan.tier === "premium" && (
                <span className="absolute top-6 right-6 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
                  Best report
                </span>
              )}
              <div className="relative z-10">
                <h3 className={`text-lg font-semibold mb-1 ${plan.highlighted ? "text-white" : "text-heading"}`}>
                  {plan.name}
                </h3>
                <p className={`text-sm mb-6 ${plan.highlighted ? "text-white/60" : "text-body"}`}>
                  {plan.description}
                </p>
                <div className="flex items-baseline gap-1.5 mb-1">
                  <span className={`text-4xl font-serif ${plan.highlighted ? "text-white" : plan.tier === "premium" ? "text-amber-700" : "text-heading"}`}>
                    {plan.price}
                  </span>
                </div>
                <p className={`text-xs mb-8 ${plan.highlighted ? "text-white/50" : "text-muted"}`}>
                  {plan.priceNote}
                </p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li
                      key={f}
                      className={`flex items-start gap-3 text-sm ${plan.highlighted ? "text-white" : "text-heading"}`}
                    >
                      <LucideCheck className={`w-4 h-4 mt-0.5 shrink-0 ${plan.highlighted ? "text-white/60" : plan.tier === "premium" ? "text-amber-600" : "text-accent"}`} />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
              {plan.highlighted ? (
                <Button
                  variant="primary"
                  link="/auth/register"
                  className="relative z-10 self-stretch bg-white !text-dark hover:bg-white/90 text-center justify-center flex"
                >
                  {plan.cta}
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  icon={<LucideArrowRight />}
                  link="/auth/register"
                  className={`self-start relative z-10 ${plan.tier === "premium" ? "border-amber-300 text-amber-700 hover:bg-amber-50" : ""}`}
                >
                  {plan.cta}
                </Button>
              )}
            </motion.div>
          ))}
        </StaggerGroup>
      </section>

      {/* Divider */}
      <div className="px-8 lg:px-16 py-8 max-w-7xl mx-auto">
        <div className="border-t border-border-light/50"></div>
      </div>

      {/* Company plans */}
      <section className="px-8 lg:px-16 pb-24 max-w-7xl mx-auto">
        <AnimateIn className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl text-heading leading-[1.1] font-serif mb-3">
            For <span className="italic">companies</span>
          </h2>
          <p className="text-sm text-muted max-w-md mx-auto">
            Your team buys credits and uses them to generate travel health plans. Choose the plan tier that matches your reporting needs.
          </p>
        </AnimateIn>

        <StaggerGroup className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl justify-center mx-auto" stagger={0.12}>
          {creditPlans.map((plan) => (
            <motion.div
              variants={staggerItem}
              key={plan.tier}
              className={`relative rounded-3xl p-8 flex flex-col justify-between overflow-hidden ${
                plan.tier === "standard"
                  ? ""
                  : plan.tier === "premium"
                  ? "bg-button-secondary border border-amber-200/60"
                  : "bg-button-secondary"
              }`}
            >
              {plan.tier === "standard" && (
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(135deg, #2a7a6a 0%, #1a6a7a 30%, #187080 55%, #1a6878 80%, #246858 100%)",
                  }}
                />
              )}
              {plan.tier === "standard" && (
                <span className="absolute top-6 right-6 text-xs font-semibold text-white/80 bg-white/15 px-3 py-1 rounded-full">
                  Most popular
                </span>
              )}
              {plan.tier === "premium" && (
                <span className="absolute top-6 right-6 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
                  Best report
                </span>
              )}
              <div className="relative z-10">
                <h3 className={`text-lg font-semibold mb-1 ${plan.tier === "standard" ? "text-white" : "text-heading"}`}>
                  {plan.name}
                </h3>
                <p className={`text-sm mb-6 ${plan.tier === "standard" ? "text-white/60" : "text-body"}`}>
                  {plan.description}
                </p>
                <div className="flex items-baseline gap-1.5 mb-1">
                  <span className={`text-4xl font-serif ${plan.tier === "standard" ? "text-white" : plan.tier === "premium" ? "text-amber-700" : "text-heading"}`}>
                    {plan.priceUsd === 0 ? "Free" : `$${plan.priceUsd}`}
                  </span>
                </div>
                <p className={`text-xs mb-8 ${plan.tier === "standard" ? "text-white/50" : "text-muted"}`}>
                  {plan.priceUsd === 0 ? "included at signup" : "per credit"}
                </p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li
                      key={f}
                      className={`flex items-start gap-3 text-sm ${plan.tier === "standard" ? "text-white" : "text-heading"}`}
                    >
                      <LucideCheck className={`w-4 h-4 mt-0.5 shrink-0 ${plan.tier === "standard" ? "text-white/60" : plan.tier === "premium" ? "text-amber-600" : "text-accent"}`} />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
              {plan.tier === "standard" ? (
                <Button
                  variant="primary"
                  link="/company-onboarding"
                  className="relative z-10 self-stretch bg-white !text-dark hover:bg-white/90 text-center justify-center flex"
                >
                  Get started
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  icon={<LucideArrowRight />}
                  link="/company-onboarding"
                  className={`self-start relative z-10 ${plan.tier === "premium" ? "border-amber-300 text-amber-700 hover:bg-amber-50" : ""}`}
                >
                  Get started
                </Button>
              )}
            </motion.div>
          ))}
        </StaggerGroup>

        {/* Premium extras callout */}
        <AnimateIn className="mt-10">
          <div className="bg-button-secondary rounded-3xl border border-amber-200/60 p-8">
            <h3 className="text-xl font-serif text-heading mb-5">Exclusive to Premium</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {premiumFeatures.map((feature) => (
                <div key={feature} className="flex items-start gap-3 text-sm text-heading">
                  <LucideCheck className="w-4 h-4 mt-0.5 text-amber-600 shrink-0" />
                  {feature}
                </div>
              ))}
            </div>
          </div>
        </AnimateIn>
      </section>

      {/* FAQ section */}
      <div className="bg-background-secondary">
        <section className="px-8 lg:px-16 py-24 max-w-5xl mx-auto">
          <AnimateIn>
            <h2 className="text-3xl md:text-4xl text-heading leading-[1.1] font-serif mb-10 text-center">
              Common questions about pricing.
            </h2>
          </AnimateIn>
          <StaggerGroup className="grid grid-cols-1 md:grid-cols-2 gap-6" stagger={0.1}>
            {[
              {
                q: "How do credits work?",
                a: "One credit generates one complete travel health plan for one trip. Individual users can buy credits directly. Company plans include signup credits that are distributed to employees.",
              },
              {
                q: "Can I buy more credits later?",
                a: "Yes. Individual users can purchase credits anytime. Company admins can top up credits or request additional allocations from their dashboard.",
              },
              {
                q: "What's the difference between Standard and Premium?",
                a: "Standard ($50/credit) generates a fully personalised travel health report covering vaccines, medications, risks, and emergency contacts. Premium ($100/credit) adds a Pre-Travel Checklist, Medication Packing List, and a Doctor-Ready Clinical Summary Letter for your GP.",
              },
              {
                q: "Can I upgrade my company plan?",
                a: "Yes. Contact our sales team and we'll migrate your account to a higher tier. Any unused credits transfer over.",
              },
              {
                q: "Do credits expire?",
                a: "Never. Your credits stay in your account until you use them, whether that's next week or next year.",
              },
              {
                q: "Is there a free tier?",
                a: "Yes. Every new account receives 1 free Essential credit — a destination health education report with no personal data required. Upgrade to Standard or Premium for a fully personalised plan.",
              },
            ].map((item) => (
              <motion.div variants={staggerItem} key={item.q} className="bg-background-primary rounded-2xl p-6">
                <h4 className="text-sm font-semibold text-heading mb-2">
                  {item.q}
                </h4>
                <p className="text-sm text-body leading-relaxed">
                  {item.a}
                </p>
              </motion.div>
            ))}
          </StaggerGroup>
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
