import { useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
    LucideBadgeCheck,
    LucideBriefcase,
    LucideCalendarDays,
    LucideCheck,
    LucideFileText,
    LucideShieldCheck,
    type LucideIcon,
} from "lucide-react";
import { cn } from "../../../lib/utils";
import { EASE_IN_OUT_SMOOTH, EASE_SMOOTH } from "./steps";

/**
 * Props every in-phone screen receives.
 * - `active`  the screen is the one currently on display.
 * - `lite`    collapse micro-animations to a single fade with final/resting
 *             states (used on mobile + reduced motion) so it stays smooth and
 *             never loops.
 */
export interface ScreenProps {
    active: boolean;
    lite: boolean;
}

/**
 * Drives a stepwise reveal. Returns the current phase (0..count). When the
 * screen is inactive or in `lite` mode it jumps straight to the final phase so
 * the screen shows its completed state with no looping timers.
 */
function usePhasedReveal(count: number, active: boolean, lite: boolean, stepMs = 850): number {
    const [phase, setPhase] = useState(() => (active && !lite ? 0 : count));

    useEffect(() => {
        if (!active || lite) {
            setPhase(count);
            return;
        }
        setPhase(0);
        let current = 0;
        const id = window.setInterval(() => {
            current += 1;
            setPhase(current);
            if (current >= count) window.clearInterval(id);
        }, stepMs);
        return () => window.clearInterval(id);
    }, [active, lite, count, stepMs]);

    return phase;
}

/* ── Shared in-phone primitives ─────────────────────────────────────────── */

function ScreenShell({
    title,
    subtitle,
    children,
}: {
    title: string;
    subtitle: string;
    children: ReactNode;
}) {
    return (
        <div className="flex h-full flex-col px-4 pb-4 pt-1">
            <div className="mb-3">
                <h4 className="font-serif text-[15px] font-bold leading-tight text-heading">{title}</h4>
                <p className="mt-0.5 text-[10px] leading-snug text-muted">{subtitle}</p>
            </div>
            <div className="flex min-h-0 flex-1 flex-col">{children}</div>
        </div>
    );
}

function FieldLabel({ children }: { children: ReactNode }) {
    return (
        <span className="mb-1 block text-[8px] font-bold uppercase tracking-[0.12em] text-muted">
            {children}
        </span>
    );
}

function Caret() {
    return (
        <motion.span
            className="ml-px inline-block h-3.5 w-px shrink-0 bg-accent"
            animate={{ opacity: [1, 1, 0, 0] }}
            transition={{ duration: 0.9, repeat: Infinity, ease: "linear", times: [0, 0.5, 0.5, 1] }}
            aria-hidden
        />
    );
}

function FieldRow({
    label,
    value,
    placeholder,
    filled,
    caret,
}: {
    label: string;
    value: string;
    placeholder: string;
    filled: boolean;
    caret: boolean;
}) {
    return (
        <div>
            <FieldLabel>{label}</FieldLabel>
            <div
                className={cn(
                    "flex h-8 items-center rounded-lg border bg-white px-2.5 transition-colors duration-300",
                    filled || caret ? "border-accent/60" : "border-border-light",
                )}
            >
                <span className={cn("truncate text-[11px]", filled ? "text-heading" : "text-border")}>
                    {filled ? value : placeholder}
                </span>
                {caret && <Caret />}
            </div>
        </div>
    );
}

function ChoiceChip({
    label,
    selected,
    icon: Icon,
}: {
    label: string;
    selected: boolean;
    icon?: LucideIcon;
}) {
    return (
        <span
            className={cn(
                "inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[9px] font-semibold transition-colors duration-300",
                selected
                    ? "border-accent/30 bg-accent/10 text-accent"
                    : "border-border-light bg-white text-muted",
            )}
        >
            {Icon && <Icon size={9} strokeWidth={2.5} />}
            {label}
        </span>
    );
}

function ToggleRow({ label, value, answered }: { label: string; value: string; answered: boolean }) {
    return (
        <div className="flex items-center justify-between rounded-lg border border-border-light bg-white px-2.5 py-1.5">
            <span className="text-[10px] text-heading">{label}</span>
            <span
                className={cn(
                    "inline-flex items-center gap-1 text-[9px] font-semibold transition-colors duration-300",
                    answered ? "text-accent" : "text-border",
                )}
            >
                {answered && <LucideCheck size={8} strokeWidth={3.5} />}
                {answered ? value : "\u2014"}
            </span>
        </div>
    );
}

function StatusRow({ label, state }: { label: string; state: "pending" | "active" | "done" }) {
    return (
        <div className="flex items-center gap-2">
            <span
                className={cn(
                    "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors duration-300",
                    state === "done"
                        ? "border-accent bg-accent text-white"
                        : state === "active"
                          ? "border-gold text-gold"
                          : "border-border",
                )}
            >
                {state === "done" ? (
                    <LucideCheck size={9} strokeWidth={3.5} />
                ) : state === "active" ? (
                    <motion.span
                        className="h-1.5 w-1.5 rounded-full bg-gold"
                        animate={{ opacity: [1, 0.3, 1] }}
                        transition={{ duration: 1.2, repeat: Infinity, ease: EASE_IN_OUT_SMOOTH }}
                    />
                ) : (
                    <span className="h-1 w-1 rounded-full bg-border" />
                )}
            </span>
            <span
                className={cn(
                    "text-[10px] leading-snug transition-colors duration-300",
                    state === "pending" ? "text-muted/60" : "text-heading",
                )}
            >
                {label}
            </span>
        </div>
    );
}

/** Transform-only progress bar (scaleX) for performance safety. `value` is 0..1. */
function ProgressTrack({ value }: { value: number }) {
    return (
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-border/60">
            <motion.div
                className="h-full w-full origin-left rounded-full bg-accent"
                initial={false}
                animate={{ scaleX: value }}
                transition={{ duration: 0.5, ease: EASE_SMOOTH }}
            />
        </div>
    );
}

function Spinner() {
    return (
        <motion.span
            className="block h-3 w-3 rounded-full border-[1.5px] border-white/30 border-t-white"
            animate={{ rotate: 360 }}
            transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
            aria-hidden
        />
    );
}

function SubmitButton({
    state,
    idleLabel,
    doneLabel,
    loadingLabel,
}: {
    state: "idle" | "loading" | "done";
    idleLabel: string;
    doneLabel: string;
    loadingLabel: string;
}) {
    return (
        <div className="mt-3">
            <div
                className={cn(
                    "flex h-9 items-center justify-center gap-1.5 rounded-xl text-[11px] font-semibold transition-colors duration-300",
                    state === "done" ? "bg-accent text-white" : "bg-dark text-background-primary",
                )}
            >
                <AnimatePresence mode="wait" initial={false}>
                    {state === "done" ? (
                        <motion.span
                            key="done"
                            className="flex items-center gap-1"
                            initial={{ opacity: 0, scale: 0.85 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3, ease: EASE_SMOOTH }}
                        >
                            <LucideCheck size={12} strokeWidth={3} />
                            {doneLabel}
                        </motion.span>
                    ) : state === "loading" ? (
                        <motion.span
                            key="loading"
                            className="flex items-center gap-1.5"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <Spinner />
                            {loadingLabel}
                        </motion.span>
                    ) : (
                        <motion.span key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            {idleLabel}
                        </motion.span>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

/* ── Screens ────────────────────────────────────────────────────────────── */

const REGISTER_FIELDS = [
    { label: "First name", value: "Sarah", placeholder: "Sarah" },
    { label: "Last name", value: "Kimani", placeholder: "Kimani" },
    { label: "Email", value: "sarah.kimani@gmail.com", placeholder: "you@example.com" },
    { label: "Password", value: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", placeholder: "Min. 8 characters" },
];

export function RegisterScreen({ active, lite }: ScreenProps) {
    const phase = usePhasedReveal(5, active, lite, 720);
    const buttonState = phase >= 5 ? "done" : phase === 4 ? "loading" : "idle";

    return (
        <ScreenShell title="Create your account" subtitle="Free to start — no card required.">
            <div className="flex flex-1 flex-col gap-2.5">
                {REGISTER_FIELDS.map((field, i) => (
                    <FieldRow
                        key={field.label}
                        label={field.label}
                        value={field.value}
                        placeholder={field.placeholder}
                        filled={phase > i}
                        caret={!lite && phase === i}
                    />
                ))}
            </div>
            <SubmitButton
                state={buttonState}
                idleLabel="Create account"
                loadingLabel="Creating…"
                doneLabel="Account created"
            />
        </ScreenShell>
    );
}

const TRIP_TYPES = ["One way", "Return", "Multi-stop", "Transit"];
const PURPOSES: { label: string; icon?: LucideIcon }[] = [
    { label: "Leisure" },
    { label: "Business", icon: LucideBriefcase },
    { label: "Study" },
];

export function QuestionnaireScreen({ active, lite }: ScreenProps) {
    const phase = usePhasedReveal(4, active, lite, 850);

    return (
        <ScreenShell title="Trip details" subtitle="A few quick questions about your travel.">
            <div className="flex flex-1 flex-col gap-3">
                <div>
                    <FieldLabel>Destination</FieldLabel>
                    <div
                        className={cn(
                            "flex h-9 items-center gap-2 rounded-lg border bg-white px-2.5 transition-colors duration-300",
                            phase >= 1 ? "border-accent/60" : "border-border-light",
                        )}
                    >
                        {phase >= 1 && <span className="text-sm leading-none">{"\ud83c\uddef\ud83c\uddf5"}</span>}
                        <span className={cn("text-[11px] font-medium", phase >= 1 ? "text-heading" : "text-border")}>
                            {phase >= 1 ? "Japan \u00b7 Tokyo" : "Where are you headed?"}
                        </span>
                    </div>
                </div>

                <div>
                    <FieldLabel>Travel dates</FieldLabel>
                    <div
                        className={cn(
                            "flex h-9 items-center gap-2 rounded-lg border bg-white px-2.5 transition-colors duration-300",
                            phase >= 1 ? "border-accent/60" : "border-border-light",
                        )}
                    >
                        {phase >= 1 && <LucideCalendarDays size={13} className="text-muted shrink-0" />}
                        <span className={cn("text-[11px] font-medium", phase >= 1 ? "text-heading" : "text-border")}>
                            {phase >= 1 ? "12\u201326 Jun \u00b7 14 nights" : "Add your dates"}
                        </span>
                    </div>
                </div>

                <div>
                    <FieldLabel>Trip type</FieldLabel>
                    <div className="flex flex-wrap gap-1.5">
                        {TRIP_TYPES.map((type) => (
                            <ChoiceChip key={type} label={type} selected={phase >= 2 && type === "Return"} />
                        ))}
                    </div>
                </div>

                <div>
                    <FieldLabel>Purpose</FieldLabel>
                    <div className="flex flex-wrap gap-1.5">
                        {PURPOSES.map((purpose) => (
                            <ChoiceChip
                                key={purpose.label}
                                label={purpose.label}
                                icon={purpose.icon}
                                selected={phase >= 3 && purpose.label === "Business"}
                            />
                        ))}
                    </div>
                </div>

                <div>
                    <FieldLabel>Medical history</FieldLabel>
                    <div className="flex flex-col gap-1.5">
                        <ToggleRow label="Chronic conditions" value="None" answered={phase >= 4} />
                        <ToggleRow label="Current medications" value="1 listed" answered={phase >= 4} />
                        <ToggleRow label="Plain-language summary" value="On" answered={phase >= 4} />
                    </div>
                </div>
            </div>

            <div className="mt-3">
                <div className="mb-1 flex items-center justify-between text-[8px] font-bold uppercase tracking-[0.12em] text-muted">
                    <span>Progress</span>
                    <span className="tabular-nums">{Math.round((phase / 4) * 100)}%</span>
                </div>
                <ProgressTrack value={phase / 4} />
            </div>
        </ScreenShell>
    );
}

const PROCESSING_STEPS = [
    "Analysing destination requirements",
    "Reviewing your health profile",
    "Checking vaccine schedules",
    "Preparing your travel plan",
];

function ProcessingRing({ pct, done, lite }: { pct: number; done: boolean; lite: boolean }) {
    return (
        <div className="relative flex h-20 w-20 items-center justify-center">
            {!done && !lite && (
                <motion.span
                    className="absolute inset-0 rounded-full border-2 border-accent/20 border-t-accent"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.1, repeat: Infinity, ease: "linear" }}
                    aria-hidden
                />
            )}
            {done && <span className="absolute inset-0 rounded-full border-2 border-accent" aria-hidden />}
            {done ? (
                <motion.span
                    initial={lite ? false : { scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 18 }}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-white"
                >
                    <LucideCheck size={18} strokeWidth={3} />
                </motion.span>
            ) : (
                <span className="text-sm font-bold tabular-nums text-heading">{pct}%</span>
            )}
        </div>
    );
}

export function ProcessingScreen({ active, lite }: ScreenProps) {
    const phase = usePhasedReveal(PROCESSING_STEPS.length, active, lite, 900);
    const done = phase >= PROCESSING_STEPS.length;
    const pct = Math.round((phase / PROCESSING_STEPS.length) * 100);

    return (
        <ScreenShell title="Building your plan" subtitle="Cross-referencing trusted medical sources.">
            <div className="flex flex-1 flex-col items-center justify-center gap-5">
                <ProcessingRing pct={pct} done={done} lite={lite} />
                <div className="w-full space-y-2">
                    {PROCESSING_STEPS.map((label, i) => (
                        <StatusRow
                            key={label}
                            label={label}
                            state={phase > i ? "done" : phase === i ? "active" : "pending"}
                        />
                    ))}
                </div>
            </div>
        </ScreenShell>
    );
}

export function DoctorReviewScreen({ active, lite }: ScreenProps) {
    const phase = usePhasedReveal(1, active, lite, 1700);
    const approved = phase >= 1;

    return (
        <ScreenShell title="Physician review" subtitle="A travel-medicine doctor checks your plan.">
            <div className="flex flex-1 flex-col gap-3">
                <div className="flex items-center gap-2.5 rounded-xl border border-border bg-background-secondary p-2.5">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent/10 text-[11px] font-bold text-accent ring-1 ring-accent/20">
                        AM
                    </span>
                    <div className="min-w-0">
                        <p className="truncate text-[11px] font-semibold text-heading">Dr. A. Mensah</p>
                        <p className="text-[9px] text-muted">Travel Medicine · Lic. #MD-4471</p>
                    </div>
                    <LucideBadgeCheck className="ml-auto shrink-0 text-accent" size={16} strokeWidth={2} />
                </div>

                <div className="rounded-xl border border-border-light bg-white p-2.5">
                    <div className="mb-1.5 flex items-center gap-1.5">
                        <LucideFileText size={11} className="text-muted" />
                        <span className="text-[10px] font-semibold text-heading">Tokyo travel health plan</span>
                    </div>
                    <div className="space-y-1">
                        {["Vaccinations verified", "Medication review", "Risk advisories"].map((line) => (
                            <div key={line} className="flex items-center gap-1.5 text-[9px] text-muted">
                                <LucideCheck size={8} strokeWidth={3} className="text-accent" />
                                {line}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-auto">
                    <AnimatePresence mode="wait" initial={false}>
                        {approved ? (
                            <motion.div
                                key="approved"
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.35, ease: EASE_SMOOTH }}
                                className="flex items-center justify-center gap-1.5 rounded-xl bg-accent/10 py-2 text-[11px] font-semibold text-accent ring-1 ring-accent/20"
                            >
                                <LucideShieldCheck size={13} strokeWidth={2.5} />
                                Approved for delivery
                            </motion.div>
                        ) : (
                            <motion.div
                                key="review"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex items-center justify-center gap-1.5 rounded-xl bg-gold/10 py-2 text-[11px] font-semibold text-gold ring-1 ring-gold/20"
                            >
                                {!lite && (
                                    <motion.span
                                        className="h-1.5 w-1.5 rounded-full bg-gold"
                                        animate={{ opacity: [1, 0.3, 1] }}
                                        transition={{ duration: 1.2, repeat: Infinity, ease: EASE_IN_OUT_SMOOTH }}
                                    />
                                )}
                                In clinical review
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </ScreenShell>
    );
}

export function EmailScreen({ active, lite }: ScreenProps) {
    const phase = usePhasedReveal(2, active, lite, 800);
    const delivered = phase >= 2;

    return (
        <ScreenShell title="Plan delivered" subtitle="Your travel health plan is on its way.">
            <div className="flex flex-1 flex-col gap-3">
                <motion.div
                    initial={lite ? false : { opacity: 0, y: 8 }}
                    animate={phase >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
                    transition={{ duration: 0.4, ease: EASE_SMOOTH }}
                    className="rounded-xl border border-border-light bg-white p-2.5 shadow-sm"
                >
                    <div className="mb-2 flex items-center gap-2 border-b border-border-light pb-2">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-dark text-[9px] font-bold text-background-primary">
                            T
                        </span>
                        <div className="min-w-0">
                            <p className="text-[10px] font-semibold text-heading">TMAG · Travel Health</p>
                            <p className="truncate text-[9px] text-muted">to sarah.kimani@gmail.com</p>
                        </div>
                    </div>
                    <p className="text-[11px] font-semibold leading-snug text-heading">
                        Your Tokyo travel health plan is ready
                    </p>
                    <p className="mt-0.5 text-[9px] leading-snug text-muted">
                        Hi Sarah, your physician-reviewed plan is attached…
                    </p>
                    <div className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-border-light bg-background-secondary px-2 py-1">
                        <LucideFileText size={11} className="text-accent" />
                        <span className="text-[9px] font-medium text-heading">Tokyo-Travel-Plan.pdf</span>
                    </div>
                </motion.div>

                <div className="mt-auto flex flex-col items-center gap-1.5 py-1">
                    <motion.span
                        initial={lite ? false : { scale: 0 }}
                        animate={{ scale: delivered ? 1 : 0 }}
                        transition={{ type: "spring", stiffness: 280, damping: 18 }}
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-white"
                    >
                        <LucideCheck size={20} strokeWidth={3} />
                    </motion.span>
                    <motion.p
                        animate={{ opacity: delivered ? 1 : 0 }}
                        transition={{ duration: 0.3 }}
                        className="text-[10px] font-semibold text-heading"
                    >
                        Sent to your inbox
                    </motion.p>
                </div>
            </div>
        </ScreenShell>
    );
}
