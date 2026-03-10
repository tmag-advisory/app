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

    if (section === "dashboard" && !canAccessDashboard(user)) {
        return <Navigate to={redirectTo ?? "/hr"} replace />;
    }

    if (section === "hr" && !canAccessHR(user)) {
        return <Navigate to={redirectTo ?? "/dashboard"} replace />;
    }

    return <>{children}</>;
};

export default RoleGuard;
