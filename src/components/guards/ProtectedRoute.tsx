import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import type { ReactNode } from "react";

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
    const { isAuthenticated, isLoading, passwordExpired } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background-primary">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Forced password change blocks every protected route until resolved.
    if (passwordExpired && location.pathname !== "/change-password") {
        return <Navigate to="/change-password" replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
