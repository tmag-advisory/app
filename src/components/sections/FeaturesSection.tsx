import { useEffect, useRef, useState, useCallback } from "react";
import {
    AnimatePresence,
    motion,
    useMotionValueEvent,
    useReducedMotion,
    useScroll,
} from "framer-motion";
import { LucideCheck } from "lucide-react";
import { cn } from "../../lib/utils";
import { JOURNEY_STEPS, EASE_SMOOTH } from "./journey/steps";
import PhoneFrame from "./journey/PhoneFrame";
import SectionEyebrow from "../ui/SectionEyebrow";

/* ── Constants ────────────────────────────────────────────────────────── */

const STEP_COUNT = JOURNEY_STEPS.length;

/* ── Progress rail (left column, desktop only) ────────────────────────── */

function ProgressRail({ active }: { active: number }) {
    return (
        <div className="flex flex-col" aria-hidden>
            {JOURNEY_STEPS.map((step, i) => {
                const isActive = i === active;
                const isDone = i < active;

                return (
                    <div key={step.id} className="flex items-start">
                        {/* Dot / check */}
                        <div className="relative flex flex-col items-center">
                            <motion.div
                                className={cn(
                                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold transition-colors duration-500",
                                    isActive
                                        ? "border-accent bg-accent text-white"
                                        : isDone
                                            ? "border-accent/40 bg-accent/10 text-accent"
                                            : "border-border-light bg-background-secondary text-muted",
                                )}
                                animate={
                                    isActive
                                        ? { scale: [1, 1.08, 1] }
                                        : { scale: 1 }
                                }
                                transition={{ duration: 0.4, ease: EASE_SMOOTH }}
                            >
                                {isDone ? (
                                    <LucideCheck className="h-3.5 w-3.5" strokeWidth={2.5} />
                                ) : (
                                    <span className="tabular-nums">{step.index}</span>
                                )}
                            </motion.div>

                            {/* Connector line */}
                            {i < STEP_COUNT - 1 && (
                                <div className="relative h-10 w-px">
                                    <div className="absolute inset-0 bg-border-light" />
                                    <motion.div
                                        className="absolute inset-x-0 top-0 origin-top bg-accent/40"
                                        initial={false}
                                        animate={{ scaleY: isDone ? 1 : 0 }}
                                        transition={{ duration: 0.5, ease: EASE_SMOOTH }}
                                        style={{ height: "100%" }}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Label (visible only for active step on the rail) */}
                        <div className="ml-4 hidden pt-1.5 xl:block">
                            <span
                                className={cn(
                                    "text-xs font-semibold uppercase tracking-[0.15em] transition-colors duration-400",
                                    isActive ? "text-accent" : "text-muted/50",
                                )}
                            >
                                {step.label}
                            </span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

/* ── Step detail (text beside the phone) ──────────────────────────────── */

const stepVariants = {
    enter: { opacity: 0, y: 16, filter: "blur(4px)" },
    center: { opacity: 1, y: 0, filter: "blur(0px)" },
    exit: { opacity: 0, y: -12, filter: "blur(4px)" },
};

function StepDetail({
    active,
    reducedMotion,
}: {
    active: number;
    reducedMotion: boolean;
}) {
    const step = JOURNEY_STEPS[active];

    return (
        <div className="relative min-h-[16rem]">
            <AnimatePresence mode="wait" initial={false}>
                <motion.div
                    key={step.id}
                    variants={stepVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={
                        reducedMotion
                            ? { duration: 0 }
                            : { duration: 0.4, ease: EASE_SMOOTH }
                    }
                >
                    {/* Step counter */}
                    <div className="mb-4 flex items-center gap-3">
                        <span className="font-mono text-sm font-bold tabular-nums text-accent">
                            {step.index}
                        </span>
                        <span className="h-px w-8 bg-accent/30" />
                        <span className="font-mono text-sm tabular-nums text-muted">
                            {String(STEP_COUNT).padStart(2, "0")}
                        </span>
                    </div>

                    {/* Eyebrow */}
                    <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-accent">
                        {step.label}
                    </span>

                    {/* Title */}
                    <h3 className="mt-3 font-serif text-3xl leading-[1.15] text-heading lg:text-4xl">
                        {step.title}
                    </h3>

                    {/* Description */}
                    <p className="mt-4 max-w-md text-base leading-relaxed text-body lg:text-lg">
                        {step.description}
                    </p>

                    {/* Insight */}
                    <div className="mt-6 flex items-start gap-3 rounded-xl border border-border-light bg-background-secondary/60 p-4">
                        <step.Icon
                            className="mt-0.5 h-4 w-4 shrink-0 text-accent"
                            strokeWidth={1.75}
                            aria-hidden
                        />
                        <p className="text-sm leading-relaxed text-muted">
                            {step.insight}
                        </p>
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}

/* ── Mobile step card ─────────────────────────────────────────────────── */

function MobileStepCard({
    step,
    index,
    isActive,
    reducedMotion,
}: {
    step: (typeof JOURNEY_STEPS)[number];
    index: number;
    isActive: boolean;
    reducedMotion: boolean;
}) {
    return (
        <motion.div
            className={cn(
                "rounded-2xl border bg-background-secondary/40 p-6 transition-colors duration-500",
                isActive
                    ? "border-accent/20 bg-background-secondary/80"
                    : "border-border-light",
            )}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={
                reducedMotion
                    ? { duration: 0 }
                    : { duration: 0.5, delay: index * 0.08, ease: EASE_SMOOTH }
            }
        >
            <div className="mb-3 flex items-center gap-3">
                <span
                    className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors duration-400",
                        isActive
                            ? "bg-accent text-white"
                            : "bg-accent/10 text-accent",
                    )}
                >
                    {step.index}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-accent">
                    {step.label}
                </span>
            </div>

            <h3 className="font-serif text-xl leading-[1.2] text-heading">
                {step.title}
            </h3>

            <p className="mt-2 text-sm leading-relaxed text-body">
                {step.description}
            </p>

            <div className="mt-4 flex items-start gap-2.5 rounded-lg border border-border-light bg-background-primary/80 p-3">
                <step.Icon
                    className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent"
                    strokeWidth={1.75}
                    aria-hidden
                />
                <p className="text-xs leading-relaxed text-muted">
                    {step.insight}
                </p>
            </div>
        </motion.div>
    );
}

/* ── Main section ─────────────────────────────────────────────────────── */

const FeaturesSection = () => {
    const sectionRef = useRef<HTMLElement>(null);
    const [activeStep, setActiveStep] = useState(0);
    const reducedMotion = useReducedMotion();
    const [isMobile, setIsMobile] = useState(false);

    /* ── Detect mobile ──────────────────────────────────────────────── */
    useEffect(() => {
        const mq = window.matchMedia("(max-width: 1023px)");
        const handler = (e: MediaQueryListEvent | MediaQueryList) => {
            setIsMobile(e.matches);
        };
        handler(mq);
        mq.addEventListener("change", handler);
        return () => mq.removeEventListener("change", handler);
    }, []);

    /* ── Scroll tracking (desktop sticky-scroll) ────────────────────── */
    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ["start start", "end end"],
    });

    const updateStep = useCallback(
        (progress: number) => {
            const next = Math.min(
                Math.floor(progress * STEP_COUNT),
                STEP_COUNT - 1,
            );
            setActiveStep((prev) => (prev === next ? prev : next));
        },
        [],
    );

    useMotionValueEvent(scrollYProgress, "change", (v) => {
        if (!isMobile) updateStep(v);
    });

    /* ── Mobile: track phone visibility per card via IntersectionObserver */
    useEffect(() => {
        if (!isMobile) return;

        const cards = sectionRef.current?.querySelectorAll<HTMLElement>(
            "[data-step-index]",
        );
        if (!cards?.length) return;

        const observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (entry.isIntersecting) {
                        const idx = Number(
                            (entry.target as HTMLElement).dataset.stepIndex,
                        );
                        if (!Number.isNaN(idx)) setActiveStep(idx);
                    }
                }
            },
            { rootMargin: "-40% 0px -40% 0px", threshold: 0 },
        );

        cards.forEach((c) => observer.observe(c));
        return () => observer.disconnect();
    }, [isMobile]);

    const lite = !!reducedMotion;

    /* ── Mobile render ──────────────────────────────────────────────── */
    if (isMobile) {
        return (
            <section
                ref={sectionRef}
                className="relative mx-auto max-w-7xl overflow-clip px-6 py-20 sm:px-8"
            >
                {/* Decorative orbs */}
                <div
                    aria-hidden
                    className="pointer-events-none absolute -left-20 -top-10 h-[20rem] w-[20rem] rounded-full"
                    style={{
                        background:
                            "radial-gradient(circle, rgba(42,122,106,0.10) 0%, rgba(42,122,106,0.03) 45%, transparent 70%)",
                        filter: "blur(50px)",
                    }}
                />

                {/* Header */}
                <div className="mb-12">
                    <SectionEyebrow className="mb-5">How it works</SectionEyebrow>
                    <h2 className="font-serif text-3xl leading-[1.1] text-heading sm:text-4xl">
                        Your travel plan, in{" "}
                        <span className="italic">five guided steps.</span>
                    </h2>
                    <p className="mt-4 max-w-lg text-sm leading-relaxed text-body">
                        From sign-up to a physician-approved plan in your inbox —
                        here is exactly how TMAG turns your trip into a clear,
                        personalised travel health roadmap.
                    </p>
                </div>

                {/* Sticky phone */}
                <div className="sticky top-2 z-10 mb-8 flex justify-center">
                    <div className="relative rounded-[2.5rem] shadow-xl shadow-dark/10">
                        <PhoneFrame screen={activeStep} lite />
                    </div>
                </div>

                {/* Step cards */}
                <div className="relative space-y-5 pt-4">
                    {JOURNEY_STEPS.map((step, i) => (
                        <div key={step.id} data-step-index={i}>
                            <MobileStepCard
                                step={step}
                                index={i}
                                isActive={i === activeStep}
                                reducedMotion={!!reducedMotion}
                            />
                        </div>
                    ))}
                </div>
            </section>
        );
    }

    /* ── Desktop render ─────────────────────────────────────────────── */
    return (
        <section
            ref={sectionRef}
            className="relative"
            style={{ minHeight: `${STEP_COUNT * 100}vh` }}
            aria-label="How it works — five guided steps"
        >
            {/* Decorative orbs */}
            <div
                aria-hidden
                className="pointer-events-none absolute -left-20 -top-10 h-[26rem] w-[26rem] rounded-full"
                style={{
                    background:
                        "radial-gradient(circle, rgba(42,122,106,0.12) 0%, rgba(42,122,106,0.04) 45%, transparent 70%)",
                    filter: "blur(50px)",
                }}
            />
            <div
                aria-hidden
                className="pointer-events-none absolute -right-20 top-32 h-[24rem] w-[24rem] rounded-full"
                style={{
                    background:
                        "radial-gradient(circle, rgba(196,149,58,0.16) 0%, rgba(232,120,80,0.05) 45%, transparent 70%)",
                    filter: "blur(50px)",
                }}
            />

            {/* Sticky viewport */}
            <div className="sticky top-0 flex min-h-screen items-center">
                <div className="mx-auto grid w-full max-w-7xl grid-cols-12 gap-8 px-6 sm:px-8 lg:px-16">
                    {/* ── Left column: header + progress + detail ── */}
                    <div className="col-span-7 flex flex-col justify-center py-20">
                        {/* Section header */}
                        <div className="mb-12">
                            <SectionEyebrow className="mb-5">
                                How it works
                            </SectionEyebrow>
                            <h2 className="font-serif text-4xl leading-[1.1] text-heading lg:text-5xl">
                                Your travel plan, in{" "}
                                <span className="italic">five guided steps.</span>
                            </h2>
                        </div>

                        {/* Progress rail + detail */}
                        <div className="flex gap-8">
                            <ProgressRail active={activeStep} />
                            <div className="flex-1 pt-1">
                                <StepDetail
                                    active={activeStep}
                                    reducedMotion={!!reducedMotion}
                                />
                            </div>
                        </div>
                    </div>

                    {/* ── Right column: phone ── */}
                    <div className="col-span-5 flex items-center justify-center py-20">
                        <div className="relative">
                            {/* Glow behind phone */}
                            <div
                                aria-hidden
                                className="absolute left-1/2 top-1/2 h-[28rem] w-[22rem] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-60"
                                style={{
                                    background:
                                        "radial-gradient(ellipse, rgba(42,122,106,0.10) 0%, transparent 70%)",
                                    filter: "blur(40px)",
                                }}
                            />
                            <motion.div
                                className="relative"
                                initial={{ opacity: 0, y: 32 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, amount: 0.3 }}
                                transition={{
                                    duration: 0.7,
                                    ease: EASE_SMOOTH,
                                }}
                            >
                                <PhoneFrame screen={activeStep} lite={lite} />
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default FeaturesSection;
