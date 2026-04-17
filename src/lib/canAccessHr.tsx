import type { AuthUser } from "../context/AuthContext";

const HR_ALLOWED_ROLES = ["superadmin", "admin", "hr"];
const DASHBOARD_ALLOWED_ROLES = ["superadmin", "admin", "individual"];

export function canAccessHR(user: AuthUser | null): boolean {
    if (!user) return false;
    return HR_ALLOWED_ROLES.includes(user.extend.role_name.toLowerCase());
}

export function canAccessDashboard(user: AuthUser | null): boolean {
    if (!user) return false;
    return DASHBOARD_ALLOWED_ROLES.includes(user.extend.role_name.toLowerCase());
}
