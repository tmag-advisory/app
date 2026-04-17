/** Parse YYYY-MM-DD as a local calendar date (no UTC shift). */
export function parseIsoDateOnly(iso: string): Date | null {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
        return null;
    }
    const [y, m, d] = iso.split("-").map(Number);
    const dt = new Date(y, m - 1, d);
    if (Number.isNaN(dt.getTime())) {
        return null;
    }
    if (dt.getFullYear() !== y || dt.getMonth() !== m - 1 || dt.getDate() !== d) {
        return null;
    }
    return dt;
}

/** Return date must be strictly after departure (same day is invalid). */
export function isReturnStrictlyAfterDeparture(departureIso: string, returnIso: string): boolean {
    const dep = parseIsoDateOnly(departureIso);
    const ret = parseIsoDateOnly(returnIso);
    if (!dep || !ret) {
        return false;
    }
    return ret.getTime() > dep.getTime();
}

/** Inclusive calendar days from departure through return; null if invalid. */
export function inclusiveDaysReturnTrip(departureIso: string, returnIso: string): number | null {
    if (!isReturnStrictlyAfterDeparture(departureIso, returnIso)) {
        return null;
    }
    const dep = parseIsoDateOnly(departureIso)!;
    const ret = parseIsoDateOnly(returnIso)!;
    return Math.round((ret.getTime() - dep.getTime()) / 86400000) + 1;
}

export function formatIsoDateLocal(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}

/** Minimum valid return date (day after departure) for `<input type="date" min="...">`. */
export function nextDayIso(departureIso: string): string | undefined {
    const dep = parseIsoDateOnly(departureIso);
    if (!dep) {
        return undefined;
    }
    const next = new Date(dep);
    next.setDate(next.getDate() + 1);
    return formatIsoDateLocal(next);
}

export function formatMediumDateFromIso(iso: string): string {
    const d = parseIsoDateOnly(iso);
    if (!d) {
        return iso;
    }
    return d.toLocaleDateString(undefined, { dateStyle: "medium" });
}
