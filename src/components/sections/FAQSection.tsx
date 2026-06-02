import { useState } from "react";
import {
    LucidePlus,
    LucideMinus,
    LucideHeadset,
    LucideArrowRight,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import AnimateIn from "../animations/AnimateIn";
import SectionEyebrow from "../ui/SectionEyebrow";
import Button from "../ui/Button";
import { cn } from "../../lib/utils";

const faqs = [
    {
        question: "Is the advisory guidance a substitute for a doctor?",
        answer: "No. TMAG provides informational guidance based on WHO, CDC, and local health authority data. We recommend sharing your plan with a healthcare provider before travelling, especially if you have pre-existing conditions.",
    },
    {
        question: "How current is the health data?",
        answer: "Our platform pulls from continuously updated databases including real-time outbreak alerts, seasonal risk changes, and the latest vaccine recommendations. Plans are generated using the most recent data available at the time of creation.",
    },
    {
        question: "Can I use this for multiple destinations in one trip?",
        answer: "Absolutely. The Traveller plan supports multi-destination itineraries. Just enter each stop and we'll generate a unified plan that covers the health requirements for your entire route.",
    },
    {
        question: "What if I have a chronic condition or take medications?",
        answer: "You can enter your health profile including chronic conditions, current medications, and allergies. The system factors these into every recommendation — from drug interactions with prophylactics to altitude and climate considerations.",
    },
    {
        question: "How does the Enterprise plan work?",
        answer: "Enterprise gives your organization a dashboard to manage travel health for all members. HR and travel managers can generate reports in bulk, track compliance, and integrate with existing travel booking platforms via our API.",
    },
    {
        question: "Is my health information secure?",
        answer: "Yes. We follow NDPR-aligned data handling practices. Your health data is encrypted in transit and at rest, never shared with third parties, and you can delete it at any time from your account settings.",
    },
];

const FAQItem = ({
    faq,
    index,
    isOpen,
    onToggle,
}: {
    faq: (typeof faqs)[number];
    index: string;
    isOpen: boolean;
    onToggle: () => void;
}) => (
    <div
        className={cn(
            "rounded-2xl border transition-colors duration-200",
            isOpen
                ? "border-accent/30 bg-background-secondary"
                : "border-border bg-background-secondary/40 hover:border-border",
        )}
    >
        <button
            type="button"
            onClick={onToggle}
            aria-expanded={isOpen}
            className="flex w-full cursor-pointer items-center gap-4 px-5 py-4 text-left"
        >
            <span className="font-mono text-[11px] font-semibold tabular-nums text-accent">
                {index}
            </span>
            <span className="flex-1 text-sm font-semibold text-heading">
                {faq.question}
            </span>
            <span
                className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors duration-200",
                    isOpen
                        ? "bg-accent text-white"
                        : "bg-button-secondary text-heading",
                )}
            >
                {isOpen ? (
                    <LucideMinus className="h-4 w-4" />
                ) : (
                    <LucidePlus className="h-4 w-4" />
                )}
            </span>
        </button>
        <AnimatePresence initial={false}>
            {isOpen && (
                <motion.div
                    key="content"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                    className="overflow-hidden"
                >
                    <p className="pb-5 pl-[3.25rem] pr-5 text-sm leading-relaxed text-body">
                        {faq.answer}
                    </p>
                </motion.div>
            )}
        </AnimatePresence>
    </div>
);

const FAQSection = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <section className="px-6 pt-24 pb-24 sm:px-8 lg:px-16">
            <div className="mx-auto grid max-w-7xl items-start gap-10 lg:grid-cols-[0.85fr_1.4fr] lg:gap-16">
                <div className="lg:sticky lg:top-24 lg:self-start">
                    <AnimateIn type="fadeLeft">
                        <SectionEyebrow className="mb-6">FAQ</SectionEyebrow>
                        <h2 className="font-serif text-4xl leading-[1.08] tracking-tight text-heading md:text-5xl">
                            Questions?{" "}
                            <span className="italic text-accent">Answered.</span>
                        </h2>
                        <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted">
                            Everything you need to know about how TMAG keeps you
                            safe abroad. Can&apos;t find it here? Our team replies
                            within 24 hours.
                        </p>

                        <div className="mt-8 max-w-sm rounded-2xl border border-border bg-background-secondary p-5">
                            <div className="flex items-center gap-3">
                                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
                                    <LucideHeadset
                                        className="h-5 w-5"
                                        strokeWidth={1.75}
                                    />
                                </span>
                                <div>
                                    <p className="text-sm font-semibold text-heading">
                                        Still curious?
                                    </p>
                                    <p className="mt-0.5 text-xs text-muted">
                                        Talk to a real human on our team.
                                    </p>
                                </div>
                            </div>
                            <div className="mt-4">
                                <Button
                                    variant="secondary"
                                    link="/contact"
                                    icon={<LucideArrowRight />}
                                >
                                    Contact support
                                </Button>
                            </div>
                        </div>
                    </AnimateIn>
                </div>

                <AnimateIn type="fadeRight" delay={0.15} className="space-y-3">
                    {faqs.map((faq, i) => (
                        <FAQItem
                            key={faq.question}
                            faq={faq}
                            index={String(i + 1).padStart(2, "0")}
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
