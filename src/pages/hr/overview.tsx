import { Link } from "react-router-dom";
import { usePlanStore } from "../../stores/planStore";
import { useTravelPlans, useEmployees, useCreditRequests, useDashboardAnalytics } from "../../api/hooks";
import DashboardHeader from "../../components/dashboard/DashboardHeader";
import StatCard from "../../components/dashboard/StatCard";
import {
    LucideCoins,
    LucideUsers,
    LucidePlane,
    LucideArrowRight, LucideLoader2
} from "lucide-react";
import DashboardAnalyticsCharts from "../../components/dashboard/DashboardAnalyticsCharts";
import { cn } from "../../lib/utils";
import { DASHBOARD_GLASS_SURFACE } from "../../components/dashboard/dashboardChrome";

const getRiskLabel = (score: number) => {
    if (score <= 1) return "Low";
    if (score === 2) return "Moderate";
    return "High";
};

const statusStyles: Record<string, string> = {
    pending: "text-gold bg-gold/10",
    approved: "text-accent bg-accent/10",
    completed: "text-muted bg-button-secondary",
    rejected: "text-red-600 bg-red-50",
};

const riskColors: Record<string, string> = { Low: "text-accent", Moderate: "text-gold", High: "text-red-600" };
const riskBg: Record<string, string> = { Low: "bg-accent/10", Moderate: "bg-gold/10", High: "bg-red-50" };

const HROverview = () => {
    const { selectedCompanyId, selectedCompany } = usePlanStore();
    const company = selectedCompany();
    const companyIdNum = selectedCompanyId ? parseInt(selectedCompanyId) : undefined;

    const { data: plansData, isLoading: plansLoading } = useTravelPlans({ companyId: companyIdNum, per_page: 4 });
    const { data: employeesData, isLoading: employeesLoading } = useEmployees({ companyId: companyIdNum });
    const { data: requestsData, isLoading: requestsLoading } = useCreditRequests({ companyId: companyIdNum, per_page: 4 });
    const { data: dashboardAnalytics, isLoading: analyticsLoading } = useDashboardAnalytics(companyIdNum, {
        enabled: companyIdNum != null && companyIdNum > 0,
    });

    const plans = plansData?.data || [];
    const employees = employeesData?.data || [];
    const creditRequests = requestsData?.data || [];

    // const showQuestionnaireBanner = onboardingData && !onboardingData.questionnaireCompleted;

    const totalCredits = company?.totalCredits ?? 0;
    const usedCredits = company?.usedCredits ?? 0;
    const pendingRequests = creditRequests.filter((r: { status: string }) => r.status === "pending").length;
    const upcomingTrips = creditRequests.filter((r: { status: string }) => r.status === "approved").length;

    const isLoading = plansLoading || employeesLoading || requestsLoading;

    return (
        <div>
            <DashboardHeader title={`${company?.name ?? "Company"} Dashboard`} />
            {/* Stats grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard label="Total credits" value={totalCredits} icon={<LucideCoins className="w-4 h-4" />} />
                <StatCard label="Credits used" value={usedCredits} icon={<LucideCoins className="w-4 h-4" />} detail={`${totalCredits - usedCredits} remaining`} />
                <StatCard label="Active employees" value={employees.filter((e: { status: string }) => e.status === "active").length} icon={<LucideUsers className="w-4 h-4" />} />
                <StatCard label="Pending requests" value={pendingRequests} icon={<LucidePlane className="w-4 h-4" />} detail={`${upcomingTrips} approved`} accent />
            </div>

            <DashboardAnalyticsCharts
                data={dashboardAnalytics}
                isLoading={analyticsLoading}
                variant="company"
            />

            {isLoading ? (
                <div className="flex items-center justify-center py-20">
                    <LucideLoader2 className="w-8 h-8 text-accent animate-spin" />
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Recent credit requests */}
                    <div className={cn(DASHBOARD_GLASS_SURFACE, "overflow-hidden")}>
                        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-border-light/50">
                            <h2 className="text-base font-semibold text-heading">Credit requests</h2>
                            <Link to="/hr/credit-requests" className="text-xs text-accent font-medium hover:underline flex items-center gap-1">
                                View all <LucideArrowRight className="w-3 h-3" />
                            </Link>
                        </div>
                        <div className="divide-y divide-border-light/50">
                            <>
                                {creditRequests.length === 0 && (
                                    <div className="px-6 py-8 text-center">
                                        <p className="text-xs text-muted">No recent requests.</p>
                                    </div>
                                )}
                            </>
                            <>
                                {creditRequests && creditRequests.map((req: Partial<{ id: number; employeeName: string | undefined; creditsRequested: number; reason: string; status: string }>) => (
                                    <div key={req.id} className="flex items-center justify-between px-4 sm:px-6 py-4 gap-3">
                                        <div>
                                            <p className="text-sm font-medium text-heading">{req?.employeeName}</p>
                                            <p className="text-xs text-muted">{req?.creditsRequested} credits · {req?.reason || "No reason"}</p>
                                        </div>
                                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusStyles[req.status as string] || statusStyles?.pending}`}>
                                            {req?.status}
                                        </span>
                                    </div>
                                ))}
                            </>
                        </div>
                    </div>

                    {/* Recent plans */}
                    <div className={cn(DASHBOARD_GLASS_SURFACE, "overflow-hidden")}>
                        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-border-light/50">
                            <h2 className="text-base font-semibold text-heading">Recent plans</h2>
                            <Link to="/hr/create-plan" className="text-xs text-accent font-medium hover:underline flex items-center gap-1">
                                Create plan <LucideArrowRight className="w-3 h-3" />
                            </Link>
                        </div>
                        <div className="divide-y divide-border-light/50">
                            {plans.map((plan: { id: number; destination: string; country: string; duration: number; riskScore: number }) => {
                                const riskLabel = getRiskLabel(plan.riskScore);
                                return (
                                    <div key={plan.id} className="flex items-center justify-between px-4 sm:px-6 py-4 gap-3">
                                        <div>
                                            <p className="text-sm font-medium text-heading">{plan.destination}</p>
                                            <p className="text-xs text-muted">{plan.country} · {plan.duration} days</p>
                                        </div>
                                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${riskColors[riskLabel]} ${riskBg[riskLabel]}`}>
                                            {riskLabel} risk
                                        </span>
                                    </div>
                                );
                            })}
                            {plans.length === 0 && (
                                <div className="px-6 py-8 text-center">
                                    <p className="text-xs text-muted">No plans generated yet.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HROverview;
