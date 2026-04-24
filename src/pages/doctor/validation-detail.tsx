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
} from "lucide-react";
import { useDoctorValidationDetail, useValidatePlan } from "../../api/hooks";
import toast from "react-hot-toast";

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
                <p className="text-gray-500">Plan not found</p>
                <button
                    onClick={() => navigate("/doctor/pending")}
                    className="mt-4 text-[#008080] hover:underline"
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
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        {plan.destination}, {plan.country}
                    </h1>
                    <p className="text-gray-500 text-sm">
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
                className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm"
            >
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                    Traveller Information
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-50 rounded-lg">
                            <User size={18} className="text-gray-500" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Name</p>
                            <p className="font-medium text-gray-900">{plan.travellerName}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-50 rounded-lg">
                            <MapPin size={18} className="text-gray-500" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Purpose</p>
                            <p className="font-medium text-gray-900">{plan.purpose}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-50 rounded-lg">
                            <Clock size={18} className="text-gray-500" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Duration</p>
                            <p className="font-medium text-gray-900">{plan.duration} days</p>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Risk Score */}
            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm"
            >
                <div className="flex items-center gap-3 mb-3">
                    <AlertTriangle size={18} className="text-amber-500" />
                    <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
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
                        <p className="font-medium text-gray-900">
                            {plan.riskScore >= 7
                                ? "High Risk"
                                : plan.riskScore >= 4
                                ? "Moderate Risk"
                                : "Low Risk"}
                        </p>
                        <p className="text-sm text-gray-500">Based on destination, duration, and health profile</p>
                    </div>
                </div>
            </motion.div>

            {/* Generated Plan Content */}
            {planContent && (
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-6"
                >
                    <div className="flex items-center gap-3">
                        <FileText size={18} className="text-[#008080]" />
                        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                            Generated Plan Summary
                        </h2>
                    </div>

                    {planContent.healthRiskOverview && planContent.healthRiskOverview.length > 0 && (
                        <div>
                            <h3 className="font-medium text-gray-900 mb-2">Health Risk Overview</h3>
                            <div className="space-y-2">
                                {planContent.healthRiskOverview.map((risk, i) => (
                                    <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50">
                                        <span className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${
                                            risk.level === "High" ? "bg-red-500" :
                                            risk.level === "Moderate" ? "bg-amber-500" : "bg-emerald-500"
                                        }`} />
                                        <div>
                                            <p className="font-medium text-sm text-gray-900">{risk.category}</p>
                                            <p className="text-sm text-gray-500">{risk.summary}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {planContent.vaccinations && planContent.vaccinations.length > 0 && (
                        <div>
                            <h3 className="font-medium text-gray-900 mb-2">Vaccinations</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {planContent.vaccinations.map((v, i) => (
                                    <div key={i} className="p-3 rounded-xl bg-gray-50 text-sm">
                                        <p className="font-medium text-gray-900">{v.vaccine}</p>
                                        <p className="text-gray-500">{v.status} &bull; {v.recommendation}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {planContent.recommendations && planContent.recommendations.length > 0 && (
                        <div>
                            <h3 className="font-medium text-gray-900 mb-2">Recommendations</h3>
                            <ul className="space-y-2">
                                {planContent.recommendations.map((r, i) => (
                                    <li key={i} className="flex items-start gap-2 text-sm">
                                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#008080] shrink-0" />
                                        <div>
                                            <p className="font-medium text-gray-900">{r.title}</p>
                                            <p className="text-gray-500">{r.details}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </motion.div>
            )}

            {/* Validation Actions */}
            {isPending && (
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm"
                >
                    <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
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
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 resize-none"
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
                                    className="px-6 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
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
                    className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm"
                >
                    <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                        Validation History
                    </h2>
                    <div className="space-y-2 text-sm">
                        <p className="text-gray-500">
                            Validated by: <span className="font-medium text-gray-900">{plan.validatedByName}</span>
                        </p>
                        <p className="text-gray-500">
                            Date: <span className="font-medium text-gray-900">
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
