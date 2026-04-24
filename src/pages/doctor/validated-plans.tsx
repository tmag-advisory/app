import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, ArrowRight, Search, Loader2 } from "lucide-react";
import { useDoctorValidatedPlans } from "../../api/hooks";
import { cn } from "../../lib/utils";
import { DASHBOARD_GLASS_SURFACE } from "../../components/dashboard/dashboardChrome";

const DoctorValidatedPlans = () => {
    const navigate = useNavigate();
    const [search, setSearch] = useState("");
    const { data, isLoading } = useDoctorValidatedPlans();

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
                    <h1 className="text-2xl font-serif text-heading">Validated Plans</h1>
                    <p className="text-muted text-sm mt-1">
                        Travel medicine plans you have already reviewed and validated
                    </p>
                </div>
            </div>

            <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <input
                    type="text"
                    placeholder="Search by destination, traveller, or purpose..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border-light bg-white text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
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
                    className={cn(DASHBOARD_GLASS_SURFACE, "overflow-hidden")}
                >
                    <div className="divide-y divide-border-light/50">
                        {filtered.map((plan) => (
                            <button
                                key={plan.planId}
                                onClick={() => navigate(`/doctor/plans/${plan.planId}`)}
                                className="w-full text-left p-5 hover:bg-background-secondary/50 transition-colors flex items-center justify-between"
                            >
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-1">
                                        <p className="font-semibold text-heading">
                                            {plan.destination}, {plan.country}
                                        </p>
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                            plan.validationStatus === "APPROVED"
                                                ? "bg-emerald-50 text-emerald-700"
                                                : "bg-red-50 text-red-700"
                                        }`}>
                                            {plan.validationStatus}
                                        </span>
                                    </div>
                                    <p className="text-sm text-muted">
                                        {plan.travellerName} &bull; {plan.purpose} &bull; {plan.duration} days
                                    </p>
                                </div>
                                <ArrowRight size={18} className="text-muted/40 ml-4" />
                            </button>
                        ))}
                    </div>
                </motion.div>
            ) : (
                <div className={cn(DASHBOARD_GLASS_SURFACE, "p-12 text-center")}>
                    <CheckCircle size={48} className="mx-auto mb-4 text-muted/30" />
                    <h3 className="text-base font-semibold text-heading mb-1">No validated plans yet</h3>
                    <p className="text-muted text-sm">
                        Plans you validate will appear here.
                    </p>
                </div>
            )}
        </div>
    );
};

export default DoctorValidatedPlans;
