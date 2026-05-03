import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ClipboardList, ArrowRight, Search, Loader2 } from "lucide-react";
import { useDoctorPendingValidations } from "../../api/hooks";
import { cn } from "../../lib/utils";
import { DASHBOARD_GLASS_SURFACE } from "../../components/dashboard/dashboardChrome";

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
                    <h1 className="text-2xl font-serif text-heading">Pending Validations</h1>
                    <p className="text-muted text-sm mt-1">
                        Review and approve travel medicine plans awaiting doctor validation
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
                                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700">
                                            PENDING
                                        </span>
                                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-accent/10 text-accent">
                                            {plan.planTier}
                                        </span>
                                    </div>
                                    <p className="text-sm text-muted">
                                        {plan.travellerName} &bull; {plan.purpose} &bull; {plan.duration} days &bull; Risk: {plan.riskScore}/10
                                    </p>
                                    {plan.openToAllDoctors ? (
                                        <p className="text-xs text-muted mt-1">Open to all doctors</p>
                                    ) : plan.assignedDoctors && plan.assignedDoctors.length > 0 ? (
                                        <p className="text-xs text-muted mt-1">
                                            Assigned: {plan.assignedDoctors.map((d) => `${d.firstName ?? ""} ${d.lastName ?? ""}`.trim()).join(", ")}
                                        </p>
                                    ) : null}
                                </div>
                                <ArrowRight size={18} className="text-muted/40 ml-4" />
                            </button>
                        ))}
                    </div>
                </motion.div>
            ) : (
                <div className={cn(DASHBOARD_GLASS_SURFACE, "p-12 text-center")}>
                    <ClipboardList size={48} className="mx-auto mb-4 text-muted/30" />
                    <h3 className="text-base font-semibold text-heading mb-1">No pending validations</h3>
                    <p className="text-muted text-sm">
                        All travel plans have been reviewed. Check back later for new submissions.
                    </p>
                </div>
            )}
        </div>
    );
};

export default DoctorPendingValidations;
