import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LucideClipboardList } from "lucide-react";
import { useGetQuestionnaireProgress, useSaveQuestionnaireProgress } from "../../api/hooks";

const QuestionnaireProgressBanner = () => {
    const navigate = useNavigate();
    const { data: savedProgress, isLoading } = useGetQuestionnaireProgress();
    const saveProgress = useSaveQuestionnaireProgress();
    const [dismissed, setDismissed] = useState(false);

    if (isLoading || dismissed) return null;

    const progress = savedProgress as { answers?: Record<string, unknown> } | undefined;
    const hasProgress =
        progress &&
        typeof progress === "object" &&
        "answers" in progress &&
        Object.keys(progress.answers ?? {}).length > 0;

    if (!hasProgress) return null;

    const handleDismiss = async () => {
        setDismissed(true);
        try {
            await saveProgress.mutateAsync({ answers: {} });
        } catch {
            // swallow
        }
    };

    return (
        <div className="rounded-2xl border-2 border-accent/30 bg-accent/5 p-5 md:p-6 mb-6">
            <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center shrink-0 mt-0.5">
                    <LucideClipboardList className="w-5 h-5 text-accent" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-heading mb-1">Continue where you left off</p>
                    <p className="text-sm text-muted leading-relaxed">
                        You have a saved health questionnaire in progress. Finish it to get more personalised travel plans.
                    </p>
                </div>
            </div>
            <div className="flex items-center gap-3 mt-4">
                <button
                    type="button"
                    onClick={() => navigate("/onboarding/questionnaire")}
                    className="inline-flex items-center gap-2 py-2 px-4 rounded-xl bg-dark text-white text-sm font-semibold hover:bg-darkest transition-colors cursor-pointer"
                >
                    Continue
                </button>
                <button
                    type="button"
                    onClick={() => void handleDismiss()}
                    className="inline-flex items-center gap-2 py-2 px-4 rounded-xl border-2 border-border-light/60 text-sm text-muted font-semibold hover:text-heading hover:border-border transition-colors cursor-pointer"
                >
                    Dismiss
                </button>
            </div>
        </div>
    );
};

export default QuestionnaireProgressBanner;
