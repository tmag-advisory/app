import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTravelPlans, useDashboardAnalytics } from "../../api/hooks";
import DashboardHeader from "../../components/dashboard/DashboardHeader";
import StatCard from "../../components/dashboard/StatCard";
import DashboardAnalyticsCharts from "../../components/dashboard/DashboardAnalyticsCharts";
import { LucideCoins, LucideFileText, LucidePlusCircle, LucideArrowRight, LucideLoader2 } from "lucide-react";
import { cn } from "../../lib/utils";
import { DASHBOARD_GLASS_SURFACE } from "../../components/dashboard/dashboardChrome";

const riskColors: Record<string, string> = { Low: "text-accent", Moderate: "text-gold", High: "text-red-600" };
const riskBg: Record<string, string> = { Low: "bg-accent/10", Moderate: "bg-gold/10", High: "bg-red-50" };

const getRiskLabel = (score: number) => {
    if (score <= 1) return "Low";
    if (score === 2) return "Moderate";
    return "High";
};

const DashboardOverview = () => {
    const { user } = useAuth();
    const { data: plansData, isLoading: plansLoading } = useTravelPlans({ per_page: 5 });
    // const { data: onboardingData } = useOnboarding();
    const { data: dashboardAnalytics, isLoading: analyticsLoading } = useDashboardAnalytics(undefined);

    const plans = plansData?.data || [];
    // const showQuestionnaireBanner = onboardingData && !onboardingData.questionnaireCompleted;

    return (
        <div>
            <DashboardHeader title={`Welcome back, ${user?.first_name ?? ""}.`} />

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <StatCard
                    label="Credits remaining"
                    value={user?.credits ?? 0}
                    icon={<LucideCoins className="w-4 h-4" />}
                    accent
                />
                <StatCard
                    label="Plans generated"
                    value={plansData?.pagination.total ?? 0}
                    icon={<LucideFileText className="w-4 h-4" />}
                />
                <Link
                    to="/dashboard/create-plan"
                    className="rounded-3xl border border-dark/20 bg-linear-to-br from-dark to-darkest p-6 flex flex-col justify-between text-white shadow-[0_4px_16px_-6px_rgba(10,20,18,0.18)] hover:from-darkest hover:to-darkest transition-all duration-200"
                >
                    <LucidePlusCircle className="w-6 h-6 text-white/40 mb-6" />
                    <div>
                        <span className="text-sm font-semibold text-white block mb-1">
                            Create new plan
                        </span>
                        <span className="text-xs text-white/40">
                            Uses 1 credit
                        </span>
                    </div>
                </Link>
            </div>

            <DashboardAnalyticsCharts
                data={dashboardAnalytics}
                isLoading={analyticsLoading}
                variant="individual"
            />

            {/* Recent plans */}
            <div className={cn(DASHBOARD_GLASS_SURFACE, "overflow-hidden")}>
                <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-border-light/50">
                    <h2 className="text-base font-semibold text-heading">Recent plans</h2>
                    <Link to="/dashboard/plans" className="text-xs text-accent font-medium hover:underline flex items-center gap-1">
                        View all <LucideArrowRight className="w-3 h-3" />
                    </Link>
                </div>

                {plansLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <LucideLoader2 className="w-6 h-6 text-accent animate-spin" />
                    </div>
                ) : (
                    <div className="divide-y divide-border-light/50">
                        {plans.map((plan) => {
                            const riskLabel = getRiskLabel(plan.riskScore);
                            return (
                                <Link
                                    key={plan.id}
                                    to={`/dashboard/plans/${plan.id}`}
                                    className="flex items-center justify-between px-4 sm:px-6 py-4 hover:bg-background-secondary/50 transition-colors duration-150 gap-3"
                                >
                                    <div>
                                        <p className="text-sm font-medium text-heading">
                                            {plan.destination}
                                        </p>
                                        <p className="text-xs text-muted">
                                            {plan.country} · {plan.duration} days · {new Date(plan.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${riskColors[riskLabel]} ${riskBg[riskLabel]}`}>
                                        {riskLabel} risk
                                    </span>
                                </Link>
                            );
                        })}
                        {plans.length === 0 && (
                            <div className="px-6 py-12">
                                <div className="max-w-md mx-auto text-center">
                                    <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
                                        <LucideFileText className="w-8 h-8 text-accent" />
                                    </div>
                                    <p className="text-sm font-semibold text-heading mb-2">No plans yet</p>
                                    <p className="text-xs text-muted mb-6">
                                        Create your first travel health plan to get personalized recommendations for vaccines, medications, and safety guidance.
                                    </p>
                                    <Link
                                        to="/dashboard/create-plan"
                                        className="inline-flex items-center gap-2 py-2.5 px-5 rounded-xl bg-accent text-white font-semibold text-sm hover:bg-accent/90 transition-colors duration-200"
                                    >
                                        <LucidePlusCircle className="w-4 h-4" />
                                        Create your first plan
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DashboardOverview;
