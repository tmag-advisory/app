import { useMemo, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import {
    LucideArrowLeft,
    LucideArrowRight,
    LucideCalendarDays,
    LucideCheck,
    LucideGlobe,
    LucideLoader2,
    LucideMapPin,
    LucidePlaneLanding,
    LucidePlaneTakeoff,
} from "lucide-react";
import toast from "react-hot-toast";
import CountryPicker from "../CountryPicker";
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

const LEGACY_TRAVEL_KEYS = new Set([
    "travel_countries",
    "travel_city_region",
    "departure_date",
    "return_date_or_duration",
]);

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

function shouldHideLegacyTravelQuestion(question: Question, categoryQuestions: Question[]): boolean {
    const hasTripItinerary = categoryQuestions.some((q) => q.key === "trip_itinerary");
    return hasTripItinerary && LEGACY_TRAVEL_KEYS.has(question.key);
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

function getDisplayValue(question: Question, value: unknown): string {
    if (value == null) return "Not provided";
    if (question.type === "trip_itinerary") {
        const trip = value as TripItineraryData;
        if (!trip?.tripType) return "Not provided";
        if (trip.tripType === "one") {
            const dest = [trip.oneCity, trip.oneDestination].filter(Boolean).join(", ");
            return `Single trip: ${dest || "Not provided"}`;
        }
        if (trip.tripType === "return") {
            return `Round trip: ${(trip.returnFrom ?? "").trim()} -> ${(trip.returnTo ?? "").trim()}`;
        }
        const count = trip.legs?.length ?? 0;
        return `Multi-stop: ${count} stops`;
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
    let destinationCountries = travelCountries.join(", ");
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

    if (!primaryCountry && itinerary) {
        if (itinerary.tripType === "one") {
            primaryCountry = (itinerary.oneDestination ?? "").trim();
            const oneCity = (itinerary.oneCity ?? "").trim();
            destination = [oneCity, primaryCountry].filter(Boolean).join(", ") || primaryCountry;
            duration = daysInclusiveBetween(itinerary.oneDepartureDate, itinerary.oneReturnDate) || duration;
            tripDetailsJson = JSON.stringify({
                tripType: "one-way",
                stops: [{ city: oneCity || primaryCountry, country: primaryCountry, order: 1 }],
            });
        } else if (itinerary.tripType === "return") {
            const from = (itinerary.returnFrom ?? "").trim();
            const to = (itinerary.returnTo ?? "").trim();
            const returnCity = (itinerary.returnCity ?? "").trim();
            primaryCountry = to;
            destination = [returnCity, to].filter(Boolean).join(", ");
            if (from && destination) destination = `${from} -> ${destination}`;
            tripType = "return";
            duration = daysInclusiveBetween(itinerary.returnDepartureDate, itinerary.returnReturnDate) || duration;
            tripDetailsJson = JSON.stringify({
                tripType: "return",
                departureDate: itinerary.returnDepartureDate ?? "",
                returnDate: itinerary.returnReturnDate ?? "",
                stops: [{ city: returnCity || to, country: to, order: 1 }],
            });
        } else if (itinerary.tripType === "multi") {
            const legs = itinerary.legs ?? [];
            const parts = legs
                .map((leg) => [leg.city?.trim(), leg.to?.trim()].filter(Boolean).join(", "))
                .filter(Boolean);
            destination = parts.join(" -> ");
            primaryCountry = (legs[0]?.to ?? "").trim();
            if (legs.length > 0) {
                duration = daysInclusiveBetween(legs[0]?.arrivalDate, legs[legs.length - 1]?.departureDate) || duration;
            }
            tripDetailsJson = JSON.stringify({
                tripType: "multi",
                stops: legs.map((leg, index) => ({
                    city: (leg.city ?? "").trim(),
                    country: (leg.to ?? "").trim(),
                    order: index + 1,
                })),
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
        (typeof answers.additional_considerations === "string" && answers.additional_considerations.trim()) ||
        (typeof answers.additional_relevant_activities === "string" && answers.additional_relevant_activities.trim()) ||
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

function isTripItineraryComplete(data: TripItineraryData | undefined): boolean {
    if (!data) return false;
    if (data.tripType === "one") {
        return Boolean(
            data.oneDestination?.trim() &&
            data.oneDepartureDate?.trim() &&
            data.oneReturnDate?.trim()
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
    const legs = data.legs ?? [];
    if (legs.length < 2) return false;
    return legs.every((leg) =>
        Boolean(leg.from?.trim() && leg.to?.trim() && leg.arrivalDate?.trim() && leg.departureDate?.trim())
    );
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
        !shouldHideLegacyTravelQuestion(q, currentCategory?.parsedQuestions ?? []) &&
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
            .filter(
                (q: Question) =>
                    !shouldHideLegacyTravelQuestion(q, cat.parsedQuestions) &&
                    shouldShowQuestion(q, answers)
            )
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
                                            className={`z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 text-[11px] font-bold ${
                                                idx < categoryIndex
                                                    ? "border-accent bg-accent text-white"
                                                    : idx === categoryIndex
                                                      ? "border-heading bg-heading text-white"
                                                      : "border-border-light bg-white text-muted"
                                            }`}
                                        >
                                            {idx < categoryIndex ? <LucideCheck className="h-3.5 w-3.5" /> : idx + 1}
                                        </div>
                                        <p
                                            className={`mt-2 text-center text-[11px] font-semibold leading-snug ${
                                                idx === categoryIndex ? "text-heading" : idx < categoryIndex ? "text-accent" : "text-muted"
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
        "w-full bg-white border border-border-light rounded-xl px-4 py-3.5 text-[15px] font-medium text-heading placeholder:text-muted/55 outline-none focus:border-accent";

    switch (question.type) {
        case "radio":
            return (
                <div className="space-y-3">
                    {(question.options ?? []).map((option) => (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => onChange(option.value)}
                            className={`w-full text-left p-4 rounded-xl border text-[15px] font-semibold transition-colors ${
                                value === option.value
                                    ? "border-accent bg-accent/10 text-heading"
                                    : "border-border-light/70 bg-white text-body hover:border-border-light"
                            }`}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            );
        case "checkbox":
            return (
                <div className="space-y-3">
                    {(question.options ?? []).map((option) => {
                        const checked = toNonEmptyStringArray(value).includes(option.value);
                        return (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => onToggleCheckbox(option.value)}
                                className={`w-full text-left p-4 rounded-xl border text-[15px] font-semibold transition-colors ${
                                    checked ? "border-accent bg-accent/10 text-heading" : "border-border-light/70 bg-white text-body hover:border-border-light"
                                }`}
                            >
                                {option.label}
                            </button>
                        );
                    })}
                </div>
            );
        case "textarea":
            return (
                <textarea
                    value={String(value ?? "")}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={question.placeholder}
                    rows={4}
                    className={`${baseInputClass} min-h-32 resize-none`}
                />
            );
        case "date":
            return (
                <input
                    type="date"
                    value={String(value ?? "")}
                    onChange={(e) => onChange(e.target.value)}
                    className={baseInputClass}
                />
            );
        case "country":
            return (
                <CountryPicker
                    value={String(value ?? "")}
                    onChange={(name) => onChange(name)}
                    placeholder={question.placeholder ?? "Select country"}
                    inputClassName={`${baseInputClass} pr-10`}
                />
            );
        case "multi_country":
            return (
                <MultiCountryInput
                    value={toNonEmptyStringArray(value)}
                    onChange={onChange}
                    placeholder={question.placeholder}
                />
            );
        case "trip_itinerary":
            return (
                <TripItineraryInput
                    value={(value as TripItineraryData) || { tripType: "one" }}
                    onChange={onChange}
                />
            );
        default:
            return (
                <input
                    type="text"
                    value={String(value ?? "")}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={question.placeholder}
                    className={baseInputClass}
                />
            );
    }
};

const FieldLabel = ({ label }: { label: string }) => (
    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.08em] text-muted">{label}</label>
);

const TripItineraryInput = ({
    value,
    onChange,
}: {
    value: TripItineraryData;
    onChange: (value: unknown) => void;
}) => {
    const data: TripItineraryData = {
        ...value,
        tripType: value?.tripType ?? "one",
        legs: value?.legs ?? [],
    };

    const update = (patch: Partial<TripItineraryData>) => onChange({ ...data, ...patch });
    const setTripType = (tripType: TripItineraryData["tripType"]) => {
        const patch: Partial<TripItineraryData> = { tripType };
        if (tripType === "multi" && (!data.legs || data.legs.length < 2)) {
            patch.legs = [
                { from: "", to: "", city: "", arrivalDate: "", departureDate: "" },
                { from: "", to: "", city: "", arrivalDate: "", departureDate: "" },
            ];
        }
        update(patch);
    };
    const updateLeg = (index: number, patch: Partial<TripLeg>) => {
        const legs = [...(data.legs ?? [])];
        legs[index] = { ...legs[index], ...patch };
        update({ legs });
    };
    const addLeg = () =>
        update({
            legs: [...(data.legs ?? []), { from: "", to: "", city: "", arrivalDate: "", departureDate: "" }],
        });
    const removeLeg = (index: number) =>
        update({ legs: (data.legs ?? []).filter((_, idx) => idx !== index) });

    return (
        <div className="space-y-5">
            <div className="grid grid-cols-3 gap-2.5">
                {[
                    { value: "one" as const, label: "Single trip" },
                    { value: "return" as const, label: "Round trip" },
                    { value: "multi" as const, label: "Multi-stop" },
                ].map((option) => (
                    <button
                        key={option.value}
                        type="button"
                        onClick={() => setTripType(option.value)}
                        className={`px-3 py-2.5 rounded-xl text-sm font-semibold border ${
                            data.tripType === option.value
                                ? "bg-dark text-white border-dark"
                                : "bg-white text-muted border-border-light"
                        }`}
                    >
                        {option.label}
                    </button>
                ))}
            </div>

            {data.tripType === "one" && (
                <div className="space-y-4">
                    <div>
                        <FieldLabel label="Destination country" />
                        <div className="relative">
                            <LucideGlobe className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                            <CountryPicker
                                value={data.oneDestination ?? ""}
                                onChange={(country) => update({ oneDestination: country })}
                                placeholder="Select destination country"
                                inputClassName="w-full bg-white border border-border-light rounded-xl px-4 py-3.5 pl-10 pr-10 text-[15px] font-medium text-heading placeholder:text-muted/55 outline-none focus:border-accent"
                            />
                        </div>
                    </div>
                    <div>
                        <FieldLabel label="City or region" />
                        <div className="relative">
                            <LucideMapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                            <input
                                type="text"
                                value={data.oneCity ?? ""}
                                onChange={(e) => update({ oneCity: e.target.value })}
                                placeholder="Enter city or region (optional)"
                                className="w-full bg-white border border-border-light rounded-xl px-4 py-3.5 pl-10 text-[15px] font-medium text-heading placeholder:text-muted/55 outline-none focus:border-accent"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <FieldLabel label="Departure date" />
                            <div className="relative">
                                <LucidePlaneTakeoff className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                                <input
                                    type="date"
                                    value={data.oneDepartureDate ?? ""}
                                    onChange={(e) => update({ oneDepartureDate: e.target.value })}
                                    className="w-full bg-white border border-border-light rounded-xl px-4 py-3.5 pl-10 text-[15px] font-medium text-heading outline-none focus:border-accent"
                                />
                            </div>
                        </div>
                        <div>
                            <FieldLabel label="Return date" />
                            <div className="relative">
                                <LucidePlaneLanding className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                                <input
                                    type="date"
                                    value={data.oneReturnDate ?? ""}
                                    onChange={(e) => update({ oneReturnDate: e.target.value })}
                                    className="w-full bg-white border border-border-light rounded-xl px-4 py-3.5 pl-10 text-[15px] font-medium text-heading outline-none focus:border-accent"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {data.tripType === "return" && (
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <FieldLabel label="From country" />
                            <div className="relative">
                                <LucidePlaneTakeoff className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                                <CountryPicker
                                    value={data.returnFrom ?? ""}
                                    onChange={(country) => update({ returnFrom: country })}
                                    placeholder="Select departure country"
                                    inputClassName="w-full bg-white border border-border-light rounded-xl px-4 py-3.5 pl-10 pr-10 text-[15px] font-medium text-heading placeholder:text-muted/55 outline-none focus:border-accent"
                                />
                            </div>
                        </div>
                        <div>
                            <FieldLabel label="To country" />
                            <div className="relative">
                                <LucidePlaneLanding className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                                <CountryPicker
                                    value={data.returnTo ?? ""}
                                    onChange={(country) => update({ returnTo: country })}
                                    placeholder="Select destination country"
                                    inputClassName="w-full bg-white border border-border-light rounded-xl px-4 py-3.5 pl-10 pr-10 text-[15px] font-medium text-heading placeholder:text-muted/55 outline-none focus:border-accent"
                                />
                            </div>
                        </div>
                    </div>
                    <div>
                        <FieldLabel label="City or region" />
                        <div className="relative">
                            <LucideMapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                            <input
                                type="text"
                                value={data.returnCity ?? ""}
                                onChange={(e) => update({ returnCity: e.target.value })}
                                placeholder="Enter city or region (optional)"
                                className="w-full bg-white border border-border-light rounded-xl px-4 py-3.5 pl-10 text-[15px] font-medium text-heading placeholder:text-muted/55 outline-none focus:border-accent"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <FieldLabel label="Departure date" />
                            <div className="relative">
                                <LucideCalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                                <input
                                    type="date"
                                    value={data.returnDepartureDate ?? ""}
                                    onChange={(e) => update({ returnDepartureDate: e.target.value })}
                                    className="w-full bg-white border border-border-light rounded-xl px-4 py-3.5 pl-10 text-[15px] font-medium text-heading outline-none focus:border-accent"
                                />
                            </div>
                        </div>
                        <div>
                            <FieldLabel label="Return date" />
                            <div className="relative">
                                <LucideCalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                                <input
                                    type="date"
                                    value={data.returnReturnDate ?? ""}
                                    onChange={(e) => update({ returnReturnDate: e.target.value })}
                                    className="w-full bg-white border border-border-light rounded-xl px-4 py-3.5 pl-10 text-[15px] font-medium text-heading outline-none focus:border-accent"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {data.tripType === "multi" && (
                <div className="space-y-4">
                    {(data.legs ?? []).map((leg, index) => (
                        <div key={index} className="rounded-xl border border-border-light/70 bg-background-primary/60 p-4 space-y-3">
                            <div className="flex items-center justify-between">
                                <p className="text-xs font-semibold text-muted">Stop {index + 1}</p>
                                {index > 0 && (
                                    <button type="button" onClick={() => removeLeg(index)} className="text-xs text-muted hover:text-heading">
                                        Remove
                                    </button>
                                )}
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <FieldLabel label="From country" />
                                    <div className="relative">
                                        <LucidePlaneTakeoff className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                                        <CountryPicker
                                            value={leg.from}
                                            onChange={(country) => updateLeg(index, { from: country })}
                                            placeholder="Select departure country"
                                            inputClassName="w-full bg-white border border-border-light rounded-xl px-4 py-3 pl-10 pr-8 text-sm font-medium text-heading placeholder:text-muted/55 outline-none focus:border-accent"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <FieldLabel label="To country" />
                                    <div className="relative">
                                        <LucidePlaneLanding className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                                        <CountryPicker
                                            value={leg.to}
                                            onChange={(country) => updateLeg(index, { to: country })}
                                            placeholder="Select destination country"
                                            inputClassName="w-full bg-white border border-border-light rounded-xl px-4 py-3 pl-10 pr-8 text-sm font-medium text-heading placeholder:text-muted/55 outline-none focus:border-accent"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div>
                                <FieldLabel label="City or region" />
                                <div className="relative">
                                    <LucideMapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                                    <input
                                        type="text"
                                        value={leg.city}
                                        onChange={(e) => updateLeg(index, { city: e.target.value })}
                                        placeholder="Enter city or region (optional)"
                                        className="w-full bg-white border border-border-light rounded-xl px-4 py-3 pl-10 text-sm font-medium text-heading placeholder:text-muted/55 outline-none focus:border-accent"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <FieldLabel label="Arrival date" />
                                    <div className="relative">
                                        <LucideCalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                                        <input
                                            type="date"
                                            value={leg.arrivalDate}
                                            onChange={(e) => updateLeg(index, { arrivalDate: e.target.value })}
                                            className="w-full bg-white border border-border-light rounded-xl px-4 py-3 pl-10 text-sm font-medium text-heading outline-none focus:border-accent"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <FieldLabel label="Departure date" />
                                    <div className="relative">
                                        <LucideCalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                                        <input
                                            type="date"
                                            value={leg.departureDate}
                                            onChange={(e) => updateLeg(index, { departureDate: e.target.value })}
                                            className="w-full bg-white border border-border-light rounded-xl px-4 py-3 pl-10 text-sm font-medium text-heading outline-none focus:border-accent"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    <button type="button" onClick={addLeg} className="text-xs font-semibold text-accent hover:underline">
                        + Add stop
                    </button>
                </div>
            )}
        </div>
    );
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
        <div className="space-y-4">
            {countries.map((country, idx) => (
                <div key={`${idx}-${country}`} className="flex items-start gap-2">
                    <div className="flex-1">
                        <FieldLabel label={`Destination country ${idx + 1}`} />
                        <div className="relative">
                            <LucideGlobe className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                        <CountryPicker
                            value={country}
                            onChange={(name) => updateCountry(idx, name)}
                            placeholder={placeholder ?? "Select a country"}
                            inputClassName="w-full bg-white border border-border-light rounded-xl px-4 py-3.5 pl-10 pr-10 text-[15px] font-medium text-heading placeholder:text-muted/55 outline-none focus:border-accent"
                        />
                        </div>
                    </div>
                    {countries.length > 1 && (
                        <button
                            type="button"
                            onClick={() => removeCountry(idx)}
                            className="mt-2 text-sm text-muted hover:text-heading"
                        >
                            Remove
                        </button>
                    )}
                </div>
            ))}
            <button
                type="button"
                onClick={addCountry}
                className="text-xs font-semibold text-accent hover:underline"
            >
                + Add another country
            </button>
        </div>
    );
};

export default PlanQuestionnaireFlow;
