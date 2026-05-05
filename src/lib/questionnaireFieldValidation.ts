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

/**
 * Inclusive count of calendar days between two YYYY-MM-DD strings.
 * Uses local date arithmetic so values match `<input type="date">` (avoids UTC midnight skew).
 */
export function daysInclusiveBetweenIso(start?: string, end?: string): number {
    const s = start?.trim() ?? "";
    const t = end?.trim() ?? "";
    if (!isIsoDateString(s) || !isIsoDateString(t)) return 0;
    if (compareIsoDates(t, s) < 0) return 0;
    const p0 = s.split("-").map((x) => parseInt(x, 10));
    const p1 = t.split("-").map((x) => parseInt(x, 10));
    const d0 = new Date(p0[0]!, p0[1]! - 1, p0[2]!);
    const d1 = new Date(p1[0]!, p1[1]! - 1, p1[2]!);
    if (Number.isNaN(d0.getTime()) || Number.isNaN(d1.getTime())) return 0;
    const diff = Math.round((d1.getTime() - d0.getTime()) / 86400000) + 1;
    return diff > 0 ? diff : 0;
}

/** Returns isoDate + wholeDays as YYYY-MM-DD (local calendar). */
export function addCalendarDaysToIsoDate(isoDate: string, wholeDays: number): string {
    if (!isIsoDateString(isoDate)) return isoDate;
    const p = isoDate.trim().split("-").map((x) => parseInt(x, 10));
    const d = new Date(p[0]!, p[1]! - 1, p[2]!);
    d.setDate(d.getDate() + wholeDays);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
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
