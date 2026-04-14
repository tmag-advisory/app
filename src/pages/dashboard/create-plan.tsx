import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useCreateTravelPlan } from "../../api/hooks";
import DashboardHeader from "../../components/dashboard/DashboardHeader";
import { DASHBOARD_GLASS_SURFACE, DashboardAmbientBackground } from "../../components/dashboard/dashboardChrome";
import toast from "react-hot-toast";
import PlanQuestionnaireFlow, { type QuestionnairePlanPayload } from "../../components/plan/PlanQuestionnaireFlow";

const CreatePlan = () => {
    const navigate = useNavigate();
    const { user, refreshProfile } = useAuth();
    const createPlan = useCreateTravelPlan();
    const credits = user?.credits ?? 0;

    const handleSubmit = async (payload: QuestionnairePlanPayload) => {
        if (credits <= 0) {
            toast.error("You don't have enough credits.");
            return;
        }
        try {
            const result = await createPlan.mutateAsync({
                destination: payload.destination,
                country: payload.country,
                duration: payload.duration,
                purpose: payload.purpose,
                tripType: payload.tripType,
                tripDetailsJson: payload.tripDetailsJson,
                medicalConsiderations: payload.medicalConsiderations,
                questionnaireResponses: JSON.stringify(payload.questionnaireResponses),
                userId: user?.id,
                status: "completed",
                riskScore: 1,
                vaccinations: "[]",
                healthAlerts: "[]",
                safetyAdvisories: "[]",
                medications: "[]",
                waterFood: "[]",
                emergencyContacts: "[]",
            });
            navigate(`/dashboard/plans/${result.id}`);
            await refreshProfile();
        } catch {
            toast.error("Failed to generate plan. Please try again.");
        }
    };

    return (
        <div className="relative">
            <DashboardAmbientBackground />
            <DashboardHeader title="Create travel plan" />
            {credits === 0 && (
                <div className="relative z-10 max-w-5xl mb-8">
                    <div className="bg-gold/10 border border-gold/20 rounded-2xl p-5 md:p-6">
                        <div className="flex items-start gap-3">
                            <div className="w-9 h-9 rounded-xl bg-gold/20 flex items-center justify-center shrink-0 mt-0.5">
                                <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-semibold text-heading mb-1">No credits remaining</p>
                                <p className="text-sm text-muted">
                                    <Link to="/dashboard/settings" className="text-accent font-medium cursor-pointer hover:underline decoration-2 underline-offset-2">
                                        Purchase more credits
                                    </Link>{" "}
                                    to generate a new plan.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="relative z-10 max-w-5xl mx-auto px-6 space-y-10">
                {/* Header Section */}
                <div className="text-center md:text-left pt-4">
                    <p className="text-[11px] uppercase tracking-[0.2em] font-semibold text-accent mb-3">
                        Travel Advisory Builder
                    </p>
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif text-heading leading-tight mb-4 tracking-tight">
                        Build your traveller profile
                    </h2>
                    <p className="text-sm md:text-base text-muted leading-relaxed max-w-2xl">
                        Work through each section carefully. The more detail you provide, the higher quality your plan will be.
                        Review all answers before spending a credit.
                    </p>
                </div>

                {/* Questionnaire Flow */}
                <div className={`${DASHBOARD_GLASS_SURFACE}`}>
                    <div className="p-8 md:p-12 lg:p-14">
                        <PlanQuestionnaireFlow
                            credits={credits}
                            isSubmitting={createPlan.isPending}
                            onSubmitPlan={handleSubmit}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreatePlan;
