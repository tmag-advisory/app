import {
    LucideArrowRight,
    LucideShield,
    LucideCheck,
    LucideStethoscope,
    LucideShieldCheck,
    LucideGlobe,
} from "lucide-react";
import { useRef, useLayoutEffect, useState, useEffect } from "react";
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

const DESTINATIONS: SampleTripData[] = [
    {
        country: "Japan",
        flag: "\ud83c\uddef\ud83c\uddf5",
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
        flag: "\ud83c\uddf0\ud83c\uddea",
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
        flag: "\ud83c\udde7\ud83c\uddf7",
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
        flag: "\ud83c\uddee\ud83c\uddf3",
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
];

const CARD_CLS =
    "rounded-2xl border border-border bg-background-secondary shadow-sm p-4 cursor-default select-none";

const OFFSETS_R: {
    top: string;
    left?: string;
    right?: string;
    rotate: number;
}[] = [
        { top: "2%", left: "0%", rotate: -2.5 },
        { top: "5%", right: "0%", rotate: 2 },
        { top: "52%", left: "4%", rotate: 1.5 },
        { top: "56%", right: "0%", rotate: -1.5 },
    ];

const FLOAT = [
    { y: 10, dur: 3.2 },
    { y: 8, dur: 3.8 },
    { y: 11, dur: 2.9 },
    { y: 9, dur: 4.0 },
];

const HEADLINE_SIZE =
    "text-5xl md:text-6xl lg:text-7xl xl:text-[5.25rem]";

const riskFor = (
    completeness: number,
): { label: string; color: string } => {
    if (completeness >= 70) return { label: "Low", color: "#4f9e6a" };
    if (completeness >= 40) return { label: "Medium", color: "#d4a04a" };
    return { label: "High", color: "#d46a4a" };
};

const ProgressChecklist = ({ steps }: { steps: ProgressStep[] }) => (
    <div className="mt-2 space-y-1">
        {steps.map((step, i) => (
            <div key={i} className="flex items-center gap-1.5">
                <div
                    className={`w-3 h-3 rounded-full flex items-center justify-center flex-shrink-0 ${step.done ? "bg-accent" : "border border-border"
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
                    className={`text-[10px] leading-tight ${step.done ? "text-heading font-medium" : "text-muted"
                        }`}
                >
                    {step.label}
                </span>
            </div>
        ))}
    </div>
);

const MicroBadges = ({ completeness }: { completeness: number }) => {
    const risk = riskFor(completeness);
    return (
        <div className="flex items-center gap-1.5 mb-2 flex-wrap">
            <span className="inline-flex items-center gap-1 text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-background-primary border border-border text-heading">
                <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: risk.color }}
                />
                AI Risk: {risk.label}
            </span>
            <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20">
                <LucideCheck size={9} strokeWidth={3} />
                Dr. Reviewed
            </span>
        </div>
    );
};

const CardContent = ({ d }: { d: SampleTripData }) => (
    <>
        <div className="flex items-center justify-between mb-2">
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
        <MicroBadges completeness={d.completeness} />
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
        {dests.slice(0, 2).map((d) => {
            const risk = riskFor(d.completeness);
            return (
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
                    <div className="flex items-center gap-1 mb-1.5 flex-wrap">
                        <span className="inline-flex items-center gap-1 text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-background-primary border border-border text-heading">
                            <span
                                className="w-1.5 h-1.5 rounded-full"
                                style={{ backgroundColor: risk.color }}
                            />
                            {risk.label}
                        </span>
                        <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20">
                            <LucideCheck size={9} strokeWidth={3} />
                            Dr.
                        </span>
                    </div>
                    <p className="text-xs text-muted leading-snug">
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
            );
        })}
    </div>
);

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

const TYPING_WORDS = ["Far.", "Ready.", "Smart.", "Prepared.", "Informed."];

const TypewriterWord = ({ hl }: { hl: string }) => {
    const [text, setText] = useState("");
    const wordIdxRef = useRef(0);
    const phaseRef = useRef<"typing" | "pause" | "deleting">("typing");
    const textStateRef = useRef(text);
    const cursorRef = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        textStateRef.current = text;
    });

    useEffect(() => {
        let mounted = true;
        let timeoutId: ReturnType<typeof setTimeout>;

        const tick = () => {
            if (!mounted) return;
            const word = TYPING_WORDS[wordIdxRef.current];
            const phase = phaseRef.current;
            const currentText = textStateRef.current;

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
                    wordIdxRef.current =
                        (wordIdxRef.current + 1) % TYPING_WORDS.length;
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

const GlobeBackdrop = () => (
    <svg
        aria-hidden
        className="pointer-events-none absolute inset-0 m-auto w-[34rem] h-[34rem] max-w-full max-h-full"
        viewBox="0 0 600 600"
        fill="none"
    >
        <defs>
            <radialGradient id="globe-glow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#2a7a6a" stopOpacity="0.10" />
                <stop offset="60%" stopColor="#2a7a6a" stopOpacity="0.02" />
                <stop offset="100%" stopColor="#2a7a6a" stopOpacity="0" />
            </radialGradient>
        </defs>
        <circle cx="300" cy="300" r="270" fill="url(#globe-glow)" />
        <circle
            cx="300"
            cy="300"
            r="240"
            stroke="#2a7a6a"
            strokeOpacity="0.22"
            strokeWidth="1"
        />
        {[200, 150, 100, 50, 20].map((ry, i) => (
            <ellipse
                key={`lat-${i}`}
                cx="300"
                cy="300"
                rx="240"
                ry={ry}
                stroke="#2a7a6a"
                strokeOpacity="0.14"
                strokeWidth="1"
            />
        ))}
        {[200, 150, 100, 50, 20].map((rx, i) => (
            <ellipse
                key={`lon-${i}`}
                cx="300"
                cy="300"
                rx={rx}
                ry="240"
                stroke="#2a7a6a"
                strokeOpacity="0.14"
                strokeWidth="1"
            />
        ))}
        <path
            d="M 120 280 Q 300 80 480 320"
            stroke="#c4953a"
            strokeOpacity="0.55"
            strokeWidth="1.5"
            strokeDasharray="4 5"
            fill="none"
        />
        <path
            d="M 180 420 Q 320 540 470 380"
            stroke="#2a7a6a"
            strokeOpacity="0.55"
            strokeWidth="1.5"
            strokeDasharray="4 5"
            fill="none"
        />
        <path
            d="M 100 360 Q 240 200 420 260"
            stroke="#2a7a6a"
            strokeOpacity="0.35"
            strokeWidth="1"
            strokeDasharray="2 6"
            fill="none"
        />
        <circle
            cx="120"
            cy="280"
            r="9"
            fill="#c4953a"
            fillOpacity="0.2"
            className="animate-pulse"
        />
        <circle cx="120" cy="280" r="4" fill="#c4953a" />
        <circle
            cx="480"
            cy="320"
            r="9"
            fill="#c4953a"
            fillOpacity="0.2"
            className="animate-pulse"
        />
        <circle cx="480" cy="320" r="4" fill="#c4953a" />
        <circle
            cx="180"
            cy="420"
            r="7"
            fill="#2a7a6a"
            fillOpacity="0.25"
            className="animate-pulse"
        />
        <circle cx="180" cy="420" r="3.5" fill="#2a7a6a" />
        <circle cx="470" cy="380" r="3.5" fill="#2a7a6a" />
    </svg>
);

const HeroSection = () => {
    const sectionRef = useRef<HTMLElement>(null);
    const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from("[data-hero-anim]", {
                y: 36,
                opacity: 0.8,
                duration: 0.8,
                ease: "power3.out",
                stagger: 0.1,
            });

            gsap.from("[data-dest-card]", {
                x: 60,
                opacity: 0.8,
                duration: 0.75,
                ease: "back.out(1.3)",
                stagger: 0.14,
                delay: 0.35,
            });

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
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section
            ref={sectionRef}
            className="relative overflow-hidden px-6 pt-14 pb-16 lg:px-14 lg:pt-20 lg:pb-20"
        >
            {/* Dot grid background */}
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-[0.18]"
                style={{
                    backgroundImage:
                        "radial-gradient(circle,#7a6a5a 1px,transparent 1px)",
                    backgroundSize: "26px 26px",
                }}
            />

            {/* Top mono tag */}
            <div
                aria-hidden
                className="pointer-events-none absolute top-6 right-8 hidden lg:block select-none text-right"
            >
                <p className="font-mono text-[10px] tracking-widest text-brand-muted opacity-50">
                    TMAG — GLOBAL HEALTH ADVISORY
                </p>
            </div>

            <div className="relative z-10 mx-auto max-w-7xl">
                <div className="grid lg:grid-cols-[1fr_0.9fr] lg:gap-12 items-center">
                    {/* Left: copy */}
                    <div className="flex flex-col items-start">
                        <div
                            data-hero-anim
                            className="flex flex-col items-start gap-3 mb-5"
                        >
                            <span className="inline-flex items-center gap-2 text-sm text-muted bg-button-secondary font-semibold rounded-xl px-4 py-1.5">
                                <span className="relative flex w-2 h-2">
                                    <span className="absolute inset-0 rounded-full bg-accent opacity-60 animate-ping" />
                                    <span className="relative inline-flex w-2 h-2 rounded-full bg-accent" />
                                </span>
                                AI-Powered &middot; Physician-Validated
                            </span>
                        </div>

                        <h1
                            data-hero-anim
                            className="font-serif text-heading leading-[0.88] tracking-tight"
                        >
                            <span className={`block ${HEADLINE_SIZE}`}>
                                Travel <TypewriterWord hl={HEADLINE_SIZE} />
                            </span>
                            <span className={`block ${HEADLINE_SIZE}`}>
                                Return Safe.
                            </span>
                        </h1>

                        <Divider />

                        <p
                            data-hero-anim
                            className="text-body leading-relaxed max-w-md sm:text-lg"
                        >
                            Prepare for international travel with personalized physician-reviewed health guidance.
                        </p>

                        <div
                            data-hero-anim
                            className="flex flex-wrap items-center gap-4 mt-8"
                        >
                            <Button variant="primary" link="/pricing">
                                Get Started
                            </Button>
                            <Button
                                variant="secondary"
                                link="/pricing?tab=company"
                                icon={<LucideArrowRight />}
                            >
                                For Organisations
                            </Button>
                        </div>
                    </div>

                    {/* Right: globe + floating cards */}
                    <div className="relative hidden lg:block h-[34rem]">
                        <GlobeBackdrop />
                        {DESTINATIONS.map((d, i) => {
                            const pos = OFFSETS_R[i];
                            return (
                                <div
                                    key={d.country}
                                    data-dest-card
                                    ref={(el: HTMLDivElement | null) => {
                                        cardsRef.current[i] = el;
                                    }}
                                    className={`absolute w-56 ${CARD_CLS}`}
                                    style={{
                                        top: pos.top,
                                        ...(pos.left != null && {
                                            left: pos.left,
                                        }),
                                        ...(pos.right != null && {
                                            right: pos.right,
                                        }),
                                        transform: `rotate(${pos.rotate}deg)`,
                                    }}
                                >
                                    <CardContent d={d} />
                                </div>
                            );
                        })}
                    </div>
                </div>

                <MobileCards dests={DESTINATIONS} />

                {/* Global reach strip */}
                <div
                    data-hero-anim
                    className="mt-12 lg:mt-16 pt-6 border-t border-border/60 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs text-muted"
                >
                    <span className="inline-flex items-center gap-2">
                        <LucideGlobe
                            width={14}
                            height={14}
                            className="text-accent"
                        />
                        Travel Advisories for 190+ countries
                    </span>
                    <span
                        aria-hidden
                        className="hidden sm:inline text-border"
                    >
                        &middot;
                    </span>
                    <span className="inline-flex items-center gap-2">
                        <LucideShieldCheck
                            width={14}
                            height={14}
                            className="text-accent"
                        />
                        WHO + CDC aligned
                    </span>
                    <span
                        aria-hidden
                        className="hidden sm:inline text-border"
                    >
                        &middot;
                    </span>
                    <span className="inline-flex items-center gap-2">
                        <LucideStethoscope
                            width={14}
                            height={14}
                            className="text-accent"
                        />
                        Reviewed by licensed physicians
                    </span>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;
