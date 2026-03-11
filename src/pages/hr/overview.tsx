import { Link } from "react-router-dom";
import { usePlanStore } from "../../stores/planStore";
import { useOnboarding, useTravelPlans, useEmployees, useTravelRequests } from "../../api/hooks";
import DashboardHeader from "../../components/dashboard/DashboardHeader";
import StatCard from "../../components/dashboard/StatCard";
import {
    LucideCoins,
    LucideUsers,
    LucidePlane,
    LucideArrowRight,
    LucideClipboardList,
    LucideLoader2,
} from "lucide-react";

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

    const { data: onboardingData } = useOnboarding();
    const { data: plansData, isLoading: plansLoading } = useTravelPlans({ companyId: companyIdNum, per_page: 4 });
    const { data: employeesData, isLoading: employeesLoading } = useEmployees({ companyId: companyIdNum });
    const { data: requestsData, isLoading: requestsLoading } = useTravelRequests({ companyId: companyIdNum, per_page: 4 });

    const plans = plansData?.data || [];
    const employees = employeesData?.data || [];
    const travelRequests = requestsData?.data || [];

    const showQuestionnaireBanner = onboardingData && !onboardingData.questionnaireCompleted;

    const totalCredits = company?.totalCredits ?? 0;
    const usedCredits = company?.usedCredits ?? 0;
    const pendingRequests = travelRequests.filter((r) => r.status === "pending").length;
    const upcomingTrips = travelRequests.filter((r) => r.status === "approved").length;

    const isLoading = plansLoading || employeesLoading || requestsLoading;

    return (
        <div>
            <DashboardHeader title={`${company?.name ?? "Company"} Dashboard`} />

            {/* Questionnaire banner */}
            {showQuestionnaireBanner && (
                <Link
                    to="/onboarding/questionnaire"
                    className="mb-6 flex items-center gap-4 p-5 rounded-2xl bg-accent/5 border border-accent/20 hover:bg-accent/10 transition-colors duration-200 group"
                >
                    <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center shrink-0">
                        <LucideClipboardList className="w-5 h-5 text-accent" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-heading">Complete your health questionnaire</p>
                        <p className="text-xs text-muted">Help us provide personalised travel health recommendations.</p>
                    </div>
                    <LucideArrowRight className="w-4 h-4 text-accent shrink-0 group-hover:translate-x-0.5 transition-transform" />
                </Link>
            )}

            {/* Stats grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard label="Total credits" value={totalCredits} icon={<LucideCoins className="w-4 h-4" />} />
                <StatCard label="Credits used" value={usedCredits} icon={<LucideCoins className="w-4 h-4" />} detail={`${totalCredits - usedCredits} remaining`} />
                <StatCard label="Active employees" value={employees.filter((e) => e.status === "active").length} icon={<LucideUsers className="w-4 h-4" />} />
                <StatCard label="Pending requests" value={pendingRequests} icon={<LucidePlane className="w-4 h-4" />} detail={`${upcomingTrips} upcoming trips`} accent />
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center py-20">
                    <LucideLoader2 className="w-8 h-8 text-accent animate-spin" />
                </div>
            ) : (
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
                            {travelRequests.map((req) => (
                                <div key={req.id} className="flex items-center justify-between px-4 sm:px-6 py-4 gap-3">
                                    <div>
                                        <p className="text-sm font-medium text-heading">{req.employeeName}</p>
                                        <p className="text-xs text-muted">{req.destination} · {req.dates}</p>
                                    </div>
                                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusStyles[req.status] || statusStyles.pending}`}>
                                        {req.status}
                                    </span>
                                </div>
                            ))}
                            {travelRequests.length === 0 && (
                                <div className="px-6 py-8 text-center">
                                    <p className="text-xs text-muted">No recent requests.</p>
                                </div>
                            )}
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
                            {plans.map((plan) => {
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
