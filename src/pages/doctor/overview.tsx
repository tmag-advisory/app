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
            color: "bg-[#008080]/10 text-[#008080]",
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
                <div className="w-12 h-12 rounded-2xl bg-[#008080]/10 flex items-center justify-center text-[#008080]">
                    <Stethoscope size={24} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Doctor Dashboard</h1>
                    <p className="text-gray-500 text-sm">Review and validate travel medicine plans</p>
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
                        className="text-left p-5 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div className={`p-2.5 rounded-xl ${card.color}`}>
                                {card.icon}
                            </div>
                            <ArrowRight size={16} className="text-gray-300" />
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                        <p className="text-sm text-gray-500 mt-1">{card.label}</p>
                    </motion.button>
                ))}
            </motion.div>

            {/* Recent Plans */}
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
            >
                <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">Recent Plans</h2>
                    <button
                        onClick={() => navigate("/doctor/pending")}
                        className="text-sm text-[#008080] hover:underline"
                    >
                        View all
                    </button>
                </div>

                {stats?.recentPlans && stats.recentPlans.length > 0 ? (
                    <div className="divide-y divide-gray-50">
                        {stats.recentPlans.map((plan) => (
                            <button
                                key={plan.planId}
                                onClick={() => navigate(`/doctor/plans/${plan.planId}`)}
                                className="w-full text-left p-4 hover:bg-gray-50 transition-colors flex items-center justify-between"
                            >
                                <div>
                                    <p className="font-medium text-gray-900">
                                        {plan.destination}, {plan.country}
                                    </p>
                                    <p className="text-sm text-gray-500 mt-0.5">
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
                                    <ArrowRight size={16} className="text-gray-300" />
                                </div>
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className="p-8 text-center text-gray-400">
                        <ClipboardList size={40} className="mx-auto mb-3 opacity-40" />
                        <p>No recent plans to display</p>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default DoctorOverview;
