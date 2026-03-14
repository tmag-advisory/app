import { usePlanStore } from "../../stores/planStore";
import { useCredits, usePurchaseCredits } from "../../api/hooks";
import DashboardHeader from "../../components/dashboard/DashboardHeader";
import StatCard from "../../components/dashboard/StatCard";
import { LucideCoins, LucideTrendingUp, LucideCalendar, LucideLoader2 } from "lucide-react";

const Billing = () => {
    const { selectedCompanyId, selectedCompany, companyEmployees } = usePlanStore();
    const company = selectedCompany();
    const employees = companyEmployees();
    const companyIdNum = selectedCompanyId ? parseInt(selectedCompanyId) : undefined;

    const { data: creditsData, isLoading } = useCredits({ companyId: companyIdNum });
    const purchaseCredits = usePurchaseCredits();
    const creditHistory = creditsData?.data || [];

    const totalAllocated = company?.totalCredits ?? 0;
    const totalUsed = company?.usedCredits ?? 0;

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
                            onClick={() => {
                                if (!companyIdNum) return;
                                purchaseCredits.mutate({ id: companyIdNum, data: { amount: pack.credits, reference: `Purchase ${pack.credits} credits` } });
                            }}
                            disabled={purchaseCredits.isPending || !companyIdNum}
                            className="p-5 rounded-xl border-2 border-border-light hover:border-accent text-left transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <LucideLoader2 className="w-6 h-6 text-accent animate-spin" />
                    </div>
                ) : (
                    <div className="divide-y divide-border-light/50">
                        {creditHistory.map((entry) => (
                            <div key={entry.id} className="flex items-center justify-between px-4 sm:px-6 py-4 gap-3">
                                <div>
                                    <p className="text-sm text-heading">{entry.reference || "Credit transaction"}</p>
                                    <p className="text-xs text-muted">{new Date(entry.createdAt).toLocaleDateString()}</p>
                                </div>
                                <div className="text-right">
                                    <span className={`text-sm font-semibold block ${entry.amount > 0 ? "text-accent" : "text-body"}`}>
                                        {entry.amount > 0 ? `+${entry.amount}` : entry.amount}
                                    </span>
                                    <span className="text-[10px] text-muted">Bal: {entry.balanceAfter}</span>
                                </div>
                            </div>
                        ))}
                        {creditHistory.length === 0 && (
                            <div className="px-6 py-12 text-center">
                                <p className="text-sm text-muted">No transaction history found.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Billing;
