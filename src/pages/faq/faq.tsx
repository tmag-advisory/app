import { useState } from "react";
import { LucidePlus, LucideMinus, LucideArrowRight } from "lucide-react";
import Button from "../../components/ui/Button";

const faqCategories = [
    {
        category: "General",
        questions: [
            {
                q: "What is TMAG?",
                a: "TMAG (Travel Medicine Advisory Global) is an AI-powered platform that generates personalized travel health plans. We analyze your destination, travel dates, and health profile against real-time data from WHO, CDC, and local health authorities to give you actionable medical guidance.",
            },
            {
                q: "Is this medical advice?",
                a: "No. TMAG provides informational health guidance, not medical advice. Our plans are based on publicly available data from global health authorities and are designed to help you prepare—but they are not a substitute for professional medical consultation. Always speak with a doctor before making health decisions.",
            },
            {
                q: "Who is TMAG for?",
                a: "Anyone traveling internationally. Solo travelers, families, digital nomads, and corporate travel managers all use TMAG to prepare for trips. We also serve companies that need to meet duty-of-care obligations for employees traveling abroad.",
            },
        ],
    },
    {
        category: "Credits & billing",
        questions: [
            {
                q: "What consumes a credit?",
                a: "Generating one full travel health plan for one trip consumes one credit. A trip can include multiple destinations. Viewing, downloading, or sharing an existing plan does not consume a credit.",
            },
            {
                q: "Is the first plan really free?",
                a: "Yes. You can sign up and generate your first plan at no cost, with no credit card required. This lets you see exactly what you'll get before paying for anything.",
            },
            {
                q: "Do credits expire?",
                a: "No. Credits never expire. Once purchased, they stay in your account until you use them—whether that's next week or next year.",
            },
            {
                q: "Can I get a refund?",
                a: "Unused credits are refundable within 30 days of purchase. Once a credit has been used to generate a plan, it cannot be refunded.",
            },
        ],
    },
    {
        category: "Plans & features",
        questions: [
            {
                q: "What's included in a plan?",
                a: "Each plan includes: required and recommended vaccinations, medication recommendations, disease risk alerts, water and food safety guidance, emergency contacts and nearby clinics, insurance considerations, packing checklist, and any pre-existing condition adjustments.",
            },
            {
                q: "Can plans be edited after generation?",
                a: "Plans cannot be directly edited, but you can regenerate a plan with updated information. If your itinerary changes or you want to add health details, simply use another credit to generate an updated version.",
            },
            {
                q: "How current is the data?",
                a: "Our system pulls from continuously updated databases. When you generate a plan, it reflects the latest available data from WHO, CDC, ECDC, and local health authorities at that moment—including active outbreak alerts and seasonal risk changes.",
            },
            {
                q: "Can I share my plan with my doctor?",
                a: "Absolutely. Every plan includes a doctor-ready summary specifically formatted for healthcare providers. You can download the PDF and bring it to your appointment or share it digitally.",
            },
        ],
    },
    {
        category: "Privacy & security",
        questions: [
            {
                q: "Is my health data safe?",
                a: "Yes. We follow HIPAA-compliant data handling practices. Your health data is encrypted in transit and at rest, never sold to third parties, and can be fully deleted from your account settings at any time.",
            },
            {
                q: "Do you train AI on my data?",
                a: "No. We do not use your personal health data to train our AI models. Your data is used solely to generate your personalized plan.",
            },
            {
                q: "Can I delete my account and data?",
                a: "Yes. You can delete your account and all associated data at any time from your account settings. Deletion is permanent and irreversible.",
            },
        ],
    },
    {
        category: "Corporate",
        questions: [
            {
                q: "How does the corporate plan differ?",
                a: "Corporate accounts include an HR dashboard for managing travelers, bulk plan generation, compliance reporting, duty-of-care documentation, credit allocation across departments, and API access for integration with travel platforms.",
            },
            {
                q: "Can we integrate TMAG with our travel booking system?",
                a: "Yes. We offer a REST API that allows you to trigger plan generation from your travel booking platform, HRIS, or internal tools. We also support CSV batch uploads for bulk operations.",
            },
            {
                q: "What compliance standards does TMAG support?",
                a: "TMAG supports ISO 31030 travel risk management alignment, provides timestamped plan delivery with read receipts, and generates exportable compliance reports per trip, employee, or destination.",
            },
        ],
    },
];

const FAQItem = ({
    faq,
    isOpen,
    onToggle,
}: {
    faq: { q: string; a: string };
    isOpen: boolean;
    onToggle: () => void;
}) => (
    <div className="border-b border-border-light last:border-b-0">
        <button
            className="w-full flex items-center justify-between py-5 text-left cursor-pointer group"
            onClick={onToggle}
        >
            <span className="text-sm font-semibold text-heading pr-4">
                {faq.q}
            </span>
            <span className="shrink-0 w-8 h-8 rounded-lg bg-button-secondary flex items-center justify-center text-heading group-hover:bg-border-light transition-colors duration-200">
                {isOpen ? (
                    <LucideMinus className="w-4 h-4" />
                ) : (
                    <LucidePlus className="w-4 h-4" />
                )}
            </span>
        </button>
        <div
            className={`overflow-hidden transition-all duration-300 ${isOpen ? "max-h-60 pb-5" : "max-h-0"}`}
        >
            <p className="text-sm text-body leading-relaxed pr-12">
                {faq.a}
            </p>
        </div>
    </div>
);

const FAQPage = () => {
    const [openKey, setOpenKey] = useState<string | null>("General-0");

    return (
        <main>
            {/* Hero */}
            <section className="flex flex-col items-center text-center pt-20 pb-12 px-6">
                <span className="inline-block text-sm text-muted bg-button-secondary font-semibold rounded-xl px-4 py-1.5 mb-6">
                    FAQ
                </span>
                <h1 className="text-5xl md:text-6xl lg:text-7xl leading-[0.9] text-heading font-serif max-w-3xl">
                    Questions?{" "}
                    <span className="italic">Answered.</span>
                </h1>
                <p className="sm:text-lg text-body mt-6 max-w-xl leading-relaxed">
                    Everything you need to know about TMAG, credits, data
                    privacy, and how our AI works.
                </p>
            </section>

            {/* FAQ categories */}
            <section className="px-8 lg:px-16 pb-24 max-w-4xl mx-auto">
                {faqCategories.map((cat) => (
                    <div key={cat.category} className="mb-12 last:mb-0">
                        <h2 className="text-2xl font-serif text-heading mb-6">
                            {cat.category}
                        </h2>
                        <div className="bg-button-secondary rounded-2xl px-6 md:px-8">
                            {cat.questions.map((faq, i) => {
                                const key = `${cat.category}-${i}`;
                                return (
                                    <FAQItem
                                        key={key}
                                        faq={faq}
                                        isOpen={openKey === key}
                                        onToggle={() =>
                                            setOpenKey(
                                                openKey === key ? null : key,
                                            )
                                        }
                                    />
                                );
                            })}
                        </div>
                    </div>
                ))}
            </section>

            {/* Still have questions */}
            <div className="bg-background-secondary">
                <section className="px-8 lg:px-16 py-24 max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl md:text-4xl text-heading leading-[1.1] font-serif mb-4">
                        Still have questions?
                    </h2>
                    <p className="text-sm text-body leading-relaxed max-w-md mx-auto mb-8">
                        Our support team typically responds within 24 hours.
                        We're happy to help with anything not covered above.
                    </p>
                    <div className="flex items-center justify-center gap-4 flex-wrap">
                        <Button variant="primary">Contact support</Button>
                        <Button variant="secondary" icon={<LucideArrowRight />}>
                            hello@tmag.health
                        </Button>
                    </div>
                </section>
            </div>
        </main>
    );
};

export default FAQPage;
