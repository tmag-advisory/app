import { useState, useEffect } from "react";
import { usePlanStore } from "../../stores/planStore";
import { useCredits, useMyCompanies, useHrCreditQuote, useHrPurchaseCredits } from "../../api/hooks";
import DashboardHeader from "../../components/dashboard/DashboardHeader";
import StatCard from "../../components/dashboard/StatCard";
import { LucideCoins, LucideTrendingUp, LucideCalendar, LucideLoader2, LucideExternalLink, LucideShield } from "lucide-react";
import toast from "react-hot-toast";
import { cn } from "../../lib/utils";
import { DASHBOARD_GLASS_SURFACE } from "../../components/dashboard/dashboardChrome";
import type { CreditPlan, CompanyAdminCreditQuoteResponse } from "../../api/types";

const creditPackages = [50, 100, 200];

const Billing = () => {
    const { selectedCompanyId } = usePlanStore();
    const { data: companiesData } = useMyCompanies();
    const company = companiesData?.find((c) => c.id === Number(selectedCompanyId)) || companiesData?.[0];
    const companyId = company?.id;
    const billingCurrency = company?.billing_currency || "NGN";

    const { data: creditsData, isLoading } = useCredits(companyId ? { companyId } : undefined);
    const purchaseCredits = useHrPurchaseCredits();
    const getQuote = useHrCreditQuote();

    const creditHistory = creditsData?.data || [];
    const totalAllocated = company?.total_credits ?? 0;
    const totalUsed = company?.used_credits ?? 0;
    const creditPlan: CreditPlan | null | undefined = company?.credit_plan ?? null;

    const [quotes, setQuotes] = useState<Record<number, CompanyAdminCreditQuoteResponse>>({});

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
    }, [companyId, billingCurrency, getQuote]);

    const handlePurchase = async (credits: number) => {
        if (!companyId) return;
        try {
            const result = await purchaseCredits.mutateAsync({ credits, companyId });
            if (result?.paymentLink) {
                window.location.href = result.paymentLink;
            } else {
                toast.error("No payment link received");
            }
        } catch (err: unknown) {
            const apiError = err as { response?: { data?: { error?: string; message?: string } }; message?: string };
            toast.error(apiError?.response?.data?.error || apiError?.response?.data?.message || "Purchase failed");
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

            {/* Company plan info */}
            {creditPlan && (
                <div className={cn(DASHBOARD_GLASS_SURFACE, "p-6 mb-6")}>
                    <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                            <div className="mt-0.5 p-2 rounded-lg bg-accent/10">
                                <LucideShield className="w-4 h-4 text-accent" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <h2 className="text-sm font-semibold text-heading">
                                        {creditPlan.displayName} Plan
                                    </h2>
                                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
                                        creditPlan.code === "PREMIUM"
                                            ? "text-amber-700 bg-amber-50 border-amber-200"
                                            : "text-accent bg-accent/10 border-accent/20"
                                    }`}>
                                        Active
                                    </span>
                                </div>
                                {creditPlan.basePriceUsd > 0 && (
                                    <p className="text-xs text-accent font-semibold mb-1">
                                        From ${creditPlan.basePriceUsd.toFixed(0)} USD per credit — volume discounts available
                                    </p>
                                )}
                                <p className="text-xs text-muted leading-relaxed max-w-sm">
                                    {creditPlan.description}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Purchase credits */}
            <div className={cn(DASHBOARD_GLASS_SURFACE, "p-6 mb-6")}>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-semibold text-heading">Purchase credits</h2>
                    <span className="text-xs text-muted">
                        Volume discounts applied automatically
                    </span>
                </div>
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
                                        <span className="text-xs text-accent">
                                            {quote.currencySymbol}{quote.pricePerCredit}/credit
                                        </span>
                                    </>
                                ) : (
                                    <div className="h-10 flex items-center">
                                        <LucideLoader2 className="w-4 h-4 text-muted animate-spin" />
                                    </div>
                                )}
                                {quote?.qualifiesForContactSales ? (
                                    <a
                                        href="/contact"
                                        className="mt-3 w-full py-2.5 rounded-xl bg-accent/10 text-accent font-semibold text-sm hover:bg-accent/20 transition-colors flex items-center justify-center gap-2"
                                    >
                                        Contact Sales
                                    </a>
                                ) : (
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
                                )}
                            </div>
                        );
                    })}
                </div>
                <p className="text-xs text-muted">Need a custom volume? <a href="/contact" className="text-accent cursor-pointer hover:underline">Contact sales</a></p>
            </div>

            {/* Credit history */}
            <div className={cn(DASHBOARD_GLASS_SURFACE, "overflow-hidden")}>
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
