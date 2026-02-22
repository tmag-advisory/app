import { Link } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import { usePlanStore } from "../../stores/planStore";
import DashboardHeader from "../../components/dashboard/DashboardHeader";
import StatCard from "../../components/dashboard/StatCard";
import {
    LucideCoins,
    LucideUsers,
    LucidePlane,
    LucideArrowRight,
} from "lucide-react";

const HROverview = () => {
    const user = useAuthStore((s) => s.user);
    const { companyPlans, companyEmployees, companyRequests, selectedCompany } = usePlanStore();

    const plans = companyPlans();
    const employees = companyEmployees();
    const travelRequests = companyRequests();
    const company = selectedCompany();

    const totalCredits = company?.totalCredits ?? 0;
    const usedCredits = company?.usedCredits ?? 0;
    const pendingRequests = travelRequests.filter((r) => r.status === "pending").length;
    const upcomingTrips = travelRequests.filter((r) => r.status === "approved").length;

    return (
        <div>
            <DashboardHeader title={`${company?.name ?? user?.companyIds?.[0] ?? "Company"} Dashboard`} />

            {/* Stats grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard label="Total credits" value={totalCredits} icon={<LucideCoins className="w-4 h-4" />} />
                <StatCard label="Credits used" value={usedCredits} icon={<LucideCoins className="w-4 h-4" />} detail={`${totalCredits - usedCredits} remaining`} />
                <StatCard label="Active employees" value={employees.filter((e) => e.status === "active").length} icon={<LucideUsers className="w-4 h-4" />} />
                <StatCard label="Pending requests" value={pendingRequests} icon={<LucidePlane className="w-4 h-4" />} detail={`${upcomingTrips} upcoming trips`} accent />
            </div>

            {/* Two-column layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent travel requests */}
                <div className="bg-white rounded-2xl border border-border-light/50 overflow-hidden">
                    <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-border-light/50">
                        <h2 className="text-base font-semibold text-heading">Travel requests</h2>
                        <Link to="/hr/travel-requests" className="text-xs text-accent font-medium hover:underline flex items-center gap-1">
                            View all <LucideArrowRight className="w-3 h-3" />
                        </Link>
                    </div>
                    <div className="divide-y divide-border-light/50">
                        {travelRequests.slice(0, 4).map((req) => (
                            <div key={req.id} className="flex items-center justify-between px-4 sm:px-6 py-4 gap-3">
                                <div>
                                    <p className="text-sm font-medium text-heading">{req.employeeName}</p>
                                    <p className="text-xs text-muted">{req.destination} · {req.dates}</p>
                                </div>
                                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                                    req.status === "pending" ? "text-gold bg-gold/10" :
                                    req.status === "approved" ? "text-accent bg-accent/10" :
                                    req.status === "completed" ? "text-muted bg-button-secondary" :
                                    "text-red-600 bg-red-50"
                                }`}>
                                    {req.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent plans */}
                <div className="bg-white rounded-2xl border border-border-light/50 overflow-hidden">
                    <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-border-light/50">
                        <h2 className="text-base font-semibold text-heading">Recent plans</h2>
                        <Link to="/hr/create-plan" className="text-xs text-accent font-medium hover:underline flex items-center gap-1">
                            Create plan <LucideArrowRight className="w-3 h-3" />
                        </Link>
                    </div>
                    <div className="divide-y divide-border-light/50">
                        {plans.slice(0, 4).map((plan) => (
                            <div key={plan.id} className="flex items-center justify-between px-4 sm:px-6 py-4 gap-3">
                                <div>
                                    <p className="text-sm font-medium text-heading">{plan.destination}</p>
                                    <p className="text-xs text-muted">{plan.country} · {plan.duration}</p>
                                </div>
                                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                                    plan.riskScore === "Low" ? "text-accent bg-accent/10" :
                                    plan.riskScore === "Moderate" ? "text-gold bg-gold/10" :
                                    "text-red-600 bg-red-50"
                                }`}>
                                    {plan.riskScore}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HROverview;
