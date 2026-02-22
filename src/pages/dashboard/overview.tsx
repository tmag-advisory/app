import { Link } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import { usePlanStore } from "../../stores/planStore";
import DashboardHeader from "../../components/dashboard/DashboardHeader";
import StatCard from "../../components/dashboard/StatCard";
import { LucideCoins, LucideFileText, LucidePlusCircle, LucideArrowRight } from "lucide-react";


const riskColors = { Low: "text-accent", Moderate: "text-gold", High: "text-red-600" };
const riskBg = { Low: "bg-accent/10", Moderate: "bg-gold/10", High: "bg-red-50" };

const DashboardOverview = () => {
    const user = useAuthStore((s) => s.user);
    const plans = usePlanStore((s) => s.plans);

    return (
        <div>
            <DashboardHeader title={`Welcome back, ${user?.name?.split(" ")[0]}.`} />

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
                        value={plans.length}
                        icon={<LucideFileText className="w-4 h-4" />}
                    />
                    <Link
                        to="/dashboard/create-plan"
                        className="bg-dark rounded-2xl p-6 flex flex-col justify-between hover:bg-darkest transition-colors duration-200"
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

            {/* Recent plans */}
            <div className="bg-white rounded-2xl border border-border-light/50 overflow-hidden">
                <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-border-light/50">
                    <h2 className="text-base font-semibold text-heading">Recent plans</h2>
                    <Link to="/dashboard/plans" className="text-xs text-accent font-medium hover:underline flex items-center gap-1">
                        View all <LucideArrowRight className="w-3 h-3" />
                    </Link>
                </div>
                <div className="divide-y divide-border-light/50">
                    {plans.slice(0, 5).map((plan) => (
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
                                    {plan.country} · {plan.duration} · {plan.createdAt}
                                </p>
                            </div>
                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${riskColors[plan.riskScore]} ${riskBg[plan.riskScore]}`}>
                                {plan.riskScore} risk
                            </span>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DashboardOverview;
