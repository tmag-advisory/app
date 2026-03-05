import {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    type ReactNode,
} from "react";
import type { LoginRequest, RegisterRequest } from "../api/types";
import { canAccessHR } from "../lib/canAccessHr";
import api, { getAuthCookie, removeAuthCookie, setAuthCookie } from "../api/axios";

// ─── Types ───────────────────────────────────────────────────

export interface AuthRole {
    id: number;
    name: string;
}

export interface AuthUser {
    id: number;
    first_name: string;
    last_name: string;
    username: string;
    phone: string;
    email: string;
    role_id: number;
    role_name: string;
    avatar_url: string;
    last_login: string;
    role: AuthRole;
}



interface AuthContextValue {
    user: AuthUser | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (data: LoginRequest) => Promise<AuthUser>;
    register: (data: RegisterRequest) => Promise<AuthUser>;
    logout: () => Promise<void>;
    canAccessHR: boolean;
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
            const d = res.data;
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
        const d = res.data;

        setAuthCookie(d.accessToken, d.exp);

        const authUser = buildAuthUserFromLogin(d);
        setUser(authUser);
        return authUser;
    }, []);

    const register = useCallback(async (data: RegisterRequest): Promise<AuthUser> => {
        const res = await api.post("/auth/register", data);
        const d = res.data;

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
    return {
        id: d.id as number,
        first_name: (d.first_name as string) ?? "",
        last_name: (d.last_name as string) ?? "",
        username: (d.username as string) ?? "",
        phone: (d.phone as string) ?? "",
        email: (d.email as string) ?? "",
        role_id: (d.role_id as number) ?? 0,
        role_name: (d.role_name as string) ?? "",
        avatar_url: (d.avatar_url as string) ?? "",
        last_login: (d.last_login as string) ?? "",
        role: {
            id: (d.role_id as number) ?? 0,
            name: (d.role_name as string) ?? "",
        },
    };
}

// Login/register responses include extend.role
function buildAuthUserFromLogin(d: Record<string, unknown>): AuthUser {
    const extend = d.extend as { role?: { id: number; name: string } } | undefined;
    const role: AuthRole = extend?.role ?? {
        id: (d.role_id as number) ?? 0,
        name: (d.role_name as string) ?? "",
    };

    return {
        id: d.id as number,
        first_name: (d.first_name as string) ?? "",
        last_name: (d.last_name as string) ?? "",
        username: (d.username as string) ?? "",
        phone: (d.phone as string) ?? "",
        email: (d.email as string) ?? "",
        role_id: role.id,
        role_name: role.name,
        avatar_url: (d.avatar_url as string) ?? "",
        last_login: (d.last_login as string) ?? "",
        role,
    };
}
