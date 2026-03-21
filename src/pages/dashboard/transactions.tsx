import { useState } from "react";
import { useCredits, useCreditPurchaseHistory, usePlanUsageLedgerHistory } from "../../api/hooks";
import DashboardHeader from "../../components/dashboard/DashboardHeader";
import { cn } from "../../lib/utils";
import {
    LucideLoader2,
    LucideArrowDownRight,
    LucideChevronDown,
    LucideChevronUp,
    LucideShoppingCart,
    LucideGift,
    LucideRefreshCw,
    LucideMapPin,
} from "lucide-react";
import type { CreditResponse, CreditPurchaseResponse, PlanUsageLedgerResponse } from "../../api/types";

type Tab = "all" | "purchases" | "usage";

interface UnifiedTransaction {
    kind: "credit" | "purchase" | "usage";
    id: number;
    date: string;
    amount: number;
    type: string;
    status?: string;
    reference?: string;
    balanceAfter?: number;
    creditsPurchased?: number;
    currency?: string;
    currencySymbol?: string;
    pricePerCredit?: number;
    amountPaid?: number | null;
    txRef?: string;
    paidAt?: string | null;
    failedAt?: string | null;
    failedReason?: string | null;
    travelPlanId?: number | null;
    travelPlanDestination?: string | null;
    travelPlanCountry?: string | null;
}

function getTypeIcon(type: string) {
    switch (type) {
        case "purchase":
            return <LucideShoppingCart className="w-4 h-4" />;
        case "plan-usage":
        case "PLAN_GENERATED":
        case "PLAN_VIEWED":
            return <LucideMapPin className="w-4 h-4" />;
        case "new-user-bonus":
            return <LucideGift className="w-4 h-4" />;
        case "company-allocation":
            return <LucideRefreshCw className="w-4 h-4" />;
        default:
            return <LucideArrowDownRight className="w-4 h-4" />;
    }
}

function getTypeLabel(type: string): string {
    switch (type) {
        case "purchase": return "Credit Purchase";
        case "plan-usage": return "Plan Usage";
        case "PLAN_GENERATED": return "Plan Generated";
        case "PLAN_VIEWED": return "Plan Viewed";
        case "new-user-bonus": return "Welcome Bonus";
        case "company-allocation": return "Company Allocation";
        case "refund": return "Refund";
        default: return type.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    }
}

function getStatusStyle(status: string): string {
    switch (status?.toLowerCase()) {
        case "completed":
        case "success":
            return "bg-accent/10 text-accent";
        case "pending":
            return "bg-gold/10 text-gold";
        case "failed":
        case "cancelled":
            return "bg-red-50 text-red-600";
        default:
            return "bg-muted/10 text-muted";
    }
}

// ─── Transaction Row ──────────────────────────────────────────

const TransactionRow = ({ tx }: { tx: UnifiedTransaction }) => {
    const [expanded, setExpanded] = useState(false);
    const isDebit = tx.amount < 0;
    const isUsage = tx.kind === "usage";

    return (
        <>
            <tr
                onClick={() => setExpanded(!expanded)}
                className="hover:bg-background-secondary/50 transition-colors duration-150 cursor-pointer"
            >
                <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                            isDebit ? "bg-red-50 text-red-500" : isUsage ? "bg-accent/10 text-accent" : "bg-accent/10 text-accent",
                        )}>
                            {isDebit
                                ? <LucideArrowDownRight className="w-4 h-4" />
                                : getTypeIcon(tx.type)
                            }
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-medium text-heading truncate">
                                {tx.kind === "purchase" ? "Credit Purchase" : getTypeLabel(tx.type)}
                            </p>
                            <p className="text-xs text-muted">
                                {new Date(tx.date).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                })}
                            </p>
                        </div>
                    </div>
                </td>
                <td className="px-6 py-4 hidden sm:table-cell">
                    {isUsage ? (
                        <span className="text-sm text-muted">—</span>
                    ) : (
                        <span className={cn(
                            "text-sm font-semibold",
                            isDebit ? "text-red-600" : "text-accent",
                        )}>
                            {isDebit ? "" : "+"}{tx.amount} credits
                        </span>
                    )}
                </td>
                <td className="px-6 py-4 hidden md:table-cell">
                    {tx.kind === "purchase" && tx.status ? (
                        <span className={cn("text-xs font-semibold px-2.5 py-1 rounded-full capitalize", getStatusStyle(tx.status))}>
                            {tx.status}
                        </span>
                    ) : tx.balanceAfter !== undefined ? (
                        <span className="text-sm text-body">{tx.balanceAfter} credits</span>
                    ) : (
                        <span className="text-sm text-muted">—</span>
                    )}
                </td>
                <td className="px-6 py-4 text-right">
                    {expanded
                        ? <LucideChevronUp className="w-4 h-4 text-muted" />
                        : <LucideChevronDown className="w-4 h-4 text-muted" />
                    }
                </td>
            </tr>
            {expanded && (
                <tr>
                    <td colSpan={4} className="px-6 py-0">
                        <TransactionPreview tx={tx} />
                    </td>
                </tr>
            )}
        </>
    );
};

// ─── Transaction Preview Panel ────────────────────────────────

const TransactionPreview = ({ tx }: { tx: UnifiedTransaction }) => {
    return (
        <div className="bg-background-secondary/50 rounded-xl p-4 sm:p-5 mb-4 border border-border-light/30">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Field label="Type" value={tx.kind === "purchase" ? "Credit Purchase" : getTypeLabel(tx.type)} />
                <Field label="Date" value={new Date(tx.date).toLocaleString("en-US", {
                    month: "short", day: "numeric", year: "numeric",
                    hour: "numeric", minute: "2-digit",
                })} />
                {tx.amount !== 0 && (
                    <Field
                        label="Amount"
                        value={`${tx.amount > 0 ? "+" : ""}${tx.amount} credits`}
                        highlight={tx.amount > 0 ? "accent" : "red"}
                    />
                )}

                {tx.kind === "purchase" && (
                    <>
                        {tx.amountPaid != null && (
                            <Field label="Paid" value={`${tx.currencySymbol ?? ""}${tx.amountPaid.toLocaleString()} ${tx.currency ?? ""}`} />
                        )}
                        {tx.creditsPurchased != null && (
                            <Field label="Credits Purchased" value={`${tx.creditsPurchased}`} />
                        )}
                        {tx.pricePerCredit != null && (
                            <Field label="Price / Credit" value={`${tx.currencySymbol ?? ""}${tx.pricePerCredit}`} />
                        )}
                        {tx.status && (
                            <Field label="Status">
                                <span className={cn("text-xs font-semibold px-2.5 py-1 rounded-full capitalize", getStatusStyle(tx.status))}>
                                    {tx.status}
                                </span>
                            </Field>
                        )}
                        {tx.paidAt && (
                            <Field label="Paid At" value={new Date(tx.paidAt).toLocaleString()} />
                        )}
                        {tx.failedReason && (
                            <Field label="Failure Reason" value={tx.failedReason} />
                        )}
                        {tx.txRef && (
                            <Field label="Reference" value={tx.txRef} mono />
                        )}
                    </>
                )}

                {tx.kind === "credit" && (
                    <>
                        {tx.balanceAfter !== undefined && (
                            <Field label="Balance After" value={`${tx.balanceAfter} credits`} />
                        )}
                        {tx.reference && (
                            <Field label="Reference" value={tx.reference} mono />
                        )}
                    </>
                )}

                {tx.kind === "usage" && (
                    <>
                        {tx.travelPlanDestination && (
                            <Field label="Destination" value={tx.travelPlanDestination} />
                        )}
                        {tx.travelPlanCountry && (
                            <Field label="Country" value={tx.travelPlanCountry} />
                        )}
                        {tx.travelPlanId && (
                            <Field label="Plan ID" value={`#${tx.travelPlanId}`} mono />
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

const Field = ({ label, value, children, highlight, mono }: {
    label: string;
    value?: string;
    children?: React.ReactNode;
    highlight?: "accent" | "red";
    mono?: boolean;
}) => (
    <div>
        <p className="text-[11px] font-semibold text-muted uppercase tracking-wider mb-1">{label}</p>
        {children ?? (
            <p className={cn(
                "text-sm font-medium",
                highlight === "accent" && "text-accent",
                highlight === "red" && "text-red-600",
                !highlight && "text-heading",
                mono && "font-mono text-xs",
            )}>
                {value}
            </p>
        )}
    </div>
);

// ─── Main Page ────────────────────────────────────────────────

const Transactions = () => {
    const [activeTab, setActiveTab] = useState<Tab>("all");
    const { data: creditsData, isLoading: creditsLoading } = useCredits();
    const { data: purchasesData, isLoading: purchasesLoading } = useCreditPurchaseHistory();
    const { data: usageLedgerData, isLoading: usageLedgerLoading } = usePlanUsageLedgerHistory();

    const credits = creditsData?.data ?? [];
    const purchases = purchasesData ?? [];
    const usageLedgers = usageLedgerData?.data ?? [];
    const isLoading = creditsLoading || purchasesLoading || usageLedgerLoading;

    // Build unified list
    const allTransactions: UnifiedTransaction[] = [
        ...credits.map((c: CreditResponse): UnifiedTransaction => ({
            kind: "credit",
            id: c.id,
            date: c.createdAt,
            amount: c.amount,
            type: c.type,
            reference: c.reference,
            balanceAfter: c.balanceAfter,
        })),
        ...purchases.map((p: CreditPurchaseResponse): UnifiedTransaction => ({
            kind: "purchase",
            id: p.id + 100000,
            date: p.createdAt,
            amount: p.creditsPurchased,
            type: "purchase",
            status: p.status,
            creditsPurchased: p.creditsPurchased,
            currency: p.currency,
            currencySymbol: p.currencySymbol,
            pricePerCredit: p.pricePerCredit,
            amountPaid: p.amountPaid,
            txRef: p.txRef,
            paidAt: p.paidAt,
            failedAt: p.failedAt,
            failedReason: p.failedReason,
        })),
        ...usageLedgers.map((l: PlanUsageLedgerResponse): UnifiedTransaction => ({
            kind: "usage",
            id: l.id + 200000,
            date: l.createdAt,
            amount: 0,
            type: l.action || "plan-usage",
            travelPlanId: l.travelPlanId,
            travelPlanDestination: l.travelPlanDestination,
            travelPlanCountry: l.travelPlanCountry,
        })),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const filtered = activeTab === "all"
        ? allTransactions
        : activeTab === "purchases"
            ? allTransactions.filter((tx) => tx.kind === "purchase")
            : allTransactions.filter((tx) => tx.kind === "credit" || tx.kind === "usage");

    // Summary stats
    const totalPurchased = purchases.reduce((sum, p) => sum + (p.creditsPurchased || 0), 0);
    const totalSpent = purchases
        .filter((p) => p.status === "completed")
        .reduce((sum, p) => sum + (p.amountPaid || 0), 0);
    const totalUsed = credits
        .filter((c) => c.amount < 0)
        .reduce((sum, c) => sum + Math.abs(c.amount), 0);

    const tabs: { key: Tab; label: string }[] = [
        { key: "all", label: "All Transactions" },
        { key: "purchases", label: "Purchases" },
        { key: "usage", label: "Plan Usage" },
    ];

    return (
        <div>
            <DashboardHeader title="Transactions" />

            {/* Summary cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-2xl border border-border-light/50 p-5">
                    <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-1">Credits Purchased</p>
                    <p className="text-2xl font-serif text-heading">{totalPurchased}</p>
                </div>
                <div className="bg-white rounded-2xl border border-border-light/50 p-5">
                    <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-1">Total Spent</p>
                    <p className="text-2xl font-serif text-heading">
                        {totalSpent > 0 ? `${purchases[0]?.currencySymbol ?? ""}${totalSpent.toLocaleString()}` : "—"}
                    </p>
                </div>
                <div className="bg-white rounded-2xl border border-border-light/50 p-5">
                    <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-1">Credits Used</p>
                    <p className="text-2xl font-serif text-heading">{totalUsed}</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-6 bg-white rounded-xl border border-border-light/50 p-1 w-fit">
                {tabs.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={cn(
                            "px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-150 cursor-pointer",
                            activeTab === tab.key
                                ? "bg-dark text-white"
                                : "text-muted hover:text-heading hover:bg-background-secondary",
                        )}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Transactions table */}
            <div className="bg-white rounded-2xl border border-border-light/50 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[540px]">
                        <thead>
                            <tr className="border-b border-border-light/50">
                                <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-6 py-3">Transaction</th>
                                <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-6 py-3 hidden sm:table-cell">Amount</th>
                                <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-6 py-3 hidden md:table-cell">
                                    {activeTab === "purchases" ? "Status" : "Balance"}
                                </th>
                                <th className="px-6 py-3 w-10"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-light/50">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center">
                                        <LucideLoader2 className="w-6 h-6 text-accent animate-spin mx-auto" />
                                    </td>
                                </tr>
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center">
                                        <p className="text-sm text-muted">No transactions found.</p>
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((tx) => (
                                    <TransactionRow key={`${tx.kind}-${tx.id}`} tx={tx} />
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Transactions;
