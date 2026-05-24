import type { TripItineraryData } from "./TripItineraryFlow";
import { compareIsoDates, isIsoDateString, todayIsoDateLocal } from "../../lib/questionnaireFieldValidation";

/** Latest of two ISO date strings. */
export function maxIsoDate(a: string, b: string): string {
    return compareIsoDates(a, b) >= 0 ? a : b;
}

/**
 * Returns an error message if trip dates are invalid, or null if OK.
 * Expects hydrated itinerary data when loading legacy drafts (callers should use hydrateLegacyTripItinerary first).
 */
export function validateTripItineraryDates(data: TripItineraryData | undefined): string | null {
    if (!data?.tripType) return "Please complete your trip details.";

    const today = todayIsoDateLocal();

    const gteToday = (label: string, d: string | undefined, required: boolean): string | null => {
        const v = d?.trim() ?? "";
        if (!required && !v) return null;
        if (!v) return `${label} is required.`;
        if (!isIsoDateString(v)) return `Please enter a valid ${label}.`;
        if (compareIsoDates(v, today) < 0) return `${label} cannot be in the past.`;
        return null;
    };

    const gte = (a: string | undefined, b: string | undefined, message: string): string | null => {
        const x = a?.trim() ?? "";
        const y = b?.trim() ?? "";
        if (!x || !y || !isIsoDateString(x) || !isIsoDateString(y)) return null;
        if (compareIsoDates(y, x) < 0) return message;
        return null;
    };

    if (data.tripType === "one-way") {
        return gteToday("Departure date", data.oneDepartureDate, true);
    }

    if (data.tripType === "return") {
        const d1 = gteToday("Outbound departure date", data.returnDepartureDate, true);
        if (d1) return d1;
        const d2 = gteToday("Return date", data.returnReturnDate, true);
        if (d2) return d2;
        const order = gte(
            data.returnDepartureDate,
            data.returnReturnDate,
            "Return date must be on or after the outbound departure date."
        );
        if (order) return order;
        return null;
    }

    if (data.tripType === "multi") {
        const legs = data.multiLegs ?? [];
        let prev = "";
        for (let i = 0; i < legs.length; i++) {
            const leg = legs[i];
            const label = `Stop ${i + 1} arrival date`;
            const err = gteToday(label, leg.arrivalDate, true);
            if (err) return err;
            const arr = leg.arrivalDate?.trim() ?? "";
            if (prev && arr && isIsoDateString(prev) && isIsoDateString(arr)) {
                if (compareIsoDates(arr, prev) < 0) {
                    return "Each stop's arrival date must be on or after the previous stop's arrival date.";
                }
            }
            prev = arr;
        }
        const lastLeg = legs.length > 0 ? legs[legs.length - 1]?.arrivalDate?.trim() ?? "" : "";
        const overall = data.multiOverallReturnDate?.trim() ?? "";
        if (overall) {
            if (!isIsoDateString(overall)) return "Please enter a valid overall return date.";
            if (compareIsoDates(overall, today) < 0) return "Overall return date cannot be in the past.";
            if (lastLeg && isIsoDateString(lastLeg) && compareIsoDates(overall, lastLeg) < 0) {
                return "Overall return date must be on or after your last stop's arrival date.";
            }
        }
        return null;
    }

    if (data.tripType === "transit") {
        const t1 = gteToday("Departure date", data.transitDepartureDate, true);
        if (t1) return t1;
        const ret = data.transitReturnDate?.trim() ?? "";
        if (ret) {
            if (!isIsoDateString(ret)) return "Please enter a valid return date.";
            if (compareIsoDates(ret, today) < 0) return "Return date cannot be in the past.";
            const dep = data.transitDepartureDate?.trim() ?? "";
            if (dep && isIsoDateString(dep) && compareIsoDates(ret, dep) < 0) {
                return "Return date must be on or after the departure date.";
            }
        }
        return null;
    }

    return null;
}

export function getTripItineraryMissingFieldError(data: TripItineraryData | undefined): string | null {
    if (!data?.tripType) return "Please select a trip type.";
    
    if (data.tripType === "one-way") {
        if (!data.oneFromCountry?.trim()) return "Please select an origin country for your trip.";
        if (!data.oneFromCity?.trim()) return "Please enter an origin city for your trip.";
        if (!data.oneTo?.trim()) return "Please select a destination country for your trip.";
        if (!data.oneToCity?.trim()) return "Please enter a destination city for your trip.";
        if (!data.oneDepartureDate?.trim()) return "Please select a departure date for your trip.";
        if (!data.oneNumberOfFlights?.trim()) return "Please enter the number of flights for your trip.";
    } else if (data.tripType === "return") {
        if (!data.returnFromCountry?.trim()) return "Please select an origin country for your return trip.";
        if (!data.returnFromCity?.trim()) return "Please enter an origin city for your return trip.";
        if (!data.returnTo?.trim()) return "Please select a destination country for your return trip.";
        if (!data.returnToCity?.trim()) return "Please enter a destination city for your return trip.";
        if (!data.returnDepartureDate?.trim()) return "Please select a departure date for your return trip.";
        if (!data.returnReturnDate?.trim()) return "Please select a return date for your return trip.";
    } else if (data.tripType === "multi") {
        if (!data.multiDepartingFromCountry?.trim()) return "Please select an origin country for your multi-stop trip.";
        if (!data.multiDepartingFromCity?.trim()) return "Please enter an origin city for your multi-stop trip.";
        const legs = data.multiLegs ?? [];
        if (legs.length < 1) return "Please add at least one stop for your multi-stop trip.";
        for (let i = 0; i < legs.length; i++) {
            const leg = legs[i];
            if (!leg.country?.trim()) return "Please select a country for stop " + (i + 1) + ".";
            if (!leg.arrivalDate?.trim()) return "Please select an arrival date for stop " + (i + 1) + ".";
            if (!leg.nights?.trim()) return "Please enter the number of nights for stop " + (i + 1) + ".";
        }
    } else if (data.tripType === "transit") {
        if (!data.transitFromCountry?.trim()) return "Please select an origin country for your transit trip.";
        if (!data.transitFromCity?.trim()) return "Please enter an origin city for your transit trip.";
        if (!data.transitFinalDestination?.trim()) return "Please select a final destination country for your transit trip.";
        if (!data.transitFinalDestinationCity?.trim()) return "Please enter a final destination city for your transit trip.";
        if (!data.transitLocation?.trim()) return "Please select a transit country.";
        if (!data.transitDepartureDate?.trim()) return "Please select a departure date for your transit trip.";
        if (!data.transitDuration?.trim()) return "Please enter the transit duration.";
    }
    return null;
}
