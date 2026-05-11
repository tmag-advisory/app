/** Join city + country for display and API payloads. */
export function mergeCityCountry(city: string | undefined, country: string | undefined): string {
    const c = (city ?? "").trim();
    const co = (country ?? "").trim();
    if (c && co) return `${c}, ${co}`;
    return c || co;
}

/**
 * Legacy single-field "departing from" may be city-only or "City, Country".
 * If a comma exists, split on the last ", " for a reasonable city vs country guess.
 */
export function splitLegacyDeparting(legacy: string | undefined): { city: string; country: string } {
    const t = (legacy ?? "").trim();
    if (!t) return { city: "", country: "" };
    const idx = t.lastIndexOf(", ");
    if (idx > 0 && idx < t.length - 2) {
        return {
            city: t.slice(0, idx).trim(),
            country: t.slice(idx + 2).trim(),
        };
    }
    return { city: t, country: "" };
}
