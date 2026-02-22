import { Link } from "react-router-dom";
import { usePlanStore } from "../../stores/planStore";
import DashboardHeader from "../../components/dashboard/DashboardHeader";
import { LucideArrowRight, LucideSearch } from "lucide-react";
import { useState } from "react";

const riskColors = { Low: "text-accent", Moderate: "text-gold", High: "text-red-600" };
const riskBg = { Low: "bg-accent/10", Moderate: "bg-gold/10", High: "bg-red-50" };

const PlanHistory = () => {
    const plans = usePlanStore((s) => s.plans);
    const [search, setSearch] = useState("");

    const filtered = plans.filter(
        (p) =>
            p.destination.toLowerCase().includes(search.toLowerCase()) ||
            p.country.toLowerCase().includes(search.toLowerCase()),
    );

    return (
        <div>
            <DashboardHeader title="My plans" />

            {/* Search */}
            <div className="relative max-w-sm mb-6">
                <LucideSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search plans…"
                    className="w-full bg-white border border-border-light/50 rounded-xl pl-10 pr-4 py-2.5 text-sm text-heading placeholder:text-border outline-none focus:border-accent transition-colors duration-200"
                />
            </div>

            {/* Plans table */}
            <div className="bg-white rounded-2xl border border-border-light/50 overflow-hidden">
                <div className="overflow-x-auto">
                <table className="w-full min-w-[540px]">
                    <thead>
                        <tr className="border-b border-border-light/50">
                            <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-6 py-3">Destination</th>
                            <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-6 py-3 hidden sm:table-cell">Duration</th>
                            <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-6 py-3 hidden md:table-cell">Purpose</th>
                            <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-6 py-3">Risk</th>
                            <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-6 py-3 hidden sm:table-cell">Date</th>
                            <th className="px-6 py-3"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border-light/50">
                        {filtered.map((plan) => (
                            <tr key={plan.id} className="hover:bg-background-secondary/50 transition-colors duration-150">
                                <td className="px-6 py-4">
                                    <p className="text-sm font-medium text-heading">{plan.destination}</p>
                                    <p className="text-xs text-muted">{plan.country}</p>
                                </td>
                                <td className="px-6 py-4 text-sm text-body hidden sm:table-cell">{plan.duration}</td>
                                <td className="px-6 py-4 text-sm text-body hidden md:table-cell">{plan.purpose}</td>
                                <td className="px-6 py-4">
                                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${riskColors[plan.riskScore]} ${riskBg[plan.riskScore]}`}>
                                        {plan.riskScore}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-muted hidden sm:table-cell">{plan.createdAt}</td>
                                <td className="px-6 py-4">
                                    <Link to={`/dashboard/plans/${plan.id}`} className="text-xs text-accent font-medium hover:underline flex items-center gap-1">
                                        View <LucideArrowRight className="w-3 h-3" />
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                </div>
                {filtered.length === 0 && (
                    <div className="px-6 py-12 text-center">
                        <p className="text-sm text-muted">No plans found.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PlanHistory;
