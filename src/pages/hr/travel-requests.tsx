import { useState } from "react";
import { usePlanStore } from "../../stores/planStore";
import DashboardHeader from "../../components/dashboard/DashboardHeader";
import type { TravelRequest } from "../../stores/planStore";

type Filter = "all" | TravelRequest["status"];

const statusStyles: Record<TravelRequest["status"], string> = {
    pending: "text-gold bg-gold/10",
    approved: "text-accent bg-accent/10",
    completed: "text-muted bg-button-secondary",
    rejected: "text-red-600 bg-red-50",
};

const TravelRequests = () => {
    const { companyRequests, updateRequestStatus } = usePlanStore();
    const travelRequests = companyRequests();
    const [filter, setFilter] = useState<Filter>("all");

    const filters: { id: Filter; label: string; count: number }[] = [
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
                        {filtered.map((req) => (
                            <tr key={req.id} className="hover:bg-background-secondary/50 transition-colors duration-150">
                                <td className="px-6 py-4">
                                    <p className="text-sm font-medium text-heading">{req.employeeName}</p>
                                </td>
                                <td className="px-6 py-4 text-sm text-body">{req.destination}</td>
                                <td className="px-6 py-4 text-sm text-muted hidden sm:table-cell">{req.dates}</td>
                                <td className="px-6 py-4">
                                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusStyles[req.status]}`}>
                                        {req.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-xs text-muted hidden sm:table-cell">{req.submittedAt}</td>
                                <td className="px-6 py-4">
                                    {req.status === "pending" && (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => updateRequestStatus(req.id, "approved")}
                                                className="text-xs font-semibold text-accent hover:underline cursor-pointer"
                                            >
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => updateRequestStatus(req.id, "rejected")}
                                                className="text-xs font-semibold text-red-500 hover:underline cursor-pointer"
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                </div>
                {filtered.length === 0 && (
                    <div className="px-6 py-12 text-center">
                        <p className="text-sm text-muted">No {filter === "all" ? "" : filter} requests found.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TravelRequests;
