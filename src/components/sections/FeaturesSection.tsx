import { motion } from "framer-motion";
import {
    LucideSyringe,
    LucidePill,
    LucideTriangleAlert,
    LucideShieldCheck,
    LucideFileCheck,
    LucideStethoscope,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { JOURNEY_STEPS } from "./journey/steps";
import AnimateIn from "../animations/AnimateIn";
import StaggerGroup, { staggerItem } from "../animations/StaggerGroup";
import SectionEyebrow from "../ui/SectionEyebrow";

/* What every finished plan contains — reinforces the deliverable in one glance. */
const PLAN_CONTENTS = [
    { Icon: LucideSyringe, label: "Vaccination checklist" },
    { Icon: LucidePill, label: "Medication & prophylaxis" },
    { Icon: LucideTriangleAlert, label: "Itinerary risk alerts" },
    { Icon: LucideShieldCheck, label: "Travel insurance guidance" },
    { Icon: LucideFileCheck, label: "Downloadable PDF plan" },
    { Icon: LucideStethoscope, label: "Doctor-ready summary" },
] as const;

const LAST_STEP = JOURNEY_STEPS.length - 1;

const FeaturesSection = () => {
    return (
        <section className="relative overflow-hidden px-6 pt-24 pb-20 sm:px-8 lg:px-16">
            {/* Dot-grid texture */}
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-[0.15]"
                style={{
                    backgroundImage:
                        "radial-gradient(circle,#7a6a5a 1px,transparent 1px)",
                    backgroundSize: "26px 26px",
                    maskImage:
                        "linear-gradient(180deg,#000 0%,transparent 55%)",
                    WebkitMaskImage:
                        "linear-gradient(180deg,#000 0%,transparent 55%)",
                }}
            />
            {/* Atmosphere orbs */}
            <div
                aria-hidden
                className="pointer-events-none absolute -left-24 top-10 h-96 w-96 rounded-full"
                style={{
                    background:
                        "radial-gradient(circle, rgba(42,122,106,0.12) 0%, rgba(42,122,106,0.04) 45%, transparent 70%)",
                    filter: "blur(50px)",
                }}
            />
            <div
                aria-hidden
                className="pointer-events-none absolute -right-24 bottom-0 h-96 w-96 rounded-full"
                style={{
                    background:
                        "radial-gradient(circle, rgba(196,149,58,0.16) 0%, rgba(232,120,80,0.05) 45%, transparent 70%)",
                    filter: "blur(50px)",
                }}
            />

            <div className="relative z-10 mx-auto max-w-7xl">
                {/* Editorial header: headline left, lead right */}
                <div className="grid items-end gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
                    <AnimateIn type="fadeLeft">
                        <SectionEyebrow className="mb-6">
                            How it works
                        </SectionEyebrow>
                        <h2 className="font-serif text-4xl leading-[1.04] tracking-tight text-heading md:text-5xl lg:text-6xl">
                            Your trip, turned into a{" "}
                            <span className="italic text-accent">
                                doctor-approved&nbsp;plan.
                            </span>
                        </h2>
                    </AnimateIn>
                    <AnimateIn type="fadeRight" delay={0.12}>
                        <p className="max-w-md text-body leading-relaxed sm:text-lg lg:mb-2">
                            Tell us where you&apos;re going. TMAG cross-references
                            WHO &amp; CDC guidance and live outbreak data against
                            your health profile then a licensed physician
                            signs off before it reaches your inbox.
                        </p>
                    </AnimateIn>
                </div>

                {/* Step flow */}
                <div className="mt-16 lg:mt-24">
                    {/* Desktop: connected horizontal timeline */}
                    <div className="relative hidden lg:block">
                        <div
                            aria-hidden
                            className="absolute left-[10%] right-[10%] top-7 h-px bg-border"
                        />
                        <StaggerGroup
                            className="relative grid grid-cols-5 gap-6"
                            stagger={0.12}
                        >
                            {JOURNEY_STEPS.map((step, i) => {
                                const isLast = i === LAST_STEP;
                                return (
                                    <motion.div
                                        key={step.id}
                                        variants={staggerItem}
                                        className="flex flex-col items-center text-center"
                                    >
                                        <div className="relative">
                                            <div
                                                className={cn(
                                                    "flex h-14 w-14 items-center justify-center rounded-2xl border shadow-sm",
                                                    isLast
                                                        ? "border-accent bg-accent text-white"
                                                        : "border-border bg-background-secondary text-accent",
                                                )}
                                            >
                                                <step.Icon
                                                    className="h-6 w-6"
                                                    strokeWidth={1.6}
                                                    aria-hidden
                                                />
                                            </div>
                                            <span className="absolute -right-2.5 -top-2.5 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-background-primary font-mono text-[10px] font-semibold text-heading">
                                                {step.index}
                                            </span>
                                        </div>
                                        <h3 className="mt-6 font-serif text-lg leading-snug text-heading">
                                            {step.label}
                                        </h3>
                                        <p className="mt-2 max-w-[15rem] text-sm leading-relaxed text-muted">
                                            {step.description}
                                        </p>
                                    </motion.div>
                                );
                            })}
                        </StaggerGroup>
                    </div>

                    {/* Mobile: connected vertical timeline */}
                    <div className="relative lg:hidden">
                        <div
                            aria-hidden
                            className="absolute bottom-6 left-6 top-6 w-px bg-border"
                        />
                        <StaggerGroup
                            as="ul"
                            className="relative space-y-7"
                            stagger={0.1}
                        >
                            {JOURNEY_STEPS.map((step, i) => {
                                const isLast = i === LAST_STEP;
                                return (
                                    <motion.li
                                        key={step.id}
                                        variants={staggerItem}
                                        className="flex items-start gap-4"
                                    >
                                        <div
                                            className={cn(
                                                "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border shadow-sm",
                                                isLast
                                                    ? "border-accent bg-accent text-white"
                                                    : "border-border bg-background-secondary text-accent",
                                            )}
                                        >
                                            <step.Icon
                                                className="h-5 w-5"
                                                strokeWidth={1.6}
                                                aria-hidden
                                            />
                                        </div>
                                        <div className="pt-0.5">
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono text-[10px] font-semibold text-accent">
                                                    {step.index}
                                                </span>
                                                <h3 className="font-serif text-lg leading-snug text-heading">
                                                    {step.label}
                                                </h3>
                                            </div>
                                            <p className="mt-1 text-sm leading-relaxed text-muted">
                                                {step.description}
                                            </p>
                                        </div>
                                    </motion.li>
                                );
                            })}
                        </StaggerGroup>
                    </div>
                </div>

                {/* Inside every plan */}
                <AnimateIn
                    delay={0.1}
                    className="mt-16 rounded-3xl border border-border bg-background-secondary/70 px-6 py-6 lg:mt-20 lg:px-10 lg:py-7"
                >
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                        <p className="shrink-0 font-mono text-[11px] uppercase tracking-[0.18em] text-brand-muted">
                            Inside every plan
                        </p>
                        <div className="flex flex-wrap gap-x-6 gap-y-3">
                            {PLAN_CONTENTS.map(({ Icon, label }) => (
                                <span
                                    key={label}
                                    className="inline-flex items-center gap-2 text-sm text-heading"
                                >
                                    <Icon
                                        className="h-4 w-4 shrink-0 text-accent"
                                        strokeWidth={1.75}
                                        aria-hidden
                                    />
                                    {label}
                                </span>
                            ))}
                        </div>
                    </div>
                </AnimateIn>
            </div>
        </section>
    );
};

export default FeaturesSection;
