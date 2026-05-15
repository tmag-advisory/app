import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { LucideLogOut, LucideArrowRight, LucideFileText } from "lucide-react";
import familyTripApi, { type FamilyMemberSession } from "../../api/familyTrip";
import { DASHBOARD_GLASS_SURFACE } from "../../components/dashboard/dashboardChrome";
import { cn } from "../../lib/utils";

export default function FamilyDashboard() {
  const [member, setMember] = useState<FamilyMemberSession | null>(null);
  const [plans, setPlans] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [meRes, plansRes] = await Promise.all([
          familyTripApi.getCurrentMember(),
          familyTripApi.getMemberPlans()
        ]);
        setMember(meRes.data.data);
        setPlans(plansRes.data.data);
      } catch (err) {
        console.error("Error fetching dashboard", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleLogout = async () => {
    try {
      await familyTripApi.memberLogout();
    } catch {
      // ignore
    }
    localStorage.removeItem("familyMemberToken");
    navigate("/family/login");
  };

  if (isLoading) return <div className="p-8 text-center text-muted">Loading...</div>;

  return (
    <div className="min-h-screen bg-background-primary py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-serif text-heading">
              Welcome, {member?.firstName}
            </h1>
            <p className="text-sm text-muted mt-1">
              Family Member Dashboard
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-heading bg-white border border-border-light rounded-xl hover:bg-background-secondary transition-colors"
          >
            <LucideLogOut className="w-4 h-4" />
            Logout
          </button>
        </div>

        {/* Plans Container */}
        <div className={cn(DASHBOARD_GLASS_SURFACE, "overflow-hidden")}>
          <div className="px-6 py-5 border-b border-border-light/50">
            <h3 className="text-lg font-semibold text-heading">Your Travel Plans</h3>
          </div>
          <div className="p-6">
            {plans.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
                  <LucideFileText className="w-8 h-8 text-accent" />
                </div>
                <p className="text-sm font-semibold text-heading mb-2">No plans available</p>
                <p className="text-xs text-muted max-w-sm mx-auto">
                  Your travel plan is currently being generated. Please check back later.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {plans.map((planId) => (
                  <Link
                    key={planId}
                    to={`/family/plans/${planId}`}
                    className="flex flex-col p-5 border border-border-light rounded-2xl hover:border-accent hover:shadow-[0_4px_16px_-6px_rgba(42,122,106,0.15)] transition-all bg-white group cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">
                        Ready
                      </span>
                      <span className="text-border-light group-hover:text-accent transition-colors">
                        <LucideArrowRight className="w-5 h-5" />
                      </span>
                    </div>
                    <h4 className="text-lg font-semibold text-heading mb-1">Travel Health Plan</h4>
                    <p className="text-sm text-muted">Plan #{planId}</p>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
