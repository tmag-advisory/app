import { Navigate } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import type { UserType } from "../../stores/authStore";
import type { ReactNode } from "react";

interface RoleGuardProps {
    children: ReactNode;
    allowedType: UserType;
    redirectTo?: string;
}

const RoleGuard = ({ children, allowedType, redirectTo }: RoleGuardProps) => {
    const user = useAuthStore((s) => s.user);

    if (!user) return <Navigate to="/login" replace />;

    if (user.type !== allowedType) {
        const fallback =
            redirectTo ?? (user.type === "company" ? "/hr" : "/dashboard");
        return <Navigate to={fallback} replace />;
    }

    return <>{children}</>;
};

export default RoleGuard;
