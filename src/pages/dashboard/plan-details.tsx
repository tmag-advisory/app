import { useParams, Link } from "react-router-dom";
import { usePlanStore } from "../../stores/planStore";
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
} from "lucide-react";

const riskColors = { Low: "text-accent", Moderate: "text-gold", High: "text-red-600" };
const riskBg = { Low: "bg-accent/10", Moderate: "bg-gold/10", High: "bg-red-50" };

const PlanDetails = () => {
    const { id } = useParams<{ id: string }>();
    const plan = usePlanStore((s) => s.getPlan(id ?? ""));

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

    const sections = [
        {
            icon: <LucideSyringe className="w-4 h-4" />,
            title: "Vaccinations",
            content: (
                <div className="space-y-2">
                    {plan.vaccinations.map((v) => (
                        <div key={v.name} className="flex items-center justify-between">
                            <span className="text-sm text-heading">{v.name}</span>
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                                v.status === "Required" ? "text-red-600 bg-red-50" :
                                v.status === "Recommended" ? "text-gold bg-gold/10" :
                                "text-muted bg-button-secondary"
                            }`}>{v.status}</span>
                        </div>
                    ))}
                </div>
            ),
        },
        {
            icon: <LucideAlertTriangle className="w-4 h-4" />,
            title: "Health alerts",
            content: (
                <ul className="space-y-2">
                    {plan.healthAlerts.map((a) => (
                        <li key={a} className="text-sm text-body flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-gold mt-1.5 shrink-0" />
                            {a}
                        </li>
                    ))}
                </ul>
            ),
        },
        {
            icon: <LucideShieldCheck className="w-4 h-4" />,
            title: "Safety advisories",
            content: (
                <ul className="space-y-2">
                    {plan.safetyAdvisories.map((a) => (
                        <li key={a} className="text-sm text-body flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0" />
                            {a}
                        </li>
                    ))}
                </ul>
            ),
        },
        {
            icon: <LucidePill className="w-4 h-4" />,
            title: "Medications",
            content: (
                <ul className="space-y-2">
                    {plan.medications.map((m) => (
                        <li key={m} className="text-sm text-body">• {m}</li>
                    ))}
                </ul>
            ),
        },
        {
            icon: <LucideDroplets className="w-4 h-4" />,
            title: "Water & food safety",
            content: (
                <ul className="space-y-2">
                    {plan.waterFood.map((w) => (
                        <li key={w} className="text-sm text-body">• {w}</li>
                    ))}
                </ul>
            ),
        },
        {
            icon: <LucidePhone className="w-4 h-4" />,
            title: "Emergency contacts",
            content: (
                <div className="space-y-2">
                    {plan.emergencyContacts.map((c) => (
                        <div key={c.label} className="flex items-center justify-between">
                            <span className="text-xs text-muted">{c.label}</span>
                            <span className="text-sm font-medium text-heading">{c.value}</span>
                        </div>
                    ))}
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
                        <p className="text-sm text-muted">{plan.country} · {plan.duration} · {plan.purpose}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${riskColors[plan.riskScore]} ${riskBg[plan.riskScore]}`}>
                            {plan.riskScore} risk
                        </span>
                        <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-button-secondary text-heading text-xs font-semibold hover:bg-border-light transition-colors duration-200 cursor-pointer">
                            <LucideDownload className="w-3.5 h-3.5" /> Download PDF
                        </button>
                    </div>
                </div>
                <div className="flex flex-wrap gap-4 text-xs text-muted">
                    <span>Generated: {plan.createdAt}</span>
                    <span>·</span>
                    <span>1 credit consumed</span>
                    <span>·</span>
                    <span>Status: {plan.status}</span>
                </div>
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
