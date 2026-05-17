import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
    useTravelPlans,
    useDashboardAnalytics,
} from "../../api/hooks";
import DashboardHeader from "../../components/dashboard/DashboardHeader";
import StatCard from "../../components/dashboard/StatCard";
import DashboardAnalyticsCharts from "../../components/dashboard/DashboardAnalyticsCharts";
import {
    LucideCoins,
    LucideFileText,
    LucidePlusCircle,
    LucideArrowRight,
    LucideLoader2,
    LucideUsers,
    LucideMapPin,
    LucideRefreshCw,
    LucideUserPlus,
    LucideChevronRight,
    LucidePencil,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { DASHBOARD_GLASS_SURFACE } from "../../components/dashboard/dashboardChrome";
import QuestionnaireProgressBanner from "../../components/dashboard/QuestionnaireProgressBanner";
import familyTripApi from "../../api/familyTrip";
import type { FamilyTripResponse } from "../../api/types";


const riskColors: Record<string, string> = { Low: "text-accent", Moderate: "text-gold", High: "text-red-600" };
const riskBg: Record<string, string> = { Low: "bg-accent/10", Moderate: "bg-gold/10", High: "bg-red-50" };

const getRiskLabel = (score: number) => {
    if (score <= 1) return "Low";
    if (score === 2) return "Moderate";
    return "High";
};


const FamilyOverview = () => {
    const { user } = useAuth();
    const [trips, setTrips] = useState<FamilyTripResponse[]>([]);
    const [tripsLoading, setTripsLoading] = useState(true);

    useEffect(() => {
        fetchTrips();
    }, []);

    const fetchTrips = async () => {
        setTripsLoading(true);
        try {
            const res = await familyTripApi.list({ per_page: 50 });
            setTrips(res.data.data?.data ?? []);
        } catch {
            // silent
        } finally {
            setTripsLoading(false);
        }
    };

    const totalMembers = trips.reduce((sum, t) => sum + (t.members?.length ?? 0), 0);
    const activeTrips = trips.filter(t => t.status === "ACTIVE").length;

    return (
        <div>
            <DashboardHeader
                title={`Welcome back, ${user?.first_name ?? ""}.`}
            />

            {/* Family stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <StatCard
                    label="Active trips"
                    value={activeTrips}
                    icon={<LucideMapPin className="w-4 h-4" />}
                    accent
                />
                <StatCard
                    label="Family members"
                    value={totalMembers}
                    icon={<LucideUsers className="w-4 h-4" />}
                />
                <Link
                    to="/dashboard/family-trip"
                    className="rounded-3xl border border-dark/20 bg-linear-to-br from-dark to-darkest p-6 flex flex-col justify-between text-white shadow-[0_4px_16px_-6px_rgba(10,20,18,0.18)] hover:from-darkest hover:to-darkest transition-all duration-200"
                >
                    <LucideUserPlus className="w-6 h-6 text-white/40 mb-6" />
                    <div>
                        <span className="text-sm font-semibold text-white block mb-1">
                            Create family trip
                        </span>
                        <span className="text-xs text-white/40">
                            Covered by your family plan
                        </span>
                    </div>
                </Link>
            </div>

            {/* Quick actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                <Link
                    to="/dashboard/family-members"
                    className={cn(
                        DASHBOARD_GLASS_SURFACE,
                        "p-5 flex items-center justify-between hover:bg-background-secondary/30 transition-colors",
                    )}
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                            <LucideUsers className="w-5 h-5 text-accent" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-heading">
                                Manage plans
                            </p>
                            <p className="text-xs text-muted">
                                View and continue family trip drafts
                            </p>
                        </div>
                    </div>
                    <LucideChevronRight className="w-4 h-4 text-muted" />
                </Link>
                <Link
                    to="/dashboard/buy-additional-plan"
                    className={cn(
                        DASHBOARD_GLASS_SURFACE,
                        "p-5 flex items-center justify-between hover:bg-background-secondary/30 transition-colors",
                    )}
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                            <LucideRefreshCw className="w-5 h-5 text-accent" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-heading">
                                Buy Additional Plan
                            </p>
                            <p className="text-xs text-muted">
                                Get more coverage to create personalized plans
                                for your family trips
                            </p>
                        </div>
                    </div>
                    <LucideChevronRight className="w-4 h-4 text-muted" />
                </Link>
            </div>

            {/* Family trips list */}
            <div className={cn(DASHBOARD_GLASS_SURFACE, "overflow-hidden")}>
                <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-border-light/50">
                    <h2 className="text-base font-semibold text-heading">
                        Family trips
                    </h2>
                </div>

                {tripsLoading ?
                    <div className="flex items-center justify-center py-12">
                        <LucideLoader2 className="w-6 h-6 text-accent animate-spin" />
                    </div>
                : trips.length > 0 ?
                    <div className="divide-y divide-border-light/50">
                        {trips.map((trip) => (
                            <div
                                key={trip.id}
                                className="flex items-center justify-between px-4 sm:px-6 py-4 hover:bg-background-secondary/50 transition-colors duration-150 gap-3"
                            >
                                {trip.status !== "DRAFT" ?
                                    <Link
                                        to={`/dashboard/family-trip/${trip.id}`}
                                        className="flex-1 min-w-0"
                                    >
                                        <p className="text-sm font-medium text-heading">
                                            {trip.destination}
                                        </p>
                                        <p className="text-xs text-muted">
                                            {trip.country} · {trip.duration}{" "}
                                            days · {trip.members?.length ?? 0}{" "}
                                            member
                                            {(trip.members?.length ?? 0) !== 1 ?
                                                "s"
                                            :   ""}
                                        </p>
                                    </Link>
                                :   <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-heading">
                                            {trip.destination}
                                        </p>
                                        <p className="text-xs text-muted">
                                            {trip.country} · {trip.duration}{" "}
                                            days · {trip.members?.length ?? 0}{" "}
                                            member
                                            {(trip.members?.length ?? 0) !== 1 ?
                                                "s"
                                            :   ""}
                                        </p>
                                    </div>
                                }
                                <div className="flex items-center gap-3">
                                    <span
                                        className={cn(
                                            "text-xs font-semibold px-2.5 py-1 rounded-full",
                                            trip.status === "ACTIVE" ?
                                                "bg-emerald-50 text-emerald-700"
                                            : trip.status === "DRAFT" ?
                                                "bg-amber-50 text-amber-700"
                                            :   "bg-slate-100 text-muted",
                                        )}
                                    >
                                        {trip.status}
                                    </span>
                                    {trip.status === "DRAFT" && (
                                        <Link
                                            to={`/dashboard/family-trip/${trip.id}/edit`}
                                            onClick={(e) => e.stopPropagation()}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-accent text-white text-xs font-semibold hover:bg-accent/90 transition-colors"
                                        >
                                            <LucidePencil className="w-3 h-3" />
                                            Continue
                                        </Link>
                                    )}
                                    {trip.status !== "DRAFT" && (
                                        <Link
                                            to={`/dashboard/family-trip/${trip.id}`}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border-light text-xs font-semibold text-heading hover:bg-background-secondary transition-colors"
                                        >
                                            View
                                        </Link>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                :   <div className="px-6 py-12">
                        <div className="max-w-md mx-auto text-center">
                            <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
                                <LucideUsers className="w-8 h-8 text-accent" />
                            </div>
                            <p className="text-sm font-semibold text-heading mb-2">
                                No family trips yet
                            </p>
                            <p className="text-xs text-muted mb-6">
                                Create your first family trip to get
                                personalized travel health plans for every
                                member.
                            </p>
                            <Link
                                to="/dashboard/family-trip"
                                className="inline-flex items-center gap-2 py-2.5 px-5 rounded-xl bg-accent text-white font-semibold text-sm hover:bg-accent/90 transition-colors duration-200"
                            >
                                <LucidePlusCircle className="w-4 h-4" />
                                Create a family trip
                            </Link>
                        </div>
                    </div>
                }
            </div>
        </div>
    );
};


const IndividualOverview = () => {
    const { user, refreshProfile } = useAuth();
    const { data: plansData, isLoading: plansLoading } = useTravelPlans({ per_page: 5 });
    const { data: dashboardAnalytics, isLoading: analyticsLoading } =
        useDashboardAnalytics(undefined);
    const plans = plansData?.data || [];

    useEffect(() => {
        async function checkAndRefreshProfile() {
            await refreshProfile()
        }
        void checkAndRefreshProfile();
    }, [refreshProfile])

    return (
        <div>
            <DashboardHeader
                title={`Welcome back, ${user?.first_name ?? ""}.`}
            />

            <QuestionnaireProgressBanner />

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
                    <h2 className="text-base font-semibold text-heading">
                        Recent plans
                    </h2>
                    <Link
                        to="/dashboard/plans"
                        className="text-xs text-accent font-medium hover:underline flex items-center gap-1"
                    >
                        View all <LucideArrowRight className="w-3 h-3" />
                    </Link>
                </div>

                {plansLoading ?
                    <div className="flex items-center justify-center py-12">
                        <LucideLoader2 className="w-6 h-6 text-accent animate-spin" />
                    </div>
                :   <div className="divide-y divide-border-light/50">
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
                                            {plan.country} · {plan.duration}{" "}
                                            days ·{" "}
                                            {new Date(
                                                plan.createdAt,
                                            ).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <span
                                        className={`text-xs font-semibold px-2.5 py-1 rounded-full ${riskColors[riskLabel]} ${riskBg[riskLabel]}`}
                                    >
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
                                    <p className="text-sm font-semibold text-heading mb-2">
                                        No plans yet
                                    </p>
                                    <p className="text-xs text-muted mb-6">
                                        Create your first travel health plan to
                                        get personalized recommendations for
                                        vaccines, medications, and safety
                                        guidance.
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
                }
            </div>
        </div>
    );
};

const DashboardOverview = () => {
    const { user } = useAuth();
    const isFamily = user?.type?.toUpperCase() === "FAMILY";

    if (isFamily) {
        return <FamilyOverview />;
    }

    return <IndividualOverview />;
};

export default DashboardOverview;
