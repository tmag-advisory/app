import {
    LucideUser,
    LucideBuilding2,
    LucideUsers,
    LucideCheck,
    LucideCompass,
    LucideArrowRight,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import Button from "../ui/Button";
import AnimateIn from "../animations/AnimateIn";
import StaggerGroup, { staggerItem } from "../animations/StaggerGroup";
import SectionEyebrow from "../ui/SectionEyebrow";
import { cn } from "../../lib/utils";

const DARK_GRADIENT =
    "linear-gradient(135deg, #2a7a6a 0%, #1a6a7a 30%, #187080 55%, #1a6878 80%, #246858 100%)";

interface Audience {
    index: string;
    Icon: LucideIcon;
    title: string;
    scenario?: string;
    description: string;
    features: string[];
    link: string;
    cta: string;
    variant: "light" | "dark";
}

const audiences: Audience[] = [
    {
        index: "01",
        Icon: LucideUser,
        title: "Solo travellers",
        description:
            "Backpackers, digital nomads, and holidaymakers get a plan built around their exact trip and health profile.",
        features: [
            "Personalised vaccine checklist",
            "Risk alerts for your exact itinerary",
            "PDF plan you can share with any clinic",
        ],
        link: "/pricing",
        cta: "Get started",
        variant: "light",
    },
    {
        index: "02",
        Icon: LucideBuilding2,
        title: "Organizations",
        description:
            "Protect your people at scale, meet duty-of-care obligations, and keep every traveller informed.",
        features: [
            "Bulk member travel assessments",
            "Compliance-ready duty-of-care reports",
            "Dashboard for HR & Member",
        ],
        link: "/pricing?tab=company",
        cta: "Explore team plans",
        variant: "dark",
    },
    {
        index: "03",
        Icon: LucideUsers,
        title: "Families",
        description:
            "Multi-generational trips made simple, with guidance tailored to children, seniors, and everyone between.",
        features: [
            "Age-specific vaccination guidance",
            "Paediatric & geriatric risk flags",
            "One shared family health dashboard",
        ],
        link: "/pricing",
        cta: "Get started",
        variant: "light",
    },
];

const AudienceSection = () => {
    return (
        <div className="bg-background-secondary">
            <section className="relative overflow-hidden px-6 pt-24 pb-24 sm:px-8 lg:px-16">
                {/* Soft accent orb */}
                <div
                    aria-hidden
                    className="pointer-events-none absolute -right-20 -top-10 h-96 w-96 rounded-full"
                    style={{
                        background:
                            "radial-gradient(circle, rgba(42,122,106,0.10) 0%, rgba(42,122,106,0.03) 45%, transparent 70%)",
                        filter: "blur(50px)",
                    }}
                />

                <div className="relative z-10 mx-auto max-w-7xl">
                    <AnimateIn className="mx-auto mb-14 max-w-2xl text-center lg:mb-16">
                        <SectionEyebrow className="mb-6">
                            Who it&apos;s for
                        </SectionEyebrow>
                        <h2 className="font-serif text-4xl leading-[1.08] tracking-tight text-heading md:text-5xl lg:text-6xl">
                            One platform for everyone who{" "}
                            <span className="italic text-accent">
                                crosses a border.
                            </span>
                        </h2>
                    </AnimateIn>

                    <StaggerGroup
                        className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
                        stagger={0.1}
                    >
                        {audiences.map((a) => {
                            const isDark = a.variant === "dark";
                            return (
                                <motion.div
                                    variants={staggerItem}
                                    whileHover={{
                                        y: -4,
                                        transition: {
                                            duration: 0.25,
                                            ease: "easeOut",
                                        },
                                    }}
                                    key={a.title}
                                    className={cn(
                                        "group relative flex flex-col overflow-hidden rounded-3xl p-8 lg:p-9",
                                        isDark
                                            ? "text-white shadow-xl shadow-dark/10 transition-shadow duration-300 hover:shadow-2xl"
                                            : "border border-border bg-background-primary transition-[border-color,box-shadow] duration-300 hover:border-accent/40 hover:shadow-xl hover:shadow-accent/5",
                                    )}
                                    style={
                                        isDark
                                            ? { background: DARK_GRADIENT }
                                            : undefined
                                    }
                                >
                                    {isDark && (
                                        <>
                                            <div
                                                aria-hidden
                                                className="pointer-events-none absolute inset-0 opacity-[0.12]"
                                                style={{
                                                    backgroundImage:
                                                        "radial-gradient(circle,#ffffff 1px,transparent 1px)",
                                                    backgroundSize: "22px 22px",
                                                }}
                                            />
                                            <div
                                                aria-hidden
                                                className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full"
                                                style={{
                                                    background:
                                                        "radial-gradient(circle, rgba(196,149,58,0.35) 0%, rgba(232,120,80,0.10) 45%, transparent 70%)",
                                                    filter: "blur(36px)",
                                                }}
                                            />
                                        </>
                                    )}

                                    <div className="relative z-10 flex flex-1 flex-col">
                                        <div className="mb-6 flex items-center justify-between">
                                            <div
                                                className={cn(
                                                    "flex h-12 w-12 items-center justify-center rounded-xl transition-colors duration-300",
                                                    isDark
                                                        ? "bg-white/15 text-white"
                                                        : "bg-button-secondary text-heading group-hover:bg-accent/10 group-hover:text-accent",
                                                )}
                                            >
                                                <a.Icon
                                                    className="h-6 w-6"
                                                    strokeWidth={1.75}
                                                    aria-hidden
                                                />
                                            </div>
                                            <span
                                                className={cn(
                                                    "font-mono text-sm font-semibold tracking-[0.2em]",
                                                    isDark
                                                        ? "text-white/40"
                                                        : "text-brand-muted",
                                                )}
                                            >
                                                {a.index}
                                            </span>
                                        </div>

                                        <h3
                                            className={cn(
                                                "font-serif text-2xl",
                                                isDark
                                                    ? "text-white"
                                                    : "text-heading",
                                            )}
                                        >
                                            {a.title}
                                        </h3>
                                        <p
                                            className={cn(
                                                "mt-4 text-sm leading-relaxed",
                                                isDark
                                                    ? "text-white/75"
                                                    : "text-body",
                                            )}
                                        >
                                            {a.description}
                                        </p>

                                        <div
                                            aria-hidden
                                            className={cn(
                                                "mt-6 h-px w-full",
                                                isDark
                                                    ? "bg-white/15"
                                                    : "bg-border-light",
                                            )}
                                        />

                                        <ul className="mt-6 space-y-3">
                                            {a.features.map((f) => (
                                                <li
                                                    key={f}
                                                    className={cn(
                                                        "flex items-start gap-3 text-sm",
                                                        isDark
                                                            ? "text-white/90"
                                                            : "text-heading",
                                                    )}
                                                >
                                                    <span
                                                        className={cn(
                                                            "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full",
                                                            isDark
                                                                ? "bg-white/20 text-white"
                                                                : "bg-accent/10 text-accent",
                                                        )}
                                                    >
                                                        <LucideCheck
                                                            className="h-2.5 w-2.5"
                                                            strokeWidth={3}
                                                            aria-hidden
                                                        />
                                                    </span>
                                                    {f}
                                                </li>
                                            ))}
                                        </ul>

                                        <div className="mt-auto pt-8">
                                            <Button
                                                variant="primary"
                                                link={a.link}
                                                className={cn(
                                                    "self-start",
                                                    isDark &&
                                                    "bg-white !text-dark hover:bg-white/90",
                                                )}
                                            >
                                                {a.cta}
                                            </Button>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </StaggerGroup>

                    {/* Guidance strip — a clear next step for the undecided */}
                    <AnimateIn delay={0.1} className="mt-6">
                        <div className="flex flex-col gap-5 rounded-3xl border border-border bg-background-primary px-6 py-6 sm:flex-row sm:items-center sm:justify-between lg:px-10 lg:py-7">
                            <div className="flex items-start gap-4 sm:items-center">
                                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
                                    <LucideCompass
                                        className="h-5 w-5"
                                        strokeWidth={1.75}
                                        aria-hidden
                                    />
                                </span>
                                <div>
                                    <p className="font-serif text-lg leading-snug text-heading">
                                        Not sure which is right for you?
                                    </p>
                                    <p className="mt-1 text-sm leading-relaxed text-body">
                                        Tell us about your trip and we&apos;ll
                                        point you to the plan that fits.
                                    </p>
                                </div>
                            </div>
                            <Button
                                variant="secondary"
                                link="/contact"
                                icon={
                                    <LucideArrowRight
                                        className="h-4 w-4"
                                        strokeWidth={2}
                                    />
                                }
                                className="shrink-0"
                            >
                                Talk to our team
                            </Button>
                        </div>
                    </AnimateIn>
                </div>
            </section>
        </div>
    );
};

export default AudienceSection;
