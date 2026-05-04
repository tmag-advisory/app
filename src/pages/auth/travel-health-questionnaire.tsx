import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import CountryPicker from "../../components/CountryPicker";
import {
    LucideArrowRight,
    LucideArrowLeft,
    LucideCheck,
    LucideCheckCircle,
    LucideChevronDown,
    LucideChevronUp,
    LucidePlane,
    LucideHeartPulse,
    LucideSyringe,
    LucideBug,
    LucideShieldCheck,
    LucideSparkles,
    LucideSkipForward,
    LucidePlus,
    LucideX,
    LucideLoader2,
    LucideUsers,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { canAccessHR } from "../../lib/canAccessHr";
import {
    useOnboardingQuestions,
    useSubmitQuestionnaire,
    useSaveQuestionnaireProgress,
    useGetQuestionnaireProgress,
    useCreateTravelPlan,
    useAcceptQuestionnaireConsent,
    useDoctorReviewers,
} from "../../api/hooks";
import toast, { Toaster } from "react-hot-toast";
import { getAuthCookie } from "../../api/axios";
import TripItineraryFlow, {
    hydrateLegacyTripItinerary,
    type TripItineraryData,
} from "../../components/plan/TripItineraryFlow";
import { mergeCityCountry } from "../../components/plan/tripItineraryMerge";
import { validateTripItineraryDates } from "../../components/plan/tripItineraryValidation";
import {
    isDateOfBirthPlausible,
    isPlausibleEmail,
    isValidOptionalNonNegativeNumber,
    todayIsoDateLocal,
} from "../../lib/questionnaireFieldValidation";

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
    type: "radio" | "checkbox" | "text" | "textarea" | "date" | "vaccine_table" | "country" | "multi_country" | "trip_itinerary";
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
        const legs = d.multiLegs || [];
        if (legs.length < 1) return false;
        if (!d.multiDepartingFromCity?.trim() || !d.multiDepartingFromCountry?.trim()) return false;
        filled = legs.every((leg) => leg.country?.trim() && leg.arrivalDate?.trim() && leg.nights?.trim());
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
    // Backward compatibility for older seeded questionnaires.
    tourism: "Leisure",
    business: "Business",
    visiting_family: "Leisure",
    study_work: "Study",
    volunteer: "Volunteer",
    pilgrimage: "Other",
};

const PREFILLED_KEYS = new Set(["full_name_passport", "email_address"]);

const CONSENT_TEXT =
    "I hereby give Travel Medicine Advisory Global my explicit consent to collect, process, and store my personal and sensitive health information (including medical history, medications, pregnancy status, and risk behaviours) for the sole purpose of generating my personalised travel health advisory plan.";
const DATA_PROTECTION_TEXT =
    "We protect your information with encryption, multi-factor authentication, and strict security measures. We comply with the Nigeria Data Protection Act (NDPA) 2023. Your data will not be sold or shared without your permission.";

/** Build create-plan payload from questionnaire answers (travel section). */
function derivePlanFromQuestionnaireAnswers(
    answers: Record<string, unknown>
): { destination: string; country: string; duration: number; purpose: string; medicalConsiderations: string } | null {
    const newCountriesRaw = answers.travel_countries;
    const newCountries = Array.isArray(newCountriesRaw)
        ? (newCountriesRaw as string[]).map((c) => c.trim()).filter(Boolean)
        : [];
    const itinerary = (answers.trip_itinerary as TripItineraryData | undefined) ?? undefined;

    const newCity = typeof answers.travel_city_region === "string"
        ? answers.travel_city_region.trim()
        : "";
    const newDeparture = typeof answers.departure_date === "string"
        ? answers.departure_date.trim()
        : "";
    const newReturnOrDuration = typeof answers.return_date_or_duration === "string"
        ? answers.return_date_or_duration.trim()
        : "";

    let destination = "";
    let country = "";
    let duration = 0;

    if (itinerary) {
        const it = hydrateLegacyTripItinerary(itinerary);
        const tripType = it.tripType || "one";

        if (tripType === "one") {
            country = (it.oneTo || "").trim();
            const fromMerged = mergeCityCountry(it.oneFromCity, it.oneFromCountry) || (it.oneFrom || "").trim();
            const toMerged = mergeCityCountry(it.oneToCity, it.oneTo) || country;
            destination = toMerged;
            if (fromMerged) destination = `${fromMerged} → ${toMerged}`;
        } else if (tripType === "return") {
            country = (it.returnTo || "").trim();
            const fromMerged = mergeCityCountry(it.returnFromCity, it.returnFromCountry) || (it.returnFrom || "").trim();
            const toMerged = mergeCityCountry(it.returnToCity, it.returnTo) || country;
            destination = toMerged;
            if (fromMerged) destination = `${fromMerged} → ${toMerged}`;
            const returnDuration = daysInclusiveBetween(it.returnDepartureDate, it.returnReturnDate);
            if (returnDuration > 0) duration = returnDuration;
        } else if (tripType === "multi") {
            const legs = it.multiLegs || [];
            const parts = legs
                .map((leg) => [leg.city, leg.country].filter(Boolean).join(", ").trim())
                .filter(Boolean);
            destination = parts.join(" → ");
            country = (legs[0]?.country || "").trim();
            const totalNights = legs.reduce((sum, leg) => {
                const n = parseInt(leg.nights ?? "", 10);
                return sum + (Number.isNaN(n) ? 0 : n);
            }, 0);
            if (totalNights > 0) duration = totalNights + 1;
        } else if (tripType === "transit") {
            country = (it.transitFinalDestination || "").trim();
            const depMerged = mergeCityCountry(it.transitFromCity, it.transitFromCountry) || (it.transitFrom || "").trim();
            const finMerged =
                mergeCityCountry(it.transitFinalDestinationCity, it.transitFinalDestination) || country;
            destination = `${depMerged} via ${(it.transitLocation || "").trim()} → ${finMerged}`;
            const transitDuration = daysInclusiveBetween(it.transitDepartureDate, it.transitReturnDate);
            if (transitDuration > 0) duration = transitDuration;
        }
    } else if (newCountries.length > 0) {
        country = newCountries[0];
        const countryList = newCountries.join(", ");
        destination = [newCity, countryList].filter(Boolean).join(", ") || countryList;

        if (/^\d{4}-\d{2}-\d{2}$/.test(newReturnOrDuration)) {
            duration = daysInclusiveBetween(newDeparture, newReturnOrDuration);
        } else {
            const durationFromText = parseInt(newReturnOrDuration, 10);
            if (!Number.isNaN(durationFromText) && durationFromText > 0) {
                duration = durationFromText;
            }
        }
    }

    if (!country.trim()) return null;

    const purposeSelections = answers.purpose_of_travel ?? answers.travel_purpose;
    let purpose = "Leisure";
    if (Array.isArray(purposeSelections) && purposeSelections.length > 0) {
        const first = purposeSelections[0] as string;
        purpose = TRAVEL_PURPOSE_TO_PLAN[first] ?? "Other";
    }

    const extra =
        typeof answers.additional_relevant_activities === "string"
            ? answers.additional_relevant_activities.trim()
            : typeof answers.lifestyle_additional_context === "string"
                ? answers.lifestyle_additional_context.trim()
                : typeof answers.additional_considerations === "string"
                    ? answers.additional_considerations.trim()
                    : typeof answers.additional_information === "string"
                        ? answers.additional_information.trim()
                        : "";

    return {
        destination: destination || country,
        country,
        duration: duration > 0 ? duration : 7,
        purpose,
        medicalConsiderations: extra,
    };
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

function isQuestionAnswered(question: Question, answers: Record<string, unknown>): boolean {
    if (!question.required) return true;
    const value = answers[question.key];
    if (question.type === "trip_itinerary") {
        return isTripItineraryComplete(value as TripItineraryData | undefined);
    }
    if (question.type === "checkbox" || question.type === "multi_country") {
        return Array.isArray(value) && value.length > 0;
    }
    return String(value ?? "").trim().length > 0;
}

// ─── Main Component ──────────────────────────────────────────

const TravelHealthQuestionnaire = () => {
    const navigate = useNavigate();
    const { user, refreshProfile } = useAuth();
    const { data: categoriesRaw, isLoading: questionsLoading } =
        useOnboardingQuestions();
    const submitQuestionnaire = useSubmitQuestionnaire();
    const saveProgress = useSaveQuestionnaireProgress();
    const { data: savedProgress } = useGetQuestionnaireProgress();
    const createPlan = useCreateTravelPlan();
    const acceptConsent = useAcceptQuestionnaireConsent();
    const { data: reviewers = [] } = useDoctorReviewers();
    const isFreePlan = !user?.user_credit_plan || user.user_credit_plan.code === "ESSENTIAL";

    const [answers, setAnswers] = useState<Record<string, unknown>>({});
    const [categoryIndex, setCategoryIndex] = useState(0);
    const [direction, setDirection] = useState(1);
    const [showIntro, setShowIntro] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [showComplete, setShowComplete] = useState(false);
    const [showCreatePlan, setShowCreatePlan] = useState(false);
    const [medicalDisclaimerConsentGiven, setMedicalDisclaimerConsentGiven] =
        useState(false);
    const [planForm, setPlanForm] = useState({
        destination: "",
        country: "",
        duration: "",
        purpose: "Leisure",
        medicalConsiderations: "",
    });

    // Mobile accordion state for progress tracker
    const [mobileAccordionOpen, setMobileAccordionOpen] = useState(false);
    const [isSavingExit, setIsSavingExit] = useState(false);
    const [wantsDoctorSelection, setWantsDoctorSelection] = useState(false);
    const [selectedDoctorIds, setSelectedDoctorIds] = useState<number[]>([]);

    const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const pendingSaveRef = useRef(false);
    const latestStateRef = useRef({ answers: {} as Record<string, unknown>, categoryIndex: 0, questionIndex: -1 as number });
    const restoredRef = useRef(false);
    const generatingPlanLabelRef = useRef({ destination: "", country: "" });

    const categories: (QuestionCategory & { parsedQuestions: Question[] })[] =
        (categoriesRaw || []).map((cat: QuestionCategory) => {
            let parsed: Question[] = [];
            try {
                parsed = typeof cat.questions === "string"
                    ? JSON.parse(cat.questions)
                    : (cat.questions as Question[]) ?? [];
            } catch {
                parsed = [];
            }
            return { ...cat, parsedQuestions: Array.isArray(parsed) ? parsed : [] };
        });

    const currentCategory = categories[categoryIndex];
    const visibleQuestions =
        currentCategory?.parsedQuestions.filter(
            (q) => shouldShowQuestion(q, answers)
        ) || [];
    // Restore progress (only once per mount, only if server returned valid progress)
    useEffect(() => {
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
                if (catIdx > 0 || qIdx >= 0) {
                    setMedicalDisclaimerConsentGiven(true);
                }
                // Grouped flow: -1 or missing means section intro; legacy per-question saves used qIdx >= 0 for in-section — open questions view.
                setShowIntro(qIdx < 0);
            }
        }
    }, [savedProgress]); // eslint-disable-line react-hooks/exhaustive-deps

    // Pre-fill profile fields (same behaviour as PlanQuestionnaireFlow / create-plan)
    useEffect(() => {
        if (!user) return;
        const fullName = [user.first_name, user.last_name].filter(Boolean).join(" ").trim();
        setAnswers((prev) => ({
            ...prev,
            ...(fullName && !prev.full_name_passport ? { full_name_passport: fullName } : {}),
            ...(user.email && !prev.email_address ? { email_address: user.email } : {}),
        }));
    }, [user]);

    // Keep refs in sync with latest state and mark dirty
    useEffect(() => {
        latestStateRef.current = { answers, categoryIndex, questionIndex: -1 };
        if (Object.keys(answers).length > 0) pendingSaveRef.current = true;
    }, [answers, categoryIndex, showIntro]);

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

    const handleSaveAndExit = async () => {
        const dashboardPath = user && canAccessHR(user) ? "/hr" : "/dashboard";
        setIsSavingExit(true);
        try {
            const s = latestStateRef.current;
            await saveProgress.mutateAsync({
                answers: s.answers,
                categoryIndex: s.categoryIndex,
                questionIndex: s.questionIndex,
            });
            pendingSaveRef.current = false;
        } catch {
            // still navigate so user isn't trapped
        } finally {
            setIsSavingExit(false);
        }
        navigate(dashboardPath);
    };

    // ─── Navigation ──────────────────────────────────────────

    const goNext = () => {
        console.log(
            "Go next clicked. Validating current answers before proceeding...",
            showIntro,
            visibleQuestions,
            answers,
        );
        if (showIntro) return;
        for (const q of visibleQuestions) {
            if (!isQuestionAnswered(q, answers)) {
                if (q.type === "trip_itinerary") {
                    const d = hydrateLegacyTripItinerary(answers[q.key] as TripItineraryData);
                    const tripErr = validateTripItineraryDates(d);
                    if (tripErr) {
                        toast.error(tripErr);
                        return;
                    }
                }
                toast.error(`Please answer: "${q.text}"`);
                return;
            }
        }
        for (const q of visibleQuestions) {
            if (q.key === "date_of_birth" && q.required) {
                const v = String(answers[q.key] ?? "").trim();
                if (v && !isDateOfBirthPlausible(v)) {
                    toast.error("Date of birth cannot be in the future.");
                    return;
                }
            }
            if (q.key === "email_address" && q.required) {
                const v = String(answers[q.key] ?? "").trim();
                if (v && !isPlausibleEmail(v)) {
                    toast.error("Please enter a valid email address.");
                    return;
                }
            }
            if (
                q.key === "longest_flight_leg_hours" ||
                q.key === "total_flying_hours" ||
                q.key === "number_of_flight_legs"
            ) {
                const v = String(answers[q.key] ?? "").trim();
                if (v && !isValidOptionalNonNegativeNumber(v)) {
                    toast.error(`Please enter a valid non-negative number for "${q.text}"`);
                    return;
                }
            }
        }
        setDirection(1);
        const nextCat = categoryIndex + 1;
        if (nextCat >= categories.length) {
            void handleSubmit();
            return;
        }
        setCategoryIndex(nextCat);
        setShowIntro(true);
    };

    const goPrev = () => {
        setDirection(-1);
        if (showIntro) {
            if (categoryIndex === 0) return;
            setCategoryIndex((i) => i - 1);
            setShowIntro(false);
            return;
        }
        setShowIntro(true);
    };

    const startCategory = () => {
        if (categoryIndex === 0 && !medicalDisclaimerConsentGiven) {
            toast.error("Please accept the medical disclaimer to continue.");
            return;
        }
        setShowIntro(false);
        setDirection(1);
    };

    const skipCategory = () => {
        setDirection(1);
        const nextCat = categoryIndex + 1;
        if (nextCat >= categories.length) {
            void handleSubmit();
            return;
        }
        setCategoryIndex(nextCat);
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

    // Calculate progress based on sections completed + current section progress
    // This makes early progress more rewarding and feels less overwhelming
    const totalSections = categories.length;
    const progressPercent =
        totalSections > 0 ? Math.min(Math.round((categoryIndex / totalSections) * 100), 100) : 0;

    const isLastSection = categoryIndex === categories.length - 1 && !showIntro;

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

    // ─── Plan form handlers ──────────────────────────────────

    const updatePlanForm = (field: string, value: string) =>
        setPlanForm((f) => ({ ...f, [field]: value }));

    const submitTravelPlan = async (payload: {
        destination: string;
        country: string;
        duration: number;
        purpose: string;
        medicalConsiderations: string;
        selectedDoctorIds?: number[];
    }) => {
        const credits = user?.credits ?? 0;
        if (credits <= 0) {
            toast.error("You don't have enough credits.");
            return;
        }
        generatingPlanLabelRef.current = {
            destination: payload.destination,
            country: payload.country,
        };
        try {
            const result = await createPlan.mutateAsync({
                destination: payload.destination,
                country: payload.country,
                duration: payload.duration,
                purpose: payload.purpose,
                tripType: "one-way",
                tripDetailsJson: JSON.stringify({
                    tripType: "one-way",
                    stops: [
                        {
                            city: payload.destination,
                            country: payload.country,
                            order: 1,
                        },
                    ],
                }),
                medicalConsiderations: payload.medicalConsiderations,
                selectedDoctorIds: payload.selectedDoctorIds ?? [],
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
            await refreshProfile();
            navigate(`/dashboard/plans/${result.id}`);
        } catch {
            toast.error("Failed to generate plan. Please try again.");
        }
    };

    const handleCreatePlan = async (e: React.FormEvent) => {
        e.preventDefault();
        await submitTravelPlan({
            destination: planForm.destination,
            country: planForm.country,
            duration: parseInt(planForm.duration, 10) || 0,
            purpose: planForm.purpose,
            medicalConsiderations: planForm.medicalConsiderations,
            selectedDoctorIds: wantsDoctorSelection ? selectedDoctorIds : [],
        });
    };

    const handlePlanFirstTrip = async () => {
        const tripRaw = answers.trip_itinerary as TripItineraryData | undefined;
        if (tripRaw) {
            const tripErr = validateTripItineraryDates(hydrateLegacyTripItinerary(tripRaw));
            if (tripErr) {
                toast.error(tripErr);
                return;
            }
        }
        const derived = derivePlanFromQuestionnaireAnswers(answers);
        if (!derived) {
            toast.error(
                "We couldn't read your trip details. Add your destination below to generate a plan."
            );
            setShowCreatePlan(true);
            return;
        }
        setPlanForm({
            destination: derived.destination,
            country: derived.country,
            duration: String(derived.duration),
            purpose: derived.purpose,
            medicalConsiderations: derived.medicalConsiderations,
        });
        await submitTravelPlan({
            ...derived,
            selectedDoctorIds: wantsDoctorSelection ? selectedDoctorIds : [],
        });
    };

    // ─── Complete Screen ──────────────────────────────────────

    if (showComplete) {
        const dashboardPath = user && canAccessHR(user) ? "/hr" : "/dashboard";
        const credits = user?.credits ?? 0;

        // Generating state
        if (createPlan.isPending) {
            return (
                <div className="min-h-screen bg-background-primary flex items-center justify-center px-6">
                    <div className="w-full max-w-sm text-center">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 260, damping: 20 }}
                            className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-8"
                        >
                            <LucideLoader2 className="w-8 h-8 text-accent animate-spin" />
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15 }}
                            className="text-4xl font-serif text-heading mb-3"
                        >
                            Generating your plan...
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.25 }}
                            className="text-sm text-body max-w-sm mx-auto leading-relaxed"
                        >
                            Cross-referencing WHO, CDC, and local health data for{" "}
                            <strong className="text-heading">
                                {generatingPlanLabelRef.current.destination ||
                                    generatingPlanLabelRef.current.country}
                            </strong>
                            .
                        </motion.p>
                    </div>
                </div>
            );
        }

        return (
            <div className="min-h-screen bg-background-primary flex items-center justify-center px-6">
                <div className="w-full max-w-lg">
                    <AnimatePresence mode="wait">
                        {!showCreatePlan ? (
                            <motion.div
                                key="complete"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
                                className="max-w-sm mx-auto"
                            >
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
                                    Your health profile is complete. We will use the trip you
                                    entered at the start of the questionnaire to generate your
                                    first advisory.
                                </motion.p>

                                {!isFreePlan && reviewers.length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.35 }}
                                        className="mb-6 rounded-2xl border border-border-light/60 bg-background-primary/60 p-4 space-y-3"
                                    >
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setWantsDoctorSelection((v) => {
                                                    if (v) setSelectedDoctorIds([]);
                                                    return !v;
                                                });
                                            }}
                                            className="flex w-full items-center justify-between gap-4 text-left cursor-pointer"
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
                                                            className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-colors cursor-pointer ${checked ? "border-accent bg-accent/5" : "border-border-light bg-white hover:border-border"}`}
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
                                    </motion.div>
                                )}

                                <motion.button
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{
                                        delay: 0.4,
                                        type: "spring",
                                        stiffness: 300,
                                        damping: 24,
                                    }}
                                    type="button"
                                    onClick={() => void handlePlanFirstTrip()}
                                    disabled={credits === 0 || createPlan.isPending || (wantsDoctorSelection && selectedDoctorIds.length === 0)}
                                    className="w-full mb-3 p-7 rounded-3xl outline-dark/20 outline-2 relative overflow-hidden group cursor-pointer text-left disabled:opacity-40 disabled:cursor-not-allowed"
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
                                        Generate your travel health plan
                                    </p>
                                    <p className="text-xs mb-5 leading-relaxed">
                                        Uses your questionnaire trip, dates, and purpose — one
                                        credit, no extra forms.
                                    </p>
                                    <span className="inline-flex items-center gap-1.5 text-accent text-xs font-semibold">
                                        Generate plan{" "}
                                        <LucideArrowRight className="w-3.5 h-3.5" />
                                    </span>
                                </motion.button>

                                {credits === 0 && (
                                    <p className="text-center text-xs text-muted mb-3">
                                        You need at least one credit to generate a plan.{" "}
                                        <button
                                            type="button"
                                            onClick={() => navigate(dashboardPath)}
                                            className="text-accent font-medium hover:underline cursor-pointer"
                                        >
                                            Go to dashboard
                                        </button>{" "}
                                        to purchase credits.
                                    </p>
                                )}

                                <motion.button
                                    type="button"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.55 }}
                                    onClick={() => {
                                        const d = derivePlanFromQuestionnaireAnswers(answers);
                                        if (d) {
                                            setPlanForm({
                                                destination: d.destination,
                                                country: d.country,
                                                duration: String(d.duration),
                                                purpose: d.purpose,
                                                medicalConsiderations: d.medicalConsiderations,
                                            });
                                        }
                                        setShowCreatePlan(true);
                                    }}
                                    className="w-full py-2.5 text-xs text-muted font-medium hover:text-heading transition-colors cursor-pointer"
                                >
                                    Enter trip details manually instead
                                </motion.button>

                                <motion.button
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.6 }}
                                    onClick={() => navigate(dashboardPath)}
                                    className="w-full py-3 text-sm text-muted font-medium hover:text-heading transition-colors cursor-pointer"
                                >
                                    Take me to the dashboard
                                </motion.button>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="create-plan"
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ type: "spring", stiffness: 300, damping: 28 }}
                            >
                                <button
                                    type="button"
                                    onClick={() => setShowCreatePlan(false)}
                                    className="flex items-center gap-1.5 text-sm text-muted hover:text-heading mb-6 cursor-pointer transition-colors"
                                >
                                    <LucideArrowLeft className="w-4 h-4" /> Back
                                </button>

                                <div className="flex items-center gap-3 mb-2">
                                    <motion.div
                                        animate={{ x: [0, 4, 0], y: [0, -2, 0] }}
                                        transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
                                    >
                                        <LucidePlane className="w-6 h-6 text-accent" />
                                    </motion.div>
                                    <h1 className="text-3xl sm:text-4xl font-serif text-heading">
                                        Where are you headed?
                                    </h1>
                                </div>
                                <p className="text-sm text-muted mb-8 leading-relaxed">
                                    Tell us about your trip and we'll generate a personalised health advisory.
                                </p>

                                {credits === 0 && (
                                    <div className="bg-gold/10 border border-gold/20 rounded-2xl p-4 mb-6">
                                        <p className="text-sm text-heading font-medium">
                                            You have no credits remaining.{" "}
                                            <button
                                                type="button"
                                                onClick={() => navigate(dashboardPath)}
                                                className="text-accent cursor-pointer hover:underline"
                                            >
                                                Go to dashboard
                                            </button>{" "}
                                            to purchase more.
                                        </p>
                                    </div>
                                )}

                                <form onSubmit={handleCreatePlan} className="space-y-5">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                                                Destination
                                            </label>
                                            <input
                                                type="text"
                                                value={planForm.destination}
                                                onChange={(e) => updatePlanForm("destination", e.target.value)}
                                                placeholder="e.g. Bogota & Cartagena"
                                                className="w-full bg-white border-2 border-border-light/60 rounded-2xl px-5 py-3.5 text-sm text-heading placeholder:text-muted/40 outline-none focus:border-accent transition-colors duration-200"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                                                Country
                                            </label>
                                            <CountryPicker
                                                value={planForm.country}
                                                onChange={(name) => updatePlanForm("country", name)}
                                                inputClassName="w-full bg-white border-2 border-border-light/60 rounded-2xl px-5 py-3.5 pr-10 text-sm text-heading placeholder:text-muted/40 outline-none focus:border-accent transition-colors duration-200"
                                                placeholder="e.g. Colombia"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                                                Duration (days)
                                            </label>
                                            <input
                                                type="number"
                                                value={planForm.duration}
                                                onChange={(e) => updatePlanForm("duration", e.target.value)}
                                                placeholder="e.g. 10"
                                                className="w-full bg-white border-2 border-border-light/60 rounded-2xl px-5 py-3.5 text-sm text-heading placeholder:text-muted/40 outline-none focus:border-accent transition-colors duration-200"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                                                Purpose
                                            </label>
                                            <select
                                                value={planForm.purpose}
                                                onChange={(e) => updatePlanForm("purpose", e.target.value)}
                                                className="w-full bg-white border-2 border-border-light/60 rounded-2xl px-5 py-3.5 text-sm text-heading outline-none focus:border-accent transition-colors duration-200"
                                            >
                                                <option>Leisure</option>
                                                <option>Business</option>
                                                <option>Volunteer</option>
                                                <option>Study</option>
                                                <option>Other</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                                            Medical considerations <span className="text-muted font-normal normal-case">(optional)</span>
                                        </label>
                                        <textarea
                                            value={planForm.medicalConsiderations}
                                            onChange={(e) => updatePlanForm("medicalConsiderations", e.target.value)}
                                            placeholder="e.g. I take blood thinners, have asthma, or am pregnant"
                                            rows={3}
                                            className="w-full bg-white border-2 border-border-light/60 rounded-2xl px-5 py-3.5 text-sm text-heading placeholder:text-muted/40 outline-none focus:border-accent transition-colors duration-200 resize-none"
                                        />
                                    </div>

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
                                                className="flex w-full items-center justify-between gap-4 text-left cursor-pointer"
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
                                                                className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-colors cursor-pointer ${checked ? "border-accent bg-accent/5" : "border-border-light bg-white hover:border-border"}`}
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

                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-border-light/40">
                                        <p className="text-xs text-muted">
                                            This will use <strong className="text-heading">1 credit</strong>. You have {credits} remaining.
                                        </p>
                                        <button
                                            type="submit"
                                            disabled={credits === 0 || createPlan.isPending || (wantsDoctorSelection && selectedDoctorIds.length === 0)}
                                            className="py-3.5 px-8 rounded-2xl bg-dark text-background-primary font-semibold text-sm cursor-pointer hover:bg-darkest disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
                                        >
                                            Generate plan <LucideArrowRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </form>

                                <button
                                    type="button"
                                    onClick={() => navigate(dashboardPath)}
                                    className="w-full mt-4 py-3 text-sm text-muted font-medium hover:text-heading transition-colors cursor-pointer text-center"
                                >
                                    Skip — take me to the dashboard
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        );
    }

    if (!currentCategory) return null;

    // ─── Render ──────────────────────────────────────────────

    return (
        <div className="min-h-screen bg-background-primary flex flex-col lg:flex-row">
            <Toaster position="top-right" />
            {/* ── Mobile Top Bar / Desktop Minimal Header ─────────────────────────────────── */}
            <div className="sticky top-0 z-30 px-5 sm:px-8 py-4 flex items-center justify-between border-b border-border-light/60 bg-background-primary/80 backdrop-blur-md lg:fixed lg:w-full">
                <span className="text-heading tracking-tight text-lg font-serif font-medium select-none">
                    TMAG
                </span>
                <div className="flex items-center gap-5">
                    {/* Progress bar - mobile only */}
                    <div className="flex lg:hidden items-center gap-2.5">
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
                        onClick={() => void handleSaveAndExit()}
                        disabled={isSavingExit}
                        className="text-xs font-medium text-muted hover:text-heading transition-colors cursor-pointer disabled:opacity-50"
                    >
                        {isSavingExit ? "Saving…" : "Save & exit"}
                    </button>
                </div>
            </div>

            {/* ── Desktop Sidebar Progress ────────────────────────── */}
            <div className="hidden lg:flex lg:w-80 lg:shrink-0 lg:flex-col lg:border-r lg:border-border-light/60 lg:bg-background-primary lg:pt-20">
                <div className="flex-1 px-6 py-8 overflow-y-auto">
                    {/* Progress header */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-medium text-heading">
                                Progress
                            </span>
                            <span className="text-sm font-bold text-accent">
                                {progressPercent}%
                            </span>
                        </div>
                        <div className="h-2 rounded-full bg-border-light overflow-hidden">
                            <motion.div
                                className="h-full rounded-full bg-accent"
                                initial={{ width: 0 }}
                                animate={{ width: `${progressPercent}%` }}
                                transition={{ duration: 0.5, ease: "easeOut" }}
                            />
                        </div>
                    </div>

                    {/* Category list - vertical */}
                    <nav className="space-y-1">
                        {categories.map((cat, i) => (
                            <div
                                key={cat.category_key}
                                className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-colors ${
                                    i === categoryIndex ?
                                        "bg-accent/10 border border-accent/20"
                                    : i < categoryIndex ? "text-accent"
                                    : "text-muted"
                                }`}
                            >
                                <div
                                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold transition-colors ${
                                        i < categoryIndex ?
                                            "bg-accent text-white"
                                        : i === categoryIndex ?
                                            "bg-heading text-white"
                                        :   "bg-border-light text-muted"
                                    }`}
                                >
                                    {i < categoryIndex ?
                                        <LucideCheck className="w-3.5 h-3.5" />
                                    :   i + 1}
                                </div>
                                <div className="min-w-0">
                                    <p
                                        className={`text-sm font-medium truncate ${
                                            i === categoryIndex ? "text-heading"
                                            :   ""
                                        }`}
                                    >
                                        {cat.category_name}
                                    </p>
                                    {i === categoryIndex && (
                                        <p className="text-xs text-muted mt-0.5">
                                            {showIntro ?
                                                "Introduction"
                                            :   "In progress"}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </nav>
                </div>
            </div>

            {/* ── Mobile Accordion Progress Tracker ────────────────────────── */}
            <div className="lg:hidden px-4 sm:px-6 pt-4 pb-2">
                {/* Accordion header - always visible */}
                <button
                    type="button"
                    onClick={() => setMobileAccordionOpen(!mobileAccordionOpen)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-button-secondary rounded-xl border border-border-light/60 transition-all duration-200"
                >
                    <div className="flex items-center gap-3">
                        {/* Current section indicator */}
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-heading text-white text-xs font-bold">
                            {categoryIndex + 1}
                        </div>
                        <div className="text-left">
                            <p className="text-xs text-muted font-medium">
                                Section {categoryIndex + 1} of{" "}
                                {categories.length}
                            </p>
                            <p className="text-sm font-semibold text-heading truncate max-w-45">
                                {currentCategory?.category_name || "Loading..."}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* Progress percentage */}
                        <span className="text-sm font-bold text-accent tabular-nums">
                            {progressPercent}%
                        </span>
                        {/* Chevron */}
                        <div
                            className={`transition-transform duration-200 ${mobileAccordionOpen ? "rotate-180" : ""}`}
                        >
                            <LucideChevronDown className="w-5 h-5 text-muted" />
                        </div>
                    </div>
                </button>

                {/* Accordion content - expandable sections list */}
                <AnimatePresence>
                    {mobileAccordionOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            className="overflow-hidden"
                        >
                            <div className="pt-3 pb-2 space-y-1">
                                {categories.map((cat, i) => (
                                    <button
                                        key={cat.category_key}
                                        type="button"
                                        onClick={() => {
                                            if (i !== categoryIndex) {
                                                setDirection(
                                                    i > categoryIndex ? 1 : -1,
                                                );
                                                setCategoryIndex(i);
                                                setShowIntro(true);
                                            }
                                            setMobileAccordionOpen(false);
                                        }}
                                        disabled={i === categoryIndex}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                                            i === categoryIndex ?
                                                "bg-accent/10 border border-accent/20"
                                            : i < categoryIndex ?
                                                "hover:bg-accent/5 text-accent"
                                            :   "hover:bg-border-light/50 text-muted"
                                        } ${i !== categoryIndex ? "cursor-pointer" : "cursor-default"}`}
                                    >
                                        {/* Status indicator */}
                                        <div
                                            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                                                i < categoryIndex ?
                                                    "bg-accent text-white"
                                                : i === categoryIndex ?
                                                    "bg-heading text-white"
                                                :   "bg-border-light text-muted"
                                            }`}
                                        >
                                            {i < categoryIndex ?
                                                <LucideCheck className="w-3.5 h-3.5" />
                                            :   i + 1}
                                        </div>
                                        {/* Section name */}
                                        <span
                                            className={`text-sm font-medium truncate ${i === categoryIndex ? "text-heading" : ""}`}
                                        >
                                            {cat.category_name}
                                        </span>
                                        {/* Completed indicator */}
                                        {i < categoryIndex && (
                                            <LucideCheckCircle className="w-4 h-4 ml-auto text-accent shrink-0" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* ── Main Content ─────────────────────────────── */}
            <div className="flex-1 flex items-start sm:items-center justify-center px-3 sm:px-8 pt-6 pb-32 lg:pt-24">
                <div className="w-full max-w-5xl flex justify-center">
                    <div className="w-full max-w-3xl">
                        <AnimatePresence mode="wait" custom={direction}>
                            {showIntro ?
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
                                        {iconMap[
                                            currentCategory.category_icon
                                        ] || (
                                            <LucideSparkles className="w-12 h-12" />
                                        )}
                                    </motion.div>

                                    {/* Label */}
                                    <motion.p
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.2 }}
                                        className="text-sm font-bold tracking-[0.14em] text-accent uppercase mb-4"
                                    >
                                        Section {categoryIndex + 1} of{" "}
                                        {categories.length}
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

                                    {categoryIndex === 0 && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.36 }}
                                            className="mb-8 rounded-2xl border-2 border-border-light/60 bg-white/70 p-4 text-left"
                                        >
                                            <p className="text-sm text-heading font-semibold mb-2">
                                                Before proceeding, please read
                                                and agree:
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
                                                    Your plan will be generated
                                                    using AI and reviewed and
                                                    validated by a licensed
                                                    medical doctor.
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
                                                    You should consult your own
                                                    doctor or a qualified
                                                    healthcare professional
                                                    before making decisions
                                                    regarding your health,
                                                    vaccinations, medications,
                                                    or travel, especially if you
                                                    are pregnant, have chronic
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
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setMedicalDisclaimerConsentGiven(
                                                            (v) => {
                                                                const newVal =
                                                                    !v;
                                                                if (newVal)
                                                                    acceptConsent.mutate();
                                                                return newVal;
                                                            },
                                                        )
                                                    }
                                                    className={`mt-0.5 w-5 h-5 rounded-md border-2 shrink-0 flex items-center justify-center transition-all duration-200 cursor-pointer ${medicalDisclaimerConsentGiven ? "border-accent bg-accent" : "border-border"}`}
                                                >
                                                    {medicalDisclaimerConsentGiven && (
                                                        <LucideCheck className="w-3 h-3 text-white" />
                                                    )}
                                                </button>
                                                <span
                                                    className="text-sm text-body font-medium leading-relaxed"
                                                    onClick={() =>
                                                        setMedicalDisclaimerConsentGiven(
                                                            (v) => {
                                                                const newVal =
                                                                    !v;
                                                                if (newVal)
                                                                    acceptConsent.mutate();
                                                                return newVal;
                                                            },
                                                        )
                                                    }
                                                >
                                                    I have read, understood, and
                                                    agree to the Consent,
                                                    Medical Disclaimer, and
                                                    Privacy Policy.
                                                </span>
                                            </label>
                                        </motion.div>
                                    )}

                                    {/* Actions */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.4 }}
                                        className="flex items-center justify-center gap-3"
                                    >
                                        <button
                                            onClick={startCategory}
                                            disabled={
                                                categoryIndex === 0 &&
                                                !medicalDisclaimerConsentGiven
                                            }
                                            className="inline-flex items-center gap-2 px-10 py-4 rounded-2xl bg-dark text-white font-semibold text-sm cursor-pointer hover:bg-darkest disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
                                        >
                                            Begin{" "}
                                            <LucideArrowRight className="w-4 h-4" />
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
                            :   <motion.div
                                    key={`section-${currentCategory.category_key}`}
                                    custom={direction}
                                    variants={questionVariants}
                                    initial="enter"
                                    animate="center"
                                    exit="exit"
                                    className="rounded-3xl border border-border-light/70 bg-white/80 p-5 md:p-9 space-y-8"
                                >
                                    <div>
                                        <p className="text-[11px] uppercase tracking-[0.12em] font-semibold text-accent mb-1">
                                            Section {categoryIndex + 1} of{" "}
                                            {categories.length}
                                        </p>
                                        <h3 className="text-2xl md:text-3xl font-serif text-heading leading-snug">
                                            {currentCategory.category_name}
                                        </h3>
                                    </div>

                                    {visibleQuestions.map((question) => {
                                        const prefilled = PREFILLED_KEYS.has(
                                            question.key,
                                        );
                                        return (
                                            <div
                                                key={question.key}
                                                className="space-y-3"
                                            >
                                                <div>
                                                    <p className="text-base md:text-lg font-semibold text-heading leading-snug">
                                                        {question.text}
                                                        {question.required && (
                                                            <span className="text-red-500 ml-1">
                                                                *
                                                            </span>
                                                        )}
                                                    </p>
                                                    {question.description && (
                                                        <p className="text-sm text-muted mt-1 leading-relaxed">
                                                            {
                                                                question.description
                                                            }
                                                        </p>
                                                    )}
                                                    {prefilled && (
                                                        <p className="text-xs text-accent mt-1">
                                                            Pre-filled from your
                                                            profile
                                                        </p>
                                                    )}
                                                </div>
                                                <QuestionInput
                                                    question={question}
                                                    value={
                                                        answers[question.key]
                                                    }
                                                    prefilled={prefilled}
                                                    onChange={(val) =>
                                                        setAnswer(
                                                            question.key,
                                                            val,
                                                        )
                                                    }
                                                    onToggleCheckbox={(val) =>
                                                        toggleCheckbox(
                                                            question.key,
                                                            val,
                                                        )
                                                    }
                                                    onSetVaccineStatus={
                                                        setVaccineStatus
                                                    }
                                                    vaccineStatuses={
                                                        (answers.vaccine_status as Record<
                                                            string,
                                                            Record<
                                                                string,
                                                                string
                                                            >
                                                        >) || {}
                                                    }
                                                />
                                            </div>
                                        );
                                    })}
                                </motion.div>
                            }
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* ── Bottom Nav ───────────────────────────────── */}
            {!showIntro && (
                <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-border-light/50 bg-background-primary/90 backdrop-blur-md px-5 sm:px-8 py-4">
                    <div className="max-w-lg mx-auto flex items-center justify-between">
                        <button
                            onClick={goPrev}
                            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-muted hover:text-heading cursor-pointer transition-colors duration-150"
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
                                onClick={() => void goNext()}
                                disabled={submitting}
                                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-dark text-white text-sm font-semibold cursor-pointer hover:bg-darkest disabled:opacity-50 transition-all duration-200"
                            >
                                {submitting ?
                                    "Saving…"
                                : isLastSection ?
                                    "Complete"
                                :   <>
                                        Next{" "}
                                        <LucideArrowRight className="w-4 h-4" />
                                    </>
                                }
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
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
    prefilled?: boolean;
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
    prefilled = false,
    onChange,
    onToggleCheckbox,
    onSetVaccineStatus,
    vaccineStatuses,
}: QuestionInputProps) => {
    const todayLocal = todayIsoDateLocal();
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
                            className={`w-full text-left px-5 py-4 rounded-2xl border-2 transition-all duration-200 cursor-pointer ${value === opt.value
                                ? "border-accent bg-white shadow-sm"
                                : "border-border-light/60 hover:border-border bg-white/60 hover:bg-white"
                                }`}
                        >
                            <div className="flex items-center gap-3.5">
                                <div
                                    className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-all duration-200 ${value === opt.value
                                        ? "border-accent bg-accent"
                                        : "border-border"
                                        }`}
                                >
                                    {value === opt.value && (
                                        <div className="w-2 h-2 rounded-full bg-white" />
                                    )}
                                </div>
                                <span
                                    className={`text-sm font-semibold transition-colors ${value === opt.value
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
                    readOnly={prefilled}
                    className={`w-full border-2 border-border-light/60 rounded-2xl px-5 py-4 text-base text-heading placeholder:text-muted/40 outline-none focus:border-accent transition-all duration-200 font-medium ${
                        prefilled ? "bg-background-primary/50 cursor-default" : "bg-white"
                    }`}
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
                    readOnly={prefilled}
                    className={`w-full border-2 border-border-light/60 rounded-2xl px-5 py-4 text-base text-heading placeholder:text-muted/40 outline-none focus:border-accent transition-all duration-200 resize-none font-medium ${
                        prefilled ? "bg-background-primary/50 cursor-default" : "bg-white"
                    }`}
                />
            );

        case "date":
            return (
                <motion.input
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    type="date"
                    value={(value as string) || ""}
                    max={question.key === "date_of_birth" ? todayLocal : undefined}
                    onChange={(e) => onChange(e.target.value)}
                    readOnly={prefilled}
                    className={`w-full border-2 border-border-light/60 rounded-2xl px-5 py-4 text-base text-heading outline-none focus:border-accent transition-all duration-200 font-medium ${
                        prefilled ? "bg-background-primary/50 cursor-default" : "bg-white"
                    }`}
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
                                                className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all duration-200 ${status === s
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

        case "multi_country":
            return (
                <MultiCountryInput
                    value={Array.isArray(value) ? (value as string[]) : []}
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
            return null;
    }
};

export default TravelHealthQuestionnaire;
