import type { AuthUser } from "../context/AuthContext";

// Roles allowed to access the HR dashboard
const HR_ALLOWED_ROLES = ["SuperAdmin", "Admin", "HR"];

export function canAccessHR(user: AuthUser | null): boolean {
    if (!user) return false;
    return HR_ALLOWED_ROLES.includes(user.role.name);
}
