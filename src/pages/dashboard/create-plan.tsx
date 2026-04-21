import { useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { LucideClipboardList, LucideX } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import {
    useCreateTravelPlan,
    useDraftPlans,
    useCreateDraftPlan,
    useUpdateDraftPlan,
    useDeleteDraftPlan,
    useOnboardingQuestions,
} from "../../api/hooks";
import DashboardHeader from "../../components/dashboard/DashboardHeader";
import { DashboardAmbientBackground } from "../../components/dashboard/dashboardChrome";
import QuestionnaireProgressBanner from "../../components/dashboard/QuestionnaireProgressBanner";
import toast from "react-hot-toast";
import PlanQuestionnaireFlow from "../../components/plan/PlanQuestionnaireFlow";
import type { QuestionnairePlanPayload } from "../../components/plan/PlanQuestionnaireFlow";
import type { DraftPlanResponse, SaveDraftPlanRequest } from "../../api/types";
import {
    PlanQuestionnaireModalShell,
    type PlanQuestionnaireCategory,
} from "../../components/plan/CreatePlanQuestionnaireShell";

// ─── Draft Banner ──────────────────────────────────────────────

interface DraftBannerProps {
    draft: DraftPlanResponse;
    onResume: () => void;
    onDiscard: () => void;
}

function DraftBanner({ draft, onResume, onDiscard }: DraftBannerProps) {
    const dateStr = new Date(draft.updatedAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });

    return (
        <div className="rounded-2xl border-2 border-accent/30 bg-accent/5 p-5 md:p-6">
            <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center shrink-0 mt-0.5">
                    <LucideClipboardList className="w-5 h-5 text-accent" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-heading mb-1">Continue where you left off?</p>
                    <p className="text-sm text-muted leading-relaxed">
                        You have a saved draft{draft.country ? ` for ${draft.country}` : ""} from{" "}
                        <strong className="text-heading">{dateStr}</strong>.
                    </p>
                </div>
            </div>
            <div className="flex items-center gap-3 mt-4">
                <button
                    type="button"
                    onClick={onResume}
                    className="inline-flex items-center gap-2 py-2 px-4 rounded-xl bg-dark text-white text-sm font-semibold hover:bg-darkest transition-colors cursor-pointer"
                >
                    Continue saved plan
                </button>
                <button
                    type="button"
                    onClick={onDiscard}
                    className="inline-flex items-center gap-2 py-2 px-4 rounded-xl border-2 border-border-light/60 text-sm text-muted font-semibold hover:text-heading hover:border-border transition-colors cursor-pointer"
                >
                    Start fresh
                </button>
            </div>
        </div>
    );
}

// ─── Main Create Plan Component ────────────────────────────────

const CreatePlan = () => {
    const navigate = useNavigate();
    const { user, refreshProfile } = useAuth();
    const createPlan = useCreateTravelPlan();
    const credits = user?.credits ?? 0;

    // Draft support
    const { data: drafts, isLoading: draftsLoading } = useDraftPlans();
    const createDraft = useCreateDraftPlan();
    const updateDraft = useUpdateDraftPlan();
    const deleteDraft = useDeleteDraftPlan();

    // Categories for sidebar
    const { data: categoriesRaw } = useOnboardingQuestions();

    const [sidebarState, setSidebarState] = useState({
        answers: {} as Record<string, unknown>,
        categoryIndex: 0,
        showVerify: false,
        showIntro: true,
        riskConsentGiven: false,
    });
    const [modalOpen, setModalOpen] = useState(false);

    const activeDrafts = useMemo(() => drafts ?? [], [drafts]);
    const activeDraft = activeDrafts[0];
    const [draftResumed, setDraftResumed] = useState(false);
    const [savingDraft, setSavingDraft] = useState(false);

    const categories = useMemo(
        () =>
            ((categoriesRaw as PlanQuestionnaireCategory[] | undefined) ?? []).map((cat) => ({
                ...cat,
                parsedQuestions:
                    typeof cat.questions === "string" ? JSON.parse(cat.questions) : cat.questions,
            })),
        [categoriesRaw]
    );

    // Calculate progress
    const totalSections = categories.length;
    const completedSections = sidebarState.showVerify ? totalSections : sidebarState.categoryIndex;
    const progressPercent = totalSections > 0 ? Math.round((completedSections / totalSections) * 100) : 0;

    // Parse draft answers
    const draftAnswers = useMemo(() => {
        if (!activeDraft?.answersJson) return {};
        try {
            return JSON.parse(activeDraft.answersJson) as Record<string, unknown>;
        } catch {
            return {};
        }
    }, [activeDraft]);

    // ─── Handlers ──────────────────────────────────────────

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
            // Delete draft if we had one
            if (activeDraft) {
                await deleteDraft.mutateAsync(activeDraft.id);
            }
            setModalOpen(false);
            navigate(`/dashboard/plans/${result.id}`);
            await refreshProfile();
        } catch {
            toast.error("Failed to generate plan. Please try again.");
        }
    };

    const handleResumeDraft = () => {
        setDraftResumed(true);
        setModalOpen(true);
        toast.success("Draft restored! You can continue where you left off.");
    };

    const handleStartFresh = async () => {
        if (activeDraft) {
            await deleteDraft.mutateAsync(activeDraft.id);
        }
        setDraftResumed(false);
        setModalOpen(true);
    };

    const handleSaveDraft = async () => {
        setSavingDraft(true);
        try {
            const country = typeof sidebarState.answers.travel_countries === "object"
                ? (sidebarState.answers.travel_countries as string[])[0] ?? ""
                : typeof sidebarState.answers.country === "string"
                    ? sidebarState.answers.country
                    : "";

            const draftRequest: SaveDraftPlanRequest = {
                country,
                answersJson: JSON.stringify(sidebarState.answers),
                categoryIndex: sidebarState.categoryIndex,
                showVerify: sidebarState.showVerify,
                showIntro: sidebarState.showIntro,
                riskConsentGiven: sidebarState.riskConsentGiven,
            };

            if (activeDraft) {
                await updateDraft.mutateAsync({ id: activeDraft.id, data: draftRequest });
            } else {
                await createDraft.mutateAsync(draftRequest);
            }
            toast.success("Draft saved! You can resume anytime.", { id: "draft-saved" });
        } catch {
            toast.error("Failed to save draft.", { id: "draft-save-error" });
        } finally {
            setSavingDraft(false);
        }
    };

    const handleStateChange = useCallback((state: typeof sidebarState) => {
        setSidebarState(state);
    }, []);

    const handleSaveAndExit = async () => {
        await handleSaveDraft();
        setModalOpen(false);
    };

    // ─── Render ────────────────────────────────────────────

    return (
        <div className="relative min-h-screen">
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
                                    Purchase more credits to generate a new plan.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="relative z-10">
                <div className="max-w-5xl mx-auto px-6 pt-4 pb-10 md:px-12">
                    <div className="text-center md:text-left">
                        <p className="text-[11px] uppercase tracking-[0.2em] font-semibold text-accent mb-3">
                            Travel Advisory Builder
                        </p>
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif text-heading leading-tight mb-4 tracking-tight">
                            Build your traveller profile
                        </h2>
                        <p className="text-sm md:text-base text-muted leading-relaxed max-w-2xl">
                            Save your progress at any point and continue later when you are ready to generate a plan.
                        </p>
                    </div>
                </div>

                <div className="max-w-5xl mx-auto px-6 pb-14 md:px-12">
                    <QuestionnaireProgressBanner />
                    {activeDraft && !draftsLoading ? (
                        <DraftBanner draft={activeDraft} onResume={handleResumeDraft} onDiscard={() => void handleStartFresh()} />
                    ) : (
                        <button
                            type="button"
                            onClick={() => {
                                setDraftResumed(false);
                                setModalOpen(true);
                            }}
                            className="inline-flex items-center gap-2 py-2.5 px-5 rounded-xl bg-dark text-white text-sm font-semibold hover:bg-darkest transition-colors cursor-pointer"
                        >
                            Start plan
                        </button>
                    )}
                </div>
            </div>

            <PlanQuestionnaireModalShell
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                categories={categories}
                categoryIndex={sidebarState.categoryIndex}
                showVerify={sidebarState.showVerify}
                progressPercent={progressPercent}
                headerEndSlot={
                    <div className="flex items-center gap-4">
                        <button
                            type="button"
                            onClick={() => void handleSaveAndExit()}
                            disabled={savingDraft}
                            className="text-xs font-medium text-muted hover:text-heading transition-colors cursor-pointer disabled:opacity-40"
                        >
                            {savingDraft ? "Saving..." : "Save & exit"}
                        </button>
                        <button
                            type="button"
                            onClick={() => setModalOpen(false)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border-light/60 text-muted hover:text-heading hover:border-border transition-colors cursor-pointer"
                        >
                            <LucideX className="w-4 h-4" />
                        </button>
                    </div>
                }
            >
                <div className="max-w-3xl mx-auto px-3 sm:px-8 py-6 lg:pt-8 lg:pb-16">
                    <PlanQuestionnaireFlow
                        credits={credits}
                        isSubmitting={createPlan.isPending}
                        onSubmitPlan={handleSubmit}
                        onSaveDraft={handleSaveDraft}
                        isSavingDraft={savingDraft}
                        initialAnswers={draftResumed ? draftAnswers : undefined}
                        initialCategoryIndex={draftResumed ? (activeDraft?.categoryIndex ?? 0) : 0}
                        initialShowVerify={draftResumed ? (activeDraft?.showVerify ?? false) : false}
                        initialShowIntro={draftResumed ? (activeDraft?.showIntro ?? true) : true}
                        initialRiskConsentGiven={draftResumed ? (activeDraft?.riskConsentGiven ?? false) : false}
                        onStateChange={handleStateChange}
                    />
                </div>
            </PlanQuestionnaireModalShell>
        </div>
    );
};

export default CreatePlan;
