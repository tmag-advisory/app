import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
    LucideArrowLeft,
    LucideArrowRight,
    LucideCheck,
    LucideCheckCircle,
    LucideChevronDown,
    LucidePlus,
    LucideSave,
    LucideTrash,
    LucideX,
} from "lucide-react";
import familyTripApi from "../../api/familyTrip";
import { useOnboardingQuestions } from "../../api/hooks";
import type {
    FamilyTripMemberRequest,
    FamilyTripPreviewResponse,
    FamilyTripRequest,
    OnboardingQuestionCategoryResponse,
} from "../../api/types";
import CountryPicker from "../../components/CountryPicker";
import DashboardHeader from "../../components/dashboard/DashboardHeader";
import { DashboardAmbientBackground } from "../../components/dashboard/dashboardChrome";
import { buildPlanPayloadFromAnswers } from "../../components/plan/PlanQuestionnaireFlow";
import TripItineraryFlow, {
    hydrateLegacyTripItinerary,
    type TripItineraryData,
} from "../../components/plan/TripItineraryFlow";
import {
    getTripItineraryMissingFieldError,
    validateTripItineraryDates,
} from "../../components/plan/tripItineraryValidation";
import Button from "../../components/ui/Button";
import { todayIsoDateLocal } from "../../lib/questionnaireFieldValidation";

// ─── Types ─────────────────────────────────────────────────────

type BuilderStep = "trip" | "members" | "questionnaire" | "review";
type AnswerMap = Record<string, unknown>;

type QuestionType =
    | "radio"
    | "checkbox"
    | "text"
    | "textarea"
    | "date"
    | "country"
    | "multi_country"
    | "trip_itinerary";

interface QuestionOption {
    value: string;
    label: string;
}

interface Question {
    key: string;
    text: string;
    description?: string;
    type: QuestionType;
    required?: boolean;
    options?: QuestionOption[];
    placeholder?: string;
    conditionalOn?: Record<string, string>;
}

interface ParsedCategory extends OnboardingQuestionCategoryResponse {
    parsedQuestions: Question[];
}

interface TripDetailsStop {
    city?: unknown;
    country?: unknown;
    arrivalDate?: unknown;
    nights?: unknown;
}

interface TripDetailsJson {
    tripType?: unknown;
    departureCity?: unknown;
    destination?: unknown;
    departureDate?: unknown;
    returnDate?: unknown;
    outboundFlightNumber?: unknown;
    returnFlightNumber?: unknown;
    departingFrom?: unknown;
    finalReturnDestination?: unknown;
    overallReturnDate?: unknown;
    finalDestination?: unknown;
    transitLocation?: unknown;
    transitDuration?: unknown;
    lengthOfStay?: unknown;
    purpose?: unknown;
    flightNumber?: unknown;
    stops?: unknown;
}

// ─── Constants ─────────────────────────────────────────────────

const STEP_ORDER: BuilderStep[] = [
    "trip",
    "members",
    "questionnaire",
    "review",
];
const STEP_LABELS: Record<BuilderStep, string> = {
    trip: "Shared Trip",
    members: "Dependents",
    questionnaire: "Health Info",
    review: "Review",
};

const SHARED_CATEGORY_KEYS = [
    "travel_details",
    "accommodation_environment",
    "planned_activities",
    "awareness_preparation",
] as const;

const MEMBER_CATEGORY_KEYS = [
    "medical_history",
    "vaccination_history",
    "personal_health_risk_behaviours",
] as const;

const HIDDEN_SHARED_QUESTION_KEYS = new Set([
    "travel_companions",
    "travel_companions_children_ages",
]);

const RELATIONSHIP_OPTIONS = [
    { value: "SPOUSE", label: "Spouse / Partner" },
    { value: "CHILD", label: "Child" },
    { value: "PARENT", label: "Parent" },
    { value: "DEPENDENT", label: "Other Dependent" },
];

const GENDER_OPTIONS = [
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
    { value: "prefer_not_to_say", label: "Prefer not to say" },
];

const QUESTIONNAIRE_COMPLETED_BY_OPTIONS = [
    { value: "self", label: "This member" },
    { value: "parent_guardian", label: "Parent / guardian" },
    { value: "other", label: "Other caregiver" },
];

const SELF_COMPLETION_OPTIONS = [
    { value: "yes", label: "Yes" },
    { value: "no", label: "No" },
    { value: "needs_help", label: "Needs help" },
];

const AGE_YEAR_OPTIONS = Array.from({ length: 121 }, (_, age) => age);
const AGE_MONTH_OPTIONS = Array.from({ length: 12 }, (_, month) => month);

const baseInputClass =
    "w-full bg-white border border-border-light rounded-xl px-4 py-3 text-sm text-heading placeholder:text-border outline-none focus:border-accent transition-colors";

// ─── Helpers ───────────────────────────────────────────────────

function defaultMember(relationship = "SPOUSE"): FamilyTripMemberRequest {
    return {
        relationship,
        firstName: "",
        lastName: "",
        dateOfBirth: "",
        memberEmail: "",
    };
}

function defaultMemberAnswers(relationship = "SPOUSE"): AnswerMap {
    const isLikelyAdult =
        relationship === "SPOUSE" || relationship === "PARENT";
    return {
        age_years: "",
        age_months: "",
        gender: "",
        nationality: "",
        current_residence_country: "",
        questionnaire_completed_by: isLikelyAdult ? "self" : "parent_guardian",
        can_complete_own_questionnaire: isLikelyAdult ? "yes" : "no",
        guardian_name: "",
        guardian_relationship: "",
        dependent_additional_details: "",
    };
}

function parseQuestions(raw: string | Question[] | unknown): Question[] {
    if (Array.isArray(raw)) return raw as Question[];
    if (typeof raw !== "string") return [];
    try {
        const parsed = JSON.parse(raw) as unknown;
        return Array.isArray(parsed) ? (parsed as Question[]) : [];
    } catch {
        return [];
    }
}

function toNonEmptyStringArray(value: unknown): string[] {
    if (!Array.isArray(value)) return [];
    return value.map((entry) => String(entry).trim()).filter(Boolean);
}

function toEditableCountryArray(value: unknown): string[] {
    if (!Array.isArray(value)) return [];
    return value.map((entry) => String(entry ?? ""));
}

function shouldShowQuestion(question: Question, answers: AnswerMap): boolean {
    if (!question.conditionalOn) return true;

    for (const [dependencyKey, dependencyValue] of Object.entries(
        question.conditionalOn,
    )) {
        const answer = answers[dependencyKey];
        const allowedValues = dependencyValue.split("|");
        const isNegation = allowedValues[0]?.startsWith("!");

        if (isNegation) {
            const negatedValue = allowedValues[0].slice(1);
            if (Array.isArray(answer)) {
                if (
                    answer.length === 0 ||
                    answer.every((value) => value === negatedValue)
                )
                    return false;
            } else if (!answer || answer === negatedValue) {
                return false;
            }
            continue;
        }

        if (Array.isArray(answer)) {
            if (!answer.some((value) => allowedValues.includes(String(value))))
                return false;
            continue;
        }

        if (!allowedValues.includes(String(answer ?? ""))) return false;
    }

    return true;
}

function isTripItineraryComplete(
    value: TripItineraryData | undefined,
): boolean {
    if (!value) return false;
    const data = hydrateLegacyTripItinerary(value);
    let filled = false;

    if (data.tripType === "one") {
        filled = Boolean(
            data.oneFromCity?.trim() &&
            data.oneFromCountry?.trim() &&
            data.oneToCity?.trim() &&
            data.oneTo?.trim() &&
            data.oneDepartureDate?.trim() &&
            data.oneLengthOfStay?.trim(),
        );
    } else if (data.tripType === "return") {
        filled = Boolean(
            data.returnFromCity?.trim() &&
            data.returnFromCountry?.trim() &&
            data.returnToCity?.trim() &&
            data.returnTo?.trim() &&
            data.returnDepartureDate?.trim() &&
            data.returnReturnDate?.trim(),
        );
    } else if (data.tripType === "multi") {
        const legs = data.multiLegs ?? [];
        filled = Boolean(
            data.multiDepartingFromCity?.trim() &&
            data.multiDepartingFromCountry?.trim() &&
            legs.length > 0 &&
            legs.every(
                (leg) =>
                    leg.country?.trim() &&
                    leg.arrivalDate?.trim() &&
                    leg.nights?.trim(),
            ),
        );
    } else if (data.tripType === "transit") {
        filled = Boolean(
            data.transitFromCity?.trim() &&
            data.transitFromCountry?.trim() &&
            data.transitFinalDestinationCity?.trim() &&
            data.transitFinalDestination?.trim() &&
            data.transitLocation?.trim() &&
            data.transitDuration?.trim() &&
            data.transitDepartureDate?.trim(),
        );
    }

    return filled && validateTripItineraryDates(data) === null;
}

function isQuestionAnswered(question: Question, answers: AnswerMap): boolean {
    if (!question.required) return true;
    const value = answers[question.key];

    if (question.type === "trip_itinerary") {
        return isTripItineraryComplete(value as TripItineraryData | undefined);
    }

    if (question.type === "checkbox" || question.type === "multi_country") {
        return toNonEmptyStringArray(value).length > 0;
    }

    return String(value ?? "").trim().length > 0;
}

function getValidationMessages(
    categories: ParsedCategory[],
    answers: AnswerMap,
): string[] {
    const messages: string[] = [];

    for (const category of categories) {
        for (const question of category.parsedQuestions.filter((q) =>
            shouldShowQuestion(q, answers),
        )) {
            if (!isQuestionAnswered(question, answers)) {
                if (question.type === "trip_itinerary") {
                    const itinerary = hydrateLegacyTripItinerary(
                        answers[question.key] as TripItineraryData | undefined,
                    );
                    const missing =
                        getTripItineraryMissingFieldError(itinerary);
                    const invalidDates = validateTripItineraryDates(itinerary);
                    messages.push(
                        missing ??
                            invalidDates ??
                            "Please complete the shared trip itinerary.",
                    );
                } else {
                    messages.push(
                        `Please answer: ${question.text.replace(/:$/, "")}`,
                    );
                }
            }
        }
    }

    return messages;
}

function getAgeFromDob(dob: string): number | null {
    if (!dob) return null;
    const birth = new Date(dob);
    if (Number.isNaN(birth.getTime())) return null;

    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate()))
        age--;
    return age >= 0 ? age : null;
}

function getAgePartsFromDob(
    dob: string,
): { years: number; months: number } | null {
    if (!dob) return null;
    const birth = new Date(dob);
    if (Number.isNaN(birth.getTime())) return null;

    const today = new Date();
    let years = today.getFullYear() - birth.getFullYear();
    let months = today.getMonth() - birth.getMonth();
    if (today.getDate() < birth.getDate()) months--;
    if (months < 0) {
        years--;
        months += 12;
    }
    return years >= 0 ? { years, months } : null;
}

function numberFromAnswer(value: unknown): number | null {
    if (value === null || value === undefined || value === "") return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

function getMemberAge(
    member: FamilyTripMemberRequest,
    answers: AnswerMap,
): number | null {
    const dobAge = getAgeFromDob(member.dateOfBirth ?? "");
    if (dobAge !== null) return dobAge;
    return numberFromAnswer(answers.age_years);
}

function getMemberAgeLabel(
    member: FamilyTripMemberRequest,
    answers: AnswerMap,
): string {
    const dobParts = getAgePartsFromDob(member.dateOfBirth ?? "");
    if (dobParts) {
        if (dobParts.years === 0)
            return `${dobParts.months} month${dobParts.months === 1 ? "" : "s"}`;
        return `${dobParts.years} year${dobParts.years === 1 ? "" : "s"}`;
    }

    const years = numberFromAnswer(answers.age_years);
    const months = numberFromAnswer(answers.age_months) ?? 0;
    if (years === null) return "Age not set";
    if (years === 0) return `${months} month${months === 1 ? "" : "s"}`;
    return `${years} year${years === 1 ? "" : "s"}${months > 0 ? `, ${months} month${months === 1 ? "" : "s"}` : ""}`;
}

function memberLabel(member: FamilyTripMemberRequest, index: number): string {
    const fullName =
        `${member.firstName ?? ""} ${member.lastName ?? ""}`.trim();
    return fullName || `Member ${index + 1}`;
}

function splitCityCountry(value: string | undefined): {
    city: string;
    country: string;
} {
    const normalized = (value ?? "").trim();
    if (!normalized) return { city: "", country: "" };
    const index = normalized.lastIndexOf(", ");
    if (index > 0 && index < normalized.length - 2) {
        return {
            city: normalized.slice(0, index).trim(),
            country: normalized.slice(index + 2).trim(),
        };
    }
    return { city: normalized, country: "" };
}

function tripDetailsJsonToItineraryData(
    tripDetailsJson?: string,
): TripItineraryData | undefined {
    if (!tripDetailsJson?.trim()) return undefined;

    try {
        const details = JSON.parse(tripDetailsJson) as TripDetailsJson;
        const tripType = String(details.tripType ?? "").toLowerCase();
        const stops =
            Array.isArray(details.stops) ?
                (details.stops as TripDetailsStop[])
            :   [];

        if (tripType === "return") {
            const from = splitCityCountry(String(details.departureCity ?? ""));
            const firstStop = stops[0] ?? {};
            const destination = splitCityCountry(
                String(details.destination ?? ""),
            );
            return {
                tripType: "return",
                returnFrom: String(details.departureCity ?? ""),
                returnFromCity: from.city,
                returnFromCountry: from.country,
                returnTo: String(
                    firstStop.country ?? destination.country ?? "",
                ),
                returnToCity: String(firstStop.city ?? destination.city ?? ""),
                returnDepartureDate: String(details.departureDate ?? ""),
                returnReturnDate: String(details.returnDate ?? ""),
                outboundFlightNumber: String(
                    details.outboundFlightNumber ?? "",
                ),
                returnFlightNumber: String(details.returnFlightNumber ?? ""),
            };
        }

        if (tripType === "multi") {
            const departing = splitCityCountry(
                String(details.departingFrom ?? ""),
            );
            return {
                tripType: "multi",
                multiDepartingFrom: String(details.departingFrom ?? ""),
                multiDepartingFromCity: departing.city,
                multiDepartingFromCountry: departing.country,
                multiFinalReturnDestination: String(
                    details.finalReturnDestination ?? "",
                ),
                multiOverallReturnDate: String(details.overallReturnDate ?? ""),
                multiLegs: stops.map((stop) => ({
                    city: String(stop.city ?? ""),
                    country: String(stop.country ?? ""),
                    arrivalDate: String(stop.arrivalDate ?? ""),
                    nights: String(stop.nights ?? ""),
                })),
            };
        }

        if (tripType === "transit") {
            const departure = splitCityCountry(
                String(details.departureCity ?? ""),
            );
            const finalDestination = splitCityCountry(
                String(details.finalDestination ?? ""),
            );
            const firstStop = stops[0] ?? {};
            return {
                tripType: "transit",
                transitFrom: String(details.departureCity ?? ""),
                transitFromCity: departure.city,
                transitFromCountry: departure.country,
                transitFinalDestination: String(
                    firstStop.country ?? finalDestination.country ?? "",
                ),
                transitFinalDestinationCity: String(
                    firstStop.city ?? finalDestination.city ?? "",
                ),
                transitLocation: String(details.transitLocation ?? ""),
                transitDuration: String(details.transitDuration ?? ""),
                transitDepartureDate: String(details.departureDate ?? ""),
                transitReturnDate: String(details.returnDate ?? ""),
            };
        }

        const departure = splitCityCountry(String(details.departureCity ?? ""));
        const firstStop = stops[0] ?? {};
        const destination = splitCityCountry(String(details.destination ?? ""));
        return {
            tripType: "one",
            oneFrom: String(details.departureCity ?? ""),
            oneFromCity: departure.city,
            oneFromCountry: departure.country,
            oneTo: String(firstStop.country ?? destination.country ?? ""),
            oneToCity: String(firstStop.city ?? destination.city ?? ""),
            oneDepartureDate: String(details.departureDate ?? ""),
            oneLengthOfStay: String(details.lengthOfStay ?? ""),
            onePurpose: String(details.purpose ?? ""),
            oneFlightNumber: String(details.flightNumber ?? ""),
        };
    } catch {
        return undefined;
    }
}

function getApiErrorMessage(error: unknown, fallback: string): string {
    if (typeof error !== "object" || error === null || !("response" in error))
        return fallback;

    const response = (error as { response?: { data?: { message?: unknown } } })
        .response;
    const message = response?.data?.message;
    return typeof message === "string" && message.trim() ? message : fallback;
}

function getDependentAgesSummary(
    members: FamilyTripMemberRequest[],
    answers: AnswerMap[],
): string {
    return members
        .map((member, index) => ({
            member,
            answers: answers[index] ?? {},
            index,
        }))
        .filter(
            ({ member }) =>
                member.relationship === "CHILD" ||
                member.relationship === "DEPENDENT",
        )
        .map(
            ({ member, answers, index }) =>
                `${memberLabel(member, index)}: ${getMemberAgeLabel(member, answers)}`,
        )
        .join("; ");
}

function isMemberProfileComplete(
    member: FamilyTripMemberRequest,
    answers: AnswerMap,
): boolean {
    const hasIdentity = Boolean(
        member.relationship &&
        member.firstName?.trim() &&
        member.lastName?.trim(),
    );
    const hasAge = Boolean(
        member.dateOfBirth?.trim() ||
        numberFromAnswer(answers.age_years) !== null,
    );
    const hasPersonalInfo = Boolean(
        String(answers.gender ?? "").trim() &&
        String(answers.nationality ?? "").trim() &&
        String(answers.current_residence_country ?? "").trim(),
    );
    return hasIdentity && hasAge && hasPersonalInfo;
}

function createMemberQuestionnaireResponses({
    sharedAnswers,
    member,
    answers,
    index,
    totalMembers,
}: {
    sharedAnswers: AnswerMap;
    member: FamilyTripMemberRequest;
    answers: AnswerMap;
    index: number;
    totalMembers: number;
}): AnswerMap {
    const fullName =
        `${member.firstName ?? ""} ${member.lastName ?? ""}`.trim();
    const dobParts = getAgePartsFromDob(member.dateOfBirth ?? "");
    const selectedYears = numberFromAnswer(answers.age_years);
    const selectedMonths = numberFromAnswer(answers.age_months) ?? 0;
    const age = dobParts?.years ?? selectedYears;
    const ageMonths = dobParts?.months ?? selectedMonths;

    return {
        ...sharedAnswers,
        ...answers,
        family_trip: true,
        family_trip_shared_itinerary: true,
        family_member_index: index + 1,
        family_members_total: totalMembers,
        family_member_relationship: member.relationship,
        full_name_passport: fullName,
        date_of_birth: member.dateOfBirth ?? "",
        email_address: member.memberEmail ?? "",
        age: age ?? "",
        age_years: age ?? "",
        age_months: ageMonths,
        dependent_details: {
            completedBy: answers.questionnaire_completed_by ?? "",
            canCompleteOwnQuestionnaire:
                answers.can_complete_own_questionnaire ?? "",
            guardianName: answers.guardian_name ?? "",
            guardianRelationship: answers.guardian_relationship ?? "",
            notes: answers.dependent_additional_details ?? "",
        },
    };
}

// ─── Question Renderer Components ──────────────────────────────

function QuestionCard({
    question,
    value,
    answers,
    onChange,
    onToggleCheckbox,
}: {
    question: Question;
    value: unknown;
    answers: AnswerMap;
    onChange: (value: unknown) => void;
    onToggleCheckbox: (value: string) => void;
}) {
    if (!shouldShowQuestion(question, answers)) return null;

    return (
        <div
            id={`question-field-${question.key}`}
            className="space-y-3 rounded-2xl border border-border-light bg-white p-4"
        >
            <div>
                <p className="text-sm md:text-base font-semibold text-heading leading-snug">
                    {question.text}
                    {question.required && (
                        <span className="text-red-500 ml-1">*</span>
                    )}
                </p>
                {question.description && (
                    <p className="text-sm text-muted mt-1 leading-relaxed">
                        {question.description}
                    </p>
                )}
            </div>
            <QuestionInput
                question={question}
                value={value}
                onChange={onChange}
                onToggleCheckbox={onToggleCheckbox}
            />
        </div>
    );
}

function QuestionInput({
    question,
    value,
    onChange,
    onToggleCheckbox,
}: {
    question: Question;
    value: unknown;
    onChange: (value: unknown) => void;
    onToggleCheckbox: (value: string) => void;
}) {
    switch (question.type) {
        case "radio":
            return (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {(question.options ?? []).map((option) => {
                        const selected = value === option.value;
                        return (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => onChange(option.value)}
                                className={`text-left px-4 py-3 rounded-xl border transition-colors cursor-pointer ${
                                    selected ?
                                        "border-accent bg-accent/10 text-heading"
                                    :   "border-border-light bg-white text-body hover:border-accent/50"
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <span
                                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${selected ? "border-accent bg-accent" : "border-border"}`}
                                    >
                                        {selected && (
                                            <span className="w-1.5 h-1.5 rounded-full bg-white" />
                                        )}
                                    </span>
                                    <span className="text-sm font-semibold">
                                        {option.label}
                                    </span>
                                </div>
                            </button>
                        );
                    })}
                </div>
            );

        case "checkbox":
            return (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {(question.options ?? []).map((option) => {
                        const checked = toNonEmptyStringArray(value).includes(
                            option.value,
                        );
                        return (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => onToggleCheckbox(option.value)}
                                className={`text-left px-4 py-3 rounded-xl border transition-colors cursor-pointer ${
                                    checked ?
                                        "border-accent bg-accent/10 text-heading"
                                    :   "border-border-light bg-white text-body hover:border-accent/50"
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <span
                                        className={`w-4 h-4 rounded-md border flex items-center justify-center ${checked ? "border-accent bg-accent" : "border-border"}`}
                                    >
                                        {checked && (
                                            <LucideCheck className="w-2.5 h-2.5 text-white" />
                                        )}
                                    </span>
                                    <span className="text-sm font-semibold">
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
                <textarea
                    value={String(value ?? "")}
                    onChange={(event) => onChange(event.target.value)}
                    rows={3}
                    placeholder={question.placeholder}
                    className={`${baseInputClass} resize-none`}
                />
            );

        case "date":
            return (
                <input
                    type="date"
                    value={String(value ?? "")}
                    max={
                        question.key === "date_of_birth" ?
                            todayIsoDateLocal()
                        :   undefined
                    }
                    onChange={(event) => onChange(event.target.value)}
                    className={baseInputClass}
                />
            );

        case "country":
            return (
                <CountryPicker
                    value={String(value ?? "")}
                    onChange={onChange}
                    placeholder={question.placeholder ?? "Select country"}
                    inputClassName={`${baseInputClass} pr-10`}
                />
            );

        case "multi_country":
            return (
                <MultiCountryInput
                    value={toEditableCountryArray(value)}
                    onChange={onChange}
                    placeholder={question.placeholder}
                />
            );

        case "trip_itinerary":
            return (
                <TripItineraryFlow
                    value={
                        (value as TripItineraryData | undefined) ?? {
                            tripType: "return",
                        }
                    }
                    onChange={onChange}
                />
            );

        default:
            return (
                <input
                    type="text"
                    value={String(value ?? "")}
                    onChange={(event) => onChange(event.target.value)}
                    placeholder={question.placeholder}
                    className={baseInputClass}
                />
            );
    }
}

function MultiCountryInput({
    value,
    onChange,
    placeholder,
}: {
    value: string[];
    onChange: (value: unknown) => void;
    placeholder?: string;
}) {
    const countries = value.length > 0 ? value : [""];

    const updateCountry = (index: number, country: string) => {
        const next = [...countries];
        next[index] = country;
        onChange(next);
    };

    return (
        <div className="space-y-3">
            {countries.map((country, index) => (
                <div key={index} className="flex items-start gap-2">
                    <div className="flex-1">
                        <CountryPicker
                            value={country}
                            onChange={(name) => updateCountry(index, name)}
                            placeholder={placeholder ?? "Select a country"}
                            inputClassName={`${baseInputClass} pr-10`}
                        />
                    </div>
                    {countries.length > 1 && (
                        <button
                            type="button"
                            onClick={() =>
                                onChange(
                                    countries.filter((_, i) => i !== index),
                                )
                            }
                            className="mt-3 text-muted hover:text-red-500 transition-colors"
                            aria-label="Remove country"
                        >
                            <LucideX className="w-4 h-4" />
                        </button>
                    )}
                </div>
            ))}
            <button
                type="button"
                onClick={() => onChange([...countries, ""])}
                className="w-full py-3 rounded-xl border border-dashed border-border-light text-xs font-semibold text-muted hover:border-accent hover:text-accent hover:bg-accent/5 transition-colors flex items-center justify-center gap-1.5"
            >
                <LucidePlus className="w-3.5 h-3.5" /> Add Another Country
            </button>
        </div>
    );
}

function QuestionGroup({
    category,
    answers,
    onAnswer,
    onToggleCheckbox,
}: {
    category: ParsedCategory;
    answers: AnswerMap;
    onAnswer: (key: string, value: unknown) => void;
    onToggleCheckbox: (key: string, value: string) => void;
}) {
    const visibleQuestions = category.parsedQuestions.filter((question) =>
        shouldShowQuestion(question, answers),
    );
    if (visibleQuestions.length === 0) return null;

    return (
        <section className="space-y-4">
            <div>
                <h3 className="text-xl font-serif text-heading">
                    {category.category_name}
                </h3>
                {category.category_description && (
                    <p className="text-sm text-muted mt-1">
                        {category.category_description}
                    </p>
                )}
            </div>
            <div className="space-y-4">
                {visibleQuestions.map((question) => (
                    <QuestionCard
                        key={question.key}
                        question={question}
                        value={answers[question.key]}
                        answers={answers}
                        onChange={(value) => onAnswer(question.key, value)}
                        onToggleCheckbox={(value) =>
                            onToggleCheckbox(question.key, value)
                        }
                    />
                ))}
            </div>
        </section>
    );
}

function MemberProfileFields({
    member,
    answers,
    index,
    onMemberChange,
    onAnswerChange,
}: {
    member: FamilyTripMemberRequest;
    answers: AnswerMap;
    index: number;
    onMemberChange: (
        index: number,
        field: keyof FamilyTripMemberRequest,
        value: string,
    ) => void;
    onAnswerChange: (index: number, key: string, value: unknown) => void;
}) {
    const dobParts = getAgePartsFromDob(member.dateOfBirth ?? "");
    const completedBy = String(answers.questionnaire_completed_by ?? "");

    return (
        <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                        Relationship
                    </label>
                    <select
                        value={member.relationship}
                        onChange={(event) =>
                            onMemberChange(
                                index,
                                "relationship",
                                event.target.value,
                            )
                        }
                        className={baseInputClass}
                    >
                        {RELATIONSHIP_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                        Email (optional)
                    </label>
                    <input
                        type="email"
                        value={member.memberEmail ?? ""}
                        onChange={(event) =>
                            onMemberChange(
                                index,
                                "memberEmail",
                                event.target.value,
                            )
                        }
                        placeholder="member@example.com"
                        className={baseInputClass}
                    />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                        First Name
                    </label>
                    <input
                        type="text"
                        value={member.firstName}
                        onChange={(event) =>
                            onMemberChange(
                                index,
                                "firstName",
                                event.target.value,
                            )
                        }
                        className={baseInputClass}
                    />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                        Last Name
                    </label>
                    <input
                        type="text"
                        value={member.lastName}
                        onChange={(event) =>
                            onMemberChange(
                                index,
                                "lastName",
                                event.target.value,
                            )
                        }
                        className={baseInputClass}
                    />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                        Date of Birth
                    </label>
                    <input
                        type="date"
                        value={member.dateOfBirth ?? ""}
                        max={todayIsoDateLocal()}
                        onChange={(event) =>
                            onMemberChange(
                                index,
                                "dateOfBirth",
                                event.target.value,
                            )
                        }
                        className={baseInputClass}
                    />
                    {dobParts && (
                        <p className="text-xs text-muted mt-1">
                            DOB gives age {dobParts.years} year(s),{" "}
                            {dobParts.months} month(s).
                        </p>
                    )}
                </div>
                <div>
                    <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                        Age Selector
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                        <select
                            value={String(answers.age_years ?? "")}
                            onChange={(event) =>
                                onAnswerChange(
                                    index,
                                    "age_years",
                                    event.target.value,
                                )
                            }
                            className={baseInputClass}
                        >
                            <option value="">Years</option>
                            {AGE_YEAR_OPTIONS.map((age) => (
                                <option key={age} value={age}>
                                    {age} year{age === 1 ? "" : "s"}
                                </option>
                            ))}
                        </select>
                        <select
                            value={String(answers.age_months ?? "")}
                            onChange={(event) =>
                                onAnswerChange(
                                    index,
                                    "age_months",
                                    event.target.value,
                                )
                            }
                            className={baseInputClass}
                        >
                            <option value="">Months</option>
                            {AGE_MONTH_OPTIONS.map((month) => (
                                <option key={month} value={month}>
                                    {month} month{month === 1 ? "" : "s"}
                                </option>
                            ))}
                        </select>
                    </div>
                    <p className="text-xs text-muted mt-1">
                        Use this when exact DOB is not available.
                    </p>
                </div>
            </div>

            <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                    Biological sex (for health advisory purposes)
                </label>
                <div className="flex flex-wrap gap-2">
                    {GENDER_OPTIONS.map((option) => {
                        const selected = answers.gender === option.value;
                        return (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() =>
                                    onAnswerChange(
                                        index,
                                        "gender",
                                        option.value,
                                    )
                                }
                                className={`px-4 py-2 rounded-xl border text-sm font-semibold transition-colors ${
                                    selected ?
                                        "border-accent bg-accent/10 text-accent"
                                    :   "border-border-light text-body hover:border-accent/50"
                                }`}
                            >
                                {option.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                        Nationality
                    </label>
                    <CountryPicker
                        value={String(answers.nationality ?? "")}
                        onChange={(name) =>
                            onAnswerChange(index, "nationality", name)
                        }
                        placeholder="Select nationality"
                        inputClassName={`${baseInputClass} pr-10`}
                    />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                        Country of current residence
                    </label>
                    <CountryPicker
                        value={String(answers.current_residence_country ?? "")}
                        onChange={(name) =>
                            onAnswerChange(
                                index,
                                "current_residence_country",
                                name,
                            )
                        }
                        placeholder="Select residence country"
                        inputClassName={`${baseInputClass} pr-10`}
                    />
                </div>
            </div>

            <div className="rounded-2xl border border-accent/15 bg-accent/5 p-4 space-y-4">
                <div>
                    <h4 className="font-serif text-heading text-lg">
                        Dependent details
                    </h4>
                    <p className="text-sm text-muted">
                        Capture who filled this member's answers and any
                        caregiver context.
                    </p>
                </div>
                <div>
                    <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                        Who completed this questionnaire?
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {QUESTIONNAIRE_COMPLETED_BY_OPTIONS.map((option) => {
                            const selected = completedBy === option.value;
                            return (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() =>
                                        onAnswerChange(
                                            index,
                                            "questionnaire_completed_by",
                                            option.value,
                                        )
                                    }
                                    className={`px-4 py-2.5 rounded-xl border text-sm font-semibold transition-colors ${
                                        selected ?
                                            "border-accent bg-white text-accent"
                                        :   "border-border-light bg-white/70 text-body hover:border-accent/50"
                                    }`}
                                >
                                    {option.label}
                                </button>
                            );
                        })}
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                        Can this member complete their own questionnaire?
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {SELF_COMPLETION_OPTIONS.map((option) => {
                            const selected =
                                answers.can_complete_own_questionnaire ===
                                option.value;
                            return (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() =>
                                        onAnswerChange(
                                            index,
                                            "can_complete_own_questionnaire",
                                            option.value,
                                        )
                                    }
                                    className={`px-4 py-2.5 rounded-xl border text-sm font-semibold transition-colors ${
                                        selected ?
                                            "border-accent bg-white text-accent"
                                        :   "border-border-light bg-white/70 text-body hover:border-accent/50"
                                    }`}
                                >
                                    {option.label}
                                </button>
                            );
                        })}
                    </div>
                </div>
                {completedBy !== "self" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                                Guardian / caregiver name
                            </label>
                            <input
                                type="text"
                                value={String(answers.guardian_name ?? "")}
                                onChange={(event) =>
                                    onAnswerChange(
                                        index,
                                        "guardian_name",
                                        event.target.value,
                                    )
                                }
                                className={baseInputClass}
                                placeholder="Full name"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                                Guardian relationship
                            </label>
                            <input
                                type="text"
                                value={String(
                                    answers.guardian_relationship ?? "",
                                )}
                                onChange={(event) =>
                                    onAnswerChange(
                                        index,
                                        "guardian_relationship",
                                        event.target.value,
                                    )
                                }
                                className={baseInputClass}
                                placeholder="e.g. Mother, father, aunt"
                            />
                        </div>
                    </div>
                )}
                <div>
                    <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                        Dependent-specific notes
                    </label>
                    <textarea
                        value={String(
                            answers.dependent_additional_details ?? "",
                        )}
                        onChange={(event) =>
                            onAnswerChange(
                                index,
                                "dependent_additional_details",
                                event.target.value,
                            )
                        }
                        rows={3}
                        className={`${baseInputClass} resize-none`}
                        placeholder="Anything about care needs, feeding, school travel, supervision, or communication we should consider."
                    />
                </div>
            </div>
        </div>
    );
}

function CostBreakdown({
    previewData,
}: {
    previewData: FamilyTripPreviewResponse | null;
}) {
    if (!previewData) return null;

    const symbol = previewData.currency === "NGN" ? "₦" : "$";

    return (
        <section className="bg-accent/5 border border-accent/20 rounded-2xl p-6 animate-in fade-in slide-in-from-bottom-4">
            <h4 className="font-serif text-heading mb-4 text-lg">
                Cost Breakdown
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-border-light">
                    <p className="text-xs text-muted font-semibold uppercase tracking-wider mb-1">
                        Included
                    </p>
                    <p className="text-2xl font-serif text-heading">
                        {previewData.includedMembers}
                    </p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-border-light">
                    <p className="text-xs text-muted font-semibold uppercase tracking-wider mb-1">
                        Extra
                    </p>
                    <p className="text-2xl font-serif text-heading">
                        {previewData.additionalMembers}
                    </p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-border-light">
                    <p className="text-xs text-muted font-semibold uppercase tracking-wider mb-1">
                        Total Cost
                    </p>
                    <p className="text-2xl font-serif text-heading">
                        {symbol}
                        {(previewData.totalFiatCost / 100).toLocaleString()}
                    </p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-border-light">
                    <p className="text-xs text-muted font-semibold uppercase tracking-wider mb-1">
                        Balance
                    </p>
                    <p className="text-lg font-serif text-heading">
                        {previewData.activePackageAllowance ?
                            `${previewData.activePackageAllowance.tripsRemaining} Trip(s)`
                        :   "No active package"}
                    </p>
                </div>
            </div>
            {previewData.paymentRequired && (
                <div className="bg-red-50 text-red-700 p-4 rounded-xl text-sm border border-red-200">
                    Payment required before submission. You need to pay {symbol}
                    {(previewData.totalFiatCost / 100).toLocaleString()}.
                </div>
            )}
        </section>
    );
}

// ─── Main Component ────────────────────────────────────────────

export default function FamilyTripBuilder() {
    const navigate = useNavigate();
    const { data: categoriesRaw, isLoading: questionsLoading } =
        useOnboardingQuestions();
    const [step, setStep] = useState<BuilderStep>("trip");
    const [expandedMember, setExpandedMember] = useState<number | null>(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isPreviewing, setIsPreviewing] = useState(false);
    const [previewData, setPreviewData] =
        useState<FamilyTripPreviewResponse | null>(null);

    const [request, setRequest] = useState<FamilyTripRequest>({
        packageType: "STANDARD",
        destination: "",
        country: "",
        duration: 1,
        purpose: "Leisure",
        tripType: "return",
        tripDetailsJson: "",
        members: [defaultMember("SPOUSE")],
    });

    const [sharedAnswers, setSharedAnswers] = useState<AnswerMap>({
        travel_companions: "family",
        trip_itinerary: { tripType: "return" } satisfies TripItineraryData,
    });
    const [memberAnswers, setMemberAnswers] = useState<AnswerMap[]>([
        defaultMemberAnswers("SPOUSE"),
    ]);

    const categories = useMemo<ParsedCategory[]>(() => {
        return (categoriesRaw ?? []).map((category) => ({
            ...category,
            parsedQuestions: parseQuestions(category.questions),
        }));
    }, [categoriesRaw]);

    const categoryByKey = useMemo(() => {
        return new Map(
            categories.map((category) => [category.category_key, category]),
        );
    }, [categories]);

    const sharedCategories = useMemo<ParsedCategory[]>(() => {
        return SHARED_CATEGORY_KEYS.map((key) => categoryByKey.get(key))
            .filter((category): category is ParsedCategory => Boolean(category))
            .map((category) => ({
                ...category,
                parsedQuestions: category.parsedQuestions.filter(
                    (question) =>
                        !HIDDEN_SHARED_QUESTION_KEYS.has(question.key),
                ),
            }));
    }, [categoryByKey]);

    const memberCategories = useMemo<ParsedCategory[]>(() => {
        return MEMBER_CATEGORY_KEYS.map((key) => categoryByKey.get(key)).filter(
            (category): category is ParsedCategory => Boolean(category),
        );
    }, [categoryByKey]);

    useEffect(() => {
        familyTripApi
            .getLatestDraft()
            .then((res) => {
                const draft = res.data.data;
                if (!draft) return;

                const members = draft.members.map((member) => ({
                    relationship: member.relationship,
                    firstName: member.firstName,
                    lastName: member.lastName,
                    memberEmail: member.memberEmail || "",
                    dateOfBirth: member.dateOfBirth || "",
                }));

                setRequest({
                    packageType: "STANDARD",
                    destination: draft.destination,
                    country: draft.country,
                    duration: draft.duration,
                    purpose: draft.purpose,
                    tripType: draft.tripType,
                    tripDetailsJson: draft.tripDetailsJson ?? "",
                    members:
                        members.length > 0 ?
                            members
                        :   [defaultMember("SPOUSE")],
                });

                const itinerary = tripDetailsJsonToItineraryData(
                    draft.tripDetailsJson,
                );
                if (itinerary) {
                    setSharedAnswers((prev) => ({
                        ...prev,
                        trip_itinerary: itinerary,
                    }));
                }

                setMemberAnswers(
                    (members.length > 0 ?
                        members
                    :   [defaultMember("SPOUSE")]
                    ).map((member) => ({
                        ...defaultMemberAnswers(member.relationship),
                        age_years:
                            getAgeFromDob(member.dateOfBirth ?? "") ?? "",
                    })),
                );
            })
            .catch(() => undefined);
    }, []);

    const normalizedSharedAnswers = useMemo<AnswerMap>(() => {
        return {
            ...sharedAnswers,
            travel_companions: "family",
            travel_companions_children_ages: getDependentAgesSummary(
                request.members,
                memberAnswers,
            ),
        };
    }, [memberAnswers, request.members, sharedAnswers]);

    const derivedTripPayload = useMemo(
        () => buildPlanPayloadFromAnswers(normalizedSharedAnswers),
        [normalizedSharedAnswers],
    );

    const setSharedAnswer = (key: string, value: unknown) => {
        setSharedAnswers((prev) => ({ ...prev, [key]: value }));
    };

    const toggleSharedCheckbox = (key: string, value: string) => {
        setSharedAnswers((prev) => {
            const current = toNonEmptyStringArray(prev[key]);
            return {
                ...prev,
                [key]:
                    current.includes(value) ?
                        current.filter((entry) => entry !== value)
                    :   [...current, value],
            };
        });
    };

    const handleMemberChange = (
        index: number,
        field: keyof FamilyTripMemberRequest,
        value: string,
    ) => {
        setRequest((prev) => ({
            ...prev,
            members: prev.members.map((member, memberIndex) =>
                memberIndex === index ? { ...member, [field]: value } : member,
            ),
        }));

        if (field === "relationship") {
            setMemberAnswers((prev) =>
                prev.map((answers, memberIndex) =>
                    memberIndex === index ?
                        {
                            ...answers,
                            questionnaire_completed_by:
                                answers.questionnaire_completed_by ||
                                defaultMemberAnswers(value)
                                    .questionnaire_completed_by,
                            can_complete_own_questionnaire:
                                answers.can_complete_own_questionnaire ||
                                defaultMemberAnswers(value)
                                    .can_complete_own_questionnaire,
                        }
                    :   answers,
                ),
            );
        }
    };

    const handleMemberAnswerChange = (
        index: number,
        key: string,
        value: unknown,
    ) => {
        setMemberAnswers((prev) =>
            prev.map((answers, memberIndex) =>
                memberIndex === index ? { ...answers, [key]: value } : answers,
            ),
        );
    };

    const toggleMemberCheckbox = (
        index: number,
        key: string,
        value: string,
    ) => {
        setMemberAnswers((prev) =>
            prev.map((answers, memberIndex) => {
                if (memberIndex !== index) return answers;
                const current = toNonEmptyStringArray(answers[key]);
                return {
                    ...answers,
                    [key]:
                        current.includes(value) ?
                            current.filter((entry) => entry !== value)
                        :   [...current, value],
                };
            }),
        );
    };

    const addMember = () => {
        setRequest((prev) => ({
            ...prev,
            members: [...prev.members, defaultMember("CHILD")],
        }));
        setMemberAnswers((prev) => [...prev, defaultMemberAnswers("CHILD")]);
        setExpandedMember(request.members.length);
    };

    const removeMember = (index: number) => {
        if (request.members.length <= 1) {
            toast.error("At least one family member is required");
            return;
        }

        setRequest((prev) => ({
            ...prev,
            members: prev.members.filter(
                (_, memberIndex) => memberIndex !== index,
            ),
        }));
        setMemberAnswers((prev) =>
            prev.filter((_, memberIndex) => memberIndex !== index),
        );
        setExpandedMember((current) => {
            if (current === null) return null;
            if (current === index) return null;
            return current > index ? current - 1 : current;
        });
    };

    const buildRequestWithQuestionnaires = (): FamilyTripRequest | null => {
        const tripPayload = buildPlanPayloadFromAnswers(
            normalizedSharedAnswers,
        );
        if (!tripPayload) return null;

        return {
            ...request,
            destination: tripPayload.destination,
            country: tripPayload.country,
            duration: tripPayload.duration ?? 1,
            purpose: tripPayload.purpose,
            tripType: tripPayload.tripType,
            tripDetailsJson: tripPayload.tripDetailsJson,
            members: request.members.map((member, index) => ({
                ...member,
                questionnaireResponses: JSON.stringify(
                    createMemberQuestionnaireResponses({
                        sharedAnswers: normalizedSharedAnswers,
                        member,
                        answers:
                            memberAnswers[index] ??
                            defaultMemberAnswers(member.relationship),
                        index,
                        totalMembers: request.members.length,
                    }),
                ),
            })),
        };
    };

    const validateSharedStep = (): boolean => {
        if (questionsLoading) {
            toast.error("Questionnaire is still loading");
            return false;
        }

        const messages = getValidationMessages(
            sharedCategories,
            normalizedSharedAnswers,
        );
        if (messages.length > 0) {
            toast.error(messages[0]);
            return false;
        }

        if (!buildPlanPayloadFromAnswers(normalizedSharedAnswers)) {
            toast.error("Complete the shared trip itinerary first");
            return false;
        }

        return true;
    };

    const validateMembersStep = (): boolean => {
        if (request.members.length === 0) {
            toast.error("Add at least one family member");
            return false;
        }

        for (let index = 0; index < request.members.length; index++) {
            const member = request.members[index];
            const answers = memberAnswers[index] ?? {};
            if (!member.firstName?.trim() || !member.lastName?.trim()) {
                toast.error(
                    `Enter first and last name for ${memberLabel(member, index)}`,
                );
                return false;
            }
            if (
                !member.dateOfBirth?.trim() &&
                numberFromAnswer(answers.age_years) === null
            ) {
                toast.error(
                    `Select age or date of birth for ${memberLabel(member, index)}`,
                );
                return false;
            }
            if (!String(answers.gender ?? "").trim()) {
                toast.error(
                    `Select biological sex for ${memberLabel(member, index)}`,
                );
                return false;
            }
            if (!String(answers.nationality ?? "").trim()) {
                toast.error(
                    `Select nationality for ${memberLabel(member, index)}`,
                );
                return false;
            }
            if (!String(answers.current_residence_country ?? "").trim()) {
                toast.error(
                    `Select current residence country for ${memberLabel(member, index)}`,
                );
                return false;
            }
        }

        return true;
    };

    const validateMemberQuestionnaires = (): boolean => {
        for (let index = 0; index < request.members.length; index++) {
            const member = request.members[index];
            const answers = memberAnswers[index] ?? {};
            const messages = getValidationMessages(memberCategories, answers);
            if (messages.length > 0) {
                setExpandedMember(index);
                toast.error(`${memberLabel(member, index)}: ${messages[0]}`);
                return false;
            }
        }

        return true;
    };

    const getRequestOrToast = (): FamilyTripRequest | null => {
        if (!validateSharedStep()) return null;
        const payload = buildRequestWithQuestionnaires();
        if (!payload) {
            toast.error("Complete the shared trip itinerary first");
            return null;
        }
        return payload;
    };

    const handlePreview = async () => {
        const payload = getRequestOrToast();
        if (!payload) return;

        setIsPreviewing(true);
        try {
            const res = await familyTripApi.preview(payload);
            setPreviewData(res.data.data);
        } catch (err: unknown) {
            toast.error(getApiErrorMessage(err, "Failed to generate preview"));
        } finally {
            setIsPreviewing(false);
        }
    };

    const handleSaveDraft = async () => {
        const payload = getRequestOrToast();
        if (!payload) return;

        setIsSubmitting(true);
        try {
            await familyTripApi.saveDraft(payload);
            toast.success("Draft saved");
        } catch {
            toast.error("Failed to save draft");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSubmit = async () => {
        if (
            !validateSharedStep() ||
            !validateMembersStep() ||
            !validateMemberQuestionnaires()
        )
            return;
        const payload = buildRequestWithQuestionnaires();
        if (!payload) return;

        setIsSubmitting(true);
        try {
            const draftRes = await familyTripApi.saveDraft(payload);
            const tripId = draftRes.data.data.id;
            toast.success("Family trip created! Access codes sent to members.");
            navigate(`/dashboard/family-trip/${tripId}`);
        } catch (err: unknown) {
            toast.error(
                getApiErrorMessage(err, "Failed to create family trip"),
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const currentStepIndex = STEP_ORDER.indexOf(step);

    const stepIndicator = (
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-1">
            {STEP_ORDER.map((stepKey, index) => {
                const active = stepKey === step;
                const done = index < currentStepIndex;
                return (
                    <div
                        key={stepKey}
                        className="flex items-center gap-2 shrink-0"
                    >
                        <div
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                                active ? "bg-accent text-white"
                                : done ? "bg-accent/15 text-accent"
                                : "bg-background-secondary text-muted"
                            }`}
                        >
                            <span
                                className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                    active ? "bg-white text-accent"
                                    : done ? "bg-accent text-white"
                                    : "bg-muted/20 text-muted"
                                }`}
                            >
                                {index + 1}
                            </span>
                            {STEP_LABELS[stepKey]}
                        </div>
                        {index < STEP_ORDER.length - 1 && (
                            <div className="w-6 h-px bg-border-light" />
                        )}
                    </div>
                );
            })}
        </div>
    );

    return (
        <div className="relative min-h-screen font-sans">
            <DashboardAmbientBackground />
            <DashboardHeader title="Family Trip Builder" />

            <div className="relative z-10 max-w-5xl pb-14 pt-8">
                <div className="bg-white rounded-3xl border border-border-light overflow-hidden">
                    <div className="p-6 md:p-8 space-y-8">
                        {stepIndicator}

                        {step === "trip" && (
                            <>
                                <section className="rounded-2xl border border-accent/15 bg-accent/5 p-5">
                                    <h2 className="text-2xl font-serif text-heading mb-2">
                                        Shared family trip questionnaire
                                    </h2>
                                    <p className="text-sm text-muted leading-relaxed">
                                        These itinerary, accommodation,
                                        activity, and preparation answers apply
                                        to every family member. Personal medical
                                        answers are collected separately for
                                        each dependent/member.
                                    </p>
                                </section>

                                {questionsLoading ?
                                    <div className="py-16 text-center">
                                        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                                        <p className="text-sm text-muted">
                                            Loading questionnaire...
                                        </p>
                                    </div>
                                :   <div className="space-y-8">
                                        {sharedCategories.map((category) => (
                                            <QuestionGroup
                                                key={category.category_key}
                                                category={category}
                                                answers={
                                                    normalizedSharedAnswers
                                                }
                                                onAnswer={setSharedAnswer}
                                                onToggleCheckbox={
                                                    toggleSharedCheckbox
                                                }
                                            />
                                        ))}
                                    </div>
                                }

                                <hr className="border-border-light" />

                                <div className="flex justify-end">
                                    <Button
                                        variant="primary"
                                        icon={
                                            <LucideArrowRight className="w-4 h-4" />
                                        }
                                        onClick={() => {
                                            if (!validateSharedStep()) return;
                                            setStep("members");
                                        }}
                                        className="bg-dark text-background-primary hover:bg-darkest"
                                    >
                                        Continue to Dependents
                                    </Button>
                                </div>
                            </>
                        )}

                        {step === "members" && (
                            <>
                                <section>
                                    <div className="flex items-start justify-between gap-4 mb-4">
                                        <div>
                                            <h2 className="text-2xl font-serif text-heading">
                                                Family members & dependent
                                                details
                                            </h2>
                                            <p className="text-sm text-muted mt-1">
                                                Add each traveller and provide
                                                personal details that map to the
                                                onboarding questionnaire.
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={addMember}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-accent bg-accent/10 rounded-lg hover:bg-accent/20 transition-colors uppercase tracking-wider shrink-0"
                                        >
                                            <LucidePlus className="w-4 h-4" />{" "}
                                            Add Member
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        {request.members.map(
                                            (member, index) => {
                                                const answers =
                                                    memberAnswers[index] ??
                                                    defaultMemberAnswers(
                                                        member.relationship,
                                                    );
                                                const age = getMemberAge(
                                                    member,
                                                    answers,
                                                );
                                                const isAdult =
                                                    age !== null && age >= 18;
                                                return (
                                                    <div
                                                        key={index}
                                                        className="p-5 md:p-6 border border-border-light rounded-2xl bg-background-secondary relative"
                                                    >
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                removeMember(
                                                                    index,
                                                                )
                                                            }
                                                            className="absolute top-4 right-4 text-muted hover:text-red-500 transition-colors"
                                                            aria-label="Remove member"
                                                        >
                                                            <LucideTrash className="w-5 h-5" />
                                                        </button>

                                                        <div className="mb-4 pr-8 flex flex-wrap items-center gap-2">
                                                            <h3 className="text-xl font-serif text-heading">
                                                                {memberLabel(
                                                                    member,
                                                                    index,
                                                                )}
                                                            </h3>
                                                            <span
                                                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                                                                    (
                                                                        age ===
                                                                        null
                                                                    ) ?
                                                                        "bg-muted/10 text-muted"
                                                                    : isAdult ?
                                                                        "bg-accent/10 text-accent"
                                                                    :   "bg-amber-50 text-amber-700 border border-amber-200"
                                                                }`}
                                                            >
                                                                {age === null ?
                                                                    "Age pending"
                                                                : isAdult ?
                                                                    `Adult · ${getMemberAgeLabel(member, answers)}`
                                                                :   `Dependent/child · ${getMemberAgeLabel(member, answers)}`
                                                                }
                                                            </span>
                                                        </div>

                                                        <MemberProfileFields
                                                            member={member}
                                                            answers={answers}
                                                            index={index}
                                                            onMemberChange={
                                                                handleMemberChange
                                                            }
                                                            onAnswerChange={
                                                                handleMemberAnswerChange
                                                            }
                                                        />
                                                    </div>
                                                );
                                            },
                                        )}
                                    </div>
                                </section>

                                <hr className="border-border-light" />

                                <section className="flex flex-col md:flex-row gap-4 items-center justify-between">
                                    <Button
                                        variant="secondary"
                                        icon={
                                            <LucideArrowLeft className="w-4 h-4" />
                                        }
                                        onClick={() => setStep("trip")}
                                    >
                                        Back
                                    </Button>
                                    <div className="flex flex-wrap gap-3 w-full md:w-auto justify-end">
                                        <Button
                                            variant="secondary"
                                            onClick={handlePreview}
                                            disabled={isPreviewing}
                                            className="flex-1 md:flex-none"
                                        >
                                            {isPreviewing ?
                                                "Calculating..."
                                            :   "Preview Cost"}
                                        </Button>
                                        <Button
                                            variant="secondary"
                                            icon={
                                                <LucideSave className="w-4 h-4" />
                                            }
                                            onClick={handleSaveDraft}
                                            disabled={isSubmitting}
                                            className="flex-1 md:flex-none"
                                        >
                                            Save Draft
                                        </Button>
                                        <Button
                                            variant="primary"
                                            icon={
                                                <LucideArrowRight className="w-4 h-4" />
                                            }
                                            onClick={() => {
                                                if (!validateMembersStep())
                                                    return;
                                                setExpandedMember(0);
                                                setStep("questionnaire");
                                            }}
                                            className="flex-1 md:flex-none bg-dark text-background-primary hover:bg-darkest"
                                        >
                                            Continue to Health Info
                                        </Button>
                                    </div>
                                </section>

                                <CostBreakdown previewData={previewData} />
                            </>
                        )}

                        {step === "questionnaire" && (
                            <>
                                <div>
                                    <h2 className="text-2xl font-serif text-heading mb-1">
                                        Member medical questionnaire
                                    </h2>
                                    <p className="text-sm text-muted mb-6">
                                        Answer the seeded medical, vaccination,
                                        travel history, and confidential risk
                                        questions for each family member.
                                    </p>

                                    <div className="space-y-3">
                                        {request.members.map(
                                            (member, index) => {
                                                const answers =
                                                    memberAnswers[index] ??
                                                    defaultMemberAnswers(
                                                        member.relationship,
                                                    );
                                                const isExpanded =
                                                    expandedMember === index;
                                                const profileComplete =
                                                    isMemberProfileComplete(
                                                        member,
                                                        answers,
                                                    );
                                                const questionMessages =
                                                    getValidationMessages(
                                                        memberCategories,
                                                        answers,
                                                    );
                                                const memberComplete =
                                                    profileComplete &&
                                                    questionMessages.length ===
                                                        0;

                                                return (
                                                    <div
                                                        key={index}
                                                        className="border border-border-light rounded-2xl overflow-hidden"
                                                    >
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setExpandedMember(
                                                                    isExpanded ?
                                                                        null
                                                                    :   index,
                                                                )
                                                            }
                                                            className="w-full flex items-center justify-between px-5 py-4 bg-background-secondary hover:bg-accent/5 transition-colors text-left"
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                                                                    <span className="text-accent text-xs font-bold">
                                                                        {(
                                                                            member
                                                                                .firstName?.[0] ??
                                                                            "?"
                                                                        ).toUpperCase()}
                                                                    </span>
                                                                </div>
                                                                <div>
                                                                    <p className="font-semibold text-heading text-sm">
                                                                        {memberLabel(
                                                                            member,
                                                                            index,
                                                                        )}
                                                                    </p>
                                                                    <p className="text-xs text-muted capitalize">
                                                                        {member.relationship.toLowerCase()}{" "}
                                                                        ·{" "}
                                                                        {getMemberAgeLabel(
                                                                            member,
                                                                            answers,
                                                                        )}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <span
                                                                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                                                                        (
                                                                            memberComplete
                                                                        ) ?
                                                                            "text-emerald-700 bg-emerald-50"
                                                                        :   "text-amber-700 bg-amber-50"
                                                                    }`}
                                                                >
                                                                    {(
                                                                        memberComplete
                                                                    ) ?
                                                                        "Complete"
                                                                    :   "Needs answers"
                                                                    }
                                                                </span>
                                                                <LucideChevronDown
                                                                    className={`w-4 h-4 text-muted transition-transform ${isExpanded ? "rotate-180" : ""}`}
                                                                />
                                                            </div>
                                                        </button>

                                                        {isExpanded && (
                                                            <div className="p-5 space-y-8 bg-white border-t border-border-light">
                                                                {memberCategories.map(
                                                                    (
                                                                        category,
                                                                    ) => (
                                                                        <QuestionGroup
                                                                            key={`${index}-${category.category_key}`}
                                                                            category={
                                                                                category
                                                                            }
                                                                            answers={
                                                                                answers
                                                                            }
                                                                            onAnswer={(
                                                                                key,
                                                                                value,
                                                                            ) =>
                                                                                handleMemberAnswerChange(
                                                                                    index,
                                                                                    key,
                                                                                    value,
                                                                                )
                                                                            }
                                                                            onToggleCheckbox={(
                                                                                key,
                                                                                value,
                                                                            ) =>
                                                                                toggleMemberCheckbox(
                                                                                    index,
                                                                                    key,
                                                                                    value,
                                                                                )
                                                                            }
                                                                        />
                                                                    ),
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            },
                                        )}
                                    </div>
                                </div>

                                <hr className="border-border-light" />

                                <div className="flex gap-3 justify-between">
                                    <Button
                                        variant="secondary"
                                        icon={
                                            <LucideArrowLeft className="w-4 h-4" />
                                        }
                                        onClick={() => setStep("members")}
                                    >
                                        Back
                                    </Button>
                                    <div className="flex gap-3">
                                        <Button
                                            variant="secondary"
                                            icon={
                                                <LucideSave className="w-4 h-4" />
                                            }
                                            onClick={handleSaveDraft}
                                            disabled={isSubmitting}
                                        >
                                            Save Draft
                                        </Button>
                                        <Button
                                            variant="primary"
                                            icon={
                                                <LucideArrowRight className="w-4 h-4" />
                                            }
                                            onClick={() => {
                                                if (
                                                    !validateMemberQuestionnaires()
                                                )
                                                    return;
                                                setStep("review");
                                            }}
                                            className="bg-dark text-background-primary hover:bg-darkest"
                                        >
                                            Review & Submit
                                        </Button>
                                    </div>
                                </div>
                            </>
                        )}

                        {step === "review" && (
                            <>
                                <div>
                                    <h2 className="text-2xl font-serif text-heading mb-1">
                                        Review Your Family Trip
                                    </h2>
                                    <p className="text-sm text-muted mb-6">
                                        Confirm shared itinerary and each
                                        member's questionnaire status before
                                        creating the family trip.
                                    </p>

                                    <div className="bg-background-secondary rounded-2xl p-5 mb-5 space-y-2 text-sm">
                                        <div className="flex justify-between gap-4">
                                            <span className="text-muted font-semibold uppercase tracking-wider text-xs">
                                                Destination
                                            </span>
                                            <span className="text-heading font-medium text-right">
                                                {derivedTripPayload ?
                                                    `${derivedTripPayload.destination}, ${derivedTripPayload.country}`
                                                :   "Not set"}
                                            </span>
                                        </div>
                                        <div className="flex justify-between gap-4">
                                            <span className="text-muted font-semibold uppercase tracking-wider text-xs">
                                                Duration
                                            </span>
                                            <span className="text-heading font-medium">
                                                {derivedTripPayload?.duration ??
                                                    request.duration}{" "}
                                                days
                                            </span>
                                        </div>
                                        <div className="flex justify-between gap-4">
                                            <span className="text-muted font-semibold uppercase tracking-wider text-xs">
                                                Purpose
                                            </span>
                                            <span className="text-heading font-medium">
                                                {derivedTripPayload?.purpose ??
                                                    request.purpose}
                                            </span>
                                        </div>
                                        <div className="flex justify-between gap-4">
                                            <span className="text-muted font-semibold uppercase tracking-wider text-xs">
                                                Members
                                            </span>
                                            <span className="text-heading font-medium">
                                                {request.members.length}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        {request.members.map(
                                            (member, index) => {
                                                const answers =
                                                    memberAnswers[index] ?? {};
                                                const profileComplete =
                                                    isMemberProfileComplete(
                                                        member,
                                                        answers,
                                                    );
                                                const memberComplete =
                                                    profileComplete &&
                                                    getValidationMessages(
                                                        memberCategories,
                                                        answers,
                                                    ).length === 0;
                                                return (
                                                    <div
                                                        key={index}
                                                        className="flex items-center justify-between gap-4 px-4 py-3 border border-border-light rounded-xl bg-white"
                                                    >
                                                        <div>
                                                            <p className="text-sm font-semibold text-heading">
                                                                {memberLabel(
                                                                    member,
                                                                    index,
                                                                )}
                                                            </p>
                                                            <p className="text-xs text-muted capitalize">
                                                                {member.relationship.toLowerCase()}{" "}
                                                                ·{" "}
                                                                {getMemberAgeLabel(
                                                                    member,
                                                                    answers,
                                                                )}
                                                            </p>
                                                        </div>
                                                        <span
                                                            className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                                                                memberComplete ?
                                                                    "bg-emerald-50 text-emerald-700"
                                                                :   "bg-amber-50 text-amber-700"
                                                            }`}
                                                        >
                                                            {memberComplete ?
                                                                "Questionnaire complete"
                                                            :   "Questionnaire missing"
                                                            }
                                                        </span>
                                                    </div>
                                                );
                                            },
                                        )}
                                    </div>
                                </div>

                                <hr className="border-border-light" />

                                <div className="flex gap-3 justify-between">
                                    <Button
                                        variant="secondary"
                                        icon={
                                            <LucideArrowLeft className="w-4 h-4" />
                                        }
                                        onClick={() => setStep("questionnaire")}
                                    >
                                        Back
                                    </Button>
                                    <Button
                                        variant="primary"
                                        icon={
                                            <LucideCheckCircle className="w-4 h-4" />
                                        }
                                        onClick={handleSubmit}
                                        disabled={isSubmitting}
                                        className="bg-dark text-background-primary hover:bg-darkest"
                                    >
                                        {isSubmitting ?
                                            "Creating..."
                                        :   "Create Family Trip"}
                                    </Button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
