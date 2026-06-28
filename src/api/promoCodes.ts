import api from "./axios";
import type { ApiResponse } from "./types";

export type PromoAudience = "individual" | "family" | "company";
export type PromoTier = "STANDARD" | "PREMIUM";

export interface PromoCode {
    code: string;
    audience: PromoAudience;
    tier: PromoTier;
    cap: number;
    redeemed: number;
    expires_at: string; // ISO
    active: boolean;
    listed: boolean; // false for TMAGPREMIER (issued manually)
}

export interface PromoValidateResponse {
    valid: boolean;
    reason?:
        | "not_found"
        | "expired"
        | "cap_reached"
        | "wrong_audience"
        | "inactive";
    code?: PromoCode;
}

export interface PromoRedemption {
    id: number;
    code: string;
    user_id: number | null;
    user_email: string | null;
    audience: PromoAudience;
    tier_granted: PromoTier;
    source: string; // "register" | "buy-additional-plan" | "family-checkout" | "hr-billing"
    redeemed_at: string;
}

export interface PromoStats {
    codes: (PromoCode & { remaining: number })[];
    totals: {
        cap: number;
        redeemed: number;
        remaining: number;
    };
    recent_redemptions: PromoRedemption[];
    redemptions_by_day: { date: string; count: number }[];
}

/**
 * Validate a promo code against the audience the user is in.
 * Backend contract: GET /public/promo/validate?code=...&audience=...
 */
export async function validatePromoCode(
    code: string,
    audience: PromoAudience,
): Promise<PromoValidateResponse> {
    const res = await api.get<ApiResponse<PromoValidateResponse>>(
        `/public/promo/validate`,
        { params: { code: code.trim().toUpperCase(), audience } },
    );
    return res.data.data;
}

/**
 * Admin-only: list all promo codes + redemption analytics.
 * Backend contract: GET /admin/promo-codes/stats
 */
export async function getPromoStats(): Promise<PromoStats> {
    const res = await api.get<ApiResponse<PromoStats>>(
        `/admin/promo-codes/stats`,
    );
    return res.data.data;
}

// ─── Session storage helpers (passed into the form submission of each flow) ───

const STORAGE_KEY = "tmag_promo_code";

export function setPendingPromoCode(code: string): void {
    try {
        sessionStorage.setItem(STORAGE_KEY, code.trim().toUpperCase());
    } catch {
        /* ignore */
    }
}

export function getPendingPromoCode(): string | undefined {
    try {
        return sessionStorage.getItem(STORAGE_KEY) || undefined;
    } catch {
        return undefined;
    }
}

export function clearPendingPromoCode(): void {
    try {
        sessionStorage.removeItem(STORAGE_KEY);
    } catch {
        /* ignore */
    }
}
