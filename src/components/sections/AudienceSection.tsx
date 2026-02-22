import {
    LucideUser,
    LucideBuilding2,
    LucideArrowRight,
    LucideCheck,
} from "lucide-react";
import Button from "../ui/Button";
import AnimateIn from "../animations/AnimateIn";

const individualFeatures = [
    "Personalized vaccine checklist",
    "Medication & supply packing list",
    "Risk alerts for your exact itinerary",
    "Downloadable PDF health plan",
    "Doctor-ready summary you can share",
];

const companyFeatures = [
    "Bulk employee travel assessments",
    "Compliance-ready health reports",
    "Dashboard for HR & travel managers",
    "Duty-of-care documentation",
    "API integration with travel platforms",
];

const AudienceSection = () => {
    return (
        <section className="px-8 lg:px-16 pt-24 pb-16 max-w-7xl mx-auto">
            <AnimateIn className="text-center mb-14">
                <span className="inline-block text-sm text-muted bg-button-secondary font-semibold rounded-xl px-4 py-1.5 mb-6">
                    Built for everyone
                </span>
                <h2 className="text-4xl md:text-5xl lg:text-6xl text-heading leading-[1.1] font-serif">
                    Whether you travel <span className="italic">alone</span> or
                    <br className="hidden md:block" /> send a <span className="italic">team.</span>
                </h2>
            </AnimateIn>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Individuals */}
                <AnimateIn type="fadeLeft" className="bg-button-secondary rounded-3xl p-8 md:p-10 flex flex-col justify-between">
                    <div>
                        <div className="w-12 h-12 rounded-xl bg-heading text-background-primary flex items-center justify-center mb-6">
                            <LucideUser className="w-6 h-6" />
                        </div>
                        <h3 className="text-2xl font-serif text-heading mb-2">
                            For Individuals
                        </h3>
                        <p className="text-sm text-body leading-relaxed mb-6">
                            Solo adventurers, digital nomads, and family
                            vacationers—get a plan built just for your trip.
                        </p>
                        <ul className="space-y-3 mb-8">
                            {individualFeatures.map((f) => (
                                <li key={f} className="flex items-start gap-3 text-sm text-heading">
                                    <LucideCheck className="w-4 h-4 mt-0.5 text-accent shrink-0" />
                                    {f}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <Button variant="secondary" icon={<LucideArrowRight />} className="self-start">
                        Get your plan
                    </Button>
                </AnimateIn>

                {/* Companies */}
                <AnimateIn type="fadeRight" delay={0.15} className="relative rounded-3xl p-8 md:p-10 flex flex-col justify-between overflow-hidden">
                    <div
                        className="absolute inset-0"
                        style={{
                            background:
                                "linear-gradient(135deg, #2a7a6a 0%, #1a6a7a 30%, #187080 55%, #1a6878 80%, #246858 100%)",
                        }}
                    />
                    <div className="relative z-10">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6"
                            style={{ background: "rgba(255,255,255,0.15)" }}>
                            <LucideBuilding2 className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-2xl font-serif text-white mb-2">
                            For Companies
                        </h3>
                        <p className="text-sm text-white/70 leading-relaxed mb-6">
                            Protect your people at scale—meet duty-of-care obligations
                            and keep every traveler informed.
                        </p>
                        <ul className="space-y-3 mb-8">
                            {companyFeatures.map((f) => (
                                <li key={f} className="flex items-start gap-3 text-sm text-white">
                                    <LucideCheck className="w-4 h-4 mt-0.5 text-white/60 shrink-0" />
                                    {f}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <Button variant="primary" className="relative z-10 self-start bg-white !text-dark hover:bg-white/90">
                        Contact sales
                    </Button>
                </AnimateIn>
            </div>
        </section>
    );
};

export default AudienceSection;
