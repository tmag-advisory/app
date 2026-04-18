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

    if (data.tripType === "one") {
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
