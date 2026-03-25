import { useState, useEffect } from "react";
import { usePlanStore } from "../../stores/planStore";
import { useCredits, useMyCompanies, useHrCreditQuote, useHrPurchaseCredits } from "../../api/hooks";
import DashboardHeader from "../../components/dashboard/DashboardHeader";
import StatCard from "../../components/dashboard/StatCard";
import { LucideCoins, LucideTrendingUp, LucideCalendar, LucideLoader2, LucideExternalLink } from "lucide-react";
import toast from "react-hot-toast";

const creditPackages = [50, 100, 200];

const Billing = () => {
    const { selectedCompanyId } = usePlanStore();
    const { data: companiesData } = useMyCompanies();
    const company = companiesData?.find((c) => c.id === Number(selectedCompanyId)) || companiesData?.[0];
    const companyId = company?.id;
    const billingCurrency = (company as any)?.billingCurrency || (company as any)?.billing_currency || "NGN";

    const { data: creditsData, isLoading } = useCredits(companyId ? { companyId } : undefined);
    const purchaseCredits = useHrPurchaseCredits();
    const getQuote = useHrCreditQuote();

    const creditHistory = creditsData?.data || [];
    const totalAllocated = company?.total_credits ?? 0;
    const totalUsed = company?.used_credits ?? 0;

    const [quotes, setQuotes] = useState<Record<number, any>>({});

    useEffect(() => {
        if (!companyId) return;
        creditPackages.forEach(async (credits) => {
            try {
                const quote = await getQuote.mutateAsync({ companyId, credits });
                setQuotes((prev) => ({ ...prev, [credits]: quote }));
            } catch (err) {
                console.error(`Failed to fetch quote for ${credits} credits`, err);
            }
        });
    }, [companyId, billingCurrency]);

    const handlePurchase = async (credits: number) => {
        if (!companyId) return;
        try {
            const result = await purchaseCredits.mutateAsync({ credits, companyId });
            if (result?.paymentLink) {
                window.location.href = result.paymentLink;
            } else {
                toast.error("No payment link received");
            }
        } catch (err: any) {
            toast.error(err?.response?.data?.error || err?.response?.data?.message || "Purchase failed");
        }
    };

    return (
        <div>
            <DashboardHeader title="Billing & credits" />

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <StatCard label="Credits remaining" value={totalAllocated - totalUsed} icon={<LucideCoins className="w-4 h-4" />} accent />
                <StatCard label="Total allocated" value={totalAllocated} icon={<LucideTrendingUp className="w-4 h-4" />} detail={`${totalUsed} used across company`} />
                <StatCard label="Next renewal" value="Mar 15" icon={<LucideCalendar className="w-4 h-4" />} detail="Annual agreement" />
            </div>

            {/* Purchase credits */}
            <div className="bg-white rounded-2xl border border-border-light/50 p-6 mb-6">
                <h2 className="text-base font-semibold text-heading mb-4">Purchase credits</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    {creditPackages.map((credits, idx) => {
                        const quote = quotes[credits];
                        const isPopular = idx === 1;
                        return (
                            <div
                                key={credits}
                                className={`relative p-5 rounded-xl border-2 transition-all duration-200 ${
                                    isPopular
                                        ? "border-accent bg-accent/5"
                                        : "border-border-light hover:border-accent"
                                }`}
                            >
                                {isPopular && (
                                    <span className="absolute -top-2 right-4 px-2 py-0.5 bg-accent text-white text-[10px] font-semibold rounded-full">
                                        Popular
                                    </span>
                                )}
                                <span className="text-2xl font-serif text-heading block mb-1">{credits}</span>
                                <span className="text-xs text-muted block mb-3">credits</span>
                                {quote ? (
                                    <>
                                        <span className="text-base font-semibold text-heading block">
                                            {quote.currencySymbol}{quote.totalAmount}
                                        </span>
                                        {quote.discountAmount > 0 && (
                                            <span className="text-xs text-muted line-through block">
                                                {quote.currencySymbol}{quote.basePrice}
                                            </span>
                                        )}
                                        <span className="text-xs text-accent">
                                            {quote.currencySymbol}{quote.pricePerCredit}/credit
                                        </span>
                                    </>
                                ) : (
                                    <div className="h-10 flex items-center">
                                        <LucideLoader2 className="w-4 h-4 text-muted animate-spin" />
                                    </div>
                                )}
                                <button
                                    onClick={() => handlePurchase(credits)}
                                    disabled={purchaseCredits.isPending || !quote || !companyId}
                                    className="mt-3 w-full py-2.5 rounded-xl bg-accent text-white font-semibold text-sm hover:bg-accent/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {purchaseCredits.isPending ? (
                                        <LucideLoader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <LucideExternalLink className="w-4 h-4" />
                                    )}
                                    Pay Now
                                </button>
                            </div>
                        );
                    })}
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
