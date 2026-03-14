import { useState, useEffect, useRef } from "react";
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
    LucidePlus,
    LucideX,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { canAccessHR } from "../../lib/canAccessHr";
import {
    useOnboardingQuestions,
    useSubmitQuestionnaire,
    useSaveQuestionnaireProgress,
    useGetQuestionnaireProgress,
} from "../../api/hooks";
import { getAuthCookie } from "../../api/axios";

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
    type: "radio" | "checkbox" | "text" | "textarea" | "date" | "vaccine_table" | "country" | "trip_itinerary" | "multi_country";
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

// ─── Trip Itinerary Types ────────────────────────────────────

interface TripLeg {
    from: string;
    to: string;
    city: string;
    arrivalDate: string;
    departureDate: string;
}

interface TripItineraryData {
    tripType: "one" | "return" | "multi";
    oneDestination?: string;
    oneCity?: string;
    oneDepartureDate?: string;
    oneReturnDate?: string;
    returnFrom?: string;
    returnTo?: string;
    returnCity?: string;
    returnDepartureDate?: string;
    returnReturnDate?: string;
    legs?: TripLeg[];
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

    const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const pendingSaveRef = useRef(false);
    const latestStateRef = useRef({ answers: {} as Record<string, unknown>, categoryIndex: 0, questionIndex: -1 });
    const restoredRef = useRef(false);

    const categories: (QuestionCategory & { parsedQuestions: Question[] })[] =
        (categoriesRaw || []).map((cat: QuestionCategory) => ({
            ...cat,
            parsedQuestions: (
                typeof cat.questions === "string"
                    ? JSON.parse(cat.questions)
                    : cat.questions
            ) as Question[],
        }));

    console.log("[render] categoryIndex:", categoryIndex, "categories:", categories.length, "showIntro:", showIntro, "answers:", Object.keys(answers).length);

    const currentCategory = categories[categoryIndex];
    const visibleQuestions =
        currentCategory?.parsedQuestions.filter((q) =>
            shouldShowQuestion(q, answers)
        ) || [];
    const currentQuestion =
        questionIndex >= 0 ? visibleQuestions[questionIndex] : null;

    // Restore progress (only once per mount, only if server returned valid progress)
    useEffect(() => {
        console.log("[questionnaire] savedProgress:", JSON.stringify(savedProgress));
        console.log("[questionnaire] categoryIndex:", categoryIndex, "answers keys:", Object.keys(answers).length);
        if (restoredRef.current) return;
        if (
            savedProgress &&
            typeof savedProgress === "object" &&
            "answers" in savedProgress
        ) {
            restoredRef.current = true;
            const p = savedProgress as {
                answers: Record<string, unknown>;
                categoryIndex: number;
                questionIndex: number;
            };
            if (p.answers && Object.keys(p.answers).length > 0) {
                setAnswers(p.answers);
                const catIdx = Math.max(0, p.categoryIndex || 0);
                const qIdx = p.questionIndex ?? -1;
                setCategoryIndex(catIdx);
                setQuestionIndex(qIdx);
                if (qIdx >= 0) setShowIntro(false);
            }
        }
    }, [savedProgress]); // eslint-disable-line react-hooks/exhaustive-deps

    // Keep refs in sync with latest state and mark dirty
    useEffect(() => {
        latestStateRef.current = { answers, categoryIndex, questionIndex };
        if (Object.keys(answers).length > 0) pendingSaveRef.current = true;
    }, [answers, categoryIndex, questionIndex]);

    // Save progress every 2 minutes if dirty
    useEffect(() => {
        progressIntervalRef.current = setInterval(() => {
            if (pendingSaveRef.current) {
                pendingSaveRef.current = false;
                const s = latestStateRef.current;
                saveProgress.mutate({ answers: s.answers, categoryIndex: s.categoryIndex, questionIndex: s.questionIndex });
            }
        }, 2 * 60 * 1000);
        return () => {
            if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
        };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Save progress on page unload
    useEffect(() => {
        const handleBeforeUnload = () => {
            if (pendingSaveRef.current && Object.keys(latestStateRef.current.answers).length > 0) {
                const s = latestStateRef.current;
                const token = getAuthCookie();
                fetch(`${import.meta.env.VITE_API_BASE_URL}/onboarding/progress`, {
                    method: "POST",
                    keepalive: true,
                    headers: {
                        "Content-Type": "application/json",
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    },
                    body: JSON.stringify({ answers: s.answers, categoryIndex: s.categoryIndex, questionIndex: s.questionIndex }),
                });
            }
        };
        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
        const createPlanPath =
            user && canAccessHR(user) ? "/hr/create-plan" : (
                "/dashboard/create-plan"
            );
        const dashboardPath = user && canAccessHR(user) ? "/hr" : "/dashboard";

        return (
            <div className="min-h-screen bg-background-primary flex items-center justify-center px-6">
                <div className="w-full max-w-sm">
                    <motion.div
                        initial={{ scale: 0, rotate: -15 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{
                            delay: 0.1,
                            type: "spring",
                            stiffness: 260,
                            damping: 20,
                        }}
                        className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-6"
                    >
                        <LucideCheck className="w-7 h-7 text-accent" />
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-5xl font-serif text-heading mb-3 text-center"
                    >
                        All done.
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-sm text-muted leading-relaxed mb-8 text-center"
                    >
                        Your health profile is complete. Your AI advisor is
                        ready — where are you headed?
                    </motion.p>

                    {/* Primary CTA — create a plan right now */}
                    <motion.button
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                            delay: 0.4,
                            type: "spring",
                            stiffness: 300,
                            damping: 24,
                        }}
                        onClick={() => navigate(createPlanPath)}
                        className="w-full mb-3 p-7 rounded-3xl outline-dark/20 outline-2 relative overflow-hidden group cursor-pointer text-left"
                    >
                        <div className="absolute inset-0 bg-linear-to-br from-accent/25 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                        <motion.div
                            animate={{ x: [0, 6, 0], y: [0, -3, 0] }}
                            transition={{
                                duration: 2.8,
                                repeat: Infinity,
                                ease: "easeInOut",
                            }}
                            className="mb-5"
                        >
                            <LucidePlane className="w-9 h-9 text-accent" />
                        </motion.div>

                        <p className="text-xl font-serif mb-1">
                            Plan your first trip
                        </p>
                        <p className="text-xs  mb-5 leading-relaxed">
                            Get personalised AI health advice, vaccines &amp;
                            safety alerts for your destination.
                        </p>
                        <span className="inline-flex items-center gap-1.5 text-accent text-xs font-semibold">
                            Start now{" "}
                            <LucideArrowRight className="w-3.5 h-3.5" />
                        </span>
                    </motion.button>

                    {/* Secondary CTA */}
                    <motion.button
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        onClick={() => navigate(dashboardPath)}
                        className="w-full py-3 text-sm text-muted font-medium hover:text-heading transition-colors cursor-pointer"
                    >
                        Take me to the dashboard
                    </motion.button>
                </div>
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

// ─── Trip Itinerary Input ────────────────────────────────────

const tripCls = {
    input: "w-full bg-white border-2 border-border-light/60 rounded-xl px-4 py-3 text-sm text-heading placeholder:text-muted/40 outline-none focus:border-accent transition-all duration-200 font-medium",
    cardInput: "w-full bg-background-primary border-2 border-border-light/60 rounded-xl px-4 py-3 text-sm text-heading placeholder:text-muted/40 outline-none focus:border-accent transition-all duration-200 font-medium",
    country: "w-full bg-white border-2 border-border-light/60 rounded-xl px-4 py-3 pr-10 text-sm text-heading placeholder:text-muted/40 outline-none focus:border-accent transition-all duration-200 font-medium",
    cardCountry: "w-full bg-background-primary border-2 border-border-light/60 rounded-xl px-4 py-3 pr-10 text-sm text-heading placeholder:text-muted/40 outline-none focus:border-accent transition-all duration-200 font-medium",
    label: "block text-xs font-bold text-heading mb-1.5",
    badge: "text-[10px] font-bold tracking-widest text-accent uppercase bg-accent/10 px-2.5 py-1 rounded-full",
};

const TripItineraryInput = ({
    value,
    onChange,
}: {
    value: TripItineraryData;
    onChange: (val: unknown) => void;
}) => {
    const data: TripItineraryData = { ...value, tripType: "one", legs: [] };

    const update = (patch: Partial<TripItineraryData>) => {
        onChange({ ...data, ...patch });
    };

    const setTripType = (type: TripItineraryData["tripType"]) => {
        const patch: Partial<TripItineraryData> = { tripType: type };
        if (type === "multi" && (!data.legs || data.legs.length < 2)) {
            const existing = data.legs || [];
            const newLegs = [...existing];
            while (newLegs.length < 2) {
                newLegs.push({ from: "", to: "", city: "", arrivalDate: "", departureDate: "" });
            }
            patch.legs = newLegs;
        }
        update(patch);
    };

    const addLeg = () => {
        update({ legs: [...(data.legs || []), { from: "", to: "", city: "", arrivalDate: "", departureDate: "" }] });
    };

    const removeLeg = (index: number) => {
        update({ legs: (data.legs || []).filter((_, i) => i !== index) });
    };

    const updateLeg = (index: number, patch: Partial<TripLeg>) => {
        const legs = [...(data.legs || [])];
        legs[index] = { ...legs[index], ...patch };
        update({ legs });
    };

    return (
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
            {/* Trip Type Tabs */}
            <div className="flex gap-2">
                {([
                    { value: "one" as const, label: "One Country", icon: "✈" },
                    { value: "return" as const, label: "Return Trip", icon: "↩" },
                    { value: "multi" as const, label: "Multi-Stop", icon: "🗺" },
                ] as const).map((tab) => (
                    <button
                        key={tab.value}
                        type="button"
                        onClick={() => setTripType(tab.value)}
                        className={`flex-1 px-2 py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
                            data.tripType === tab.value
                                ? "bg-dark text-white shadow-sm"
                                : "bg-white border-2 border-border-light/60 text-muted hover:border-border hover:text-heading"
                        }`}
                    >
                        <span className="mr-1">{tab.icon}</span>
                        <span className="hidden sm:inline">{tab.label}</span>
                        <span className="sm:hidden">{tab.label.split(" ")[0]}</span>
                    </button>
                ))}
            </div>

            {/* ── One Country ── */}
            {data.tripType === "one" && (
                <div className="space-y-3">
                    <div>
                        <label className={tripCls.label}>
                            Destination Country <span className="text-red-400">*</span>
                        </label>
                        <CountryPicker
                            value={data.oneDestination || ""}
                            onChange={(name) => update({ oneDestination: name })}
                            inputClassName={tripCls.country}
                            placeholder="e.g. Ghana"
                        />
                    </div>
                    <div>
                        <label className={tripCls.label}>
                            City or Region <span className="text-muted/50 font-normal">(optional)</span>
                        </label>
                        <input
                            type="text"
                            value={data.oneCity || ""}
                            onChange={(e) => update({ oneCity: e.target.value })}
                            placeholder="e.g. Accra, Northern Region"
                            className={tripCls.input}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className={tripCls.label}>
                                Departure Date <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="date"
                                value={data.oneDepartureDate || ""}
                                onChange={(e) => update({ oneDepartureDate: e.target.value })}
                                className={tripCls.input}
                            />
                        </div>
                        <div>
                            <label className={tripCls.label}>
                                Return Date <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="date"
                                value={data.oneReturnDate || ""}
                                onChange={(e) => update({ oneReturnDate: e.target.value })}
                                className={tripCls.input}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* ── Return Trip ── */}
            {data.tripType === "return" && (
                <div className="bg-white border-2 border-border-light/60 rounded-2xl p-5 space-y-3">
                    <span className={tripCls.badge}>Outbound</span>
                    <div className="grid grid-cols-[1fr,auto,1fr] gap-2 items-end">
                        <div>
                            <label className={tripCls.label}>From</label>
                            <CountryPicker
                                value={data.returnFrom || ""}
                                onChange={(name) => update({ returnFrom: name })}
                                inputClassName={tripCls.cardCountry}
                                placeholder="Departure country"
                            />
                        </div>
                        <div className="text-muted/40 text-lg pb-3 text-center">→</div>
                        <div>
                            <label className={tripCls.label}>To</label>
                            <CountryPicker
                                value={data.returnTo || ""}
                                onChange={(name) => update({ returnTo: name })}
                                inputClassName={tripCls.cardCountry}
                                placeholder="Destination country"
                            />
                        </div>
                    </div>
                    <div>
                        <label className={tripCls.label}>
                            City or Region <span className="text-muted/50 font-normal">(optional)</span>
                        </label>
                        <input
                            type="text"
                            value={data.returnCity || ""}
                            onChange={(e) => update({ returnCity: e.target.value })}
                            placeholder="e.g. Lagos, rural areas"
                            className={tripCls.cardInput}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className={tripCls.label}>Departure Date</label>
                            <input
                                type="date"
                                value={data.returnDepartureDate || ""}
                                onChange={(e) => update({ returnDepartureDate: e.target.value })}
                                className={tripCls.cardInput}
                            />
                        </div>
                        <div>
                            <label className={tripCls.label}>Return Date</label>
                            <input
                                type="date"
                                value={data.returnReturnDate || ""}
                                onChange={(e) => update({ returnReturnDate: e.target.value })}
                                className={tripCls.cardInput}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* ── Multiple Destinations ── */}
            {data.tripType === "multi" && (
                <div className="space-y-3">
                    {(data.legs || []).map((leg, i) => (
                        <div key={i} className="bg-white border-2 border-border-light/60 rounded-2xl p-5 space-y-3">
                            <div className="flex items-center justify-between">
                                <span className={tripCls.badge}>Destination {i + 1}</span>
                                {i > 0 && (
                                    <button
                                        type="button"
                                        onClick={() => removeLeg(i)}
                                        className="text-muted/50 hover:text-red-500 transition-colors cursor-pointer p-1"
                                    >
                                        <LucideX className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                            <div className="grid grid-cols-[1fr,auto,1fr] gap-2 items-end">
                                <div>
                                    <label className={tripCls.label}>From</label>
                                    <CountryPicker
                                        value={leg.from}
                                        onChange={(name) => updateLeg(i, { from: name })}
                                        inputClassName={tripCls.cardCountry}
                                        placeholder="From country"
                                    />
                                </div>
                                <div className="text-muted/40 text-lg pb-3 text-center">→</div>
                                <div>
                                    <label className={tripCls.label}>To</label>
                                    <CountryPicker
                                        value={leg.to}
                                        onChange={(name) => updateLeg(i, { to: name })}
                                        inputClassName={tripCls.cardCountry}
                                        placeholder="Destination country"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className={tripCls.label}>
                                    City or Region <span className="text-muted/50 font-normal">(optional)</span>
                                </label>
                                <input
                                    type="text"
                                    value={leg.city}
                                    onChange={(e) => updateLeg(i, { city: e.target.value })}
                                    placeholder="e.g. Lagos, rural areas"
                                    className={tripCls.cardInput}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className={tripCls.label}>Arrival Date</label>
                                    <input
                                        type="date"
                                        value={leg.arrivalDate}
                                        onChange={(e) => updateLeg(i, { arrivalDate: e.target.value })}
                                        className={tripCls.cardInput}
                                    />
                                </div>
                                <div>
                                    <label className={tripCls.label}>Departure Date</label>
                                    <input
                                        type="date"
                                        value={leg.departureDate}
                                        onChange={(e) => updateLeg(i, { departureDate: e.target.value })}
                                        className={tripCls.cardInput}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={addLeg}
                        className="w-full py-3.5 rounded-2xl border-2 border-dashed border-border-light text-sm font-semibold text-muted/60 hover:border-accent hover:text-accent hover:bg-accent/5 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
                    >
                        <LucidePlus className="w-4 h-4" /> Add Another Destination
                    </button>
                </div>
            )}
        </motion.div>
    );
};

// ─── Multi Country Input ─────────────────────────────────────

const MultiCountryInput = ({
    value,
    onChange,
    placeholder,
}: {
    value: string[];
    onChange: (val: unknown) => void;
    placeholder?: string;
}) => {
    const countries = value.length > 0 ? value : [""];

    const updateCountry = (index: number, name: string) => {
        const updated = [...countries];
        updated[index] = name;
        onChange(updated);
    };

    const addCountry = () => onChange([...countries, ""]);

    const removeCountry = (index: number) => {
        const updated = countries.filter((_, i) => i !== index);
        onChange(updated.length > 0 ? updated : [""]);
    };

    return (
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            {countries.map((country, i) => (
                <div key={i} className="flex items-start gap-2">
                    <div className="flex-1">
                        <CountryPicker
                            value={country}
                            onChange={(name) => updateCountry(i, name)}
                            inputClassName="w-full bg-white border-2 border-border-light/60 rounded-2xl px-5 py-4 pr-10 text-base text-heading placeholder:text-muted/40 outline-none focus:border-accent transition-all duration-200 font-medium"
                            placeholder={placeholder ?? "Select a country"}
                        />
                    </div>
                    {countries.length > 1 && (
                        <button
                            type="button"
                            onClick={() => removeCountry(i)}
                            className="mt-3.5 text-muted/50 hover:text-red-500 transition-colors cursor-pointer p-1"
                        >
                            <LucideX className="w-4 h-4" />
                        </button>
                    )}
                </div>
            ))}
            <button
                type="button"
                onClick={addCountry}
                className="w-full py-3 rounded-xl border-2 border-dashed border-border-light text-xs font-semibold text-muted/60 hover:border-accent hover:text-accent hover:bg-accent/5 transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5"
            >
                <LucidePlus className="w-3.5 h-3.5" /> Add Another Country
            </button>
        </motion.div>
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

        case "trip_itinerary":
            return (
                <TripItineraryInput
                    value={(value as TripItineraryData) || { tripType: "one" }}
                    onChange={onChange}
                />
            );

        case "multi_country":
            return (
                <MultiCountryInput
                    value={Array.isArray(value) ? (value as string[]) : []}
                    onChange={onChange}
                    placeholder={question.placeholder}
                />
            );

        default:
            return null;
    }
};

export default TravelHealthQuestionnaire;
