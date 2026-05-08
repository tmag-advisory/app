import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    LucideArrowLeft,
    LucideArrowRight,
    LucideCheck,
    LucideChevronDown,
    LucideChevronUp,
    LucideLoader2,
    LucidePlus,
    LucideUsers,
    LucideX,
} from "lucide-react";
import toast from "react-hot-toast";
import CountryPicker from "../CountryPicker";
import TripItineraryFlow, { hydrateLegacyTripItinerary, type TripItineraryData } from "./TripItineraryFlow";
import { mergeCityCountry } from "./tripItineraryMerge";
import { validateTripItineraryDates, getTripItineraryMissingFieldError } from "./tripItineraryValidation";
import {
    daysInclusiveBetweenIso,
    isDateOfBirthPlausible,
    isPlausibleEmail,
    isValidOptionalNonNegativeNumber,
    todayIsoDateLocal,
} from "../../lib/questionnaireFieldValidation";
import { useOnboardingQuestions, useAcceptQuestionnaireConsent, useDoctorReviewers } from "../../api/hooks";
import { useAuth } from "../../context/AuthContext";

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
    /** Days away; null only when not inferable — server fills from tripDetailsJson if missing */
    duration: number | null;
    purpose: string;
    medicalConsiderations: string;
    tripType: "one-way" | "return" | "multi" | "transit";
    tripDetailsJson: string;
    questionnaireResponses: Record<string, unknown>;
    selectedDoctorIds?: number[];
}

export interface PlanQuestionnaireFlowHandle {
    goToCategory: (index: number) => void;
    goToVerify: () => void;
}

interface PlanQuestionnaireFlowProps {
    credits: number;
    verifyTopSlot?: ReactNode;
    onSubmitPlan: (payload: QuestionnairePlanPayload) => Promise<void>;
    isSubmitting?: boolean;
    /** Sidebar slot — if provided, replaces the internal horizontal progress stepper */
    sidebarSlot?: ReactNode;
    /** Pre-populated answers (for draft resume) */
    initialAnswers?: Record<string, unknown>;
    /** Pre-populated category index (for draft resume) */
    initialCategoryIndex?: number;
    initialShowVerify?: boolean;
    initialRiskConsentGiven?: boolean;
    initialMedicalDisclaimerConsentGiven?: boolean;
    onSaveDraft?: () => void | Promise<void>;
    isSavingDraft?: boolean;
    /** Callback fired when answers or category state changes (for sidebar sync / draft save) */
    onStateChange?: (state: {
        answers: Record<string, unknown>;
        categoryIndex: number;
        showVerify: boolean;
        riskConsentGiven: boolean;
        medicalDisclaimerConsentGiven: boolean;
    }) => void;
}

const CONSENT_TEXT =
    "I hereby give Travel Medicine Advisory Global my explicit consent to collect, process, and store my personal and sensitive health information (including medical history, medications, pregnancy status, and risk behaviours) for the sole purpose of generating my personalised travel health advisory plan.";
const DATA_PROTECTION_TEXT =
    "We protect your information with encryption, multi-factor authentication, and strict security measures. We comply with the Nigeria Data Protection Act (NDPA) 2023. Your data will not be sold or shared without your permission.";

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

function parsePositiveInteger(value?: string): number {
    const parsed = parseInt(value ?? "", 10);
    return Number.isNaN(parsed) || parsed <= 0 ? 0 : parsed;
}

function durationDaysFromLengthOfStay(value?: string): number {
    switch ((value ?? "").trim()) {
        case "<1m":
            return 30;
        case "1-3m":
            return 90;
        case "3-6m":
            return 180;
        case "6-12m":
            return 365;
        case "12m+":
        case "open":
            return 366;
        default:
            return 0;
    }
}

function durationDaysFromTransitDuration(value?: string): number {
    switch ((value ?? "").trim()) {
        case "<12h":
        case "12-24h":
            return 1;
        case ">24h":
            return 2;
        default:
            return 0;
    }
}

/** Recover duration from the JSON we send to the API when primary derivation yields 0 */
function inferDurationFromTripDetailsJson(tripDetailsJson: string): number {
    try {
        const j = JSON.parse(tripDetailsJson) as Record<string, unknown>;
        const tt = String(j.tripType ?? "").trim();
        if (tt === "return") {
            return daysInclusiveBetweenIso(
                String(j.departureDate ?? "").trim(),
                String(j.returnDate ?? "").trim(),
            );
        }
        if (tt === "transit") {
            const dep = String(j.departureDate ?? "").trim();
            const ret = String(j.returnDate ?? "").trim();
            const span = daysInclusiveBetweenIso(dep, ret);
            if (span > 0) return span;
            return durationDaysFromTransitDuration(String(j.transitDuration ?? ""));
        }
        if (tt === "multi") {
            const overall = String(j.overallReturnDate ?? "").trim();
            const stops = j.stops as Array<{ arrivalDate?: string; nights?: string }> | undefined;
            const firstArrival = stops?.map((s) => String(s?.arrivalDate ?? "").trim()).find(Boolean) ?? "";
            const span = daysInclusiveBetweenIso(firstArrival, overall);
            if (span > 0) return span;
            const totalNights = (stops ?? []).reduce((sum, leg) => sum + parsePositiveInteger(leg.nights), 0);
            return totalNights > 0 ? totalNights + 1 : 0;
        }
        if (tt === "one-way") {
            return durationDaysFromLengthOfStay(String(j.lengthOfStay ?? ""));
        }
    } catch {
        return 0;
    }
    return 0;
}

function durationDaysFromMultiStop(legs: TripItineraryData["multiLegs"], overallReturnDate?: string): number {
    const validLegs = legs ?? [];
    const firstArrivalDate = validLegs
        .map((leg) => leg.arrivalDate?.trim() ?? "")
        .find(Boolean);
    const dateDuration = daysInclusiveBetweenIso(firstArrivalDate, overallReturnDate);
    if (dateDuration > 0) return dateDuration;

    const totalNights = validLegs.reduce((sum, leg) => sum + parsePositiveInteger(leg.nights), 0);
    return totalNights > 0 ? totalNights + 1 : 0;
}

function isTripItineraryComplete(data: TripItineraryData | undefined): boolean {
    if (!data) return false;
    const d = hydrateLegacyTripItinerary(data);
    let filled = false;
    if (d.tripType === "one") {
        filled = Boolean(
            d.oneFromCity?.trim() &&
                d.oneFromCountry?.trim() &&
                d.oneToCity?.trim() &&
                d.oneTo?.trim() &&
                d.oneDepartureDate?.trim() &&
                d.oneLengthOfStay?.trim()
        );
    } else if (d.tripType === "return") {
        filled = Boolean(
            d.returnFromCity?.trim() &&
                d.returnFromCountry?.trim() &&
                d.returnToCity?.trim() &&
                d.returnTo?.trim() &&
                d.returnDepartureDate?.trim() &&
                d.returnReturnDate?.trim()
        );
    } else if (d.tripType === "multi") {
        const legs = d.multiLegs ?? [];
        if (legs.length < 1) return false;
        if (!d.multiDepartingFromCity?.trim() || !d.multiDepartingFromCountry?.trim()) return false;
        filled = legs.every(
            (leg) => leg.country?.trim() && leg.arrivalDate?.trim() && leg.nights?.trim()
        );
    } else if (d.tripType === "transit") {
        filled = Boolean(
            d.transitFromCity?.trim() &&
                d.transitFromCountry?.trim() &&
                d.transitFinalDestinationCity?.trim() &&
                d.transitFinalDestination?.trim() &&
                d.transitLocation?.trim() &&
                d.transitDuration?.trim() &&
                d.transitDepartureDate?.trim()
        );
    }
    return filled && validateTripItineraryDates(d) === null;
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

function toMultiCountryEditArray(value: unknown): string[] {
    if (!Array.isArray(value)) return [];
    return value.map((entry) => String(entry ?? ""));
}

function getDisplayValue(question: Question, value: unknown): string {
    if (value == null) return "Not provided";
    if (question.type === "trip_itinerary") {
        const trip = hydrateLegacyTripItinerary(value as TripItineraryData);
        if (!trip?.tripType) return "Not provided";
        if (trip.tripType === "one") {
            const from = mergeCityCountry(trip.oneFromCity, trip.oneFromCountry) || (trip.oneFrom ?? "").trim();
            const to = mergeCityCountry(trip.oneToCity, trip.oneTo) || (trip.oneTo ?? "").trim();
            return `One-way: ${from} → ${to}`;
        }
        if (trip.tripType === "return") {
            const from = mergeCityCountry(trip.returnFromCity, trip.returnFromCountry) || (trip.returnFrom ?? "").trim();
            const to = mergeCityCountry(trip.returnToCity, trip.returnTo) || (trip.returnTo ?? "").trim();
            return `Return: ${from} → ${to}`;
        }
        if (trip.tripType === "multi") return `Multi-destination: ${trip.multiLegs?.length ?? 0} stop(s)`;
        if (trip.tripType === "transit") {
            const dep = mergeCityCountry(trip.transitFromCity, trip.transitFromCountry) || (trip.transitFrom ?? "").trim();
            const fin = mergeCityCountry(trip.transitFinalDestinationCity, trip.transitFinalDestination) || (trip.transitFinalDestination ?? "").trim();
            return `Transit: ${dep} via ${(trip.transitLocation ?? "").trim()} → ${fin}`;
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

    let duration = 0;
    let tripType: QuestionnairePlanPayload["tripType"] = "one-way";
    let tripDetailsJson = JSON.stringify({
        tripType: "one-way",
        stops: [{ city: city || primaryCountry, country: primaryCountry, order: 1 }],
    });

    if (isIsoDate(returnDateOrDuration)) {
        const calculated = daysInclusiveBetweenIso(departureDate, returnDateOrDuration);
        if (calculated > 0) duration = calculated;
        tripType = "return";
        tripDetailsJson = JSON.stringify({
            tripType: "return",
            departureDate,
            returnDate: returnDateOrDuration,
            stops: [{ city: city || primaryCountry, country: primaryCountry, order: 1 }],
        });
    } else {
        const parsedDuration = parsePositiveInteger(returnDateOrDuration);
        if (parsedDuration > 0) duration = parsedDuration;
    }

    if (itinerary) {
        const it = hydrateLegacyTripItinerary(itinerary);
        if (it.tripType === "one") {
            primaryCountry = (it.oneTo ?? "").trim();
            const fromMerged = mergeCityCountry(it.oneFromCity, it.oneFromCountry) || (it.oneFrom ?? "").trim();
            const toMerged = mergeCityCountry(it.oneToCity, it.oneTo) || primaryCountry;
            destination = toMerged;
            if (fromMerged) destination = `${fromMerged} → ${toMerged}`;
            tripType = "one-way";
            const oneWayDuration = durationDaysFromLengthOfStay(it.oneLengthOfStay);
            if (oneWayDuration > 0) duration = oneWayDuration;
            tripDetailsJson = JSON.stringify({
                tripType: "one-way",
                departureCity: fromMerged,
                destination: toMerged,
                departureDate: it.oneDepartureDate ?? "",
                lengthOfStay: it.oneLengthOfStay ?? "",
                purpose: it.onePurpose ?? "",
                flightNumber: it.oneFlightNumber ?? "",
                stops: [{ city: (it.oneToCity ?? "").trim(), country: primaryCountry, order: 1 }],
            });
        } else if (it.tripType === "return") {
            const fromMerged = mergeCityCountry(it.returnFromCity, it.returnFromCountry) || (it.returnFrom ?? "").trim();
            const toMerged = mergeCityCountry(it.returnToCity, it.returnTo) || (it.returnTo ?? "").trim();
            primaryCountry = (it.returnTo ?? "").trim();
            destination = toMerged;
            if (fromMerged) destination = `${fromMerged} → ${toMerged}`;
            tripType = "return";
            const returnDuration = daysInclusiveBetweenIso(it.returnDepartureDate, it.returnReturnDate);
            if (returnDuration > 0) duration = returnDuration;
            tripDetailsJson = JSON.stringify({
                tripType: "return",
                departureCity: fromMerged,
                destination: toMerged,
                departureDate: it.returnDepartureDate ?? "",
                returnDate: it.returnReturnDate ?? "",
                outboundFlightNumber: it.outboundFlightNumber ?? "",
                returnFlightNumber: it.returnFlightNumber ?? "",
                stops: [{ city: (it.returnToCity ?? "").trim(), country: primaryCountry, order: 1 }],
            });
        } else if (it.tripType === "multi") {
            const legs = it.multiLegs ?? [];
            const parts = legs
                .map((leg) => [leg.city?.trim(), leg.country?.trim()].filter(Boolean).join(", "))
                .filter(Boolean);
            destination = parts.join(" → ");
            primaryCountry = (legs[0]?.country ?? "").trim();
            tripType = "multi";
            const multiStopDuration = durationDaysFromMultiStop(legs, it.multiOverallReturnDate);
            if (multiStopDuration > 0) duration = multiStopDuration;
            const departingMerged =
                mergeCityCountry(it.multiDepartingFromCity, it.multiDepartingFromCountry) || (it.multiDepartingFrom ?? "").trim();
            tripDetailsJson = JSON.stringify({
                tripType: "multi",
                departingFrom: departingMerged,
                finalReturnDestination: it.multiFinalReturnDestination ?? "",
                overallReturnDate: it.multiOverallReturnDate ?? "",
                stops: legs.map((leg, index) => ({
                    city: (leg.city ?? "").trim(),
                    country: (leg.country ?? "").trim(),
                    arrivalDate: leg.arrivalDate ?? "",
                    nights: leg.nights ?? "",
                    order: index + 1,
                })),
            });
        } else if (it.tripType === "transit") {
            primaryCountry = (it.transitFinalDestination ?? "").trim();
            const depMerged = mergeCityCountry(it.transitFromCity, it.transitFromCountry) || (it.transitFrom ?? "").trim();
            const finMerged =
                mergeCityCountry(it.transitFinalDestinationCity, it.transitFinalDestination) || primaryCountry;
            destination = `${depMerged} via ${(it.transitLocation ?? "").trim()} → ${finMerged}`;
            tripType = "transit";
            const transitDuration = daysInclusiveBetweenIso(it.transitDepartureDate, it.transitReturnDate);
            if (transitDuration > 0) {
                duration = transitDuration;
            } else {
                const transitDurationBucket = durationDaysFromTransitDuration(it.transitDuration);
                if (transitDurationBucket > 0) duration = transitDurationBucket;
            }
            tripDetailsJson = JSON.stringify({
                tripType: "transit",
                departureCity: depMerged,
                finalDestination: finMerged,
                transitLocation: it.transitLocation ?? "",
                transitDuration: it.transitDuration ?? "",
                departureDate: it.transitDepartureDate ?? "",
                returnDate: it.transitReturnDate ?? "",
                stops: [{ city: (it.transitFinalDestinationCity ?? "").trim(), country: primaryCountry, order: 1 }],
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
        (typeof answers.additional_considerations === "string" && answers.additional_considerations.trim()) ||
        (typeof answers.additional_information === "string" && answers.additional_information.trim()) ||
        "";

    if (duration <= 0) {
        duration = inferDurationFromTripDetailsJson(tripDetailsJson);
    }

    return {
        destination,
        country: primaryCountry,
        duration: duration > 0 ? duration : null,
        purpose,
        medicalConsiderations,
        tripType,
        tripDetailsJson,
        questionnaireResponses: answers,
    };
}

// ── Keys that should be pre-filled and read-only ──────────────────────────────
const PREFILLED_KEYS = new Set(["full_name_passport", "email_address"]);

const PlanQuestionnaireFlow = forwardRef<
    PlanQuestionnaireFlowHandle,
    PlanQuestionnaireFlowProps
>(
    (
        {
            credits,
            verifyTopSlot,
            onSubmitPlan,
            isSubmitting = false,
            sidebarSlot,
            initialAnswers,
            initialCategoryIndex = 0,
            initialShowVerify = false,
            initialRiskConsentGiven = false,
            initialMedicalDisclaimerConsentGiven,
            onSaveDraft,
            isSavingDraft = false,
            onStateChange,
        },
        ref,
    ) => {
        const { data: categoriesRaw, isLoading } = useOnboardingQuestions();
        const { data: reviewers = [] } = useDoctorReviewers();
        const { user } = useAuth();
        const isFreePlan = !user?.user_credit_plan || user.user_credit_plan.code === "ESSENTIAL";
        const acceptConsent = useAcceptQuestionnaireConsent();
        const [answers, setAnswers] = useState<Record<string, unknown>>(
            initialAnswers ?? {},
        );
        const [fieldErrors, setFieldErrors] = useState<Set<string>>(new Set());
        const [categoryIndex, setCategoryIndex] =
            useState(initialCategoryIndex);
        const [showVerify, setShowVerify] = useState(initialShowVerify);
        const [wantsDoctorSelection, setWantsDoctorSelection] = useState(false);
        const [selectedDoctorIds, setSelectedDoctorIds] = useState<number[]>([]);
        // For Personal Health & Risk Behaviours: consent state lives on the intro card
        const [riskConsentGiven, setRiskConsentGiven] = useState(
            initialRiskConsentGiven,
        );
        const [
            medicalDisclaimerConsentGiven,
            setMedicalDisclaimerConsentGiven,
        ] = useState(
            initialMedicalDisclaimerConsentGiven ??
                (initialCategoryIndex > 0 || initialShowVerify || (user?.consentValid ?? false)),
        );

        // Track which field to highlight when navigating from verify page
        const [highlightedFieldKey, setHighlightedFieldKey] = useState<string | null>(null);

        // Notify parent of state changes (for sidebar sync / draft save)
        useEffect(() => {
            onStateChange?.({
                answers,
                categoryIndex,
                showVerify,
                riskConsentGiven,
                medicalDisclaimerConsentGiven,
            });
        }, [
            answers,
            categoryIndex,
            showVerify,
            riskConsentGiven,
            medicalDisclaimerConsentGiven,
            onStateChange,
        ]);

        // Pre-fill user data on first load
        useEffect(() => {
            if (!user) return;
            const fullName = [user.first_name, user.last_name]
                .filter(Boolean)
                .join(" ")
                .trim();
            setAnswers((prev) => ({
                ...prev,
                ...(fullName && !prev.full_name_passport ?
                    { full_name_passport: fullName }
                :   {}),
                ...(user.email && !prev.email_address ?
                    { email_address: user.email }
                :   {}),
            }));
        }, [user]);

        // Scroll to highlighted field when navigating from verify page
        useEffect(() => {
            if (!highlightedFieldKey) return;
            const rafId = requestAnimationFrame(() => {
                const el = document.getElementById(`question-field-${highlightedFieldKey}`);
                if (el) {
                    el.scrollIntoView({ behavior: "smooth", block: "center" });
                }
            });
            const timer = setTimeout(() => setHighlightedFieldKey(null), 4000);
            return () => {
                cancelAnimationFrame(rafId);
                clearTimeout(timer);
            };
        }, [highlightedFieldKey]);

        const categories = useMemo(
            () =>
                ((categoriesRaw as QuestionCategory[] | undefined) ?? []).map(
                    (cat) => ({
                        ...cat,
                        parsedQuestions: (typeof cat.questions === "string" ?
                            JSON.parse(cat.questions)
                        :   cat.questions) as Question[],
                    }),
                ),
            [categoriesRaw],
        );

        // Map question keys to their category indices for verify-page navigation
        const questionKeyToCategoryIndex = useMemo(() => {
            const map = new Map<string, number>();
            categories.forEach((cat, idx) => {
                cat.parsedQuestions.forEach((q: Question) => {
                    map.set(q.key, idx);
                });
            });
            return map;
        }, [categories]);

        useImperativeHandle(
            ref,
            () => ({
                goToCategory: (index: number) => {
                    if (index < 0 || index >= categories.length) return;
                    setCategoryIndex(index);
                    setShowVerify(false);
                },
                goToVerify: () => {
                    if (categories.length === 0) return;
                    setShowVerify(true);
                },
            }),
            [categories.length],
        );

        const currentCategory = categories[categoryIndex];
        const isRiskSection =
            currentCategory?.category_key === "personal_health_risk_behaviours";
        const requiresMedicalDisclaimerConsent = categoryIndex === 0;

        const visibleQuestions: Question[] = (
            currentCategory?.parsedQuestions ?? []
        ).filter((q: Question) => shouldShowQuestion(q, answers));

        const isRequiredAnswered = (question: Question): boolean => {
            if (!question.required) return true;
            const value = answers[question.key];
            if (question.type === "trip_itinerary")
                return isTripItineraryComplete(
                    value as TripItineraryData | undefined,
                );
            if (
                question.type === "checkbox" ||
                question.type === "multi_country"
            )
                return toNonEmptyStringArray(value).length > 0;
            return String(value ?? "").trim().length > 0;
        };

        const validateCurrentPage = (): boolean => {
            const errors = new Set<string>();
            const toastMessages: string[] = [];

            // 1. Collect all unanswered required fields
            for (const q of visibleQuestions) {
                if (!isRequiredAnswered(q)) {
                    errors.add(q.key);
                    if (q.type === "trip_itinerary") {
                        const d = hydrateLegacyTripItinerary(
                            answers[q.key] as TripItineraryData,
                        );
                        const missingErr = getTripItineraryMissingFieldError(d);
                        if (missingErr) {
                            toastMessages.push(missingErr);
                        }
                        const tripErr = validateTripItineraryDates(d);
                        if (tripErr) {
                            toastMessages.push(tripErr);
                        }
                    }
                }
            }

            // 2. Collect all invalid-value fields
            for (const q of visibleQuestions) {
                const v = String(answers[q.key] ?? "").trim();
                if (q.key === "date_of_birth" && v && !isDateOfBirthPlausible(v)) {
                    errors.add(q.key);
                    toastMessages.push("Date of birth cannot be in the future.");
                }
                if (q.key === "email_address" && v && !isPlausibleEmail(v)) {
                    errors.add(q.key);
                    toastMessages.push("Please enter a valid email address.");
                }
                if (
                    (q.key === "longest_flight_leg_hours" ||
                     q.key === "total_flying_hours" ||
                     q.key === "number_of_flight_legs") &&
                    v && !isValidOptionalNonNegativeNumber(v)
                ) {
                    errors.add(q.key);
                    toastMessages.push(`Please enter a valid non-negative number for "${q.text}"`);
                }
            }

            if (errors.size > 0) {
                setFieldErrors(errors);
                if (toastMessages.length > 0) {
                    toast.error(toastMessages[0]);
                } else {
                    toast.error("Please fill in all required fields.");
                }
                return false;
            }

            setFieldErrors(new Set());
            return true;
        };

        const goToNext = () => {
            setFieldErrors(new Set());
            if (requiresMedicalDisclaimerConsent &&
                !medicalDisclaimerConsentGiven) {
                toast.error("Please read and agree to the Consent, Medical Disclaimer, and Privacy Policy.");
                return;
            }
            if (isRiskSection && !riskConsentGiven) {
                toast.error("Please agree to answer this section before continuing.");
                return;
            }
            if (!validateCurrentPage()) return;
            const nextCategory = categoryIndex + 1;
            if (nextCategory < categories.length) {
                setCategoryIndex(nextCategory);
                return;
            }
            setShowVerify(true);
        };

        const goToPrevious = () => {
            setFieldErrors(new Set());
            if (showVerify) {
                setCategoryIndex(categories.length - 1);
                setShowVerify(false);
                return;
            }
            if (categoryIndex === 0) return;
            setCategoryIndex((idx) => idx - 1);
        };

        const handleGeneratePlan = async () => {
            const trip = answers.trip_itinerary as
                | TripItineraryData
                | undefined;
            if (trip) {
                const d = hydrateLegacyTripItinerary(trip);
                const missingErr = getTripItineraryMissingFieldError(d);
                if (missingErr) {
                    toast.error(missingErr);
                    return;
                }
                const tripErr = validateTripItineraryDates(d);
                if (tripErr) {
                    toast.error(tripErr);
                    return;
                }
            }
            const payload = buildPlanPayloadFromAnswers(answers);
            if (!payload) {
                toast.error("Please provide at least one destination country.");
                return;
            }
            if (credits <= 0) {
                toast.error("You don't have enough credits.");
                return;
            }
            await onSubmitPlan({
                ...payload,
                selectedDoctorIds: wantsDoctorSelection ? selectedDoctorIds : [],
            });
        };

        const handleVerifyItemClick = useCallback((questionKey: string) => {
            const idx = questionKeyToCategoryIndex.get(questionKey);
            if (idx !== undefined) {
                setCategoryIndex(idx);
                setShowVerify(false);
                setHighlightedFieldKey(questionKey);
            }
        }, [questionKeyToCategoryIndex]);

        const setAnswer = (key: string, value: unknown) => {
            setAnswers((prev) => ({ ...prev, [key]: value }));
            setFieldErrors((prev) => {
                const next = new Set(prev);
                next.delete(key);
                return next;
            });
        };

        const toggleCheckbox = (key: string, value: string) => {
            setAnswers((prev) => {
                const current = toNonEmptyStringArray(prev[key]);
                return {
                    ...prev,
                    [key]:
                        current.includes(value) ?
                            current.filter((v) => v !== value)
                        :   [...current, value],
                };
            });
            setFieldErrors((prev) => {
                const next = new Set(prev);
                next.delete(key);
                return next;
            });
        };

        if (isLoading) {
            return (
                <div className="min-h-90 flex items-center justify-center">
                    <div className="text-center space-y-3">
                        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
                        <p className="text-sm text-muted">
                            Loading questionnaire...
                        </p>
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
                })),
        );

        const isBackDisabled = categoryIndex === 0 && !showVerify;

        return (
            <div className="space-y-8">
                {onSaveDraft ?
                    <div className="sticky top-0 z-20 flex items-center justify-end border-b border-border-light/60 bg-background-primary/95 py-3 backdrop-blur">
                        <button
                            type="button"
                            onClick={() => void onSaveDraft()}
                            disabled={isSavingDraft}
                            className="inline-flex items-center gap-2 rounded-xl border-2 border-border-light/60 px-4 py-2 text-sm font-semibold text-muted transition-colors hover:border-border hover:text-heading disabled:opacity-40"
                        >
                            {isSavingDraft ?
                                <LucideLoader2 className="h-4 w-4 animate-spin" />
                            :   null}
                            Save draft
                        </button>
                    </div>
                :   null}
                {/* ── Sidebar slot (replaces internal stepper when provided) ── */}
                {sidebarSlot}

                {/* ── Questions page (all questions for this section) ───── */}
                {!showVerify && (
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={`questions-${currentCategory.category_key}`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="rounded-3xl border border-border-light/70 bg-white/80 p-5 py-7 md:p-9 space-y-8"
                        >
                            <div>
                                <p className="text-[11px] uppercase tracking-[0.12em] font-semibold text-accent mb-1">
                                    Section {categoryIndex + 1} of{" "}
                                    {categories.length}
                                </p>
                                <h3 className="text-2xl md:text-3xl font-serif text-heading leading-snug">
                                    {currentCategory.category_name}
                                </h3>
                                {currentCategory.category_description && (
                                    <p className="text-sm md:text-base text-muted mt-3 max-w-2xl leading-relaxed">
                                        {currentCategory.category_description}
                                    </p>
                                )}
                            </div>

                            {requiresMedicalDisclaimerConsent && (
                                <div className="p-4 rounded-2xl border-2 border-border-light/60 bg-background-primary/40">
                                    <p className="text-sm text-heading font-semibold mb-2">
                                        Before proceeding, please read and
                                        agree:
                                    </p>
                                    <p className="text-xs text-heading font-semibold mb-1">
                                        Consent
                                    </p>
                                    <p className="text-xs text-muted leading-relaxed mb-3">
                                        {CONSENT_TEXT}
                                    </p>
                                    <p className="text-xs text-heading font-semibold mb-1">
                                        Medical Disclaimer
                                    </p>
                                    <ul className="list-disc pl-4 text-xs text-muted leading-relaxed space-y-1 mb-3">
                                        <li>
                                            Your plan will be generated using AI
                                            and reviewed and validated by a
                                            licensed medical doctor.
                                        </li>
                                        <li>
                                            This is not a substitute for
                                            professional medical advice,
                                            diagnosis, or treatment.
                                        </li>
                                        <li>
                                            It is for informational and
                                            educational purposes only.
                                        </li>
                                        <li>
                                            You should consult your own doctor
                                            or a qualified healthcare
                                            professional before making decisions
                                            regarding your health, vaccinations,
                                            medications, or travel, especially
                                            if you are pregnant, have chronic
                                            conditions, or take regular
                                            medication.
                                        </li>
                                    </ul>
                                    <p className="text-xs text-heading font-semibold mb-1">
                                        Data Protection
                                    </p>
                                    <p className="text-xs text-muted leading-relaxed mb-3">
                                        {DATA_PROTECTION_TEXT}
                                    </p>
                                    <label className="flex items-start gap-3 cursor-pointer">
                                        <div
                                            onClick={() =>
                                                setMedicalDisclaimerConsentGiven(
                                                    (v) => {
                                                        const newVal = !v;
                                                        if (newVal) acceptConsent.mutate();
                                                        return newVal;
                                                    },
                                                )
                                            }
                                            className={`mt-0.5 w-5 h-5 rounded-md border-2 shrink-0 flex items-center justify-center transition-all duration-200 cursor-pointer ${medicalDisclaimerConsentGiven ? "border-accent bg-accent" : "border-border"}`}
                                        >
                                            {medicalDisclaimerConsentGiven && (
                                                <LucideCheck className="w-3 h-3 text-white" />
                                            )}
                                        </div>
                                        <span
                                            className="text-sm text-body font-medium leading-relaxed"
                                            onClick={() =>
                                                setMedicalDisclaimerConsentGiven(
                                                    (v) => {
                                                        const newVal = !v;
                                                        if (newVal) acceptConsent.mutate();
                                                        return newVal;
                                                    },
                                                )
                                            }
                                        >
                                            I have read, understood, and agree
                                            to the Consent, Medical Disclaimer,
                                            and Privacy Policy.
                                        </span>
                                    </label>
                                </div>
                            )}

                            {isRiskSection && (
                                <div className="p-4 rounded-2xl border-2 border-border-light/60 bg-background-primary/40">
                                    <p className="text-sm text-heading font-semibold mb-3">
                                        Your responses are confidential and used
                                        only to provide accurate health advice.
                                    </p>
                                    <label className="flex items-start gap-3 cursor-pointer">
                                        <div
                                            onClick={() =>
                                                setRiskConsentGiven((v) => !v)
                                            }
                                            className={`mt-0.5 w-5 h-5 rounded-md border-2 shrink-0 flex items-center justify-center transition-all duration-200 cursor-pointer ${riskConsentGiven ? "border-accent bg-accent" : "border-border"}`}
                                        >
                                            {riskConsentGiven && (
                                                <LucideCheck className="w-3 h-3 text-white" />
                                            )}
                                        </div>
                                        <span
                                            className="text-sm text-body font-medium leading-relaxed"
                                            onClick={() =>
                                                setRiskConsentGiven((v) => !v)
                                            }
                                        >
                                            I understand and agree to answer
                                            this section
                                        </span>
                                    </label>
                                </div>
                            )}

                            {isRiskSection && !riskConsentGiven ? (
                                <div className="rounded-2xl border-2 border-dashed border-border-light/60 bg-background-primary/30 p-8 text-center">
                                    <p className="text-sm text-muted leading-relaxed">
                                        Please agree to the confidentiality statement above to access and answer these questions.
                                    </p>
                                </div>
                            ) : (
                                visibleQuestions.map((question) => (
                                    <QuestionBlock
                                        key={question.key}
                                        question={question}
                                        value={answers[question.key]}
                                        answers={answers}
                                        prefilled={PREFILLED_KEYS.has(question.key)}
                                        isHighlighted={highlightedFieldKey === question.key}
                                        hasError={fieldErrors.has(question.key)}
                                        onChange={(value) =>
                                            setAnswer(question.key, value)
                                        }
                                        onToggleCheckbox={(value) =>
                                            toggleCheckbox(question.key, value)
                                        }
                                    />
                                ))
                            )}
                        </motion.div>
                    </AnimatePresence>
                )}

                {/* ── Verify page ─────────────────────────────────────────── */}
                {showVerify && (
                    <div className="rounded-3xl border border-border-light/70 bg-white/80 p-7 md:p-9 space-y-6">
                        <div>
                            <h3 className="text-3xl md:text-4xl font-serif text-heading leading-tight">
                                Verify Your Inputs
                            </h3>
                            <p className="text-sm md:text-base text-muted leading-relaxed">
                                Review each answer carefully before generating
                                this plan.
                            </p>
                        </div>
                        {verifyTopSlot}
                        <div className="space-y-3 max-h-105 overflow-y-auto pr-1">
                            {allVisibleQuestions.map(
                                ({ categoryName, question }) => (
                                    <button
                                        key={question.key}
                                        type="button"
                                        onClick={() => handleVerifyItemClick(question.key)}
                                        className="w-full text-left rounded-xl border border-border-light/60 bg-background-primary/60 p-3.5 hover:border-accent/30 hover:bg-accent/[0.02] transition-colors cursor-pointer group"
                                    >
                                        <p className="text-[11px] uppercase tracking-wider font-semibold text-accent mb-1">
                                            {categoryName}
                                        </p>
                                        <p className="text-sm text-heading font-medium">
                                            {question.text}
                                        </p>
                                        <p className="text-sm text-muted mt-1">
                                            {getDisplayValue(
                                                question,
                                                answers[question.key],
                                            )}
                                        </p>
                                        <p className="text-[10px] text-accent/60 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                            Click to edit this answer
                                        </p>
                                    </button>
                                ),
                            )}
                        </div>
                        <p className="text-xs text-muted">
                            This will use{" "}
                            <strong className="text-heading">1 credit</strong>.
                            You have {credits} remaining.
                        </p>
                        {!isFreePlan && reviewers.length > 0 && (
                            <div className="rounded-2xl border border-border-light/60 bg-background-primary/60 p-4 space-y-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setWantsDoctorSelection((v) => {
                                            if (v) setSelectedDoctorIds([]);
                                            return !v;
                                        });
                                    }}
                                    className="flex w-full items-center justify-between gap-4 text-left"
                                >
                                    <div>
                                        <p className="text-sm font-semibold text-heading flex items-center gap-1.5">
                                            <LucideUsers className="h-4 w-4 text-accent" />
                                            Choose a reviewing doctor
                                            <span className="text-xs font-normal text-muted ml-1">(optional)</span>
                                        </p>
                                        <p className="text-xs text-muted mt-0.5">
                                            {wantsDoctorSelection
                                                ? "Select one or more doctors to review your plan."
                                                : "By default, any verified doctor can review your plan."}
                                        </p>
                                    </div>
                                    {wantsDoctorSelection ? (
                                        <LucideChevronUp className="h-4 w-4 shrink-0 text-muted" />
                                    ) : (
                                        <LucideChevronDown className="h-4 w-4 shrink-0 text-muted" />
                                    )}
                                </button>
                                {wantsDoctorSelection && (
                                    <div className="grid gap-2 pt-1">
                                        {reviewers.map((doctor) => {
                                            const checked = selectedDoctorIds.includes(doctor.userId);
                                            const name = `${doctor.firstName ?? ""} ${doctor.lastName ?? ""}`.trim() || doctor.email;
                                            return (
                                                <button
                                                    key={doctor.userId}
                                                    type="button"
                                                    onClick={() =>
                                                        setSelectedDoctorIds((ids) =>
                                                            ids.includes(doctor.userId)
                                                                ? ids.filter((id) => id !== doctor.userId)
                                                                : [...ids, doctor.userId],
                                                        )
                                                    }
                                                    className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-colors ${checked ? "border-accent bg-accent/5" : "border-border-light bg-white hover:border-border"}`}
                                                >
                                                    {doctor.profilePictureUrl ? (
                                                        <img src={doctor.profilePictureUrl} alt="" className="h-9 w-9 rounded-full object-cover shrink-0" />
                                                    ) : (
                                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent">
                                                            <LucideUsers className="h-4 w-4" />
                                                        </div>
                                                    )}
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-sm font-semibold text-heading">{name}</p>
                                                        {doctor.bio && <p className="mt-0.5 line-clamp-1 text-xs text-muted">{doctor.bio}</p>}
                                                    </div>
                                                    <div className={`h-4 w-4 shrink-0 rounded-full border-2 flex items-center justify-center transition-all ${checked ? "border-accent bg-accent" : "border-border"}`}>
                                                        {checked && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}
                        <button
                            type="button"
                            onClick={() => void handleGeneratePlan()}
                            disabled={credits === 0 || isSubmitting || (wantsDoctorSelection && selectedDoctorIds.length === 0)}
                            className="inline-flex items-center gap-2 py-2.5 px-6 rounded-xl bg-dark text-white text-sm font-semibold hover:bg-darkest disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                            {isSubmitting ?
                                <LucideLoader2 className="w-4 h-4 animate-spin" />
                            :   null}
                            Generate plan
                        </button>
                    </div>
                )}

                {/* ── Navigation ──────────────────────────────────────────── */}
                <div className="flex items-center justify-between border-t border-border-light/60 pt-5">
                    <button
                        type="button"
                        onClick={goToPrevious}
                        disabled={isBackDisabled}
                        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-heading disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        <LucideArrowLeft className="w-4 h-4" /> Back
                    </button>
                    {!showVerify && (
                        <button
                            type="button"
                            onClick={goToNext}
                            className="inline-flex items-center gap-2 py-2.5 px-5 rounded-xl bg-dark text-white text-sm font-semibold hover:bg-darkest"
                        >
                            Continue <LucideArrowRight className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>
        );
    },
);

// ── Individual question block ─────────────────────────────────────────────────

const baseInputClass =
    "w-full bg-white border-2 border-border-light/60 rounded-2xl px-5 py-4 text-base text-heading placeholder:text-muted/40 outline-none focus:border-accent transition-all duration-200 font-medium";

interface QuestionBlockProps {
    question: Question;
    value: unknown;
    answers: Record<string, unknown>;
    prefilled: boolean;
    isHighlighted?: boolean;
    hasError?: boolean;
    onChange: (value: unknown) => void;
    onToggleCheckbox: (value: string) => void;
}

const QuestionBlock = ({ question, value, prefilled, isHighlighted, hasError, onChange, onToggleCheckbox }: QuestionBlockProps) => {
    const ringClass = isHighlighted
        ? "ring-2 ring-yellow-600/50 bg-accent/3"
        : hasError
            ? "ring-2 ring-red-400/60 bg-red-50/40"
            : "";
    return (
        <div
            id={`question-field-${question.key}`}
            className={`space-y-3 rounded-xl p-4 transition-all duration-500 ${ringClass}`}
        >
            <div>
                <p className="text-base md:text-lg font-semibold text-heading leading-snug">
                    {question.text}
                    {question.required && <span className="text-red-500 ml-1">*</span>}
                </p>
                {hasError && (
                    <p className="text-xs text-red-500 mt-1 font-medium">This field is required</p>
                )}
                {question.description && (
                    <p className="text-sm text-muted mt-1 leading-relaxed">{question.description}</p>
                )}
                {prefilled && (
                    <p className="text-xs text-accent mt-1">Pre-filled from your profile</p>
                )}
            </div>
            <QuestionInput
                question={question}
                value={value}
                prefilled={prefilled}
                hasError={hasError}
                onChange={onChange}
                onToggleCheckbox={onToggleCheckbox}
            />
        </div>
    );
};

// ── Question input renderer ───────────────────────────────────────────────────

const QuestionInput = ({
    question,
    value,
    prefilled,
    hasError,
    onChange,
    onToggleCheckbox,
}: {
    question: Question;
    value: unknown;
    prefilled: boolean;
    hasError?: boolean;
    onChange: (value: unknown) => void;
    onToggleCheckbox: (value: string) => void;
}) => {
    const today = todayIsoDateLocal();

    const errorInputClass = hasError ? "!border-red-400/70" : "";
    const unselectedBorderClass = hasError ? "border-red-400/70" : "border-border-light/60";

    switch (question.type) {
        case "radio":
            return (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {(question.options ?? []).map((option) => (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => onChange(option.value)}
                            className={`text-left px-4 py-3 rounded-xl border-2 transition-all duration-200 cursor-pointer ${value === option.value
                                ? "border-accent bg-white shadow-sm"
                                : `${unselectedBorderClass} hover:border-border bg-white/60 hover:bg-white`
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-all duration-200 ${value === option.value ? "border-accent bg-accent" : hasError ? "border-red-400/70" : "border-border"}`}
                                >
                                    {value === option.value && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                </div>
                                <span className={`text-sm font-semibold ${value === option.value ? "text-heading" : "text-body"}`}>
                                    {option.label}
                                </span>
                            </div>
                        </button>
                    ))}
                </div>
            );

        case "checkbox":
            return (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {(question.options ?? []).map((option) => {
                        const checked = toNonEmptyStringArray(value).includes(option.value);
                        return (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => onToggleCheckbox(option.value)}
                                className={`text-left px-4 py-3 rounded-xl border-2 transition-all duration-200 cursor-pointer ${checked
                                    ? "border-accent bg-white shadow-sm"
                                    : `${unselectedBorderClass} hover:border-border bg-white/60 hover:bg-white`
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div
                                        className={`w-4 h-4 rounded-md border-2 shrink-0 flex items-center justify-center transition-all duration-200 ${checked ? "border-accent bg-accent" : hasError ? "border-red-400/70" : "border-border"}`}
                                    >
                                        {checked && <LucideCheck className="w-2.5 h-2.5 text-white" />}
                                    </div>
                                    <span className={`text-sm font-semibold ${checked ? "text-heading" : "text-body"}`}>
                                        {option.label}
                                    </span>
                                </div>
                            </button>
                        );
                    })}
                </div>
            );

        case "textarea":
            return (
                <ExpandableTextarea
                    value={String(value ?? "")}
                    onChange={(v) => onChange(v)}
                    placeholder={question.placeholder}
                    hasError={hasError}
                />
            );

        case "date":
            return (
                <input
                    type="date"
                    value={String(value ?? "")}
                    max={question.key === "date_of_birth" ? today : undefined}
                    onChange={(e) => onChange(e.target.value)}
                    className={`${baseInputClass} ${errorInputClass}`}
                    readOnly={prefilled}
                />
            );

        case "country":
            return (
                <CountryPicker
                    value={String(value ?? "")}
                    onChange={(name) => onChange(name)}
                    placeholder={question.placeholder ?? "Select country"}
                    inputClassName={`${baseInputClass} ${errorInputClass} pr-10`}
                />
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
                <input
                    type="text"
                    value={String(value ?? "")}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={question.placeholder}
                    readOnly={prefilled}
                    className={`${baseInputClass} ${errorInputClass} ${prefilled ? "bg-background-primary/50 cursor-default" : ""}`}
                />
            );
    }
};

// ── Expandable textarea ───────────────────────────────────────────────────────

const ExpandableTextarea = ({
    value,
    onChange,
    placeholder,
    hasError,
}: {
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
    hasError?: boolean;
}) => {
    const [expanded, setExpanded] = useState(false);
    const hasContent = value.trim().length > 0;

    if (!expanded && !hasContent) {
        return (
            <button
                type="button"
                onClick={() => setExpanded(true)}
                className={`w-full flex items-center justify-between px-5 py-3.5 rounded-xl border-2 border-dashed text-sm transition-all duration-200 ${hasError ? "border-red-400/70 text-red-500 hover:border-red-500" : "border-border-light text-muted hover:border-accent hover:text-accent hover:bg-accent/5"}`}
            >
                <span>{placeholder ?? "Click to add details..."}</span>
                <LucideChevronDown className="w-4 h-4 shrink-0" />
            </button>
        );
    }

    return (
        <div className="space-y-1">
            <div className="flex items-center justify-between mb-1">
                {hasContent && !expanded && (
                    <p className="text-sm text-body truncate flex-1 mr-2">{value}</p>
                )}
                <button
                    type="button"
                    onClick={() => setExpanded((v) => !v)}
                    className="flex items-center gap-1 text-xs text-accent hover:text-heading transition-colors ml-auto"
                >
                    {expanded ? (
                        <><LucideChevronUp className="w-3.5 h-3.5" /> Collapse</>
                    ) : (
                        <><LucideChevronDown className="w-3.5 h-3.5" /> Edit</>
                    )}
                </button>
            </div>
            {expanded && (
                <textarea
                    autoFocus
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    rows={3}
                    className={`${baseInputClass} ${hasError ? "!border-red-400/70" : ""} min-h-24 resize-none`}
                />
            )}
        </div>
    );
};

// ── Multi-country input ───────────────────────────────────────────────────────

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
        <div className="space-y-3">
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
        </div>
    );
};

export { buildPlanPayloadFromAnswers };
export default PlanQuestionnaireFlow;
