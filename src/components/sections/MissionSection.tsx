import {
    LucideBrainCircuit,
    LucideStethoscope,
    LucideMapPin,
    LucideShieldCheck,
    LucideUserCheck,
    LucideHeartPulse,
    LucideCheck,
    LucideFileText,
    LucidePlaneTakeoff,
} from "lucide-react";
import type { ComponentType, SVGProps } from "react";
import AnimateIn from "../animations/AnimateIn";
import SectionEyebrow from "../ui/SectionEyebrow";

interface Chip {
    icon: ComponentType<SVGProps<SVGSVGElement> & { size?: number | string }>;
    label: string;
}


const MissionSection = () => {
    return (
        <section className="relative overflow-hidden px-8 lg:px-16 pt-24 pb-20 max-w-7xl mx-auto">
            {/* Soft accent orb */}
            <div
                aria-hidden
                className="pointer-events-none absolute -top-24 -left-16 w-104 h-104 rounded-full"
                style={{
                    background:
                        "radial-gradient(circle, rgba(42,122,106,0.14) 0%, rgba(42,122,106,0.04) 45%, transparent 70%)",
                    filter: "blur(50px)",
                }}
            />

            {/* Hero split: headline + image */}
            <div className="relative grid lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 items-center">
                <AnimateIn type="fadeLeft">
                    <SectionEyebrow className="mb-6">Our mission</SectionEyebrow>
                    <h2 className="font-serif text-heading leading-[0.95] tracking-tight text-5xl md:text-6xl lg:text-7xl xl:text-[5.5rem]">
                        No one plans to get{" "}
                        <span className="italic text-accent">sick</span> abroad.
                    </h2>
                    <p className="text-body leading-relaxed max-w-xl mt-8 sm:text-lg">
                        Yet travellers leave unprepared and organisations send
                        employees overseas without a structured travel health
                        system.
                    </p>
                    <p className="text-body leading-relaxed max-w-xl mt-4 sm:text-lg">
                        Travel Medicine Advisory Global (TMAG) bridges the gap
                        between where travellers are going and what their health
                        requires to get there safely.
                    </p>
                </AnimateIn>

                <AnimateIn type="fadeRight" delay={0.15}>
                    <div className="relative mt-12 lg:mt-0">
                        {/* Warm glow behind image */}
                        <div
                            aria-hidden
                            className="pointer-events-none absolute -inset-6 rounded-4xl"
                            style={{
                                background:
                                    "radial-gradient(circle at 70% 30%, rgba(196,149,58,0.22) 0%, rgba(232,120,80,0.08) 45%, transparent 70%)",
                                filter: "blur(40px)",
                            }}
                        />

                        {/* Image card */}
                        <div className="relative rounded-[2rem] overflow-hidden border border-border bg-button-secondary object-right aspect-[4/5] sm:aspect-[5/4] lg:aspect-[4/5]">
                            <img
                                src="/images/traveller.jpg"
                                alt="Traveller preparing for an international journey"
                                loading="lazy"
                                className="absolute inset-0 w-full h-full object-cover object-top"
                                style={{
                                    filter:
                                        "sepia(0.18) saturate(0.92) contrast(0.97)",
                                }}
                            />
                            {/* Warm tint overlay */}
                            <div
                                aria-hidden
                                className="absolute inset-0"
                                style={{
                                    background:
                                        "linear-gradient(160deg, rgba(246,240,233,0.12) 0%, rgba(246,240,233,0) 35%, rgba(42,30,20,0.18) 100%)",
                                }}
                            />

                            {/* Decorative dot grid */}
                            <div
                                aria-hidden
                                className="pointer-events-none absolute inset-0 opacity-[0.18]"
                                style={{
                                    backgroundImage:
                                        "radial-gradient(circle,#3d2c1e 1px,transparent 1px)",
                                    backgroundSize: "20px 20px",
                                    maskImage:
                                        "linear-gradient(135deg, transparent 0%, transparent 55%, #000 100%)",
                                    WebkitMaskImage:
                                        "linear-gradient(135deg, transparent 0%, transparent 55%, #000 100%)",
                                }}
                            />

                            {/* Bottom corner accent */}
                            <div className="absolute bottom-5 right-5 inline-flex items-center gap-1.5 rounded-full bg-accent text-white px-3 py-1.5 shadow-sm">
                                <LucideShieldCheck
                                    width={13}
                                    height={13}
                                    strokeWidth={2.5}
                                />
                                <span className="text-[11px] font-semibold uppercase tracking-wider">
                                    Clinically grounded
                                </span>
                            </div>
                        </div>

                        {/* Floating plan-preview mockup */}
                        <div className="absolute -bottom-8 -left-4 sm:-left-8 lg:-left-10 w-56 rounded-2xl border border-border bg-background-secondary shadow-xl p-4 rotate-[-4deg] z-20 hidden sm:block">
                            <div className="flex items-center justify-between mb-3">
                                <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-muted">
                                    <LucideFileText
                                        width={10}
                                        height={10}
                                        strokeWidth={2.25}
                                    />
                                    Health Plan
                                </span>
                                <LucideShieldCheck
                                    width={13}
                                    height={13}
                                    strokeWidth={2.25}
                                    className="text-accent"
                                />
                            </div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-lg leading-none">
                                    {"\ud83c\uddf9\ud83c\udded"}
                                </span>
                                <span className="font-semibold text-heading text-sm truncate">
                                    Thailand
                                </span>
                            </div>
                            <p className="text-[10px] text-muted leading-snug mb-3">
                                10-day Bangkok + Phuket
                            </p>
                            <div className="space-y-1.5">
                                {[
                                    "Yellow Fever",
                                    "Malaria Rx",
                                    "Dengue Guide",
                                    "Travel Insurance",
                                ].map((label) => (
                                    <div
                                        key={label}
                                        className="flex items-center gap-2"
                                    >
                                        <div className="w-3 h-3 rounded-full bg-accent flex items-center justify-center shrink-0">
                                            <LucideCheck
                                                size={7}
                                                strokeWidth={4}
                                                className="text-white"
                                            />
                                        </div>
                                        <span className="text-[10px] text-heading font-medium">
                                            {label}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-3 pt-2 border-t border-border-light flex items-center justify-between">
                                <span className="text-[9px] text-muted font-medium">
                                    Plan #TMAG-4231
                                </span>
                                <span className="text-[9px] font-bold text-accent">
                                    100%
                                </span>
                            </div>
                        </div>

                        {/* Floating boarding pass mini-strip */}
                        <div className="absolute -top-6 -right-4 lg:-right-8 hidden md:inline-flex items-center gap-2 rounded-xl border border-border bg-background-primary shadow-md px-3 py-2 rotate-[4deg] z-20">
                            <div className="w-7 h-7 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center">
                                <LucidePlaneTakeoff
                                    width={14}
                                    height={14}
                                    strokeWidth={2}
                                    className="text-accent"
                                />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[9px] uppercase tracking-wider text-muted font-semibold">
                                    Departure
                                </span>
                                <span className="text-[11px] font-semibold text-heading">
                                    Lagos &rarr; Bangkok
                                </span>
                            </div>
                        </div>
                    </div>
                </AnimateIn>
            </div>

            {/* Reality callout */}
            <AnimateIn delay={0.1}>
                <div className="relative mt-16 lg:mt-24 rounded-3xl border border-border bg-background-secondary px-8 py-10 lg:px-14 lg:py-12 overflow-hidden">
                    <div
                        aria-hidden
                        className="pointer-events-none absolute -top-16 -right-12 w-80 h-80 rounded-full"
                        style={{
                            background:
                                "radial-gradient(circle, rgba(196,149,58,0.18) 0%, rgba(232,120,80,0.06) 45%, transparent 70%)",
                            filter: "blur(40px)",
                        }}
                    />
                    <div className="relative grid lg:grid-cols-[auto_1fr] lg:gap-10 items-start">
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-accent bg-accent/10 border border-accent/20 rounded-full px-3 py-1 self-start shrink-0">
                            The reality
                        </span>
                        <p className="font-serif text-heading leading-snug text-2xl md:text-3xl lg:text-[2rem] mt-4 lg:mt-0">
                            Millions cross borders each year without the clinical
                            guidance their journey demands missing
                            vaccinations, carrying unmanaged conditions into
                            high-risk environments, and returning with preventable
                            illness.{" "}
                            <span className="italic text-accent">
                                TMAG exists to change that.
                            </span>
                        </p>
                    </div>
                </div>
            </AnimateIn>
        </section>
    );
};

export default MissionSection;
