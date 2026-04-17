import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import type { ReactNode } from "react";
import { canAccessHR, canAccessDashboard } from "../../lib/canAccessHr";

type AllowedSection = "dashboard" | "hr";

interface RoleGuardProps {
    children: ReactNode;
    section: AllowedSection;
    redirectTo?: string;
}

const RoleGuard = ({ children, section, redirectTo }: RoleGuardProps) => {
    const { user } = useAuth();

    if (!user) return <Navigate to="/login" replace />;

    const canUseDashboard = canAccessDashboard(user);
    const canUseHR = canAccessHR(user);

    // Prevent redirect ping-pong when role is missing/unknown.
    if (!canUseDashboard && !canUseHR) {
        return <Navigate to="/unauthorized" replace />;
    }

    if (section === "dashboard" && !canUseDashboard) {
        return <Navigate to={redirectTo ?? (canUseHR ? "/hr" : "/unauthorized")} replace />;
    }

    if (section === "hr" && !canUseHR) {
        return <Navigate to={redirectTo ?? (canUseDashboard ? "/dashboard" : "/unauthorized")} replace />;
    }

    return <>{children}</>;
};

export default RoleGuard;
