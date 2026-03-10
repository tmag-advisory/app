import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import CountryPicker from "../../components/CountryPicker";
import {
    LucideArrowRight,
    LucideArrowLeft,
    LucideCheck,
    LucidePlane,
    LucideHeartPulse,
    LucideSyringe,
    LucideBug,
    LucideShieldCheck,
    LucideSparkles,
    LucideSkipForward,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { canAccessHR } from "../../lib/canAccessHr";
import {
    useOnboardingQuestions,
    useSubmitQuestionnaire,
    useSaveQuestionnaireProgress,
    useGetQuestionnaireProgress,
} from "../../api/hooks";

// ─── Types ───────────────────────────────────────────────────

interface QuestionOption {
    value: string;
    label: string;
}

interface VaccineEntry {
    id: string;
    name: string;
    description: string;
}

interface Question {
    key: string;
    text: string;
    description?: string;
    type: "radio" | "checkbox" | "text" | "textarea" | "date" | "vaccine_table" | "country";
    required?: boolean;
    options?: QuestionOption[];
    vaccines?: VaccineEntry[];
    placeholder?: string;
    conditionalOn?: Record<string, string>;
}

interface QuestionCategory {
    id: number;
    category_key: string;
    category_name: string;
    category_icon: string;
    category_description: string;
    display_order: number;
    is_optional: boolean;
    questions: string;
}

// ─── Icon Map ────────────────────────────────────────────────

const iconMap: Record<string, React.ReactNode> = {
    plane: <LucidePlane className="w-12 h-12" />,
    "heart-pulse": <LucideHeartPulse className="w-12 h-12" />,
    syringe: <LucideSyringe className="w-12 h-12" />,
    bug: <LucideBug className="w-12 h-12" />,
    "shield-check": <LucideShieldCheck className="w-12 h-12" />,
};

// ─── Motion Variants ─────────────────────────────────────────

const questionVariants = {
    enter: (dir: number) => ({
        x: dir > 0 ? 60 : -60,
        opacity: 0,
        scale: 0.97,
    }),
    center: {
        x: 0,
        opacity: 1,
        scale: 1,
        transition: { type: "spring" as const, stiffness: 300, damping: 30 },
    },
    exit: (dir: number) => ({
        x: dir > 0 ? -40 : 40,
        opacity: 0,
        scale: 0.97,
        transition: { duration: 0.2, ease: "easeIn" as const },
    }),
};

const introVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.96 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { type: "spring" as const, stiffness: 280, damping: 26 },
    },
    exit: {
        opacity: 0,
        y: -24,
        scale: 0.97,
        transition: { duration: 0.22 },
    },
};

// ─── shouldShowQuestion ───────────────────────────────────────

function shouldShowQuestion(
    question: Question,
    answers: Record<string, unknown>
): boolean {
    if (!question.conditionalOn) return true;

    for (const [depKey, depValue] of Object.entries(question.conditionalOn)) {
        const answer = answers[depKey];
        const allowedValues = depValue.split("|");
        const isNegation = allowedValues[0]?.startsWith("!");

        if (isNegation) {
            const negatedValue = allowedValues[0].slice(1);
            if (Array.isArray(answer)) {
                if (answer.length === 0 || answer.every((v) => v === negatedValue))
                    return false;
            } else {
                if (!answer || answer === negatedValue) return false;
            }
        } else {
            if (Array.isArray(answer)) {
                if (!answer.some((v) => allowedValues.includes(v))) return false;
            } else {
                if (!allowedValues.includes(answer as string)) return false;
            }
        }
    }
    return true;
}

// ─── Main Component ──────────────────────────────────────────

const TravelHealthQuestionnaire = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { data: categoriesRaw, isLoading: questionsLoading } =
        useOnboardingQuestions();
    const submitQuestionnaire = useSubmitQuestionnaire();
    const saveProgress = useSaveQuestionnaireProgress();
    const { data: savedProgress } = useGetQuestionnaireProgress();

    const [answers, setAnswers] = useState<Record<string, unknown>>({});
    const [categoryIndex, setCategoryIndex] = useState(0);
    const [questionIndex, setQuestionIndex] = useState(-1);
    const [direction, setDirection] = useState(1);
    const [showIntro, setShowIntro] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [showComplete, setShowComplete] = useState(false);

    const progressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const categories: (QuestionCategory & { parsedQuestions: Question[] })[] =
        (categoriesRaw || []).map((cat: QuestionCategory) => ({
            ...cat,
            parsedQuestions: (
                typeof cat.questions === "string"
                    ? JSON.parse(cat.questions)
                    : cat.questions
            ) as Question[],
        }));

    const currentCategory = categories[categoryIndex];
    const visibleQuestions =
        currentCategory?.parsedQuestions.filter((q) =>
            shouldShowQuestion(q, answers)
        ) || [];
    const currentQuestion =
        questionIndex >= 0 ? visibleQuestions[questionIndex] : null;

    // Restore progress
    useEffect(() => {
        if (
            savedProgress &&
            typeof savedProgress === "object" &&
            "answers" in savedProgress
        ) {
            const p = savedProgress as {
                answers: Record<string, unknown>;
                categoryIndex: number;
                questionIndex: number;
            };
            if (p.answers && Object.keys(p.answers).length > 0) {
                setAnswers(p.answers);
                setCategoryIndex(p.categoryIndex || 0);
                setQuestionIndex(p.questionIndex ?? -1);
                if ((p.questionIndex ?? -1) >= 0) setShowIntro(false);
            }
        }
    }, [savedProgress]);

    // Debounced auto-save
    const debouncedSave = useCallback(() => {
        if (progressTimerRef.current) clearTimeout(progressTimerRef.current);
        progressTimerRef.current = setTimeout(() => {
            saveProgress.mutate({ answers, categoryIndex, questionIndex });
        }, 2000);
    }, [answers, categoryIndex, questionIndex, saveProgress]);

    useEffect(() => {
        if (Object.keys(answers).length > 0) debouncedSave();
    }, [answers, debouncedSave]);

    // ─── Handlers ────────────────────────────────────────────

    const setAnswer = (key: string, value: unknown) =>
        setAnswers((prev) => ({ ...prev, [key]: value }));

    const toggleCheckbox = (key: string, value: string) =>
        setAnswers((prev) => {
            const current = (prev[key] as string[]) || [];
            return {
                ...prev,
                [key]: current.includes(value)
                    ? current.filter((v) => v !== value)
                    : [...current, value],
            };
        });

    const setVaccineStatus = (
        vaccineId: string,
        field: "status" | "year",
        value: string
    ) =>
        setAnswers((prev) => {
            const vaccines =
                (prev.vaccine_status as Record<
                    string,
                    Record<string, string>
                >) || {};
            return {
                ...prev,
                vaccine_status: {
                    ...vaccines,
                    [vaccineId]: { ...vaccines[vaccineId], [field]: value },
                },
            };
        });

    // ─── Navigation ──────────────────────────────────────────

    const goNext = () => {
        setDirection(1);
        const next = questionIndex + 1;
        if (next >= visibleQuestions.length) {
            const nextCat = categoryIndex + 1;
            if (nextCat >= categories.length) {
                handleSubmit();
                return;
            }
            setCategoryIndex(nextCat);
            setQuestionIndex(-1);
            setShowIntro(true);
        } else {
            setQuestionIndex(next);
        }
    };

    const goPrev = () => {
        setDirection(-1);
        if (questionIndex <= 0) {
            if (questionIndex === 0) {
                setQuestionIndex(-1);
                setShowIntro(true);
                return;
            }
            if (categoryIndex > 0) {
                const prevCat = categoryIndex - 1;
                const prevVisible = categories[prevCat].parsedQuestions.filter(
                    (q) => shouldShowQuestion(q, answers)
                );
                setCategoryIndex(prevCat);
                setQuestionIndex(prevVisible.length - 1);
                setShowIntro(false);
            }
        } else {
            setQuestionIndex(questionIndex - 1);
        }
    };

    const startCategory = () => {
        setShowIntro(false);
        setDirection(1);
        setQuestionIndex(0);
    };

    const skipCategory = () => {
        setDirection(1);
        const nextCat = categoryIndex + 1;
        if (nextCat >= categories.length) {
            handleSubmit();
            return;
        }
        setCategoryIndex(nextCat);
        setQuestionIndex(-1);
        setShowIntro(true);
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            await submitQuestionnaire.mutateAsync({
                responses: JSON.stringify(answers),
                complete: true,
            });
            setShowComplete(true);
        } catch {
            // handled by mutation
        } finally {
            setSubmitting(false);
        }
    };

    // ─── Progress ────────────────────────────────────────────

    const totalQuestions = categories.reduce(
        (sum, cat) => sum + cat.parsedQuestions.length,
        0
    );
    const answeredCount = Object.keys(answers).length;
    const progressPercent = totalQuestions
        ? Math.min(Math.round((answeredCount / totalQuestions) * 100), 100)
        : 0;

    const isLastQuestion =
        categoryIndex === categories.length - 1 &&
        questionIndex >= visibleQuestions.length - 1;

    // ─── Loading ─────────────────────────────────────────────

    if (questionsLoading) {
        return (
            <div className="min-h-screen bg-background-primary flex items-center justify-center">
                <div className="text-center space-y-3">
                    <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-sm text-muted">Loading questionnaire…</p>
                </div>
            </div>
        );
    }

    // ─── Complete Screen ──────────────────────────────────────

    if (showComplete) {
        return (
            <div className="min-h-screen bg-background-primary flex items-center justify-center px-6">
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 28 }}
                    className="text-center max-w-sm"
                >
                    <motion.div
                        initial={{ scale: 0, rotate: -15 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{
                            delay: 0.15,
                            type: "spring",
                            stiffness: 260,
                            damping: 20,
                        }}
                        className="w-24 h-24 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-8"
                    >
                        <LucideCheck className="w-12 h-12 text-accent" />
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-5xl sm:text-6xl font-serif text-heading mb-4"
                    >
                        All done.
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="text-base text-muted leading-relaxed mb-12"
                    >
                        Thank you for completing the health questionnaire. Our AI will
                        use this to provide you with personalised travel health advice.
                    </motion.p>
                    <motion.button
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        onClick={() =>
                            navigate(
                                user && canAccessHR(user) ? "/hr" : "/dashboard"
                            )
                        }
                        className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-dark text-white font-semibold text-sm cursor-pointer hover:bg-darkest transition-all duration-200"
                    >
                        Go to Dashboard <LucideArrowRight className="w-4 h-4" />
                    </motion.button>
                </motion.div>
            </div>
        );
    }

    if (!currentCategory) return null;

    // ─── Render ──────────────────────────────────────────────

    return (
        <div className="min-h-screen bg-background-primary flex flex-col">

            {/* ── Top Bar ─────────────────────────────────── */}
            <div className="sticky top-0 z-30 px-5 sm:px-8 py-4 flex items-center justify-between border-b border-border-light/60 bg-background-primary/80 backdrop-blur-md">
                <span className="text-heading tracking-tight text-lg font-serif font-medium select-none">
                    TMAG
                </span>
                <div className="flex items-center gap-5">
                    {/* Progress bar */}
                    <div className="hidden sm:flex items-center gap-2.5">
                        <div className="w-28 h-1 rounded-full bg-border-light overflow-hidden">
                            <motion.div
                                className="h-full rounded-full bg-accent"
                                initial={{ width: 0 }}
                                animate={{ width: `${progressPercent}%` }}
                                transition={{ duration: 0.5, ease: "easeOut" }}
                            />
                        </div>
                        <span className="text-xs text-muted tabular-nums">
                            {progressPercent}%
                        </span>
                    </div>
                    <button
                        onClick={() =>
                            navigate(
                                user && canAccessHR(user) ? "/hr" : "/dashboard"
                            )
                        }
                        className="text-xs font-medium text-muted hover:text-heading transition-colors cursor-pointer"
                    >
                        Save & exit
                    </button>
                </div>
            </div>

            {/* ── Category Pills ───────────────────────────── */}
            <div className="px-5 sm:px-8 pt-5 pb-2 flex items-center justify-center gap-1.5 flex-wrap">
                {categories.map((cat, i) => (
                    <div
                        key={cat.category_key}
                        className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold transition-all duration-300 ${
                            i === categoryIndex
                                ? "bg-heading text-white"
                                : i < categoryIndex
                                  ? "bg-accent/15 text-accent"
                                  : "bg-border-light/40 text-muted/60"
                        }`}
                    >
                        {i < categoryIndex && (
                            <LucideCheck className="w-2.5 h-2.5" />
                        )}
                        <span className="hidden sm:inline">{cat.category_name}</span>
                        <span className="sm:hidden">{i + 1}</span>
                    </div>
                ))}
            </div>

            {/* ── Main Content ─────────────────────────────── */}
            <div className="flex-1 flex items-start sm:items-center justify-center px-5 sm:px-8 pt-6 pb-32">
                <div className="w-full max-w-lg">
                    <AnimatePresence mode="wait" custom={direction}>
                        {showIntro ? (
                            <motion.div
                                key={`intro-${categoryIndex}`}
                                variants={introVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                className="text-center py-8 sm:py-16"
                            >
                                {/* Icon */}
                                <motion.div
                                    initial={{ scale: 0, rotate: -25 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{
                                        delay: 0.1,
                                        type: "spring",
                                        stiffness: 260,
                                        damping: 18,
                                    }}
                                    className="w-24 h-24 rounded-3xl bg-accent/10 flex items-center justify-center mx-auto mb-8 text-accent"
                                >
                                    {iconMap[currentCategory.category_icon] || (
                                        <LucideSparkles className="w-12 h-12" />
                                    )}
                                </motion.div>

                                {/* Label */}
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                    className="text-xs font-bold tracking-[0.14em] text-accent uppercase mb-4"
                                >
                                    Section {categoryIndex + 1} of {categories.length}
                                </motion.p>

                                {/* Title */}
                                <motion.h2
                                    initial={{ opacity: 0, y: 14 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.25 }}
                                    className="text-4xl sm:text-5xl font-serif text-heading mb-5 leading-tight"
                                >
                                    {currentCategory.category_name}
                                </motion.h2>

                                {/* Description */}
                                <motion.p
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.32 }}
                                    className="text-base text-muted max-w-sm mx-auto leading-relaxed mb-12"
                                >
                                    {currentCategory.category_description}
                                </motion.p>

                                {/* Actions */}
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                    className="flex items-center justify-center gap-3"
                                >
                                    <button
                                        onClick={startCategory}
                                        className="inline-flex items-center gap-2 px-10 py-4 rounded-2xl bg-dark text-white font-semibold text-sm cursor-pointer hover:bg-darkest transition-all duration-200"
                                    >
                                        Begin <LucideArrowRight className="w-4 h-4" />
                                    </button>
                                    {currentCategory.is_optional && (
                                        <button
                                            onClick={skipCategory}
                                            className="inline-flex items-center gap-2 px-6 py-4 rounded-2xl bg-white border border-border-light text-muted font-semibold text-sm cursor-pointer hover:border-border hover:text-heading transition-all duration-200"
                                        >
                                            <LucideSkipForward className="w-4 h-4" />
                                            Skip
                                        </button>
                                    )}
                                </motion.div>
                            </motion.div>
                        ) : currentQuestion ? (
                            <motion.div
                                key={`q-${currentCategory.category_key}-${currentQuestion.key}`}
                                custom={direction}
                                variants={questionVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                            >
                                {/* Question counter */}
                                <div className="flex items-center gap-2 mb-5">
                                    <span className="text-xs font-bold tracking-wider text-accent uppercase">
                                        {currentCategory.category_name}
                                    </span>
                                    <span className="text-xs text-muted/60">
                                        {questionIndex + 1} / {visibleQuestions.length}
                                    </span>
                                </div>

                                {/* Question text */}
                                <h3 className="text-3xl sm:text-4xl font-serif text-heading mb-2 leading-snug">
                                    {currentQuestion.text}
                                    {currentQuestion.required && (
                                        <span className="text-red-400 ml-1 text-lg">*</span>
                                    )}
                                </h3>

                                {/* Question description */}
                                {currentQuestion.description && (
                                    <p className="text-base text-muted mb-8 leading-relaxed">
                                        {currentQuestion.description}
                                    </p>
                                )}

                                {/* Input */}
                                <div className={currentQuestion.description ? "" : "mt-7"}>
                                    <QuestionInput
                                        question={currentQuestion}
                                        value={answers[currentQuestion.key]}
                                        onChange={(val) =>
                                            setAnswer(currentQuestion.key, val)
                                        }
                                        onToggleCheckbox={(val) =>
                                            toggleCheckbox(currentQuestion.key, val)
                                        }
                                        onSetVaccineStatus={setVaccineStatus}
                                        vaccineStatuses={
                                            (answers.vaccine_status as Record<
                                                string,
                                                Record<string, string>
                                            >) || {}
                                        }
                                    />
                                </div>
                            </motion.div>
                        ) : null}
                    </AnimatePresence>
                </div>
            </div>

            {/* ── Bottom Nav ───────────────────────────────── */}
            {!showIntro && (
                <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-border-light/50 bg-background-primary/90 backdrop-blur-md px-5 sm:px-8 py-4">
                    <div className="max-w-lg mx-auto flex items-center justify-between">
                        <button
                            onClick={goPrev}
                            disabled={categoryIndex === 0 && questionIndex <= 0}
                            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-muted hover:text-heading disabled:opacity-25 disabled:cursor-not-allowed cursor-pointer transition-colors duration-150"
                        >
                            <LucideArrowLeft className="w-4 h-4" /> Back
                        </button>

                        <div className="flex items-center gap-3">
                            {currentCategory.is_optional && (
                                <button
                                    onClick={skipCategory}
                                    className="text-xs font-medium text-muted/70 hover:text-muted transition-colors cursor-pointer"
                                >
                                    Skip section
                                </button>
                            )}
                            <button
                                onClick={goNext}
                                disabled={submitting}
                                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-dark text-white text-sm font-semibold cursor-pointer hover:bg-darkest disabled:opacity-50 transition-all duration-200"
                            >
                                {submitting ? (
                                    "Saving…"
                                ) : isLastQuestion ? (
                                    "Complete"
                                ) : (
                                    <>
                                        Next{" "}
                                        <LucideArrowRight className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// ─── Question Input Component ────────────────────────────────

interface QuestionInputProps {
    question: Question;
    value: unknown;
    onChange: (val: unknown) => void;
    onToggleCheckbox: (val: string) => void;
    onSetVaccineStatus: (
        vaccineId: string,
        field: "status" | "year",
        value: string
    ) => void;
    vaccineStatuses: Record<string, Record<string, string>>;
}

const QuestionInput = ({
    question,
    value,
    onChange,
    onToggleCheckbox,
    onSetVaccineStatus,
    vaccineStatuses,
}: QuestionInputProps) => {
    switch (question.type) {
        case "radio":
            return (
                <div className="space-y-2.5">
                    {question.options?.map((opt, i) => (
                        <motion.button
                            key={opt.value}
                            initial={{ opacity: 0, y: 14 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                                delay: i * 0.055,
                                type: "spring",
                                stiffness: 380,
                                damping: 30,
                            }}
                            type="button"
                            onClick={() => onChange(opt.value)}
                            className={`w-full text-left px-5 py-4 rounded-2xl border-2 transition-all duration-200 cursor-pointer ${
                                value === opt.value
                                    ? "border-accent bg-white shadow-sm"
                                    : "border-border-light/60 hover:border-border bg-white/60 hover:bg-white"
                            }`}
                        >
                            <div className="flex items-center gap-3.5">
                                <div
                                    className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-all duration-200 ${
                                        value === opt.value
                                            ? "border-accent bg-accent"
                                            : "border-border"
                                    }`}
                                >
                                    {value === opt.value && (
                                        <div className="w-2 h-2 rounded-full bg-white" />
                                    )}
                                </div>
                                <span
                                    className={`text-sm font-semibold transition-colors ${
                                        value === opt.value
                                            ? "text-heading"
                                            : "text-body"
                                    }`}
                                >
                                    {opt.label}
                                </span>
                            </div>
                        </motion.button>
                    ))}
                </div>
            );

        case "checkbox":
            return (
                <div className="space-y-2.5">
                    {question.options?.map((opt, i) => {
                        const checked = ((value as string[]) || []).includes(
                            opt.value
                        );
                        return (
                            <motion.button
                                key={opt.value}
                                initial={{ opacity: 0, y: 14 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{
                                    delay: i * 0.055,
                                    type: "spring",
                                    stiffness: 380,
                                    damping: 30,
                                }}
                                type="button"
                                onClick={() => onToggleCheckbox(opt.value)}
                                className={`w-full text-left px-5 py-4 rounded-2xl border-2 transition-all duration-200 cursor-pointer ${
                                    checked
                                        ? "border-accent bg-white shadow-sm"
                                        : "border-border-light/60 hover:border-border bg-white/60 hover:bg-white"
                                }`}
                            >
                                <div className="flex items-center gap-3.5">
                                    <div
                                        className={`w-5 h-5 rounded-md border-2 shrink-0 flex items-center justify-center transition-all duration-200 ${
                                            checked
                                                ? "border-accent bg-accent"
                                                : "border-border"
                                        }`}
                                    >
                                        {checked && (
                                            <LucideCheck className="w-3 h-3 text-white" />
                                        )}
                                    </div>
                                    <span
                                        className={`text-sm font-semibold transition-colors ${
                                            checked ? "text-heading" : "text-body"
                                        }`}
                                    >
                                        {opt.label}
                                    </span>
                                </div>
                            </motion.button>
                        );
                    })}
                </div>
            );

        case "text":
            return (
                <motion.input
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    type="text"
                    value={(value as string) || ""}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={question.placeholder}
                    className="w-full bg-white border-2 border-border-light/60 rounded-2xl px-5 py-4 text-base text-heading placeholder:text-muted/40 outline-none focus:border-accent transition-all duration-200 font-medium"
                />
            );

        case "textarea":
            return (
                <motion.textarea
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    value={(value as string) || ""}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={question.placeholder}
                    rows={4}
                    className="w-full bg-white border-2 border-border-light/60 rounded-2xl px-5 py-4 text-base text-heading placeholder:text-muted/40 outline-none focus:border-accent transition-all duration-200 resize-none font-medium"
                />
            );

        case "date":
            return (
                <motion.input
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    type="date"
                    value={(value as string) || ""}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full bg-white border-2 border-border-light/60 rounded-2xl px-5 py-4 text-base text-heading outline-none focus:border-accent transition-all duration-200 font-medium"
                />
            );

        case "vaccine_table":
            return (
                <div className="space-y-2.5">
                    {question.vaccines?.map((vaccine, i) => {
                        const status = vaccineStatuses[vaccine.id]?.status;
                        return (
                            <motion.div
                                key={vaccine.id}
                                initial={{ opacity: 0, y: 14 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{
                                    delay: i * 0.04,
                                    type: "spring",
                                    stiffness: 380,
                                    damping: 30,
                                }}
                                className="bg-white border-2 border-border-light/60 rounded-2xl p-4 transition-all duration-200 hover:border-border"
                            >
                                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-heading">
                                            {vaccine.name}
                                        </p>
                                        <p className="text-xs text-muted mt-0.5">
                                            {vaccine.description}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        {(["yes", "no", "unsure"] as const).map((s) => (
                                            <button
                                                key={s}
                                                type="button"
                                                onClick={() =>
                                                    onSetVaccineStatus(
                                                        vaccine.id,
                                                        "status",
                                                        s
                                                    )
                                                }
                                                className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all duration-200 ${
                                                    status === s
                                                        ? s === "yes"
                                                            ? "bg-accent text-white"
                                                            : s === "no"
                                                              ? "bg-red-500 text-white"
                                                              : "bg-amber-400 text-white"
                                                        : "bg-border-light/50 text-muted hover:bg-border-light"
                                                }`}
                                            >
                                                {s.charAt(0).toUpperCase() + s.slice(1)}
                                            </button>
                                        ))}
                                        <input
                                            type="text"
                                            placeholder="Year"
                                            maxLength={4}
                                            value={vaccineStatuses[vaccine.id]?.year || ""}
                                            onChange={(e) =>
                                                onSetVaccineStatus(
                                                    vaccine.id,
                                                    "year",
                                                    e.target.value
                                                )
                                            }
                                            className="w-16 bg-border-light/30 border border-border-light rounded-xl px-2 py-1.5 text-xs text-heading outline-none focus:border-accent text-center font-medium"
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            );

        case "country":
            return (
                <motion.div
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <CountryPicker
                        value={(value as string) || ""}
                        onChange={(name) => onChange(name)}
                        inputClassName="w-full bg-white border-2 border-border-light/60 rounded-2xl px-5 py-4 pr-10 text-base text-heading placeholder:text-muted/40 outline-none focus:border-accent transition-all duration-200 font-medium"
                        placeholder={question.placeholder ?? "Select a country"}
                    />
                </motion.div>
            );

        default:
            return null;
    }
};

export default TravelHealthQuestionnaire;
