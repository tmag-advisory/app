import { useState } from "react";
import { LucidePlus, LucideMinus } from "lucide-react";
import AnimateIn from "../animations/AnimateIn";

const faqs = [
    {
        question: "Is the AI advice a substitute for a doctor?",
        answer: "No. TMAG provides informational guidance based on WHO, CDC, and local health authority data. We recommend sharing your plan with a healthcare provider before traveling, especially if you have pre-existing conditions.",
    },
    {
        question: "How current is the health data?",
        answer: "Our AI pulls from continuously updated databases including real-time outbreak alerts, seasonal risk changes, and the latest vaccine recommendations. Plans are generated using the most recent data available at the time of creation.",
    },
    {
        question: "Can I use this for multiple destinations in one trip?",
        answer: "Absolutely. The Traveler plan supports multi-destination itineraries. Just enter each stop and we'll generate a unified plan that covers the health requirements for your entire route.",
    },
    {
        question: "What if I have a chronic condition or take medications?",
        answer: "You can enter your health profile including chronic conditions, current medications, and allergies. The AI factors these into every recommendation—from drug interactions with prophylactics to altitude and climate considerations.",
    },
    {
        question: "How does the Enterprise plan work?",
        answer: "Enterprise gives your organization a dashboard to manage travel health for all employees. HR and travel managers can generate reports in bulk, track compliance, and integrate with existing travel booking platforms via our API.",
    },
    {
        question: "Is my health information secure?",
        answer: "Yes. We follow HIPAA-compliant data handling practices. Your health data is encrypted in transit and at rest, never shared with third parties, and you can delete it at any time from your account settings.",
    },
];

const FAQItem = ({
    faq,
    isOpen,
    onToggle,
}: {
    faq: (typeof faqs)[0];
    isOpen: boolean;
    onToggle: () => void;
}) => (
    <div className="border-b border-border-light last:border-b-0">
        <button
            className="w-full flex items-center justify-between py-5 text-left cursor-pointer group"
            onClick={onToggle}
        >
            <span className="text-sm font-semibold text-heading pr-4">
                {faq.question}
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
            className={`overflow-hidden transition-all duration-300 ${isOpen ? "max-h-48 pb-5" : "max-h-0"}`}
        >
            <p className="text-sm text-body leading-relaxed pr-12">
                {faq.answer}
            </p>
        </div>
    </div>
);

const FAQSection = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <section className="px-8 lg:px-16 pt-24 pb-16 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row gap-12 md:gap-20">
                <AnimateIn type="fadeLeft" className="md:w-1/3 shrink-0">
                    <span className="inline-block text-sm text-muted bg-button-secondary font-semibold rounded-xl px-4 py-1.5 mb-6">
                        FAQ
                    </span>
                    <h2 className="text-4xl md:text-5xl text-heading leading-[1.1] font-serif">
                        Questions?{" "}
                        <span className="italic">Answers.</span>
                    </h2>
                    <p className="text-sm text-muted leading-relaxed mt-4">
                        Can't find what you're looking for? Reach out to our
                        support team and we'll get back to you within 24 hours.
                    </p>
                </AnimateIn>

                <AnimateIn type="fadeRight" delay={0.15} className="md:w-2/3">
                    {faqs.map((faq, i) => (
                        <FAQItem
                            key={i}
                            faq={faq}
                            isOpen={openIndex === i}
                            onToggle={() =>
                                setOpenIndex(openIndex === i ? null : i)
                            }
                        />
                    ))}
                </AnimateIn>
            </div>
        </section>
    );
};

export default FAQSection;
