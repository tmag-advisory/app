import { LucideCheck, LucideArrowRight, LucideKey, LucideHeadphones, LucideUsers, LucideShield } from "lucide-react";
import { motion } from "framer-motion";
import Button from "../../components/ui/Button";
import AnimateIn from "../../components/animations/AnimateIn";
import StaggerGroup, { staggerItem } from "../../components/animations/StaggerGroup";
import { companyPlans, elevatedPlanFeatures } from "../../constants/companyPlans";

const individualPlans = [
  {
    name: "Explorer",
    price: "Free",
    period: "",
    description: "Quick guidance for a single destination.",
    features: [
      "1 destination report",
      "Basic vaccine checklist",
      "General risk overview",
      "Email delivery",
    ],
    cta: "Start free",
    highlighted: false,
  },
  {
    name: "Credits",
    price: "Pay as you go",
    period: "",
    description: "Buy credits and generate full travel health plans on demand.",
    features: [
      "Full vaccine & medication plan",
      "Emergency contacts & clinics",
      "Downloadable PDF reports",
      "Buy as many credits as you want",
      "Credits never expire",
    ],
    cta: "Get started",
    highlighted: true,
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
            Buy credits and use them for your trips. One credit = one travel health plan.
          </p>
        </AnimateIn>

        <StaggerGroup className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto" stagger={0.15}>
          {individualPlans.map((plan) => (
            <motion.div
              variants={staggerItem}
              key={plan.name}
              className={`relative rounded-3xl p-8 flex flex-col justify-between overflow-hidden ${
                plan.highlighted ? "" : "bg-button-secondary"
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
              <div className="relative z-10">
                <h3 className={`text-lg font-semibold mb-1 ${plan.highlighted ? "text-white" : "text-heading"}`}>
                  {plan.name}
                </h3>
                <p className={`text-sm mb-6 ${plan.highlighted ? "text-white/60" : "text-body"}`}>
                  {plan.description}
                </p>
                <div className="flex items-baseline gap-1 mb-8">
                  <span className={`text-4xl font-serif ${plan.highlighted ? "text-white" : "text-heading"}`}>
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className={`text-sm ${plan.highlighted ? "text-white/60" : "text-body"}`}>
                      {plan.period}
                    </span>
                  )}
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li
                      key={f}
                      className={`flex items-start gap-3 text-sm ${plan.highlighted ? "text-white" : "text-heading"}`}
                    >
                      <LucideCheck className={`w-4 h-4 mt-0.5 shrink-0 ${plan.highlighted ? "text-white/60" : "text-accent"}`} />
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
                  link={plan.name === "Credits" ? "/auth/register" : "/auth/register"}
                  className="self-start relative z-10"
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
            Team plans with signup credits, employee management, and admin tools.
          </p>
        </AnimateIn>

        <StaggerGroup className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6" stagger={0.1}>
          {companyPlans.map((plan) => (
            <motion.div
              variants={staggerItem}
              key={plan.tier}
              className={`rounded-3xl p-8 flex flex-col justify-between ${
                plan.tier === "diamond"
                  ? "relative overflow-hidden"
                  : "bg-button-secondary"
              }`}
            >
              {plan.tier === "diamond" && (
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(135deg, #2a7a6a 0%, #1a6a7a 30%, #187080 55%, #1a6878 80%, #246858 100%)",
                  }}
                />
              )}
              {plan.tier === "diamond" && (
                <span className="absolute top-6 right-6 text-xs font-semibold text-white/80 bg-white/15 px-3 py-1 rounded-full">
                  Best for API teams
                </span>
              )}
              <div className="relative z-10">
                <h3 className={`text-2xl font-serif mb-1 ${plan.tier === "diamond" ? "text-white" : "text-heading"}`}>
                  {plan.name}
                </h3>
                <p className={`text-sm mb-6 ${plan.tier === "diamond" ? "text-white/60" : "text-body"}`}>
                  {plan.description}
                </p>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className={`text-5xl font-serif ${plan.tier === "diamond" ? "text-white" : "text-heading"}`}>
                    {plan.signupCredits}
                  </span>
                  <span className={`text-sm ${plan.tier === "diamond" ? "text-white/60" : "text-body"}`}>
                    signup credits
                  </span>
                </div>
                <p className={`text-xs mb-8 ${plan.tier === "diamond" ? "text-white/40" : "text-muted"}`}>
                  {plan.signupCredits} signup credits included
                </p>
                <ul className="space-y-3 mb-8">
                  <li className={`flex items-start gap-3 text-sm ${plan.tier === "diamond" ? "text-white" : "text-heading"}`}>
                    <LucideUsers className={`w-4 h-4 mt-0.5 shrink-0 ${plan.tier === "diamond" ? "text-white/50" : "text-accent"}`} />
                    {plan.employeeLimit}
                  </li>
                  <li className={`flex items-start gap-3 text-sm ${plan.tier === "diamond" ? "text-white" : "text-heading"}`}>
                    <LucideKey className={`w-4 h-4 mt-0.5 shrink-0 ${plan.apiAccess ? (plan.tier === "diamond" ? "text-white/50" : "text-accent") : "text-muted/40"}`} />
                    API access {plan.apiAccess ? "included" : "not included"}
                  </li>
                  <li className={`flex items-start gap-3 text-sm ${plan.tier === "diamond" ? "text-white" : "text-heading"}`}>
                    <LucideHeadphones className={`w-4 h-4 mt-0.5 shrink-0 ${plan.customSupport ? (plan.tier === "diamond" ? "text-white/50" : "text-accent") : "text-muted/40"}`} />
                    Custom support {plan.customSupport ? "included" : "not included"}
                  </li>
                  <li className={`flex items-start gap-3 text-sm ${plan.tier === "diamond" ? "text-white" : "text-heading"}`}>
                    <LucideShield className={`w-4 h-4 mt-0.5 shrink-0 ${plan.multipleAdminAccounts ? (plan.tier === "diamond" ? "text-white/50" : "text-accent") : "text-muted/40"}`} />
                    Multiple admins {plan.multipleAdminAccounts ? "included" : "not included"}
                  </li>
                </ul>
              </div>
              <Button
                variant={plan.tier === "diamond" ? "primary" : "secondary"}
                className={`relative z-10 self-stretch text-center justify-center flex ${plan.tier === "diamond" ? "bg-white !text-dark hover:bg-white/90" : ""}`}
                link={plan.tier === "diamond" ? "/contact?type=SALES" : "/contact?type=DEMO"}
              >
                {plan.tier === "diamond" ? "Talk to sales" : "Get started"}
              </Button>
            </motion.div>
          ))}
        </StaggerGroup>

        {/* Elevated features */}
        <AnimateIn className="mt-10">
          <div className="bg-button-secondary rounded-3xl border border-border-light/60 p-8">
            <h3 className="text-xl font-serif text-heading mb-5">Included in Silver, Gold, and Diamond</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {elevatedPlanFeatures.map((feature) => (
                <div key={feature} className="flex items-start gap-3 text-sm text-heading">
                  <LucideCheck className="w-4 h-4 mt-0.5 text-accent shrink-0" />
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
                q: "What's the difference between individual and company plans?",
                a: "Individual plans are pay-per-trip or buy-credits. Company plans bundle signup credits with employee management, multiple admins, API access, and compliance tools.",
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
                q: "Is there a free trial?",
                a: "Yes. The Explorer plan is completely free and gives you one destination report with basic vaccine checklists and risk overview.",
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
