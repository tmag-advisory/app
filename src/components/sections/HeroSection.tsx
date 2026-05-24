import { LucideArrowRight, LucideShield, LucideCheck } from "lucide-react";
import { useRef, useLayoutEffect, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import Button from "../ui/Button";
import StarRating from "../ui/StarRating";

interface ProgressStep {
    label: string;
    done: boolean;
}

interface SampleTripData {
    country: string;
    flag: string;
    tripType: string;
    detail: string;
    completeness: number;
    progressSteps: ProgressStep[];
}

interface HeroVariant {
    eyebrow: string;
    headlineLines: [string, string, string];
    subtext: string;
    cta: string;
    destinations: SampleTripData[];
}

const HERO_VARIANT: HeroVariant = {
    eyebrow: "Personalized Travel Health Intelligence",
    headlineLines: ["Travel", "Return", "Safe."],
    subtext:
        "Physician validated. Tailored to your itinerary and health history. Anytime, anywhere.",
    cta: "Get Started",
    destinations: [
        {
            country: "Japan",
            flag: "🇯🇵",
            tripType: "Business Travel",
            detail: "7-day Tokyo itinerary",
            completeness: 85,
            progressSteps: [
                { label: "Medical Review", done: true },
                { label: "Vaccinations", done: true },
                { label: "Travel Insurance", done: true },
                { label: "Medication Plan", done: true },
            ],
        },
        {
            country: "Kenya",
            flag: "🇰🇪",
            tripType: "Family Vacation",
            detail: "Wildlife & beach getaway",
            completeness: 45,
            progressSteps: [
                { label: "Medical Review", done: true },
                { label: "Vaccinations", done: true },
                { label: "Travel Insurance", done: false },
                { label: "Travel Advisories", done: false },
            ],
        },
        {
            country: "Brazil",
            flag: "🇧🇷",
            tripType: "Medical Mission",
            detail: "Rio & Amazon trek",
            completeness: 60,
            progressSteps: [
                { label: "Medical Review", done: true },
                { label: "Vaccinations", done: true },
                { label: "Medication Plan", done: false },
                { label: "Travel Advisories", done: false },
            ],
        },
        {
            country: "India",
            flag: "🇮🇳",
            tripType: "Study Abroad",
            detail: "Cultural immersion program",
            completeness: 30,
            progressSteps: [
                { label: "Medical Review", done: true },
                { label: "Vaccinations", done: false },
                { label: "Travel Insurance", done: false },
                { label: "Travel Advisories", done: false },
            ],
        },
    ],
};

const CARD_CLS =
    "rounded-2xl border border-border bg-background-secondary shadow-sm p-4 cursor-default select-none";

const OFFSETS_R: {
    top: string;
    left?: string;
    right?: string;
    rotate: number;
}[] = [
    { top: "3%", left: "2%", rotate: -2.5 },
    { top: "6%", right: "0%", rotate: 2 },
    { top: "50%", left: "6%", rotate: 1.5 },
    { top: "54%", right: "3%", rotate: -1.5 },
];

const OFFSETS_L: typeof OFFSETS_R = [
    { top: "3%", right: "2%", rotate: 2.5 },
    { top: "6%", left: "0%", rotate: -2 },
    { top: "50%", right: "6%", rotate: -1.5 },
    { top: "54%", left: "3%", rotate: 1.5 },
];

const FLOAT = [
    { y: 10, dur: 3.2 },
    { y: 8, dur: 3.8 },
    { y: 11, dur: 2.9 },
    { y: 9, dur: 4.0 },
];

// const STATS = [
//     { value: "1K+", label: "Travel Plans Created" },
//     { value: "120+", label: "Countries covered" },
//     { value: "5+", label: "Health Professionals" },
// ];

const HL_SIZE = [
    "text-5xl md:text-6xl lg:text-7xl xl:text-[5.25rem]",
    "text-5xl md:text-6xl lg:text-7xl xl:text-[5.25rem]",
    "text-5xl md:text-6xl lg:text-7xl xl:text-[5.25rem]",
    "text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl",
    "text-4xl md:text-5xl lg:text-6xl",
    "text-5xl md:text-6xl lg:text-7xl xl:text-8xl",
];

const ProgressChecklist = ({ steps }: { steps: ProgressStep[] }) => (
    <div className="mt-2 space-y-1">
        {steps.map((step, i) => (
            <div key={i} className="flex items-center gap-1.5">
                <div
                    className={`w-3 h-3 rounded-full flex items-center justify-center flex-shrink-0 ${
                        step.done ? "bg-accent" : "border border-border"
                    }`}
                >
                    {step.done && (
                        <LucideCheck
                            size={8}
                            className="text-white"
                            strokeWidth={3}
                        />
                    )}
                </div>
                <span
                    className={`text-[10px] leading-tight ${
                        step.done ? "text-heading font-medium" : "text-muted"
                    }`}
                >
                    {step.label}
                </span>
            </div>
        ))}
    </div>
);

const CardContent = ({ d }: { d: SampleTripData }) => (
    <>
        <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 min-w-0">
                <span className="text-xl shrink-0">{d.flag}</span>
                <span className="font-semibold text-heading text-sm truncate">
                    {d.country}
                </span>
            </div>
            <span className="inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ml-1 bg-accent/10 text-accent border border-accent/20">
                {d.tripType}
            </span>
        </div>
        <p className="text-xs text-muted leading-snug">{d.detail}</p>
        <ProgressChecklist steps={d.progressSteps} />
        <div className="mt-2">
            <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-muted font-medium uppercase tracking-wider">
                    Readiness
                </span>
                <span className="text-[10px] font-semibold text-heading tabular-nums">
                    {d.completeness}%
                </span>
            </div>
            <div className="h-1.5 rounded-full bg-border overflow-hidden">
                <div
                    className="h-full rounded-full transition-all"
                    style={{
                        width: `${d.completeness}%`,
                        backgroundColor:
                            d.completeness >= 70 ? "#4f9e6a"
                            : d.completeness >= 40 ? "#d4a04a"
                            : "#d46a4a",
                    }}
                />
            </div>
        </div>
    </>
);

const MobileCards = ({ dests }: { dests: SampleTripData[] }) => (
    <div data-hero-anim className="grid grid-cols-2 gap-3 mt-10 lg:hidden">
        {dests.slice(0, 2).map((d) => (
            <div
                key={d.country}
                className="rounded-2xl border border-border bg-background-secondary p-3"
            >
                <div className="flex items-center gap-1.5 mb-2">
                    <span className="text-base">{d.flag}</span>
                    <span className="font-semibold text-heading text-xs truncate">
                        {d.country}
                    </span>
                </div>
                <span className="inline-flex items-center text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-accent/10 text-accent">
                    {d.tripType}
                </span>
                <p className="text-xs text-muted mt-1.5 leading-snug">
                    {d.detail}
                </p>
                <ProgressChecklist steps={d.progressSteps} />
                <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 h-1 rounded-full bg-border overflow-hidden">
                        <div
                            className="h-full rounded-full"
                            style={{
                                width: `${d.completeness}%`,
                                backgroundColor:
                                    d.completeness >= 70 ? "#4f9e6a"
                                    : d.completeness >= 40 ? "#d4a04a"
                                    : "#d46a4a",
                            }}
                        />
                    </div>
                    <span className="text-[10px] font-semibold text-heading tabular-nums">
                        {d.completeness}%
                    </span>
                </div>
            </div>
        ))}
    </div>
);

// const StatsRow = ({ className = "" }: { className?: string }) => (
//     <div data-hero-anim className={`flex flex-wrap items-center gap-8 mt-10 pt-8 border-t border-border-light ${className}`}>
//         {STATS.map((s) => (
//             <div key={s.label}>
//                 <p className="text-2xl font-bold font-serif text-heading">{s.value}</p>
//                 <p className="text-xs text-muted mt-0.5">{s.label}</p>
//             </div>
//         ))}
//     </div>
// );

const Divider = ({ className = "" }: { className?: string }) => (
    <div
        data-hero-anim
        className={`flex items-center gap-3 mt-7 mb-6 w-full max-w-md ${className}`}
    >
        <div className="h-px flex-1 bg-border" />
        <LucideShield
            size={13}
            className="text-accent opacity-50"
            strokeWidth={1.5}
        />
        <div className="h-px flex-1 bg-border" />
    </div>
);

const TYPING_WORDS = [
    "Far.",
    "Ready.",
    "Smart.",
    "Prepared.",
    "Informed.",
];

const TypewriterWord = ({ hl }: { hl: string }) => {
    const [text, setText] = useState("");
    const wordIdxRef = useRef(0);
    const phaseRef = useRef<"typing" | "pause" | "deleting">("typing");
    const textRef = useRef(text);
    const cursorRef = useRef<HTMLSpanElement>(null);

    // Keep textRef synced during render
    textRef.current = text;

    useEffect(() => {
        let mounted = true;
        let timeoutId: ReturnType<typeof setTimeout>;

        const tick = () => {
            if (!mounted) return;
            const word = TYPING_WORDS[wordIdxRef.current];
            const phase = phaseRef.current;
            const currentText = textRef.current;

            if (phase === "typing") {
                if (currentText.length < word.length) {
                    setText(word.slice(0, currentText.length + 1));
                    timeoutId = setTimeout(tick, 70);
                } else {
                    phaseRef.current = "pause";
                    timeoutId = setTimeout(tick, 1800);
                }
            } else if (phase === "pause") {
                phaseRef.current = "deleting";
                timeoutId = setTimeout(tick, 200);
            } else if (phase === "deleting") {
                if (currentText.length > 0) {
                    setText(word.slice(0, currentText.length - 1));
                    timeoutId = setTimeout(tick, 35);
                } else {
                    wordIdxRef.current = (wordIdxRef.current + 1) % TYPING_WORDS.length;
                    phaseRef.current = "typing";
                    timeoutId = setTimeout(tick, 250);
                }
            }
        };

        timeoutId = setTimeout(tick, 70);
        return () => {
            mounted = false;
            clearTimeout(timeoutId);
        };
    }, []);

    return (
        <span className={`${hl} italic text-accent inline-block`}>
            {text}
            <span
                ref={cursorRef}
                className="inline-block w-[2px] h-[0.85em] bg-accent align-middle ml-0.5 animate-pulse"
                aria-hidden
            />
        </span>
    );
};

interface HeroSectionProps {
    layout?: number;
}

const HeroSection = ({ layout = 0 }: HeroSectionProps) => {
    const sectionRef = useRef<HTMLElement>(null);
    const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

    const variant = HERO_VARIANT;

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from("[data-hero-anim]", {
                y: 36,
                opacity: 0.8,
                duration: 0.8,
                ease: "power3.out",
                stagger: 0.1,
            });

            const fromX =
                layout === 0 ? 60
                : layout === 2 ? -60
                : layout === 5 ? 40
                : 0;
            const fromY =
                layout === 6 ? -30
                : fromX === 0 ? 30
                : 0;
            gsap.from("[data-dest-card]", {
                x: fromX,
                y: fromY,
                opacity: 0.8,
                duration: 0.75,
                ease: "back.out(1.3)",
                stagger: 0.14,
                delay: 0.35,
            });

            if (layout === 0 || layout === 2) {
                cardsRef.current.forEach((el, i) => {
                    if (!el) return;
                    gsap.to(el, {
                        y: -FLOAT[i].y,
                        duration: FLOAT[i].dur,
                        ease: "sine.inOut",
                        repeat: -1,
                        yoyo: true,
                        delay: 1.5 + i * 0.3,
                    });
                });
            }
        }, sectionRef);

        return () => ctx.revert();
    }, [layout]);

    const dotBg = (
        <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.18]"
            style={{
                backgroundImage:
                    "radial-gradient(circle,#7a6a5a 1px,transparent 1px)",
                backgroundSize: "26px 26px",
            }}
        />
    );

    const coords = (side: "right" | "left" = "right") => (
        <div
            aria-hidden
            className={`pointer-events-none absolute top-6 ${side === "right" ? "right-8 text-right" : "left-8"} hidden lg:block select-none`}
        >
            <p className="font-mono text-[10px] tracking-widest text-brand-muted opacity-50">
                TMAG — GLOBAL HEALTH ADVISORY
            </p>
        </div>
    );

    const hl = HL_SIZE[layout] ?? HL_SIZE[0];
    const base =
        "relative overflow-hidden px-6 pt-14 pb-16 lg:px-14 lg:pt-20 lg:pb-24";

    const floatingCards = (offsets: typeof OFFSETS_R) =>
        variant.destinations.map((d, i) => {
            const pos = offsets[i];
            return (
                <div
                    key={d.country}
                    data-dest-card
                    ref={(el: HTMLDivElement | null) => {
                        cardsRef.current[i] = el;
                    }}
                    className={`absolute w-52 ${CARD_CLS}`}
                    style={{
                        top: pos.top,
                        ...(pos.left != null && { left: pos.left }),
                        ...(pos.right != null && { right: pos.right }),
                        transform: `rotate(${pos.rotate}deg)`,
                    }}
                >
                    <CardContent d={d} />
                </div>
            );
        });

    if (layout === 0) {
        return (
            <section ref={sectionRef} className={base}>
                {dotBg}
                {coords("right")}
                <div className="relative z-10 mx-auto max-w-7xl">
                    <div className="grid lg:grid-cols-[1fr_0.85fr] lg:gap-12 items-center">
                        <div className="flex flex-col items-start">
                            <div
                                data-hero-anim
                                className="flex flex-col items-start gap-3 mb-5"
                            >
                                <StarRating count={5} />
                                <br />
                                <span className="text-sm font-medium text-muted">
                                    {variant.eyebrow}
                                </span>
                            </div>
                            <h1
                                data-hero-anim
                                className="font-serif text-heading leading-[0.88] tracking-tight"
                            >
                                <span className={`block ${hl}`}>
                                    {variant.headlineLines[0]}{" "}
                                    <TypewriterWord hl={hl} />
                                </span>
                                <span className={`block ${hl}`}>
                                    {variant.headlineLines[1]}
                                </span>
                                <span className={`block ${hl}`}>
                                    {variant.headlineLines[2]}
                                </span>
                            </h1>
                            <Divider />
                            <p
                                data-hero-anim
                                className="text-body leading-relaxed max-w-md sm:text-lg"
                            >
                                {variant.subtext}
                            </p>
                            <div
                                data-hero-anim
                                className="flex flex-wrap items-center gap-4 mt-8"
                            >
                                <Button variant="primary" link="/pricing">
                                    {variant.cta}
                                </Button>
                                <Link
                                    to="/how-it-works"
                                    className="text-sm font-medium text-heading hover:text-accent transition-colors duration-200 flex items-center gap-1.5 group"
                                >
                                    Learn More{" "}
                                    <span className="group-hover:translate-x-0.5 transition-transform">
                                        →
                                    </span>
                                </Link>
                            </div>
                            {/*<StatsRow />*/}
                        </div>
                        <div className="relative hidden lg:block h-115">
                            <div
                                aria-hidden
                                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                            >
                                <LucideShield
                                    size={300}
                                    strokeWidth={0.4}
                                    className="text-accent opacity-[0.06]"
                                />
                            </div>
                            {floatingCards(OFFSETS_R)}
                        </div>
                    </div>
                    <MobileCards dests={variant.destinations} />
                </div>
            </section>
        );
    }

    if (layout === 1) {
        return (
            <section ref={sectionRef} data-id={layout} className={base}>
                {dotBg}
                <div className="relative z-10 mx-auto max-w-5xl flex flex-col items-center text-center">
                    <div
                        data-hero-anim
                        className="flex flex-col items-center gap-3 mb-5"
                    >
                        <StarRating count={5} />
                        <br />
                        <span className="text-sm font-medium text-muted">
                            {variant.eyebrow}
                        </span>
                    </div>
                    <h1
                        data-hero-anim
                        className="font-serif text-heading leading-[0.88] tracking-tight max-w-4xl"
                    >
                        <span className={`block ${hl}`}>
                            {variant.headlineLines[0]}{" "}
                            <TypewriterWord hl={hl} />
                        </span>
                        <span className={`block ${hl}`}>
                            {variant.headlineLines[1]}
                        </span>
                        <span className={`block ${hl}`}>
                            {variant.headlineLines[2]}
                        </span>
                    </h1>
                    <Divider className="max-w-sm mx-auto" />
                    <p
                        data-hero-anim
                        className="text-body leading-relaxed max-w-xl sm:text-lg"
                    >
                        {variant.subtext}
                    </p>
                    <div
                        data-hero-anim
                        className="flex flex-wrap items-center justify-center gap-4 mt-8"
                    >
                        <Button variant="primary" link="/pricing">
                            {variant.cta}
                        </Button>
                        <Link
                            to="/how-it-works"
                            className="text-sm font-medium text-heading hover:text-accent transition-colors duration-200 flex items-center gap-1.5 group"
                        >
                            Learn More{" "}
                            <span className="group-hover:translate-x-0.5 transition-transform">
                                →
                            </span>
                        </Link>
                    </div>
                    <div className="hidden lg:grid grid-cols-4 gap-4 mt-12 w-full">
                        {variant.destinations.map((d) => (
                            <div
                                key={d.country}
                                data-dest-card
                                className={CARD_CLS}
                            >
                                <CardContent d={d} />
                            </div>
                        ))}
                    </div>
                    <MobileCards dests={variant.destinations} />
                    {/*/!*<StatsRow className="justify-center" />*!/*/}
                </div>
            </section>
        );
    }

    if (layout === 2) {
        return (
            <section ref={sectionRef} data-id={layout} className={base}>
                {dotBg}
                {coords("left")}
                <div className="relative z-10 mx-auto max-w-7xl">
                    <div className="grid lg:grid-cols-[0.85fr_1fr] lg:gap-12 items-center">
                        <div className="relative hidden lg:block h-115">
                            <div
                                aria-hidden
                                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                            >
                                <LucideShield
                                    size={300}
                                    strokeWidth={0.4}
                                    className="text-accent opacity-[0.06]"
                                />
                            </div>
                            {floatingCards(OFFSETS_L)}
                        </div>
                        <div className="flex flex-col items-start lg:items-end lg:text-right">
                            <div
                                data-hero-anim
                                className="flex flex-col items-end gap-3 mb-5 flex-wrap"
                            >
                                <StarRating count={5} />
                                <br />
                                <span className="text-sm font-medium text-muted">
                                    {variant.eyebrow}
                                </span>
                            </div>
                            <h1
                                data-hero-anim
                                className="font-serif text-heading leading-[0.88] tracking-tight"
                            >
                                <span className={`block ${hl}`}>
                                    {variant.headlineLines[0]}{" "}
                                    <TypewriterWord hl={hl} />
                                </span>
                                <span className={`block ${hl}`}>
                                    {variant.headlineLines[1]}
                                </span>
                                <span className={`block ${hl}`}>
                                    {variant.headlineLines[2]}
                                </span>
                            </h1>
                            <Divider />
                            <p
                                data-hero-anim
                                className="text-body leading-relaxed max-w-md sm:text-lg"
                            >
                                {variant.subtext}
                            </p>
                            <div
                                data-hero-anim
                                className="flex flex-wrap items-center gap-4 mt-8 lg:flex-row-reverse"
                            >
                                <Button variant="primary" link="/pricing">
                                    {variant.cta}
                                </Button>
                                <Button
                                    variant="secondary"
                                    link="/how-it-works"
                                    icon={<LucideArrowRight />}
                                >
                                    Learn More
                                </Button>
                            </div>
                            {/*<StatsRow className="lg:justify-end" />*/}
                        </div>
                    </div>
                    <MobileCards dests={variant.destinations} />
                </div>
            </section>
        );
    }

    if (layout === 3) {
        return (
            <section ref={sectionRef} data-id={layout} className={base}>
                {dotBg}
                {coords("right")}
                <div className="relative z-10 mx-auto max-w-7xl">
                    <div
                        data-hero-anim
                        className="flex flex-col items-start gap-3 mb-5"
                    >
                        <StarRating count={5} />
                        <br />
                        <span className="text-sm font-medium text-muted">
                            {variant.eyebrow}
                        </span>
                    </div>
                    <h1
                        data-hero-anim
                        className="font-serif text-heading leading-[0.85] tracking-tight"
                    >
                        <span className={`block ${hl}`}>
                            {variant.headlineLines[0]}{" "}
                            <TypewriterWord hl={hl} />
                        </span>
                        <span className={`block ${hl}`}>
                            {variant.headlineLines[1]}
                        </span>
                        <span className={`block ${hl}`}>
                            {variant.headlineLines[2]}
                        </span>
                    </h1>
                    <Divider className="max-w-lg" />
                    <div className="grid lg:grid-cols-[1fr_1fr] lg:gap-16 items-start">
                        <div>
                            <p
                                data-hero-anim
                                className="text-body leading-relaxed max-w-md sm:text-lg"
                            >
                                {variant.subtext}
                            </p>
                            <div
                                data-hero-anim
                                className="flex flex-wrap items-center gap-4 mt-8"
                            >
                                <Button variant="primary" link="/pricing">
                                    {variant.cta}
                                </Button>
                                <Button
                                    variant="secondary"
                                    link="/how-it-works"
                                    icon={<LucideArrowRight />}
                                >
                                    Learn More
                                </Button>
                            </div>
                        </div>
                        <div className="hidden lg:grid grid-cols-2 gap-3">
                            {variant.destinations.map((d) => (
                                <div
                                    key={d.country}
                                    data-dest-card
                                    className={CARD_CLS}
                                >
                                    <CardContent d={d} />
                                </div>
                            ))}
                        </div>
                    </div>
                    <MobileCards dests={variant.destinations} />
                    {/*/!*<StatsRow />*!/*/}
                </div>
            </section>
        );
    }

    if (layout === 4) {
        return (
            <section ref={sectionRef} data-id={layout} className={base}>
                {dotBg}
                <div className="relative z-10 mx-auto max-w-3xl flex flex-col items-center text-center">
                    <div
                        data-hero-anim
                        className="flex flex-col items-center gap-3 mb-5"
                    >
                        <StarRating count={5} />
                        <br />
                        <span className="text-sm font-medium text-muted">
                            {variant.eyebrow}
                        </span>
                    </div>
                    <h1
                        data-hero-anim
                        className="font-serif text-heading leading-[0.90] tracking-tight"
                    >
                        <span className={`block ${hl}`}>
                            {variant.headlineLines[0]}{" "}
                            <TypewriterWord hl={hl} />
                        </span>
                        <span className={`block ${hl}`}>
                            {variant.headlineLines[1]}
                        </span>
                        <span className={`block ${hl}`}>
                            {variant.headlineLines[2]}
                        </span>
                    </h1>
                    <Divider className="max-w-xs mx-auto" />
                    <p
                        data-hero-anim
                        className="text-body leading-relaxed max-w-lg sm:text-lg"
                    >
                        {variant.subtext}
                    </p>
                    <div
                        data-hero-anim
                        className="flex justify-center sm:flex-row sm:items-center sm:justify-center gap-6 mt-8 w-full"
                    >
                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4">
                            <Button variant="primary" link="/pricing">
                                {variant.cta}
                            </Button>
                            <Button
                                variant="secondary"
                                link="/how-it-works"
                                icon={<LucideArrowRight />}
                            >
                                Learn More
                            </Button>
                        </div>
                    </div>
                    <div className="flex gap-3 mt-10 overflow-x-auto pb-2 w-full lg:grid lg:grid-cols-4 lg:overflow-visible">
                        {variant.destinations.map((d) => (
                            <div
                                key={d.country}
                                data-dest-card
                                className={`${CARD_CLS} min-w-[11rem] flex-shrink-0 lg:min-w-0`}
                            >
                                <CardContent d={d} />
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    if (layout === 5) {
        return (
            <section ref={sectionRef} data-id={layout} className={base}>
                {dotBg}
                {coords("right")}
                <div className="relative z-10 mx-auto max-w-7xl">
                    <div className="grid lg:grid-cols-[1fr_auto] lg:gap-10 items-start">
                        <div className="flex flex-col items-start">
                            <div
                                data-hero-anim
                                className="flex flex-col items-start gap-3 mb-5"
                            >
                                <StarRating count={5} />
                                <br />
                                <span className="text-sm font-medium text-muted">
                                    {variant.eyebrow}
                                </span>
                            </div>
                            <h1
                                data-hero-anim
                                className="font-serif text-heading leading-[0.88] tracking-tight"
                            >
                                <span className={`block ${hl}`}>
                                    {variant.headlineLines[0]}{" "}
                                    <TypewriterWord hl={hl} />{" "}
                                    {variant.headlineLines[1]}
                                </span>
                                <span className={`block ${hl}`}>
                                    {variant.headlineLines[2]}
                                </span>
                            </h1>
                            <Divider className="max-w-lg" />
                            <p
                                data-hero-anim
                                className="text-body leading-relaxed max-w-lg sm:text-lg"
                            >
                                {variant.subtext}
                            </p>
                            <div
                                data-hero-anim
                                className="flex flex-wrap items-center gap-4 mt-8"
                            >
                                <Button variant="primary" link="/pricing">
                                    {variant.cta}
                                </Button>
                                <Button
                                    variant="secondary"
                                    link="/how-it-works"
                                    icon={<LucideArrowRight />}
                                >
                                    Learn More
                                </Button>
                            </div>
                            {/*<StatsRow />*/}
                        </div>
                        <div className="hidden lg:flex flex-col gap-3 w-52 pt-2">
                            {variant.destinations.map((d) => (
                                <div
                                    key={d.country}
                                    data-dest-card
                                    className={CARD_CLS}
                                >
                                    <CardContent d={d} />
                                </div>
                            ))}
                        </div>
                    </div>
                    <MobileCards dests={variant.destinations} />
                </div>
            </section>
        );
    }

    return (
        <section ref={sectionRef} data-id={layout} className={base}>
            {dotBg}
            <div className="relative z-10 mx-auto max-w-5xl flex flex-col items-center text-center">
                <div className="hidden lg:grid grid-cols-4 gap-4 mb-10 w-full">
                    {variant.destinations.map((d) => (
                        <div
                            key={d.country}
                            data-dest-card
                            className={CARD_CLS}
                        >
                            <CardContent d={d} />
                        </div>
                    ))}
                </div>
                <div
                    data-hero-anim
                    className="flex flex-col items-center gap-3 mb-5"
                >
                    <StarRating count={5} />
                    <br />
                    <span className="text-sm font-medium text-muted">
                        {variant.eyebrow}
                    </span>
                </div>
                <h1
                    data-hero-anim
                    className="font-serif text-heading leading-[0.88] tracking-tight max-w-4xl"
                >
                    <span className={`block ${hl}`}>
                        {variant.headlineLines[0]}{" "}
                        <TypewriterWord hl={hl} />
                    </span>
                    <span className={`block ${hl}`}>
                        {variant.headlineLines[1]}
                    </span>
                    <span className={`block ${hl}`}>
                        {variant.headlineLines[2]}
                    </span>
                </h1>
                <Divider className="max-w-sm mx-auto" />
                <p
                    data-hero-anim
                    className="text-body leading-relaxed max-w-xl sm:text-lg"
                >
                    {variant.subtext}
                </p>
                <div
                    data-hero-anim
                    className="flex flex-wrap items-center justify-center gap-4 mt-8"
                >
                    <Button variant="primary" link="/pricing">
                        {variant.cta}
                    </Button>
                    <Button
                        variant="secondary"
                        link="/how-it-works"
                        icon={<LucideArrowRight />}
                    >
                        Learn More
                    </Button>
                </div>
                <MobileCards dests={variant.destinations} />
                {/*<StatsRow className="justify-center" />*/}
            </div>
        </section>
    );
};

export default HeroSection;
