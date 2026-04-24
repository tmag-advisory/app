import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ClipboardList, ArrowRight, Search, Loader2 } from "lucide-react";
import { useDoctorPendingValidations } from "../../api/hooks";

const DoctorPendingValidations = () => {
    const navigate = useNavigate();
    const [search, setSearch] = useState("");
    const { data, isLoading } = useDoctorPendingValidations();

    const plans = data?.data ?? [];
    const filtered = plans.filter((p) =>
        `${p.destination} ${p.country} ${p.travellerName} ${p.purpose}`
            .toLowerCase()
            .includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Pending Validations</h1>
                    <p className="text-gray-500 text-sm mt-1">
                        Review and approve travel medicine plans awaiting doctor validation
                    </p>
                </div>
            </div>

            <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search by destination, traveller, or purpose..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#008080]/20 focus:border-[#008080]"
                />
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="w-8 h-8 text-accent animate-spin" />
                </div>
            ) : filtered.length > 0 ? (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
                >
                    <div className="divide-y divide-gray-50">
                        {filtered.map((plan) => (
                            <button
                                key={plan.planId}
                                onClick={() => navigate(`/doctor/plans/${plan.planId}`)}
                                className="w-full text-left p-5 hover:bg-gray-50 transition-colors flex items-center justify-between"
                            >
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-1">
                                        <p className="font-semibold text-gray-900">
                                            {plan.destination}, {plan.country}
                                        </p>
                                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700">
                                            PENDING
                                        </span>
                                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-[#008080]/10 text-[#008080]">
                                            {plan.planTier}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500">
                                        {plan.travellerName} &bull; {plan.purpose} &bull; {plan.duration} days &bull; Risk: {plan.riskScore}/10
                                    </p>
                                </div>
                                <ArrowRight size={18} className="text-gray-300 ml-4" />
                            </button>
                        ))}
                    </div>
                </motion.div>
            ) : (
                <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                    <ClipboardList size={48} className="mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium text-gray-900 mb-1">No pending validations</h3>
                    <p className="text-gray-500 text-sm">
                        All travel plans have been reviewed. Check back later for new submissions.
                    </p>
                </div>
            )}
        </div>
    );
};

export default DoctorPendingValidations;
