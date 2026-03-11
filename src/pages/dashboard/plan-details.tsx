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

const riskColors: Record<string, string> = { Low: "text-accent", Moderate: "text-gold", High: "text-red-600" };
const riskBg: Record<string, string> = { Low: "bg-accent/10", Moderate: "bg-gold/10", High: "bg-red-50" };

const getRiskLabel = (score: number) => {
    if (score <= 1) return "Low";
    if (score === 2) return "Moderate";
    return "High";
};

const safeParse = (str: string | undefined, fallback: any = []) => {
    if (!str) return fallback;
    try {
        return JSON.parse(str);
    } catch (e) {
        console.error("Failed to parse JSON:", str);
        return fallback;
    }
};

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
                    {Array.isArray(vaccinations) ? vaccinations.map((v: any, i: number) => (
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
                        <li key={i} className="text-sm text-body">• {m}</li>
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
                        <li key={i} className="text-sm text-body">• {w}</li>
                    )) : <p className="text-sm text-body">{plan.waterFood}</p>}
                </ul>
            ),
        },
        {
            icon: <LucidePhone className="w-4 h-4" />,
            title: "Emergency contacts",
            content: (
                <div className="space-y-2">
                    {Array.isArray(emergencyContacts) ? emergencyContacts.map((c: any, i: number) => (
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
