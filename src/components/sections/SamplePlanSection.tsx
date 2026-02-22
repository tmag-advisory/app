import {
    LucideSyringe,
    LucidePill,
    LucideAlertTriangle,
    LucideDroplets,
} from "lucide-react";
import Button from "../ui/Button";
import AnimateIn from "../animations/AnimateIn";

const planItems = [
    {
        icon: <LucideSyringe className="w-4 h-4" />,
        category: "Vaccinations",
        items: ["Yellow Fever (required)", "Typhoid (recommended)", "Hepatitis A"],
    },
    {
        icon: <LucidePill className="w-4 h-4" />,
        category: "Medications",
        items: ["Malarone (malaria prophylaxis)", "Ciprofloxacin (traveler's diarrhea)", "Rehydration salts"],
    },
    {
        icon: <LucideAlertTriangle className="w-4 h-4" />,
        category: "Risk alerts",
        items: ["Dengue — high season in coastal regions", "Altitude sickness above 2,500 m", "Zika advisory for pregnant travelers"],
    },
    {
        icon: <LucideDroplets className="w-4 h-4" />,
        category: "Water & food",
        items: ["Avoid tap water — use bottled or purified", "Street food: stick to cooked-to-order stalls", "Carry water purification tablets"],
    },
];

const SamplePlanSection = () => {
    return (
        <section className="px-8 lg:px-16 pt-24 pb-16 max-w-7xl mx-auto">
            <AnimateIn className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-14">
                <div>
                    <span className="inline-block text-sm text-muted bg-button-secondary font-semibold rounded-xl px-4 py-1.5 mb-6">
                        Sample plan
                    </span>
                    <h2 className="text-4xl md:text-5xl lg:text-6xl text-heading leading-[1.1] font-serif max-w-lg">
                        See what your plan{" "}
                        <span className="italic">looks</span> like.
                    </h2>
                </div>
                <p className="text-sm text-muted leading-relaxed max-w-sm md:mt-10 font-medium">
                    Here's a preview of a real advisory generated for a 10-day
                    trip to Colombia. Your plan will be just as detailed—and
                    tailored to your needs.
                </p>
            </AnimateIn>

            {/* Plan preview card */}
            <AnimateIn type="scaleUp" delay={0.15} className="bg-button-secondary rounded-3xl p-6 md:p-10">
                {/* Plan header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-border">
                    <div>
                        <p className="text-xs text-body uppercase tracking-wider font-medium mb-1">
                            Travel health plan
                        </p>
                        <h3 className="text-xl font-serif text-heading">
                            Colombia · 10 days · 1 traveler
                        </h3>
                    </div>
                    <span className="text-xs font-semibold text-accent bg-accent/10 px-3 py-1.5 rounded-full self-start">
                        AI-generated preview
                    </span>
                </div>

                {/* Plan items grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {planItems.map((section) => (
                        <div key={section.category}>
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-7 h-7 rounded-lg bg-heading text-background-primary flex items-center justify-center">
                                    {section.icon}
                                </div>
                                <h4 className="text-sm font-semibold text-heading">
                                    {section.category}
                                </h4>
                            </div>
                            <ul className="space-y-2 ml-9">
                                {section.items.map((item) => (
                                    <li
                                        key={item}
                                        className="text-sm text-body leading-relaxed"
                                    >
                                        • {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* CTA */}
                <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <p className="text-sm text-muted font-medium">
                        This is just a preview — your full plan includes
                        emergency contacts, insurance guidance, and more.
                    </p>
                    <Button variant="primary" className="shrink-0">
                        Get your full plan
                    </Button>
                </div>
            </AnimateIn>
        </section>
    );
};

export default SamplePlanSection;
