import {
    LucideBrainCircuit,
    LucideMapPin,
    LucideSyringe,
    LucideStethoscope,
    LucideClipboardCheck,
    LucideBuilding2,
    LucideCheck,
    LucideShieldCheck,
    LucideHeartPulse,
    LucidePill,
    LucidePhone,
    LucideBell,
    LucideArrowRight,
} from "lucide-react";
import StaggerGroup, { staggerItem } from "../animations/StaggerGroup";
import { motion } from "framer-motion";
import AnimateIn from "../animations/AnimateIn";
import SectionEyebrow from "../ui/SectionEyebrow";

const features = [
    {
        icon: <LucideBrainCircuit className="w-6 h-6" />,
        title: "AI Risk Assessment",
        description:
            "Our engine analyses your destination, itinerary, and health history to surface the precise risks you need to know about.",
    },
    {
        icon: <LucideMapPin className="w-6 h-6" />,
        title: "Destination-Specific Guidance",
        description:
            "Real-time health data for 120+ countries outbreaks, local hospital quality, water safety, and more.",
    },
    {
        icon: <LucideSyringe className="w-6 h-6" />,
        title: "Vaccination Awareness",
        description:
            "Clear vaccination requirements, contraindication checks, and schedules aligned to your travel dates.",
    },
    {
        icon: <LucideStethoscope className="w-6 h-6" />,
        title: "Physician-Reviewed Plans",
        description:
            "High-risk itineraries are flagged for clinical review by licensed physicians before you receive your plan.",
    },
    {
        icon: <LucideClipboardCheck className="w-6 h-6" />,
        title: "Travel Readiness",
        description:
            "Downloadable health plans with medication lists, packing guides, emergency contacts, and insurance-ready summaries.",
    },
    {
        icon: <LucideBuilding2 className="w-6 h-6" />,
        title: "Organisation-Level Planning",
        description:
            "Bulk assessments, compliance dashboards, and duty-of-care reporting for teams of any size.",
    },
];

const PhoneMockup = () => (
    <div className="relative mx-auto w-[18rem] h-[35rem] rounded-[2.5rem] shadow-2xl border-[10px] border-dark bg-dark">
        {/* Notch */}
        <div
            aria-hidden
            className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-dark rounded-b-2xl z-20"
        />

        {/* Screen */}
        <div className="absolute inset-0 rounded-[2rem] overflow-hidden bg-background-primary">
            {/* Dot grid bg */}
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-[0.12]"
                style={{
                    backgroundImage:
                        "radial-gradient(circle,#7a6a5a 1px,transparent 1px)",
                    backgroundSize: "18px 18px",
                }}
            />

            {/* Status bar */}
            <div className="relative flex items-center justify-between px-6 pt-3 pb-1 text-[10px] font-bold text-heading tabular-nums">
                <span>9:41</span>
                <div className="flex items-center gap-1">
                    <span className="block w-3 h-1.5 rounded-sm border border-heading">
                        <span className="block w-full h-full bg-heading rounded-[1px]" />
                    </span>
                </div>
            </div>

            {/* App header */}
            <div className="relative flex items-center justify-between px-5 pt-3 pb-3">
                <span className="font-serif font-bold text-heading text-lg">
                    TMAG
                </span>
                <div className="w-7 h-7 rounded-full bg-button-secondary border border-border flex items-center justify-center">
                    <LucideBell
                        width={13}
                        height={13}
                        strokeWidth={2}
                        className="text-heading"
                    />
                </div>
            </div>

            {/* Current trip card */}
            <div className="relative mx-4 rounded-2xl border border-border bg-background-secondary p-3 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-muted">
                        Current Trip
                    </span>
                    <span className="inline-flex items-center gap-1 text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20">
                        <LucideShieldCheck size={9} strokeWidth={2.5} />
                        Dr. Reviewed
                    </span>
                </div>
                <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg leading-none">
                        {"\ud83c\uddef\ud83c\uddf5"}
                    </span>
                    <span className="font-semibold text-heading text-sm">
                        Japan &middot; Tokyo
                    </span>
                </div>
                <p className="text-[10px] text-muted mb-2.5">
                    7-day Business Travel
                </p>
                <div className="flex items-center justify-between mb-1">
                    <span className="text-[9px] font-semibold uppercase tracking-wider text-muted">
                        Readiness
                    </span>
                    <span className="text-[10px] font-bold text-heading tabular-nums">
                        85%
                    </span>
                </div>
                <div className="h-1.5 rounded-full bg-border overflow-hidden">
                    <div
                        className="h-full rounded-full"
                        style={{
                            width: "85%",
                            backgroundColor: "#4f9e6a",
                        }}
                    />
                </div>
            </div>

            {/* Quick actions grid */}
            <div className="relative mx-4 mt-3 grid grid-cols-2 gap-2">
                {[
                    {
                        icon: LucideSyringe,
                        label: "Vaccines",
                        meta: "4 / 4",
                        active: true,
                    },
                    {
                        icon: LucidePill,
                        label: "Medication",
                        meta: "Ready",
                        active: true,
                    },
                    {
                        icon: LucideHeartPulse,
                        label: "Insurance",
                        meta: "Verified",
                        active: true,
                    },
                    {
                        icon: LucidePhone,
                        label: "Emergency",
                        meta: "Contacts",
                        active: false,
                    },
                ].map(({ icon: Icon, label, meta, active }) => (
                    <div
                        key={label}
                        className="rounded-xl border border-border bg-background-secondary p-2.5"
                    >
                        <div className="flex items-center justify-between mb-1.5">
                            <div
                                className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                                    active
                                        ? "bg-accent/10 border border-accent/20 text-accent"
                                        : "bg-button-secondary border border-border text-heading"
                                }`}
                            >
                                <Icon
                                    width={11}
                                    height={11}
                                    strokeWidth={2.25}
                                />
                            </div>
                            {active && (
                                <div className="w-3 h-3 rounded-full bg-accent flex items-center justify-center">
                                    <LucideCheck
                                        size={7}
                                        strokeWidth={4}
                                        className="text-white"
                                    />
                                </div>
                            )}
                        </div>
                        <p className="text-[10px] font-semibold text-heading leading-tight">
                            {label}
                        </p>
                        <p className="text-[9px] text-muted">{meta}</p>
                    </div>
                ))}
            </div>

            {/* AI insight strip */}
            <div className="relative mx-4 mt-3 rounded-xl bg-dark text-background-primary p-3">
                <div className="flex items-center gap-1.5 mb-1">
                    <LucideBrainCircuit
                        width={11}
                        height={11}
                        strokeWidth={2.25}
                        className="text-gold"
                    />
                    <span className="text-[9px] font-bold uppercase tracking-widest text-background-primary/70">
                        AI Insight
                    </span>
                </div>
                <p className="text-[10px] leading-snug">
                    Influenza activity rising in Tokyo. Recommend booster
                    72h before travel.
                </p>
            </div>

            {/* Bottom CTA */}
            <div className="absolute bottom-4 left-4 right-4">
                <div className="flex items-center justify-between rounded-2xl bg-heading text-background-primary px-4 py-3">
                    <span className="text-[11px] font-semibold">
                        View full plan
                    </span>
                    <LucideArrowRight
                        width={13}
                        height={13}
                        strokeWidth={2.25}
                    />
                </div>
            </div>
        </div>
    </div>
);

const FeaturesSection = () => {
    return (
        <section className="relative overflow-hidden px-8 lg:px-16 pt-24 pb-16 max-w-7xl mx-auto">
            {/* Decorative orbs */}
            <div
                aria-hidden
                className="pointer-events-none absolute -top-10 -left-20 w-[26rem] h-[26rem] rounded-full"
                style={{
                    background:
                        "radial-gradient(circle, rgba(42,122,106,0.12) 0%, rgba(42,122,106,0.04) 45%, transparent 70%)",
                    filter: "blur(50px)",
                }}
            />
            <div
                aria-hidden
                className="pointer-events-none absolute top-32 -right-20 w-[24rem] h-[24rem] rounded-full"
                style={{
                    background:
                        "radial-gradient(circle, rgba(196,149,58,0.16) 0%, rgba(232,120,80,0.05) 45%, transparent 70%)",
                    filter: "blur(50px)",
                }}
            />

            {/* Header + device mockup */}
            <div className="relative grid lg:grid-cols-[1fr_auto] lg:gap-16 items-center mb-16">
                <AnimateIn type="fadeLeft">
                    <SectionEyebrow className="mb-6">Key features</SectionEyebrow>
                    <h2 className="text-4xl md:text-5xl lg:text-6xl text-heading leading-[1.1] font-serif">
                        Everything you need to{" "}
                        <span className="italic">travel healthy.</span>
                    </h2>
                    <p className="text-body leading-relaxed mt-6 max-w-md">
                        From AI risk assessment to clinical review, every
                        feature is built to give travellers and organisations a
                        single, trustworthy source of travel health truth.
                    </p>
                    <div className="mt-6 flex flex-wrap gap-2">
                        {[
                            "Real-time risk data",
                            "Physician oversight",
                            "Compliance-ready",
                        ].map((label) => (
                            <span
                                key={label}
                                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-accent/10 text-accent border border-accent/20"
                            >
                                <LucideCheck
                                    width={12}
                                    height={12}
                                    strokeWidth={2.5}
                                />
                                {label}
                            </span>
                        ))}
                    </div>
                </AnimateIn>

                <AnimateIn type="fadeRight" delay={0.15}>
                    <div className="relative mt-12 lg:mt-0">
                        {/* Floating "Plan ready" notification chip */}
                        <div className="hidden md:flex absolute -left-4 lg:-left-12 top-10 z-20 items-center gap-2 rounded-xl border border-border bg-background-secondary shadow-lg px-3 py-2 rotate-[-3deg]">
                            <div className="w-7 h-7 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center">
                                <LucideShieldCheck
                                    width={13}
                                    height={13}
                                    strokeWidth={2.25}
                                    className="text-accent"
                                />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-muted">
                                    Plan ready
                                </p>
                                <p className="text-[11px] font-semibold text-heading">
                                    100% reviewed
                                </p>
                            </div>
                        </div>

                        {/* Floating outbreak alert chip */}
                        <div className="hidden md:flex absolute -right-4 lg:-right-10 bottom-16 z-20 items-center gap-2 rounded-xl border border-border bg-background-secondary shadow-lg px-3 py-2 rotate-[3deg]">
                            <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-gold/15 border border-gold/30">
                                <LucideBell
                                    width={13}
                                    height={13}
                                    strokeWidth={2.25}
                                    className="text-gold"
                                />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-muted">
                                    Live alert
                                </p>
                                <p className="text-[11px] font-semibold text-heading">
                                    Tokyo flu spike
                                </p>
                            </div>
                        </div>

                        <PhoneMockup />
                    </div>
                </AnimateIn>
            </div>

            {/* Feature cards grid */}
            <StaggerGroup
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                stagger={0.1}
            >
                {features.map((f) => (
                    <motion.div
                        variants={staggerItem}
                        key={f.title}
                        className="bg-background-secondary rounded-2xl p-8 border border-border shadow-sm flex flex-col gap-5 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200"
                    >
                        <div className="w-12 h-12 rounded-xl bg-heading text-background-primary flex items-center justify-center">
                            {f.icon}
                        </div>
                        <h3 className="text-lg font-semibold text-heading">
                            {f.title}
                        </h3>
                        <p className="text-sm text-body leading-relaxed">
                            {f.description}
                        </p>
                    </motion.div>
                ))}
            </StaggerGroup>
        </section>
    );
};

export default FeaturesSection;
