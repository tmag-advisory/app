import { usePlanStore } from "../../stores/planStore";
import DashboardHeader from "../../components/dashboard/DashboardHeader";
import StatCard from "../../components/dashboard/StatCard";
import { LucideCoins, LucideTrendingUp, LucideCalendar } from "lucide-react";

const Billing = () => {
    const { companyEmployees, selectedCompany } = usePlanStore();
    const employees = companyEmployees();
    const company = selectedCompany();

    const totalAllocated = company?.totalCredits ?? 0;
    const totalUsed = company?.usedCredits ?? 0;

    const creditHistory = [
        { date: "Feb 15, 2026", action: "Purchased 50 credits", amount: "+50", balance: 142 },
        { date: "Feb 10, 2026", action: "Plan generated — Anna Chen (Singapore)", amount: "-1", balance: 92 },
        { date: "Feb 8, 2026", action: "Plan generated — Michael Osei (Lagos)", amount: "-1", balance: 93 },
        { date: "Jan 20, 2026", action: "Purchased 100 credits", amount: "+100", balance: 94 },
        { date: "Jan 15, 2026", action: "Plan generated — Priya Sharma (São Paulo)", amount: "-1", balance: -6 },
    ];

    return (
        <div>
            <DashboardHeader title="Billing & credits" />

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <StatCard label="Credits remaining" value={totalAllocated - totalUsed} icon={<LucideCoins className="w-4 h-4" />} accent />
                <StatCard label="Total allocated" value={totalAllocated} icon={<LucideTrendingUp className="w-4 h-4" />} detail={`${totalUsed} used across ${employees.length} employees`} />
                <StatCard label="Next renewal" value="Mar 15" icon={<LucideCalendar className="w-4 h-4" />} detail="Annual agreement" />
            </div>

            {/* Purchase credits */}
            <div className="bg-white rounded-2xl border border-border-light/50 p-6 mb-6">
                <h2 className="text-base font-semibold text-heading mb-4">Purchase credits</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    {[
                        { credits: 50, price: "$250", per: "$5.00/credit" },
                        { credits: 200, price: "$800", per: "$4.00/credit" },
                        { credits: 500, price: "$1,750", per: "$3.50/credit" },
                    ].map((pack) => (
                        <button
                            key={pack.credits}
                            className="p-5 rounded-xl border-2 border-border-light hover:border-accent text-left transition-all duration-200 cursor-pointer"
                        >
                            <span className="text-2xl font-serif text-heading block mb-1">{pack.credits}</span>
                            <span className="text-xs text-muted block mb-3">credits</span>
                            <span className="text-base font-semibold text-heading block">{pack.price}</span>
                            <span className="text-xs text-accent">{pack.per}</span>
                        </button>
                    ))}
                </div>
                <p className="text-xs text-muted">Need a custom volume? <span className="text-accent cursor-pointer hover:underline">Contact sales</span></p>
            </div>

            {/* Credit history */}
            <div className="bg-white rounded-2xl border border-border-light/50 overflow-hidden">
                <div className="px-4 sm:px-6 py-4 border-b border-border-light/50">
                    <h2 className="text-base font-semibold text-heading">Credit history</h2>
                </div>
                <div className="divide-y divide-border-light/50">
                    {creditHistory.map((entry, i) => (
                        <div key={i} className="flex items-center justify-between px-4 sm:px-6 py-4 gap-3">
                            <div>
                                <p className="text-sm text-heading">{entry.action}</p>
                                <p className="text-xs text-muted">{entry.date}</p>
                            </div>
                            <span className={`text-sm font-semibold ${entry.amount.startsWith("+") ? "text-accent" : "text-body"}`}>
                                {entry.amount}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Billing;
