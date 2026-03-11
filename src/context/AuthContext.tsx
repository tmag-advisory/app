import {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    type ReactNode,
} from "react";
import type { BillingCurrency, LoginRequest, RegisterRequest } from "../api/types";
import { canAccessHR } from "../lib/canAccessHr";
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
    last_login: string;
    onboarding_stage: number;
    is_verified: boolean;
    credits: number;
    billing_currency: BillingCurrency;
    extend: AuthRole;
}



interface AuthContextValue {
    user: AuthUser | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (data: LoginRequest) => Promise<AuthUser>;
    register: (data: Partial<RegisterRequest>) => Promise<AuthUser>;
    logout: () => Promise<void>;
    canAccessHR: boolean;
    refreshProfile: () => Promise<void>;
}

// ─── Context ─────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

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

    const login = useCallback(async (data: LoginRequest): Promise<AuthUser> => {
        const res = await api.post("/auth/login", data);
        const d = res.data.data;
        setAuthCookie(d.accessToken, d.exp);

        const authUser = buildAuthUserFromLogin(d);
        setUser(authUser);
        return authUser;
    }, []);

    const register = useCallback(async (data: Partial<RegisterRequest>): Promise<AuthUser> => {
        const res = await api.post("/auth/register", data);
        const d = res.data.data;
        setAuthCookie(d.accessToken, d.exp);
        const authUser = buildAuthUserFromLogin(d);
        setUser(authUser);
        return authUser;
    }, []);

    const logout = useCallback(async () => {
        try {
            await api.post("/auth/logout");
        } catch {
            // ignore logout failure
        }
        removeAuthCookie();
        setUser(null);
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

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: user !== null,
                isLoading,
                login,
                register,
                logout,
                canAccessHR: canAccessHR(user),
                refreshProfile,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = (): AuthContextValue => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
    return ctx;
}

// ─── Helpers ─────────────────────────────────────────────────

function buildAuthUser(d: Record<string, unknown>): AuthUser {
    const extend = d.extend as { role_id?: number; role_name?: string } | undefined;

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
        last_login: (d.last_login as string) ?? "",
        extend: {
            role_id: extend?.role_id ?? 0,
            role_name: extend?.role_name ?? "",
        },
    };
}

// Login/register responses include extend.role
function buildAuthUserFromLogin(d: Record<string, unknown>): AuthUser {
    const extend = d.extend as { role_id?: number; role_name?: string } | undefined;

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
        last_login: (d.last_login as string) ?? "",
        extend: {
            role_id: extend?.role_id ?? 0,
            role_name: extend?.role_name ?? "",
        },
    };
}
