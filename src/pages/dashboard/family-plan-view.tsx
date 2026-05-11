import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
    LucideAlertCircle,
    LucideArrowLeft,
    LucideDownload,
    LucideLoader2,
    LucideMapPin,
    LucidePill,
    LucideShield,
    LucideSyringe,
    LucideUser,
    LucideUsers,
} from "lucide-react";
import familyTripApi from "../../api/familyTrip";
import type { TravelPlanResponse } from "../../api/types";
import DashboardHeader from "../../components/dashboard/DashboardHeader";
import {
    DASHBOARD_GLASS_SURFACE,
    DashboardAmbientBackground,
} from "../../components/dashboard/dashboardChrome";
import { cn } from "../../lib/utils";

interface FamilyVaccination {
    name: string;
    recommendation: string;
    rationale: string;
    timing?: string;
}

interface FamilyMedication {
    name: string;
    indication: string;
    dosage: string;
    notes?: string;
}

interface FamilyHealthConsideration {
    category: string;
    advice: string;
}

interface FamilyMemberSection {
    memberId: number;
    memberName: string;
    relationship: string;
    ageAtDeparture: number;
    executiveSummary?: string;
    hardStop?: boolean;
    vaccinations?: FamilyVaccination[];
    medications?: FamilyMedication[];
    healthConsiderations?: FamilyHealthConsideration[];
    travellerSpecific?: string;
}

interface FamilyPlanContent {
    tripSummary?: string;
    generalVaccinations?: (string | FamilyVaccination)[];
    members?: FamilyMemberSection[];
}

const GENERATING_STATUSES = new Set(["QUEUED", "PROCESSING", "PENDING"]);

export default function FamilyPlanView() {
    const { id } = useParams<{ id: string }>();
    const tripId = Number(id);
    const navigate = useNavigate();
    const [plan, setPlan] = useState<TravelPlanResponse | null>(null);
    const [content, setContent] = useState<FamilyPlanContent | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [downloading, setDownloading] = useState(false);

    useEffect(() => {
        if (!Number.isFinite(tripId) || tripId <= 0) {
            setError("Invalid trip id");
            setIsLoading(false);
            return;
        }
        const fetchPlan = async () => {
            try {
                const res = await familyTripApi.getFamilyPlan(tripId);
                const data = res.data.data ?? null;
                setPlan(data);
                const raw = data?.generatedPlan?.planJson;
                if (raw) {
                    try {
                        setContent(JSON.parse(raw) as FamilyPlanContent);
                    } catch {
                        setContent(null);
                    }
                } else {
                    setContent(null);
                }
            } catch (err: any) {
                if (err?.response?.status === 404) {
                    setError("Family trip not found");
                } else {
                    setError("Could not load family plan");
                }
            } finally {
                setIsLoading(false);
            }
        };
        fetchPlan();
    }, [tripId]);

    const handleDownload = async () => {
        if (!plan || plan.status !== "COMPLETED") return;
        setDownloading(true);
        try {
            const res = await familyTripApi.downloadFamilyPdf(tripId);
            const url = URL.createObjectURL(res.data as Blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "family-travel-health-plan.pdf";
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
            toast.success("Family travel health plan downloaded");
        } catch {
            toast.error("Could not download PDF. Please try again.");
        } finally {
            setDownloading(false);
        }
    };

    if (isLoading) {
        return (
            <div>
                <DashboardHeader title="Family Travel Health Plan" />
                <div className="flex items-center justify-center py-20">
                    <LucideLoader2 className="w-6 h-6 text-accent animate-spin" />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div>
                <DashboardHeader title="Family Travel Health Plan" />
                <div className={cn(DASHBOARD_GLASS_SURFACE, "p-10 text-center max-w-md mx-auto")}>
                    <LucideAlertCircle className="w-10 h-10 text-amber-500 mx-auto mb-4" />
                    <p className="text-sm font-semibold text-heading mb-2">{error}</p>
                    <button
                        onClick={() => navigate("/dashboard/family-members")}
                        className="text-sm text-accent font-medium hover:underline"
                    >
                        Back to family members
                    </button>
                </div>
            </div>
        );
    }

    if (!plan) {
        return (
            <div>
                <DashboardHeader title="Family Travel Health Plan" />
                <div className={cn(DASHBOARD_GLASS_SURFACE, "p-10 text-center max-w-md mx-auto")}>
                    <LucideAlertCircle className="w-10 h-10 text-amber-500 mx-auto mb-4" />
                    <p className="text-sm font-semibold text-heading mb-2">Plan not yet available</p>
                    <p className="text-xs text-muted mb-6">
                        The family travel health plan has not been generated for this trip yet. Submit the trip and complete every member's questionnaire to start generation.
                    </p>
                    <Link
                        to={`/dashboard/family-trip/${tripId}`}
                        className="text-sm text-accent font-medium hover:underline"
                    >
                        Open trip
                    </Link>
                </div>
            </div>
        );
    }

    const isGenerating = GENERATING_STATUSES.has(plan.status);
    const isFailed = plan.status === "FAILED";
    const isCompleted = plan.status === "COMPLETED";

    return (
        <div className="relative min-h-screen font-sans">
            <DashboardAmbientBackground />
            <DashboardHeader title="Family Travel Health Plan" />

            <div className="relative z-10 max-w-5xl mx-auto px-2 md:px-6 pb-14 pt-2 space-y-6">
                <Link
                    to={`/dashboard/family-members`}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-muted hover:text-heading transition-colors"
                >
                    <LucideArrowLeft className="w-3.5 h-3.5" />
                    Back to plans
                </Link>

                {/* Hero */}
                <div className={cn(DASHBOARD_GLASS_SURFACE, "p-6 md:p-8")}>
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <span
                                    className={cn(
                                        "px-2.5 py-1 text-[10px] font-semibold rounded-full uppercase tracking-wider",
                                        isCompleted ? "bg-emerald-50 text-emerald-700" :
                                            isGenerating ? "bg-amber-50 text-amber-700" :
                                                isFailed ? "bg-red-50 text-red-700" :
                                                    "bg-slate-100 text-muted"
                                    )}
                                >
                                    {plan.status}
                                </span>
                            </div>
                            <h1 className="text-2xl font-serif text-heading flex items-center gap-2">
                                <LucideMapPin className="w-5 h-5 text-accent" />
                                {plan.destination}, {plan.country}
                            </h1>
                            <p className="text-xs text-muted mt-1">{plan.duration} days · Family plan</p>
                        </div>

                        {isCompleted && (
                            <button
                                onClick={handleDownload}
                                disabled={downloading}
                                className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold rounded-xl text-white bg-dark hover:bg-darkest transition-all disabled:opacity-50"
                            >
                                {downloading ? (
                                    <LucideLoader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <LucideDownload className="mr-2 h-4 w-4" />
                                )}
                                Download PDF
                            </button>
                        )}
                    </div>

                    {content?.tripSummary && (
                        <p className="mt-5 text-sm text-body leading-relaxed border-t border-border-light pt-4">
                            {content.tripSummary}
                        </p>
                    )}
                </div>

                {isGenerating && (
                    <div className={cn(DASHBOARD_GLASS_SURFACE, "p-8 text-center")}>
                        <LucideLoader2 className="w-8 h-8 text-accent animate-spin mx-auto mb-3" />
                        <p className="text-sm font-semibold text-heading mb-1">Generating family plan</p>
                        <p className="text-xs text-muted">
                            Refresh this page in a moment to see the full plan.
                        </p>
                    </div>
                )}

                {isFailed && (
                    <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
                        <p className="text-sm font-semibold text-red-900 mb-1">Plan generation failed</p>
                        <p className="text-xs text-red-800">
                            {plan.generatedPlan?.errorMessage ||
                                "Something went wrong while generating this family plan. Please contact support."}
                        </p>
                    </div>
                )}

                {isCompleted && content && (
                    <>
                        {/* General vaccinations */}
                        {content.generalVaccinations && content.generalVaccinations.length > 0 && (
                            <div className={cn(DASHBOARD_GLASS_SURFACE, "p-6")}>
                                <h2 className="text-lg font-serif text-heading mb-4 flex items-center gap-2">
                                    <LucideSyringe className="w-5 h-5 text-accent" />
                                    General Vaccinations
                                </h2>
                                <ul className="space-y-2">
                                    {content.generalVaccinations.map((v, i) => {
                                        if (typeof v === "string") {
                                            return (
                                                <li key={i} className="text-sm text-body border border-border-light rounded-xl p-3">
                                                    {v}
                                                </li>
                                            );
                                        }
                                        return (
                                            <li key={i} className="border border-border-light rounded-xl p-3">
                                                <div className="flex items-center justify-between mb-1">
                                                    <p className="text-sm font-semibold text-heading">{v.name}</p>
                                                    <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-muted">
                                                        {v.recommendation}
                                                    </span>
                                                </div>
                                                {v.rationale && <p className="text-xs text-body">{v.rationale}</p>}
                                                {v.timing && <p className="text-xs text-muted mt-1">Timing: {v.timing}</p>}
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        )}

                        {/* Members */}
                        {content.members && content.members.length > 0 && (
                            <div className="space-y-6">
                                <h2 className="text-lg font-serif text-heading flex items-center gap-2 pt-2">
                                    <LucideUsers className="w-5 h-5 text-muted" />
                                    Per-member Recommendations ({content.members.length})
                                </h2>

                                {content.members.map((m) => (
                                    <div key={m.memberId} className={cn(DASHBOARD_GLASS_SURFACE, "p-6 space-y-5")}>
                                        {/* Member header */}
                                        <div className="flex items-start gap-3 pb-4 border-b border-border-light">
                                            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                                                <LucideUser className="w-5 h-5 text-accent" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-base font-semibold text-heading">{m.memberName}</p>
                                                <p className="text-xs text-muted capitalize">
                                                    {m.relationship?.toLowerCase()} · {m.ageAtDeparture} years old
                                                </p>
                                            </div>
                                            {m.hardStop && (
                                                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-red-50 text-red-700">
                                                    Physician review needed
                                                </span>
                                            )}
                                        </div>

                                        {m.executiveSummary && (
                                            <p className="text-sm text-body leading-relaxed">{m.executiveSummary}</p>
                                        )}

                                        {m.vaccinations && m.vaccinations.length > 0 && (
                                            <div>
                                                <h3 className="text-sm font-semibold text-heading mb-2 flex items-center gap-2">
                                                    <LucideSyringe className="w-4 h-4 text-accent" />
                                                    Vaccinations
                                                </h3>
                                                <div className="space-y-2">
                                                    {m.vaccinations.map((v, i) => (
                                                        <div key={i} className="border border-border-light rounded-xl p-3">
                                                            <div className="flex items-center justify-between mb-1">
                                                                <p className="text-sm font-semibold text-heading">{v.name}</p>
                                                                <span
                                                                    className={cn(
                                                                        "text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full",
                                                                        v.recommendation === "Required" ? "bg-red-50 text-red-700" :
                                                                            v.recommendation === "Recommended" ? "bg-emerald-50 text-emerald-700" :
                                                                                "bg-amber-50 text-amber-700"
                                                                    )}
                                                                >
                                                                    {v.recommendation}
                                                                </span>
                                                            </div>
                                                            {v.rationale && <p className="text-xs text-body">{v.rationale}</p>}
                                                            {v.timing && <p className="text-xs text-muted mt-1">Timing: {v.timing}</p>}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {m.medications && m.medications.length > 0 && (
                                            <div>
                                                <h3 className="text-sm font-semibold text-heading mb-2 flex items-center gap-2">
                                                    <LucidePill className="w-4 h-4 text-accent" />
                                                    Medications
                                                </h3>
                                                <div className="space-y-2">
                                                    {m.medications.map((med, i) => (
                                                        <div key={i} className="border border-border-light rounded-xl p-3">
                                                            <div className="flex items-center justify-between mb-1">
                                                                <p className="text-sm font-semibold text-heading">{med.name}</p>
                                                                {med.dosage && (
                                                                    <span className="text-xs text-muted">{med.dosage}</span>
                                                                )}
                                                            </div>
                                                            {med.indication && <p className="text-xs text-body">{med.indication}</p>}
                                                            {med.notes && <p className="text-xs text-muted mt-1">{med.notes}</p>}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {m.healthConsiderations && m.healthConsiderations.length > 0 && (
                                            <div>
                                                <h3 className="text-sm font-semibold text-heading mb-2 flex items-center gap-2">
                                                    <LucideShield className="w-4 h-4 text-accent" />
                                                    Health Considerations
                                                </h3>
                                                <div className="space-y-2">
                                                    {m.healthConsiderations.map((h, i) => (
                                                        <div key={i} className="border border-border-light rounded-xl p-3">
                                                            <p className="text-sm font-semibold text-heading mb-1">{h.category}</p>
                                                            <p className="text-xs text-body">{h.advice}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {m.travellerSpecific && (
                                            <div>
                                                <h3 className="text-sm font-semibold text-heading mb-2">Personalised Notes</h3>
                                                <p className="text-sm text-body leading-relaxed">{m.travellerSpecific}</p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {!content.members?.length && !content.tripSummary && !content.generalVaccinations?.length && (
                            <div className={cn(DASHBOARD_GLASS_SURFACE, "p-8 text-center")}>
                                <p className="text-sm text-muted">
                                    Plan is marked complete but content is empty. Please contact support.
                                </p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
