import { useState } from "react";
import { motion } from "framer-motion";
import {
    LucideArrowLeft,
    LucideCheck,
    LucideGlobe,
    LucideMapPin,
    LucidePlaneTakeoff,
    LucidePlaneLanding,
    LucideCalendarDays,
    LucidePlus,
    LucideX,
    LucideClock,
    LucideBuilding2,
    LucideBriefcase,
    LucideNavigation,
} from "lucide-react";
import CountryPicker from "../CountryPicker";

// ── Types ──────────────────────────────────────────────────────

export interface MultiStopLeg {
    country: string;
    city: string;
    arrivalDate: string;
    nights: string;
    accommodationType: string;
}

export interface TripItineraryData {
    tripType: "one" | "return" | "multi" | "transit";

    // One-Way
    oneFrom?: string;
    oneTo?: string;
    oneDepartureDate?: string;
    oneLengthOfStay?: string;
    onePurpose?: string;
    oneFlightNumber?: string;
    oneAccommodationType?: string;

    // Return
    returnFrom?: string;
    returnTo?: string;
    returnDepartureDate?: string;
    returnReturnDate?: string;
    outboundFlightNumber?: string;
    returnFlightNumber?: string;
    returnAccommodationType?: string;

    // Multi-Destination
    multiDepartingFrom?: string;
    multiFinalReturnDestination?: string;
    multiLegs?: MultiStopLeg[];
    multiOverallReturnDate?: string;

    // Transit
    transitFrom?: string;
    transitFinalDestination?: string;
    transitLocation?: string;
    transitDuration?: string;
    transitDepartureDate?: string;
    transitReturnDate?: string;
}

interface TripItineraryFlowProps {
    value?: TripItineraryData;
    onChange: (data: TripItineraryData) => void;
}

// ── Constants ──────────────────────────────────────────────────

const LENGTH_OF_STAY_OPTIONS = [
    { value: "<1m", label: "Less than 1 month" },
    { value: "1-3m", label: "1 – 3 months" },
    { value: "3-6m", label: "3 – 6 months" },
    { value: "6-12m", label: "6 – 12 months" },
    { value: "12m+", label: "More than 12 months" },
    { value: "open", label: "Open-ended / unknown" },
];

const ONE_WAY_PURPOSE_OPTIONS = [
    { value: "relocation", label: "Relocation / immigration" },
    { value: "work", label: "Long-term work assignment" },
    { value: "study", label: "Study / academic" },
    { value: "volunteering", label: "Volunteering / mission" },
    { value: "return_origin", label: "Return to country of origin" },
    { value: "other", label: "Other" },
];

const ACCOMMODATION_OPTIONS = [
    { value: "resort_hotel", label: "Resort / hotel (air-conditioned)" },
    { value: "guesthouse", label: "Guesthouse / hostel" },
    { value: "private_home", label: "Private home / Airbnb" },
    { value: "rural_camping", label: "Rural / bush / camping" },
    { value: "mixed", label: "Mixed" },
];

const TRANSIT_DURATION_OPTIONS = [
    { value: "<12h", label: "Under 12 hours (airside only)" },
    { value: "12-24h", label: "12 – 24 hours" },
    { value: ">24h", label: "Over 24 hours (leaving airport)" },
];

// ── Helpers ────────────────────────────────────────────────────

function stepComplete(data: TripItineraryData): boolean {
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
        const legs = data.multiLegs || [];
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

// ── Shared styles ──────────────────────────────────────────────

const inputCls =
    "w-full bg-white border border-border-light rounded-xl px-4 py-3.5 text-[15px] font-medium text-heading placeholder:text-muted/55 outline-none focus:border-accent transition-colors";

const fieldLabelCls =
    "mb-1.5 block text-xs font-semibold uppercase tracking-[0.08em] text-muted";

function SelectPill({
    options,
    value,
    onChange,
}: {
    options: { value: string; label: string }[];
    value?: string;
    onChange: (v: string) => void;
}) {
    return (
        <div className="space-y-2">
            {options.map((opt) => (
                <button
                    key={opt.value}
                    type="button"
                    onClick={() => onChange(opt.value)}
                    className={`w-full text-left p-3.5 rounded-xl border text-sm font-semibold transition-colors ${
                        value === opt.value
                            ? "border-accent bg-accent/10 text-heading"
                            : "border-border-light/70 bg-white text-body hover:border-border"
                    }`}
                >
                    {opt.label}
                </button>
            ))}
        </div>
    );
}

function SectionCard({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
    return (
        <div className="rounded-xl border border-border-light/60 bg-background-primary/50 p-5 space-y-4">
            <div className="flex items-center gap-2 mb-1">
                {icon}
                <h4 className="text-sm font-bold text-heading">{title}</h4>
            </div>
            {children}
        </div>
    );
}

// ── Component ──────────────────────────────────────────────────

const TripItineraryFlow = ({ value, onChange }: TripItineraryFlowProps) => {
    const [step, setStep] = useState(0); // 0 = type chooser, 1 = form

    const data: TripItineraryData = {
        ...value,
        tripType: value?.tripType ?? "one",
        multiLegs: value?.multiLegs ?? [],
    };

    const update = (patch: Partial<TripItineraryData>) =>
        onChange({ ...data, ...patch });

    const selectType = (tripType: TripItineraryData["tripType"]) => {
        update({ tripType });
        if (tripType === "multi" && (!data.multiLegs || data.multiLegs.length === 0)) {
            update({
                tripType,
                multiLegs: [{ country: "", city: "", arrivalDate: "", nights: "", accommodationType: "" }],
            });
        }
        setStep(1);
    };

    const goBack = () => setStep(0);

    const addLeg = () =>
        update({
            multiLegs: [
                ...(data.multiLegs ?? []),
                { country: "", city: "", arrivalDate: "", nights: "", accommodationType: "" },
            ],
        });

    const removeLeg = (index: number) =>
        update({ multiLegs: (data.multiLegs ?? []).filter((_, i) => i !== index) });

    const updateLeg = (index: number, patch: Partial<MultiStopLeg>) => {
        const legs = [...(data.multiLegs ?? [])];
        legs[index] = { ...legs[index], ...patch };
        update({ multiLegs: legs });
    };

    const tripTypes = [
        { value: "one" as const, label: "One-way journey", icon: <LucidePlaneTakeoff className="w-5 h-5" /> },
        { value: "return" as const, label: "Return journey", icon: <LucideNavigation className="w-5 h-5" /> },
        { value: "multi" as const, label: "Multi-destination", icon: <LucideGlobe className="w-5 h-5" /> },
        { value: "transit" as const, label: "Transit only", icon: <LucideClock className="w-5 h-5" /> },
    ];

    return (
        <div className="space-y-5">
            {/* Step 0 — Trip Type Chooser */}
            {step === 0 && (
                <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
                    <p className="text-sm text-muted mb-4">Select your trip type to get started:</p>
                    <div className="grid grid-cols-2 gap-3">
                        {tripTypes.map((t) => (
                            <button
                                key={t.value}
                                type="button"
                                onClick={() => selectType(t.value)}
                                className={`flex flex-col items-center gap-2 p-5 rounded-2xl border-2 transition-all cursor-pointer ${
                                    data.tripType === t.value
                                        ? "border-accent bg-accent/5"
                                        : "border-border-light/60 bg-white hover:border-border"
                                }`}
                            >
                                <span className="text-accent">{t.icon}</span>
                                <span className="text-sm font-semibold text-heading text-center">{t.label}</span>
                            </button>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Step 1 — Trip Details Form */}
            {step === 1 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="flex items-center justify-between mb-5">
                        <button
                            type="button"
                            onClick={goBack}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-accent hover:underline cursor-pointer"
                        >
                            <LucideArrowLeft className="w-3.5 h-3.5" /> Change type
                        </button>
                        <span className="text-[11px] uppercase tracking-[0.1em] font-semibold text-accent bg-accent/10 px-3 py-1 rounded-full">
                            {tripTypes.find((t) => t.value === data.tripType)?.label}
                        </span>
                    </div>

                    {/* ── One-Way Journey ── */}
                    {data.tripType === "one" && (
                        <div className="space-y-5">
                            <SectionCard title="Route" icon={<LucideNavigation className="w-4 h-4 text-accent" />}>
                                <div>
                                    <label className={fieldLabelCls}>Departing from — City or airport</label>
                                    <input
                                        type="text"
                                        value={data.oneFrom ?? ""}
                                        onChange={(e) => update({ oneFrom: e.target.value })}
                                        placeholder="e.g. London Heathrow"
                                        className={inputCls}
                                    />
                                </div>
                                <div>
                                    <label className={fieldLabelCls}>Destination — City or country <span className="text-red-400">*</span></label>
                                    <div className="relative">
                                        <LucideMapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                                        <CountryPicker
                                            value={data.oneTo ?? ""}
                                            onChange={(name) => update({ oneTo: name })}
                                            placeholder="Select destination country"
                                            inputClassName={`${inputCls} pl-10 pr-10`}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className={fieldLabelCls}>Flight number (optional)</label>
                                    <input
                                        type="text"
                                        value={data.oneFlightNumber ?? ""}
                                        onChange={(e) => update({ oneFlightNumber: e.target.value })}
                                        placeholder="e.g. BA2047"
                                        className={inputCls}
                                    />
                                </div>
                            </SectionCard>

                            <SectionCard title="Dates" icon={<LucideCalendarDays className="w-4 h-4 text-accent" />}>
                                <div>
                                    <label className={fieldLabelCls}>Departure date — When do you leave? <span className="text-red-400">*</span></label>
                                    <input
                                        type="date"
                                        value={data.oneDepartureDate ?? ""}
                                        onChange={(e) => update({ oneDepartureDate: e.target.value })}
                                        className={inputCls}
                                    />
                                </div>
                                <div>
                                    <label className={fieldLabelCls}>Planned length of stay <span className="text-red-400">*</span></label>
                                    <SelectPill
                                        options={LENGTH_OF_STAY_OPTIONS}
                                        value={data.oneLengthOfStay}
                                        onChange={(v) => update({ oneLengthOfStay: v })}
                                    />
                                </div>
                            </SectionCard>

                            <SectionCard title="Purpose" icon={<LucideBriefcase className="w-4 h-4 text-accent" />}>
                                <div>
                                    <label className={fieldLabelCls}>Purpose of travel <span className="text-red-400">*</span></label>
                                    <SelectPill
                                        options={ONE_WAY_PURPOSE_OPTIONS}
                                        value={data.onePurpose}
                                        onChange={(v) => update({ onePurpose: v })}
                                    />
                                </div>
                            </SectionCard>

                            <SectionCard title="Accommodation" icon={<LucideBuilding2 className="w-4 h-4 text-accent" />}>
                                <div>
                                    <label className={fieldLabelCls}>Accommodation type at destination</label>
                                    <SelectPill
                                        options={ACCOMMODATION_OPTIONS}
                                        value={data.oneAccommodationType}
                                        onChange={(v) => update({ oneAccommodationType: v })}
                                    />
                                    <div className="mt-2">
                                        <button
                                            type="button"
                                            onClick={() => update({ oneAccommodationType: "" })}
                                            className="text-xs text-muted hover:text-accent cursor-pointer"
                                        >
                                            Not yet arranged
                                        </button>
                                    </div>
                                </div>
                            </SectionCard>
                        </div>
                    )}

                    {/* ── Return Journey ── */}
                    {data.tripType === "return" && (
                        <div className="space-y-5">
                            <SectionCard title="Outbound" icon={<LucidePlaneTakeoff className="w-4 h-4 text-accent" />}>
                                <div className="grid grid-cols-[1fr,auto,1fr] gap-3 items-end">
                                    <div>
                                        <label className={fieldLabelCls}>Departing from <span className="text-red-400">*</span></label>
                                        <div className="relative">
                                            <LucideMapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                                            <input
                                                type="text"
                                                value={data.returnFrom ?? ""}
                                                onChange={(e) => update({ returnFrom: e.target.value })}
                                                placeholder="e.g. London Heathrow"
                                                className={`${inputCls} pl-10`}
                                            />
                                        </div>
                                    </div>
                                    <div className="text-muted/40 text-lg pb-3 text-center">→</div>
                                    <div>
                                        <label className={fieldLabelCls}>Destination <span className="text-red-400">*</span></label>
                                        <div className="relative">
                                            <LucideGlobe className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                                            <CountryPicker
                                                value={data.returnTo ?? ""}
                                                onChange={(name) => update({ returnTo: name })}
                                                placeholder="e.g. Kingston, Jamaica"
                                                inputClassName={`${inputCls} pl-10 pr-10`}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className={fieldLabelCls}>Departure date <span className="text-red-400">*</span></label>
                                        <input
                                            type="date"
                                            value={data.returnDepartureDate ?? ""}
                                            onChange={(e) => update({ returnDepartureDate: e.target.value })}
                                            className={inputCls}
                                        />
                                    </div>
                                    <div>
                                        <label className={fieldLabelCls}>Outbound flight number (optional)</label>
                                        <input
                                            type="text"
                                            value={data.outboundFlightNumber ?? ""}
                                            onChange={(e) => update({ outboundFlightNumber: e.target.value })}
                                            placeholder="e.g. VS015"
                                            className={inputCls}
                                        />
                                    </div>
                                </div>
                            </SectionCard>

                            <SectionCard title="Return" icon={<LucidePlaneLanding className="w-4 h-4 text-accent" />}>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className={fieldLabelCls}>Return date — When do you come back? <span className="text-red-400">*</span></label>
                                        <input
                                            type="date"
                                            value={data.returnReturnDate ?? ""}
                                            onChange={(e) => update({ returnReturnDate: e.target.value })}
                                            className={inputCls}
                                        />
                                    </div>
                                    <div>
                                        <label className={fieldLabelCls}>Return flight number (optional)</label>
                                        <input
                                            type="text"
                                            value={data.returnFlightNumber ?? ""}
                                            onChange={(e) => update({ returnFlightNumber: e.target.value })}
                                            placeholder="e.g. VS016"
                                            className={inputCls}
                                        />
                                    </div>
                                </div>
                            </SectionCard>

                            <SectionCard title="Accommodation" icon={<LucideBuilding2 className="w-4 h-4 text-accent" />}>
                                <SelectPill
                                    options={ACCOMMODATION_OPTIONS}
                                    value={data.returnAccommodationType}
                                    onChange={(v) => update({ returnAccommodationType: v })}
                                />
                            </SectionCard>
                        </div>
                    )}

                    {/* ── Multi-Destination Journey ── */}
                    {data.tripType === "multi" && (
                        <div className="space-y-5">
                            <SectionCard title="Overall Route" icon={<LucideNavigation className="w-4 h-4 text-accent" />}>
                                <div>
                                    <label className={fieldLabelCls}>Departing from — City or airport</label>
                                    <input
                                        type="text"
                                        value={data.multiDepartingFrom ?? ""}
                                        onChange={(e) => update({ multiDepartingFrom: e.target.value })}
                                        placeholder="e.g. London Heathrow"
                                        className={inputCls}
                                    />
                                </div>
                                <div>
                                    <label className={fieldLabelCls}>Final return destination (if applicable)</label>
                                    <input
                                        type="text"
                                        value={data.multiFinalReturnDestination ?? ""}
                                        onChange={(e) => update({ multiFinalReturnDestination: e.target.value })}
                                        placeholder="e.g. same as departure"
                                        className={inputCls}
                                    />
                                </div>
                                <div>
                                    <label className={fieldLabelCls}>Overall return date (if returning home)</label>
                                    <input
                                        type="date"
                                        value={data.multiOverallReturnDate ?? ""}
                                        onChange={(e) => update({ multiOverallReturnDate: e.target.value })}
                                        className={inputCls}
                                    />
                                </div>
                            </SectionCard>

                            {/* Legs */}
                            <div className="space-y-3">
                                <h4 className="text-sm font-bold text-heading">Itinerary legs</h4>
                                {(data.multiLegs ?? []).map((leg, i) => (
                                    <div
                                        key={i}
                                        className="rounded-xl border border-border-light/60 bg-background-primary/50 p-4 space-y-3"
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-[11px] uppercase tracking-[0.08em] font-semibold text-accent bg-accent/10 px-2.5 py-1 rounded-full">
                                                Stop {i + 1}
                                            </span>
                                            {(data.multiLegs ?? []).length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeLeg(i)}
                                                    className="text-muted hover:text-red-500 cursor-pointer"
                                                >
                                                    <LucideX className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className={fieldLabelCls}>Country <span className="text-red-400">*</span></label>
                                                <div className="relative">
                                                    <LucideGlobe className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                                                    <CountryPicker
                                                        value={leg.country}
                                                        onChange={(name) => updateLeg(i, { country: name })}
                                                        placeholder="Select country"
                                                        inputClassName={`${inputCls} pl-10 pr-10 text-sm`}
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className={fieldLabelCls}>City</label>
                                                <input
                                                    type="text"
                                                    value={leg.city}
                                                    onChange={(e) => updateLeg(i, { city: e.target.value })}
                                                    placeholder="City name"
                                                    className={`${inputCls} text-sm`}
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className={fieldLabelCls}>Arrival date <span className="text-red-400">*</span></label>
                                                <input
                                                    type="date"
                                                    value={leg.arrivalDate}
                                                    onChange={(e) => updateLeg(i, { arrivalDate: e.target.value })}
                                                    className={`${inputCls} text-sm`}
                                                />
                                            </div>
                                            <div>
                                                <label className={fieldLabelCls}>Number of nights <span className="text-red-400">*</span></label>
                                                <input
                                                    type="text"
                                                    value={leg.nights}
                                                    onChange={(e) => updateLeg(i, { nights: e.target.value })}
                                                    placeholder="e.g. 5"
                                                    className={`${inputCls} text-sm`}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className={fieldLabelCls}>Accommodation type</label>
                                            <SelectPill
                                                options={ACCOMMODATION_OPTIONS}
                                                value={leg.accommodationType}
                                                onChange={(v) => updateLeg(i, { accommodationType: v })}
                                            />
                                        </div>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={addLeg}
                                    className="w-full py-3.5 rounded-xl border-2 border-dashed border-border-light text-sm font-semibold text-muted/60 hover:border-accent hover:text-accent hover:bg-accent/5 transition-all cursor-pointer flex items-center justify-center gap-2"
                                >
                                    <LucidePlus className="w-4 h-4" /> Add another stop
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ── Transit Only ── */}
                    {data.tripType === "transit" && (
                        <div className="space-y-5">
                            <SectionCard title="Route" icon={<LucideNavigation className="w-4 h-4 text-accent" />}>
                                <div>
                                    <label className={fieldLabelCls}>Departing from — City or airport</label>
                                    <input
                                        type="text"
                                        value={data.transitFrom ?? ""}
                                        onChange={(e) => update({ transitFrom: e.target.value })}
                                        placeholder="e.g. London Heathrow"
                                        className={inputCls}
                                    />
                                </div>
                                <div>
                                    <label className={fieldLabelCls}>Final destination — City or country</label>
                                    <div className="relative">
                                        <LucideGlobe className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                                        <CountryPicker
                                            value={data.transitFinalDestination ?? ""}
                                            onChange={(name) => update({ transitFinalDestination: name })}
                                            placeholder="Select final destination country"
                                            inputClassName={`${inputCls} pl-10 pr-10`}
                                        />
                                    </div>
                                </div>
                            </SectionCard>

                            <SectionCard title="Transit Details" icon={<LucideClock className="w-4 h-4 text-accent" />}>
                                <div>
                                    <label className={fieldLabelCls}>Transit country / airport <span className="text-red-400">*</span></label>
                                    <input
                                        type="text"
                                        value={data.transitLocation ?? ""}
                                        onChange={(e) => update({ transitLocation: e.target.value })}
                                        placeholder="e.g. Nairobi (NBO), Dubai (DXB)"
                                        className={inputCls}
                                    />
                                </div>
                                <div>
                                    <label className={fieldLabelCls}>Transit duration <span className="text-red-400">*</span></label>
                                    <SelectPill
                                        options={TRANSIT_DURATION_OPTIONS}
                                        value={data.transitDuration}
                                        onChange={(v) => update({ transitDuration: v })}
                                    />
                                </div>
                            </SectionCard>

                            <SectionCard title="Dates" icon={<LucideCalendarDays className="w-4 h-4 text-accent" />}>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className={fieldLabelCls}>Departure date <span className="text-red-400">*</span></label>
                                        <input
                                            type="date"
                                            value={data.transitDepartureDate ?? ""}
                                            onChange={(e) => update({ transitDepartureDate: e.target.value })}
                                            className={inputCls}
                                        />
                                    </div>
                                    <div>
                                        <label className={fieldLabelCls}>Return date (if applicable)</label>
                                        <input
                                            type="date"
                                            value={data.transitReturnDate ?? ""}
                                            onChange={(e) => update({ transitReturnDate: e.target.value })}
                                            className={inputCls}
                                        />
                                    </div>
                                </div>
                            </SectionCard>
                        </div>
                    )}

                    {/* Completion indicator */}
                    {stepComplete(data) && (
                        <div className="flex items-center gap-2 text-sm text-green-600 font-medium mt-2">
                            <LucideCheck className="w-4 h-4" /> Trip details complete
                        </div>
                    )}
                </motion.div>
            )}
        </div>
    );
};

export default TripItineraryFlow;
