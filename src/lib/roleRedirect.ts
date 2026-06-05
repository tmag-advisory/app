import type { NavigateFunction } from "react-router-dom";
import type { AuthUser } from "../context/AuthContext";
import { canAccessDashboard, canAccessHR, canAccessDoctor } from "./canAccessHr";

type RedirectDestination =
    | { type: "external"; url: string }
    | { type: "internal"; path: string };

const SUPER_ADMIN_DASHBOARD_URL = import.meta.env.VITE_SUPER_ADMIN_DASHBOARD_URL?.trim();
const ADMIN_DASHBOARD_URL = import.meta.env.VITE_ADMIN_DASHBOARD_URL?.trim();

function getNormalizedRole(user: AuthUser | null): string {
    return user?.extend?.role_name?.toLowerCase().trim() ?? "";
}

function getExternalRedirect(role: string): RedirectDestination | null {
    if (role === "superadmin" && SUPER_ADMIN_DASHBOARD_URL) {
        return { type: "external", url: SUPER_ADMIN_DASHBOARD_URL };
    }

    if (role === "admin" && ADMIN_DASHBOARD_URL) {
        return { type: "external", url: ADMIN_DASHBOARD_URL };
    }

    return null;
}

export function getPostAuthRedirect(user: AuthUser): RedirectDestination {
    const role = getNormalizedRole(user);
    const externalRedirect = getExternalRedirect(role);

    if (externalRedirect) {
        return externalRedirect;
    }

    if (canAccessDoctor(user)) {
        return { type: "internal", path: "/doctor" };
    }

    if (canAccessDashboard(user)) {
        return { type: "internal", path: "/dashboard" };
    }

    if (canAccessHR(user)) {
        return { type: "internal", path: "/hr" };
    }

    return { type: "internal", path: "/unauthorized" };
}

export function getOnboardingCompletionRedirect(
    user: AuthUser | null,
    userType: "individual" | "company" | null
): RedirectDestination {
    const role = getNormalizedRole(user);
    const externalRedirect = getExternalRedirect(role);

    if (externalRedirect) {
        return externalRedirect;
    }

    if (canAccessDoctor(user)) {
        return { type: "internal", path: "/doctor" };
    }

    return { type: "internal", path: userType === "company" ? "/hr" : "/onboarding/questionnaire" };
}

export function performRedirect(destination: RedirectDestination, navigate: NavigateFunction, replace = false): void {
    if (destination.type === "external") {
        window.location.assign(destination.url);
        return;
    }

    navigate(destination.path, { replace });
}

/**
 * Normal post-authentication navigation (after a session has been established and
 * any 2FA / forced-password-change / different-portal handling is done by the caller).
 * Mirrors the branching the login page has always used: honor an explicit `redirect`
 * query param, otherwise route by onboarding stage / verification / role.
 */
export function navigateAfterAuth(
    user: AuthUser,
    navigate: NavigateFunction,
    redirect?: string | null,
): void {
    if (redirect?.startsWith("/") && !redirect.startsWith("//")) {
        navigate(redirect, { replace: true });
        return;
    }
    if (user.onboarding_stage > 4) {
        performRedirect(getPostAuthRedirect(user), navigate);
    } else if (!user.is_verified) {
        navigate(`/verify-email?email=${encodeURIComponent(user.email)}`);
    } else {
        navigate("/onboarding");
    }
}
