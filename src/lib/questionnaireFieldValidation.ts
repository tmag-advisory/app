/** Today's date as YYYY-MM-DD in local timezone (matches `<input type="date">`). */
export function todayIsoDateLocal(): string {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}

export function isIsoDateString(s: string): boolean {
    return /^\d{4}-\d{2}-\d{2}$/.test(s.trim());
}

/** Compare ISO date strings; returns negative if a < b, 0 if equal, positive if a > b. */
export function compareIsoDates(a: string, b: string): number {
    return a.trim().localeCompare(b.trim());
}

/** True if value is a non-empty plausible non-negative number (integers or decimals). */
export function isValidOptionalNonNegativeNumber(raw: string): boolean {
    const t = raw.trim();
    if (!t) return false;
    const n = Number(t);
    return Number.isFinite(n) && n >= 0;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isPlausibleEmail(raw: string): boolean {
    const t = raw.trim();
    if (!t) return false;
    return EMAIL_RE.test(t);
}

/** Date of birth must not be in the future (compare to today local). */
export function isDateOfBirthPlausible(isoDate: string): boolean {
    if (!isIsoDateString(isoDate)) return false;
    return compareIsoDates(isoDate, todayIsoDateLocal()) <= 0;
}
