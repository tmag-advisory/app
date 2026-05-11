import Cookies from "js-cookie";
import api from "../api/axios";
import type { ApiResponse } from "../api/types";

export const AFFILIATE_REFERRAL_COOKIE = "affiliate_referral_code";
const AFFILIATE_DISCOUNT_COOKIE = "affiliate_discount_rate";
const DEFAULT_COOKIE_DAYS = 90;

export interface AffiliateTrackingResponse {
    short_code: string | null;
    referral_code: string;
    destination_url: string;
    discount_rate: number;
    cookie_days: number;
}

export interface AffiliateDiscountResponse {
    active: boolean;
    short_code: string | null;
    referral_code: string | null;
    discount_rate: number;
}

export function getAffiliateReferralCode(): string | undefined {
    return Cookies.get(AFFILIATE_REFERRAL_COOKIE);
}

export function getStoredAffiliateDiscountRate(): number {
    const value = Cookies.get(AFFILIATE_DISCOUNT_COOKIE);
    const parsed = value ? Number(value) : 0;
    return Number.isFinite(parsed) ? parsed : 0;
}

function setAffiliateCookies(referralCode: string, discountRate: number, days = DEFAULT_COOKIE_DAYS): void {
    Cookies.set(AFFILIATE_REFERRAL_COOKIE, referralCode, {
        path: "/",
        expires: days,
        sameSite: "Lax",
    });
    Cookies.set(AFFILIATE_DISCOUNT_COOKIE, String(discountRate), {
        path: "/",
        expires: days,
        sameSite: "Lax",
    });
}

export async function trackAffiliateReferral(shortCode: string): Promise<AffiliateTrackingResponse> {
    const res = await api.get<ApiResponse<AffiliateTrackingResponse>>(
        `/public/affiliate/track/${encodeURIComponent(shortCode)}`,
    );
    const data = res.data.data;
    setAffiliateCookies(data.short_code || data.referral_code, Number(data.discount_rate), data.cookie_days);
    return data;
}

export async function refreshAffiliateDiscount(overrideCode?: string): Promise<AffiliateDiscountResponse | null> {
    const referralCode = overrideCode ?? getAffiliateReferralCode();
    if (!referralCode) return null;

    const res = await api.get<ApiResponse<AffiliateDiscountResponse>>(
        `/public/affiliate/discount/${encodeURIComponent(referralCode)}`,
    );
    const data = res.data.data;
    if (data.active) {
        setAffiliateCookies(data.short_code || data.referral_code || referralCode, Number(data.discount_rate));
    }
    return data;
}
