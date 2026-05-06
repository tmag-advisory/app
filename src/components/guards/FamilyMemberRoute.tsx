import { Navigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import familyTripApi from "../../api/familyTrip";

export default function FamilyMemberRoute({ children }: { children?: React.ReactNode }) {
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("familyMemberToken");
    if (!token) {
      setIsChecking(false);
      return;
    }

    familyTripApi.getCurrentMember()
      .then(() => setIsAuthenticated(true))
      .catch(() => {
        localStorage.removeItem("familyMemberToken");
        setIsAuthenticated(false);
      })
      .finally(() => setIsChecking(false));
  }, []);

  if (isChecking) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/family/login" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}
