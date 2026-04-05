import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { usePlanStore } from "../../stores/planStore";
import { useCreateTravelPlan, useEmployees } from "../../api/hooks";
import DashboardHeader from "../../components/dashboard/DashboardHeader";
import CountryPicker from "../../components/CountryPicker";
import {
    LucideArrowRight,
    LucideArrowLeft,
    LucidePlane,
    LucideBriefcase,
    LucideUsers,
    LucideMapPin,
    LucideBookOpen,
    LucideMoreHorizontal,
    LucideRoute,
    LucidePlus,
    LucideX,
    LucideCheck,
    LucideArrowLeftRight,
    LucideUserCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import { DASHBOARD_GLASS_SURFACE } from "../../components/dashboard/dashboardChrome";
import {
    formatMediumDateFromIso,
    inclusiveDaysReturnTrip,
    isReturnStrictlyAfterDeparture,
    nextDayIso,
} from "../../lib/tripDates";

type TripType = "one-way" | "return" | "multi";

interface Stop {
    id: string;
    city: string;
    country: string;
}

interface TripDetailsPayload {
    tripType: TripType;
    stops: Array<{ city: string; country: string; order: number }>;
    departureDate?: string;
    returnDate?: string;
}

const STEPS = ["Employee", "Destination", "Trip Details", "Review"];

const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 50 : -50, opacity: 0 }),
    center: {
        x: 0,
        opacity: 1,
        transition: { type: "spring" as const, stiffness: 320, damping: 32 },
    },
    exit: (dir: number) => ({
        x: dir > 0 ? -30 : 30,
        opacity: 0,
        transition: { duration: 0.18, ease: "easeIn" as const },
    }),
};

const TRIP_TYPES = [
    { value: "one-way" as TripType, label: "One-way", sublabel: "Single destination", icon: LucidePlane },
    { value: "return" as TripType, label: "Round trip", sublabel: "Return to origin", icon: LucideArrowLeftRight },
    { value: "multi" as TripType, label: "Multi-stop", sublabel: "Multiple destinations", icon: LucideRoute },
];

const PURPOSE_OPTIONS = [
    { value: "Business", label: "Business", icon: LucideBriefcase },
    { value: "Conference", label: "Conference", icon: LucideUsers },
    { value: "Client visit", label: "Client visit", icon: LucideMapPin },
    { value: "Training", label: "Training", icon: LucideBookOpen },
    { value: "Other", label: "Other", icon: LucideMoreHorizontal },
];

const QUICK_DURATIONS = [3, 7, 14, 21, 30];

const INPUT_CLS = "w-full bg-background-primary border border-border-light rounded-xl px-4 py-3 text-sm text-heading placeholder:text-muted/40 outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all";
const INNER_INPUT_CLS = "w-full bg-white border border-border-light rounded-xl px-4 py-3 text-sm text-heading placeholder:text-muted/40 outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all";
const INNER_COUNTRY_CLS = "w-full bg-white border border-border-light rounded-xl px-4 py-3 pr-9 text-sm text-heading placeholder:text-muted/40 outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all";
const STEP_LABEL_CLS = "text-[11px] font-semibold uppercase tracking-[0.14em]";
const PRIMARY_BTN_CLS = "flex items-center gap-2 py-2.5 px-6 rounded-xl bg-dark text-background-primary font-semibold text-sm cursor-pointer hover:bg-darkest disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200";

const HRCreatePlan = () => {
    const navigate = useNavigate();
    const { selectedCompanyId, selectedCompany } = usePlanStore();
    const company = selectedCompany();
    const companyIdNum = selectedCompanyId ? parseInt(selectedCompanyId) : undefined;

    const { data: employeesData } = useEmployees({ companyId: companyIdNum });
    const employees = (employeesData?.data || []).filter((e) => e.status === "active");
    const credits = company ? company.totalCredits - company.usedCredits : 0;

    const createPlan = useCreateTravelPlan();

    const [step, setStep] = useState(0);
    const [direction, setDirection] = useState(1);

    const [employeeId, setEmployeeId] = useState("");
    const [tripType, setTripType] = useState<TripType>("one-way");
    const [stops, setStops] = useState<Stop[]>([
        { id: "1", city: "", country: "" },
        { id: "2", city: "", country: "" },
    ]);
    const [duration, setDuration] = useState(7);
    const [departureDate, setDepartureDate] = useState("");
    const [returnDate, setReturnDate] = useState("");
    const [purpose, setPurpose] = useState("Business");
    const [medicalNotes, setMedicalNotes] = useState("");

    const inclusiveReturnDays =
        tripType === "return" ? inclusiveDaysReturnTrip(departureDate, returnDate) : null;
    const effectiveDuration = inclusiveReturnDays ?? duration;

    const handleTripTypeChange = (value: TripType) => {
        if (tripType === "return" && value !== "return") {
            setDepartureDate("");
            setReturnDate("");
        }
        setTripType(value);
    };

    const goNext = () => { setDirection(1); setStep((s) => s + 1); };
    const goPrev = () => { setDirection(-1); setStep((s) => s - 1); };

    const updateStop = (id: string, field: "city" | "country", value: string) =>
        setStops((s) => s.map((st) => (st.id === id ? { ...st, [field]: value } : st)));
    const addStop = () =>
        setStops((s) => [...s, { id: Date.now().toString(), city: "", country: "" }]);
    const removeStop = (id: string) =>
        setStops((s) => s.filter((st) => st.id !== id));

    const canProceed = () => {
        if (step === 0) return !!employeeId;
        if (step === 1) {
            if (tripType === "multi") {
                return stops.filter((s) => s.country).length >= 2;
            }
            if (!(stops[0]?.city && stops[0]?.country)) {
                return false;
            }
            if (tripType === "return") {
                if (!departureDate.trim() || !returnDate.trim()) {
                    return false;
                }
                return isReturnStrictlyAfterDeparture(departureDate, returnDate);
            }
            return true;
        }
        if (step === 2 && tripType === "return") {
            return (
                !!departureDate.trim() &&
                !!returnDate.trim() &&
                isReturnStrictlyAfterDeparture(departureDate, returnDate)
            );
        }
        return true;
    };

    const getDestinationString = () => {
        if (tripType === "multi") {
            return stops
                .filter((s) => s.city || s.country)
                .map((s) => [s.city, s.country].filter(Boolean).join(", "))
                .join(" → ");
        }
        return [stops[0]?.city, stops[0]?.country].filter(Boolean).join(", ");
    };

    const buildTripDetailsPayload = (): TripDetailsPayload => {
        const cleanedStops = (tripType === "multi" ? stops : [stops[0]])
            .map((s, index) => ({
                city: s.city.trim(),
                country: s.country.trim(),
                order: index + 1,
            }))
            .filter((s) => s.city || s.country);

        const base: TripDetailsPayload = {
            tripType,
            stops: cleanedStops,
        };
        if (tripType === "return") {
            return {
                ...base,
                departureDate: departureDate.trim(),
                returnDate: returnDate.trim(),
            };
        }
        return base;
    };

    const selectedEmployee = employees.find((e) => String(e.id) === employeeId);

    const handleSubmit = async () => {
        if (credits <= 0) { toast.error("Company has no remaining credits."); return; }
        let resolvedDuration = duration;
        if (tripType === "return") {
            if (inclusiveReturnDays == null) {
                toast.error("Return date must be after departure date.");
                return;
            }
            resolvedDuration = inclusiveReturnDays;
        }
        try {
            await createPlan.mutateAsync({
                destination: getDestinationString(),
                country: stops[0]?.country || "",
                duration: resolvedDuration,
                purpose,
                tripType,
                tripDetailsJson: JSON.stringify(buildTripDetailsPayload()),
                medicalConsiderations: medicalNotes,
                companyId: companyIdNum,
                employeeId: parseInt(employeeId),
                status: "completed",
                riskScore: 1,
                vaccinations: "[]",
                healthAlerts: "[]",
                safetyAdvisories: "[]",
                medications: "[]",
                waterFood: "[]",
                emergencyContacts: "[]",
            });
            navigate("/hr/create-plan");
            toast.success("Plan generated for employee!");
        } catch {
            toast.error("Failed to generate plan.");
        }
    };

    return (
        <div className="relative">
            <DashboardHeader title="Create plan for employee" />
            <div className="pointer-events-none absolute -top-10 right-0 z-0 h-52 w-52 rounded-full bg-accent/10 blur-3xl" />
            <div className="pointer-events-none absolute left-0 top-52 z-0 h-56 w-56 rounded-full bg-gold/10 blur-3xl" />

            <div className="relative z-10 max-w-3xl">
                {/* Step progress */}
                <div className="mb-4 flex flex-wrap items-center gap-2">
                    {STEPS.map((label, i) => (
                        <div
                            key={i}
                            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 transition-all duration-300 ${i === step
                                ? "border-accent/30 bg-accent/10 text-accent"
                                : i < step
                                    ? "border-accent/20 bg-accent/5 text-accent/80"
                                    : "border-border-light bg-white/70 text-muted"
                                }`}
                        >
                            <span
                                className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${i <= step ? "bg-accent text-white" : "bg-border-light text-muted"
                                    }`}
                            >
                                {i + 1}
                            </span>
                            <span className={`${STEP_LABEL_CLS} normal-case tracking-normal text-[12px]`}>{label}</span>
                        </div>
                    ))}
                </div>
                <p className="text-xs text-muted font-medium mb-6">
                    {STEPS[step]} · Step {step + 1} of {STEPS.length}
                </p>

                {/* White card */}
                <div className={DASHBOARD_GLASS_SURFACE}>
                    <AnimatePresence mode="wait" custom={direction}>
                        <motion.div
                            key={step}
                            custom={direction}
                            variants={slideVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            className="p-7 md:p-10"
                        >

                            {/* ── Step 0: Employee ── */}
                            {step === 0 && (
                                <div className="space-y-6">
                                    <div>
                                        <h2 className="text-3xl font-serif text-heading mb-1.5 tracking-tight">Who is this plan for?</h2>
                                        <p className="text-sm text-muted leading-relaxed">Select an active employee to generate a travel plan.</p>
                                    </div>

                                    <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                                        {employees.length === 0 ? (
                                            <p className="text-sm text-muted py-6 text-center">No active employees found.</p>
                                        ) : (
                                            employees.map((emp) => (
                                                <button
                                                    key={emp.id}
                                                    type="button"
                                                    onClick={() => setEmployeeId(String(emp.id))}
                                                    className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all duration-200 cursor-pointer ${employeeId === String(emp.id)
                                                        ? "border-accent bg-accent/5"
                                                        : "border-border-light bg-background-primary hover:border-border-light/80"
                                                        }`}
                                                >
                                                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${employeeId === String(emp.id) ? "bg-accent/10" : "bg-border-light/30"
                                                        }`}>
                                                        <LucideUserCircle className={`w-5 h-5 ${employeeId === String(emp.id) ? "text-accent" : "text-muted"}`} />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className={`text-sm font-semibold truncate ${employeeId === String(emp.id) ? "text-heading" : "text-body"}`}>
                                                            {emp.name} ({emp.email})
                                                        </p>
                                                        <p className="text-xs text-muted truncate">{emp.department}</p>
                                                    </div>
                                                    {employeeId === String(emp.id) && (
                                                        <div className="w-5 h-5 rounded-full bg-accent flex items-center justify-center shrink-0">
                                                            <LucideCheck className="w-3 h-3 text-white" />
                                                        </div>
                                                    )}
                                                </button>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* ── Step 1: Destination ── */}
                            {step === 1 && (
                                <div className="space-y-8">
                                    <div>
                                        <h2 className="text-3xl font-serif text-heading mb-1.5 tracking-tight">Where are they headed?</h2>
                                        <p className="text-sm text-muted leading-relaxed">
                                            Choose trip type and destination
                                            {tripType === "return" ? " — round trips include travel dates below." : "."}
                                        </p>
                                    </div>

                                    <div>
                                        <p className={`${STEP_LABEL_CLS} text-muted mb-3`}>Trip type</p>
                                        <div className="grid grid-cols-3 gap-3">
                                            {TRIP_TYPES.map(({ value, label, sublabel, icon: Icon }) => (
                                                <button
                                                    key={value}
                                                    type="button"
                                                    onClick={() => handleTripTypeChange(value)}
                                                    className={`relative p-4 rounded-2xl border-2 text-left transition-all duration-300 cursor-pointer ${tripType === value
                                                        ? "border-accent/40 bg-linear-to-br from-accent/12 to-accent/3 shadow-[0_4px_16px_-8px_rgba(42,122,106,0.22)]"
                                                        : "border-border-light bg-background-primary/70 hover:border-border hover:bg-white"
                                                        }`}
                                                >
                                                    <Icon className={`w-5 h-5 mb-3 ${tripType === value ? "text-accent" : "text-muted"}`} />
                                                    <p className={`text-sm font-semibold leading-tight mb-0.5 ${tripType === value ? "text-heading" : "text-body"}`}>
                                                        {label}
                                                    </p>
                                                    <p className="text-xs text-muted leading-snug">{sublabel}</p>
                                                    {tripType === value && (
                                                        <div className="absolute top-3 right-3 w-4 h-4 rounded-full bg-accent flex items-center justify-center">
                                                            <LucideCheck className="w-2.5 h-2.5 text-white" />
                                                        </div>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {tripType === "multi" ? (
                                        <div>
                                            <p className={`${STEP_LABEL_CLS} text-muted mb-3`}>Stops</p>
                                            <div className="space-y-3">
                                                {stops.map((stop, idx) => (
                                                    <div key={stop.id} className="bg-background-primary/70 rounded-2xl p-4 border border-border-light/60">
                                                        <div className="flex items-center justify-between mb-3">
                                                            <span className="text-xs font-semibold text-muted uppercase tracking-wider">Stop {idx + 1}</span>
                                                            {idx >= 2 && (
                                                                <button type="button" onClick={() => removeStop(stop.id)} className="text-muted hover:text-heading transition-colors cursor-pointer">
                                                                    <LucideX className="w-4 h-4" />
                                                                </button>
                                                            )}
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-3">
                                                            <input
                                                                type="text"
                                                                value={stop.city}
                                                                onChange={(e) => updateStop(stop.id, "city", e.target.value)}
                                                                placeholder="City / Region"
                                                                className={INNER_INPUT_CLS}
                                                            />
                                                            <CountryPicker
                                                                value={stop.country}
                                                                onChange={(name) => updateStop(stop.id, "country", name)}
                                                                placeholder="Country"
                                                                inputClassName={INNER_COUNTRY_CLS}
                                                            />
                                                        </div>
                                                    </div>
                                                ))}
                                                {stops.length < 5 && (
                                                    <button type="button" onClick={addStop} className="inline-flex items-center gap-2 rounded-xl border border-dashed border-accent/30 bg-accent/5 px-3 py-2 text-sm text-accent font-medium hover:bg-accent/10 transition-colors cursor-pointer mt-1">
                                                        <LucidePlus className="w-4 h-4" /> Add another stop
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <div>
                                                <p className={`${STEP_LABEL_CLS} text-muted mb-3`}>Destination</p>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-xs text-muted mb-1.5">City / Region</label>
                                                    <input
                                                        type="text"
                                                        value={stops[0].city}
                                                        onChange={(e) => updateStop("1", "city", e.target.value)}
                                                        placeholder="e.g. Lagos"
                                                        className={INPUT_CLS}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs text-muted mb-1.5">Country</label>
                                                    <CountryPicker
                                                        value={stops[0].country}
                                                        onChange={(name) => updateStop("1", "country", name)}
                                                        placeholder="e.g. Nigeria"
                                                        required
                                                    />
                                                </div>
                                            </div>

                                                {tripType === "return" && (
                                                    <div className="mt-8 border-t border-border-light/50 pt-8 space-y-4">
                                                        <p className={`${STEP_LABEL_CLS} text-muted`}>Travel dates</p>
                                                        <p className="text-xs text-muted -mt-2">
                                                            Return must be after departure (not the same day).
                                                        </p>
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                            <div>
                                                                <label className="block text-xs text-muted mb-1.5">Departure date</label>
                                                                <input
                                                                    type="date"
                                                                    value={departureDate}
                                                                    onChange={(e) => {
                                                                        const v = e.target.value;
                                                                        setDepartureDate(v);
                                                                        if (returnDate && !isReturnStrictlyAfterDeparture(v, returnDate)) {
                                                                            setReturnDate("");
                                                                        }
                                                                    }}
                                                                    className={INPUT_CLS}
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-xs text-muted mb-1.5">Return date</label>
                                                                <input
                                                                    type="date"
                                                                    value={returnDate}
                                                                    min={departureDate ? nextDayIso(departureDate) : undefined}
                                                                    onChange={(e) => setReturnDate(e.target.value)}
                                                                    disabled={!departureDate}
                                                                    className={INPUT_CLS}
                                                                />
                                                            </div>
                                                        </div>
                                                        {departureDate && returnDate && !isReturnStrictlyAfterDeparture(departureDate, returnDate) && (
                                                            <p className="text-xs text-red-600">
                                                                Return date must be after departure date.
                                                            </p>
                                                        )}
                                                        {inclusiveReturnDays != null && (
                                                            <p className="text-sm text-muted">
                                                                Trip length:{" "}
                                                                <strong className="text-heading tabular-nums">{inclusiveReturnDays}</strong>{" "}
                                                                calendar days (inclusive)
                                                            </p>
                                                        )}
                                                    </div>
                                                )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* ── Step 2: Trip Details ── */}
                            {step === 2 && (
                                <div className="space-y-8">
                                    <div>
                                        <h2 className="text-3xl font-serif text-heading mb-1.5 tracking-tight">Trip details</h2>
                                        <p className="text-sm text-muted leading-relaxed">
                                            {tripType === "return"
                                                ? "Choose the purpose (dates were set in the previous step)."
                                                : "How long is the trip and what's the purpose?"}
                                        </p>
                                    </div>

                                    {tripType === "return" ? (
                                        inclusiveReturnDays != null ? (
                                            <div className="rounded-2xl border border-border-light/60 bg-background-primary/50 px-5 py-4">
                                                <p className={`${STEP_LABEL_CLS} text-muted mb-1`}>Trip length</p>
                                                <p className="text-lg font-serif text-heading tabular-nums">
                                                    {inclusiveReturnDays} {inclusiveReturnDays === 1 ? "day" : "days"}
                                                </p>
                                                <p className="text-xs text-muted mt-1">
                                                    {formatMediumDateFromIso(departureDate)} → {formatMediumDateFromIso(returnDate)}
                                                </p>
                                            </div>
                                        ) : null
                                    ) : (
                                            <div>
                                                <p className={`${STEP_LABEL_CLS} text-muted mb-4`}>Duration</p>
                                                <div className="flex items-center gap-6 mb-4">
                                                    <button
                                                        type="button"
                                                        onClick={() => setDuration((d) => Math.max(1, d - 1))}
                                                        className="w-11 h-11 rounded-xl border border-border-light bg-background-primary flex items-center justify-center text-heading hover:bg-border-light/30 transition-colors cursor-pointer text-xl font-light select-none"
                                                    >
                                                        −
                                                    </button>
                                                    <div className="flex-1 text-center">
                                                        <span className="text-5xl font-serif text-heading tabular-nums">{duration}</span>
                                                        <span className="text-base text-muted ml-2">{duration === 1 ? "day" : "days"}</span>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => setDuration((d) => Math.min(365, d + 1))}
                                                        className="w-11 h-11 rounded-xl border border-border-light bg-background-primary flex items-center justify-center text-heading hover:bg-border-light/30 transition-colors cursor-pointer text-xl font-light select-none"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                                <div className="flex gap-2 flex-wrap">
                                                    {QUICK_DURATIONS.map((d) => (
                                                        <button
                                                            key={d}
                                                            type="button"
                                                            onClick={() => setDuration(d)}
                                                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${duration === d
                                                                ? "bg-accent text-white shadow-sm"
                                                                : "bg-background-primary/80 border border-border-light text-muted hover:text-heading"
                                                                }`}
                                                        >
                                                            {d}d
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                    )}

                                    <div>
                                        <p className={`${STEP_LABEL_CLS} text-muted mb-3`}>Purpose</p>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                                            {PURPOSE_OPTIONS.map(({ value, label, icon: Icon }) => (
                                                <button
                                                    key={value}
                                                    type="button"
                                                    onClick={() => setPurpose(value)}
                                                    className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl border-2 transition-all duration-200 cursor-pointer ${purpose === value
                                                        ? "border-accent/40 bg-accent/8"
                                                        : "border-border-light bg-background-primary/70 hover:border-border"
                                                        }`}
                                                >
                                                    <Icon className={`w-4 h-4 shrink-0 ${purpose === value ? "text-accent" : "text-muted"}`} />
                                                    <span className={`text-sm font-medium ${purpose === value ? "text-heading" : "text-body"}`}>{label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ── Step 3: Review & Generate ── */}
                            {step === 3 && (
                                <div className="space-y-8">
                                    <div>
                                        <h2 className="text-3xl font-serif text-heading mb-1.5 tracking-tight">Ready to generate?</h2>
                                        <p className="text-sm text-muted leading-relaxed">Review the plan details and add any health notes.</p>
                                    </div>

                                    <div className="rounded-2xl border border-border-light/60 overflow-hidden">
                                        <div className="bg-background-primary/70 px-5 py-4 flex items-center gap-3">
                                            <LucideUserCircle className="w-4 h-4 text-accent shrink-0" />
                                            <div>
                                                <p className="text-xs text-muted uppercase tracking-wider font-semibold mb-0.5">Employee</p>
                                                <p className="text-sm text-heading font-semibold">
                                                    {selectedEmployee?.name}
                                                    {selectedEmployee?.department && (
                                                        <span className="font-normal text-muted ml-2">· {selectedEmployee.department}</span>
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="border-t border-border-light/60 bg-background-primary/40 px-5 py-4 flex items-start gap-3">
                                            <LucideMapPin className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                                            <div>
                                                <p className="text-xs text-muted uppercase tracking-wider font-semibold mb-0.5">Destination</p>
                                                <p className="text-sm text-heading font-semibold">{getDestinationString()}</p>
                                            </div>
                                        </div>
                                        {tripType === "return" && departureDate && returnDate && (
                                            <div className="border-t border-border-light/60 bg-white/50 px-5 py-4">
                                                <p className="text-xs text-muted uppercase tracking-wider font-semibold mb-1">Travel dates</p>
                                                <p className="text-sm text-heading font-medium">
                                                    Depart {formatMediumDateFromIso(departureDate)} → Return{" "}
                                                    {formatMediumDateFromIso(returnDate)}
                                                </p>
                                            </div>
                                        )}
                                        <div className="border-t border-border-light/60 grid grid-cols-3 divide-x divide-border-light/60 bg-white/60">
                                            <div className="px-5 py-4">
                                                <p className="text-xs text-muted uppercase tracking-wider font-semibold mb-1">Trip type</p>
                                                <p className="text-sm text-heading">
                                                    {tripType === "one-way" ? "One-way" : tripType === "return" ? "Round trip" : "Multi-stop"}
                                                </p>
                                            </div>
                                            <div className="px-5 py-4">
                                                <p className="text-xs text-muted uppercase tracking-wider font-semibold mb-1">Duration</p>
                                                <p className="text-sm text-heading">{effectiveDuration} {effectiveDuration === 1 ? "day" : "days"}</p>
                                            </div>
                                            <div className="px-5 py-4">
                                                <p className="text-xs text-muted uppercase tracking-wider font-semibold mb-1">Purpose</p>
                                                <p className="text-sm text-heading">{purpose}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className={`block ${STEP_LABEL_CLS} text-muted mb-1.5`}>
                                            Medical notes <span className="font-normal normal-case tracking-normal text-muted/70">(optional)</span>
                                        </label>
                                        <textarea
                                            value={medicalNotes}
                                            onChange={(e) => setMedicalNotes(e.target.value)}
                                            placeholder="Any known conditions or requirements for this employee"
                                            rows={4}
                                            className={`${INPUT_CLS} resize-none`}
                                        />
                                    </div>
                                </div>
                            )}

                        </motion.div>
                    </AnimatePresence>

                    {/* Footer inside card */}
                    <div className={`flex px-7 md:px-10 py-5 border-t border-border-light/50 bg-background-primary/50 items-center ${step === 0 ? "justify-end" : "justify-between"}`}>
                        {step > 0 && (
                            <button
                                type="button"
                                onClick={goPrev}
                                className="flex items-center gap-1.5 text-sm text-muted hover:text-heading transition-colors cursor-pointer"
                            >
                                <LucideArrowLeft className="w-4 h-4" /> Back
                            </button>
                        )}

                        {step < STEPS.length - 1 ? (
                            <button
                                type="button"
                                onClick={goNext}
                                disabled={!canProceed()}
                                className={PRIMARY_BTN_CLS}
                            >
                                Continue <LucideArrowRight className="w-4 h-4" />
                            </button>
                        ) : (
                            <div className="flex items-center gap-4">
                                <p className="text-xs text-muted hidden sm:block">
                                    Uses <strong className="text-heading">1 credit</strong>. {credits} remaining.
                                </p>
                                <button
                                    type="button"
                                    onClick={handleSubmit}
                                    disabled={credits === 0 || createPlan.isPending}
                                        className={PRIMARY_BTN_CLS}
                                >
                                    Generate plan <LucidePlane className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HRCreatePlan;
