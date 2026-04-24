import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
    ArrowLeft,
    User,
    MapPin,
    Clock,
    AlertTriangle,
    CheckCircle,
    XCircle,
    FileText,
    Loader2,
    Mail,
    Phone,
    Calendar,
    Shield,
    Pill,
    Plane,
    Stethoscope,
    Building2,
    Flag,
    ListChecks,
    Heart,
    Activity,
    Map,

    Info,
} from "lucide-react";
import { useDoctorValidationDetail, useValidatePlan } from "../../api/hooks";
import toast from "react-hot-toast";
import { cn } from "../../lib/utils";
import { DASHBOARD_GLASS_SURFACE } from "../../components/dashboard/dashboardChrome";

const DoctorValidationDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const planId = Number(id);
    const { data: plan, isLoading } = useDoctorValidationDetail(planId);
    const validateMutation = useValidatePlan();

    const [rejectionReason, setRejectionReason] = useState("");
    const [showRejectForm, setShowRejectForm] = useState(false);

    const handleApprove = () => {
        validateMutation.mutate(
            { planId, approved: true },
            {
                onSuccess: () => {
                    toast.success("Plan approved successfully");
                    navigate("/doctor/pending");
                },
                onError: () => {
                    toast.error("Failed to approve plan");
                },
            }
        );
    };

    const handleReject = () => {
        if (!rejectionReason.trim()) {
            toast.error("Please provide a rejection reason");
            return;
        }
        validateMutation.mutate(
            { planId, approved: false, rejectionReason },
            {
                onSuccess: () => {
                    toast.success("Plan rejected");
                    navigate("/doctor/pending");
                },
                onError: () => {
                    toast.error("Failed to reject plan");
                },
            }
        );
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 text-accent animate-spin" />
            </div>
        );
    }

    if (!plan) {
        return (
            <div className="text-center py-12">
                <p className="text-muted">Plan not found</p>
                <button
                    onClick={() => navigate("/doctor/pending")}
                    className="mt-4 text-accent hover:underline"
                >
                    Back to pending
                </button>
            </div>
        );
    }

    const isPending = plan.validationStatus === "PENDING";
    const planContent = plan.generatedPlanContent;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 rounded-lg hover:bg-button-secondary transition-colors"
                >
                    <ArrowLeft size={20} className="text-heading" />
                </button>
                <div>
                    <h1 className="text-2xl font-serif text-heading">
                        {plan.destination}, {plan.country}
                    </h1>
                    <p className="text-muted text-sm">
                        Plan #{plan.planId} &bull; {plan.planTier} tier
                    </p>
                </div>
                <span className={`ml-auto px-3 py-1 rounded-full text-sm font-medium ${
                    plan.validationStatus === "PENDING"
                        ? "bg-amber-50 text-amber-700"
                        : plan.validationStatus === "APPROVED"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-red-50 text-red-700"
                }`}>
                    {plan.validationStatus}
                </span>
            </div>

            {/* Traveller Info */}
            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(DASHBOARD_GLASS_SURFACE, "p-5")}
            >
                <h2 className="text-xs uppercase tracking-wider text-muted font-semibold mb-4">
                    Traveller Information
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-button-secondary rounded-lg">
                            <User size={18} className="text-muted" />
                        </div>
                        <div>
                            <p className="text-sm text-muted">Name</p>
                            <p className="font-medium text-heading">{plan.travellerName}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-button-secondary rounded-lg">
                            <Mail size={18} className="text-muted" />
                        </div>
                        <div>
                            <p className="text-sm text-muted">Email</p>
                            <p className="font-medium text-heading">{plan.travellerEmail}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-button-secondary rounded-lg">
                            <Phone size={18} className="text-muted" />
                        </div>
                        <div>
                            <p className="text-sm text-muted">Phone</p>
                            <p className="font-medium text-heading">{plan.travellerPhone || "—"}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-button-secondary rounded-lg">
                            <MapPin size={18} className="text-muted" />
                        </div>
                        <div>
                            <p className="text-sm text-muted">Purpose</p>
                            <p className="font-medium text-heading">{plan.purpose}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-button-secondary rounded-lg">
                            <Clock size={18} className="text-muted" />
                        </div>
                        <div>
                            <p className="text-sm text-muted">Duration</p>
                            <p className="font-medium text-heading">{plan.duration} days</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-button-secondary rounded-lg">
                            <Calendar size={18} className="text-muted" />
                        </div>
                        <div>
                            <p className="text-sm text-muted">Created</p>
                            <p className="font-medium text-heading">{new Date(plan.createdAt).toLocaleDateString()}</p>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Risk Score */}
            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className={cn(DASHBOARD_GLASS_SURFACE, "p-5")}
            >
                <div className="flex items-center gap-3 mb-3">
                    <AlertTriangle size={18} className="text-amber-500" />
                    <h2 className="text-xs uppercase tracking-wider text-muted font-semibold">
                        Risk Assessment
                    </h2>
                </div>
                <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold ${
                        plan.riskScore >= 7
                            ? "bg-red-50 text-red-600"
                            : plan.riskScore >= 4
                            ? "bg-amber-50 text-amber-600"
                            : "bg-emerald-50 text-emerald-600"
                    }`}>
                        {plan.riskScore}
                    </div>
                    <div>
                        <p className="font-medium text-heading">
                            {plan.riskScore >= 7
                                ? "High Risk"
                                : plan.riskScore >= 4
                                ? "Moderate Risk"
                                : "Low Risk"}
                        </p>
                        <p className="text-sm text-muted">Based on destination, duration, and health profile</p>
                    </div>
                </div>
            </motion.div>

            {/* ── Plan Content ─────────────────────────────────── */}

            {/* Trip at a Glance */}
            {planContent?.tripAtGlance && (
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.08 }}
                    className={cn(DASHBOARD_GLASS_SURFACE, "p-5")}
                >
                    <div className="flex items-center gap-3 mb-4">
                        <Map size={18} className="text-accent" />
                        <h2 className="text-xs uppercase tracking-wider text-muted font-semibold">Trip at a Glance</h2>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 text-sm">
                        {planContent.tripAtGlance.durationDays != null && (
                            <div><p className="text-muted">Duration</p><p className="font-medium text-heading">{planContent.tripAtGlance.durationDays} days</p></div>
                        )}
                        {planContent.tripAtGlance.purpose && (
                            <div><p className="text-muted">Purpose</p><p className="font-medium text-heading">{planContent.tripAtGlance.purpose}</p></div>
                        )}
                        {planContent.tripAtGlance.travelling && (
                            <div><p className="text-muted">Travelling</p><p className="font-medium text-heading">{planContent.tripAtGlance.travelling}</p></div>
                        )}
                        {planContent.tripAtGlance.accommodation && (
                            <div><p className="text-muted">Accommodation</p><p className="font-medium text-heading">{planContent.tripAtGlance.accommodation}</p></div>
                        )}
                        {planContent.tripAtGlance.insurance && (
                            <div><p className="text-muted">Insurance</p><p className="font-medium text-heading">{planContent.tripAtGlance.insurance}</p></div>
                        )}
                    </div>
                    {planContent.travelDates && (
                        <p className="mt-3 text-sm text-muted">{planContent.travelDates}</p>
                    )}
                    {planContent.overallRiskLevel && (
                        <div className="mt-3 flex items-center gap-2">
                            <span className="text-sm text-muted">Overall Risk:</span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                                planContent.overallRiskLevel === "HIGH" ? "bg-red-50 text-red-700" :
                                planContent.overallRiskLevel === "MODERATE" ? "bg-amber-50 text-amber-700" :
                                "bg-emerald-50 text-emerald-700"
                            }`}>{planContent.overallRiskLevel}</span>
                        </div>
                    )}
                </motion.div>
            )}

            {/* Health Risk Overview */}
            {planContent?.healthRiskOverview && planContent.healthRiskOverview.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className={cn(DASHBOARD_GLASS_SURFACE, "p-5")}
                >
                    <div className="flex items-center gap-3 mb-4">
                        <AlertTriangle size={18} className="text-amber-500" />
                        <h2 className="text-xs uppercase tracking-wider text-muted font-semibold">Health Risk Overview</h2>
                    </div>
                    <div className="space-y-2">
                        {planContent.healthRiskOverview.map((risk, i) => (
                            <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-background-secondary/50">
                                <span className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${
                                    risk.level === "HIGH" ? "bg-red-500" :
                                    risk.level === "MODERATE" ? "bg-amber-500" : "bg-emerald-500"
                                }`} />
                                <div>
                                    <p className="font-medium text-sm text-heading">{risk.category}</p>
                                    <p className="text-sm text-muted">{risk.summary}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Vaccinations */}
            {planContent?.vaccinations && planContent.vaccinations.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.12 }}
                    className={cn(DASHBOARD_GLASS_SURFACE, "p-5")}
                >
                    <div className="flex items-center gap-3 mb-4">
                        <Shield size={18} className="text-accent" />
                        <h2 className="text-xs uppercase tracking-wider text-muted font-semibold">Vaccinations</h2>
                    </div>
                    <div className="space-y-3">
                        {planContent.vaccinations.map((v, i) => (
                            <div key={i} className="p-3 rounded-xl bg-background-secondary/50">
                                <div className="flex items-center justify-between mb-1">
                                    <p className="font-medium text-sm text-heading">{v.vaccine}</p>
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                        v.recommendation.includes("Strongly") ? "bg-red-50 text-red-700" :
                                        v.recommendation.includes("Recommended") ? "bg-amber-50 text-amber-700" :
                                        v.recommendation.includes("Not") ? "bg-gray-50 text-gray-500" :
                                        "bg-blue-50 text-blue-700"
                                    }`}>{v.recommendation}</span>
                                </div>
                                <p className="text-xs text-muted mb-1">Status: {v.status}</p>
                                <p className="text-xs text-muted">{v.action}</p>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Malaria Prevention */}
            {planContent?.malariaPrevention && (
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.14 }}
                    className={cn(DASHBOARD_GLASS_SURFACE, "p-5")}
                >
                    <div className="flex items-center gap-3 mb-4">
                        <Pill size={18} className="text-accent" />
                        <h2 className="text-xs uppercase tracking-wider text-muted font-semibold">Malaria Prevention</h2>
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                        <span className="text-sm text-muted">Risk Level:</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                            planContent.malariaPrevention?.riskLevel === "HIGH" ? "bg-red-50 text-red-700" :
                            planContent.malariaPrevention?.riskLevel === "MODERATE" ? "bg-amber-50 text-amber-700" :
                            "bg-emerald-50 text-emerald-700"
                        }`}>{planContent.malariaPrevention?.riskLevel}</span>
                    </div>
                    {planContent.malariaPrevention?.recommendedAgent && (
                        <div className="mb-3">
                            <p className="text-sm text-muted">Recommended Agent</p>
                            <p className="font-medium text-sm text-heading">{planContent.malariaPrevention.recommendedAgent}</p>
                        </div>
                    )}
                    {planContent.malariaPrevention?.rationale && (
                        <p className="text-sm text-muted mb-3">{planContent.malariaPrevention.rationale}</p>
                    )}
                    {planContent.malariaPrevention?.mosquitoProtection && planContent.malariaPrevention.mosquitoProtection.length > 0 && (
                        <div>
                            <p className="text-sm font-medium text-heading mb-2">Mosquito Protection</p>
                            <ul className="space-y-1">
                                {planContent.malariaPrevention.mosquitoProtection.map((m, i) => (
                                    <li key={i} className="flex items-start gap-2 text-xs text-muted">
                                        <span className="mt-1 w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                                        {m}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    {planContent.malariaPrevention?.contraindications && (
                        <p className="mt-3 text-xs text-muted italic">{planContent.malariaPrevention.contraindications}</p>
                    )}
                </motion.div>
            )}

            {/* Recommendations */}
            {planContent?.recommendations && planContent.recommendations.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.16 }}
                    className={cn(DASHBOARD_GLASS_SURFACE, "p-5")}
                >
                    <div className="flex items-center gap-3 mb-4">
                        <ListChecks size={18} className="text-accent" />
                        <h2 className="text-xs uppercase tracking-wider text-muted font-semibold">Recommendations</h2>
                    </div>
                    <ul className="space-y-3">
                        {planContent.recommendations.map((r, i) => (
                            <li key={i} className="p-3 rounded-xl bg-background-secondary/50">
                                <p className="font-medium text-sm text-heading">{r.title}</p>
                                <p className="text-sm text-muted mt-1">{r.details}</p>
                            </li>
                        ))}
                    </ul>
                </motion.div>
            )}

            {/* Clinical Flags */}
            {planContent?.clinicalFlags && planContent.clinicalFlags.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.18 }}
                    className={cn(DASHBOARD_GLASS_SURFACE, "p-5")}
                >
                    <div className="flex items-center gap-3 mb-4">
                        <Flag size={18} className="text-red-500" />
                        <h2 className="text-xs uppercase tracking-wider text-muted font-semibold">Clinical Flags</h2>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {planContent.clinicalFlags.map((flag, i) => (
                            <span key={i} className="px-2.5 py-1 rounded-full bg-red-50 text-red-700 text-xs font-medium">
                                {flag}
                            </span>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Specialist Referrals */}
            {planContent?.specialistReferrals && planContent.specialistReferrals.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className={cn(DASHBOARD_GLASS_SURFACE, "p-5")}
                >
                    <div className="flex items-center gap-3 mb-4">
                        <Stethoscope size={18} className="text-accent" />
                        <h2 className="text-xs uppercase tracking-wider text-muted font-semibold">Specialist Referrals</h2>
                    </div>
                    <div className="space-y-3">
                        {planContent.specialistReferrals.map((ref, i) => (
                            <div key={i} className="p-3 rounded-xl bg-background-secondary/50">
                                <div className="flex items-center justify-between mb-1">
                                    <p className="font-medium text-sm text-heading">{ref.specialist}</p>
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                        ref.urgency === "BEFORE_TRAVEL" ? "bg-amber-50 text-amber-700" :
                                        ref.urgency === "URGENT" ? "bg-red-50 text-red-700" :
                                        "bg-blue-50 text-blue-700"
                                    }`}>{ref.urgency.replace(/_/g, " ")}</span>
                                </div>
                                <p className="text-xs text-muted">{ref.condition}</p>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Flight Health */}
            {planContent?.flightHealth && (
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.22 }}
                    className={cn(DASHBOARD_GLASS_SURFACE, "p-5")}
                >
                    <div className="flex items-center gap-3 mb-4">
                        <Plane size={18} className="text-accent" />
                        <h2 className="text-xs uppercase tracking-wider text-muted font-semibold">Flight Health</h2>
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                        <span className="text-sm text-muted">VTE Risk:</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                            planContent.flightHealth?.vteRiskLevel === "HIGH" ? "bg-red-50 text-red-700" :
                            planContent.flightHealth?.vteRiskLevel === "MEDIUM" ? "bg-amber-50 text-amber-700" :
                            "bg-emerald-50 text-emerald-700"
                        }`}>{planContent.flightHealth?.vteRiskLevel}</span>
                    </div>
                    {planContent.flightHealth?.preventionMeasures && planContent.flightHealth.preventionMeasures.length > 0 && (
                        <ul className="space-y-1 mb-3">
                            {planContent.flightHealth.preventionMeasures.map((m, i) => (
                                <li key={i} className="flex items-start gap-2 text-xs text-muted">
                                    <span className="mt-1 w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                                    {m}
                                </li>
                            ))}
                        </ul>
                    )}
                    {planContent.flightHealth?.medicationTimingGuidance && (
                        <p className="text-xs text-muted">{planContent.flightHealth.medicationTimingGuidance}</p>
                    )}
                </motion.div>
            )}

            {/* Contraindications */}
            {planContent?.contraindications && planContent.contraindications.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.24 }}
                    className={cn(DASHBOARD_GLASS_SURFACE, "p-5")}
                >
                    <div className="flex items-center gap-3 mb-4">
                        <AlertTriangle size={18} className="text-red-500" />
                        <h2 className="text-xs uppercase tracking-wider text-muted font-semibold">Contraindications</h2>
                    </div>
                    <ul className="space-y-1">
                        {planContent.contraindications.map((c, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-muted">
                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                                {c}
                            </li>
                        ))}
                    </ul>
                </motion.div>
            )}

            {/* Sexual Health */}
            {planContent?.sexualHealth && (
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.26 }}
                    className={cn(DASHBOARD_GLASS_SURFACE, "p-5")}
                >
                    <div className="flex items-center gap-3 mb-4">
                        <Heart size={18} className="text-accent" />
                        <h2 className="text-xs uppercase tracking-wider text-muted font-semibold">Sexual Health</h2>
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                        <span className="text-sm text-muted">Risk Level:</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                            planContent.sexualHealth?.riskLevel === "HIGH" ? "bg-red-50 text-red-700" :
                            planContent.sexualHealth?.riskLevel === "MODERATE" ? "bg-amber-50 text-amber-700" :
                            "bg-emerald-50 text-emerald-700"
                        }`}>{planContent.sexualHealth?.riskLevel}</span>
                    </div>
                    {planContent.sexualHealth?.preventionAdvice && planContent.sexualHealth.preventionAdvice.length > 0 && (
                        <ul className="space-y-1">
                            {planContent.sexualHealth.preventionAdvice.map((a, i) => (
                                <li key={i} className="flex items-start gap-2 text-xs text-muted">
                                    <span className="mt-1 w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                                    {a}
                                </li>
                            ))}
                        </ul>
                    )}
                </motion.div>
            )}

            {/* Medical Conditions */}
            {planContent?.medicalConditions && planContent.medicalConditions.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.28 }}
                    className={cn(DASHBOARD_GLASS_SURFACE, "p-5")}
                >
                    <div className="flex items-center gap-3 mb-4">
                        <Activity size={18} className="text-accent" />
                        <h2 className="text-xs uppercase tracking-wider text-muted font-semibold">Medical Conditions</h2>
                    </div>
                    <ul className="space-y-1">
                        {planContent.medicalConditions.map((c, i) => (
                            <li key={i} className="p-3 rounded-xl bg-background-secondary/50">
                                <p className="font-medium text-sm text-heading">{c.condition}</p>
                                <p className="text-xs text-muted">{c.precautions}</p>
                            </li>
                        ))}
                    </ul>
                </motion.div>
            )}

            {/* Medication Logistics */}
            {planContent?.medicationLogistics && (
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className={cn(DASHBOARD_GLASS_SURFACE, "p-5")}
                >
                    <div className="flex items-center gap-3 mb-4">
                        <Pill size={18} className="text-accent" />
                        <h2 className="text-xs uppercase tracking-wider text-muted font-semibold">Medication Logistics</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                        {planContent.medicationLogistics?.packaging && (
                            <div><p className="text-muted">Packaging</p><p className="font-medium text-heading text-xs">{planContent.medicationLogistics.packaging}</p></div>
                        )}
                        {planContent.medicationLogistics?.supplyRule && (
                            <div><p className="text-muted">Supply Rule</p><p className="font-medium text-heading text-xs">{planContent.medicationLogistics.supplyRule}</p></div>
                        )}
                        {planContent.medicationLogistics?.destinationLegalityCheck != null && (
                            <div><p className="text-muted">Destination Legality Check</p><p className="font-medium text-heading">{planContent.medicationLogistics.destinationLegalityCheck ? "Yes" : "No"}</p></div>
                        )}
                        {planContent.medicationLogistics?.coldChainRequired != null && (
                            <div><p className="text-muted">Cold Chain Required</p><p className="font-medium text-heading">{planContent.medicationLogistics.coldChainRequired ? "Yes" : "No"}</p></div>
                        )}
                    </div>
                </motion.div>
            )}

            {/* After Return */}
            {planContent?.afterReturn && (
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.32 }}
                    className={cn(DASHBOARD_GLASS_SURFACE, "p-5")}
                >
                    <div className="flex items-center gap-3 mb-4">
                        <Calendar size={18} className="text-accent" />
                        <h2 className="text-xs uppercase tracking-wider text-muted font-semibold">After Return</h2>
                    </div>
                    {planContent.afterReturn?.redFlag && (
                        <div className="p-3 rounded-xl bg-red-50 mb-4">
                            <p className="text-red-700 font-semibold text-sm">{planContent.afterReturn.redFlag}</p>
                        </div>
                    )}
                    {planContent.afterReturn?.within1Week && planContent.afterReturn.within1Week.length > 0 && (
                        <div className="mb-3">
                            <p className="font-medium text-sm text-heading mb-2">Within 1 Week</p>
                            <ul className="space-y-1">
                                {planContent.afterReturn.within1Week.map((item, i) => (
                                    <li key={i} className="flex items-start gap-2 text-xs text-muted">
                                        <span className="mt-1 w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    {planContent.afterReturn?.within4Weeks && planContent.afterReturn.within4Weeks.length > 0 && (
                        <div className="mb-3">
                            <p className="font-medium text-sm text-heading mb-2">Within 4 Weeks</p>
                            <ul className="space-y-1">
                                {planContent.afterReturn.within4Weeks.map((item, i) => (
                                    <li key={i} className="flex items-start gap-2 text-xs text-muted">
                                        <span className="mt-1 w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    {planContent.afterReturn?.beyond4Weeks && planContent.afterReturn.beyond4Weeks.length > 0 && (
                        <div>
                            <p className="font-medium text-sm text-heading mb-2">Beyond 4 Weeks</p>
                            <ul className="space-y-1">
                                {planContent.afterReturn.beyond4Weeks.map((item, i) => (
                                    <li key={i} className="flex items-start gap-2 text-xs text-muted">
                                        <span className="mt-1 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </motion.div>
            )}

            {/* Medical Care */}
            {planContent?.medicalCare && (
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.34 }}
                    className={cn(DASHBOARD_GLASS_SURFACE, "p-5")}
                >
                    <div className="flex items-center gap-3 mb-4">
                        <Building2 size={18} className="text-accent" />
                        <h2 className="text-xs uppercase tracking-wider text-muted font-semibold">Medical Care & Contacts</h2>
                    </div>

                    {planContent.medicalCare?.clinics && planContent.medicalCare.clinics.length > 0 && (
                        <div className="mb-4">
                            <p className="font-medium text-sm text-heading mb-2">Clinics & Hospitals</p>
                            <div className="space-y-2">
                                {planContent.medicalCare.clinics.map((c, i) => (
                                    <div key={i} className="p-3 rounded-xl bg-background-secondary/50">
                                        <p className="font-medium text-sm text-heading">{c.name}</p>
                                        <p className="text-xs text-muted">{c.address}</p>
                                        <p className="text-xs text-muted">{c.phone} &bull; {c.distance}</p>
                                        {c.notes && <p className="text-xs text-muted mt-1">{c.notes}</p>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {planContent.medicalCare?.embassyContacts && planContent.medicalCare.embassyContacts.length > 0 && (
                        <div className="mb-4">
                            <p className="font-medium text-sm text-heading mb-2">Embassy Contacts</p>
                            <div className="space-y-2">
                                {planContent.medicalCare.embassyContacts.map((e, i) => (
                                    <div key={i} className="p-3 rounded-xl bg-background-secondary/50">
                                        <p className="font-medium text-sm text-heading">{e.name}</p>
                                        <p className="text-xs text-muted">{e.details}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {planContent.medicalCare?.emergencyContacts && planContent.medicalCare.emergencyContacts.length > 0 && (
                        <div>
                            <p className="font-medium text-sm text-heading mb-2">Emergency Contacts</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {planContent.medicalCare.emergencyContacts.map((ec, i) => (
                                    <div key={i} className="p-3 rounded-xl bg-background-secondary/50">
                                        <p className="text-xs text-muted">{ec.label}</p>
                                        <p className="font-medium text-sm text-heading">{ec.value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </motion.div>
            )}

            {/* Itinerary Guidance */}
            {planContent?.itineraryGuidance && (
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.36 }}
                    className={cn(DASHBOARD_GLASS_SURFACE, "p-5")}
                >
                    <div className="flex items-center gap-3 mb-4">
                        <Map size={18} className="text-accent" />
                        <h2 className="text-xs uppercase tracking-wider text-muted font-semibold">Itinerary Guidance</h2>
                    </div>
                    {planContent.itineraryGuidance?.tripType && (
                        <p className="text-sm text-muted mb-2">Trip Type: <span className="font-medium text-heading">{planContent.itineraryGuidance.tripType.replace(/_/g, " ")}</span></p>
                    )}
                    {planContent.itineraryGuidance?.summary && (
                        <p className="text-sm text-muted mb-3">{planContent.itineraryGuidance.summary}</p>
                    )}
                    {planContent.itineraryGuidance?.routeAdvice && planContent.itineraryGuidance.routeAdvice.length > 0 && (
                        <div className="space-y-2">
                            {planContent.itineraryGuidance.routeAdvice.map((r, i) => (
                                <div key={i} className="p-3 rounded-xl bg-background-secondary/50">
                                    <p className="font-medium text-sm text-heading">{r.stop}, {r.country}</p>
                                    <p className="text-xs text-muted mt-1">{r.guidance}</p>
                                </div>
                            ))}
                        </div>
                    )}
                    {planContent.itineraryGuidance?.returnGuidance && planContent.itineraryGuidance.returnGuidance.length > 0 && (
                        <div className="mt-3">
                            <p className="font-medium text-sm text-heading mb-2">Return Guidance</p>
                            <ul className="space-y-1">
                                {planContent.itineraryGuidance.returnGuidance.map((g, i) => (
                                    <li key={i} className="flex items-start gap-2 text-xs text-muted">
                                        <span className="mt-1 w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                                        {g}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </motion.div>
            )}

            {/* Next Steps */}
            {planContent?.nextSteps && planContent.nextSteps.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.38 }}
                    className={cn(DASHBOARD_GLASS_SURFACE, "p-5")}
                >
                    <div className="flex items-center gap-3 mb-4">
                        <ListChecks size={18} className="text-accent" />
                        <h2 className="text-xs uppercase tracking-wider text-muted font-semibold">Next Steps</h2>
                    </div>
                    <ol className="space-y-2">
                        {planContent.nextSteps.map((step, i) => (
                            <li key={i} className="flex items-start gap-3 text-sm">
                                <span className="mt-0.5 w-5 h-5 rounded-full bg-accent/10 text-accent text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                                <span className="text-muted">{step}</span>
                            </li>
                        ))}
                    </ol>
                </motion.div>
            )}

            {/* Medical Disclaimer */}
            {planContent?.medicalDisclaimer && (
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className={cn(DASHBOARD_GLASS_SURFACE, "p-5")}
                >
                    <div className="flex items-center gap-3 mb-3">
                        <Info size={18} className="text-muted" />
                        <h2 className="text-xs uppercase tracking-wider text-muted font-semibold">Medical Disclaimer</h2>
                    </div>
                    <p className="text-xs text-muted leading-relaxed">{planContent.medicalDisclaimer}</p>
                </motion.div>
            )}

            {/* Signed PDF Download */}
            {plan.generatedPlan?.signedPdfUrl && (
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.42 }}
                    className={cn(DASHBOARD_GLASS_SURFACE, "p-5")}
                >
                    <a
                        href={plan.generatedPlan.signedPdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-accent hover:underline text-sm font-medium"
                    >
                        <FileText size={16} />
                        Download Signed PDF
                    </a>
                </motion.div>
            )}

            {/* Validation Actions */}
            {isPending && (
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className={cn(DASHBOARD_GLASS_SURFACE, "p-5")}
                >
                    <h2 className="text-xs uppercase tracking-wider text-muted font-semibold mb-4">
                        Validation Decision
                    </h2>

                    {!showRejectForm ? (
                        <div className="flex gap-3">
                            <button
                                onClick={handleApprove}
                                disabled={validateMutation.isPending}
                                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
                            >
                                {validateMutation.isPending ? (
                                    <Loader2 size={18} className="animate-spin" />
                                ) : (
                                    <CheckCircle size={18} />
                                )}
                                Approve Plan
                            </button>
                            <button
                                onClick={() => setShowRejectForm(true)}
                                disabled={validateMutation.isPending}
                                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl font-medium transition-colors disabled:opacity-50"
                            >
                                <XCircle size={18} />
                                Reject Plan
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <textarea
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                placeholder="Provide a reason for rejecting this plan..."
                                rows={3}
                                className="w-full px-4 py-3 rounded-xl border border-border-light bg-white text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 resize-none"
                            />
                            <div className="flex gap-3">
                                <button
                                    onClick={handleReject}
                                    disabled={validateMutation.isPending}
                                    className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
                                >
                                    {validateMutation.isPending ? (
                                        <Loader2 size={18} className="animate-spin" />
                                    ) : (
                                        <XCircle size={18} />
                                    )}
                                    Confirm Rejection
                                </button>
                                <button
                                    onClick={() => {
                                        setShowRejectForm(false);
                                        setRejectionReason("");
                                    }}
                                    disabled={validateMutation.isPending}
                                    className="px-6 py-3 rounded-xl border border-border-light text-muted font-medium hover:bg-button-secondary transition-colors disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}
                </motion.div>
            )}

            {/* Validation History */}
            {!isPending && (
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(DASHBOARD_GLASS_SURFACE, "p-5")}
                >
                    <h2 className="text-xs uppercase tracking-wider text-muted font-semibold mb-4">
                        Validation History
                    </h2>
                    <div className="space-y-2 text-sm">
                        <p className="text-muted">
                            Validated by: <span className="font-medium text-heading">{plan.validatedByName}</span>
                        </p>
                        <p className="text-muted">
                            Date: <span className="font-medium text-heading">
                                {plan.validatedAt ? new Date(plan.validatedAt).toLocaleString() : "N/A"}
                            </span>
                        </p>
                        {plan.rejectionReason && (
                            <div className="mt-3 p-3 rounded-xl bg-red-50">
                                <p className="text-red-700 font-medium">Rejection Reason:</p>
                                <p className="text-red-600">{plan.rejectionReason}</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default DoctorValidationDetail;
