import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useTravelPlan } from "../../api/hooks";
import DashboardHeader from "../../components/dashboard/DashboardHeader";
import {
    LucideArrowLeft,
    LucideDownload,
    LucideSyringe,
    LucideAlertTriangle,
    LucideShieldCheck,
    LucidePill,
    LucideDroplets,
    LucidePhone,
    LucideLoader2,
} from "lucide-react";

// ─── Processing Phrases ─────────────────────────────────────

const processingPhases = [
    {
        title: "Analyzing your destination",
        subtitle: "Reviewing country-level health and safety data...",
        icon: "globe",
    },
    {
        title: "Checking vaccination requirements",
        subtitle: "Cross-referencing WHO and CDC immunization guidelines...",
        icon: "syringe",
    },
    {
        title: "Evaluating health risks",
        subtitle: "Assessing disease prevalence and seasonal patterns...",
        icon: "heartPulse",
    },
    {
        title: "Reviewing travel advisories",
        subtitle: "Pulling the latest government and health authority warnings...",
        icon: "shield",
    },
    {
        title: "Compiling medication guidance",
        subtitle: "Identifying prophylactic and emergency medications for your trip...",
        icon: "pill",
    },
    {
        title: "Gathering emergency contacts",
        subtitle: "Locating hospitals, embassies, and emergency services...",
        icon: "phone",
    },
    {
        title: "Personalizing your advisory",
        subtitle: "Tailoring recommendations to your health profile...",
        icon: "sparkles",
    },
    {
        title: "Almost there",
        subtitle: "Finalizing your comprehensive travel health plan...",
        icon: "check",
    },
];

// ─── Helpers ─────────────────────────────────────────────────

const riskColors: Record<string, string> = { Low: "text-accent", Moderate: "text-gold", High: "text-red-600" };
const riskBg: Record<string, string> = { Low: "bg-accent/10", Moderate: "bg-gold/10", High: "bg-red-50" };

const getRiskLabel = (score: number) => {
    if (score <= 1) return "Low";
    if (score === 2) return "Moderate";
    return "High";
};

const safeParse = (str: string | undefined, fallback: unknown = []) => {
    if (!str) return fallback;
    try {
        return JSON.parse(str);
    } catch {
        return fallback;
    }
};

// ─── Processing Screen ──────────────────────────────────────

const PlanProcessing = ({ destination, country }: { destination?: string; country?: string }) => {
    const [phaseIndex, setPhaseIndex] = useState(0);
    const [progress, setProgress] = useState(0);
    const [fadeKey, setFadeKey] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setPhaseIndex((prev) => {
                const next = (prev + 1) % processingPhases.length;
                setFadeKey((k) => k + 1);
                return next;
            });
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 92) return prev;
                const increment = Math.random() * 3 + 0.5;
                return Math.min(prev + increment, 92);
            });
        }, 800);
        return () => clearInterval(interval);
    }, []);

    const phase = processingPhases[phaseIndex];
    const place = destination || country || "your destination";

    return (
        <div className="flex flex-col items-center justify-center py-20 sm:py-32 max-w-md mx-auto px-4">
            {/* Animated orb */}
            <div className="relative w-24 h-24 mb-10">
                <div className="absolute inset-0 rounded-full bg-accent/10 animate-ping" style={{ animationDuration: "2.5s" }} />
                <div className="absolute inset-2 rounded-full bg-accent/15 animate-pulse" style={{ animationDuration: "2s" }} />
                <div className="relative w-full h-full rounded-full bg-accent/10 flex items-center justify-center">
                    <LucideLoader2 className="w-10 h-10 text-accent animate-spin" style={{ animationDuration: "3s" }} />
                </div>
            </div>

            {/* Phase title — fades in/out */}
            <div key={fadeKey} className="text-center animate-fadeIn">
                <h2 className="text-2xl sm:text-3xl font-serif text-heading mb-2">
                    {phase.title}
                </h2>
                <p className="text-sm text-muted leading-relaxed mb-1">
                    {phase.subtitle}
                </p>
            </div>

            {/* Destination label */}
            <div className="mt-6 mb-8 flex items-center gap-2 px-4 py-2 rounded-full bg-accent/8 border border-accent/15">
                <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                <span className="text-xs font-semibold text-accent">
                    {place}
                </span>
            </div>

            {/* Progress bar */}
            <div className="w-full max-w-xs">
                <div className="w-full h-1.5 rounded-full bg-border-light/60 overflow-hidden">
                    <div
                        className="h-full rounded-full bg-accent transition-all duration-700 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>
                <div className="flex items-center justify-between mt-2">
                    <span className="text-[11px] text-muted">
                        Step {phaseIndex + 1} of {processingPhases.length}
                    </span>
                    <span className="text-[11px] text-muted tabular-nums">
                        {Math.round(progress)}%
                    </span>
                </div>
            </div>

            {/* Tip */}
            <p className="text-xs text-muted/60 mt-8 text-center max-w-xs leading-relaxed">
                This usually takes 30–60 seconds. We'll update automatically when your plan is ready.
            </p>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(8px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.5s ease-out;
                }
            `}</style>
        </div>
    );
};

// ─── Main Component ─────────────────────────────────────────

const PlanDetails = () => {
    const { id } = useParams<{ id: string }>();
    const planId = parseInt(id || "0");
    const { data: plan, isLoading } = useTravelPlan(planId);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-32">
                <LucideLoader2 className="w-10 h-10 text-accent animate-spin mb-4" />
                <p className="text-sm text-muted">Loading your plan...</p>
            </div>
        );
    }

    if (!plan) {
        return (
            <div>
                <DashboardHeader title="Plan not found" />
                <p className="text-sm text-body">This plan doesn't exist or has been deleted.</p>
                <Link to="/dashboard/plans" className="text-sm text-accent font-medium hover:underline mt-4 inline-block">
                    Back to plans
                </Link>
            </div>
        );
    }

    // Show rich processing state for pending/processing plans
    if (plan.status === "PENDING" || plan.status === "PROCESSING") {
        return (
            <div>
                <DashboardHeader title="Generating your plan" />
                <Link to="/dashboard/plans" className="inline-flex items-center gap-1 text-xs text-muted hover:text-heading transition-colors duration-200 mb-2">
                    <LucideArrowLeft className="w-3 h-3" /> Back to plans
                </Link>
                <PlanProcessing destination={plan.destination} country={plan.country} />
            </div>
        );
    }

    const vaccinations = safeParse(plan.vaccinations);
    const healthAlerts = safeParse(plan.healthAlerts);
    const safetyAdvisories = safeParse(plan.safetyAdvisories);
    const medications = safeParse(plan.medications);
    const waterFood = safeParse(plan.waterFood);
    const emergencyContacts = safeParse(plan.emergencyContacts);

    const riskLabel = getRiskLabel(plan.riskScore);

    const sections = [
        {
            icon: <LucideSyringe className="w-4 h-4" />,
            title: "Vaccinations",
            content: (
                <div className="space-y-2">
                    {Array.isArray(vaccinations) ? vaccinations.map((v: { name: string; status: string }, i: number) => (
                        <div key={i} className="flex items-center justify-between">
                            <span className="text-sm text-heading">{v.name}</span>
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                                v.status === "Required" ? "text-red-600 bg-red-50" :
                                v.status === "Recommended" ? "text-gold bg-gold/10" :
                                "text-muted bg-button-secondary"
                            }`}>{v.status}</span>
                        </div>
                    )) : <p className="text-sm text-body">{plan.vaccinations}</p>}
                </div>
            ),
        },
        {
            icon: <LucideAlertTriangle className="w-4 h-4" />,
            title: "Health alerts",
            content: (
                <ul className="space-y-2">
                    {Array.isArray(healthAlerts) ? healthAlerts.map((a: string, i: number) => (
                        <li key={i} className="text-sm text-body flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-gold mt-1.5 shrink-0" />
                            {a}
                        </li>
                    )) : <p className="text-sm text-body">{plan.healthAlerts}</p>}
                </ul>
            ),
        },
        {
            icon: <LucideShieldCheck className="w-4 h-4" />,
            title: "Safety advisories",
            content: (
                <ul className="space-y-2">
                    {Array.isArray(safetyAdvisories) ? safetyAdvisories.map((a: string, i: number) => (
                        <li key={i} className="text-sm text-body flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0" />
                            {a}
                        </li>
                    )) : <p className="text-sm text-body">{plan.safetyAdvisories}</p>}
                </ul>
            ),
        },
        {
            icon: <LucidePill className="w-4 h-4" />,
            title: "Medications",
            content: (
                <ul className="space-y-2">
                    {Array.isArray(medications) ? medications.map((m: string, i: number) => (
                        <li key={i} className="text-sm text-body">{m}</li>
                    )) : <p className="text-sm text-body">{plan.medications}</p>}
                </ul>
            ),
        },
        {
            icon: <LucideDroplets className="w-4 h-4" />,
            title: "Water & food safety",
            content: (
                <ul className="space-y-2">
                    {Array.isArray(waterFood) ? waterFood.map((w: string, i: number) => (
                        <li key={i} className="text-sm text-body">{w}</li>
                    )) : <p className="text-sm text-body">{plan.waterFood}</p>}
                </ul>
            ),
        },
        {
            icon: <LucidePhone className="w-4 h-4" />,
            title: "Emergency contacts",
            content: (
                <div className="space-y-2">
                    {Array.isArray(emergencyContacts) ? emergencyContacts.map((c: { label: string; value: string }, i: number) => (
                        <div key={i} className="flex items-center justify-between">
                            <span className="text-xs text-muted">{c.label}</span>
                            <span className="text-sm font-medium text-heading">{c.value}</span>
                        </div>
                    )) : <p className="text-sm text-body">{plan.emergencyContacts}</p>}
                </div>
            ),
        },
    ];

    return (
        <div>
            <DashboardHeader title="Plan details" />

            {/* Back link */}
            <Link to="/dashboard/plans" className="inline-flex items-center gap-1 text-xs text-muted hover:text-heading transition-colors duration-200 mb-6">
                <LucideArrowLeft className="w-3 h-3" /> Back to plans
            </Link>

            {/* Plan header card */}
            <div className="bg-white rounded-2xl border border-border-light/50 p-6 md:p-8 mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                    <div>
                        <h2 className="text-xl font-serif text-heading">{plan.destination}</h2>
                        <p className="text-sm text-muted">{plan.country} · {plan.duration} days · {plan.purpose}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${riskColors[riskLabel]} ${riskBg[riskLabel]}`}>
                            {riskLabel} risk
                        </span>
                        <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-button-secondary text-heading text-xs font-semibold hover:bg-border-light transition-colors duration-200 cursor-pointer">
                            <LucideDownload className="w-3.5 h-3.5" /> Download PDF
                        </button>
                    </div>
                </div>
                <div className="flex flex-wrap gap-4 text-xs text-muted">
                    <span>Generated: {new Date(plan.createdAt).toLocaleDateString()}</span>
                    <span>·</span>
                    <span>1 credit consumed</span>
                    <span>·</span>
                    <span>Status: {plan.status}</span>
                </div>
                {plan.medicalConsiderations && (
                    <div className="mt-4 p-4 rounded-xl bg-gold/5 border border-gold/10">
                        <p className="text-xs font-semibold text-gold uppercase tracking-wider mb-1">Medical considerations</p>
                        <p className="text-sm text-heading">{plan.medicalConsiderations}</p>
                    </div>
                )}
            </div>

            {/* Plan sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {sections.map((section) => (
                    <div key={section.title} className="bg-white rounded-2xl border border-border-light/50 p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-7 h-7 rounded-lg bg-dark text-background-primary flex items-center justify-center">
                                {section.icon}
                            </div>
                            <h3 className="text-sm font-semibold text-heading">
                                {section.title}
                            </h3>
                        </div>
                        {section.content}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PlanDetails;
