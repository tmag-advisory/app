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
import { useAuth } from "../../context/AuthContext";
import DashboardHeader from "../../components/dashboard/DashboardHeader";

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
type FieldErrorMap = Record<number, Set<string>>;

interface ValidationIssue {
    key: string;
    message: string;
}

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
    trip: "Shared trip",
    members: "Member profiles",
    questionnaire: "Health per member",
    review: "Finalize",
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
    { value: "MAIN_APPLICANT", label: "You (Main applicant)" },
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

const FAMILY_BUILDER_GUIDE = [
    {
        title: "Shared trip once",
        description:
            "Add itinerary, accommodation, activities, and preparation details one time. These answers apply to everyone travelling.",
    },
    {
        title: "Separate member cards",
        description:
            "Open one traveller at a time. Names, age, nationality, residence, and caregiver notes stay attached to that person only.",
    },
    {
        title: "Individual health answers",
        description:
            "Medical history, vaccines, and risk questions are completed per member so each final TravelPlan is personal.",
    },
] as const;

// ─── Helpers ───────────────────────────────────────────────────

function defaultMember(relationship = "MAIN_APPLICANT"): FamilyTripMemberRequest {
    return {
        relationship,
        firstName: "",
        lastName: "",
        dateOfBirth: "",
        memberEmail: "",
    };
}

function defaultMemberAnswers(relationship = "MAIN_APPLICANT"): AnswerMap {
    const isLikelyAdult =
        relationship === "SPOUSE" || relationship === "PARENT" || relationship === "MAIN_APPLICANT";
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

function getValidationIssues(
    categories: ParsedCategory[],
    answers: AnswerMap,
): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

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
                    issues.push({
                        key: question.key,
                        message:
                            missing ??
                            invalidDates ??
                            "Please complete the shared trip itinerary.",
                    });
                } else {
                    issues.push({
                        key: question.key,
                        message: `Please answer: ${question.text.replace(/:$/, "")}`,
                    });
                }
            }
        }
    }

    return issues;
}

function getValidationMessages(
    categories: ParsedCategory[],
    answers: AnswerMap,
): string[] {
    return getValidationIssues(categories, answers).map(
        (issue) => issue.message,
    );
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
    if (fullName) return fullName;
    if (member.relationship === "MAIN_APPLICANT") return "You (Main applicant)";
    return `Member ${index + 1}`;
}

function getMemberInitials(
    member: FamilyTripMemberRequest,
    index: number,
): string {
    const first = member.firstName?.trim()[0] ?? "";
    const last = member.lastName?.trim()[0] ?? "";
    return `${first}${last}`.trim().toUpperCase() || String(index + 1);
}

function getRelationshipLabel(value: string): string {
    if (value === "MAIN_APPLICANT") return "You (Main applicant)";
    return (
        RELATIONSHIP_OPTIONS.find((option) => option.value === value)?.label ??
        value
    );
}

function getQuestionFieldId(questionKey: string, scope?: string): string {
    return scope ? `question-field-${scope}-${questionKey}` : `question-field-${questionKey}`;
}

function getMemberProfileFieldId(index: number, field: string): string {
    return `member-profile-${index}-${field}`;
}

function scrollToValidationTarget(id: string): void {
    window.setTimeout(() => {
        document
            .getElementById(id)
            ?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 80);
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
                : [];

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
    fieldId,
    hasError,
    onChange,
    onToggleCheckbox,
}: {
    question: Question;
    value: unknown;
    answers: AnswerMap;
    fieldId: string;
    hasError?: boolean;
    onChange: (value: unknown) => void;
    onToggleCheckbox: (value: string) => void;
}) {
    if (!shouldShowQuestion(question, answers)) return null;

    const ringClass = hasError ? "ring ring-red-400/60 border-red-200 bg-red-50" : "";

    return (
        <div
            id={fieldId}
            className={`space-y-4 rounded-2xl border border-border-light bg-white p-5 shadow-[0_4px_18px_-14px_rgba(10,20,18,0.35)] transition-all duration-500 md:p-6 ${ringClass}`}
        >
            <div>
                <p className="text-sm md:text-base font-semibold text-heading leading-snug">
                    {question.text}
                    {question.required && (
                        <span className="text-red-500 ml-1">*</span>
                    )}
                </p>
                {hasError && (
                    <p className="text-xs text-red-500 mt-1 font-medium">
                        This field is required
                    </p>
                )}
                {question.description && (
                    <p className="text-sm text-muted mt-1 leading-relaxed">
                        {question.description}
                    </p>
                )}
            </div>
            <QuestionInput
                question={question}
                value={value}
                hasError={hasError}
                onChange={onChange}
                onToggleCheckbox={onToggleCheckbox}
            />
        </div>
    );
}

function QuestionInput({
    question,
    value,
    hasError,
    onChange,
    onToggleCheckbox,
}: {
    question: Question;
    value: unknown;
    hasError?: boolean;
    onChange: (value: unknown) => void;
    onToggleCheckbox: (value: string) => void;
}) {
    const errorInputClass = hasError ? "!border-red-400/70" : "";
    const unselectedBorderClass = hasError ? "border-red-400/70" : "border-border-light";

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
                                className={`text-left px-4 py-3 rounded-xl border transition-colors cursor-pointer ${selected ?
                                    "border-accent bg-accent/10 text-heading"
                                    : `${unselectedBorderClass} bg-white text-body hover:border-accent/50`
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <span
                                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${selected ? "border-accent bg-accent" : hasError ? "border-red-400/70" : "border-border"}`}
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
                                className={`text-left px-4 py-3 rounded-xl border transition-colors cursor-pointer ${checked ?
                                    "border-accent bg-accent/10 text-heading"
                                    : `${unselectedBorderClass} bg-white text-body hover:border-accent/50`
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <span
                                        className={`w-4 h-4 rounded-md border flex items-center justify-center ${checked ? "border-accent bg-accent" : hasError ? "border-red-400/70" : "border-border"}`}
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
                    className={`${baseInputClass} ${errorInputClass} resize-none`}
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
                            : undefined
                    }
                    onChange={(event) => onChange(event.target.value)}
                    className={`${baseInputClass} ${errorInputClass}`}
                />
            );

        case "country":
            return (
                <CountryPicker
                    value={String(value ?? "")}
                    onChange={onChange}
                    placeholder={question.placeholder ?? "Select country"}
                    inputClassName={`${baseInputClass} ${errorInputClass} pr-10`}
                />
            );

        case "multi_country":
            return (
                <MultiCountryInput
                    value={toEditableCountryArray(value)}
                    onChange={onChange}
                    placeholder={question.placeholder}
                    hasError={hasError}
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
                    className={`${baseInputClass} ${errorInputClass}`}
                />
            );
    }
}

function MultiCountryInput({
    value,
    onChange,
    placeholder,
    hasError,
}: {
    value: string[];
    onChange: (value: unknown) => void;
    placeholder?: string;
    hasError?: boolean;
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
                            inputClassName={`${baseInputClass} ${hasError ? "!border-red-400/70" : ""} pr-10`}
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
                className={`w-full py-3 rounded-xl border border-dashed text-xs font-semibold text-muted hover:border-accent hover:text-accent hover:bg-accent/5 transition-colors flex items-center justify-center gap-1.5 ${hasError ? "border-red-400/70" : "border-border-light"}`}
            >
                <LucidePlus className="w-3.5 h-3.5" /> Add Another Country
            </button>
        </div>
    );
}

function QuestionGroup({
    category,
    answers,
    errorKeys,
    fieldIdPrefix,
    onAnswer,
    onToggleCheckbox,
}: {
    category: ParsedCategory;
    answers: AnswerMap;
    errorKeys?: Set<string>;
    fieldIdPrefix?: string;
    onAnswer: (key: string, value: unknown) => void;
    onToggleCheckbox: (key: string, value: string) => void;
}) {
    const visibleQuestions = category.parsedQuestions.filter((question) =>
        shouldShowQuestion(question, answers),
    );
    if (visibleQuestions.length === 0) return null;

    return (
        <section className="space-y-5">
            <div>
                <h3 className="text-xl font-serif text-heading">
                    {category.category_name}
                </h3>
                {category.category_description && (
                    <p className="text-sm text-muted mt-1 leading-relaxed">
                        {category.category_description}
                    </p>
                )}
            </div>
            <div className="space-y-5">
                {visibleQuestions.map((question) => (
                    <QuestionCard
                        key={question.key}
                        question={question}
                        value={answers[question.key]}
                        answers={answers}
                        fieldId={getQuestionFieldId(
                            question.key,
                            fieldIdPrefix,
                        )}
                        hasError={errorKeys?.has(question.key)}
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
    fieldErrors,
    onMemberChange,
    onAnswerChange,
}: {
    member: FamilyTripMemberRequest;
    answers: AnswerMap;
    index: number;
    fieldErrors?: Set<string>;
    onMemberChange: (
        index: number,
        field: keyof FamilyTripMemberRequest,
        value: string,
    ) => void;
    onAnswerChange: (index: number, key: string, value: unknown) => void;
}) {
    const dobParts = getAgePartsFromDob(member.dateOfBirth ?? "");
    const completedBy = String(answers.questionnaire_completed_by ?? "");
    const hasFieldError = (field: string) => Boolean(fieldErrors?.has(field));
    const fieldShellClass = (field: string) =>
        `transition-all duration-500 ${hasFieldError(field) ? "rounded-2xl p-3 ring ring-red-400/60" : ""}`;
    const fieldInputClass = (field: string) =>
        `${baseInputClass} ${hasFieldError(field) ? "!border-red-400/70" : ""}`;
    const showFieldError = (field: string) =>
        hasFieldError(field) ?
            <p className="text-xs text-red-500 mt-1 font-medium">
                This field is required
            </p>
            : null;

    return (
        <div className="space-y-7">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div
                    id={getMemberProfileFieldId(index, "relationship")}
                    className={fieldShellClass("relationship")}
                >
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
                        className={fieldInputClass("relationship")}
                    >
                        {RELATIONSHIP_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                    {showFieldError("relationship")}
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
                <div
                    id={getMemberProfileFieldId(index, "firstName")}
                    className={fieldShellClass("firstName")}
                >
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
                        className={fieldInputClass("firstName")}
                    />
                    {showFieldError("firstName")}
                </div>
                <div
                    id={getMemberProfileFieldId(index, "lastName")}
                    className={fieldShellClass("lastName")}
                >
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
                        className={fieldInputClass("lastName")}
                    />
                    {showFieldError("lastName")}
                </div>
                <div
                    id={getMemberProfileFieldId(index, "dateOfBirth")}
                    className={fieldShellClass("dateOfBirth")}
                >
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
                        className={fieldInputClass("dateOfBirth")}
                    />
                    {showFieldError("dateOfBirth")}
                    {dobParts && (
                        <p className="text-xs text-muted mt-1">
                            DOB gives age {dobParts.years} year(s),{" "}
                            {dobParts.months} month(s).
                        </p>
                    )}
                </div>
                <div
                    id={getMemberProfileFieldId(index, "age_years")}
                    className={fieldShellClass("age_years")}
                >
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
                            className={fieldInputClass("age_years")}
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
                            className={fieldInputClass("age_years")}
                        >
                            <option value="">Months</option>
                            {AGE_MONTH_OPTIONS.map((month) => (
                                <option key={month} value={month}>
                                    {month} month{month === 1 ? "" : "s"}
                                </option>
                            ))}
                        </select>
                    </div>
                    {showFieldError("age_years")}
                    <p className="text-xs text-muted mt-1">
                        Use this when exact DOB is not available.
                    </p>
                </div>
            </div>

            <div
                id={getMemberProfileFieldId(index, "gender")}
                className={fieldShellClass("gender")}
            >
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
                                className={`px-4 py-2 rounded-xl border text-sm font-semibold transition-colors ${selected ?
                                    "border-accent bg-accent/10 text-accent"
                                    : hasFieldError("gender") ?
                                        "border-red-400/70 text-body hover:border-red-400"
                                        : "border-border-light text-body hover:border-accent/50"
                                    }`}
                            >
                                {option.label}
                            </button>
                        );
                    })}
                </div>
                {showFieldError("gender")}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div
                    id={getMemberProfileFieldId(index, "nationality")}
                    className={fieldShellClass("nationality")}
                >
                    <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                        Nationality
                    </label>
                    <CountryPicker
                        value={String(answers.nationality ?? "")}
                        onChange={(name) =>
                            onAnswerChange(index, "nationality", name)
                        }
                        placeholder="Select nationality"
                        inputClassName={`${fieldInputClass("nationality")} pr-10`}
                    />
                    {showFieldError("nationality")}
                </div>
                <div
                    id={getMemberProfileFieldId(index, "current_residence_country")}
                    className={fieldShellClass("current_residence_country")}
                >
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
                        inputClassName={`${fieldInputClass("current_residence_country")} pr-10`}
                    />
                    {showFieldError("current_residence_country")}
                </div>
            </div>

            <div className="rounded-2xl border border-accent/15 bg-accent/5 p-5 md:p-6 space-y-5">
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
                                    className={`px-4 py-2.5 rounded-xl border text-sm font-semibold transition-colors ${selected ?
                                        "border-accent bg-white text-accent"
                                        : "border-border-light bg-white/70 text-body hover:border-accent/50"
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
                                    className={`px-4 py-2.5 rounded-xl border text-sm font-semibold transition-colors ${selected ?
                                        "border-accent bg-white text-accent"
                                        : "border-border-light bg-white/70 text-body hover:border-accent/50"
                                        }`}
                                >
                                    {option.label}
                                </button>
                            );
                        })}
                    </div>
                </div>
                {completedBy !== "self" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
                            : "No active package"}
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

function BuilderIntroPanel() {
    return (
        <section className="rounded-3xl border border-accent/15 bg-gradient-to-br from-accent/10 via-white to-background-secondary p-5 md:p-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="max-w-2xl">
                    <span className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent shadow-sm">
                        Family plan workspace
                    </span>
                    <h2 className="mt-3 text-2xl md:text-3xl font-serif text-heading">
                        Build one shared trip, then manage each traveller
                        separately.
                    </h2>
                    <p className="mt-2 text-sm text-muted leading-relaxed">
                        Start with the itinerary everyone shares. After that,
                        open each member card on its own so personal details,
                        caregiver context, medical history, and vaccine answers
                        do not blend together.
                    </p>
                </div>
                <div className="rounded-2xl border border-white/80 bg-white/80 p-4 text-sm text-body shadow-sm lg:max-w-xs">
                    <p className="font-semibold text-heading">
                        Finalizing this family trip will submit it to the
                        server and queue an individual TravelPlan for every
                        completed member.
                    </p>
                </div>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-3">
                {FAMILY_BUILDER_GUIDE.map((item, index) => (
                    <div
                        key={item.title}
                        className="rounded-2xl border border-white/80 bg-white/85 p-4 shadow-sm"
                    >
                        <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-accent text-xs font-bold text-white">
                            {index + 1}
                        </div>
                        <h3 className="font-serif text-lg text-heading">
                            {item.title}
                        </h3>
                        <p className="mt-1 text-sm leading-relaxed text-muted">
                            {item.description}
                        </p>
                    </div>
                ))}
            </div>
        </section>
    );
}

// ─── Main Component ────────────────────────────────────────────

export default function FamilyTripBuilder() {
    const navigate = useNavigate();
    const { user: authUser } = useAuth();
    const { data: categoriesRaw, isLoading: questionsLoading } =
        useOnboardingQuestions();
    const [step, setStep] = useState<BuilderStep>("trip");
    const [expandedMember, setExpandedMember] = useState<number | null>(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isPreviewing, setIsPreviewing] = useState(false);
    const [previewData, setPreviewData] =
        useState<FamilyTripPreviewResponse | null>(null);
    const [sharedFieldErrors, setSharedFieldErrors] = useState<Set<string>>(
        new Set(),
    );
    const [memberProfileErrors, setMemberProfileErrors] =
        useState<FieldErrorMap>({});
    const [memberQuestionnaireErrors, setMemberQuestionnaireErrors] =
        useState<FieldErrorMap>({});

    const initialMainApplicant = useMemo(() => {
        const m = defaultMember("MAIN_APPLICANT");
        if (authUser) {
            m.firstName = authUser.first_name;
            m.lastName = authUser.last_name;
            m.memberEmail = authUser.email;
        }
        return m;
    }, [authUser]);

    const [request, setRequest] = useState<FamilyTripRequest>({
        packageType: "STANDARD",
        destination: "",
        country: "",
        duration: 1,
        purpose: "Leisure",
        tripType: "return",
        tripDetailsJson: "",
        members: [initialMainApplicant],
    });

    const [sharedAnswers, setSharedAnswers] = useState<AnswerMap>({
        travel_companions: "family",
        trip_itinerary: { tripType: "return" } satisfies TripItineraryData,
    });
    const [memberAnswers, setMemberAnswers] = useState<AnswerMap[]>([
        defaultMemberAnswers("MAIN_APPLICANT"),
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
                            : [defaultMember("MAIN_APPLICANT")],
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
                        : [defaultMember("MAIN_APPLICANT")]
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

    const clearSharedFieldError = (key: string) => {
        setSharedFieldErrors((prev) => {
            if (!prev.has(key)) return prev;
            const next = new Set(prev);
            next.delete(key);
            return next;
        });
    };

    const clearMemberProfileError = (index: number, key: string) => {
        setMemberProfileErrors((prev) => {
            const current = prev[index];
            if (!current?.has(key)) return prev;
            const nextSet = new Set(current);
            nextSet.delete(key);
            const next = { ...prev };
            if (nextSet.size > 0) next[index] = nextSet;
            else delete next[index];
            return next;
        });
    };

    const clearMemberQuestionnaireError = (index: number, key: string) => {
        setMemberQuestionnaireErrors((prev) => {
            const current = prev[index];
            if (!current?.has(key)) return prev;
            const nextSet = new Set(current);
            nextSet.delete(key);
            const next = { ...prev };
            if (nextSet.size > 0) next[index] = nextSet;
            else delete next[index];
            return next;
        });
    };

    const setSharedAnswer = (key: string, value: unknown) => {
        setSharedAnswers((prev) => ({ ...prev, [key]: value }));
        clearSharedFieldError(key);
    };

    const toggleSharedCheckbox = (key: string, value: string) => {
        setSharedAnswers((prev) => {
            const current = toNonEmptyStringArray(prev[key]);
            return {
                ...prev,
                [key]:
                    current.includes(value) ?
                        current.filter((entry) => entry !== value)
                        : [...current, value],
            };
        });
        clearSharedFieldError(key);
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
        clearMemberProfileError(index, field);
        if (field === "dateOfBirth") clearMemberProfileError(index, "age_years");

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
                        : answers,
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
        clearMemberProfileError(index, key);
        if (key === "age_years") clearMemberProfileError(index, "dateOfBirth");
        clearMemberQuestionnaireError(index, key);
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
                            : [...current, value],
                };
            }),
        );
        clearMemberQuestionnaireError(index, key);
    };

    const addMember = () => {
        setRequest((prev) => ({
            ...prev,
            members: [
                prev.members[0],
                defaultMember("CHILD"),
                ...prev.members.slice(1),
            ],
        }));
        setMemberAnswers((prev) => [
            prev[0],
            defaultMemberAnswers("CHILD"),
            ...prev.slice(1),
        ]);
        setExpandedMember(request.members.length);
    };

    const removeMember = (index: number) => {
        if (index === 0) {
            toast.error("Main applicant cannot be removed");
            return;
        }
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
        const reindexErrors = (prev: FieldErrorMap): FieldErrorMap =>
            Object.entries(prev).reduce<FieldErrorMap>((next, [key, value]) => {
                const memberIndex = Number(key);
                if (memberIndex < index) next[memberIndex] = value;
                if (memberIndex > index) next[memberIndex - 1] = value;
                return next;
            }, {});
        setMemberProfileErrors(reindexErrors);
        setMemberQuestionnaireErrors(reindexErrors);
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

        const issues = getValidationIssues(
            sharedCategories,
            normalizedSharedAnswers,
        );
        if (issues.length > 0) {
            setSharedFieldErrors(new Set(issues.map((issue) => issue.key)));
            scrollToValidationTarget(getQuestionFieldId(issues[0].key));
            toast.error(issues[0].message);
            return false;
        }

        if (!buildPlanPayloadFromAnswers(normalizedSharedAnswers)) {
            setSharedFieldErrors(new Set(["trip_itinerary"]));
            scrollToValidationTarget(getQuestionFieldId("trip_itinerary"));
            toast.error("Complete the shared trip itinerary first");
            return false;
        }

        setSharedFieldErrors(new Set());
        return true;
    };

    const validateMembersStep = (): boolean => {
        if (request.members.length === 0) {
            toast.error("Add at least one family member");
            return false;
        }

        const nextErrors: FieldErrorMap = {};
        let firstInvalidIndex: number | null = null;
        let firstInvalidField = "";
        let firstMessage = "";

        for (let index = 0; index < request.members.length; index++) {
            const member = request.members[index];
            const answers = memberAnswers[index] ?? {};
            const errors = new Set<string>();
            const messages: string[] = [];

            if (!member.relationship?.trim()) {
                errors.add("relationship");
                messages.push(`Select relationship for ${memberLabel(member, index)}`);
            }
            if (!member.firstName?.trim()) {
                errors.add("firstName");
                messages.push(`Enter first name for ${memberLabel(member, index)}`);
            }
            if (!member.lastName?.trim()) {
                errors.add("lastName");
                messages.push(`Enter last name for ${memberLabel(member, index)}`);
            }
            if (
                !member.dateOfBirth?.trim() &&
                numberFromAnswer(answers.age_years) === null
            ) {
                errors.add("dateOfBirth");
                errors.add("age_years");
                messages.push(
                    `Select age or date of birth for ${memberLabel(member, index)}`,
                );
            }
            if (!String(answers.gender ?? "").trim()) {
                errors.add("gender");
                messages.push(
                    `Select biological sex for ${memberLabel(member, index)}`,
                );
            }
            if (!String(answers.nationality ?? "").trim()) {
                errors.add("nationality");
                messages.push(`Select nationality for ${memberLabel(member, index)}`);
            }
            if (!String(answers.current_residence_country ?? "").trim()) {
                errors.add("current_residence_country");
                messages.push(
                    `Select current residence country for ${memberLabel(member, index)}`,
                );
            }

            if (errors.size > 0) {
                nextErrors[index] = errors;
                if (firstInvalidIndex === null) {
                    firstInvalidIndex = index;
                    firstInvalidField = errors.values().next().value ?? "firstName";
                    firstMessage = messages[0] ?? "Please fill in all required member details.";
                }
            }
        }

        if (firstInvalidIndex !== null) {
            setMemberProfileErrors(nextErrors);
            setExpandedMember(firstInvalidIndex);
            scrollToValidationTarget(
                getMemberProfileFieldId(firstInvalidIndex, firstInvalidField),
            );
            toast.error(firstMessage);
            return false;
        }

        setMemberProfileErrors({});
        return true;
    };

    const validateMemberQuestionnaires = (): boolean => {
        const nextErrors: FieldErrorMap = {};
        let firstInvalidIndex: number | null = null;
        let firstInvalidKey = "";
        let firstMessage = "";

        for (let index = 0; index < request.members.length; index++) {
            const member = request.members[index];
            const answers = memberAnswers[index] ?? {};
            const issues = getValidationIssues(memberCategories, answers);
            if (issues.length > 0) {
                nextErrors[index] = new Set(issues.map((issue) => issue.key));
                if (firstInvalidIndex === null) {
                    firstInvalidIndex = index;
                    firstInvalidKey = issues[0].key;
                    firstMessage = `${memberLabel(member, index)}: ${issues[0].message}`;
                }
            }
        }

        if (firstInvalidIndex !== null) {
            setMemberQuestionnaireErrors(nextErrors);
            setExpandedMember(firstInvalidIndex);
            scrollToValidationTarget(
                getQuestionFieldId(firstInvalidKey, `member-${firstInvalidIndex}`),
            );
            toast.error(firstMessage);
            return false;
        }

        setMemberQuestionnaireErrors({});
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
        if (!validateSharedStep()) {
            setStep("trip");
            return;
        }
        if (!validateMembersStep()) {
            setStep("members");
            return;
        }
        if (!validateMemberQuestionnaires()) {
            setStep("questionnaire");
            return;
        }
        const payload = buildRequestWithQuestionnaires();
        if (!payload) return;

        setIsSubmitting(true);
        try {
            const draftRes = await familyTripApi.saveDraft(payload);
            const tripId = draftRes.data.data.id;
            await familyTripApi.submit(tripId);
            toast.success(
                "Family trip submitted. Travel plans are being generated for each member.",
            );
            navigate(`/dashboard/family-trip/${tripId}`);
        } catch (err: unknown) {
            toast.error(
                getApiErrorMessage(err, "Failed to finalize family trip"),
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const currentStepIndex = STEP_ORDER.indexOf(step);

    const stepIndicator = (
        <div className="flex items-center gap-2 overflow-x-auto rounded-2xl border border-border-light bg-background-secondary/60 p-3">
            {STEP_ORDER.map((stepKey, index) => {
                const active = stepKey === step;
                const done = index < currentStepIndex;
                return (
                    <div
                        key={stepKey}
                        className="flex items-center gap-2 shrink-0"
                    >
                        <div
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${active ? "bg-accent text-white"
                                : done ? "bg-accent/15 text-accent"
                                    : "bg-background-secondary text-muted"
                                }`}
                        >
                            <span
                                className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${active ? "bg-white text-accent"
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
            <DashboardHeader title="Family Trip Builder" />

            <div className="relative z-10 mx-auto max-w-6xl pb-14 pt-8">
                <div className="bg-white/95 rounded-3xl border border-border-light overflow-hidden">
                    <div className="p-5 md:p-8 space-y-10">
                        <BuilderIntroPanel />
                        {stepIndicator}

                        {step === "trip" && (
                            <>
                                <section className="rounded-2xl border border-accent/15 bg-accent/5 p-5 md:p-6">
                                    <h2 className="text-2xl font-serif text-heading mb-2">
                                        Step 1: shared trip details
                                    </h2>
                                    <p className="text-sm text-muted leading-relaxed">
                                        Keep this section about the journey only:
                                        itinerary, accommodation, planned
                                        activities, and preparation. We will ask
                                        for each traveller's identity and health
                                        information in separate member cards
                                        next.
                                    </p>
                                </section>

                                {questionsLoading ?
                                    <div className="py-16 text-center">
                                        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                                        <p className="text-sm text-muted">
                                            Loading questionnaire...
                                        </p>
                                    </div>
                                    : <div className="space-y-8">
                                        {sharedCategories.map((category) => (
                                            <QuestionGroup
                                                key={category.category_key}
                                                category={category}
                                                answers={
                                                    normalizedSharedAnswers
                                                }
                                                errorKeys={sharedFieldErrors}
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
                                        Continue to Member Profiles
                                    </Button>
                                </div>
                            </>
                        )}

                        {step === "members" && (
                            <>
                                <section className="space-y-6">
                                    <div className="rounded-3xl border border-accent/15 bg-accent/5 p-5 md:p-6">
                                        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                                            <div>
                                                <span className="text-xs font-semibold uppercase tracking-wider text-accent">
                                                    Step 2
                                                </span>
                                                <h2 className="mt-1 text-2xl font-serif text-heading">
                                                    Set up one member profile at
                                                    a time
                                                </h2>
                                                <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted">
                                                    Each card below belongs to
                                                    one traveller. Expand only
                                                    the person you are editing,
                                                    then add their identity,
                                                    age, nationality,
                                                    residence, and caregiver
                                                    context before moving to
                                                    medical questions.
                                                </p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={addMember}
                                                className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wider text-accent shadow-sm ring-1 ring-accent/15 transition-colors hover:bg-accent/10"
                                            >
                                                <LucidePlus className="w-4 h-4" />
                                                Add Member
                                            </button>
                                        </div>

                                        <div className="mt-5 grid gap-3 md:grid-cols-3">
                                            <div className="rounded-2xl bg-white/80 p-4 text-sm text-muted ring-1 ring-white">
                                                <p className="font-semibold text-heading">
                                                    Shared details stay shared
                                                </p>
                                                <p className="mt-1">
                                                    Do not repeat itinerary
                                                    answers here.
                                                </p>
                                            </div>
                                            <div className="rounded-2xl bg-white/80 p-4 text-sm text-muted ring-1 ring-white">
                                                <p className="font-semibold text-heading">
                                                    One profile per traveller
                                                </p>
                                                <p className="mt-1">
                                                    Adult, child, and dependent
                                                    data are kept separate.
                                                </p>
                                            </div>
                                            <div className="rounded-2xl bg-white/80 p-4 text-sm text-muted ring-1 ring-white">
                                                <p className="font-semibold text-heading">
                                                    Health comes next
                                                </p>
                                                <p className="mt-1">
                                                    Medical answers are asked
                                                    after these profile basics.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                        <div>
                                            <h3 className="text-xl font-serif text-heading">
                                                Travellers ({request.members.length})
                                            </h3>
                                            <p className="text-sm text-muted">
                                                Complete the open card, collapse
                                                it, then move to the next
                                                traveller.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-5">
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
                                                const isExpanded =
                                                    expandedMember === index;
                                                const profileComplete =
                                                    isMemberProfileComplete(
                                                        member,
                                                        answers,
                                                    );
                                                const hasProfileErrors = Boolean(
                                                    memberProfileErrors[index]
                                                        ?.size,
                                                );

                                                return (
                                                    <article
                                                        key={index}
                                                        className={`overflow-hidden rounded-3xl border transition-all ${hasProfileErrors ?
                                                            "border-red-300 bg-red-50/30 ring-2 ring-red-400/40"
                                                            : isExpanded ?
                                                                "border-accent/40 bg-white shadow-[0_18px_45px_-35px_rgba(42,122,106,0.65)]"
                                                                : "border-border-light bg-background-secondary/70"
                                                            }`}
                                                    >
                                                        <div className="p-5 md:p-6">
                                                            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        setExpandedMember(
                                                                            isExpanded ?
                                                                                null
                                                                                : index,
                                                                        )
                                                                    }
                                                                    className="min-w-0 flex-1 text-left"
                                                                >
                                                                    <div className="flex items-start gap-4">
                                                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-accent/10 text-sm font-bold text-accent">
                                                                            {getMemberInitials(
                                                                                member,
                                                                                index,
                                                                            )}
                                                                        </div>
                                                                        <div className="min-w-0">
                                                                            <div className="flex flex-wrap items-center gap-2">
                                                                                <h4 className="text-xl font-serif text-heading">
                                                                                    {memberLabel(
                                                                                        member,
                                                                                        index,
                                                                                    )}
                                                                                </h4>
                                                                                <span
                                                                                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${profileComplete ?
                                                                                        "bg-emerald-50 text-emerald-700"
                                                                                        : hasProfileErrors ?
                                                                                            "bg-red-50 text-red-700"
                                                                                            : "bg-amber-50 text-amber-700"
                                                                                        }`}
                                                                                >
                                                                                    {profileComplete ?
                                                                                        "Profile ready"
                                                                                        : hasProfileErrors ?
                                                                                            "Required fields missing"
                                                                                            : "Needs profile details"}
                                                                                </span>
                                                                            </div>
                                                                            <p className="mt-1 text-sm text-muted">
                                                                                {getRelationshipLabel(
                                                                                    member.relationship,
                                                                                )}
                                                                                {member.relationship === "MAIN_APPLICANT" && (
                                                                                    <span className="ml-2 inline-flex rounded-full bg-accent/10 px-2 py-0.5 text-xs font-semibold text-accent">You</span>
                                                                                )}
                                                                                {" · "}
                                                                                {age ===
                                                                                    null ?
                                                                                    "Age pending"
                                                                                    : isAdult ?
                                                                                        `Adult · ${getMemberAgeLabel(member, answers)}`
                                                                                        : `Dependent/child · ${getMemberAgeLabel(member, answers)}`}
                                                                            </p>
                                                                            <p className="mt-2 text-sm leading-relaxed text-muted">
                                                                                These profile answers will stay attached to this traveller's final plan.
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                </button>

                                                                <div className="flex shrink-0 flex-wrap items-center gap-2">
                                                                    {index > 0 && (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() =>
                                                                                removeMember(
                                                                                    index,
                                                                                )
                                                                            }
                                                                            className="inline-flex items-center gap-1.5 rounded-xl border border-border-light bg-white px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                                                                            aria-label="Remove member"
                                                                        >
                                                                            <LucideTrash className="w-4 h-4" />
                                                                            Remove
                                                                        </button>
                                                                    )}
                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            setExpandedMember(
                                                                                isExpanded ?
                                                                                    null
                                                                                    : index,
                                                                            )
                                                                        }
                                                                        className="inline-flex items-center gap-1.5 rounded-xl border border-accent/20 bg-white px-3 py-2 text-xs font-semibold uppercase tracking-wider text-accent transition-colors hover:bg-accent/10"
                                                                    >
                                                                        {isExpanded ?
                                                                            "Collapse"
                                                                            : "Edit details"}
                                                                        <LucideChevronDown
                                                                            className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                                                                        />
                                                                    </button>
                                                                </div>
                                                            </div>

                                                            {!isExpanded && (
                                                                <div className="mt-5 grid gap-3 md:grid-cols-3">
                                                                    <div className="rounded-2xl bg-white p-4 text-sm ring-1 ring-border-light">
                                                                        <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                                                                            Identity
                                                                        </p>
                                                                        <p className="mt-1 font-medium text-heading">
                                                                            {member.firstName?.trim() &&
                                                                                member.lastName?.trim() ?
                                                                                "Name added"
                                                                                : "Name needed"}
                                                                        </p>
                                                                    </div>
                                                                    <div className="rounded-2xl bg-white p-4 text-sm ring-1 ring-border-light">
                                                                        <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                                                                            Age
                                                                        </p>
                                                                        <p className="mt-1 font-medium text-heading">
                                                                            {getMemberAgeLabel(
                                                                                member,
                                                                                answers,
                                                                            )}
                                                                        </p>
                                                                    </div>
                                                                    <div className="rounded-2xl bg-white p-4 text-sm ring-1 ring-border-light">
                                                                        <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                                                                            Residence
                                                                        </p>
                                                                        <p className="mt-1 font-medium text-heading">
                                                                            {String(
                                                                                answers.current_residence_country ??
                                                                                "",
                                                                            ).trim() ||
                                                                                "Residence needed"}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {isExpanded && (
                                                            <div className="border-t border-border-light bg-white p-5 md:p-6">
                                                                <div className="mb-6 rounded-2xl border border-border-light bg-background-secondary p-4 text-sm text-muted">
                                                                    <span className="font-semibold text-heading">
                                                                        Editing {memberLabel(
                                                                            member,
                                                                            index,
                                                                        )}
                                                                    </span>{" "}
                                                                    — complete these profile basics, then use the next step for medical history and vaccines.
                                                                </div>
                                                                <MemberProfileFields
                                                                    member={
                                                                        member
                                                                    }
                                                                    answers={
                                                                        answers
                                                                    }
                                                                    index={
                                                                        index
                                                                    }
                                                                    fieldErrors={
                                                                        memberProfileErrors[
                                                                        index
                                                                        ]
                                                                    }
                                                                    onMemberChange={
                                                                        handleMemberChange
                                                                    }
                                                                    onAnswerChange={
                                                                        handleMemberAnswerChange
                                                                    }
                                                                />
                                                            </div>
                                                        )}
                                                    </article>
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
                                                : "Preview Cost"}
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
                                            Continue to Per-Member Health Info
                                        </Button>
                                    </div>
                                </section>

                                <CostBreakdown previewData={previewData} />
                            </>
                        )}

                        {step === "questionnaire" && (
                            <>
                                <div>
                                    <section className="mb-7 rounded-3xl border border-accent/15 bg-accent/5 p-5 md:p-6">
                                        <span className="text-xs font-semibold uppercase tracking-wider text-accent">
                                            Step 3
                                        </span>
                                        <h2 className="mt-1 text-2xl font-serif text-heading">
                                            Complete health answers per member
                                        </h2>
                                        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted">
                                            Open one traveller, answer only that
                                            person's medical history,
                                            vaccination, travel history, and
                                            risk questions, then collapse the
                                            card and move to the next member.
                                        </p>
                                    </section>

                                    <div className="space-y-5">
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
                                                const hasQuestionnaireErrors =
                                                    Boolean(
                                                        memberQuestionnaireErrors[
                                                            index
                                                        ]?.size,
                                                    );

                                                return (
                                                    <div
                                                        key={index}
                                                        className={`border rounded-3xl overflow-hidden bg-white shadow-[0_8px_30px_-24px_rgba(10,20,18,0.45)] transition-all duration-500 ${hasQuestionnaireErrors ? "border-red-300 ring-2 ring-red-400/40" : "border-border-light"}`}
                                                    >
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setExpandedMember(
                                                                    isExpanded ?
                                                                        null
                                                                        : index,
                                                                )
                                                            }
                                                            className="w-full flex items-center justify-between gap-4 px-5 py-5 md:px-6 bg-background-secondary hover:bg-accent/5 transition-colors text-left"
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-9 h-9 rounded-full bg-accent/10 flex items-center justify-center">
                                                                    <span className="text-accent text-xs font-bold">
                                                                        {getMemberInitials(
                                                                            member,
                                                                            index,
                                                                        )}
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
                                                                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${memberComplete ?
                                                                        "text-emerald-700 bg-emerald-50"
                                                                        : hasQuestionnaireErrors ?
                                                                            "text-red-700 bg-red-50"
                                                                            : "text-amber-700 bg-amber-50"
                                                                        }`}
                                                                >
                                                                    {memberComplete ?
                                                                        "Complete"
                                                                        : hasQuestionnaireErrors ?
                                                                            "Required answers missing"
                                                                            : "Needs answers"}
                                                                </span>
                                                                <LucideChevronDown
                                                                    className={`w-4 h-4 text-muted transition-transform ${isExpanded ? "rotate-180" : ""}`}
                                                                />
                                                            </div>
                                                        </button>

                                                        {isExpanded && (
                                                            <div className="p-5 md:p-6 space-y-9 bg-white border-t border-border-light">
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
                                                                            errorKeys={
                                                                                memberQuestionnaireErrors[
                                                                                index
                                                                                ]
                                                                            }
                                                                            fieldIdPrefix={`member-${index}`}
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
                                            Review & Finalize
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
                                    <p className="text-sm text-muted mb-6 leading-relaxed">
                                        Confirm the shared itinerary and each
                                        member's questionnaire status. When you
                                        finalize, the family trip is submitted
                                        and the server queues a separate
                                        TravelPlan for every completed member.
                                    </p>

                                    <div className="bg-background-secondary rounded-2xl p-5 mb-5 space-y-2 text-sm">
                                        <div className="flex justify-between gap-4">
                                            <span className="text-muted font-semibold uppercase tracking-wider text-xs">
                                                Destination
                                            </span>
                                            <span className="text-heading font-medium text-right">
                                                {derivedTripPayload ?
                                                    `${derivedTripPayload.destination}, ${derivedTripPayload.country}`
                                                    : "Not set"}
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
                                                            className={`text-xs font-semibold px-2.5 py-1 rounded-full ${memberComplete ?
                                                                "bg-emerald-50 text-emerald-700"
                                                                : "bg-amber-50 text-amber-700"
                                                                }`}
                                                        >
                                                            {memberComplete ?
                                                                "Questionnaire complete"
                                                                : "Questionnaire missing"
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
                                            "Finalizing..."
                                            : "Finalize & Create Plans"}
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
