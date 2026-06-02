import {
    LucideArrowRight,
    LucideShieldCheck,
    LucideStethoscope,
    LucideGlobe,
} from "lucide-react";
import Button from "../ui/Button";
import AnimateIn from "../animations/AnimateIn";

const DARK_GRADIENT =
    "linear-gradient(135deg, #2a7a6a 0%, #1a6a7a 30%, #187080 55%, #1a6878 80%, #246858 100%)";

/* Globe + flight-path motif — a quiet echo of the hero, in white & gold. */
const GlobeMotif = () => (
    <svg
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[44rem] w-[44rem] max-w-none -translate-x-1/2 -translate-y-1/2"
        viewBox="0 0 600 600"
        fill="none"
    >
        <circle
            cx="300"
            cy="300"
            r="230"
            stroke="#ffffff"
            strokeOpacity="0.16"
            strokeWidth="1"
        />
        {[200, 130, 60].map((ry, i) => (
            <ellipse
                key={`lat-${i}`}
                cx="300"
                cy="300"
                rx="230"
                ry={ry}
                stroke="#ffffff"
                strokeOpacity="0.1"
                strokeWidth="1"
            />
        ))}
        {[200, 130, 60].map((rx, i) => (
            <ellipse
                key={`lon-${i}`}
                cx="300"
                cy="300"
                rx={rx}
                ry="230"
                stroke="#ffffff"
                strokeOpacity="0.1"
                strokeWidth="1"
            />
        ))}
        <path
            d="M 110 300 Q 300 90 490 320"
            stroke="#f1cd8a"
            strokeOpacity="0.6"
            strokeWidth="1.5"
            strokeDasharray="4 6"
            fill="none"
        />
        <circle cx="110" cy="300" r="5" fill="#f1cd8a" />
        <circle
            cx="490"
            cy="320"
            r="9"
            fill="#f1cd8a"
            fillOpacity="0.25"
            className="animate-pulse"
        />
        <circle cx="490" cy="320" r="4.5" fill="#f1cd8a" />
    </svg>
);

const FinalCTASection = () => {
    return (
        <section className="px-6 pb-24 pt-16 sm:px-8 lg:px-16">
            <div
                className="relative overflow-hidden mx-auto rounded-2xl max-w-7xl px-6 py-20 text-center lg:py-28"
                style={{ background: DARK_GRADIENT }}
            >
                <GlobeMotif />

                {/* Dot grid */}
                <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 opacity-[0.08]"
                    style={{
                        backgroundImage:
                            "radial-gradient(circle,#ffffff 1px,transparent 1px)",
                        backgroundSize: "24px 24px",
                    }}
                />

                {/* Warm glow */}
                <div
                    aria-hidden
                    className="pointer-events-none absolute left-1/2 top-[-30%] h-80 w-80 -translate-x-1/2 rounded-full"
                    style={{
                        background:
                            "radial-gradient(circle, rgba(240,160,96,0.55) 0%, rgba(232,120,80,0.18) 40%, transparent 70%)",
                        filter: "blur(50px)",
                    }}
                />

                <AnimateIn
                    type="scaleUp"
                    className="relative z-10 mx-auto max-w-2xl"
                >
                    <div className="mb-5 flex items-center justify-center gap-2">
                        <span className="relative flex h-2.5 w-2.5">
                            <span
                                className="absolute inset-0 animate-ping rounded-full"
                                style={{
                                    backgroundColor: "#f1cd8a",
                                    opacity: 0.6,
                                }}
                            />
                            <span
                                className="relative inline-flex h-2.5 w-2.5 rounded-full"
                                style={{ backgroundColor: "#f1cd8a" }}
                            />
                        </span>
                        <span className="text-xs font-semibold uppercase tracking-wider text-white/80">
                            Live travel intelligence
                        </span>
                    </div>

                    <h2 className="font-serif text-4xl leading-[1.05] tracking-tight text-white md:text-5xl lg:text-6xl">
                        Travel smart.{" "}
                        <span className="italic text-[#f1cd8a]">
                            Return&nbsp;safe.
                        </span>
                    </h2>
                    <p className="mx-auto mt-5 max-w-md text-sm leading-relaxed text-white/75 sm:text-base">
                        Get your personalised travel health plan in under two
                        minutes. Free to start, no credit card required.
                    </p>

                    <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                        <Button
                            variant="primary"
                            className="bg-white !text-dark hover:bg-white/90"
                            link="/pricing"
                        >
                            Get started
                        </Button>
                        <Button
                            variant="secondary"
                            icon={<LucideArrowRight />}
                            className="border-none !bg-white/15 !text-white hover:!bg-white/25"
                            link="/pricing?tab=company"
                        >
                            For organisations
                        </Button>
                    </div>

                    <div className="mx-auto mt-10 flex max-w-lg flex-wrap items-center justify-center gap-x-6 gap-y-3 border-t border-white/15 pt-6 text-xs text-white/70">
                        <span className="inline-flex items-center gap-2">
                            <LucideShieldCheck
                                width={14}
                                height={14}
                                strokeWidth={2}
                            />
                            WHO + CDC aligned
                        </span>
                        <span aria-hidden className="hidden text-white/30 sm:inline">
                            &middot;
                        </span>
                        <span className="inline-flex items-center gap-2">
                            <LucideStethoscope
                                width={14}
                                height={14}
                                strokeWidth={2}
                            />
                            Physician-reviewed
                        </span>
                        <span aria-hidden className="hidden text-white/30 sm:inline">
                            &middot;
                        </span>
                        <span className="inline-flex items-center gap-2">
                            <LucideGlobe width={14} height={14} strokeWidth={2} />
                            190+ countries
                        </span>
                    </div>
                </AnimateIn>
            </div>
        </section>
    );
};

export default FinalCTASection;
