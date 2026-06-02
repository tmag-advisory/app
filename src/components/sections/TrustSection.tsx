import {
    LucideStethoscope,
    LucideBadgeCheck,
    LucideGlobe,
    LucideLock,
} from "lucide-react";
import { motion } from "framer-motion";
import StarRating from "../ui/StarRating";
import AnimateIn from "../animations/AnimateIn";
import StaggerGroup, { staggerItem } from "../animations/StaggerGroup";
import SectionEyebrow from "../ui/SectionEyebrow";

const pillars = [
    {
        Icon: LucideBadgeCheck,
        stat: "WHO + CDC",
        caption: "Guidance aligned to global health authorities",
    },
    {
        Icon: LucideGlobe,
        stat: "190+",
        caption: "Countries with live travel advisories",
    },
    {
        Icon: LucideStethoscope,
        stat: "Physician",
        caption: "Every plan reviewed and signed off",
    },
    {
        Icon: LucideLock,
        stat: "NDPR-aligned",
        caption: "Encrypted, private, deletable anytime",
    },
];

const testimonials = [
    {
        quote: "TMAG gave me a complete malaria prevention plan in under two minutes. My doctor was impressed I came so prepared.",
        name: "Sarah K.",
        role: "Backpacker · Southeast Asia",
        initials: "SK",
        color: "bg-accent/12 text-accent",
    },
    {
        quote: "We rolled this out to 200+ employees travelling across Africa. The compliance reports alone saved us weeks of work.",
        name: "James L.",
        role: "Head of Global Mobility · TechCorp",
        initials: "JL",
        color: "bg-gold/20 text-[#7a5a1a]",
    },
    {
        quote: "I have a chronic condition and was nervous about South America. The personalised plan addressed every concern I had.",
        name: "Maria R.",
        role: "Solo traveller · Brazil & Peru",
        initials: "MR",
        color: "bg-[#e87850]/15 text-[#b4532c]",
    },
];

const TrustSection = () => {
    return (
        <section className="relative overflow-hidden px-6 pt-24 pb-24 sm:px-8 lg:px-16">
            {/* Atmosphere orb */}
            <div
                aria-hidden
                className="pointer-events-none absolute -left-24 top-24 h-96 w-96 rounded-full"
                style={{
                    background:
                        "radial-gradient(circle, rgba(196,149,58,0.12) 0%, rgba(232,120,80,0.04) 45%, transparent 70%)",
                    filter: "blur(50px)",
                }}
            />

            <div className="relative z-10 mx-auto max-w-7xl">
                <AnimateIn className="mx-auto mb-12 max-w-2xl text-center lg:mb-16">
                    <div className="mb-6 flex flex-wrap items-center justify-center gap-2">
                        <SectionEyebrow>Clinically grounded</SectionEyebrow>
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-accent">
                            <LucideStethoscope
                                width={12}
                                height={12}
                                strokeWidth={2.25}
                            />
                            Physician-reviewed
                        </span>
                    </div>
                    <h2 className="font-serif text-4xl leading-[1.08] tracking-tight text-heading md:text-5xl lg:text-6xl">
                        Built on guidance you can{" "}
                        <span className="italic text-accent">trust.</span>
                    </h2>
                </AnimateIn>

                {/* Credibility band */}
                <AnimateIn delay={0.05}>
                    <div className="overflow-hidden rounded-3xl border border-border bg-border">
                        <div className="grid grid-cols-2 gap-px lg:grid-cols-4">
                            {pillars.map(({ Icon, stat, caption }) => (
                                <div
                                    key={stat}
                                    className="flex flex-col gap-3 bg-background-secondary p-7 lg:p-8"
                                >
                                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
                                        <Icon
                                            className="h-5 w-5"
                                            strokeWidth={1.75}
                                            aria-hidden
                                        />
                                    </span>
                                    <p className="font-serif text-2xl leading-tight text-heading">
                                        {stat}
                                    </p>
                                    <p className="text-sm leading-relaxed text-muted">
                                        {caption}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </AnimateIn>

                {/* Testimonials */}
                <StaggerGroup
                    className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3"
                    stagger={0.12}
                >
                    {testimonials.map((t) => (
                        <motion.div
                            variants={staggerItem}
                            key={t.name}
                            className="relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border-light bg-background-secondary p-8 shadow-sm"
                        >
                            <span
                                aria-hidden
                                className="pointer-events-none absolute right-5 top-1 font-serif text-7xl leading-none text-accent/10"
                            >
                                &rdquo;
                            </span>
                            <div className="relative">
                                <StarRating count={5} />
                                <p className="mt-4 text-base leading-relaxed text-heading">
                                    &ldquo;{t.quote}&rdquo;
                                </p>
                            </div>
                            <div className="relative mt-6 flex items-center gap-3 border-t border-border-light pt-6">
                                <div
                                    className={`flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold ${t.color}`}
                                >
                                    {t.initials}
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-heading">
                                        {t.name}
                                    </p>
                                    <p className="mt-0.5 text-xs text-body">
                                        {t.role}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </StaggerGroup>
            </div>
        </section>
    );
};

export default TrustSection;
