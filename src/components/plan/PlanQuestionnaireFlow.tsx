import { useMemo, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import {
    LucideArrowLeft,
    LucideArrowRight,
    LucideCheck,
    LucideLoader2,
    LucidePlus,
    LucideX,
} from "lucide-react";
import toast from "react-hot-toast";
import CountryPicker from "../CountryPicker";
import TripItineraryFlow, { type TripItineraryData } from "./TripItineraryFlow";
import { useOnboardingQuestions } from "../../api/hooks";

interface QuestionOption {
    value: string;
    label: string;
}

interface Question {
    key: string;
    text: string;
    description?: string;
    type: "radio" | "checkbox" | "text" | "textarea" | "date" | "country" | "multi_country" | "trip_itinerary";
    required?: boolean;
    options?: QuestionOption[];
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

export interface QuestionnairePlanPayload {
    destination: string;
    country: string;
    duration: number;
    purpose: string;
    medicalConsiderations: string;
    tripType: "one-way" | "return";
    tripDetailsJson: string;
    questionnaireResponses: Record<string, unknown>;
}

interface PlanQuestionnaireFlowProps {
    credits: number;
    verifyTopSlot?: ReactNode;
    onSubmitPlan: (payload: QuestionnairePlanPayload) => Promise<void>;
    isSubmitting?: boolean;
}

function shouldShowQuestion(question: Question, answers: Record<string, unknown>): boolean {
    if (!question.conditionalOn) return true;
    for (const [depKey, depValue] of Object.entries(question.conditionalOn)) {
        const answer = answers[depKey];
        const allowedValues = depValue.split("|");
        const isNegation = allowedValues[0]?.startsWith("!");
        if (isNegation) {
            const negatedValue = allowedValues[0].slice(1);
            if (Array.isArray(answer)) {
                if (answer.length === 0 || answer.every((v) => v === negatedValue)) return false;
            } else if (!answer || answer === negatedValue) {
                return false;
            }
            continue;
        }

        if (Array.isArray(answer)) {
            if (!answer.some((v) => allowedValues.includes(String(v)))) return false;
            continue;
        }
        if (!allowedValues.includes(String(answer ?? ""))) return false;
    }
    return true;
}

function isIsoDate(value: string): boolean {
    return /^\d{4}-\d{2}-\d{2}$/.test(value.trim());
}

function daysInclusiveBetween(start?: string, end?: string): number {
    if (!start?.trim() || !end?.trim()) return 0;
    const a = new Date(start);
    const b = new Date(end);
    if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) return 0;
    const diff = Math.ceil((b.getTime() - a.getTime()) / 86400000) + 1;
    return diff > 0 ? diff : 0;
}

function isTripItineraryComplete(data: TripItineraryData | undefined): boolean {
    if (!data) return false;
    if (data.tripType === "one") {
        return Boolean(
            data.oneTo?.trim() &&
            data.oneDepartureDate?.trim() &&
            data.oneLengthOfStay?.trim() &&
            data.onePurpose?.trim()
        );
    }
    if (data.tripType === "return") {
        return Boolean(
            data.returnFrom?.trim() &&
            data.returnTo?.trim() &&
            data.returnDepartureDate?.trim() &&
            data.returnReturnDate?.trim()
        );
    }
    if (data.tripType === "multi") {
        const legs = data.multiLegs ?? [];
        if (legs.length < 1) return false;
        return legs.every(
            (leg) => leg.country?.trim() && leg.arrivalDate?.trim() && leg.nights?.trim()
        );
    }
    if (data.tripType === "transit") {
        return Boolean(
            data.transitFrom?.trim() &&
            data.transitFinalDestination?.trim() &&
            data.transitLocation?.trim() &&
            data.transitDuration?.trim() &&
            data.transitDepartureDate?.trim()
        );
    }
    return false;
}

const TRAVEL_PURPOSE_TO_PLAN: Record<string, string> = {
    leisure_tourism: "Leisure",
    business_work: "Business",
    study_relocation: "Study",
    visiting_family_friends: "Leisure",
    religious_pilgrimage: "Other",
    other: "Other",
    tourism: "Leisure",
    business: "Business",
    visiting_family: "Leisure",
    study_work: "Study",
    volunteer: "Volunteer",
    pilgrimage: "Other",
};

function toNonEmptyStringArray(value: unknown): string[] {
    if (!Array.isArray(value)) return [];
    return value.map((entry) => String(entry).trim()).filter(Boolean);
}

/** Preserve empty slots so "Add another country" rows are not stripped on re-render. */
function toMultiCountryEditArray(value: unknown): string[] {
    if (!Array.isArray(value)) return [];
    return value.map((entry) => String(entry ?? ""));
}

function getDisplayValue(question: Question, value: unknown): string {
    if (value == null) return "Not provided";
    if (question.type === "trip_itinerary") {
        const trip = value as TripItineraryData;
        if (!trip?.tripType) return "Not provided";
        if (trip.tripType === "one") {
            return `One-way: ${(trip.oneFrom ?? "").trim()} → ${(trip.oneTo ?? "").trim()}`;
        }
        if (trip.tripType === "return") {
            return `Return: ${(trip.returnFrom ?? "").trim()} → ${(trip.returnTo ?? "").trim()}`;
        }
        if (trip.tripType === "multi") {
            const count = trip.multiLegs?.length ?? 0;
            return `Multi-destination: ${count} stop(s)`;
        }
        if (trip.tripType === "transit") {
            return `Transit: ${(trip.transitFrom ?? "").trim()} via ${(trip.transitLocation ?? "").trim()} → ${(trip.transitFinalDestination ?? "").trim()}`;
        }
        return "Not provided";
    }
    if (question.type === "checkbox") {
        const selected = toNonEmptyStringArray(value);
        if (selected.length === 0) return "Not provided";
        const optionMap = new Map((question.options ?? []).map((opt) => [opt.value, opt.label]));
        return selected.map((v) => optionMap.get(v) ?? v).join(", ");
    }
    if (question.type === "multi_country") {
        const selected = toNonEmptyStringArray(value);
        return selected.length > 0 ? selected.join(", ") : "Not provided";
    }
    if (question.type === "radio") {
        const selected = String(value);
        const label = question.options?.find((opt) => opt.value === selected)?.label;
        return label ?? selected;
    }
    return String(value).trim() || "Not provided";
}

function buildPlanPayloadFromAnswers(answers: Record<string, unknown>): QuestionnairePlanPayload | null {
    const travelCountries = toNonEmptyStringArray(answers.travel_countries);
    const itinerary = (answers.trip_itinerary as TripItineraryData | undefined) ?? undefined;

    if (travelCountries.length === 0 && !itinerary) return null;

    const city = typeof answers.travel_city_region === "string" ? answers.travel_city_region.trim() : "";
    const departureDate = typeof answers.departure_date === "string" ? answers.departure_date.trim() : "";
    const returnDateOrDuration =
        typeof answers.return_date_or_duration === "string" ? answers.return_date_or_duration.trim() : "";

    let primaryCountry = travelCountries[0] ?? "";
    const destinationCountries = travelCountries.join(", ");
    let destination = [city, destinationCountries].filter(Boolean).join(", ") || destinationCountries;

    let duration = 7;
    let tripType: "one-way" | "return" = "one-way";
    let tripDetailsJson = JSON.stringify({
        tripType: "one-way",
        stops: [{ city: city || primaryCountry, country: primaryCountry, order: 1 }],
    });

    if (isIsoDate(returnDateOrDuration)) {
        const calculated = daysInclusiveBetween(departureDate, returnDateOrDuration);
        duration = calculated > 0 ? calculated : 7;
        tripType = "return";
        tripDetailsJson = JSON.stringify({
            tripType: "return",
            departureDate,
            returnDate: returnDateOrDuration,
            stops: [{ city: city || primaryCountry, country: primaryCountry, order: 1 }],
        });
    } else {
        const parsedDuration = parseInt(returnDateOrDuration, 10);
        if (!Number.isNaN(parsedDuration) && parsedDuration > 0) duration = parsedDuration;
    }

    if (itinerary) {
        if (itinerary.tripType === "one") {
            primaryCountry = (itinerary.oneTo ?? "").trim();
            const fromCity = (itinerary.oneFrom ?? "").trim();
            destination = primaryCountry;
            if (fromCity) destination = `${fromCity} → ${destination}`;
            duration = 7;
            tripType = "one-way";
            tripDetailsJson = JSON.stringify({
                tripType: "one-way",
                departureCity: fromCity,
                destination: primaryCountry,
                departureDate: itinerary.oneDepartureDate ?? "",
                lengthOfStay: itinerary.oneLengthOfStay ?? "",
                purpose: itinerary.onePurpose ?? "",
                flightNumber: itinerary.oneFlightNumber ?? "",
                stops: [{ city: "", country: primaryCountry, order: 1 }],
            });
        } else if (itinerary.tripType === "return") {
            const from = (itinerary.returnFrom ?? "").trim();
            const to = (itinerary.returnTo ?? "").trim();
            primaryCountry = to;
            destination = to;
            if (from) destination = `${from} → ${destination}`;
            tripType = "return";
            duration = 7;
            tripDetailsJson = JSON.stringify({
                tripType: "return",
                departureCity: from,
                destination: to,
                departureDate: itinerary.returnDepartureDate ?? "",
                returnDate: itinerary.returnReturnDate ?? "",
                outboundFlightNumber: itinerary.outboundFlightNumber ?? "",
                returnFlightNumber: itinerary.returnFlightNumber ?? "",
                stops: [{ city: "", country: to, order: 1 }],
            });
        } else if (itinerary.tripType === "multi") {
            const legs = itinerary.multiLegs ?? [];
            const parts = legs
                .map((leg) => [leg.city?.trim(), leg.country?.trim()].filter(Boolean).join(", "))
                .filter(Boolean);
            destination = parts.join(" → ");
            primaryCountry = (legs[0]?.country ?? "").trim();
            tripDetailsJson = JSON.stringify({
                tripType: "multi",
                departingFrom: itinerary.multiDepartingFrom ?? "",
                finalReturnDestination: itinerary.multiFinalReturnDestination ?? "",
                overallReturnDate: itinerary.multiOverallReturnDate ?? "",
                stops: legs.map((leg, index) => ({
                    city: (leg.city ?? "").trim(),
                    country: (leg.country ?? "").trim(),
                    arrivalDate: leg.arrivalDate ?? "",
                    nights: leg.nights ?? "",
                    order: index + 1,
                })),
            });
        } else if (itinerary.tripType === "transit") {
            primaryCountry = (itinerary.transitFinalDestination ?? "").trim();
            destination = `${(itinerary.transitFrom ?? "").trim()} via ${(itinerary.transitLocation ?? "").trim()} → ${primaryCountry}`;
            tripDetailsJson = JSON.stringify({
                tripType: "transit",
                departureCity: itinerary.transitFrom ?? "",
                finalDestination: itinerary.transitFinalDestination ?? "",
                transitLocation: itinerary.transitLocation ?? "",
                transitDuration: itinerary.transitDuration ?? "",
                departureDate: itinerary.transitDepartureDate ?? "",
                returnDate: itinerary.transitReturnDate ?? "",
                stops: [{ city: "", country: primaryCountry, order: 1 }],
            });
        }
    }

    if (!primaryCountry) return null;

    const purposeSelections = answers.purpose_of_travel;
    let purpose = "Leisure";
    if (Array.isArray(purposeSelections) && purposeSelections.length > 0) {
        purpose = TRAVEL_PURPOSE_TO_PLAN[String(purposeSelections[0])] ?? "Other";
    }

    const medicalConsiderations =
        (typeof answers.additional_relevant_activities === "string" && answers.additional_relevant_activities.trim()) ||
        (typeof answers.lifestyle_additional_context === "string" && answers.lifestyle_additional_context.trim()) ||
        "";

    return {
        destination,
        country: primaryCountry,
        duration,
        purpose,
        medicalConsiderations,
        tripType,
        tripDetailsJson,
        questionnaireResponses: answers,
    };
}

const PlanQuestionnaireFlow = ({
    credits,
    verifyTopSlot,
    onSubmitPlan,
    isSubmitting = false,
}: PlanQuestionnaireFlowProps) => {
    const { data: categoriesRaw, isLoading } = useOnboardingQuestions();
    const [answers, setAnswers] = useState<Record<string, unknown>>({});
    const [categoryIndex, setCategoryIndex] = useState(0);
    const [questionIndex, setQuestionIndex] = useState(-1);
    const [showIntro, setShowIntro] = useState(true);
    const [showVerify, setShowVerify] = useState(false);

    const categories = useMemo(
        () =>
            ((categoriesRaw as QuestionCategory[] | undefined) ?? []).map((cat) => ({
                ...cat,
                parsedQuestions:
                    (typeof cat.questions === "string" ? JSON.parse(cat.questions) : cat.questions) as Question[],
            })),
        [categoriesRaw]
    );

    const currentCategory = categories[categoryIndex];
    const visibleQuestions: Question[] = (currentCategory?.parsedQuestions ?? []).filter((q: Question) =>
        shouldShowQuestion(q, answers)
    );
    const currentQuestion = questionIndex >= 0 ? visibleQuestions[questionIndex] : null;

    const isRequiredAnswered = (question: Question): boolean => {
        if (!question.required) return true;
        const value = answers[question.key];
        if (question.type === "trip_itinerary") {
            return isTripItineraryComplete(value as TripItineraryData | undefined);
        }
        if (question.type === "checkbox" || question.type === "multi_country") {
            return toNonEmptyStringArray(value).length > 0;
        }
        return String(value ?? "").trim().length > 0;
    };

    const goToNext = () => {
        if (!currentQuestion) return;
        if (!isRequiredAnswered(currentQuestion)) {
            toast.error("Please answer this required question before continuing.");
            return;
        }
        const nextQuestion = questionIndex + 1;
        if (nextQuestion < visibleQuestions.length) {
            setQuestionIndex(nextQuestion);
            return;
        }
        const nextCategory = categoryIndex + 1;
        if (nextCategory < categories.length) {
            setCategoryIndex(nextCategory);
            setQuestionIndex(-1);
            setShowIntro(true);
            return;
        }
        setShowVerify(true);
    };

    const goToPrevious = () => {
        if (showVerify) {
            const lastCategoryIndex = categories.length - 1;
            const lastVisible =
                categories[lastCategoryIndex]?.parsedQuestions?.filter((q: Question) => shouldShowQuestion(q, answers)) ?? [];
            setCategoryIndex(lastCategoryIndex);
            setQuestionIndex(Math.max(0, lastVisible.length - 1));
            setShowIntro(false);
            setShowVerify(false);
            return;
        }
        if (showIntro) {
            if (categoryIndex === 0) return;
            const previousCategory = categoryIndex - 1;
            const previousVisible =
                categories[previousCategory]?.parsedQuestions?.filter((q: Question) => shouldShowQuestion(q, answers)) ?? [];
            setCategoryIndex(previousCategory);
            setQuestionIndex(Math.max(0, previousVisible.length - 1));
            setShowIntro(false);
            return;
        }
        if (questionIndex > 0) {
            setQuestionIndex((idx) => idx - 1);
            return;
        }
        setShowIntro(true);
        setQuestionIndex(-1);
    };

    const startCategory = () => {
        setShowIntro(false);
        setQuestionIndex(0);
    };

    const handleGeneratePlan = async () => {
        const payload = buildPlanPayloadFromAnswers(answers);
        if (!payload) {
            toast.error("Please provide at least one destination country.");
            return;
        }
        if (credits <= 0) {
            toast.error("You don't have enough credits.");
            return;
        }
        await onSubmitPlan(payload);
    };

    if (isLoading) {
        return (
            <div className="min-h-[360px] flex items-center justify-center">
                <div className="text-center space-y-3">
                    <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-sm text-muted">Loading questionnaire...</p>
                </div>
            </div>
        );
    }

    if (!currentCategory) return null;

    const allVisibleQuestions = categories.flatMap((cat) =>
        cat.parsedQuestions
            .filter((q: Question) => shouldShowQuestion(q, answers))
            .map((q: Question) => ({
                categoryName: cat.category_name,
                question: q,
            }))
    );

    return (
        <div className="space-y-8">
            {!showVerify && (
                <>
                    <div className="overflow-x-auto pb-1">
                        <div className="min-w-max px-1">
                            <div className="relative flex items-start gap-3">
                                <div className="absolute left-4 right-4 top-4 h-px bg-border-light/80" />
                                {categories.map((cat, idx) => (
                                    <div key={cat.category_key} className="relative flex w-[140px] flex-col items-center">
                                        <div
                                            className={`z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 text-[11px] font-bold ${idx < categoryIndex
                                                ? "border-accent bg-accent text-white"
                                                : idx === categoryIndex
                                                    ? "border-heading bg-heading text-white"
                                                    : "border-border-light bg-white text-muted"
                                                }`}
                                        >
                                            {idx < categoryIndex ? <LucideCheck className="h-3.5 w-3.5" /> : idx + 1}
                                        </div>
                                        <p
                                            className={`mt-2 text-center text-[11px] font-semibold leading-snug ${idx === categoryIndex ? "text-heading" : idx < categoryIndex ? "text-accent" : "text-muted"
                                                }`}
                                        >
                                            {cat.category_name}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {showIntro ? (
                        <div className="rounded-3xl border border-border-light/70 bg-white/80 p-7 md:p-9">
                            <p className="text-xs text-accent font-semibold uppercase tracking-wider mb-2">
                                Section {categoryIndex + 1} of {categories.length}
                            </p>
                            <h3 className="text-3xl md:text-4xl font-serif text-heading mb-3 leading-tight">{currentCategory.category_name}</h3>
                            <p className="text-sm md:text-base text-muted mb-7 max-w-2xl leading-relaxed">{currentCategory.category_description}</p>
                            <button
                                type="button"
                                onClick={startCategory}
                                className="inline-flex items-center gap-2 py-2.5 px-5 rounded-xl bg-dark text-white text-sm font-semibold hover:bg-darkest transition-colors"
                            >
                                Begin <LucideArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    ) : currentQuestion ? (
                        <motion.div
                            key={`${currentCategory.category_key}-${currentQuestion.key}`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="rounded-3xl border border-border-light/70 bg-white/80 p-7 md:p-9"
                        >
                            <p className="text-[11px] uppercase tracking-[0.12em] font-semibold text-accent mb-2">
                                {currentCategory.category_name} - {questionIndex + 1} of {visibleQuestions.length}
                            </p>
                            <h3 className="text-2xl md:text-3xl font-serif text-heading mb-3 leading-snug">
                                {currentQuestion.text}
                                {currentQuestion.required && <span className="text-red-500 ml-1">*</span>}
                            </h3>
                            {currentQuestion.description && (
                                <p className="text-sm md:text-base text-muted mb-6 leading-relaxed">{currentQuestion.description}</p>
                            )}
                            <QuestionInput
                                question={currentQuestion}
                                value={answers[currentQuestion.key]}
                                onChange={(value) => setAnswers((prev) => ({ ...prev, [currentQuestion.key]: value }))}
                                onToggleCheckbox={(value) =>
                                    setAnswers((prev) => {
                                        const current = toNonEmptyStringArray(prev[currentQuestion.key]);
                                        return {
                                            ...prev,
                                            [currentQuestion.key]: current.includes(value)
                                                ? current.filter((v) => v !== value)
                                                : [...current, value],
                                        };
                                    })
                                }
                            />
                        </motion.div>
                    ) : null}
                </>
            )}

            {showVerify && (
                <div className="rounded-3xl border border-border-light/70 bg-white/80 p-7 md:p-9 space-y-6">
                    <div>
                        <h3 className="text-3xl md:text-4xl font-serif text-heading leading-tight">Verify Your Inputs</h3>
                        <p className="text-sm md:text-base text-muted leading-relaxed">Review each answer carefully before generating this plan.</p>
                    </div>
                    {verifyTopSlot}
                    <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                        {allVisibleQuestions.map(({ categoryName, question }) => (
                            <div key={question.key} className="rounded-xl border border-border-light/60 bg-background-primary/60 p-3.5">
                                <p className="text-[11px] uppercase tracking-wider font-semibold text-accent mb-1">{categoryName}</p>
                                <p className="text-sm text-heading font-medium">{question.text}</p>
                                <p className="text-sm text-muted mt-1">{getDisplayValue(question, answers[question.key])}</p>
                            </div>
                        ))}
                    </div>
                    <p className="text-xs text-muted">
                        This will use <strong className="text-heading">1 credit</strong>. You have {credits} remaining.
                    </p>
                    <button
                        type="button"
                        onClick={() => void handleGeneratePlan()}
                        disabled={credits === 0 || isSubmitting}
                        className="inline-flex items-center gap-2 py-2.5 px-6 rounded-xl bg-dark text-white text-sm font-semibold hover:bg-darkest disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                        {isSubmitting ? <LucideLoader2 className="w-4 h-4 animate-spin" /> : null}
                        Generate plan
                    </button>
                </div>
            )}

            <div className="flex items-center justify-between border-t border-border-light/60 pt-5">
                <button
                    type="button"
                    onClick={goToPrevious}
                    disabled={categoryIndex === 0 && questionIndex <= 0 && !showVerify}
                    className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-heading disabled:opacity-30 disabled:cursor-not-allowed"
                >
                    <LucideArrowLeft className="w-4 h-4" /> Back
                </button>
                {!showIntro && !showVerify ? (
                    <button
                        type="button"
                        onClick={goToNext}
                        className="inline-flex items-center gap-2 py-2.5 px-5 rounded-xl bg-dark text-white text-sm font-semibold hover:bg-darkest"
                    >
                        Next <LucideArrowRight className="w-4 h-4" />
                    </button>
                ) : null}
            </div>
        </div>
    );
};

const QuestionInput = ({
    question,
    value,
    onChange,
    onToggleCheckbox,
}: {
    question: Question;
    value: unknown;
    onChange: (value: unknown) => void;
    onToggleCheckbox: (value: string) => void;
}) => {
    const baseInputClass =
        "w-full bg-white border-2 border-border-light/60 rounded-2xl px-5 py-4 text-base text-heading placeholder:text-muted/40 outline-none focus:border-accent transition-all duration-200 font-medium";

    switch (question.type) {
        case "radio":
            return (
                <div className="space-y-2.5">
                    {(question.options ?? []).map((option, i) => (
                        <motion.button
                            key={option.value}
                            type="button"
                            onClick={() => onChange(option.value)}
                            initial={{ opacity: 0, y: 14 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                                delay: i * 0.055,
                                type: "spring",
                                stiffness: 380,
                                damping: 30,
                            }}
                            className={`w-full text-left px-5 py-4 rounded-2xl border-2 transition-all duration-200 cursor-pointer ${value === option.value
                                ? "border-accent bg-white shadow-sm"
                                : "border-border-light/60 hover:border-border bg-white/60 hover:bg-white"
                                }`}
                        >
                            <div className="flex items-center gap-3.5">
                                <div
                                    className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-all duration-200 ${value === option.value
                                        ? "border-accent bg-accent"
                                        : "border-border"
                                        }`}
                                >
                                    {value === option.value && (
                                        <div className="w-2 h-2 rounded-full bg-white" />
                                    )}
                                </div>
                                <span
                                    className={`text-sm font-semibold transition-colors ${value === option.value
                                        ? "text-heading"
                                        : "text-body"
                                        }`}
                                >
                                    {option.label}
                                </span>
                            </div>
                        </motion.button>
                    ))}
                </div>
            );
        case "checkbox":
            return (
                <div className="space-y-2.5">
                    {(question.options ?? []).map((option, i) => {
                        const checked = toNonEmptyStringArray(value).includes(option.value);
                        return (
                            <motion.button
                                key={option.value}
                                type="button"
                                onClick={() => onToggleCheckbox(option.value)}
                                initial={{ opacity: 0, y: 14 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{
                                    delay: i * 0.055,
                                    type: "spring",
                                    stiffness: 380,
                                    damping: 30,
                                }}
                                className={`w-full text-left px-5 py-4 rounded-2xl border-2 transition-all duration-200 cursor-pointer ${checked
                                    ? "border-accent bg-white shadow-sm"
                                    : "border-border-light/60 hover:border-border bg-white/60 hover:bg-white"
                                    }`}
                            >
                                <div className="flex items-center gap-3.5">
                                    <div
                                        className={`w-5 h-5 rounded-md border-2 shrink-0 flex items-center justify-center transition-all duration-200 ${checked
                                            ? "border-accent bg-accent"
                                            : "border-border"
                                            }`}
                                    >
                                        {checked && (
                                            <LucideCheck className="w-3 h-3 text-white" />
                                        )}
                                    </div>
                                    <span
                                        className={`text-sm font-semibold transition-colors ${checked ? "text-heading" : "text-body"
                                            }`}
                                    >
                                        {option.label}
                                    </span>
                                </div>
                            </motion.button>
                        );
                    })}
                </div>
            );
        case "textarea":
            return (
                <motion.textarea
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    value={String(value ?? "")}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={question.placeholder}
                    rows={4}
                    className={`${baseInputClass} min-h-32 resize-none`}
                />
            );
        case "date":
            return (
                <motion.input
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    type="date"
                    value={String(value ?? "")}
                    onChange={(e) => onChange(e.target.value)}
                    className={baseInputClass}
                />
            );
        case "country":
            return (
                <motion.div
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <CountryPicker
                        value={String(value ?? "")}
                        onChange={(name) => onChange(name)}
                        placeholder={question.placeholder ?? "Select country"}
                        inputClassName={`${baseInputClass} pr-10`}
                    />
                </motion.div>
            );
        case "multi_country":
            return (
                <MultiCountryInput
                    value={toMultiCountryEditArray(value)}
                    onChange={onChange}
                    placeholder={question.placeholder}
                />
            );
        case "trip_itinerary":
            return (
                <TripItineraryFlow
                    value={(value as TripItineraryData) || { tripType: "one" }}
                    onChange={(data) => onChange(data)}
                />
            );
        default:
            return (
                <motion.input
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    type="text"
                    value={String(value ?? "")}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={question.placeholder}
                    className={baseInputClass}
                />
            );
    }
};

const MultiCountryInput = ({
    value,
    onChange,
    placeholder,
}: {
    value: string[];
    onChange: (value: unknown) => void;
    placeholder?: string;
}) => {
    const countries = value.length > 0 ? value : [""];
    const updateCountry = (index: number, country: string) => {
        const updated = [...countries];
        updated[index] = country;
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
                            placeholder={placeholder ?? "Select a country"}
                            inputClassName="w-full bg-white border-2 border-border-light/60 rounded-2xl px-5 py-4 pr-10 text-base text-heading placeholder:text-muted/40 outline-none focus:border-accent transition-all duration-200 font-medium"
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

export default PlanQuestionnaireFlow;
