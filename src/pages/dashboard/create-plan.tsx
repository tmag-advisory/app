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
                <div className="bg-gold/10 border border-gold/20 rounded-2xl p-4 mb-6 max-w-2xl">
                    <p className="text-sm text-heading font-medium">
                        You have no credits remaining.{" "}
                        <Link to="/dashboard/settings" className="text-accent cursor-pointer hover:underline">
                            Purchase more credits
                        </Link>{" "}
                        to generate a new plan.
                    </p>
                </div>
            )}

            <div className="relative z-10 max-w-5xl space-y-5">
                <div className={`${DASHBOARD_GLASS_SURFACE} p-6 md:p-8`}>
                    <p className="text-[11px] uppercase tracking-[0.14em] font-semibold text-accent mb-2">Travel Advisory Builder</p>
                    <h2 className="text-3xl md:text-4xl font-serif text-heading leading-tight mb-2">
                        Build a complete traveller profile before generation
                    </h2>
                    <p className="text-sm md:text-base text-muted leading-relaxed max-w-3xl">
                        Work through all sections to give TMAG enough context for a higher quality plan.
                        You can move back between questions at any time, then confirm everything in
                        <span className="font-semibold text-heading"> Verify Your Inputs</span> before spending a credit.
                    </p>
                </div>

                <div className={DASHBOARD_GLASS_SURFACE}>
                    <div className="p-6 md:p-8">
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
