import { useMemo } from "react";
import { motion } from "framer-motion";
import {
    LucideCheck,
    LucideGlobe,
    LucidePlus,
    LucideX,
    LucideClock,
    LucideNavigation,
    LucidePlaneTakeoff,
    LucidePlaneLanding,
} from "lucide-react";
import CountryPicker from "../CountryPicker";
import CityAutocomplete from "./CityAutocomplete";
import { mergeCityCountry, splitLegacyDeparting } from "./tripItineraryMerge";
import { maxIsoDate, validateTripItineraryDates } from "./tripItineraryValidation";
import { addCalendarDaysToIsoDate, todayIsoDateLocal } from "../../lib/questionnaireFieldValidation";
import { useCountriesContext } from "../../context/CountriesContext";

// ── Types ──────────────────────────────────────────────────────

export interface MultiStopLeg {
    country: string;
    city: string;
    arrivalDate: string;
    nights: string;
}

export interface TripItineraryData {
    tripType: "one-way" | "return" | "multi" | "transit";

    // One-Way (oneTo = destination country name for APIs; oneToCity = city)
    oneFrom?: string;
    oneFromCity?: string;
    oneFromCountry?: string;
    oneTo?: string;
    oneToCity?: string;
    oneDepartureDate?: string;
    oneNumberOfFlights?: string;
    onePurpose?: string;
    oneLengthOfStay?: string;

    // Return
    returnFrom?: string;
    returnFromCity?: string;
    returnFromCountry?: string;
    returnTo?: string;
    returnToCity?: string;
    returnDepartureDate?: string;
    returnReturnDate?: string;

    // Multi-Destination
    multiDepartingFrom?: string;
    multiDepartingFromCity?: string;
    multiDepartingFromCountry?: string;
    multiFinalReturnDestination?: string;
    multiLegs?: MultiStopLeg[];
    multiOverallReturnDate?: string;

    // Transit (transitFinalDestination = country)
    transitFrom?: string;
    transitFromCity?: string;
    transitFromCountry?: string;
    transitFinalDestination?: string;
    transitFinalDestinationCity?: string;
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

const TRANSIT_DURATION_OPTIONS = [
    { value: "<12h", label: "< 12 hours (airside only)" },
    { value: "12-24h", label: "12 – 24 hours" },
    { value: ">24h", label: "> 24 hours (leaving airport)" },
];

const LENGTH_OF_STAY_OPTIONS = [
    { value: "<1m", label: "< 1 month" },
    { value: "1-3m", label: "1 – 3 months" },
    { value: "3-6m", label: "3 – 6 months" },
    { value: "6-12m", label: "6 – 12 months" },
    { value: "12m+", label: "12+ months" },
];

// ── Helpers ────────────────────────────────────────────────────

/** Hydrate split city/country from legacy single-line fields when loading saved drafts. */
// eslint-disable-next-line react-refresh/only-export-components
export function hydrateLegacyTripItinerary(value: TripItineraryData | undefined): TripItineraryData {
    const v: TripItineraryData = value ?? { tripType: "one-way" };
    // Backward-compat: drafts written before the rename used "one".
    const rawType = v.tripType as unknown as string;
    const tripType: TripItineraryData["tripType"] =
        rawType === "one"
            ? "one-way"
            : rawType === "one-way" || rawType === "return" || rawType === "multi" || rawType === "transit"
                ? rawType
                : "one-way";
    const out: TripItineraryData = { ...v, tripType, multiLegs: v.multiLegs ?? [] };

    if (!out.oneFromCity?.trim() && !out.oneFromCountry?.trim() && out.oneFrom?.trim()) {
        const { city, country } = splitLegacyDeparting(out.oneFrom);
        out.oneFromCity = city;
        out.oneFromCountry = country;
    }
    if (!out.returnFromCity?.trim() && !out.returnFromCountry?.trim() && out.returnFrom?.trim()) {
        const { city, country } = splitLegacyDeparting(out.returnFrom);
        out.returnFromCity = city;
        out.returnFromCountry = country;
    }
    if (!out.multiDepartingFromCity?.trim() && !out.multiDepartingFromCountry?.trim() && out.multiDepartingFrom?.trim()) {
        const { city, country } = splitLegacyDeparting(out.multiDepartingFrom);
        out.multiDepartingFromCity = city;
        out.multiDepartingFromCountry = country;
    }
    if (!out.transitFromCity?.trim() && !out.transitFromCountry?.trim() && out.transitFrom?.trim()) {
        const { city, country } = splitLegacyDeparting(out.transitFrom);
        out.transitFromCity = city;
        out.transitFromCountry = country;
    }
    return out;
}

function stepComplete(data: TripItineraryData): boolean {
    let filled = false;
    if (data.tripType === "one-way") {
        filled = Boolean(
            data.oneFromCity?.trim() &&
                data.oneFromCountry?.trim() &&
                data.oneToCity?.trim() &&
                data.oneTo?.trim() &&
                data.oneDepartureDate?.trim() &&
                data.oneNumberOfFlights?.trim()
        );
    } else if (data.tripType === "return") {
        filled = Boolean(
            data.returnFromCity?.trim() &&
                data.returnFromCountry?.trim() &&
                data.returnToCity?.trim() &&
                data.returnTo?.trim() &&
                data.returnDepartureDate?.trim() &&
                data.returnReturnDate?.trim()
        );
    } else if (data.tripType === "multi") {
        const legs = data.multiLegs || [];
        if (legs.length < 1) return false;
        if (!data.multiDepartingFromCity?.trim() || !data.multiDepartingFromCountry?.trim()) return false;
        filled = legs.every(
            (leg) => leg.country?.trim() && leg.arrivalDate?.trim() && leg.nights?.trim()
        );
    } else if (data.tripType === "transit") {
        filled = Boolean(
            data.transitFromCity?.trim() &&
                data.transitFromCountry?.trim() &&
                data.transitFinalDestinationCity?.trim() &&
                data.transitFinalDestination?.trim() &&
                data.transitLocation?.trim() &&
                data.transitDuration?.trim() &&
                data.transitDepartureDate?.trim()
        );
    }
    return filled && validateTripItineraryDates(data) === null;
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
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {options.map((opt) => (
                <button
                    key={opt.value}
                    type="button"
                    onClick={() => onChange(opt.value)}
                    className={`text-center p-3 rounded-xl border text-sm font-semibold transition-colors cursor-pointer ${
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

// ── Component ──────────────────────────────────────────────────

const TripItineraryFlow = ({ value, onChange }: TripItineraryFlowProps) => {
    const hydrated = useMemo(() => hydrateLegacyTripItinerary(value), [value]);
    const minDate = useMemo(() => todayIsoDateLocal(), []);
    const { countries } = useCountriesContext();
    const countryCodeByName = useMemo(() => {
        const m = new Map<string, string>();
        for (const c of countries) m.set(c.name.toLowerCase(), c.code);
        return m;
    }, [countries]);
    const codeFor = (name?: string) =>
        name ? countryCodeByName.get(name.trim().toLowerCase()) : undefined;

    const data: TripItineraryData = {
        ...hydrated,
        tripType: hydrated.tripType ?? "one-way",
        multiLegs: hydrated.multiLegs ?? [],
    };

    const update = (patch: Partial<TripItineraryData>) => {
        const next: TripItineraryData = { ...data, ...patch };
        if ("oneFromCity" in patch || "oneFromCountry" in patch) {
            next.oneFrom = mergeCityCountry(next.oneFromCity, next.oneFromCountry) || undefined;
        }
        if ("returnFromCity" in patch || "returnFromCountry" in patch) {
            next.returnFrom = mergeCityCountry(next.returnFromCity, next.returnFromCountry) || undefined;
        }
        if ("multiDepartingFromCity" in patch || "multiDepartingFromCountry" in patch) {
            next.multiDepartingFrom =
                mergeCityCountry(next.multiDepartingFromCity, next.multiDepartingFromCountry) || undefined;
        }
        if ("transitFromCity" in patch || "transitFromCountry" in patch) {
            next.transitFrom = mergeCityCountry(next.transitFromCity, next.transitFromCountry) || undefined;
        }
        onChange(next);
    };

    const setTripType = (tripType: TripItineraryData["tripType"]) => {
        if (tripType === "multi" && (!data.multiLegs || data.multiLegs.length === 0)) {
            update({ tripType, multiLegs: [{ country: "", city: "", arrivalDate: "", nights: "" }] });
        } else {
            update({ tripType });
        }
    };

    const addLeg = () =>
        update({
            multiLegs: [
                ...(data.multiLegs ?? []),
                { country: "", city: "", arrivalDate: "", nights: "" },
            ],
        });

    const removeLeg = (index: number) =>
        update({ multiLegs: (data.multiLegs ?? []).filter((_, i) => i !== index) });

    const updateLeg = (index: number, patch: Partial<MultiStopLeg>) => {
        const legs = [...(data.multiLegs ?? [])];
        legs[index] = { ...legs[index], ...patch };
        update({ multiLegs: legs });
    };

    return (
        <div className="space-y-5">
            {/* ── Trip type toggle (like flight booking sites) ────── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {[
                    { value: "one-way" as const, label: "One Way", icon: <LucidePlaneTakeoff className="w-4 h-4" /> },
                    { value: "return" as const, label: "Return", icon: <LucideNavigation className="w-4 h-4" /> },
                    { value: "multi" as const, label: "Multi-stop", icon: <LucideGlobe className="w-4 h-4" /> },
                    { value: "transit" as const, label: "Transit", icon: <LucideClock className="w-4 h-4" /> },
                ].map((t) => (
                    <button
                        key={t.value}
                        type="button"
                        onClick={() => setTripType(t.value)}
                        className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 text-sm font-semibold transition-all cursor-pointer ${
                            data.tripType === t.value
                                ? "border-accent bg-accent text-white"
                                : "border-border-light/60 bg-white text-muted hover:border-border hover:text-heading"
                        }`}
                    >
                        {t.icon}
                        {t.label}
                    </button>
                ))}
            </div>

            {stepComplete(data) && (
                <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
                    <LucideCheck className="w-4 h-4" /> Trip details complete
                </div>
            )}

            {/* ── One-Way ── */}
            {data.tripType === "one-way" && (
                <motion.div key="one-way" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-3 lg:gap-4 lg:items-start">
                        <div className="space-y-3 rounded-xl border border-border-light/50 bg-white/50 p-3">
                            <p className={`${fieldLabelCls} mb-0`}>
                                Departing from <span className="text-muted">(city/airport)</span>{" "}
                                <span className="text-red-400">*</span>
                            </p>
                            <div>
                                <label className={fieldLabelCls}>Country</label>
                                <CountryPicker
                                    value={data.oneFromCountry ?? ""}
                                    onChange={(name) => update({ oneFromCountry: name })}
                                    placeholder="Country"
                                    inputClassName={`${inputCls} pr-10`}
                                />
                            </div>
                            <div>
                                <label className={fieldLabelCls}>City</label>
                                <CityAutocomplete
                                    value={data.oneFromCity ?? ""}
                                    onChange={(city) => update({ oneFromCity: city })}
                                    countryCode={codeFor(data.oneFromCountry)}
                                    placeholder="e.g. London Heathrow"
                                    withIcon
                                />
                            </div>
                        </div>
                        <div className="flex justify-center items-center text-muted/40 text-2xl py-1 lg:py-0 lg:pt-10 shrink-0">
                            <span className="lg:hidden" aria-hidden>
                                ↓
                            </span>
                            <span className="hidden lg:inline" aria-hidden>
                                →
                            </span>
                        </div>
                        <div className="space-y-3 rounded-xl border border-border-light/50 bg-white/50 p-3">
                            <p className={`${fieldLabelCls} mb-0`}>
                                To <span className="text-red-400">*</span>
                            </p>
                            <div>
                                <label className={fieldLabelCls}>Country</label>
                                <CountryPicker
                                    value={data.oneTo ?? ""}
                                    onChange={(name) => update({ oneTo: name })}
                                    placeholder="Destination country"
                                    inputClassName={`${inputCls} pr-10`}
                                />
                            </div>
                            <div>
                                <label className={fieldLabelCls}>City</label>
                                <CityAutocomplete
                                    value={data.oneToCity ?? ""}
                                    onChange={(city) => update({ oneToCity: city })}
                                    countryCode={codeFor(data.oneTo)}
                                    placeholder="e.g. Paris"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className={fieldLabelCls}>Departure date <span className="text-red-400">*</span></label>
                            <input
                                type="date"
                                min={minDate}
                                value={data.oneDepartureDate ?? ""}
                                onChange={(e) => update({ oneDepartureDate: e.target.value })}
                                className={inputCls}
                            />
                        </div>
                        <div>
                            <label className={fieldLabelCls}>Number of flights <span className="text-red-400">*</span></label>
                            <input
                                type="number"
                                min={1}
                                max={50}
                                value={data.oneNumberOfFlights ?? ""}
                                onChange={(e) => update({ oneNumberOfFlights: e.target.value })}
                                placeholder="e.g. 2"
                                className={inputCls}
                            />
                        </div>
                    </div>

                    <div>
                        <label className={fieldLabelCls}>Length of stay</label>
                        <SelectPill
                            options={LENGTH_OF_STAY_OPTIONS}
                            value={data.oneLengthOfStay}
                            onChange={(v) => update({ oneLengthOfStay: v })}
                        />
                        <p className="mt-1.5 text-[11px] text-muted/70">
                            Helps tailor vaccine, prophylaxis, and post-travel guidance for longer stays. Optional for permanent relocation.
                        </p>
                    </div>
                </motion.div>
            )}

            {/* ── Return ── */}
            {data.tripType === "return" && (
                <motion.div key="return" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                    {/* Outbound */}
                    <div className="p-4 rounded-xl border border-border-light/60 bg-white space-y-4">
                        <div className="flex items-center gap-2">
                            <LucidePlaneTakeoff className="w-4 h-4 text-accent" />
                            <h4 className="text-sm font-bold text-heading">Outbound</h4>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-3 lg:gap-4 lg:items-start">
                            <div className="space-y-3 rounded-xl border border-border-light/40 bg-white/50 p-3">
                                <p className={`${fieldLabelCls} mb-0`}>
                                    From <span className="text-red-400">*</span>
                                </p>
                                <div>
                                    <label className={fieldLabelCls}>Country</label>
                                    <CountryPicker
                                        value={data.returnFromCountry ?? ""}
                                        onChange={(name) => update({ returnFromCountry: name })}
                                        placeholder="Country"
                                        inputClassName={`${inputCls} pr-10`}
                                    />
                                </div>
                                <div>
                                    <label className={fieldLabelCls}>City</label>
                                    <CityAutocomplete
                                        value={data.returnFromCity ?? ""}
                                        onChange={(city) => update({ returnFromCity: city })}
                                        countryCode={codeFor(data.returnFromCountry)}
                                        placeholder="e.g. London Heathrow"
                                        withIcon
                                    />
                                </div>
                            </div>
                            <div className="flex justify-center items-center text-muted/40 text-2xl py-1 lg:py-0 lg:pt-10 shrink-0">
                                <span className="lg:hidden" aria-hidden>
                                    ↓
                                </span>
                                <span className="hidden lg:inline" aria-hidden>
                                    →
                                </span>
                            </div>
                            <div className="space-y-3 rounded-xl border border-border-light/40 bg-white/50 p-3">
                                <p className={`${fieldLabelCls} mb-0`}>
                                    To <span className="text-red-400">*</span>
                                </p>
                                <div>
                                    <label className={fieldLabelCls}>Country</label>
                                    <CountryPicker
                                        value={data.returnTo ?? ""}
                                        onChange={(name) => update({ returnTo: name })}
                                        placeholder="Destination country"
                                        inputClassName={`${inputCls} pr-10`}
                                    />
                                </div>
                                <div>
                                    <label className={fieldLabelCls}>City</label>
                                    <CityAutocomplete
                                        value={data.returnToCity ?? ""}
                                        onChange={(city) => update({ returnToCity: city })}
                                        countryCode={codeFor(data.returnTo)}
                                        placeholder="e.g. Paris"
                                    />
                                </div>
                            </div>
                        </div>
                        <div>
                            <label className={fieldLabelCls}>Departure date <span className="text-red-400">*</span></label>
                            <input
                                type="date"
                                min={minDate}
                                value={data.returnDepartureDate ?? ""}
                                onChange={(e) => update({ returnDepartureDate: e.target.value })}
                                className={inputCls}
                            />
                        </div>
                    </div>

                    {/* Return */}
                    <div className="p-4 rounded-xl border border-border-light/60 bg-white space-y-4">
                        <div className="flex items-center gap-2">
                            <LucidePlaneLanding className="w-4 h-4 text-accent" />
                            <h4 className="text-sm font-bold text-heading">Return</h4>
                        </div>
                        <div>
                            <label className={fieldLabelCls}>Return date <span className="text-red-400">*</span></label>
                            <input
                                type="date"
                                min={maxIsoDate(minDate, (data.returnDepartureDate ?? "").trim() || minDate)}
                                value={data.returnReturnDate ?? ""}
                                onChange={(e) => update({ returnReturnDate: e.target.value })}
                                className={inputCls}
                            />
                            {(data.returnDepartureDate ?? "").trim() ?
                                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                                    <span className="text-[11px] font-medium text-muted">Quick:</span>
                                    {([7, 14, 21, 30] as const).map((d) => (
                                        <button
                                            key={d}
                                            type="button"
                                            onClick={() =>
                                                update({
                                                    returnReturnDate: addCalendarDaysToIsoDate(
                                                        (data.returnDepartureDate ?? "").trim(),
                                                        d,
                                                    ),
                                                })
                                            }
                                            className="rounded-lg border border-border-light/80 bg-white px-2.5 py-1 text-[11px] font-semibold text-body hover:border-accent hover:text-accent transition-colors cursor-pointer"
                                        >
                                            +{d}d
                                        </button>
                                    ))}
                                </div>
                            :   null}
                        </div>
                    </div>
                </motion.div>
            )}

            {/* ── Multi-stop ── */}
            {data.tripType === "multi" && (
                <motion.div key="multi" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                    <div className="p-4 rounded-xl border border-border-light/60 bg-white space-y-3">
                        <p className={`${fieldLabelCls} mb-0`}>
                            Departing from <span className="text-muted">(city/airport)</span>{" "}
                            <span className="text-red-400">*</span>
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className={fieldLabelCls}>Country</label>
                                <CountryPicker
                                    value={data.multiDepartingFromCountry ?? ""}
                                    onChange={(name) => update({ multiDepartingFromCountry: name })}
                                    placeholder="Country"
                                    inputClassName={`${inputCls} pr-10`}
                                />
                            </div>
                            <div>
                                <label className={fieldLabelCls}>City</label>
                                <CityAutocomplete
                                    value={data.multiDepartingFromCity ?? ""}
                                    onChange={(city) => update({ multiDepartingFromCity: city })}
                                    countryCode={codeFor(data.multiDepartingFromCountry)}
                                    placeholder="e.g. London Heathrow"
                                    withIcon
                                />
                            </div>
                        </div>
                    </div>

                    {(data.multiLegs ?? []).map((leg, i) => (
                        <div key={i} className="p-4 rounded-xl border border-border-light/60 bg-white space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] uppercase tracking-[0.08em] font-semibold text-accent bg-accent/10 px-2.5 py-1 rounded-full">
                                    Stop {i + 1}
                                </span>
                                {(data.multiLegs ?? []).length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeLeg(i)}
                                        className="text-muted hover:text-red-500 cursor-pointer p-1"
                                    >
                                        <LucideX className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className={fieldLabelCls}>Country <span className="text-red-400">*</span></label>
                                    <CountryPicker
                                        value={leg.country}
                                        onChange={(name) => updateLeg(i, { country: name })}
                                        placeholder="Select country"
                                        inputClassName={`${inputCls} pr-10`}
                                    />
                                </div>
                                <div>
                                    <label className={fieldLabelCls}>City</label>
                                    <CityAutocomplete
                                        value={leg.city}
                                        onChange={(city) => updateLeg(i, { city })}
                                        countryCode={codeFor(leg.country)}
                                        placeholder="City name"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className={fieldLabelCls}>Arrival date <span className="text-red-400">*</span></label>
                                    <input
                                        type="date"
                                        min={maxIsoDate(
                                            minDate,
                                            i > 0
                                                ? (data.multiLegs?.[i - 1]?.arrivalDate ?? "").trim() || minDate
                                                : minDate
                                        )}
                                        value={leg.arrivalDate}
                                        onChange={(e) => updateLeg(i, { arrivalDate: e.target.value })}
                                        className={inputCls}
                                    />
                                </div>
                                <div>
                                    <label className={fieldLabelCls}>Nights <span className="text-red-400">*</span></label>
                                    <input
                                        type="text"
                                        value={leg.nights}
                                        onChange={(e) => updateLeg(i, { nights: e.target.value })}
                                        placeholder="e.g. 5"
                                        className={inputCls}
                                    />
                                </div>
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

                    <div className="p-4 rounded-xl border border-border-light/60 bg-white space-y-3">
                        <div>
                            <label className={fieldLabelCls}>Final return destination</label>
                            <input
                                type="text"
                                value={data.multiFinalReturnDestination ?? ""}
                                onChange={(e) => update({ multiFinalReturnDestination: e.target.value })}
                                placeholder="e.g. same as departure"
                                className={inputCls}
                            />
                        </div>
                        <div>
                            <label className={fieldLabelCls}>Overall return date</label>
                            <input
                                type="date"
                                min={maxIsoDate(
                                    minDate,
                                    (() => {
                                        const legs = data.multiLegs ?? [];
                                        const last = legs.length > 0 ? (legs[legs.length - 1]?.arrivalDate ?? "").trim() : "";
                                        return last || minDate;
                                    })()
                                )}
                                value={data.multiOverallReturnDate ?? ""}
                                onChange={(e) => update({ multiOverallReturnDate: e.target.value })}
                                className={inputCls}
                            />
                            {(() => {
                                const legs = data.multiLegs ?? [];
                                const anchor =
                                    legs.length > 0 ? (legs[legs.length - 1]?.arrivalDate ?? "").trim() : "";
                                return anchor ?
                                        <div className="mt-2 flex flex-wrap items-center gap-1.5">
                                            <span className="text-[11px] font-medium text-muted">From last arrival:</span>
                                            {([7, 14, 21] as const).map((d) => (
                                                <button
                                                    key={d}
                                                    type="button"
                                                    onClick={() =>
                                                        update({
                                                            multiOverallReturnDate: addCalendarDaysToIsoDate(anchor, d),
                                                        })
                                                    }
                                                    className="rounded-lg border border-border-light/80 bg-white px-2.5 py-1 text-[11px] font-semibold text-body hover:border-accent hover:text-accent transition-colors cursor-pointer"
                                                >
                                                    +{d}d
                                                </button>
                                            ))}
                                        </div>
                                    :   null;
                            })()}
                        </div>
                    </div>
                </motion.div>
            )}

            {/* ── Transit ── */}
            {data.tripType === "transit" && (
                <motion.div key="transit" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-3 lg:gap-4 lg:items-start">
                        <div className="space-y-3 rounded-xl border border-border-light/50 bg-white/50 p-3">
                            <p className={`${fieldLabelCls} mb-0`}>
                                Departing from <span className="text-muted">(city/airport)</span>{" "}
                                <span className="text-red-400">*</span>
                            </p>
                            <div>
                                <label className={fieldLabelCls}>Country</label>
                                <CountryPicker
                                    value={data.transitFromCountry ?? ""}
                                    onChange={(name) => update({ transitFromCountry: name })}
                                    placeholder="Country"
                                    inputClassName={`${inputCls} pr-10`}
                                />
                            </div>
                            <div>
                                <label className={fieldLabelCls}>City</label>
                                <CityAutocomplete
                                    value={data.transitFromCity ?? ""}
                                    onChange={(city) => update({ transitFromCity: city })}
                                    countryCode={codeFor(data.transitFromCountry)}
                                    placeholder="e.g. London Heathrow"
                                    withIcon
                                />
                            </div>
                        </div>
                        <div className="flex justify-center items-center text-muted/40 text-2xl py-1 lg:py-0 lg:pt-10 shrink-0">
                            <span className="lg:hidden" aria-hidden>
                                ↓
                            </span>
                            <span className="hidden lg:inline" aria-hidden>
                                →
                            </span>
                        </div>
                        <div className="space-y-3 rounded-xl border border-border-light/50 bg-white/50 p-3">
                            <p className={`${fieldLabelCls} mb-0`}>
                                Final destination <span className="text-red-400">*</span>
                            </p>
                            <div>
                                <label className={fieldLabelCls}>Country</label>
                                <CountryPicker
                                    value={data.transitFinalDestination ?? ""}
                                    onChange={(name) => update({ transitFinalDestination: name })}
                                    placeholder="Destination country"
                                    inputClassName={`${inputCls} pr-10`}
                                />
                            </div>
                            <div>
                                <label className={fieldLabelCls}>City</label>
                                <CityAutocomplete
                                    value={data.transitFinalDestinationCity ?? ""}
                                    onChange={(city) => update({ transitFinalDestinationCity: city })}
                                    countryCode={codeFor(data.transitFinalDestination)}
                                    placeholder="e.g. Nairobi"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="p-4 rounded-xl border border-border-light/60 bg-white space-y-4">
                        <div className="flex items-center gap-2">
                            <LucideClock className="w-4 h-4 text-accent" />
                            <h4 className="text-sm font-bold text-heading">Transit</h4>
                        </div>
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
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className={fieldLabelCls}>Departure date <span className="text-red-400">*</span></label>
                                <input
                                    type="date"
                                    min={minDate}
                                    value={data.transitDepartureDate ?? ""}
                                    onChange={(e) => update({ transitDepartureDate: e.target.value })}
                                    className={inputCls}
                                />
                            </div>
                            <div>
                                <label className={fieldLabelCls}>Return date</label>
                                <input
                                    type="date"
                                    min={maxIsoDate(minDate, (data.transitDepartureDate ?? "").trim() || minDate)}
                                    value={data.transitReturnDate ?? ""}
                                    onChange={(e) => update({ transitReturnDate: e.target.value })}
                                    className={inputCls}
                                />
                                {(data.transitDepartureDate ?? "").trim() ?
                                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                                        <span className="text-[11px] font-medium text-muted">Quick:</span>
                                        {([1, 2, 7] as const).map((d) => (
                                            <button
                                                key={d}
                                                type="button"
                                                onClick={() =>
                                                    update({
                                                        transitReturnDate: addCalendarDaysToIsoDate(
                                                            (data.transitDepartureDate ?? "").trim(),
                                                            d,
                                                        ),
                                                    })
                                                }
                                                className="rounded-lg border border-border-light/80 bg-white px-2.5 py-1 text-[11px] font-semibold text-body hover:border-accent hover:text-accent transition-colors cursor-pointer"
                                            >
                                                +{d}d
                                            </button>
                                        ))}
                                    </div>
                                :   null}
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default TripItineraryFlow;
