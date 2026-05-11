import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
    ClipboardList,
    CheckCircle,
    Activity,
    ArrowRight,
    Stethoscope,
    Loader2,
} from "lucide-react";
import { useDoctorDashboardStats } from "../../api/hooks";
import { cn } from "../../lib/utils";
import { DASHBOARD_GLASS_SURFACE } from "../../components/dashboard/dashboardChrome";

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.08 },
    },
};

const item = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

const DoctorOverview = () => {
    const navigate = useNavigate();
    const { data: stats, isLoading } = useDoctorDashboardStats();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 text-accent animate-spin" />
            </div>
        );
    }

    const statCards = [
        {
            label: "Pending Validations",
            value: stats?.pendingValidations ?? 0,
            icon: <ClipboardList size={22} />,
            color: "bg-amber-50 text-amber-600",
            onClick: () => navigate("/doctor/pending"),
        },
        {
            label: "Approved Today",
            value: stats?.approvedToday ?? 0,
            icon: <CheckCircle size={22} />,
            color: "bg-emerald-50 text-emerald-600",
            onClick: () => navigate("/doctor/validated"),
        },
        {
            label: "Total Validated",
            value: stats?.totalValidated ?? 0,
            icon: <Activity size={22} />,
            color: "bg-accent/10 text-accent",
            onClick: () => navigate("/doctor/validated"),
        },
    ];

    return (
        <div className="space-y-8">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-4"
            >
                <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent">
                    <Stethoscope size={24} />
                </div>
                <div>
                    <h1 className="text-2xl font-serif text-heading">Doctor Dashboard</h1>
                    <p className="text-muted text-sm">Review and validate travel medicine plans</p>
                </div>
            </motion.div>

            {/* Stats */}
            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 sm:grid-cols-3 gap-4"
            >
                {statCards.map((card) => (
                    <motion.button
                        key={card.label}
                        variants={item}
                        onClick={card.onClick}
                        className={cn(DASHBOARD_GLASS_SURFACE, "text-left p-5 hover:shadow-md transition-shadow w-full")}
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div className={`p-2.5 rounded-xl ${card.color}`}>
                                {card.icon}
                            </div>
                            <ArrowRight size={16} className="text-muted/40" />
                        </div>
                        <p className="text-2xl font-serif text-heading">{card.value}</p>
                        <p className="text-sm text-muted mt-1">{card.label}</p>
                    </motion.button>
                ))}
            </motion.div>

            {/* Recent Plans */}
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className={cn(DASHBOARD_GLASS_SURFACE, "overflow-hidden")}
            >
                <div className="px-5 py-4 border-b border-border-light/50 flex items-center justify-between">
                    <h2 className="text-base font-semibold text-heading">Recent Plans</h2>
                    <button
                        onClick={() => navigate("/doctor/pending")}
                        className="text-sm text-accent hover:underline"
                    >
                        View all
                    </button>
                </div>

                {stats?.recentPlans && stats.recentPlans.length > 0 ? (
                    <div className="divide-y divide-border-light/50">
                        {stats.recentPlans.map((plan) => (
                            <button
                                key={plan.planId}
                                onClick={() => navigate(`/doctor/plans/${plan.planId}`)}
                                className="w-full text-left px-5 py-4 hover:bg-background-secondary/50 transition-colors flex items-center justify-between"
                            >
                                <div>
                                    <p className="font-medium text-heading">
                                        {plan.destination}, {plan.country}
                                    </p>
                                    <p className="text-sm text-muted mt-0.5">
                                        {plan.travellerName} &bull; {plan.purpose} &bull; {plan.duration} days
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                                        plan.validationStatus === "PENDING"
                                            ? "bg-amber-50 text-amber-700"
                                            : plan.validationStatus === "APPROVED"
                                            ? "bg-emerald-50 text-emerald-700"
                                            : "bg-red-50 text-red-700"
                                    }`}>
                                        {plan.validationStatus}
                                    </span>
                                    <ArrowRight size={16} className="text-muted/40" />
                                </div>
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className="p-8 text-center text-muted">
                        <ClipboardList size={40} className="mx-auto mb-3 opacity-40" />
                        <p>No recent plans to display</p>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default DoctorOverview;
