import {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    useMemo,
    type ReactNode,
} from "react";
import type { AuthResponse, BillingCurrency, LoginRequest, ProfilePictureOption, RegisterRequest } from "../api/types";
import { canAccessHR, canAccessDoctor } from "../lib/canAccessHr";
import api, { getAuthCookie, removeAuthCookie, setAuthCookie } from "../api/axios";
import { queryclient } from "../lib/queryclient";


// ─── Types ───────────────────────────────────────────────────

export interface AuthRole {
    role_id: number;
    role_name: string;
}


export interface AuthUser {
    id: number;
    first_name: string;
    last_name: string;
    username: string;
    phone: string;
    email: string;
    avatar_url: string;
    profile_picture_option?: ProfilePictureOption | null;
    last_login: string;
    onboarding_stage: number;
    is_verified: boolean;
    credits: number;
    billing_currency: BillingCurrency;
    extend: AuthRole;
    user_credit_plan?: import("../api/types").CreditPlan | null;
    settings?: import("../api/types").UserSettingResponse;
    consentValid?: boolean;
    type?: string | null;
    redirect_to?: string | null;
    redirect_message?: string | null;
    two_factor_enabled?: boolean;
    two_factor_method?: import("../api/types").TwoFactorMethod;
}



interface AuthContextValue {
    user: AuthUser | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    passwordExpired: boolean;
    login: (data: LoginRequest) => Promise<AuthResponse>;
    register: (data: Partial<RegisterRequest>) => Promise<AuthUser>;
    setAuthFromResponse: (data: Record<string, unknown>) => AuthUser;
    completeAuthFromResponse: (resp: AuthResponse) => AuthUser;
    clearPasswordExpired: () => void;
    logout: () => Promise<void>;
    canAccessHR: boolean;
    canAccessDoctor: boolean;
    refreshProfile: () => Promise<void>;
}

// ─── Context ─────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [passwordExpired, setPasswordExpired] = useState(false);

    // Revalidate session on mount / page reload via GET /profile
    const getCurrentProfile = useCallback(async () => {
        const token = getAuthCookie();
        if (!token) {
            setIsLoading(false);
            return;
        }
        try {
            const res = await api.get("/profile");
            const d = res.data.data
            setUser(buildAuthUser(d));
        } catch {
            removeAuthCookie();
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        void getCurrentProfile();
    }, [getCurrentProfile]);

    const login = useCallback(async (data: LoginRequest): Promise<AuthResponse> => {
        const res = await api.post("/auth/login", data);
        // Return the raw AuthResponse so the caller can branch on 2FA / password flags
        // before any session is established. No cookie/user is set here.
        return res.data.data as AuthResponse;
    }, []);

    const register = useCallback(async (data: Partial<RegisterRequest>): Promise<AuthUser> => {
        const res = await api.post("/auth/register", data);
        const d = res.data.data;
        setAuthCookie(d.accessToken, d.exp);
        const authUser = buildAuthUserFromLogin(d);
        setUser(authUser);
        setPasswordExpired(!!d.password_expired);
        return authUser;
    }, []);

    const setAuthFromResponse = useCallback((d: Record<string, unknown>): AuthUser => {
        setAuthCookie(d.accessToken as string, d.exp as number);
        const authUser = buildAuthUserFromLogin(d);
        setUser(authUser);
        setPasswordExpired(!!d.password_expired);
        return authUser;
    }, []);

    // Establishes the session once an access token has been issued (normal login
    // path and after a successful 2FA verify). Tracks password_expired for gating.
    const completeAuthFromResponse = useCallback((resp: AuthResponse): AuthUser => {
        setAuthCookie(resp.accessToken, resp.exp);
        const authUser = buildAuthUserFromLogin(resp as unknown as Record<string, unknown>);
        setUser(authUser);
        setPasswordExpired(!!resp.password_expired);
        return authUser;
    }, []);

    const clearPasswordExpired = useCallback(() => setPasswordExpired(false), []);

    const logout = useCallback(async () => {
        try {
            await api.post("/auth/logout");
        } catch {
            // ignore logout failure
        }
        removeAuthCookie();
        setUser(null);
        setPasswordExpired(false);
        queryclient.clear();
    }, []);

    const refreshProfile = useCallback(async () => {
        try {
            const res = await api.get("/profile");
            const d = res.data.data;
            setUser(buildAuthUser(d));
        } catch (error) {
            console.error("Failed to refresh profile:", error);
        }
    }, []);

    const authContextValue = useMemo<AuthContextValue>(() => ({
        user,
        isAuthenticated: user !== null,
        isLoading,
        passwordExpired,
        login,
        register,
        setAuthFromResponse,
        completeAuthFromResponse,
        clearPasswordExpired,
        logout,
        canAccessHR: canAccessHR(user),
        canAccessDoctor: canAccessDoctor(user),
        refreshProfile,
    }), [user, isLoading, passwordExpired, login, register, setAuthFromResponse, completeAuthFromResponse, clearPasswordExpired, logout, refreshProfile]);

    return (
        <AuthContext.Provider
            value={authContextValue}
        >
            {children}
        </AuthContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = (): AuthContextValue => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
    return ctx;
}

// ─── Helpers ─────────────────────────────────────────────────

function buildAuthUser(d: Record<string, unknown>): AuthUser {
    const extend = extractRole(d);
    const settings = d.settings as import("../api/types").UserSettingResponse | undefined;

    return {
        id: d.id as number,
        first_name: (d.first_name as string) ?? "",
        last_name: (d.last_name as string) ?? "",
        username: (d.username as string) ?? "",
        phone: (d.phone as string) ?? "",
        email: (d.email as string) ?? "",
        onboarding_stage: (d.onboarding_stage as number) ?? 0,
        is_verified: (d.is_verified as boolean) ?? false,
        credits: (d.credits as number) ?? 0,
        billing_currency: ((d.billing_currency as BillingCurrency) ?? "NGN"),
        avatar_url: (d.avatar_url as string) ?? "",
        profile_picture_option: (d.profile_picture_option as ProfilePictureOption | null) ?? null,
        last_login: (d.last_login as string) ?? "",
        extend: {
            role_id: extend?.role_id ?? 0,
            role_name: extend?.role_name ?? "",
        },
        user_credit_plan: (d.userCreditPlan ?? d.user_credit_plan) as import("../api/types").CreditPlan | null ?? null,
        settings: settings ?? undefined,
        consentValid: !!(settings?.consentAcceptedByVersion != null
            && settings?.consentVersion != null
            && settings.consentAcceptedByVersion >= settings.consentVersion),
        type: (d.type as string | null) ?? null,
        redirect_to: (d.redirect_to as string | null) ?? null,
        redirect_message: (d.redirect_message as string | null) ?? null,
        two_factor_enabled: d.two_factor_enabled as boolean | undefined,
        two_factor_method: d.two_factor_method as import("../api/types").TwoFactorMethod | undefined,
    };
}

// Login/register responses include extend.role
function buildAuthUserFromLogin(d: Record<string, unknown>): AuthUser {
    const extend = extractRole(d);
    const settings = d.settings as import("../api/types").UserSettingResponse | undefined;

    return {
        id: d.id as number,
        first_name: (d.first_name as string) ?? "",
        last_name: (d.last_name as string) ?? "",
        username: (d.username as string) ?? "",
        phone: (d.phone as string) ?? "",
        email: (d.email as string) ?? "",
        onboarding_stage: (d.onboarding_stage as number) ?? 0,
        is_verified: (d.is_verified as boolean) ?? false,
        credits: (d.credits as number) ?? 0,
        billing_currency: ((d.billing_currency as BillingCurrency) ?? "NGN"),
        avatar_url: (d.avatar_url as string) ?? "",
        profile_picture_option: (d.profile_picture_option as ProfilePictureOption | null) ?? null,
        last_login: (d.last_login as string) ?? "",
        extend: {
            role_id: extend?.role_id ?? 0,
            role_name: extend?.role_name ?? "",
        },
        user_credit_plan: (d.userCreditPlan ?? d.user_credit_plan) as import("../api/types").CreditPlan | null ?? null,
        settings: settings ?? undefined,
        consentValid: !!(settings?.consentAcceptedByVersion != null
            && settings?.consentVersion != null
            && settings.consentAcceptedByVersion >= settings.consentVersion),
        type: (d.type as string | null) ?? null,
        redirect_to: (d.redirect_to as string | null) ?? null,
        redirect_message: (d.redirect_message as string | null) ?? null,
    };
}

function extractRole(d: Record<string, unknown>): { role_id?: number; role_name?: string } {
    const directExtend = d.extend as { role_id?: number; role_name?: string } | undefined;
    if (directExtend?.role_name || directExtend?.role_id) {
        return directExtend;
    }

    const directRole = d.role as { role_id?: number; role_name?: string } | undefined;
    if (directRole?.role_name || directRole?.role_id) {
        return directRole;
    }

    const nestedUser = d.user as Record<string, unknown> | undefined;
    const nestedExtend = nestedUser?.extend as { role_id?: number; role_name?: string } | undefined;
    if (nestedExtend?.role_name || nestedExtend?.role_id) {
        return nestedExtend;
    }

    const nestedRole = nestedUser?.role as { role_id?: number; role_name?: string } | undefined;
    if (nestedRole?.role_name || nestedRole?.role_id) {
        return nestedRole;
    }

    return {};
}
