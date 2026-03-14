import { useState } from "react";
import { usePlanStore } from "../../stores/planStore";
import { useTravelRequests, useApproveTravelRequest, useRejectTravelRequest } from "../../api/hooks";
import DashboardHeader from "../../components/dashboard/DashboardHeader";
import { LucideLoader2 } from "lucide-react";

const statusStyles: Record<string, string> = {
    pending: "text-gold bg-gold/10",
    approved: "text-accent bg-accent/10",
    completed: "text-muted bg-button-secondary",
    rejected: "text-red-600 bg-red-50",
};

const TravelRequests = () => {
    const { selectedCompanyId } = usePlanStore();
    const companyIdNum = selectedCompanyId ? parseInt(selectedCompanyId) : undefined;
    
    const [filter, setFilter] = useState<string>("all");

    const { data: requestsData, isLoading } = useTravelRequests({ 
        companyId: companyIdNum 
    });
    
    const approveRequest = useApproveTravelRequest();
    const rejectRequest = useRejectTravelRequest();

    const travelRequests = requestsData?.data || [];

    const filters = [
        { id: "all", label: "All", count: travelRequests.length },
        { id: "pending", label: "Pending", count: travelRequests.filter((r) => r.status === "pending").length },
        { id: "approved", label: "Approved", count: travelRequests.filter((r) => r.status === "approved").length },
        { id: "completed", label: "Completed", count: travelRequests.filter((r) => r.status === "completed").length },
    ];

    const filtered = filter === "all" ? travelRequests : travelRequests.filter((r) => r.status === filter);

    return (
        <div>
            <DashboardHeader title="Travel requests" />

            {/* Filter tabs */}
            <div className="flex gap-2 mb-6 flex-wrap">
                {filters.map((f) => (
                    <button
                        key={f.id}
                        onClick={() => setFilter(f.id)}
                        className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors duration-200 cursor-pointer ${
                            filter === f.id
                                ? "bg-dark text-background-primary"
                                : "bg-button-secondary text-heading hover:bg-border-light"
                        }`}
                    >
                        {f.label} ({f.count})
                    </button>
                ))}
            </div>

            {/* Requests */}
            <div className="bg-white rounded-2xl border border-border-light/50 overflow-hidden">
                <div className="overflow-x-auto">
                <table className="w-full min-w-[540px]">
                    <thead>
                        <tr className="border-b border-border-light/50">
                            <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-6 py-3">Employee</th>
                            <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-6 py-3">Destination</th>
                            <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-6 py-3 hidden sm:table-cell">Dates</th>
                            <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-6 py-3">Status</th>
                            <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-6 py-3 hidden sm:table-cell">Submitted</th>
                            <th className="px-6 py-3"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border-light/50">
                        {isLoading ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center">
                                    <LucideLoader2 className="w-6 h-6 text-accent animate-spin mx-auto" />
                                </td>
                            </tr>
                        ) : (
                            filtered.map((req) => (
                                <tr key={req.id} className="hover:bg-background-secondary/50 transition-colors duration-150">
                                    <td className="px-6 py-4">
                                        <p className="text-sm font-medium text-heading">{req.employeeName || `Employee #${req.employeeId}`}</p>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-body">{req.destination}</td>
                                    <td className="px-6 py-4 text-sm text-muted hidden sm:table-cell">{req.dates}</td>
                                    <td className="px-6 py-4">
                                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusStyles[req.status] || statusStyles.pending}`}>
                                            {req.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-xs text-muted hidden sm:table-cell">
                                        {req.submittedAt ? new Date(req.submittedAt).toLocaleDateString() : "N/A"}
                                    </td>
                                    <td className="px-6 py-4">
                                        {req.status === "pending" && (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => approveRequest.mutate(req.id)}
                                                    disabled={approveRequest.isPending}
                                                    className="text-xs font-semibold text-accent hover:underline cursor-pointer disabled:opacity-50"
                                                >
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() => rejectRequest.mutate(req.id)}
                                                    disabled={rejectRequest.isPending}
                                                    className="text-xs font-semibold text-red-500 hover:underline cursor-pointer disabled:opacity-50"
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
                </div>
                {!isLoading && filtered.length === 0 && (
                    <div className="px-6 py-12 text-center">
                        <p className="text-sm text-muted">No {filter === "all" ? "" : filter} requests found.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TravelRequests;
