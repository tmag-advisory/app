import {
    LucideShieldCheck,
    LucideBrain,
    LucideHeart,
    LucideLock,
    LucideAlertTriangle,
} from "lucide-react";

const values = [
    {
        icon: <LucideHeart className="w-6 h-6" />,
        title: "Traveler-first",
        description:
            "Every feature, every recommendation, every design decision starts with one question: does this help the traveler stay safe?",
    },
    {
        icon: <LucideBrain className="w-6 h-6" />,
        title: "Responsible AI",
        description:
            "Our AI is a tool, not a doctor. We clearly label AI-generated content, disclose our data sources, and always recommend professional medical consultation.",
    },
    {
        icon: <LucideLock className="w-6 h-6" />,
        title: "Data privacy",
        description:
            "Your health data is encrypted in transit and at rest, never sold to third parties, and fully deletable from your account at any time. We follow HIPAA-compliant practices.",
    },
    {
        icon: <LucideShieldCheck className="w-6 h-6" />,
        title: "Transparency",
        description:
            "We tell you exactly where our data comes from, what our AI can and cannot do, and how we generate every recommendation in your plan.",
    },
];

const About = () => {
    return (
        <main>
            {/* Hero */}
            <section className="flex flex-col items-center text-center pt-20 pb-12 px-6">
                <span className="inline-block text-sm text-muted bg-button-secondary font-semibold rounded-xl px-4 py-1.5 mb-6">
                    About TMAG
                </span>
                <h1 className="text-5xl md:text-6xl lg:text-7xl leading-[0.9] text-heading font-serif max-w-3xl">
                    Travel health,{" "}
                    <span className="italic">demystified.</span>
                </h1>
                <p className="sm:text-lg text-body mt-6 max-w-xl leading-relaxed">
                    We built TMAG because finding reliable, personalized travel
                    health advice shouldn't require a specialist appointment or
                    hours of research.
                </p>
            </section>

            {/* Mission */}
            <div className="bg-background-secondary">
                <section className="px-8 lg:px-16 py-24 max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row gap-12 md:gap-20">
                        <div className="md:w-1/2">
                            <span className="inline-block text-sm text-muted bg-button-secondary font-semibold rounded-xl px-4 py-1.5 mb-6">
                                Our mission
                            </span>
                            <h2 className="text-4xl md:text-5xl text-heading leading-[1.1] font-serif">
                                Make travel health advice{" "}
                                <span className="italic">accessible</span> to
                                everyone.
                            </h2>
                        </div>
                        <div className="md:w-1/2 flex flex-col justify-center">
                            <p className="text-sm text-body leading-relaxed mb-4">
                                Millions of people travel internationally every
                                year without adequate health preparation. The
                                information exists—scattered across government
                                databases, medical journals, and embassy
                                websites—but it's fragmented, generic, and hard
                                to act on.
                            </p>
                            <p className="text-sm text-body leading-relaxed">
                                TMAG uses AI to consolidate that information into
                                personalized, actionable health plans. We don't
                                replace doctors—we help travelers arrive at their
                                appointments informed, and help those without
                                easy access to travel medicine clinics get
                                critical guidance they'd otherwise miss.
                            </p>
                        </div>
                    </div>
                </section>
            </div>

            {/* Values */}
            <section className="px-8 lg:px-16 py-24 max-w-7xl mx-auto">
                <div className="text-center mb-14">
                    <span className="inline-block text-sm text-muted bg-button-secondary font-semibold rounded-xl px-4 py-1.5 mb-6">
                        Our values
                    </span>
                    <h2 className="text-4xl md:text-5xl text-heading leading-[1.1] font-serif">
                        What we <span className="italic">stand</span> for.
                    </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {values.map((v) => (
                        <div
                            key={v.title}
                            className="bg-button-secondary rounded-2xl p-8 md:p-10"
                        >
                            <div className="w-12 h-12 rounded-xl bg-dark text-background-primary flex items-center justify-center mb-6">
                                {v.icon}
                            </div>
                            <h3 className="text-xl font-serif text-heading mb-3">
                                {v.title}
                            </h3>
                            <p className="text-sm text-body leading-relaxed">
                                {v.description}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Data ethics */}
            <div className="bg-background-secondary">
                <section className="px-8 lg:px-16 py-24 max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-14">
                        <div>
                            <span className="inline-block text-sm text-muted bg-button-secondary font-semibold rounded-xl px-4 py-1.5 mb-6">
                                Data ethics
                            </span>
                            <h2 className="text-4xl md:text-5xl text-heading leading-[1.1] font-serif max-w-lg">
                                How we handle your{" "}
                                <span className="italic">data.</span>
                            </h2>
                        </div>
                        <p className="text-sm text-muted leading-relaxed max-w-sm md:mt-10 font-medium">
                            Health data is sensitive. We treat it that way—not as
                            an afterthought, but as a foundation of everything
                            we build.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[
                            "Your data is never sold to third parties",
                            "Health profiles are encrypted at rest and in transit",
                            "You can delete all your data at any time",
                            "We don't train our models on your personal health data",
                            "AI outputs are clearly labeled as AI-generated",
                            "All data processing follows HIPAA-compliant practices",
                        ].map((item) => (
                            <div
                                key={item}
                                className="bg-background-primary rounded-2xl p-6 flex items-start gap-3"
                            >
                                <LucideLock className="w-4 h-4 mt-0.5 text-accent shrink-0" />
                                <span className="text-sm text-heading">
                                    {item}
                                </span>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            {/* Disclaimers */}
            <section className="px-8 lg:px-16 py-24 max-w-7xl mx-auto">
                <div className="bg-button-secondary rounded-3xl p-8 md:p-10">
                    <div className="flex items-start gap-4 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-dark text-background-primary flex items-center justify-center shrink-0">
                            <LucideAlertTriangle className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-xl font-serif text-heading mb-1">
                                Important disclaimers
                            </h3>
                            <p className="text-xs text-muted">
                                Please read carefully
                            </p>
                        </div>
                    </div>
                    <div className="space-y-4 ml-14">
                        <p className="text-sm text-body leading-relaxed">
                            <strong className="text-heading">Not medical advice.</strong>{" "}
                            TMAG provides informational health guidance based on
                            publicly available data from global health
                            authorities. Our plans are not a substitute for
                            professional medical advice, diagnosis, or treatment.
                        </p>
                        <p className="text-sm text-body leading-relaxed">
                            <strong className="text-heading">Consult your doctor.</strong>{" "}
                            Always consult a qualified healthcare provider before
                            making decisions about vaccinations, medications, or
                            health precautions—especially if you have
                            pre-existing conditions.
                        </p>
                        <p className="text-sm text-body leading-relaxed">
                            <strong className="text-heading">AI limitations.</strong>{" "}
                            Our AI analyzes data from trusted sources but cannot
                            account for every individual health circumstance.
                            Recommendations should be verified with a medical
                            professional.
                        </p>
                    </div>
                </div>
            </section>
        </main>
    );
};

export default About;
